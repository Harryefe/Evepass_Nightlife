'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, Mail, Lock, Building, User, ArrowRight, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<'customer' | 'business'>('customer');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate signup process
    setTimeout(() => {
      setIsLoading(false);
      // Redirect based on user type
      window.location.href = userType === 'customer' ? '/explore' : '/dashboard';
    }, 2000);
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black flex items-center justify-center p-4">
      {/* Background Image */}
      <div className="absolute inset-0 opacity-20">
        <img 
          src="/AdobeStock_1498934077.jpeg" 
          alt="Nightlife background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-slate-900/80 to-black/80" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Evepass
          </h1>
          <p className="text-gray-400">Join the ultimate nightlife experience</p>
        </div>

        <Card className="bg-white/10 border-purple-500/20 backdrop-blur-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-white">Create Account</CardTitle>
            <CardDescription className="text-gray-400">
              Step {step} of {userType === 'business' ? '3' : '2'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={userType} onValueChange={(value) => setUserType(value as 'customer' | 'business')} className="mb-6">
              <TabsList className="grid w-full grid-cols-2 bg-white/5">
                <TabsTrigger value="customer" className="data-[state=active]:bg-purple-600">
                  <User className="h-4 w-4 mr-2" />
                  Customer
                </TabsTrigger>
                <TabsTrigger value="business" className="data-[state=active]:bg-pink-600">
                  <Building className="h-4 w-4 mr-2" />
                  Business
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <form onSubmit={handleSignup} className="space-y-4">
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email\" className="text-gray-300">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10 bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-300">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        className="pl-10 pr-10 bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-gray-300">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        className="bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-gray-300">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        className="bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400"
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="button" 
                    onClick={nextStep}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </>
              )}

              {step === 2 && userType === 'customer' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-gray-300">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      className="bg-white/10 border-purple-500/30 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postcode" className="text-gray-300">UK Postcode</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="postcode"
                        placeholder="SW1A 1AA"
                        className="pl-10 bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferences" className="text-gray-300">Music Preferences</Label>
                    <Select>
                      <SelectTrigger className="bg-white/10 border-purple-500/30 text-white">
                        <SelectValue placeholder="Select your favorite genres" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electronic">Electronic</SelectItem>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="techno">Techno</SelectItem>
                        <SelectItem value="hiphop">Hip Hop</SelectItem>
                        <SelectItem value="rnb">R&B</SelectItem>
                        <SelectItem value="pop">Pop</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex space-x-3">
                    <Button 
                      type="button" 
                      onClick={prevStep}
                      variant="outline"
                      className="flex-1 border-gray-500 text-gray-300"
                    >
                      Back
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Creating...</span>
                        </div>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </div>
                </>
              )}

              {step === 2 && userType === 'business' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="businessName" className="text-gray-300">Business Name</Label>
                    <Input
                      id="businessName"
                      placeholder="Your venue name"
                      className="bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessType" className="text-gray-300">Business Type</Label>
                    <Select>
                      <SelectTrigger className="bg-white/10 border-purple-500/30 text-white">
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nightclub">Nightclub</SelectItem>
                        <SelectItem value="bar">Bar</SelectItem>
                        <SelectItem value="cocktail-bar">Cocktail Bar</SelectItem>
                        <SelectItem value="restaurant">Restaurant</SelectItem>
                        <SelectItem value="event-space">Event Space</SelectItem>
                        <SelectItem value="rooftop">Rooftop Venue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-300">Business Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+44 20 1234 5678"
                        className="pl-10 bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button 
                      type="button" 
                      onClick={prevStep}
                      variant="outline"
                      className="flex-1 border-gray-500 text-gray-300"
                    >
                      Back
                    </Button>
                    <Button 
                      type="button" 
                      onClick={nextStep}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      Continue
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </>
              )}

              {step === 3 && userType === 'business' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-gray-300">Business Address</Label>
                    <Textarea
                      id="address"
                      placeholder="Full business address including postcode"
                      className="bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="capacity" className="text-gray-300">Venue Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      placeholder="Maximum capacity"
                      className="bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-gray-300">Business Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your venue, atmosphere, and what makes it special"
                      className="bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400"
                      required
                    />
                  </div>

                  <div className="flex space-x-3">
                    <Button 
                      type="button" 
                      onClick={prevStep}
                      variant="outline"
                      className="flex-1 border-gray-500 text-gray-300"
                    >
                      Back
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Creating...</span>
                        </div>
                      ) : (
                        'Create Business Account'
                      )}
                    </Button>
                  </div>
                </>
              )}
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-xs">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="text-purple-400 hover:text-purple-300">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-purple-400 hover:text-purple-300">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}