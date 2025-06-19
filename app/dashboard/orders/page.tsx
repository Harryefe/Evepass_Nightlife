'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { AuthGuard } from '@/components/auth/auth-guard';
import { 
  CheckCircle, Clock, AlertCircle, Search, Filter, 
  Eye, MessageSquare, Phone, QrCode, CreditCard, Banknote, ShoppingCart
} from 'lucide-react';
import Link from 'next/link';

// Empty orders for fresh start
const mockOrders: any[] = [];

function OrdersPage() {
  const [orders, setOrders] = useState<any[]>(mockOrders);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'pending') return matchesSearch && (order.status === 'pending' || order.status === 'cash-pending');
    if (activeTab === 'completed') return matchesSearch && order.status === 'completed';
    
    return matchesSearch;
  });

  const pendingCount = orders.filter(o => o.status === 'pending' || o.status === 'cash-pending').length;
  const completedCount = orders.filter(o => o.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black text-white">
      {/* Header */}
      <div className="border-b border-purple-500/20 bg-black/50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Order Management
            </Link>
            <div className="flex items-center space-x-4">
              <Badge className="bg-yellow-600 text-white">
                {pendingCount} Pending Orders
              </Badge>
              <Button variant="outline" size="sm" className="border-purple-400 text-purple-400">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Stats */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search orders by customer name or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white/5 border-purple-500/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">{orders.length}</div>
                <div className="text-sm text-gray-400">Total Orders</div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-yellow-500/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">{pendingCount}</div>
                <div className="text-sm text-gray-400">Pending</div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-green-500/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{completedCount}</div>
                <div className="text-sm text-gray-400">Completed</div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-pink-500/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-pink-400">
                  £{orders.reduce((sum, order) => sum + (order.total || 0), 0).toFixed(2)}
                </div>
                <div className="text-sm text-gray-400">Total Revenue</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-purple-500/20">
            <TabsTrigger value="all" className="data-[state=active]:bg-purple-600">
              All Orders ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-yellow-600">
              Pending ({pendingCount})
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-green-600">
              Completed ({completedCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {orders.length === 0 ? (
              <Card className="bg-white/5 border-purple-500/20">
                <CardContent className="text-center py-16">
                  <ShoppingCart className="h-24 w-24 text-gray-400 mx-auto mb-6" />
                  <h2 className="text-3xl font-bold text-white mb-4">No Orders Yet</h2>
                  <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
                    Orders will appear here when customers start ordering from your menu. 
                    Make sure you have menu items set up and your venue is discoverable.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <Link href="/dashboard/menu">
                      <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                        Set Up Menu
                      </Button>
                    </Link>
                    <Button variant="outline" className="border-purple-400 text-purple-400">
                      Complete Profile
                    </Button>
                  </div>
                  
                  <div className="mt-12 p-6 bg-white/5 rounded-lg border border-purple-500/20 max-w-2xl mx-auto">
                    <h3 className="text-white font-medium mb-3">How Orders Work:</h3>
                    <div className="space-y-2 text-sm text-gray-400 text-left">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                        <span>Customers scan QR codes at tables to view your menu</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
                        <span>They place orders directly from their phones</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
                        <span>Orders appear here for you to manage and fulfill</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">4</div>
                        <span>Cash payments are verified with unique codes</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredOrders.map((order) => (
                <Card key={order.id} className="bg-white/5 border-purple-500/20">
                  <CardContent className="p-6">
                    {/* Order content would go here */}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function OrdersPageWithAuth() {
  return (
    <AuthGuard allowedUserTypes={['business']} strictBusinessAccess={true}>
      <OrdersPage />
    </AuthGuard>
  );
}