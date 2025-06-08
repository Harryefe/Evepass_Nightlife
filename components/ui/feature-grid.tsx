'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Bot, CreditCard, Shield, MapPin, Calendar, Zap, 
  Trophy, Users, Star 
} from 'lucide-react'

const features = [
  {
    icon: Bot,
    title: 'Eve AI Assistant',
    description: 'Conversational AI with voice commands for venue discovery and night planning',
    color: 'text-purple-500',
    glow: 'glow-purple'
  },
  {
    icon: CreditCard,
    title: 'Real-Time Ordering',
    description: 'Order drinks and food directly from your table with secure card or cash payments',
    color: 'text-pink-500',
    glow: 'glow-pink'
  },
  {
    icon: Shield,
    title: 'Secure Cash Verification',
    description: 'Dual-confirmation system with QR codes for fraud-proof cash transactions',
    color: 'text-green-500',
    glow: 'glow-green'
  },
  {
    icon: MapPin,
    title: 'Smart Discovery',
    description: 'Find venues by UK postcode with real-time availability and AI recommendations',
    color: 'text-purple-500',
    glow: 'glow-purple'
  },
  {
    icon: Calendar,
    title: 'AI Night Planner',
    description: 'Intelligent route planning across multiple venues with optimal timing',
    color: 'text-yellow-500',
    glow: 'glow-yellow'
  },
  {
    icon: Zap,
    title: 'DrunkSafe™ Suite',
    description: 'BAC calculator, budget alerts, ride scheduling, and emergency features',
    color: 'text-blue-500',
    glow: 'glow-blue'
  },
  {
    icon: Trophy,
    title: 'Gamified Rewards',
    description: 'Earn points, unlock VIP tiers, and compete on leaderboards',
    color: 'text-yellow-500',
    glow: 'glow-yellow'
  },
  {
    icon: Users,
    title: 'Social Reviews',
    description: 'Share experiences with photos and help others discover gems',
    color: 'text-purple-500',
    glow: 'glow-purple'
  },
  {
    icon: Star,
    title: 'VIP Access',
    description: 'Skip queues, exclusive events, and member-only benefits',
    color: 'text-pink-500',
    glow: 'glow-pink'
  }
]

export function FeatureGrid() {
  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Revolutionary Nightlife Experience</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From AI-powered discovery to secure cash payments, we've reimagined every aspect of nightlife
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className={`glass border-border/50 hover-lift ${feature.glow}`}>
              <CardHeader>
                <div className={`inline-flex p-3 rounded-lg bg-background/50 mb-4 ${feature.color}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-foreground">{feature.title}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}