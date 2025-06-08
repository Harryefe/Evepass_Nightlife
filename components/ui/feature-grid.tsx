'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, Shield, CreditCard, Calendar, Users, Star, 
  MapPin, Clock, Zap, Heart, Navigation, ShoppingCart
} from 'lucide-react';

const features = [
  {
    icon: Bot,
    title: 'Eve AI Assistant',
    description: 'Your personal nightlife companion powered by advanced AI',
    badge: 'AI Powered',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  },
  {
    icon: Shield,
    title: 'DrunkSafe™ Technology',
    description: 'Real-time safety monitoring and smart intervention',
    badge: 'Safety First',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10'
  },
  {
    icon: CreditCard,
    title: 'Seamless Payments',
    description: 'Order drinks with card or cash verification codes',
    badge: 'Secure',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10'
  },
  {
    icon: Calendar,
    title: 'Smart Planning',
    description: 'AI-powered night planning with venue recommendations',
    badge: 'Intelligent',
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10'
  },
  {
    icon: Users,
    title: 'Social Features',
    description: 'Connect with friends and discover new experiences',
    badge: 'Social',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10'
  },
  {
    icon: Star,
    title: 'Premium Venues',
    description: 'Access to exclusive venues and VIP experiences',
    badge: 'Exclusive',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10'
  }
];

export function FeatureGrid() {
  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need for the Perfect Night
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From AI-powered recommendations to safety monitoring, Evepass has every aspect of your nightlife covered
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="glass border-border/50 hover-lift group">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${feature.bgColor}`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <Badge variant="secondary" className="bg-primary/20 text-primary">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-foreground group-hover:text-primary transition-colors">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}