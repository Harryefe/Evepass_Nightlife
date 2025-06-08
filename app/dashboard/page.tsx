'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';
import { 
  TrendingUp, Users, Calendar, MessageSquare, Star, Settings, 
  Upload, MapPin, Clock, DollarSign, Eye, Heart, Phone, ShoppingCart, QrCode
} from 'lucide-react';
import Link from 'next/link';

// Mock analytics data
const revenueData = [
  { month: 'Jan', revenue: 45000, bookings: 420, orders: 1250 },
  { month: 'Feb', revenue: 52000, bookings: 380, orders: 1180 },
  { month: 'Mar', revenue: 48000, bookings: 450, orders: 1320 },
  { month: 'Apr', revenue: 61000, bookings: 520, orders: 1450 },
  { month: 'May', revenue: 55000, bookings: 480, orders: 1380 },
  { month: 'Jun', revenue: 67000, bookings: 580, orders: 1620 },
];

const audienceData = [
  { name: '18-24', value: 25, color: '#8B5CF6' },
  { name: '25-30', value: 35, color: '#EC4899' },
  { name: '31-35', value: 20, color: '#F59E0B' },
  { name: '36-40', value: 15, color: '#10B981' },
  { name: '40+', value: 5, color: '#6B7280' },
];

const trafficData = [
  { time: '6PM', views: 120, bookings: 15, orders: 45 },
  { time: '7PM', views: 250, bookings: 28, orders: 78 },
  { time: '8PM', views: 380, bookings: 45, orders: 125 },
  { time: '9PM', views: 520, bookings: 67, orders: 180 },
  { time: '10PM', views: 420, bookings: 52, orders: 145 },
  { time: '11PM', views: 340, bookings: 38, orders: 98 },
  { time: '12AM', views: 280, bookings: 25, orders: 67 },
];

export default function BusinessDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black text-white">
      {/* Header */}
      <div className="border-b border-purple-500/20 bg-black/50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Evepass Business
            </Link>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Messages (3)
              </Button>
              <Button variant="outline" size="sm" className="border-purple-400 text-purple-400">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Venue Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Fabric London</h1>
              <p className="text-gray-400 flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                77A Charterhouse Street, London EC1M 3HN
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Badge className="bg-green-600 text-white">
                <Clock className="h-3 w-3 mr-1" />
                Open
              </Badge>
              <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
                <Star className="h-3 w-3 mr-1" />
                4.8 Rating
              </Badge>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card className="bg-white/5 border-purple-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Today's Revenue</p>
                    <p className="text-2xl font-bold text-green-400">£2,450</p>
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
                    <p className="text-2xl font-bold text-purple-400">47</p>
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
                    <p className="text-2xl font-bold text-blue-400">89</p>
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
                    <p className="text-2xl font-bold text-pink-400">1,283</p>
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
                    <p className="text-2xl font-bold text-yellow-400">342</p>
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
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={audienceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {audienceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {audienceData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-gray-300">{item.name}</span>
                        </div>
                        <span className="text-white">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/5 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-3 rounded-lg bg-white/5">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-white text-sm">New order: 2x Fabric Fizz, 1x Truffle Fries - Table VIP 3</p>
                      <p className="text-gray-400 text-xs">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-3 rounded-lg bg-white/5">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-white text-sm">Cash payment confirmed: Order #ABC123 - £31.00</p>
                      <p className="text-gray-400 text-xs">5 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-3 rounded-lg bg-white/5">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-white text-sm">New booking for table of 6 - Tonight 10:30 PM</p>
                      <p className="text-gray-400 text-xs">10 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-3 rounded-lg bg-white/5">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-white text-sm">Review received: 5 stars - "Amazing night!"</p>
                      <p className="text-gray-400 text-xs">15 minutes ago</p>
                    </div>
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
                  <h3 className="text-xl font-medium text-white mb-2">Order Management</h3>
                  <p className="text-gray-400 mb-4">
                    View and manage all customer orders, including cash payment confirmations
                  </p>
                  <Link href="/dashboard/orders">
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      Access Order Dashboard
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
                      Manage your drinks and food menu for real-time ordering
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
                  <h3 className="text-xl font-medium text-white mb-2">Digital Menu System</h3>
                  <p className="text-gray-400 mb-4">
                    Create and manage your digital menu with photos, prices, and real-time availability
                  </p>
                  <Link href="/dashboard/menu">
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      Setup Menu
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card className="bg-white/5 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Today's Bookings</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage table reservations and event bookings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { time: '7:30 PM', party: 4, name: 'Sarah Wilson', status: 'Confirmed', table: 'VIP 3' },
                    { time: '8:00 PM', party: 2, name: 'Mark Johnson', status: 'Pending', table: 'Main 12' },
                    { time: '9:30 PM', party: 6, name: 'Birthday Party', status: 'Confirmed', table: 'VIP 1' },
                    { time: '10:30 PM', party: 8, name: 'Corporate Event', status: 'Confirmed', table: 'Private Room' },
                  ].map((booking, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-purple-500/10">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-white font-medium">{booking.time}</div>
                          <div className="text-xs text-gray-400">Tonight</div>
                        </div>
                        <div>
                          <div className="text-white font-medium">{booking.name}</div>
                          <div className="text-sm text-gray-400">Party of {booking.party} • {booking.table}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={booking.status === 'Confirmed' ? 'bg-green-600' : 'bg-yellow-600'}>
                          {booking.status}
                        </Badge>
                        <Button size="sm" variant="ghost">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-white/5 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Venue Profile</CardTitle>
                <CardDescription className="text-gray-400">
                  Update your venue information and photos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Venue Name</label>
                      <Input defaultValue="Fabric London" className="bg-white/10 border-purple-500/30 text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                      <Textarea 
                        defaultValue="London's legendary underground nightclub featuring cutting-edge electronic music and world-class sound system."
                        className="bg-white/10 border-purple-500/30 text-white h-32"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
                      <Input defaultValue="77A Charterhouse Street, London EC1M 3HN" className="bg-white/10 border-purple-500/30 text-white" />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Capacity</label>
                      <Input defaultValue="2500" className="bg-white/10 border-purple-500/30 text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Opening Hours</label>
                      <Input defaultValue="10:00 PM - 6:00 AM" className="bg-white/10 border-purple-500/30 text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Music Genres</label>
                      <Input defaultValue="Electronic, Techno, House, Drum & Bass" className="bg-white/10 border-purple-500/30 text-white" />
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
                  Update Profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-white/5 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Hourly Traffic, Bookings & Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={trafficData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #8B5CF6',
                        borderRadius: '8px'
                      }} 
                    />
                    <Line type="monotone" dataKey="views" stroke="#8B5CF6" strokeWidth={2} name="Profile Views" />
                    <Line type="monotone" dataKey="bookings" stroke="#EC4899" strokeWidth={2} name="Bookings" />
                    <Line type="monotone" dataKey="orders" stroke="#10B981" strokeWidth={2} name="Orders" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}