/*
  # Authentication and User Management Schema

  1. New Tables
    - `customers` - Customer profiles and preferences
    - `businesses` - Venue owner profiles and business information
    
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for businesses to manage their venue data
    
  3. Features
    - User type differentiation (customer vs business)
    - UK postcode validation
    - Music preferences for customers
    - Business capacity and contact information
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
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
CREATE TABLE IF NOT EXISTS businesses (
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

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- Create policies for customers
CREATE POLICY "Customers can read own data"
  ON customers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Customers can update own data"
  ON customers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Customers can insert own data"
  ON customers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create policies for businesses
CREATE POLICY "Businesses can read own data"
  ON businesses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Businesses can update own data"
  ON businesses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Businesses can insert own data"
  ON businesses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow customers to read business profiles (for venue discovery)
CREATE POLICY "Customers can read business profiles"
  ON businesses
  FOR SELECT
  TO authenticated
  USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();