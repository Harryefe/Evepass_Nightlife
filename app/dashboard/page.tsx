'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AuthGuard } from '@/components/auth/auth-guard';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';
import { 
  TrendingUp, Users, Calendar, MessageSquare, Star, Settings, 
  Upload, MapPin, Clock, DollarSign, Eye, Heart, Phone, ShoppingCart, QrCode, LogOut
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { authService } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import * as Sentry from '@sentry/nextjs';

// Mock analytics data - Fresh start for demo
const revenueData = [
  { month: 'Jan', revenue: 0, bookings: 0, orders: 0 },
  { month: 'Feb', revenue: 0, bookings: 0, orders: 0 },
  { month: 'Mar', revenue: 0, bookings: 0, orders: 0 },
  { month: 'Apr', revenue: 0, bookings: 0, orders: 0 },
  { month: 'May', revenue: 0, bookings: 0, orders: 0 },
  { month: 'Jun', revenue: 0, bookings: 0, orders: 0 },
];

const audienceData = [
  { name: '18-24', value: 0, color: '#8B5CF6' },
  { name: '25-30', value: 0, color: '#EC4899' },
  { name: '31-35', value: 0, color: '#F59E0B' },
  { name: '36-40', value: 0, color: '#10B981' },
  { name: '40+', value: 0, color: '#6B7280' },
];

const trafficData = [
  { time: '6PM', views: 0, bookings: 0, orders: 0 },
  { time: '7PM', views: 0, bookings: 0, orders: 0 },
  { time: '8PM', views: 0, bookings: 0, orders: 0 },
  { time: '9PM', views: 0, bookings: 0, orders: 0 },
  { time: '10PM', views: 0, bookings: 0, orders: 0 },
  { time: '11PM', views: 0, bookings: 0, orders: 0 },
  { time: '12AM', views: 0, bookings: 0, orders: 0 },
];

function BusinessDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();

  const handleSignOut = async () => {
    return Sentry.startSpan(
      {
        op: "ui.click",
        name: "Business Sign Out",
      },
      async (span) => {
        try {
          await authService.signOut();
          router.push('/');
          span.setAttribute("signout_success", true);
        } catch (error) {
          console.error('Sign out failed:', error);
          Sentry.captureException(error);
          span.setAttribute("signout_success", false);
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black text-white">
      {/* Header */}
      <div className="border-b border-purple-500/20 bg-black/50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <Image
                src="/evepass-logo-white-01.png"
                alt="Evepass Business"
                width={150}
                height={45}
                className="h-8 w-auto"
              />
              <span className="ml-2 text-lg font-medium text-purple-300">Business</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Messages (0)
              </Button>
              <Button variant="outline" size="sm" className="border-purple-400 text-purple-400">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message for New Business */}
        <div className="mb-8 p-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg border border-purple-500/30">
          <h1 className="text-2xl font-bold text-white mb-2">Welcome to Your Business Dashboard!</h1>
          <p className="text-gray-300 mb-4">
            You're all set up! Start by adding your menu items, setting up tables, and customizing your venue profile. 
            Your analytics will populate as customers discover and interact with your venue.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/menu">
              <Button className="bg-purple-600 hover:bg-purple-700">
                <QrCode className="h-4 w-4 mr-2" />
                Set Up Menu
              </Button>
            </Link>
            <Link href="/dashboard/profile">
              <Button variant="outline" className="border-purple-400 text-purple-400">
                <Settings className="h-4 w-4 mr-2" />
                Complete Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* Venue Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Your Venue</h2>
              <p className="text-gray-400 flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                Complete your profile to show your address
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Badge className="bg-yellow-600 text-white">
                <Clock className="h-3 w-3 mr-1" />
                Setup Required
              </Badge>
              <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
                <Star className="h-3 w-3 mr-1" />
                New Venue
              </Badge>
            </div>
          </div>

          {/* Quick Stats - All zeros for fresh start */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card className="bg-white/5 border-purple-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Today's Revenue</p>
                    <p className="text-2xl font-bold text-green-400">£0</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-purple-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Bookings Today</p>
                    <p className="text-2xl font-bold text-purple-400">0</p>
                  </div>
                  <Calendar className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-purple-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Orders Today</p>
                    <p className="text-2xl font-bold text-blue-400">0</p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-purple-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Profile Views</p>
                    <p className="text-2xl font-bold text-pink-400">0</p>
                  </div>
                  <Eye className="h-8 w-8 text-pink-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-purple-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Favorites</p>
                    <p className="text-2xl font-bold text-yellow-400">0</p>
                  </div>
                  <Heart className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 bg-white/5 border border-purple-500/20">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">Overview</TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-blue-600">Orders</TabsTrigger>
            <TabsTrigger value="menu" className="data-[state=active]:bg-green-600">Menu</TabsTrigger>
            <TabsTrigger value="bookings" className="data-[state=active]:bg-purple-600">Bookings</TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-purple-600">Profile</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white/5 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
                    Revenue & Orders Trend
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Your revenue will appear here as you start receiving orders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #8B5CF6',
                          borderRadius: '8px'
                        }} 
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                      <Area type="monotone" dataKey="orders" stroke="#EC4899" fill="#EC4899" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Users className="h-5 w-5 mr-2 text-pink-400" />
                    Audience Demographics
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Customer demographics will show as you gain visitors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-64 text-gray-400">
                    <div className="text-center">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No customer data yet</p>
                      <p className="text-sm">Start attracting customers to see demographics</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/5 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Getting Started</CardTitle>
                <CardDescription className="text-gray-400">
                  Complete these steps to start attracting customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-3 rounded-lg bg-white/5">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">1</div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">Set up your menu with drinks and food items</p>
                      <p className="text-gray-400 text-xs">Add photos, prices, and descriptions</p>
                    </div>
                    <Link href="/dashboard/menu">
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        Set Up Menu
                      </Button>
                    </Link>
                  </div>
                  <div className="flex items-center space-x-4 p-3 rounded-lg bg-white/5">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">2</div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">Complete your venue profile</p>
                      <p className="text-gray-400 text-xs">Add photos, description, and contact details</p>
                    </div>
                    <Button size="sm" variant="outline" className="border-blue-500 text-blue-400">
                      Complete Profile
                    </Button>
                  </div>
                  <div className="flex items-center space-x-4 p-3 rounded-lg bg-white/5">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">3</div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">Configure table bookings</p>
                      <p className="text-gray-400 text-xs">Set up tables and booking preferences</p>
                    </div>
                    <Button size="sm" variant="outline" className="border-green-500 text-green-400">
                      Setup Tables
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card className="bg-white/5 border-purple-500/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Order Management</CardTitle>
                    <CardDescription className="text-gray-400">
                      Manage real-time orders and cash payment confirmations
                    </CardDescription>
                  </div>
                  <Link href="/dashboard/orders">
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      View All Orders
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">No Orders Yet</h3>
                  <p className="text-gray-400 mb-4">
                    Orders will appear here once customers start ordering from your menu
                  </p>
                  <Link href="/dashboard/menu">
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      Set Up Menu First
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="menu" className="space-y-6">
            <Card className="bg-white/5 border-purple-500/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Menu Management</CardTitle>
                    <CardDescription className="text-gray-400">
                      Create your digital menu for real-time ordering
                    </CardDescription>
                  </div>
                  <Link href="/dashboard/menu">
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      Manage Menu
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">Create Your Digital Menu</h3>
                  <p className="text-gray-400 mb-4">
                    Add drinks, cocktails, and food items with photos and prices
                  </p>
                  <Link href="/dashboard/menu">
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      Start Adding Items
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card className="bg-white/5 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Table Bookings</CardTitle>
                <CardDescription className="text-gray-400">
                  No bookings yet - set up your tables to start accepting reservations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">No Bookings Yet</h3>
                  <p className="text-gray-400 mb-4">
                    Configure your tables and booking settings to start accepting reservations
                  </p>
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    Set Up Tables
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-white/5 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Venue Profile</CardTitle>
                <CardDescription className="text-gray-400">
                  Complete your venue information to attract customers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Venue Name</label>
                      <Input placeholder="Enter your venue name" className="bg-white/10 border-purple-500/30 text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                      <Textarea 
                        placeholder="Describe your venue, atmosphere, and what makes it special"
                        className="bg-white/10 border-purple-500/30 text-white h-32"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
                      <Input placeholder="Full venue address" className="bg-white/10 border-purple-500/30 text-white" />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Capacity</label>
                      <Input placeholder="Maximum capacity" className="bg-white/10 border-purple-500/30 text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Opening Hours</label>
                      <Input placeholder="e.g., 6:00 PM - 2:00 AM" className="bg-white/10 border-purple-500/30 text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Music Genres</label>
                      <Input placeholder="e.g., Electronic, House, Techno" className="bg-white/10 border-purple-500/30 text-white" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-4">Venue Photos</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="relative aspect-square bg-white/5 rounded-lg border-2 border-dashed border-purple-500/30 flex items-center justify-center hover:border-purple-500/60 transition-colors">
                        <Upload className="h-8 w-8 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  Save Profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-white/5 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Analytics Dashboard</CardTitle>
                <CardDescription className="text-gray-400">
                  Analytics will populate as customers interact with your venue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">No Analytics Data Yet</h3>
                  <p className="text-gray-400 mb-4">
                    Complete your setup and start attracting customers to see detailed analytics
                  </p>
                  <div className="flex justify-center space-x-4">
                    <Link href="/dashboard/menu">
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        Set Up Menu
                      </Button>
                    </Link>
                    <Button variant="outline" className="border-purple-400 text-purple-400">
                      Complete Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function BusinessDashboardWithAuth() {
  return (
    <AuthGuard allowedUserTypes={['business']} strictBusinessAccess={true}>
      <BusinessDashboard />
    </AuthGuard>
  );
}