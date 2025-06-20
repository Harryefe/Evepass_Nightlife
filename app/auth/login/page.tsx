'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Eye, EyeOff, Mail, Lock, Building, User, ArrowRight, AlertCircle, Loader2, Wifi, WifiOff } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { authService } from '@/lib/auth';
import { isSupabaseConfigured, testSupabaseConnection } from '@/lib/supabase';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<'customer' | 'business'>('customer');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'testing' | 'connected' | 'failed'>('unknown');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const router = useRouter();

  // Check if Supabase is configured
  const supabaseConfigured = isSupabaseConfigured();

  // Test connection function
  const testConnection = async () => {
    setConnectionStatus('testing');
    try {
      const result = await testSupabaseConnection();
      if (result.success) {
        setConnectionStatus('connected');
        setError('');
      } else {
        setConnectionStatus('failed');
        setError(result.error || 'Connection test failed');
      }
    } catch (error: any) {
      setConnectionStatus('failed');
      setError(error.message || 'Connection test failed');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Check Supabase configuration first
    if (!supabaseConfigured) {
      setError('Database connection not configured. Please check your environment variables.');
      setIsLoading(false);
      return;
    }

    try {
      const { user } = await authService.signIn(formData.email, formData.password);
      
      if (user) {
        // Get user profile to determine redirect
        const currentUser = await authService.getCurrentUser();
        const redirectPath = currentUser?.user_type === 'business' ? '/dashboard' : '/explore';
        router.push(redirectPath);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      
      let errorMessage = 'Failed to sign in';
      
      if (err.message) {
        // Use the error message directly since auth service now provides user-friendly messages
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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
            <p className="text-muted-foreground">Welcome back to the night</p>
          </div>

          <Card className="glass border-border/50 hover-lift">
            <CardHeader className="text-center">
              <CardTitle className="text-foreground">Sign In</CardTitle>
              <CardDescription className="text-muted-foreground">
                Access your nightlife dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Connection Status */}
              <div className="mb-4 p-3 rounded-lg bg-muted/20 border border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {connectionStatus === 'connected' ? (
                      <Wifi className="h-4 w-4 text-green-500" />
                    ) : connectionStatus === 'failed' ? (
                      <WifiOff className="h-4 w-4 text-red-500" />
                    ) : connectionStatus === 'testing' ? (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    ) : (
                      <Wifi className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="text-sm text-muted-foreground">
                      {connectionStatus === 'connected' ? 'Connected' :
                       connectionStatus === 'failed' ? 'Connection Failed' :
                       connectionStatus === 'testing' ? 'Testing...' : 'Connection Status'}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={testConnection}
                    disabled={connectionStatus === 'testing'}
                    className="text-xs"
                  >
                    Test Connection
                  </Button>
                </div>
              </div>

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

              <form onSubmit={handleLogin} className="space-y-4">
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
                      disabled={isLoading}
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
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10 pr-10 glass border-border/50"
                      required
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center space-x-2 text-muted-foreground">
                    <input type="checkbox" className="rounded border-border" disabled={isLoading} />
                    <span>Remember me</span>
                  </label>
                  <Link href="/auth/forgot-password" className="text-primary hover:text-primary/80">
                    Forgot password?
                  </Link>
                </div>

                <Button 
                  type="submit" 
                  className="w-full glass glow-green hover-lift"
                  disabled={isLoading || connectionStatus === 'failed'}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>Sign In</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-muted-foreground text-sm">
                  Don't have an account?{' '}
                  <Link href="/auth/signup" className="text-primary hover:text-primary/80 font-medium">
                    Sign up
                  </Link>
                </p>
              </div>

              {userType === 'business' && (
                <div className="mt-4 p-3 glass rounded-lg border border-primary/20">
                  <div className="flex items-center space-x-2 text-sm text-primary">
                    <Building className="h-4 w-4" />
                    <span>Business account includes venue management, analytics, and payment processing</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-xs">
              By signing in, you agree to our{' '}
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