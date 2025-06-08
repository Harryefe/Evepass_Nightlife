'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ShoppingCart, Plus, Minus, CreditCard, Banknote, 
  Clock, Star, MapPin, QrCode, CheckCircle, AlertCircle
} from 'lucide-react';
import Link from 'next/link';

// Mock menu data
const menuData = {
  venue: {
    name: 'Fabric London',
    location: 'Farringdon, EC1M 3HN',
    rating: 4.8,
    image: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg'
  },
  categories: [
    {
      id: 'cocktails',
      name: 'Signature Cocktails',
      items: [
        {
          id: 1,
          name: 'Fabric Fizz',
          description: 'Gin, elderflower, prosecco, lime',
          price: 12.50,
          image: 'https://images.pexels.com/photos/1304540/pexels-photo-1304540.jpeg',
          popular: true
        },
        {
          id: 2,
          name: 'Underground Martini',
          description: 'Premium vodka, dry vermouth, olive',
          price: 14.00,
          image: 'https://images.pexels.com/photos/1304540/pexels-photo-1304540.jpeg'
        },
        {
          id: 3,
          name: 'Bass Drop',
          description: 'Dark rum, blackberry, lime, ginger beer',
          price: 11.50,
          image: 'https://images.pexels.com/photos/1304540/pexels-photo-1304540.jpeg'
        }
      ]
    },
    {
      id: 'spirits',
      name: 'Premium Spirits',
      items: [
        {
          id: 4,
          name: 'Grey Goose Vodka',
          description: 'Single shot',
          price: 8.50,
          image: 'https://images.pexels.com/photos/602750/pexels-photo-602750.jpeg'
        },
        {
          id: 5,
          name: 'Hennessy VS',
          description: 'Single shot',
          price: 12.00,
          image: 'https://images.pexels.com/photos/602750/pexels-photo-602750.jpeg'
        }
      ]
    },
    {
      id: 'beer',
      name: 'Beers & Ciders',
      items: [
        {
          id: 6,
          name: 'Stella Artois',
          description: '330ml bottle',
          price: 5.50,
          image: 'https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg'
        },
        {
          id: 7,
          name: 'Corona Extra',
          description: '330ml bottle with lime',
          price: 6.00,
          image: 'https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg'
        }
      ]
    },
    {
      id: 'food',
      name: 'Late Night Bites',
      items: [
        {
          id: 8,
          name: 'Truffle Fries',
          description: 'Hand-cut fries with truffle oil and parmesan',
          price: 8.00,
          image: 'https://images.pexels.com/photos/1893556/pexels-photo-1893556.jpeg'
        },
        {
          id: 9,
          name: 'Chicken Wings',
          description: '6 pieces with buffalo or BBQ sauce',
          price: 9.50,
          image: 'https://images.pexels.com/photos/1893556/pexels-photo-1893556.jpeg'
        }
      ]
    }
  ]
};

export default function MenuPage({ params }: { params: { venueId: string } }) {
  const [cart, setCart] = useState<{[key: number]: number}>({});
  const [activeCategory, setActiveCategory] = useState('cocktails');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderStatus, setOrderStatus] = useState<'ordering' | 'processing' | 'confirmed' | 'cash-pending'>('ordering');
  const [cashCode, setCashCode] = useState('');

  const addToCart = (itemId: number) => {
    setCart(prev => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
  };

  const removeFromCart = (itemId: number) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[itemId] > 1) {
        newCart[itemId]--;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
  };

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [itemId, quantity]) => {
      const item = menuData.categories
        .flatMap(cat => cat.items)
        .find(item => item.id === parseInt(itemId));
      return total + (item?.price || 0) * quantity;
    }, 0);
  };

  const getCartItemCount = () => {
    return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  };

  const handleOrder = () => {
    if (paymentMethod === 'card') {
      setOrderStatus('processing');
      setTimeout(() => {
        setOrderStatus('confirmed');
      }, 3000);
    } else {
      // Generate cash payment code
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      setCashCode(code);
      setOrderStatus('cash-pending');
    }
  };

  const allItems = menuData.categories.flatMap(cat => cat.items);

  if (orderStatus === 'confirmed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black text-white flex items-center justify-center p-4">
        <Card className="bg-white/10 border-green-500/20 backdrop-blur-lg max-w-md w-full">
          <CardContent className="text-center p-8">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Order Confirmed!</h2>
            <p className="text-gray-400 mb-4">Your order has been sent to the bar</p>
            <div className="bg-green-600/20 border border-green-600/40 rounded-lg p-4 mb-6">
              <p className="text-green-300 text-sm">Order #FBR-{Math.random().toString(36).substring(2, 8).toUpperCase()}</p>
              <p className="text-white font-medium">Estimated time: 5-10 minutes</p>
            </div>
            <Link href="/explore">
              <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                Continue Exploring
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (orderStatus === 'cash-pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black text-white flex items-center justify-center p-4">
        <Card className="bg-white/10 border-yellow-500/20 backdrop-blur-lg max-w-md w-full">
          <CardContent className="text-center p-8">
            <QrCode className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Show This Code</h2>
            <p className="text-gray-400 mb-4">Present this code when paying with cash</p>
            <div className="bg-yellow-600/20 border border-yellow-600/40 rounded-lg p-6 mb-6">
              <div className="text-3xl font-bold text-yellow-300 mb-2">{cashCode}</div>
              <p className="text-sm text-gray-300">Payment Code</p>
            </div>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                <span>Show this code to staff when paying</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                <span>Staff will confirm payment in their system</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                <span>Your order will be prepared once confirmed</span>
              </div>
            </div>
            <Button 
              className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              onClick={() => setOrderStatus('confirmed')}
            >
              Payment Confirmed
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (orderStatus === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black text-white flex items-center justify-center p-4">
        <Card className="bg-white/10 border-purple-500/20 backdrop-blur-lg max-w-md w-full">
          <CardContent className="text-center p-8">
            <div className="w-16 h-16 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Processing Payment</h2>
            <p className="text-gray-400">Please wait while we process your order...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-lg border-b border-purple-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src={menuData.venue.image} 
                alt={menuData.venue.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <h1 className="text-xl font-bold text-white">{menuData.venue.name}</h1>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <MapPin className="h-3 w-3" />
                  <span>{menuData.venue.location}</span>
                  <Star className="h-3 w-3 text-yellow-400 fill-current ml-2" />
                  <span>{menuData.venue.rating}</span>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => setShowCheckout(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              disabled={getCartItemCount() === 0}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Cart ({getCartItemCount()}) • £{getCartTotal().toFixed(2)}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-purple-500/20">
            {menuData.categories.map((category) => (
              <TabsTrigger 
                key={category.id} 
                value={category.id} 
                className="data-[state=active]:bg-purple-600"
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {menuData.categories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {category.items.map((item) => (
                  <Card key={item.id} className="bg-white/5 border-purple-500/20 backdrop-blur-lg">
                    <div className="flex">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-l-lg"
                      />
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-white font-medium flex items-center">
                              {item.name}
                              {item.popular && (
                                <Badge className="ml-2 bg-yellow-600 text-white text-xs">Popular</Badge>
                              )}
                            </h3>
                            <p className="text-sm text-gray-400">{item.description}</p>
                          </div>
                          <span className="text-lg font-bold text-purple-400">£{item.price.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => removeFromCart(item.id)}
                              disabled={!cart[item.id]}
                              className="border-gray-500 text-gray-300 h-8 w-8 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-white min-w-[2rem] text-center">
                              {cart[item.id] || 0}
                            </span>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => addToCart(item.id)}
                              className="border-purple-500 text-purple-400 h-8 w-8 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-white/10 border-purple-500/20 backdrop-blur-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-white">Order Summary</CardTitle>
              <CardDescription className="text-gray-400">
                Review your order and choose payment method
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order Items */}
              <div className="space-y-3">
                {Object.entries(cart).map(([itemId, quantity]) => {
                  const item = allItems.find(item => item.id === parseInt(itemId));
                  if (!item) return null;
                  
                  return (
                    <div key={itemId} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-400">£{item.price.toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-white">×{quantity}</span>
                        <span className="text-purple-400 font-medium">
                          £{(item.price * quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total */}
              <div className="border-t border-gray-600 pt-4">
                <div className="flex items-center justify-between text-lg font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-purple-400">£{getCartTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-3">
                <h4 className="text-white font-medium">Payment Method</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={paymentMethod === 'card' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('card')}
                    className={paymentMethod === 'card' 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
                      : 'border-gray-500 text-gray-300'
                    }
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Card
                  </Button>
                  <Button
                    variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('cash')}
                    className={paymentMethod === 'cash' 
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
                      : 'border-gray-500 text-gray-300'
                    }
                  >
                    <Banknote className="h-4 w-4 mr-2" />
                    Cash
                  </Button>
                </div>
              </div>

              {paymentMethod === 'cash' && (
                <div className="p-3 bg-yellow-600/20 border border-yellow-600/40 rounded-lg">
                  <div className="flex items-center space-x-2 text-yellow-400 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>You'll receive a code to show staff when paying</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCheckout(false)}
                  className="flex-1 border-gray-500 text-gray-300"
                >
                  Continue Shopping
                </Button>
                <Button 
                  onClick={handleOrder}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Place Order
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}