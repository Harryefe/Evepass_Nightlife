'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { 
  Database, Key, Code, Users, ShoppingCart, Calendar, 
  CreditCard, CheckCircle, ExternalLink, Copy, Eye, EyeOff
} from 'lucide-react';
import Link from 'next/link';

const databaseSchemas = [
  {
    name: 'customers',
    description: 'User profiles and authentication data',
    columns: [
      { name: 'id', type: 'uuid', description: 'Primary key' },
      { name: 'email', type: 'text', description: 'User email address' },
      { name: 'first_name', type: 'text', description: 'First name' },
      { name: 'last_name', type: 'text', description: 'Last name' },
      { name: 'date_of_birth', type: 'date', description: 'Date of birth' },
      { name: 'postcode', type: 'text', description: 'UK postcode' },
      { name: 'music_preferences', type: 'text[]', description: 'Preferred music genres' },
      { name: 'created_at', type: 'timestamptz', description: 'Account creation date' }
    ]
  },
  {
    name: 'businesses',
    description: 'Venue and business owner profiles',
    columns: [
      { name: 'id', type: 'uuid', description: 'Primary key' },
      { name: 'business_name', type: 'text', description: 'Venue name' },
      { name: 'business_type', type: 'text', description: 'Type of venue' },
      { name: 'address', type: 'text', description: 'Full address' },
      { name: 'postcode', type: 'text', description: 'UK postcode' },
      { name: 'capacity', type: 'integer', description: 'Maximum capacity' },
      { name: 'phone', type: 'text', description: 'Business phone' },
      { name: 'description', type: 'text', description: 'Venue description' },
      { name: 'created_at', type: 'timestamptz', description: 'Registration date' }
    ]
  },
  {
    name: 'menu_items',
    description: 'Drinks and food items with pricing',
    columns: [
      { name: 'id', type: 'uuid', description: 'Primary key' },
      { name: 'business_id', type: 'uuid', description: 'Foreign key to businesses' },
      { name: 'name', type: 'text', description: 'Item name' },
      { name: 'description', type: 'text', description: 'Item description' },
      { name: 'price', type: 'decimal', description: 'Price in GBP' },
      { name: 'category', type: 'text', description: 'Item category' },
      { name: 'image_url', type: 'text', description: 'Item image URL' },
      { name: 'available', type: 'boolean', description: 'Availability status' },
      { name: 'created_at', type: 'timestamptz', description: 'Creation date' }
    ]
  },
  {
    name: 'orders',
    description: 'Customer orders and payment tracking',
    columns: [
      { name: 'id', type: 'uuid', description: 'Primary key' },
      { name: 'customer_id', type: 'uuid', description: 'Foreign key to customers' },
      { name: 'business_id', type: 'uuid', description: 'Foreign key to businesses' },
      { name: 'items', type: 'jsonb', description: 'Ordered items array' },
      { name: 'total_amount', type: 'decimal', description: 'Total order amount' },
      { name: 'payment_method', type: 'text', description: 'card or cash' },
      { name: 'payment_status', type: 'text', description: 'pending, completed, failed' },
      { name: 'cash_code', type: 'text', description: 'Cash verification code' },
      { name: 'table_number', type: 'text', description: 'Table identifier' },
      { name: 'created_at', type: 'timestamptz', description: 'Order timestamp' }
    ]
  },
  {
    name: 'bookings',
    description: 'Table reservations and events',
    columns: [
      { name: 'id', type: 'uuid', description: 'Primary key' },
      { name: 'customer_id', type: 'uuid', description: 'Foreign key to customers' },
      { name: 'business_id', type: 'uuid', description: 'Foreign key to businesses' },
      { name: 'booking_date', type: 'timestamptz', description: 'Reservation date/time' },
      { name: 'party_size', type: 'integer', description: 'Number of guests' },
      { name: 'table_preference', type: 'text', description: 'Table type preference' },
      { name: 'special_requests', type: 'text', description: 'Special requirements' },
      { name: 'status', type: 'text', description: 'confirmed, pending, cancelled' },
      { name: 'created_at', type: 'timestamptz', description: 'Booking creation date' }
    ]
  }
];

export default function SupabaseIntegrationPage() {
  const [showEnvKeys, setShowEnvKeys] = useState(false);
  const [activeSchema, setActiveSchema] = useState('customers');

  const envVariables = [
    { key: 'NEXT_PUBLIC_SUPABASE_URL', value: 'https://your-project.supabase.co', description: 'Your Supabase project URL' },
    { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...', description: 'Public anon key for client-side operations' },
    { key: 'SUPABASE_SERVICE_ROLE_KEY', value: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...', description: 'Service role key for server-side operations' }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-green-500/10 glow-green">
                <Database className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">Supabase Integration</h1>
                <p className="text-sm text-muted-foreground">Database setup and configuration</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="glass">
                  Back to Dashboard
                </Button>
              </Link>
              <Button size="sm" className="glass glow-green" asChild>
                <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Supabase
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="setup" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 glass border border-border/50">
            <TabsTrigger value="setup" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-500">
              Setup Guide
            </TabsTrigger>
            <TabsTrigger value="schemas" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-500">
              Database Schemas
            </TabsTrigger>
            <TabsTrigger value="examples" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-500">
              Code Examples
            </TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-6">
            <Card className="glass border-green-500/20">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center">
                  <Key className="h-5 w-5 mr-2 text-green-500" />
                  Environment Variables
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Configure your Supabase connection keys
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">
                    Add these variables to your <code className="bg-muted px-2 py-1 rounded">.env.local</code> file
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEnvKeys(!showEnvKeys)}
                    className="text-muted-foreground"
                  >
                    {showEnvKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                
                {envVariables.map((env, index) => (
                  <Card key={index} className="glass border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <code className="text-sm font-mono text-green-500">{env.key}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(`${env.key}=${env.value}`)}
                          className="h-8 w-8 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">{env.description}</div>
                      <code className="text-xs font-mono bg-muted p-2 rounded block">
                        {showEnvKeys ? env.value : '••••••••••••••••••••••••••••••••'}
                      </code>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="glass border-blue-500/20">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-blue-500" />
                    Setup Steps
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    'Create a new Supabase project',
                    'Copy your project URL and API keys',
                    'Add environment variables to .env.local',
                    'Install Supabase client library',
                    'Initialize Supabase client',
                    'Create database tables',
                    'Set up Row Level Security (RLS)',
                    'Test the connection'
                  ].map((step, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <span className="text-sm text-muted-foreground">{step}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="glass border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center">
                    <Code className="h-5 w-5 mr-2 text-purple-500" />
                    Installation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Install the Supabase client:</p>
                    <code className="block bg-muted p-3 rounded text-sm font-mono">
                      npm install @supabase/supabase-js
                    </code>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Create Supabase client:</p>
                    <code className="block bg-muted p-3 rounded text-sm font-mono">
                      {`import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)`}
                    </code>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="schemas" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="glass border-border/50">
                <CardHeader>
                  <CardTitle className="text-foreground">Database Tables</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Select a table to view its schema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {databaseSchemas.map((schema) => (
                    <Button
                      key={schema.name}
                      variant={activeSchema === schema.name ? "default" : "ghost"}
                      className={`w-full justify-start ${
                        activeSchema === schema.name 
                          ? 'bg-primary/20 text-primary' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => setActiveSchema(schema.name)}
                    >
                      <Database className="h-4 w-4 mr-2" />
                      {schema.name}
                    </Button>
                  ))}
                </CardContent>
              </Card>

              <div className="lg:col-span-2">
                {databaseSchemas.map((schema) => (
                  activeSchema === schema.name && (
                    <Card key={schema.name} className="glass border-border/50">
                      <CardHeader>
                        <CardTitle className="text-foreground flex items-center">
                          <Database className="h-5 w-5 mr-2 text-primary" />
                          {schema.name}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                          {schema.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {schema.columns.map((column, index) => (
                            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/50">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <code className="text-sm font-mono text-primary">{column.name}</code>
                                  <Badge variant="secondary" className="text-xs">
                                    {column.type}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{column.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="examples" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="glass border-green-500/20">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center">
                    <Users className="h-5 w-5 mr-2 text-green-500" />
                    User Authentication
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <code className="block bg-muted p-4 rounded text-sm font-mono whitespace-pre-wrap">
{`// Sign up new user
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      first_name: 'John',
      last_name: 'Doe'
    }
  }
})

// Sign in user
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})`}
                  </code>
                </CardContent>
              </Card>

              <Card className="glass border-blue-500/20">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center">
                    <ShoppingCart className="h-5 w-5 mr-2 text-blue-500" />
                    Order Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <code className="block bg-muted p-4 rounded text-sm font-mono whitespace-pre-wrap">
{`// Create new order
const { data, error } = await supabase
  .from('orders')
  .insert({
    customer_id: userId,
    business_id: venueId,
    items: orderItems,
    total_amount: totalPrice,
    payment_method: 'card',
    payment_status: 'pending'
  })

// Update order status
const { data, error } = await supabase
  .from('orders')
  .update({ payment_status: 'completed' })
  .eq('id', orderId)`}
                  </code>
                </CardContent>
              </Card>

              <Card className="glass border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-purple-500" />
                    Booking System
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <code className="block bg-muted p-4 rounded text-sm font-mono whitespace-pre-wrap">
{`// Create booking
const { data, error } = await supabase
  .from('bookings')
  .insert({
    customer_id: userId,
    business_id: venueId,
    booking_date: selectedDate,
    party_size: guestCount,
    status: 'pending'
  })

// Get venue bookings
const { data, error } = await supabase
  .from('bookings')
  .select('*')
  .eq('business_id', venueId)
  .eq('booking_date', today)`}
                  </code>
                </CardContent>
              </Card>

              <Card className="glass border-orange-500/20">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-orange-500" />
                    Cash Verification
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <code className="block bg-muted p-4 rounded text-sm font-mono whitespace-pre-wrap">
{`// Generate cash code
const cashCode = Math.random()
  .toString(36)
  .substring(2, 8)
  .toUpperCase()

// Update order with cash code
const { data, error } = await supabase
  .from('orders')
  .update({ 
    cash_code: cashCode,
    payment_status: 'cash_pending' 
  })
  .eq('id', orderId)

// Verify cash payment
const { data, error } = await supabase
  .from('orders')
  .update({ payment_status: 'completed' })
  .eq('cash_code', enteredCode)`}
                  </code>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}