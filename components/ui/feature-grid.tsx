'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bot, CreditCard, Shield, MapPin, Calendar, Zap, 
  Trophy, Users, Star, ArrowRight, ExternalLink
} from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    id: 'ai-assistant',
    icon: Bot,
    title: 'Eve AI Assistant',
    description: 'Conversational AI with voice commands for venue discovery and night planning',
    status: 'Live',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    link: '/ai-assistant'
  },
  {
    id: 'ordering',
    icon: CreditCard,
    title: 'Real-Time Ordering',
    description: 'Order drinks and food directly from your table with secure payments',
    status: 'Live',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    link: '/menu/fabric-london'
  },
  {
    id: 'safety',
    icon: Shield,
    title: 'DrunkSafe™ Suite',
    description: 'BAC calculator, budget alerts, ride scheduling, and emergency features',
    status: 'Live',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    link: '/safety'
  },
  {
    id: 'discovery',
    icon: MapPin,
    title: 'Smart Discovery',
    description: 'Find venues by UK postcode with real-time availability and AI recommendations',
    status: 'Live',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    link: '/explore'
  },
  {
    id: 'planner',
    icon: Calendar,
    title: 'AI Night Planner',
    description: 'Intelligent route planning across multiple venues with optimal timing',
    status: 'Live',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    link: '/planner'
  },
  {
    id: 'gamification',
    icon: Trophy,
    title: 'Gamified Rewards',
    description: 'Earn points, unlock VIP tiers, and compete on leaderboards',
    status: 'Coming Soon',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    link: null
  },
  {
    id: 'social',
    icon: Users,
    title: 'Social Reviews',
    description: 'Share experiences with photos and help others discover gems',
    status: 'Beta',
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
    link: null
  },
  {
    id: 'vip',
    icon: Star,
    title: 'VIP Access',
    description: 'Skip queues, exclusive events, and member-only benefits',
    status: 'Premium',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    link: null
  }
];

export function FeatureGrid() {
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Live': return 'bg-green-500 text-white';
      case 'Beta': return 'bg-blue-500 text-white';
      case 'Coming Soon': return 'bg-orange-500 text-white';
      case 'Premium': return 'bg-purple-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Revolutionary Nightlife Experience
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From AI-powered discovery to secure cash payments, we've reimagined every aspect of nightlife
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <Card 
                key={feature.id}
                className="glass hover-lift cursor-pointer transition-all duration-300 group border-border/50 hover:border-primary/20"
                onMouseEnter={() => setHoveredFeature(feature.id)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg ${feature.bgColor}`}>
                      <IconComponent className={`h-5 w-5 ${feature.color}`} />
                    </div>
                    <Badge className={`text-xs ${getStatusColor(feature.status)}`}>
                      {feature.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                
                {feature.link && (
                  <CardContent className="pt-0">
                    <Link href={feature.link}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-between group-hover:bg-primary/10 transition-colors"
                      >
                        Try it out
                        <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                )}
                
                {!feature.link && (
                  <CardContent className="pt-0">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      disabled
                      className="w-full justify-between opacity-50"
                    >
                      {feature.status === 'Coming Soon' ? 'Coming Soon' : 'Learn More'}
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}