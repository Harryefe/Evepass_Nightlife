/*
  # DrunkSafe Dynamic Algorithm System

  1. New Tables
    - `user_tolerance_profiles` - User drinking tolerance and BAC thresholds
    - `drink_consumption_log` - Real-time drink tracking from orders
    - `bac_calculations` - Historical BAC calculations and predictions
    
  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
    - Businesses can read consumption data for their venue orders
    
  3. Features
    - Dynamic BAC calculation using Widmark formula
    - Personalized tolerance profiles
    - Food consumption impact modeling
    - Real-time safety state determination
*/

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
  updated_at timestamptz DEFAULT now()
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

-- Add updated_at triggers
CREATE TRIGGER update_user_tolerance_profiles_updated_at
  BEFORE UPDATE ON user_tolerance_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically log drinks from orders
CREATE OR REPLACE FUNCTION log_drink_consumption()
RETURNS TRIGGER AS $$
DECLARE
  menu_item RECORD;
  recent_food_order BOOLEAN := FALSE;
  food_time_diff INTEGER := 0;
BEGIN
  -- Only process completed orders with alcoholic items
  IF NEW.payment_status = 'completed' THEN
    -- Get menu item details
    SELECT mi.name, mi.category, mi.description
    INTO menu_item
    FROM menu_items mi
    WHERE mi.business_id = NEW.business_id
    AND mi.available = true
    LIMIT 1; -- This is simplified - in reality you'd process each item in the order
    
    -- Check for recent food orders (within 90 minutes)
    SELECT EXISTS (
      SELECT 1 FROM orders o2
      JOIN order_items oi ON oi.order_id = o2.id
      JOIN menu_items mi2 ON mi2.id = oi.menu_item_id
      WHERE o2.customer_id = NEW.customer_id
      AND mi2.category = 'food'
      AND o2.created_at >= (NEW.created_at - INTERVAL '90 minutes')
      AND o2.payment_status = 'completed'
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
      AND o2.payment_status = 'completed';
    END IF;
    
    -- Insert drink consumption log (simplified example)
    -- In reality, this would iterate through order_items for alcoholic beverages
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
      (SELECT id FROM menu_items WHERE business_id = NEW.business_id AND category IN ('cocktails', 'spirits', 'beer') LIMIT 1),
      COALESCE(menu_item.name, 'Unknown Drink'),
      330.0, -- Default volume - should be from menu item
      5.0,   -- Default ABV - should be from menu item
      NEW.created_at,
      recent_food_order,
      COALESCE(food_time_diff, 0)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically log drinks when orders are completed
CREATE TRIGGER trigger_log_drink_consumption
  AFTER UPDATE ON orders
  FOR EACH ROW
  WHEN (OLD.payment_status != 'completed' AND NEW.payment_status = 'completed')
  EXECUTE FUNCTION log_drink_consumption();

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
$$ LANGUAGE plpgsql;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_drink_consumption_user_time ON drink_consumption_log(user_id, consumed_at DESC);
CREATE INDEX IF NOT EXISTS idx_bac_calculations_user_time ON bac_calculations(user_id, calculation_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_tolerance_profiles_user ON user_tolerance_profiles(user_id);

-- Insert default tolerance level thresholds
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