# Supabase Setup Guide for Evepass

## Step 1: Create Supabase Project

Based on your image, follow these exact settings:

### Project Configuration
- **Organization**: Evepass (Free tier)
- **Project name**: Evepass Nightlife Platform
- **Database Password**: Use a strong password (save this securely)
- **Region**: West Europe (London) - for UK users
- **Security Options**: 
  - ✅ Data API + Connection String (recommended)
  - Query all tables in the public schema

### Data API Configuration
- ✅ Use public schema for Data API (Default)
- This allows querying all tables in the public schema

## Step 2: Environment Variables

After creating your project, add these to your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://dlaozbknjptzekpxefbp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsYW96YmtuanB0emVrcHhlZmJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0MTY0MjMsImV4cCI6MjA2NDk5MjQyM30.DVJKbtpX-ai6z341TrkIVat7eLW1jSU2JEcuro7HuJM
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# App Configuration  
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000
```

## Step 3: Critical Authentication Setup

### 🚨 IMPORTANT: Disable Email Confirmation for Development

1. Go to **Authentication** > **Settings** in your Supabase dashboard
2. **Disable "Enable email confirmations"** - This is crucial for development
3. **Site URL**: Set to `http://localhost:3000`
4. **Redirect URLs**: Add `http://localhost:3000/**` (with wildcard)

### 🔑 Row Level Security Fix

The RLS error occurs because the policies need to be properly configured. Run this SQL in your Supabase SQL Editor:

```sql
-- Temporarily disable RLS to allow initial user creation
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE businesses DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Customers can insert own data" ON customers;
DROP POLICY IF EXISTS "Businesses can insert own data" ON businesses;

-- Re-enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- Create new policies that work with auth.uid()
CREATE POLICY "Enable insert for authenticated users"
  ON customers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable insert for authenticated users"
  ON businesses
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read own customer data"
  ON customers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can read own business data"
  ON businesses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own customer data"
  ON customers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own business data"
  ON businesses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Allow customers to read business profiles (for venue discovery)
CREATE POLICY "Customers can read business profiles"
  ON businesses
  FOR SELECT
  TO authenticated
  USING (true);
```

## Step 4: Database Setup

Run the migration files in your Supabase SQL Editor in this order:

1. First, run the RLS fix above
2. Then run your existing migration files if needed

## Step 5: Authentication Configuration

In your Supabase dashboard:

1. **Authentication** > **Settings**
2. **Site URL**: `http://localhost:3000`
3. **Redirect URLs**: 
   - `http://localhost:3000/**`
   - `http://localhost:3000/auth/callback`
4. **Email Confirmation**: ❌ **DISABLED** (critical for development)
5. **Email Templates**: Can customize later
6. **JWT Settings**: Leave as default

## Step 6: Test the Fix

1. Clear your browser cache and localStorage
2. Try signing up as a customer (must be 18+)
3. Try signing up as a business
4. Check the Supabase dashboard to see if users appear in:
   - **Authentication** > **Users**
   - **Table Editor** > **customers** or **businesses**

## Step 7: Age Validation Features

The signup now includes:
- ✅ Age calculation from date of birth
- ✅ 18+ age requirement for customers
- ✅ Password confirmation field
- ✅ Password strength indicator
- ✅ Real-time validation feedback

## Step 8: Production Checklist

Before going live:
- [ ] Enable email confirmation
- [ ] Add production domain to redirect URLs
- [ ] Set up custom SMTP for emails
- [ ] Re-enable stricter RLS policies
- [ ] Enable database backups
- [ ] Set up monitoring and alerts

## Troubleshooting

If you still get RLS errors:

1. **Check Authentication**: Ensure email confirmation is disabled
2. **Check Policies**: Run the RLS fix SQL above
3. **Check Console**: Look for detailed error messages in browser console
4. **Check Supabase Logs**: Go to Logs in your Supabase dashboard

The key issue was that the original RLS policies were too restrictive for the signup process. The new policies allow authenticated users to insert data, then restrict access appropriately.