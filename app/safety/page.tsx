'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuthGuard } from '@/components/auth/auth-guard';
import { 
  Shield, AlertTriangle, Phone, Navigation, CreditCard, Timer, 
  Heart, Thermometer, Zap, Users, Map, MessageCircle, Plus, Minus,
  Car, MapPin, Share2, PhoneCall, Vibrate, ChevronDown, ChevronUp,
  Clock, Home, User
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

function SafetyPage() {
  const [spentTonight, setSpentTonight] = useState(87);
  const [budgetLimit, setBudgetLimit] = useState(150);
  const [drinks, setDrinks] = useState(3);
  const [weight, setWeight] = useState(70);
  const [hours, setHours] = useState(2);
  const [estimatedBAC, setEstimatedBAC] = useState(0);
  const [currentLocation, setCurrentLocation] = useState('Fabric London, 77A Charterhouse Street, EC1M 3HN');
  const [showTips, setShowTips] = useState(false);
  const [emergencyPressed, setEmergencyPressed] = useState(false);

  // Calculate BAC (simplified formula)
  useEffect(() => {
    const bac = ((drinks * 14) / (weight * (weight > 60 ? 0.7 : 0.6))) - (0.015 * hours);
    setEstimatedBAC(Math.max(0, bac));
  }, [drinks, weight, hours]);

  const emergencyContacts = [
    { name: 'Sarah (Best Friend)', number: '+44 7700 900123', type: 'friend', icon: Heart },
    { name: 'Mum', number: '+44 7700 900456', type: 'family', icon: User },
    { name: 'Dad', number: '+44 7700 900789', type: 'family', icon: User },
    { name: 'Flatmate - Alex', number: '+44 7700 900321', type: 'friend', icon: Home }
  ];

  const getBACStatus = () => {
    if (estimatedBAC < 0.05) return { 
      color: 'text-green-400', 
      status: 'SAFE', 
      bg: 'bg-green-500', 
      ring: 'ring-green-500',
      bgGlow: 'bg-green-500/20',
      description: 'You\'re doing great!'
    };
    if (estimatedBAC < 0.08) return { 
      color: 'text-yellow-400', 
      status: 'CAUTION', 
      bg: 'bg-yellow-500', 
      ring: 'ring-yellow-500',
      bgGlow: 'bg-yellow-500/20',
      description: 'Slow down, drink water'
    };
    return { 
      color: 'text-red-400', 
      status: 'DANGER', 
      bg: 'bg-red-500', 
      ring: 'ring-red-500',
      bgGlow: 'bg-red-500/20',
      description: 'Stop drinking, get help'
    };
  };

  const handleEmergencyCall = () => {
    setEmergencyPressed(true);
    // Haptic feedback simulation
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
    // In a real app, this would initiate emergency call
    setTimeout(() => setEmergencyPressed(false), 2000);
  };

  const handleTrustedContact = (contact: any) => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
    // In a real app, this would call the contact
    console.log(`Calling ${contact.name} at ${contact.number}`);
  };

  const handleRideOrder = (service: string) => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
    // In a real app, this would open the ride app
    console.log(`Ordering ${service} ride`);
  };

  const handleShareLocation = () => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
    // In a real app, this would share location
    console.log('Sharing location with emergency contacts');
  };

  const bacStatus = getBACStatus();
  const budgetProgress = (spentTonight / budgetLimit) * 100;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Simplified Header for Emergency Access */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-lg border-b border-red-500/30">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-red-500/20 animate-pulse">
                <Shield className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-red-400">DrunkSafe™</h1>
                <p className="text-xs text-gray-400">Emergency Safety Mode</p>
              </div>
            </div>
            <Link href="/explore">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                Exit
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* EMERGENCY SECTION - Most Prominent */}
        <Card className="bg-red-500/10 border-red-500/30 border-2">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-red-400 mb-6">EMERGENCY ACTIONS</h2>
              
              {/* 999 Emergency Button - Extra Prominent */}
              <Button
                onClick={handleEmergencyCall}
                className={`w-full h-20 text-2xl font-bold transition-all duration-200 ${
                  emergencyPressed 
                    ? 'bg-red-600 scale-95' 
                    : 'bg-red-500 hover:bg-red-600 animate-pulse'
                } text-white shadow-lg shadow-red-500/50`}
              >
                <Phone className="h-8 w-8 mr-3" />
                CALL 999 EMERGENCY
                <Vibrate className="h-6 w-6 ml-3" />
              </Button>

              {/* Quick Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <Button
                  onClick={handleShareLocation}
                  className="h-16 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold"
                >
                  <Share2 className="h-6 w-6 mr-2" />
                  Share Location
                </Button>
                
                <Button
                  onClick={() => handleRideOrder('Uber')}
                  className="h-16 bg-green-600 hover:bg-green-700 text-white text-lg font-semibold"
                >
                  <Car className="h-6 w-6 mr-2" />
                  Order Ride
                </Button>
                
                <Button
                  onClick={() => setShowTips(!showTips)}
                  className="h-16 bg-purple-600 hover:bg-purple-700 text-white text-lg font-semibold"
                >
                  <Shield className="h-6 w-6 mr-2" />
                  Safety Tips
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* TRUSTED CONTACTS - High Priority */}
        <Card className="bg-blue-500/10 border-blue-500/30 border-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-bold text-blue-400 flex items-center">
              <PhoneCall className="h-6 w-6 mr-2" />
              CALL TRUSTED CONTACT
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {emergencyContacts.map((contact, index) => (
                <Button
                  key={index}
                  onClick={() => handleTrustedContact(contact)}
                  className="h-16 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/50 text-white justify-start text-left p-4"
                >
                  <contact.icon className="h-6 w-6 mr-3 text-blue-400" />
                  <div>
                    <div className="font-semibold text-lg">{contact.name}</div>
                    <div className="text-sm text-gray-300">{contact.number}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* BAC STATUS - Critical Information */}
        <Card className={`${bacStatus.bgGlow} border-2 ${bacStatus.ring.replace('ring-', 'border-')}`}>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-bold text-white">YOUR SAFETY STATUS</h3>
              
              <div className="relative">
                <div className={`text-6xl font-bold ${bacStatus.color} mb-2`}>
                  {bacStatus.status}
                </div>
                <div className="text-3xl font-mono text-white mb-2">
                  BAC: {estimatedBAC.toFixed(3)}
                </div>
                <div className={`text-lg ${bacStatus.color} font-medium`}>
                  {bacStatus.description}
                </div>
              </div>

              {/* Quick BAC Controls */}
              <div className="flex items-center justify-center space-x-6 mt-6">
                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-2">Drinks</div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setDrinks(Math.max(0, drinks - 1))}
                      className="h-12 w-12 text-xl border-gray-500"
                    >
                      <Minus className="h-6 w-6" />
                    </Button>
                    <div className="text-3xl font-bold text-white w-16 text-center">{drinks}</div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setDrinks(drinks + 1)}
                      className="h-12 w-12 text-xl border-gray-500"
                    >
                      <Plus className="h-6 w-6" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CURRENT LOCATION - Important for Emergency Services */}
        <Card className="bg-purple-500/10 border-purple-500/30 border-2">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-purple-400 mb-4 flex items-center justify-center">
                <MapPin className="h-6 w-6 mr-2" />
                YOUR CURRENT LOCATION
              </h3>
              <div className="text-lg text-white font-medium bg-purple-500/20 p-4 rounded-lg">
                {currentLocation}
              </div>
              <Button 
                className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => navigator.clipboard?.writeText(currentLocation)}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Copy Address
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* RIDE SERVICES - Expanded */}
        <Card className="bg-green-500/10 border-green-500/30 border-2">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-green-400 flex items-center">
              <Car className="h-6 w-6 mr-2" />
              GET HOME SAFELY
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => handleRideOrder('Uber')}
                className="h-16 bg-black text-white hover:bg-gray-800 text-lg font-semibold"
              >
                <Car className="h-6 w-6 mr-3" />
                <div className="text-left">
                  <div>Book Uber</div>
                  <div className="text-sm text-gray-300">3 min away • £12-16</div>
                </div>
              </Button>

              <Button
                onClick={() => handleRideOrder('Bolt')}
                className="h-16 bg-green-600 text-white hover:bg-green-700 text-lg font-semibold"
              >
                <Car className="h-6 w-6 mr-3" />
                <div className="text-left">
                  <div>Book Bolt</div>
                  <div className="text-sm text-gray-200">5 min away • £10-14</div>
                </div>
              </Button>

              <Button
                onClick={() => handleRideOrder('Black Cab')}
                className="h-16 bg-yellow-600 text-white hover:bg-yellow-700 text-lg font-semibold"
              >
                <Car className="h-6 w-6 mr-3" />
                <div className="text-left">
                  <div>Black Cab</div>
                  <div className="text-sm text-gray-200">Available • £18-25</div>
                </div>
              </Button>

              <Button
                onClick={() => handleRideOrder('Night Tube')}
                className="h-16 bg-blue-600 text-white hover:bg-blue-700 text-lg font-semibold"
              >
                <Navigation className="h-6 w-6 mr-3" />
                <div className="text-left">
                  <div>Night Tube</div>
                  <div className="text-sm text-gray-200">Last train: 1:30 AM</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* BUDGET TRACKER - Simplified */}
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-bold text-yellow-400">Tonight's Spending</h4>
                <div className="text-2xl font-bold text-white">£{spentTonight} / £{budgetLimit}</div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-medium ${budgetProgress > 80 ? 'text-red-400' : 'text-green-400'}`}>
                  £{budgetLimit - spentTonight} left
                </div>
                <Progress value={budgetProgress} className="w-32 h-3 mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* COLLAPSIBLE SAFETY TIPS */}
        {showTips && (
          <Card className="bg-gray-800/50 border-gray-600/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-yellow-400" />
                  Safety Tips
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTips(false)}
                  className="text-gray-400"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="text-yellow-400 font-semibold">Stay Safe Tonight</h4>
                  {[
                    'Drink water between alcoholic drinks',
                    'Never leave drinks unattended',
                    'Stay with your group',
                    'Keep your phone charged',
                    'Know your limits'
                  ].map((tip, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-sm text-gray-300">{tip}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <h4 className="text-green-400 font-semibold">If You Feel Unwell</h4>
                  {[
                    'Find a trusted friend immediately',
                    'Get to a safe, well-lit area',
                    'Call emergency services if needed',
                    'Don\'t accept drinks from strangers',
                    'Trust your instincts'
                  ].map((tip, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-sm text-gray-300">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* TIME AND DATE - For Reference */}
        <Card className="bg-gray-800/30 border-gray-600/20">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-4 text-gray-300">
              <Clock className="h-5 w-5" />
              <span className="text-lg">
                {new Date().toLocaleString('en-GB', { 
                  weekday: 'long',
                  hour: '2-digit', 
                  minute: '2-digit',
                  day: 'numeric',
                  month: 'long'
                })}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SafetyPageWithAuth() {
  return (
    <AuthGuard allowedUserTypes={['customer']}>
      <SafetyPage />
    </AuthGuard>
  );
}