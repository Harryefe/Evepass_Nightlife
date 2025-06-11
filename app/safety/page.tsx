'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { 
  Shield, AlertTriangle, Phone, Navigation, CreditCard, Timer, 
  Heart, Thermometer, Zap, Users, Map, MessageCircle, Plus, Minus
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function SafetyPage() {
  const [spentTonight, setSpentTonight] = useState(87);
  const [budgetLimit, setBudgetLimit] = useState(150);
  const [drinks, setDrinks] = useState(3);
  const [weight, setWeight] = useState(70);
  const [hours, setHours] = useState(2);
  const [estimatedBAC, setEstimatedBAC] = useState(0);

  // Calculate BAC (simplified formula)
  useEffect(() => {
    const bac = ((drinks * 14) / (weight * (weight > 60 ? 0.7 : 0.6))) - (0.015 * hours);
    setEstimatedBAC(Math.max(0, bac));
  }, [drinks, weight, hours]);

  const emergencyContacts = [
    { name: 'Emergency Services', number: '999', type: 'emergency' },
    { name: 'Best Friend - Sarah', number: '+44 7700 900123', type: 'friend' },
    { name: 'Family - Mum', number: '+44 7700 900456', type: 'family' },
    { name: 'Taxi - Uber', number: 'Open App', type: 'transport' }
  ];

  const getBACStatus = () => {
    if (estimatedBAC < 0.05) return { color: 'text-green-500', status: 'Safe', bg: 'bg-green-500', ring: 'ring-green-500' };
    if (estimatedBAC < 0.08) return { color: 'text-yellow-500', status: 'Caution', bg: 'bg-yellow-500', ring: 'ring-yellow-500' };
    return { color: 'text-red-500', status: 'Danger', bg: 'bg-red-500', ring: 'ring-red-500' };
  };

  const budgetProgress = (spentTonight / budgetLimit) * 100;
  const bacProgress = Math.min((estimatedBAC / 0.08) * 100, 100);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-green-500/10 glow-green">
                <Shield className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">DrunkSafe™</h1>
                <p className="text-sm text-muted-foreground">Your intelligent safety companion</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link href="/explore">
                <Button variant="outline" size="sm" className="glass">
                  Back to Explore
                </Button>
              </Link>
              <Button size="sm" className="bg-red-500 hover:bg-red-600 glow-red">
                <Phone className="h-4 w-4 mr-2" />
                Emergency: 999
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="glass hover-lift border-green-500/20 glow-green">
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground flex items-center">
                <Heart className="h-5 w-5 mr-2 text-green-500" />
                Safety Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className={`text-3xl font-bold ${getBACStatus().color} mb-2`}>
                  {getBACStatus().status}
                </div>
                <div className="text-sm text-muted-foreground">
                  Based on current data
                </div>
                <div className="mt-4">
                  <div className={`w-16 h-16 mx-auto rounded-full border-4 ${getBACStatus().ring} flex items-center justify-center`}>
                    <div className={`w-12 h-12 rounded-full ${getBACStatus().bg} opacity-20`} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass hover-lift border-purple-500/20 glow-purple">
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-purple-500" />
                Budget Tracker
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Spent tonight</span>
                  <span className="text-foreground font-medium">£{spentTonight} / £{budgetLimit}</span>
                </div>
                <Progress value={budgetProgress} className="h-3" />
                <div className={`text-xs ${budgetProgress > 80 ? 'text-red-500' : 'text-muted-foreground'}`}>
                  {budgetProgress > 80 ? 'Approaching limit!' : `£${budgetLimit - spentTonight} remaining`}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass hover-lift border-blue-500/20 glow-blue">
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground flex items-center">
                <Navigation className="h-5 w-5 mr-2 text-blue-500" />
                Current Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-foreground font-medium mb-1">Fabric London</div>
                <div className="text-sm text-muted-foreground mb-3">Farringdon, EC1M 3HN</div>
                <Button size="sm" variant="ghost" className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10">
                  <Map className="h-3 w-3 mr-1" />
                  View on Map
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="bac" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 glass border border-border/50">
            <TabsTrigger value="bac" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-500">BAC Monitor</TabsTrigger>
            <TabsTrigger value="transport" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-500">Transport</TabsTrigger>
            <TabsTrigger value="contacts" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-500">Contacts</TabsTrigger>
            <TabsTrigger value="tips" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-500">Safety Tips</TabsTrigger>
          </TabsList>

          <TabsContent value="bac" className="space-y-6">
            <Card className="glass border-green-500/20">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center">
                  <Thermometer className="h-5 w-5 mr-2 text-green-500" />
                  Blood Alcohol Content Estimator
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Track your estimated BAC based on drinks consumed (This is an estimate only)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-foreground">Drinks Tonight</label>
                    <div className="flex items-center space-x-3">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setDrinks(Math.max(0, drinks - 1))}
                        className="glass h-10 w-10 p-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="flex-1 text-center">
                        <div className="text-2xl font-bold text-foreground">{drinks}</div>
                        <div className="text-xs text-m uted-foreground">drinks</div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setDrinks(drinks + 1)}
                        className="glass h-10 w-10 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-foreground">Weight (kg)</label>
                    <Input 
                      type="number" 
                      value={weight} 
                      onChange={(e) => setWeight(Number(e.target.value))}
                      className="glass text-center text-lg font-medium"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-foreground">Hours Drinking</label>
                    <Input 
                      type="number" 
                      value={hours} 
                      onChange={(e) => setHours(Number(e.target.value))}
                      className="glass text-center text-lg font-medium"
                    />
                  </div>
                </div>

                {/* BAC Visualization */}
                <div className="text-center p-8 rounded-2xl glass border-2 border-border/50">
                  <div className="relative w-32 h-32 mx-auto mb-6">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-muted/20"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray={`${bacProgress}, 100`}
                        className={getBACStatus().color}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${getBACStatus().color}`}>
                          {estimatedBAC.toFixed(3)}
                        </div>
                        <div className="text-xs text-muted-foreground">BAC</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`text-xl font-medium mb-2 ${getBACStatus().color}`}>
                    {getBACStatus().status}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Estimated Blood Alcohol Content
                  </div>
                </div>

                {estimatedBAC > 0.05 && (
                  <Card className="glass border-yellow-500/40 bg-yellow-500/5">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 text-yellow-500 mb-2">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="font-medium">Safety Recommendation</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {estimatedBAC > 0.08 
                          ? "You're over the legal driving limit. Consider stopping drinking and getting a safe ride home."
                          : "Approaching legal limit. Please drink water and consider slowing down."
                        }
                      </p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transport" className="space-y-6">
            <Card className="glass border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center">
                  <Navigation className="h-5 w-5 mr-2 text-blue-500" />
                  Safe Transport Options
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Quick access to ride services and public transport
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="glass hover-lift border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-foreground font-medium">Uber</h4>
                        <Badge className="bg-green-500 text-white">3 min away</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-3">
                        Estimated fare to home: £12-16
                      </div>
                      <Button className="w-full bg-black text-white hover:bg-gray-800">
                        Book Uber
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="glass hover-lift border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-foreground font-medium">Bolt</h4>
                        <Badge className="bg-green-500 text-white">5 min away</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-3">
                        Estimated fare to home: £10-14
                      </div>
                      <Button className="w-full bg-green-500 text-white hover:bg-green-600">
                        Book Bolt
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="glass hover-lift border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-foreground font-medium">Night Tube</h4>
                        <Badge className="bg-blue-500 text-white">Running</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-3">
                        Last train: 1:30 AM
                      </div>
                      <Button variant="outline" className="w-full glass">
                        View Routes
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="glass hover-lift border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-foreground font-medium">Black Cab</h4>
                        <Badge className="bg-yellow-500 text-white">Available</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-3">
                        Estimated fare: £18-25
                      </div>
                      <Button variant="outline" className="w-full glass">
                        Call Cab
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-6">
            <Card className="glass border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-purple-500" />
                  Emergency Contacts
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Quick access to important numbers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {emergencyContacts.map((contact, index) => (
                  <Card key={index} className="glass hover-lift border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            contact.type === 'emergency' ? 'bg-red-500' :
                            contact.type === 'friend' ? 'bg-green-500' :
                            contact.type === 'family' ? 'bg-blue-500' :
                            'bg-yellow-500'
                          }`} />
                          <div>
                            <div className="text-foreground font-medium">{contact.name}</div>
                            <div className="text-sm text-muted-foreground">{contact.number}</div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" className={`${
                            contact.type === 'emergency' ? 'bg-red-500 hover:bg-red-600' :
                            'bg-green-500 hover:bg-green-600'
                          }`}>
                            <Phone className="h-4 w-4" />
                          </Button>
                          {contact.type !== 'emergency' && (
                            <Button size="sm" variant="outline" className="glass">
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tips" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="glass border-yellow-500/20">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                    Stay Safe Tonight
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    'Drink water between alcoholic drinks',
                    'Never leave drinks unattended',
                    'Stay with your group',
                    'Keep your phone charged'
                  ].map((tip, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">{tip}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="glass border-green-500/20">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center">
                    <Users className="h-5 w-5 mr-2 text-green-500" />
                    Group Safety
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    'Designate a sober person',
                    'Share live location with friends',
                    'Plan your route home together',
                    'Check in regularly'
                  ].map((tip, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">{tip}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}