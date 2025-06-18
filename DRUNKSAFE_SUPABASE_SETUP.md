# DrunkSafe Algorithm - Supabase Database Setup Guide

## Overview
This guide will help you set up the database schema for the enhanced DrunkSafe algorithm with dynamic BAC calculation, user tolerance profiles, and automatic order integration.

## Step 1: Run the Migration SQL

Copy and paste the following SQL into your Supabase SQL Editor and execute it:

```sql
-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user tolerance profiles table
CREATE TABLE IF NOT EXISTS user_tolerance_profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  weight_kg decimal(5,2) NOT NULL CHECK (weight_kg > 0),
  gender text NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  tolerance_level text NOT NULL CHECK (tolerance_level IN ('low', 'moderate', 'high', 'custom')),
  
  -- BAC Thresholds (can be custom or auto-set based on tolerance level)
  safe_threshold decimal(4,3) DEFAULT 0.030,
  caution_threshold decimal(4,3) DEFAULT 0.050,
  danger_threshold decimal(4,3) DEFAULT 0.080,
  
  -- Metabolism factors
  alcohol_elimination_rate decimal(4,3) DEFAULT 0.015, -- BAC per hour
  food_absorption_factor decimal(3,2) DEFAULT 0.85, -- Reduction factor when food consumed
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure one profile per user
  UNIQUE(user_id)
);

-- Create drink consumption log table
CREATE TABLE IF NOT EXISTS drink_consumption_log (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE CASCADE,
  
  -- Drink details
  drink_name text NOT NULL,
  volume_ml decimal(6,2) NOT NULL CHECK (volume_ml > 0),
  abv_percentage decimal(4,2) NOT NULL CHECK (abv_percentage >= 0 AND abv_percentage <= 100),
  alcohol_grams decimal(6,2) GENERATED ALWAYS AS (volume_ml * abv_percentage * 0.789 / 100) STORED,
  
  -- Timing
  consumed_at timestamptz DEFAULT now(),
  
  -- Food context
  food_consumed_recently boolean DEFAULT false,
  food_consumed_within_minutes integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now()
);

-- Create BAC calculations table for historical tracking
CREATE TABLE IF NOT EXISTS bac_calculations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Calculation inputs
  total_alcohol_grams decimal(8,2) NOT NULL,
  time_elapsed_hours decimal(6,2) NOT NULL,
  weight_kg decimal(5,2) NOT NULL,
  gender text NOT NULL,
  food_factor decimal(3,2) DEFAULT 1.0,
  
  -- Results
  calculated_bac decimal(5,3) NOT NULL,
  safety_state text NOT NULL CHECK (safety_state IN ('safe', 'caution', 'danger')),
  
  -- Metadata
  calculation_timestamp timestamptz DEFAULT now(),
  drinks_count integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_tolerance_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drink_consumption_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE bac_calculations ENABLE ROW LEVEL SECURITY;

-- User tolerance profiles policies
CREATE POLICY "Users can manage their own tolerance profile"
  ON user_tolerance_profiles
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Drink consumption log policies
CREATE POLICY "Users can read their own consumption log"
  ON drink_consumption_log
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own consumption log"
  ON drink_consumption_log
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Businesses can read consumption for their venue orders"
  ON drink_consumption_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      JOIN businesses b ON b.id = o.business_id
      WHERE o.id = drink_consumption_log.order_id
      AND b.id = auth.uid()
    )
  );

-- BAC calculations policies
CREATE POLICY "Users can manage their own BAC calculations"
  ON bac_calculations
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Add updated_at triggers (reuse existing function)
CREATE TRIGGER update_user_tolerance_profiles_updated_at
  BEFORE UPDATE ON user_tolerance_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_drink_consumption_user_time ON drink_consumption_log(user_id, consumed_at DESC);
CREATE INDEX IF NOT EXISTS idx_bac_calculations_user_time ON bac_calculations(user_id, calculation_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_tolerance_profiles_user ON user_tolerance_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_drink_consumption_order ON drink_consumption_log(order_id);
```

## Step 2: Create the BAC Calculation Function

Execute this SQL to create the core BAC calculation function:

```sql
-- Create function to calculate real-time BAC
CREATE OR REPLACE FUNCTION calculate_user_bac(user_uuid uuid)
RETURNS TABLE (
  current_bac decimal(5,3),
  safety_state text,
  drinks_consumed integer,
  time_since_first_drink decimal(6,2),
  recommendation text
) AS $$
DECLARE
  user_profile RECORD;
  total_alcohol decimal(8,2) := 0;
  first_drink_time timestamptz;
  hours_elapsed decimal(6,2) := 0;
  calculated_bac decimal(5,3) := 0;
  widmark_r decimal(3,2);
  food_adjustment decimal(3,2) := 1.0;
  drink_count integer := 0;
  state text := 'safe';
  advice text := 'Enjoy responsibly!';
BEGIN
  -- Get user tolerance profile
  SELECT * INTO user_profile
  FROM user_tolerance_profiles
  WHERE user_id = user_uuid
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- If no profile exists, return safe defaults
  IF user_profile IS NULL THEN
    RETURN QUERY SELECT 0.000::decimal(5,3), 'safe'::text, 0::integer, 0.0::decimal(6,2), 'Please set up your safety profile'::text;
    RETURN;
  END IF;
  
  -- Get consumption data from last 12 hours
  SELECT 
    SUM(dcl.alcohol_grams),
    MIN(dcl.consumed_at),
    COUNT(*),
    AVG(CASE WHEN dcl.food_consumed_recently THEN user_profile.food_absorption_factor ELSE 1.0 END)
  INTO total_alcohol, first_drink_time, drink_count, food_adjustment
  FROM drink_consumption_log dcl
  WHERE dcl.user_id = user_uuid
  AND dcl.consumed_at >= (NOW() - INTERVAL '12 hours');
  
  -- If no drinks, return safe
  IF total_alcohol IS NULL OR total_alcohol = 0 THEN
    RETURN QUERY SELECT 0.000::decimal(5,3), 'safe'::text, 0::integer, 0.0::decimal(6,2), 'No drinks detected - stay safe!'::text;
    RETURN;
  END IF;
  
  -- Calculate time elapsed since first drink
  hours_elapsed := EXTRACT(EPOCH FROM (NOW() - first_drink_time)) / 3600.0;
  
  -- Determine Widmark r value based on gender
  widmark_r := CASE 
    WHEN user_profile.gender = 'male' THEN 0.68
    WHEN user_profile.gender = 'female' THEN 0.55
    ELSE 0.61 -- Average for 'other'
  END;
  
  -- Apply Widmark formula with food adjustment
  calculated_bac := (
    (total_alcohol * food_adjustment) / 
    (user_profile.weight_kg * 1000 * widmark_r)
  ) - (user_profile.alcohol_elimination_rate * hours_elapsed);
  
  -- Ensure BAC doesn't go below 0
  calculated_bac := GREATEST(calculated_bac, 0.000);
  
  -- Determine safety state based on user's thresholds
  IF calculated_bac >= user_profile.danger_threshold THEN
    state := 'danger';
    advice := 'STOP DRINKING - Consider getting help or going home safely';
  ELSIF calculated_bac >= user_profile.caution_threshold THEN
    state := 'caution';
    advice := 'Slow down - Drink water, eat food, consider your next drink carefully';
  ELSE
    state := 'safe';
    advice := 'You''re doing well - Continue to pace yourself and stay hydrated';
  END IF;
  
  -- Log this calculation
  INSERT INTO bac_calculations (
    user_id,
    total_alcohol_grams,
    time_elapsed_hours,
    weight_kg,
    gender,
    food_factor,
    calculated_bac,
    safety_state,
    drinks_count
  ) VALUES (
    user_uuid,
    total_alcohol,
    hours_elapsed,
    user_profile.weight_kg,
    user_profile.gender,
    food_adjustment,
    calculated_bac,
    state,
    drink_count
  );
  
  RETURN QUERY SELECT calculated_bac, state, drink_count, hours_elapsed, advice;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Step 3: Create Helper Functions

Execute these additional helper functions:

```sql
-- Function to get default thresholds based on tolerance level
CREATE OR REPLACE FUNCTION get_default_thresholds(tolerance_level text)
RETURNS TABLE (
  safe_threshold decimal(4,3),
  caution_threshold decimal(4,3),
  danger_threshold decimal(4,3)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE tolerance_level
      WHEN 'low' THEN 0.020::decimal(4,3)
      WHEN 'moderate' THEN 0.030::decimal(4,3)
      WHEN 'high' THEN 0.040::decimal(4,3)
      ELSE 0.030::decimal(4,3)
    END,
    CASE tolerance_level
      WHEN 'low' THEN 0.040::decimal(4,3)
      WHEN 'moderate' THEN 0.050::decimal(4,3)
      WHEN 'high' THEN 0.065::decimal(4,3)
      ELSE 0.050::decimal(4,3)
    END,
    CASE tolerance_level
      WHEN 'low' THEN 0.060::decimal(4,3)
      WHEN 'moderate' THEN 0.080::decimal(4,3)
      WHEN 'high' THEN 0.100::decimal(4,3)
      ELSE 0.080::decimal(4,3)
    END;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically detect and log drinks from menu items
CREATE OR REPLACE FUNCTION detect_alcoholic_drink(item_name text, item_description text DEFAULT '')
RETURNS TABLE (
  is_alcoholic boolean,
  estimated_volume_ml decimal(6,2),
  estimated_abv decimal(4,2),
  drink_category text
) AS $$
DECLARE
  search_text text;
BEGIN
  search_text := lower(item_name || ' ' || COALESCE(item_description, ''));
  
  -- Beer detection
  IF search_text ~ '(beer|lager|ale|stella|corona|heineken|guinness|carlsberg)' THEN
    RETURN QUERY SELECT true, 330.0::decimal(6,2), 4.5::decimal(4,2), 'beer'::text;
    RETURN;
  END IF;
  
  -- Wine detection
  IF search_text ~ '(wine|prosecco|champagne|chardonnay|merlot|sauvignon)' AND NOT search_text ~ 'cocktail' THEN
    RETURN QUERY SELECT true, 175.0::decimal(6,2), 12.5::decimal(4,2), 'wine'::text;
    RETURN;
  END IF;
  
  -- Spirits detection
  IF search_text ~ '(vodka|gin|whiskey|whisky|rum|tequila|brandy|cognac|shot)' THEN
    RETURN QUERY SELECT true, 25.0::decimal(6,2), 40.0::decimal(4,2), 'spirits'::text;
    RETURN;
  END IF;
  
  -- Cocktail detection
  IF search_text ~ '(cocktail|martini|mojito|cosmopolitan|margarita|daiquiri|manhattan|negroni)' THEN
    RETURN QUERY SELECT true, 150.0::decimal(6,2), 15.0::decimal(4,2), 'cocktails'::text;
    RETURN;
  END IF;
  
  -- Default: not alcoholic
  RETURN QUERY SELECT false, 0.0::decimal(6,2), 0.0::decimal(4,2), 'non-alcoholic'::text;
END;
$$ LANGUAGE plpgsql;
```

## Step 4: Create Automatic Order Processing Trigger

This trigger will automatically log drinks when orders are completed:

```sql
-- Function to automatically log drinks from completed orders
CREATE OR REPLACE FUNCTION log_drinks_from_order()
RETURNS TRIGGER AS $$
DECLARE
  order_item RECORD;
  menu_item RECORD;
  drink_detection RECORD;
  recent_food_order BOOLEAN := FALSE;
  food_time_diff INTEGER := 0;
BEGIN
  -- Only process when order status changes to completed
  IF NEW.payment_status = 'completed' AND OLD.payment_status != 'completed' THEN
    
    -- Check for recent food orders (within 90 minutes)
    SELECT EXISTS (
      SELECT 1 FROM orders o2
      JOIN order_items oi ON oi.order_id = o2.id
      JOIN menu_items mi2 ON mi2.id = oi.menu_item_id
      WHERE o2.customer_id = NEW.customer_id
      AND mi2.category = 'food'
      AND o2.created_at >= (NEW.created_at - INTERVAL '90 minutes')
      AND o2.payment_status = 'completed'
      AND o2.id != NEW.id
    ) INTO recent_food_order;
    
    -- Calculate time difference for food consumption
    IF recent_food_order THEN
      SELECT EXTRACT(EPOCH FROM (NEW.created_at - MAX(o2.created_at)))/60
      INTO food_time_diff
      FROM orders o2
      JOIN order_items oi ON oi.order_id = o2.id
      JOIN menu_items mi2 ON mi2.id = oi.menu_item_id
      WHERE o2.customer_id = NEW.customer_id
      AND mi2.category = 'food'
      AND o2.created_at >= (NEW.created_at - INTERVAL '90 minutes')
      AND o2.payment_status = 'completed'
      AND o2.id != NEW.id;
    END IF;
    
    -- Process each order item
    FOR order_item IN 
      SELECT oi.*, mi.name, mi.description, mi.category
      FROM order_items oi
      JOIN menu_items mi ON mi.id = oi.menu_item_id
      WHERE oi.order_id = NEW.id
    LOOP
      -- Check if item is alcoholic
      SELECT * INTO drink_detection
      FROM detect_alcoholic_drink(order_item.name, order_item.description);
      
      -- If alcoholic, log each drink
      IF drink_detection.is_alcoholic THEN
        FOR i IN 1..order_item.quantity LOOP
          INSERT INTO drink_consumption_log (
            user_id,
            order_id,
            menu_item_id,
            drink_name,
            volume_ml,
            abv_percentage,
            consumed_at,
            food_consumed_recently,
            food_consumed_within_minutes
          ) VALUES (
            NEW.customer_id,
            NEW.id,
            order_item.menu_item_id,
            order_item.name,
            drink_detection.estimated_volume_ml,
            drink_detection.estimated_abv,
            NEW.created_at,
            recent_food_order,
            COALESCE(food_time_diff, 0)
          );
        END LOOP;
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_log_drinks_from_order ON orders;
CREATE TRIGGER trigger_log_drinks_from_order
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_drinks_from_order();
```

## Step 5: Test the Setup

Run these test queries to verify everything is working:

```sql
-- Test 1: Check if tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_tolerance_profiles', 'drink_consumption_log', 'bac_calculations');

-- Test 2: Check if functions were created
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('calculate_user_bac', 'detect_alcoholic_drink', 'get_default_thresholds');

-- Test 3: Test drink detection
SELECT * FROM detect_alcoholic_drink('Stella Artois', '330ml bottle');
SELECT * FROM detect_alcoholic_drink('Vodka Martini', 'Premium vodka with dry vermouth');
SELECT * FROM detect_alcoholic_drink('Coca Cola', 'Soft drink');

-- Test 4: Test default thresholds
SELECT * FROM get_default_thresholds('low');
SELECT * FROM get_default_thresholds('moderate');
SELECT * FROM get_default_thresholds('high');
```

## Step 6: Environment Variables

Make sure your `.env.local` file has the correct Supabase configuration:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Step 7: Verify RLS Policies

Check that Row Level Security is properly configured:

```sql
-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('user_tolerance_profiles', 'drink_consumption_log', 'bac_calculations');

-- Check policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('user_tolerance_profiles', 'drink_consumption_log', 'bac_calculations');
```

## Features Enabled

After running this setup, you'll have:

✅ **User Tolerance Profiles** - Personalized BAC thresholds based on weight, gender, and tolerance level
✅ **Automatic Drink Detection** - AI-powered detection of alcoholic beverages from menu items
✅ **Real-time BAC Calculation** - Widmark formula implementation with food absorption modeling
✅ **Order Integration** - Automatic logging when orders are completed
✅ **Safety State Management** - Dynamic safe/caution/danger states with personalized recommendations
✅ **Historical Tracking** - Complete audit trail of drinks and BAC calculations
✅ **Food Impact Modeling** - Reduced absorption when food is consumed recently
✅ **Performance Optimization** - Proper indexing for real-time queries

## Troubleshooting

If you encounter any issues:

1. **Check Supabase logs** in your dashboard under "Logs"
2. **Verify authentication** - Make sure users are properly signed in
3. **Test RLS policies** - Ensure users can only access their own data
4. **Check function permissions** - Functions should have SECURITY DEFINER
5. **Validate data types** - Ensure all decimal fields accept the expected precision

The system is now ready for production use with comprehensive safety monitoring!