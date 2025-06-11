'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { PartnerLogos } from '@/components/ui/partner-logos';
import { FeatureGrid } from '@/components/ui/feature-grid';
import { MapPin, Calendar, Users, Shield, Trophy, Star, Bot, Zap, CreditCard, Menu, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const [userType, setUserType] = useState<'customer' | 'business' | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center">
                <Image
                  src="/High-res PNG-01.png"
                  alt="Evepass"
                  width={150}
                  height={45}
                  className="h-8 w-auto"
                  priority
                />
              </Link>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-6">
                <Link href="/explore" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Explore
                </Link>
                <Link href="/ai-assistant" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  AI Assistant
                </Link>
                <Link href="/safety" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  DrunkSafe™
                </Link>
                <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Business
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <div className="hidden md:flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="glass glow-green">
                    Get Started
                  </Button>
                </Link>
              </div>
              
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border/50 py-4 space-y-2">
              <Link href="/explore" className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                Explore
              </Link>
              <Link href="/ai-assistant" className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                AI Assistant
              </Link>
              <Link href="/safety" className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                DrunkSafe™
              </Link>
              <Link href="/dashboard" className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                Business
              </Link>
              <div className="flex space-x-2 px-3 pt-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="w-full glass glow-green">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section with Banner */}
      <div className="relative overflow-hidden">
        {/* Hero Banner Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/AdobeStock_1498934077.jpeg" 
            alt="Evepass Nightlife Platform"
            className="w-full h-full object-cover opacity-20 dark:opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-background/80" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center fade-in">
            <div className="mb-8">
              <Image
                src="/High-res PNG-01.png"
                alt="Evepass"
                width={400}
                height={120}
                className="mx-auto h-20 md:h-28 w-auto"
                priority
              />
            </div>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              The UK's Premier AI-Powered Nightlife Platform
            </p>
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
              Discover venues, order drinks, plan epic nights, stay safe, and unlock exclusive experiences with Eve AI
            </p>
            
            {!userType && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg" 
                  className="glass glow-green hover-lift px-8 py-4 text-lg font-medium"
                  onClick={() => setUserType('customer')}
                >
                  I'm Looking for a Night Out
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="glass hover-lift px-8 py-4 text-lg font-medium"
                  onClick={() => setUserType('business')}
                >
                  I Own a Venue
                </Button>
              </div>
            )}

            {userType && (
              <div className="space-y-4 fade-in">
                <div className="flex justify-center gap-4">
                  <Link href={userType === 'customer' ? '/auth/signup' : '/auth/signup'}>
                    <Button 
                      size="lg" 
                      className="glass glow-green hover-lift px-8 py-4 text-lg font-medium"
                    >
                      {userType === 'customer' ? 'Start Your Journey' : 'Join as Partner'}
                    </Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="glass hover-lift px-8 py-4 text-lg font-medium"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Button 
                    size="lg" 
                    variant="ghost" 
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => setUserType(null)}
                  >
                    Back
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Partner Logos Section */}
      <PartnerLogos />

      {/* Features Grid */}
      <FeatureGrid />

      {/* Technology Stack */}
      <div className="py-20 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powered by Cutting-Edge Technology</h2>
            <p className="text-muted-foreground text-lg">Built with the latest AI and blockchain technologies</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-2xl md:text-3xl font-bold text-green-500 mb-2 group-hover:scale-110 transition-transform">ElevenLabs</div>
              <div className="text-muted-foreground text-sm">Voice AI</div>
            </div>
            <div className="group">
              <div className="text-2xl md:text-3xl font-bold text-blue-500 mb-2 group-hover:scale-110 transition-transform">Tavus</div>
              <div className="text-muted-foreground text-sm">Video AI</div>
            </div>
            <div className="group">
              <div className="text-2xl md:text-3xl font-bold text-emerald-500 mb-2 group-hover:scale-110 transition-transform">Supabase</div>
              <div className="text-muted-foreground text-sm">Real-time Database</div>
            </div>
            <div className="group">
              <div className="text-2xl md:text-3xl font-bold text-purple-500 mb-2 group-hover:scale-110 transition-transform">Algorand</div>
              <div className="text-muted-foreground text-sm">Blockchain Receipts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-3xl md:text-4xl font-bold text-purple-500 mb-2 group-hover:scale-110 transition-transform">2,500+</div>
              <div className="text-muted-foreground">Partner Venues</div>
            </div>
            <div className="group">
              <div className="text-3xl md:text-4xl font-bold text-pink-500 mb-2 group-hover:scale-110 transition-transform">150K+</div>
              <div className="text-muted-foreground">Night Plans Created</div>
            </div>
            <div className="group">
              <div className="text-3xl md:text-4xl font-bold text-yellow-500 mb-2 group-hover:scale-110 transition-transform">98%</div>
              <div className="text-muted-foreground">Safety Score</div>
            </div>
            <div className="group">
              <div className="text-3xl md:text-4xl font-bold text-green-500 mb-2 group-hover:scale-110 transition-transform">4.9★</div>
              <div className="text-muted-foreground">User Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-muted/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Nightlife?</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of venues and party-goers already using Evepass
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="glass glow-green hover-lift px-8 py-4 text-lg font-medium">
                Start Your Night
              </Button>
            </Link>
            <Link href="/ai-assistant">
              <Button size="lg" variant="outline" className="glass hover-lift px-8 py-4 text-lg font-medium">
                <Bot className="h-5 w-5 mr-2" />
                Try Eve AI
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Image
                src="/High-res PNG-01.png"
                alt="Evepass"
                width={120}
                height={36}
                className="h-6 w-auto"
              />
            </div>
            <div className="flex space-x-6 text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Support</a>
              <a href="#" className="hover:text-foreground transition-colors">API</a>
            </div>
          </div>
          <div className="text-center text-muted-foreground mt-8">
            © 2025 Evepass. All rights reserved. Built for the UK nightlife scene with AI and blockchain technology.
          </div>
        </div>
      </footer>
    </div>
  );
}