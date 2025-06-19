'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuthGuard } from '@/components/auth/auth-guard';
import { 
  Plus, Edit, Trash2, Upload, Save, Eye, Star, 
  DollarSign, Package, TrendingUp, Clock
} from 'lucide-react';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';

// Define interfaces for type safety
interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  popular: boolean;
  available: boolean;
  sales: number;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface NewItemForm {
  name: string;
  description: string;
  price: string;
  category: string;
  image: string;
  available: boolean;
}

// Empty menu for fresh start
const mockMenuItems: MenuItem[] = [];

const categories: Category[] = [
  { id: 'cocktails', name: 'Signature Cocktails', icon: '🍸' },
  { id: 'spirits', name: 'Premium Spirits', icon: '🥃' },
  { id: 'beer', name: 'Beers & Ciders', icon: '🍺' },
  { id: 'food', name: 'Late Night Bites', icon: '🍟' }
];

function MenuManagementPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(mockMenuItems);
  const [activeTab, setActiveTab] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [newItem, setNewItem] = useState<NewItemForm>({
    name: '',
    description: '',
    price: '',
    category: 'cocktails',
    image: '',
    available: true
  });

  const handleAddItem = () => {
    return Sentry.startSpan(
      {
        op: "ui.click",
        name: "Add Menu Item",
      },
      (span) => {
        const item: MenuItem = {
          id: Date.now(),
          ...newItem,
          price: parseFloat(newItem.price),
          popular: false,
          sales: 0
        };
        setMenuItems([...menuItems, item]);
        setNewItem({
          name: '',
          description: '',
          price: '',
          category: 'cocktails',
          image: '',
          available: true
        });
        setShowAddForm(false);
        
        span.setAttribute("item_name", item.name);
        span.setAttribute("item_category", item.category);
        span.setAttribute("item_price", item.price);
      }
    );
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setNewItem({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      image: item.image,
      available: item.available
    });
    setShowAddForm(true);
  };

  const handleUpdateItem = () => {
    if (!editingItem) return;
    
    setMenuItems(menuItems.map(item => 
      item.id === editingItem.id 
        ? { ...item, ...newItem, price: parseFloat(newItem.price) }
        : item
    ));
    setEditingItem(null);
    setNewItem({
      name: '',
      description: '',
      price: '',
      category: 'cocktails',
      image: '',
      available: true
    });
    setShowAddForm(false);
  };

  const handleDeleteItem = (id: number) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
  };

  const toggleAvailability = (id: number) => {
    setMenuItems(menuItems.map(item => 
      item.id === id ? { ...item, available: !item.available } : item
    ));
  };

  const filteredItems = menuItems.filter(item => {
    if (activeTab === 'all') return true;
    return item.category === activeTab;
  });

  const totalRevenue = menuItems.reduce((sum, item) => sum + (item.price * item.sales), 0);
  const totalSales = menuItems.reduce((sum, item) => sum + item.sales, 0);
  const availableItems = menuItems.filter(item => item.available).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black text-white">
      {/* Header */}
      <div className="border-b border-purple-500/20 bg-black/50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Menu Management
            </Link>
            <div className="flex items-center space-x-4">
              {menuItems.length > 0 && (
                <Link href={`/menu/your-venue`}>
                  <Button variant="outline" size="sm" className="border-purple-400 text-purple-400">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Menu
                  </Button>
                </Link>
              )}
              <Button 
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/5 border-purple-500/20">
            <CardContent className="p-4 text-center">
              <Package className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{menuItems.length}</div>
              <div className="text-sm text-gray-400">Total Items</div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-green-500/20">
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{availableItems}</div>
              <div className="text-sm text-gray-400">Available</div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-yellow-500/20">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{totalSales}</div>
              <div className="text-sm text-gray-400">Total Sales</div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-pink-500/20">
            <CardContent className="p-4 text-center">
              <DollarSign className="h-8 w-8 text-pink-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">£{totalRevenue.toFixed(2)}</div>
              <div className="text-sm text-gray-400">Revenue</div>
            </CardContent>
          </Card>
        </div>

        {menuItems.length === 0 ? (
          // Empty state for new businesses
          <Card className="bg-white/5 border-purple-500/20">
            <CardContent className="text-center py-16">
              <Package className="h-24 w-24 text-gray-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">Create Your First Menu Item</h2>
              <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
                Start building your digital menu by adding drinks, cocktails, and food items. 
                Customers will be able to order directly from their phones using QR codes.
              </p>
              <Button 
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-4"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Your First Item
              </Button>
              
              <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
                {categories.map((category) => (
                  <div key={category.id} className="p-4 bg-white/5 rounded-lg border border-purple-500/20">
                    <div className="text-3xl mb-2">{category.icon}</div>
                    <h3 className="text-white font-medium">{category.name}</h3>
                    <p className="text-gray-400 text-sm">Add items to this category</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-white/5 border border-purple-500/20">
              <TabsTrigger value="all" className="data-[state=active]:bg-purple-600">
                All Items ({menuItems.length})
              </TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id} 
                  className="data-[state=active]:bg-purple-600"
                >
                  {category.icon} {category.name.split(' ')[0]}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
                  <Card key={item.id} className="bg-white/5 border-purple-500/20">
                    <div className="relative">
                      <img 
                        src={item.image || 'https://images.pexels.com/photos/1304540/pexels-photo-1304540.jpeg'} 
                        alt={item.name}
                        className="w-full h-32 object-cover rounded-t-lg"
                      />
                      <div className="absolute top-2 right-2 flex space-x-1">
                        {item.popular && (
                          <Badge className="bg-yellow-600 text-white text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Popular
                          </Badge>
                        )}
                        <Badge className={`text-white text-xs ${item.available ? 'bg-green-600' : 'bg-red-600'}`}>
                          {item.available ? 'Available' : 'Unavailable'}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-white font-medium">{item.name}</h3>
                          <p className="text-sm text-gray-400 line-clamp-2">{item.description}</p>
                        </div>
                        <span className="text-lg font-bold text-purple-400 ml-2">£{item.price.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                        <span>Sales: {item.sales}</span>
                        <span>Revenue: £{(item.price * item.sales).toFixed(2)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleEditItem(item)}
                          className="flex-1 border-purple-500 text-purple-400"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => toggleAvailability(item.id)}
                          className={`border-gray-500 ${item.available ? 'text-red-400' : 'text-green-400'}`}
                        >
                          {item.available ? 'Disable' : 'Enable'}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDeleteItem(item.id)}
                          className="border-red-500 text-red-400"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Add/Edit Item Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-white/10 border-purple-500/20 backdrop-blur-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-white">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </CardTitle>
              <CardDescription className="text-gray-400">
                {editingItem ? 'Update item details' : 'Create a new menu item for your venue'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">Item Name</Label>
                <Input
                  id="name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="e.g., Signature Cocktail"
                  className="bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-300">Description</Label>
                <Textarea
                  id="description"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Describe the ingredients and preparation"
                  className="bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-gray-300">Price (£)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    placeholder="0.00"
                    className="bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-gray-300">Category</Label>
                  <Select value={newItem.category} onValueChange={(value) => setNewItem({ ...newItem, category: value })}>
                    <SelectTrigger className="bg-white/10 border-purple-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.icon} {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image" className="text-gray-300">Image URL</Label>
                <Input
                  id="image"
                  value={newItem.image}
                  onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="available"
                  checked={newItem.available}
                  onChange={(e) => setNewItem({ ...newItem, available: e.target.checked })}
                  className="rounded border-gray-600"
                />
                <Label htmlFor="available" className="text-gray-300">Available for ordering</Label>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingItem(null);
                    setNewItem({
                      name: '',
                      description: '',
                      price: '',
                      category: 'cocktails',
                      image: '',
                      available: true
                    });
                  }}
                  className="flex-1 border-gray-500 text-gray-300"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={editingItem ? handleUpdateItem : handleAddItem}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  disabled={!newItem.name || !newItem.price}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingItem ? 'Update Item' : 'Add Item'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function MenuManagementPageWithAuth() {
  return (
    <AuthGuard allowedUserTypes={['business']} strictBusinessAccess={true}>
      <MenuManagementPage />
    </AuthGuard>
  );
}