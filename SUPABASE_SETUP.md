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
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App Configuration  
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

## Step 3: Database Setup

Run the migration files in order:

1. `001_create_auth_tables.sql` - User authentication and profiles
2. `002_create_menu_system.sql` - Menu items and ordering system
3. `003_create_booking_system.sql` - Table reservations and bookings

## Step 4: Authentication Configuration

In your Supabase dashboard:

1. Go to **Authentication** > **Settings**
2. **Site URL**: `http://localhost:3000` (development)
3. **Redirect URLs**: Add your production domain when ready
4. **Email Templates**: Customize signup/login emails
5. **Email Confirmation**: Disabled for development (enable for production)

## Step 5: Row Level Security (RLS)

All tables have RLS enabled with these policies:

### Customers
- Can read/update their own profile
- Can view business profiles (for venue discovery)
- Can create orders and bookings

### Businesses  
- Can read/update their own profile
- Can manage their menu items
- Can view and update orders for their venue
- Can manage bookings for their venue

## Step 6: API Keys Location

Find your keys in the Supabase dashboard:

1. **Project URL**: Settings > API > Project URL
2. **Anon Key**: Settings > API > Project API keys > anon public
3. **Service Role Key**: Settings > API > Project API keys > service_role (keep secret)

## Step 7: Test Connection

After setup, test the connection by:

1. Starting your Next.js app: `npm run dev`
2. Try signing up as a customer or business
3. Check the Supabase dashboard to see if data appears

## Database Schema Overview

### Core Tables
- `customers` - Customer profiles and preferences
- `businesses` - Venue profiles and business information
- `menu_items` - Drinks and food with pricing
- `orders` - Customer orders with payment tracking
- `order_items` - Individual items within orders
- `bookings` - Table reservations
- `venue_tables` - Available tables and seating

### Key Features
- ✅ User type differentiation (customer vs business)
- ✅ Real-time ordering system
- ✅ Cash payment verification codes
- ✅ Table booking system
- ✅ Menu management for businesses
- ✅ Order tracking and status updates
- ✅ Row Level Security for data protection

## Production Checklist

Before going live:

- [ ] Enable email confirmation
- [ ] Add production domain to redirect URLs
- [ ] Set up custom SMTP for emails
- [ ] Enable database backups
- [ ] Set up monitoring and alerts
- [ ] Review and test all RLS policies