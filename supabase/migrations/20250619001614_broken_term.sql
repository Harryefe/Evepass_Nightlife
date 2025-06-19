-- ============================================
-- EVEPASS COMPLETE FRESH DATABASE SETUP
-- ============================================
-- This script creates a completely fresh database for Evepass
-- Run this AFTER you've reset/cleaned your database

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE USER MANAGEMENT TABLES
-- ============================================

-- Create customers table
CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date,
  postcode text,
  music_preferences text[] DEFAULT '{}',
  user_type text DEFAULT 'customer' CHECK (user_type = 'customer'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create businesses table
CREATE TABLE businesses (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  email text UNIQUE NOT NULL,
  business_name text NOT NULL,
  business_type text NOT NULL,
  address text,
  postcode text,
  capacity integer,
  phone text,
  description text,
  user_type text DEFAULT 'business' CHECK (user_type = 'business'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- MENU AND ORDERING SYSTEM
-- ============================================

-- Create menu_items table
CREATE TABLE menu_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL CHECK (price > 0),
  category text NOT NULL,
  image_url text,
  available boolean DEFAULT true,
  popular boolean DEFAULT false,
  volume_ml decimal(6,2),
  abv_percentage decimal(4,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  total_amount decimal(10,2) NOT NULL CHECK (total_amount > 0),
  payment_method text NOT NULL CHECK (payment_method IN ('card', 'cash')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'cash_pending')),
  cash_code text,
  table_number text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price decimal(10,2) NOT NULL CHECK (unit_price > 0),
  total_price decimal(10,2) NOT NULL CHECK (total_price > 0),
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- BOOKING AND RESERVATION SYSTEM
-- ============================================

-- Create venue_tables table
CREATE TABLE venue_tables (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  table_name text NOT NULL,
  table_type text NOT NULL CHECK (table_type IN ('regular', 'vip', 'bar', 'private')),
  capacity integer NOT NULL CHECK (capacity > 0),
  minimum_spend decimal(10,2) DEFAULT 0,
  available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  table_id uuid REFERENCES venue_tables(id) ON DELETE SET NULL,
  booking_date timestamptz NOT NULL,
  party_size integer NOT NULL CHECK (party_size > 0),
  table_preference text,
  special_requests text,
  status text DEFAULT 'pending' CHECK (status IN ('confirmed', 'pending', 'cancelled')),
  deposit_amount decimal(10,2) DEFAULT 0,
  total_spend decimal(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- DRUNKSAFE SYSTEM TABLES
-- ============================================

-- Create user tolerance profiles table
CREATE TABLE user_tolerance_profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  weight_kg decimal(5,2) NOT NULL CHECK (weight_kg > 0),
  gender text NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  tolerance_level text NOT NULL CHECK (tolerance_level IN ('low', 'moderate', 'high', 'custom')),
  safe_threshold decimal(4,3) DEFAULT 0.030,
  caution_threshold decimal(4,3) DEFAULT 0.050,
  danger_threshold decimal(4,3) DEFAULT 0.080,
  alcohol_elimination_rate decimal(4,3) DEFAULT 0.015,
  food_absorption_factor decimal(3,2) DEFAULT 0.85,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create drink consumption log table
CREATE TABLE drink_consumption_log (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE CASCADE,
  drink_name text NOT NULL,
  volume_ml decimal(6,2) NOT NULL CHECK (volume_ml > 0),
  abv_percentage decimal(4,2) NOT NULL CHECK (abv_percentage >= 0 AND abv_percentage <= 100),
  alcohol_grams decimal(6,2) GENERATED ALWAYS AS (volume_ml * abv_percentage * 0.789 / 100) STORED,
  consumed_at timestamptz DEFAULT now(),
  food_consumed_recently boolean DEFAULT false,
  food_consumed_within_minutes integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create BAC calculations table
CREATE TABLE bac_calculations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  total_alcohol_grams decimal(8,2) NOT NULL,
  time_elapsed_hours decimal(6,2) NOT NULL,
  weight_kg decimal(5,2) NOT NULL,
  gender text NOT NULL,
  food_factor decimal(3,2) DEFAULT 1.0,
  calculated_bac decimal(5,3) NOT NULL,
  safety_state text NOT NULL CHECK (safety_state IN ('safe', 'caution', 'danger')),
  calculation_timestamp timestamptz DEFAULT now(),
  drinks_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- ROW LEVEL SECURITY SETUP
-- ============================================

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tolerance_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drink_consumption_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE bac_calculations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SECURITY POLICIES
-- ============================================

-- Customer policies
CREATE POLICY "Customers can read own data" ON customers FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Customers can update own data" ON customers FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Customers can insert own data" ON customers FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Business policies
CREATE POLICY "Businesses can read own data" ON businesses FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Businesses can update own data" ON businesses FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Businesses can insert own data" ON businesses FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Customers can read business profiles" ON businesses FOR SELECT TO authenticated USING (true);

-- Menu item policies
CREATE POLICY "Anyone can read available menu items" ON menu_items FOR SELECT TO authenticated USING (available = true);
CREATE POLICY "Businesses can manage their menu items" ON menu_items FOR ALL TO authenticated USING (business_id = auth.uid());

-- Order policies
CREATE POLICY "Customers can read their orders" ON orders FOR SELECT TO authenticated USING (customer_id = auth.uid());
CREATE POLICY "Businesses can read their venue orders" ON orders FOR SELECT TO authenticated USING (business_id = auth.uid());
CREATE POLICY "Customers can create orders" ON orders FOR INSERT TO authenticated WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Businesses can update order status" ON orders FOR UPDATE TO authenticated USING (business_id = auth.uid());

-- Order items policies
CREATE POLICY "Users can read order items for their orders" ON order_items FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.customer_id = auth.uid() OR orders.business_id = auth.uid()))
);
CREATE POLICY "Customers can create order items" ON order_items FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid())
);

-- Venue tables policies
CREATE POLICY "Anyone can read available tables" ON venue_tables FOR SELECT TO authenticated USING (available = true);
CREATE POLICY "Businesses can manage their tables" ON venue_tables FOR ALL TO authenticated USING (business_id = auth.uid());

-- Booking policies
CREATE POLICY "Customers can read their bookings" ON bookings FOR SELECT TO authenticated USING (customer_id = auth.uid());
CREATE POLICY "Businesses can read their venue bookings" ON bookings FOR SELECT TO authenticated USING (business_id = auth.uid());
CREATE POLICY "Customers can create bookings" ON bookings FOR INSERT TO authenticated WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Customers can update their bookings" ON bookings FOR UPDATE TO authenticated USING (customer_id = auth.uid());
CREATE POLICY "Businesses can update booking status" ON bookings FOR UPDATE TO authenticated USING (business_id = auth.uid());

-- DrunkSafe policies
CREATE POLICY "Users can manage their own tolerance profile" ON user_tolerance_profiles FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can read their own consumption log" ON drink_consumption_log FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own consumption log" ON drink_consumption_log FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Businesses can read consumption for their venue orders" ON drink_consumption_log FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM orders o JOIN businesses b ON b.id = o.business_id WHERE o.id = drink_consumption_log.order_id AND b.id = auth.uid())
);
CREATE POLICY "Users can manage their own BAC calculations" ON bac_calculations FOR ALL TO authenticated USING (user_id = auth.uid());

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to get default thresholds
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

-- Function to detect alcoholic drinks
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
  
  IF search_text ~ '(beer|lager|ale|stella|corona|heineken|guinness)' THEN
    RETURN QUERY SELECT true, 330.0::decimal(6,2), 4.5::decimal(4,2), 'beer'::text;
    RETURN;
  END IF;
  
  IF search_text ~ '(wine|prosecco|champagne)' AND NOT search_text ~ 'cocktail' THEN
    RETURN QUERY SELECT true, 175.0::decimal(6,2), 12.5::decimal(4,2), 'wine'::text;
    RETURN;
  END IF;
  
  IF search_text ~ '(vodka|gin|whiskey|rum|tequila|shot)' THEN
    RETURN QUERY SELECT true, 25.0::decimal(6,2), 40.0::decimal(4,2), 'spirits'::text;
    RETURN;
  END IF;
  
  IF search_text ~ '(cocktail|martini|mojito|margarita)' THEN
    RETURN QUERY SELECT true, 150.0::decimal(6,2), 15.0::decimal(4,2), 'cocktails'::text;
    RETURN;
  END IF;
  
  RETURN QUERY SELECT false, 0.0::decimal(6,2), 0.0::decimal(4,2), 'non-alcoholic'::text;
END;
$$ LANGUAGE plpgsql;

-- Main BAC calculation function
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
  SELECT * INTO user_profile FROM user_tolerance_profiles WHERE user_id = user_uuid ORDER BY created_at DESC LIMIT 1;
  
  IF user_profile IS NULL THEN
    RETURN QUERY SELECT 0.000::decimal(5,3), 'safe'::text, 0::integer, 0.0::decimal(6,2), 'Please set up your safety profile'::text;
    RETURN;
  END IF;
  
  SELECT 
    SUM(dcl.alcohol_grams),
    MIN(dcl.consumed_at),
    COUNT(*),
    AVG(CASE WHEN dcl.food_consumed_recently THEN user_profile.food_absorption_factor ELSE 1.0 END)
  INTO total_alcohol, first_drink_time, drink_count, food_adjustment
  FROM drink_consumption_log dcl
  WHERE dcl.user_id = user_uuid AND dcl.consumed_at >= (NOW() - INTERVAL '12 hours');
  
  IF total_alcohol IS NULL OR total_alcohol = 0 THEN
    RETURN QUERY SELECT 0.000::decimal(5,3), 'safe'::text, 0::integer, 0.0::decimal(6,2), 'No drinks detected - stay safe!'::text;
    RETURN;
  END IF;
  
  hours_elapsed := EXTRACT(EPOCH FROM (NOW() - first_drink_time)) / 3600.0;
  
  widmark_r := CASE 
    WHEN user_profile.gender = 'male' THEN 0.68
    WHEN user_profile.gender = 'female' THEN 0.55
    ELSE 0.61
  END;
  
  calculated_bac := ((total_alcohol * food_adjustment) / (user_profile.weight_kg * 1000 * widmark_r)) - (user_profile.alcohol_elimination_rate * hours_elapsed);
  calculated_bac := GREATEST(calculated_bac, 0.000);
  
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
  
  INSERT INTO bac_calculations (user_id, total_alcohol_grams, time_elapsed_hours, weight_kg, gender, food_factor, calculated_bac, safety_state, drinks_count)
  VALUES (user_uuid, total_alcohol, hours_elapsed, user_profile.weight_kg, user_profile.gender, food_adjustment, calculated_bac, state, drink_count);
  
  RETURN QUERY SELECT calculated_bac, state, drink_count, hours_elapsed, advice;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to automatically log drinks from orders
CREATE OR REPLACE FUNCTION log_drinks_from_order()
RETURNS TRIGGER AS $$
DECLARE
  order_item RECORD;
  drink_detection RECORD;
  recent_food_order BOOLEAN := FALSE;
  food_time_diff INTEGER := 0;
BEGIN
  IF NEW.payment_status = 'completed' AND OLD.payment_status != 'completed' THEN
    
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
    
    FOR order_item IN 
      SELECT oi.*, mi.name, mi.description, mi.category
      FROM order_items oi
      JOIN menu_items mi ON mi.id = oi.menu_item_id
      WHERE oi.order_id = NEW.id
    LOOP
      SELECT * INTO drink_detection FROM detect_alcoholic_drink(order_item.name, order_item.description);
      
      IF drink_detection.is_alcoholic THEN
        FOR i IN 1..order_item.quantity LOOP
          INSERT INTO drink_consumption_log (
            user_id, order_id, menu_item_id, drink_name, volume_ml, abv_percentage,
            consumed_at, food_consumed_recently, food_consumed_within_minutes
          ) VALUES (
            NEW.customer_id, NEW.id, order_item.menu_item_id, order_item.name,
            drink_detection.estimated_volume_ml, drink_detection.estimated_abv,
            NEW.created_at, recent_food_order, COALESCE(food_time_diff, 0)
          );
        END LOOP;
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Add updated_at triggers
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_venue_tables_updated_at BEFORE UPDATE ON venue_tables FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_tolerance_profiles_updated_at BEFORE UPDATE ON user_tolerance_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create automatic drink logging trigger
CREATE TRIGGER trigger_log_drinks_from_order AFTER UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION log_drinks_from_order();

-- ============================================
-- PERFORMANCE INDEXES
-- ============================================

CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_business ON bookings(business_id);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_menu_items_business ON menu_items(business_id);
CREATE INDEX idx_orders_business ON orders(business_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_drink_consumption_user_time ON drink_consumption_log(user_id, consumed_at DESC);
CREATE INDEX idx_bac_calculations_user_time ON bac_calculations(user_id, calculation_timestamp DESC);
CREATE INDEX idx_tolerance_profiles_user ON user_tolerance_profiles(user_id);
CREATE INDEX idx_drink_consumption_order ON drink_consumption_log(order_id);

-- ============================================
-- VERIFICATION
-- ============================================

SELECT '🎉 FRESH DATABASE SETUP COMPLETE! 🎉' as message;

SELECT 'Tables created: ' || COUNT(*) as summary
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('customers', 'businesses', 'menu_items', 'orders', 'order_items', 'venue_tables', 'bookings', 'user_tolerance_profiles', 'drink_consumption_log', 'bac_calculations');

SELECT 'Functions created: ' || COUNT(*) as summary
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('calculate_user_bac', 'detect_alcoholic_drink', 'get_default_thresholds', 'log_drinks_from_order', 'update_updated_at_column');

-- Test drink detection
SELECT 'Testing drink detection...' as test_status;
SELECT 'Beer test:' as test_type, * FROM detect_alcoholic_drink('Stella Artois', '330ml bottle');
SELECT 'Cocktail test:' as test_type, * FROM detect_alcoholic_drink('Vodka Martini', 'Premium vodka with dry vermouth');
SELECT 'Non-alcoholic test:' as test_type, * FROM detect_alcoholic_drink('Coca Cola', 'Soft drink');

-- Test tolerance thresholds
SELECT 'Testing tolerance levels...' as test_status;
SELECT 'Low tolerance:' as level, * FROM get_default_thresholds('low');
SELECT 'Moderate tolerance:' as level, * FROM get_default_thresholds('moderate');
SELECT 'High tolerance:' as level, * FROM get_default_thresholds('high');

SELECT '✅ Your Evepass database is now ready for production!' as final_status;