'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AuthGuard } from '@/components/auth/auth-guard';
import { authService } from '@/lib/auth';
import { drunkSafeService, UserToleranceProfile, BACCalculation } from '@/lib/drunksafe';
import { 
  Shield, AlertTriangle, Phone, Navigation, CreditCard, Timer, 
  Heart, Thermometer, Zap, Users, Map, MessageCircle, Plus, Minus,
  Car, MapPin, Share2, PhoneCall, Vibrate, ChevronDown, ChevronUp,
  Clock, Home, User, Settings, TrendingUp, Activity, Brain
} from 'lucide-react';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';

function SafetyPage() {
  // User and profile state
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [toleranceProfile, setToleranceProfile] = useState<UserToleranceProfile | null>(null);
  const [bacCalculation, setBacCalculation] = useState<BACCalculation | null>(null);
  
  // UI state
  const [spentTonight, setSpentTonight] = useState(87);
  const [budgetLimit, setBudgetLimit] = useState(150);
  const [currentLocation, setCurrentLocation] = useState('Fabric London, 77A Charterhouse Street, EC1M 3HN');
  const [showTips, setShowTips] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [emergencyPressed, setEmergencyPressed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [profileSaving, setProfileSaving] = useState(false);

  // Profile setup state
  const [profileForm, setProfileForm] = useState({
    weight_kg: 70,
    gender: 'male' as 'male' | 'female' | 'other',
    tolerance_level: 'moderate' as 'low' | 'moderate' | 'high' | 'custom',
    safe_threshold: 0.030,
    caution_threshold: 0.050,
    danger_threshold: 0.080
  });

  // Manual drink logging state
  const [manualDrink, setManualDrink] = useState({
    name: '',
    volume_ml: 330,
    abv_percentage: 5.0
  });

  useEffect(() => {
    initializeDrunkSafe();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(() => {
      if (currentUser) {
        updateBACCalculation();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentUser && !toleranceProfile) {
      setShowProfileSetup(true);
    }
  }, [currentUser, toleranceProfile]);

  const initializeDrunkSafe = async () => {
    return Sentry.startSpan(
      {
        op: "ui.action",
        name: "Initialize DrunkSafe",
      },
      async (span) => {
        try {
          setLoading(true);
          
          // Get current user
          const user = await authService.getCurrentUser();
          if (!user) return;
          
          setCurrentUser(user);
          span.setAttribute("user_id", user.id);
          
          // Get tolerance profile
          const profile = await drunkSafeService.getUserToleranceProfile(user.id);
          setToleranceProfile(profile);
          
          if (profile) {
            setProfileForm({
              weight_kg: profile.weight_kg,
              gender: profile.gender,
              tolerance_level: profile.tolerance_level,
              safe_threshold: profile.safe_threshold,
              caution_threshold: profile.caution_threshold,
              danger_threshold: profile.danger_threshold
            });
          }
          
          // Calculate current BAC
          await updateBACCalculation();
          
          span.setAttribute("initialization_success", true);
        } catch (error) {
          console.error('Failed to initialize DrunkSafe:', error);
          Sentry.captureException(error);
          span.setAttribute("initialization_success", false);
        } finally {
          setLoading(false);
        }
      }
    );
  };

  const updateBACCalculation = async () => {
    if (!currentUser) return;
    
    return Sentry.startSpan(
      {
        op: "ui.action",
        name: "Update BAC Calculation",
      },
      async (span) => {
        try {
          span.setAttribute("user_id", currentUser.id);
          
          const calculation = await drunkSafeService.calculateCurrentBAC(currentUser.id);
          setBacCalculation(calculation);
          setLastUpdated(new Date());
          
          span.setAttribute("bac_updated", true);
          span.setAttribute("current_bac", calculation.current_bac);
          span.setAttribute("safety_state", calculation.safety_state);
        } catch (error) {
          console.error('Failed to calculate BAC:', error);
          Sentry.captureException(error);
          span.setAttribute("bac_updated", false);
        }
      }
    );
  };

  const handleSaveProfile = async () => {
    return Sentry.startSpan(
      {
        op: "ui.click",
        name: "Save DrunkSafe Profile",
      },
      async (span) => {
        if (!currentUser) return;
        
        try {
          setProfileSaving(true);
          span.setAttribute("user_id", currentUser.id);
          span.setAttribute("tolerance_level", profileForm.tolerance_level);
          
          const thresholds = profileForm.tolerance_level === 'custom' 
            ? {
                safe_threshold: profileForm.safe_threshold,
                caution_threshold: profileForm.caution_threshold,
                danger_threshold: profileForm.danger_threshold
              }
            : drunkSafeService.getDefaultThresholds(profileForm.tolerance_level);

          const profileData = {
            user_id: currentUser.id,
            weight_kg: profileForm.weight_kg,
            gender: profileForm.gender,
            tolerance_level: profileForm.tolerance_level,
            safe_threshold: thresholds.safe,
            caution_threshold: thresholds.caution,
            danger_threshold: thresholds.danger
          };

          console.log('Saving profile data:', profileData);

          const savedProfile = await drunkSafeService.createToleranceProfile(profileData);
          console.log('Profile saved successfully:', savedProfile);
          
          setToleranceProfile(savedProfile);
          setShowProfileSetup(false);
          
          // Recalculate BAC with new profile
          await updateBACCalculation();
          
          // Haptic feedback
          if (navigator.vibrate) {
            navigator.vibrate(200);
          }
          
          span.setAttribute("profile_saved", true);
        } catch (error) {
          console.error('Failed to save profile:', error);
          Sentry.captureException(error);
          span.setAttribute("profile_saved", false);
          alert('Failed to save profile. Please try again.');
        } finally {
          setProfileSaving(false);
        }
      }
    );
  };

  const handleManualDrinkLog = async () => {
    return Sentry.startSpan(
      {
        op: "ui.click",
        name: "Log Manual Drink",
      },
      async (span) => {
        if (!currentUser || !manualDrink.name) return;
        
        try {
          span.setAttribute("user_id", currentUser.id);
          span.setAttribute("drink_name", manualDrink.name);
          span.setAttribute("volume_ml", manualDrink.volume_ml);
          span.setAttribute("abv_percentage", manualDrink.abv_percentage);
          
          await drunkSafeService.logDrinkConsumption({
            user_id: currentUser.id,
            drink_name: manualDrink.name,
            volume_ml: manualDrink.volume_ml,
            abv_percentage: manualDrink.abv_percentage
          });
          
          // Reset form
          setManualDrink({ name: '', volume_ml: 330, abv_percentage: 5.0 });
          
          // Update BAC calculation
          await updateBACCalculation();
          
          // Haptic feedback
          if (navigator.vibrate) {
            navigator.vibrate(100);
          }
          
          span.setAttribute("drink_logged", true);
        } catch (error) {
          console.error('Failed to log drink:', error);
          Sentry.captureException(error);
          span.setAttribute("drink_logged", false);
        }
      }
    );
  };

  const emergencyContacts = [
    { name: 'Sarah (Best Friend)', number: '+44 7700 900123', type: 'friend', icon: Heart },
    { name: 'Mum', number: '+44 7700 900456', type: 'family', icon: User },
    { name: 'Dad', number: '+44 7700 900789', type: 'family', icon: User },
    { name: 'Flatmate - Alex', number: '+44 7700 900321', type: 'friend', icon: Home }
  ];

  const getBACStatus = () => {
    if (!bacCalculation || !toleranceProfile) {
      return { 
        color: 'text-gray-400', 
        status: 'UNKNOWN', 
        bg: 'bg-gray-500', 
        ring: 'ring-gray-500',
        bgGlow: 'bg-gray-500/20',
        description: 'Set up your profile'
      };
    }

    const bac = bacCalculation.current_bac;
    const profile = toleranceProfile;

    if (bac < profile.safe_threshold) {
      return { 
        color: 'text-green-400', 
        status: 'SAFE', 
        bg: 'bg-green-500', 
        ring: 'ring-green-500',
        bgGlow: 'bg-green-500/20',
        description: 'You\'re doing great!'
      };
    } else if (bac < profile.caution_threshold) {
      return { 
        color: 'text-yellow-400', 
        status: 'CAUTION', 
        bg: 'bg-yellow-500', 
        ring: 'ring-yellow-500',
        bgGlow: 'bg-yellow-500/20',
        description: 'Slow down, drink water'
      };
    } else {
      return { 
        color: 'text-red-400', 
        status: 'DANGER', 
        bg: 'bg-red-500', 
        ring: 'ring-red-500',
        bgGlow: 'bg-red-500/20',
        description: 'Stop drinking, get help'
      };
    }
  };

  const handleEmergencyCall = () => {
    Sentry.startSpan(
      {
        op: "ui.click",
        name: "Emergency Button Press",
      },
      (span) => {
        setEmergencyPressed(true);
        if (navigator.vibrate) {
          navigator.vibrate([200, 100, 200]);
        }
        setTimeout(() => setEmergencyPressed(false), 2000);
        
        span.setAttribute("emergency_pressed", true);
      }
    );
  };

  const handleTrustedContact = (contact: any) => {
    Sentry.startSpan(
      {
        op: "ui.click",
        name: "Call Trusted Contact",
      },
      (span) => {
        if (navigator.vibrate) {
          navigator.vibrate(100);
        }
        console.log(`Calling ${contact.name} at ${contact.number}`);
        
        span.setAttribute("contact_name", contact.name);
        span.setAttribute("contact_type", contact.type);
      }
    );
  };

  const handleRideOrder = (service: string) => {
    Sentry.startSpan(
      {
        op: "ui.click",
        name: "Order Ride",
      },
      (span) => {
        if (navigator.vibrate) {
          navigator.vibrate(100);
        }
        console.log(`Ordering ${service} ride`);
        
        span.setAttribute("ride_service", service);
      }
    );
  };

  const handleShareLocation = () => {
    Sentry.startSpan(
      {
        op: "ui.click",
        name: "Share Location",
      },
      (span) => {
        if (navigator.vibrate) {
          navigator.vibrate(100);
        }
        console.log('Sharing location with emergency contacts');
        
        span.setAttribute("location_shared", true);
      }
    );
  };

  const bacStatus = getBACStatus();
  const budgetProgress = (spentTonight / budgetLimit) * 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-red-400/30 border-t-red-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-red-400">Initializing DrunkSafe™...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Simplified Header for Emergency Access */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-lg border-b border-red-500/30">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <Shield className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-red-400">DrunkSafe™</h1>
                <p className="text-xs text-gray-400">
                  AI-Powered Safety • Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProfileSetup(true)}
                className="text-gray-400 hover:text-white"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Link href="/explore">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  Exit
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Setup Modal */}
        {showProfileSetup && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="bg-gray-900 border-purple-500/30 max-w-md w-full">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-purple-400" />
                  Safety Profile Setup
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Personalize your DrunkSafe experience for accurate BAC calculations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Weight (kg)</label>
                  <Input
                    type="number"
                    value={profileForm.weight_kg}
                    onChange={(e) => setProfileForm({...profileForm, weight_kg: Number(e.target.value)})}
                    className="bg-gray-800 border-gray-600 text-white"
                    min="30"
                    max="200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Gender</label>
                  <Select value={profileForm.gender} onValueChange={(value: any) => setProfileForm({...profileForm, gender: value})}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Drinking Tolerance</label>
                  <Select value={profileForm.tolerance_level} onValueChange={(value: any) => {
                    const thresholds = drunkSafeService.getDefaultThresholds(value);
                    setProfileForm({
                      ...profileForm, 
                      tolerance_level: value,
                      safe_threshold: thresholds.safe,
                      caution_threshold: thresholds.caution,
                      danger_threshold: thresholds.danger
                    });
                  }}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Tolerance</SelectItem>
                      <SelectItem value="moderate">Moderate Tolerance</SelectItem>
                      <SelectItem value="high">High Tolerance</SelectItem>
                      <SelectItem value="custom">Custom Thresholds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {profileForm.tolerance_level === 'custom' && (
                  <div className="space-y-3 p-3 bg-gray-800/50 rounded-lg">
                    <h4 className="text-sm font-medium text-yellow-400">Custom BAC Thresholds</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-xs text-gray-400">Safe</label>
                        <Input
                          type="number"
                          step="0.001"
                          value={profileForm.safe_threshold}
                          onChange={(e) => setProfileForm({...profileForm, safe_threshold: Number(e.target.value)})}
                          className="bg-gray-700 border-gray-600 text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">Caution</label>
                        <Input
                          type="number"
                          step="0.001"
                          value={profileForm.caution_threshold}
                          onChange={(e) => setProfileForm({...profileForm, caution_threshold: Number(e.target.value)})}
                          className="bg-gray-700 border-gray-600 text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">Danger</label>
                        <Input
                          type="number"
                          step="0.001"
                          value={profileForm.danger_threshold}
                          onChange={(e) => setProfileForm({...profileForm, danger_threshold: Number(e.target.value)})}
                          className="bg-gray-700 border-gray-600 text-white text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowProfileSetup(false)}
                    className="flex-1 border-gray-600 text-gray-300"
                    disabled={profileSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveProfile}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    disabled={profileSaving || profileForm.weight_kg < 30 || profileForm.weight_kg > 200}
                  >
                    {profileSaving ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Saving...</span>
                      </div>
                    ) : (
                      'Save Profile'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* EMERGENCY SECTION - Most Prominent */}
        <Card className="bg-red-500/10 border-red-500/30 border-2">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-red-400 mb-6">EMERGENCY ACTIONS</h2>
              
              {/* 999 Emergency Button - Removed animate-pulse */}
              <Button
                onClick={handleEmergencyCall}
                className={`w-full h-20 text-2xl font-bold transition-all duration-200 ${
                  emergencyPressed 
                    ? 'bg-red-600 scale-95' 
                    : 'bg-red-500 hover:bg-red-600'
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

        {/* DYNAMIC BAC STATUS - Critical Information */}
        <Card className={`${bacStatus.bgGlow} border-2 ${bacStatus.ring.replace('ring-', 'border-')}`}>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center justify-center">
                <Activity className="h-6 w-6 mr-2 text-purple-400" />
                YOUR SAFETY STATUS
              </h3>
              
              <div className="relative">
                <div className={`text-6xl font-bold ${bacStatus.color} mb-2`}>
                  {bacStatus.status}
                </div>
                <div className="text-3xl font-mono text-white mb-2">
                  BAC: {bacCalculation?.current_bac.toFixed(3) || '0.000'}
                </div>
                <div className={`text-lg ${bacStatus.color} font-medium mb-4`}>
                  {bacStatus.description}
                </div>
                
                {bacCalculation && (
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
                    <div>
                      <div className="text-purple-400 font-medium">Drinks Tonight</div>
                      <div className="text-2xl font-bold text-white">{bacCalculation.drinks_consumed}</div>
                    </div>
                    <div>
                      <div className="text-purple-400 font-medium">Time Drinking</div>
                      <div className="text-2xl font-bold text-white">
                        {bacCalculation.time_since_first_drink.toFixed(1)}h
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* AI Recommendation */}
              {bacCalculation?.recommendation && (
                <div className="mt-4 p-4 bg-purple-500/20 rounded-lg border border-purple-500/30">
                  <div className="text-purple-400 font-medium mb-2 flex items-center justify-center">
                    <Brain className="h-4 w-4 mr-2" />
                    AI Recommendation
                  </div>
                  <div className="text-white text-sm">{bacCalculation.recommendation}</div>
                </div>
              )}

              {/* Manual Drink Logging */}
              <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
                <h4 className="text-white font-medium mb-3">Log a Drink Manually</h4>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <Input
                    placeholder="Drink name"
                    value={manualDrink.name}
                    onChange={(e) => setManualDrink({...manualDrink, name: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white text-sm"
                  />
                  <Input
                    type="number"
                    placeholder="Volume (ml)"
                    value={manualDrink.volume_ml}
                    onChange={(e) => setManualDrink({...manualDrink, volume_ml: Number(e.target.value)})}
                    className="bg-gray-700 border-gray-600 text-white text-sm"
                  />
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="ABV %"
                    value={manualDrink.abv_percentage}
                    onChange={(e) => setManualDrink({...manualDrink, abv_percentage: Number(e.target.value)})}
                    className="bg-gray-700 border-gray-600 text-white text-sm"
                  />
                </div>
                <Button
                  onClick={handleManualDrinkLog}
                  disabled={!manualDrink.name}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Log Drink
                </Button>
              </div>

              <Button
                onClick={updateBACCalculation}
                variant="outline"
                className="border-purple-500 text-purple-400 hover:bg-purple-500/20"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Refresh BAC Calculation
              </Button>
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
                  Personalized Safety Tips
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
              {bacCalculation && (
                <div className="p-4 bg-purple-500/20 rounded-lg border border-purple-500/30 mb-4">
                  <h4 className="text-purple-400 font-semibold mb-2">AI-Generated Recommendations</h4>
                  <div className="space-y-2">
                    {drunkSafeService.getSafetyRecommendations(
                      bacCalculation.current_bac,
                      bacCalculation.safety_state,
                      bacCalculation.drinks_consumed
                    ).map((tip, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                        <p className="text-sm text-gray-300">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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