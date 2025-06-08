'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle, Clock, AlertCircle, Search, Filter, 
  Eye, MessageSquare, Phone, QrCode, CreditCard, Banknote
} from 'lucide-react';
import Link from 'next/link';

// Mock orders data
const mockOrders = [
  {
    id: 'ORD-001',
    customerName: 'Sarah Wilson',
    items: [
      { name: 'Fabric Fizz', quantity: 2, price: 12.50 },
      { name: 'Truffle Fries', quantity: 1, price: 8.00 }
    ],
    total: 33.00,
    paymentMethod: 'card',
    status: 'pending',
    timestamp: '2025-01-27T22:15:00Z',
    tableNumber: 'VIP 3',
    cashCode: null
  },
  {
    id: 'ORD-002',
    customerName: 'Mark Johnson',
    items: [
      { name: 'Underground Martini', quantity: 1, price: 14.00 },
      { name: 'Grey Goose Vodka', quantity: 2, price: 8.50 }
    ],
    total: 31.00,
    paymentMethod: 'cash',
    status: 'cash-pending',
    timestamp: '2025-01-27T22:10:00Z',
    tableNumber: 'Main 12',
    cashCode: 'ABC123'
  },
  {
    id: 'ORD-003',
    customerName: 'Emma Davis',
    items: [
      { name: 'Bass Drop', quantity: 3, price: 11.50 },
      { name: 'Chicken Wings', quantity: 1, price: 9.50 }
    ],
    total: 44.00,
    paymentMethod: 'card',
    status: 'completed',
    timestamp: '2025-01-27T21:45:00Z',
    tableNumber: 'Main 8',
    cashCode: null
  },
  {
    id: 'ORD-004',
    customerName: 'James Brown',
    items: [
      { name: 'Hennessy VS', quantity: 1, price: 12.00 },
      { name: 'Corona Extra', quantity: 2, price: 6.00 }
    ],
    total: 24.00,
    paymentMethod: 'cash',
    status: 'cash-pending',
    timestamp: '2025-01-27T22:20:00Z',
    tableNumber: 'Bar 5',
    cashCode: 'XYZ789'
  }
];

export default function OrdersPage() {
  const [orders, setOrders] = useState(mockOrders);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const confirmCashPayment = (orderId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: 'completed' }
        : order
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-600';
      case 'cash-pending': return 'bg-orange-600';
      case 'completed': return 'bg-green-600';
      case 'cancelled': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'cash-pending': return <QrCode className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    
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
                  £{orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
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
            {filteredOrders.length === 0 ? (
              <Card className="bg-white/5 border-purple-500/20">
                <CardContent className="text-center py-12">
                  <div className="text-gray-400 text-lg">No orders found</div>
                  <p className="text-gray-500 text-sm mt-2">
                    {searchTerm ? 'Try adjusting your search terms' : 'Orders will appear here when customers place them'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredOrders.map((order) => (
                <Card key={order.id} className="bg-white/5 border-purple-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="text-white font-medium text-lg">{order.customerName}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span>Order {order.id}</span>
                            <span>Table {order.tableNumber}</span>
                            <span>{new Date(order.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Badge className={`${getStatusColor(order.status)} text-white flex items-center space-x-1`}>
                          {getStatusIcon(order.status)}
                          <span className="capitalize">{order.status.replace('-', ' ')}</span>
                        </Badge>
                        <div className="flex items-center space-x-1 text-gray-400">
                          {order.paymentMethod === 'card' ? (
                            <CreditCard className="h-4 w-4" />
                          ) : (
                            <Banknote className="h-4 w-4" />
                          )}
                          <span className="text-sm capitalize">{order.paymentMethod}</span>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-2 mb-4">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded">
                          <span className="text-gray-300">{item.quantity}× {item.name}</span>
                          <span className="text-white">£{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-600">
                      <div className="flex items-center space-x-4">
                        <div className="text-lg font-bold text-purple-400">
                          Total: £{order.total.toFixed(2)}
                        </div>
                        
                        {order.status === 'cash-pending' && order.cashCode && (
                          <div className="flex items-center space-x-2 p-2 bg-yellow-600/20 border border-yellow-600/40 rounded">
                            <QrCode className="h-4 w-4 text-yellow-400" />
                            <span className="text-yellow-300 font-mono">{order.cashCode}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {order.status === 'cash-pending' && (
                          <Button 
                            size="sm" 
                            onClick={() => confirmCashPayment(order.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Confirm Cash Payment
                          </Button>
                        )}
                        
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                          <Phone className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
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