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
    category: 'AI Technology',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  },
  {
    icon: Shield,
    title: 'DrunkSafe™ Technology',
    description: 'Real-time safety monitoring and smart intervention systems',
    category: 'Safety',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10'
  },
  {
    icon: CreditCard,
    title: 'Seamless Payments',
    description: 'Order drinks with card or cash verification codes',
    category: 'Payments',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10'
  },
  {
    icon: Calendar,
    title: 'Smart Night Planning',
    description: 'AI-powered itinerary creation and venue recommendations',
    category: 'Planning',
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10'
  },
  {
    icon: Users,
    title: 'Social Integration',
    description: 'Connect with friends and discover popular venues',
    category: 'Social',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10'
  },
  {
    icon: Star,
    title: 'Premium Venues',
    description: 'Access to exclusive clubs and VIP experiences',
    category: 'Venues',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10'
  }
];

export function FeatureGrid() {
  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Revolutionary Nightlife Features</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Experience the future of nightlife with AI-powered safety, seamless ordering, and intelligent planning
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className="glass border-border/50 hover-lift group">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <IconComponent className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-foreground">{feature.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary" className="bg-primary/20 text-primary">
                    {feature.category}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}