'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Eye, EyeOff, Mail, Lock, Building, User, ArrowRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { authService } from '@/lib/auth';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<'customer' | 'business'>('customer');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { user } = await authService.signIn(formData.email, formData.password);
      
      if (user) {
        // Get user profile to determine redirect
        const currentUser = await authService.getCurrentUser();
        const redirectPath = currentUser?.user_type === 'business' ? '/dashboard' : '/explore';
        router.push(redirectPath);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

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
            <Link href="/" className="text-4xl font-bold gradient-text mb-2 block">
              Evepass
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
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center space-x-2 text-muted-foreground">
                    <input type="checkbox" className="rounded border-border" />
                    <span>Remember me</span>
                  </label>
                  <Link href="/auth/forgot-password" className="text-primary hover:text-primary/80">
                    Forgot password?
                  </Link>
                </div>

                <Button 
                  type="submit" 
                  className="w-full glass glow-green hover-lift"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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