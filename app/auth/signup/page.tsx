'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Eye, EyeOff, Mail, Lock, Building, User, ArrowRight, MapPin, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { authService } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState<'customer' | 'business'>('customer');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    postcode: '',
    music_preferences: '',
    business_name: '',
    business_type: '',
    phone: '',
    address: '',
    capacity: '',
    description: ''
  });
  const router = useRouter();

  // Check if Supabase is configured
  const supabaseConfigured = isSupabaseConfigured();

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number => {
    if (!dateOfBirth) return 0;
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Check if user is under 18
  const isUnderAge = (): boolean => {
    if (!formData.date_of_birth) return false;
    return calculateAge(formData.date_of_birth) < 18;
  };

  // Validate form data
  const validateForm = (): string | null => {
    // Check Supabase configuration first
    if (!supabaseConfigured) {
      return 'Database connection not configured. Please check your environment variables.';
    }

    // Password validation
    if (formData.password.length < 8) {
      return 'Password must be at least 8 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }

    // Age validation for customers
    if (userType === 'customer' && formData.date_of_birth) {
      const age = calculateAge(formData.date_of_birth);
      if (age < 18) {
        return 'You must be 18 or older to create an account';
      }
    }

    return null;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setIsLoading(false);
      return;
    }

    try {
      const userData = {
        user_type: userType,
        ...(userType === 'customer' ? {
          first_name: formData.first_name,
          last_name: formData.last_name,
          date_of_birth: formData.date_of_birth,
          postcode: formData.postcode,
          music_preferences: formData.music_preferences ? [formData.music_preferences] : []
        } : {
          business_name: formData.business_name,
          business_type: formData.business_type,
          phone: formData.phone,
          address: formData.address,
          postcode: formData.postcode,
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
          description: formData.description
        })
      };

      await authService.signUp(formData.email, formData.password, userData);
      
      // Redirect based on user type
      const redirectPath = userType === 'business' ? '/dashboard' : '/explore';
      router.push(redirectPath);
    } catch (err: any) {
      console.error('Signup error:', err);
      let errorMessage = 'Failed to create account';
      
      if (err.message) {
        if (err.message.includes('fetch')) {
          errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
        } else if (err.message.includes('Invalid API key')) {
          errorMessage = 'Database configuration error. Please contact support.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    // Validate current step before proceeding
    if (step === 1) {
      if (!formData.email || !formData.password || !formData.confirmPassword || !formData.first_name || !formData.last_name) {
        setError('Please fill in all required fields');
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }
    }
    
    setError('');
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength: strength * 20, label: 'Weak', color: 'bg-red-500' };
    if (strength <= 3) return { strength: strength * 20, label: 'Fair', color: 'bg-yellow-500' };
    if (strength <= 4) return { strength: strength * 20, label: 'Good', color: 'bg-blue-500' };
    return { strength: 100, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  // Show configuration warning if Supabase is not configured
  if (!supabaseConfigured) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-500">Configuration Required</CardTitle>
            <CardDescription>
              Supabase database connection is not configured
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-center space-x-2 text-red-500 mb-2">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Database Not Connected</span>
              </div>
              <p className="text-sm text-red-500/80">
                Please configure your Supabase environment variables in <code>.env.local</code>
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">Required environment variables:</p>
              <ul className="list-disc list-inside space-y-1 font-mono text-xs">
                <li>NEXT_PUBLIC_SUPABASE_URL</li>
                <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
              </ul>
            </div>
            <Button asChild className="w-full">
              <Link href="/">Return to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Background Image */}
      <div className="absolute inset-0 opacity-20 dark:opacity-10">
        <img 
          src="/AdobeStock_1498934077.jpeg" 
          alt="Nightlife background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-background/80" />
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/High-res PNG-01.png"
                alt="Evepass"
                width={200}
                height={60}
                className="h-12 w-auto"
              />
            </Link>
            <p className="text-muted-foreground">Join the ultimate nightlife experience</p>
          </div>

          <Card className="glass border-border/50 hover-lift">
            <CardHeader className="text-center">
              <CardTitle className="text-foreground">Create Account</CardTitle>
              <CardDescription className="text-muted-foreground">
                Step {step} of {userType === 'business' ? '3' : '2'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={userType} onValueChange={(value) => setUserType(value as 'customer' | 'business')} className="mb-6">
                <TabsList className="grid w-full grid-cols-2 glass border border-border/50">
                  <TabsTrigger value="customer" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                    <User className="h-4 w-4 mr-2" />
                    Customer
                  </TabsTrigger>
                  <TabsTrigger value="business" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                    <Building className="h-4 w-4 mr-2" />
                    Business
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center space-x-2 text-red-500">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <form onSubmit={handleSignup} className="space-y-4">
                {step === 1 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="pl-10 glass border-border/50"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-foreground">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a strong password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="pl-10 pr-10 glass border-border/50"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {formData.password && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Password strength:</span>
                            <span className={`font-medium ${
                              passwordStrength.label === 'Strong' ? 'text-green-500' :
                              passwordStrength.label === 'Good' ? 'text-blue-500' :
                              passwordStrength.label === 'Fair' ? 'text-yellow-500' : 'text-red-500'
                            }`}>
                              {passwordStrength.label}
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                              style={{ width: `${passwordStrength.strength}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          className="pl-10 pr-10 glass border-border/50"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {formData.confirmPassword && (
                        <div className="flex items-center space-x-2 text-xs">
                          {formData.password === formData.confirmPassword ? (
                            <>
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span className="text-green-500">Passwords match</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-3 w-3 text-red-500" />
                              <span className="text-red-500">Passwords do not match</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-foreground">First Name</Label>
                        <Input
                          id="firstName"
                          placeholder="John"
                          value={formData.first_name}
                          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                          className="glass border-border/50"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-foreground">Last Name</Label>
                        <Input
                          id="lastName"
                          placeholder="Doe"
                          value={formData.last_name}
                          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                          className="glass border-border/50"
                          required
                        />
                      </div>
                    </div>

                    <Button 
                      type="button" 
                      onClick={nextStep}
                      className="w-full glass glow-green hover-lift"
                    >
                      Continue
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </>
                )}

                {step === 2 && userType === 'customer' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth" className="text-foreground">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                        className="glass border-border/50"
                        required
                      />
                      {formData.date_of_birth && (
                        <div className="text-xs text-muted-foreground">
                          Age: {calculateAge(formData.date_of_birth)} years old
                          {isUnderAge() && (
                            <span className="text-red-500 ml-2">
                              (Must be 18 or older)
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="postcode" className="text-foreground">UK Postcode</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="postcode"
                          placeholder="SW1A 1AA"
                          value={formData.postcode}
                          onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                          className="pl-10 glass border-border/50"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="preferences" className="text-foreground">Music Preferences</Label>
                      <Select value={formData.music_preferences} onValueChange={(value) => setFormData({ ...formData, music_preferences: value })}>
                        <SelectTrigger className="glass border-border/50">
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
                        className="flex-1 glass border-border/50"
                      >
                        Back
                      </Button>
                      <Button 
                        type="submit" 
                        className="flex-1 glass glow-green hover-lift"
                        disabled={isLoading || isUnderAge()}
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
                      <Label htmlFor="businessName" className="text-foreground">Business Name</Label>
                      <Input
                        id="businessName"
                        placeholder="Your venue name"
                        value={formData.business_name}
                        onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                        className="glass border-border/50"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessType" className="text-foreground">Business Type</Label>
                      <Select value={formData.business_type} onValueChange={(value) => setFormData({ ...formData, business_type: value })}>
                        <SelectTrigger className="glass border-border/50">
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
                      <Label htmlFor="phone" className="text-foreground">Business Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+44 20 1234 5678"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="pl-10 glass border-border/50"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <Button 
                        type="button" 
                        onClick={prevStep}
                        variant="outline"
                        className="flex-1 glass border-border/50"
                      >
                        Back
                      </Button>
                      <Button 
                        type="button" 
                        onClick={nextStep}
                        className="flex-1 glass glow-green hover-lift"
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
                      <Label htmlFor="address" className="text-foreground">Business Address</Label>
                      <Textarea
                        id="address"
                        placeholder="Full business address including postcode"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="glass border-border/50"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="capacity" className="text-foreground">Venue Capacity</Label>
                      <Input
                        id="capacity"
                        type="number"
                        placeholder="Maximum capacity"
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                        className="glass border-border/50"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-foreground">Business Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your venue, atmosphere, and what makes it special"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="glass border-border/50"
                        required
                      />
                    </div>

                    <div className="flex space-x-3">
                      <Button 
                        type="button" 
                        onClick={prevStep}
                        variant="outline"
                        className="flex-1 glass border-border/50"
                      >
                        Back
                      </Button>
                      <Button 
                        type="submit" 
                        className="flex-1 glass glow-green hover-lift"
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
                <p className="text-muted-foreground text-sm">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="text-primary hover:text-primary/80 font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-xs">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-primary hover:text-primary/80">Terms</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-primary hover:text-primary/80">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}