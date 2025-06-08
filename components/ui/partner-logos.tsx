'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Database, Zap, CreditCard, Mic, Video, 
  Globe, Coins, MessageSquare 
} from 'lucide-react'

const partners = [
  {
    name: 'Supabase',
    icon: Database,
    description: 'Powers our user and business database backend',
    color: 'text-green-500'
  },
  {
    name: 'Bolt',
    icon: Zap,
    description: 'Ride-hailing integration for safe transport',
    color: 'text-blue-500'
  },
  {
    name: 'RevenueCat',
    icon: CreditCard,
    description: 'Handles in-app subscriptions and VIP tiers',
    color: 'text-purple-500'
  },
  {
    name: 'ElevenLabs',
    icon: Mic,
    description: 'Voice AI for spoken commands and responses',
    color: 'text-orange-500'
  },
  {
    name: 'Tavus',
    icon: Video,
    description: 'Video AI for personalized experiences',
    color: 'text-pink-500'
  },
  {
    name: 'Netlify',
    icon: Globe,
    description: 'Deployment and hosting infrastructure',
    color: 'text-cyan-500'
  },
  {
    name: 'Algorand',
    icon: Coins,
    description: 'Blockchain receipts and secure transactions',
    color: 'text-yellow-500'
  },
  {
    name: 'Reddit',
    icon: MessageSquare,
    description: 'Community integration and social features',
    color: 'text-red-500'
  }
]

export function PartnerLogos() {
  return (
    <div className="py-16 bg-muted/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Trusted by Industry Leaders</h2>
          <p className="text-muted-foreground">
            Powered by the world's most innovative technology partners
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {partners.map((partner) => (
            <Card 
              key={partner.name} 
              className="glass border-border/50 hover-lift group cursor-pointer"
            >
              <CardContent className="p-4 text-center">
                <div className={`inline-flex p-3 rounded-lg bg-background/50 mb-3 group-hover:scale-110 transition-transform ${partner.color}`}>
                  <partner.icon className="h-6 w-6" />
                </div>
                <h3 className="font-medium text-foreground mb-1">{partner.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {partner.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}