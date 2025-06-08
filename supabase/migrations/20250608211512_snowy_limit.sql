/*
  # Booking and Reservation System

  1. New Tables
    - `bookings` - Table reservations and event bookings
    - `venue_tables` - Available tables and seating arrangements
    
  2. Security
    - Enable RLS on all tables
    - Customers can create and view their bookings
    - Businesses can manage bookings for their venue
    
  3. Features
    - Table reservation system
    - Party size and special requests
    - Booking status management
    - Venue capacity management
*/

-- Create venue_tables table
CREATE TABLE IF NOT EXISTS venue_tables (
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
CREATE TABLE IF NOT EXISTS bookings (
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

-- Enable Row Level Security
ALTER TABLE venue_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Venue tables policies
CREATE POLICY "Anyone can read available tables"
  ON venue_tables
  FOR SELECT
  TO authenticated
  USING (available = true);

CREATE POLICY "Businesses can manage their tables"
  ON venue_tables
  FOR ALL
  TO authenticated
  USING (business_id = auth.uid());

-- Bookings policies
CREATE POLICY "Customers can read their bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Businesses can read their venue bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (business_id = auth.uid());

CREATE POLICY "Customers can create bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Customers can update their bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Businesses can update booking status"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (business_id = auth.uid());

-- Add updated_at triggers
CREATE TRIGGER update_venue_tables_updated_at
  BEFORE UPDATE ON venue_tables
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_business ON bookings(business_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_business ON menu_items(business_id);
CREATE INDEX IF NOT EXISTS idx_orders_business ON orders(business_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);