'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const partners = [
  {
    name: 'Supabase',
    logo: '🗄️',
    description: 'Powers our real-time database backend and user authentication',
    color: 'bg-green-500'
  },
  {
    name: 'Bolt',
    logo: '🚗',
    description: 'Provides ride-hailing integration for safe transportation',
    color: 'bg-green-600'
  },
  {
    name: 'RevenueCat',
    logo: '💳',
    description: 'Handles in-app subscriptions and VIP tier management',
    color: 'bg-orange-500'
  },
  {
    name: 'ElevenLabs',
    logo: '🎤',
    description: 'Powers voice AI for spoken commands and responses',
    color: 'bg-purple-500'
  },
  {
    name: 'Tavus',
    logo: '📹',
    description: 'Enables video AI personas and conversational experiences',
    color: 'bg-blue-500'
  },
  {
    name: 'Netlify',
    logo: '🌐',
    description: 'Provides fast, secure hosting and deployment infrastructure',
    color: 'bg-teal-500'
  },
  {
    name: 'Algorand',
    logo: '⛓️',
    description: 'Blockchain receipts and tokenized ownership verification',
    color: 'bg-gray-700'
  },
  {
    name: 'Reddit',
    logo: '🤖',
    description: 'Community integration and social nightlife discussions',
    color: 'bg-orange-600'
  }
];

export function PartnerLogos() {
  const [hoveredPartner, setHoveredPartner] = useState<string | null>(null);

  return (
    <div className="py-16 bg-gradient-to-b from-transparent to-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Powered by Industry Leaders
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Built with cutting-edge technology from trusted partners to deliver the ultimate nightlife experience
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="relative group"
              onMouseEnter={() => setHoveredPartner(partner.name)}
              onMouseLeave={() => setHoveredPartner(null)}
            >
              <Card className="glass hover-lift cursor-pointer transition-all duration-200 hover:border-primary/20">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-2">{partner.logo}</div>
                  <div className="text-sm font-medium text-foreground">{partner.name}</div>
                </CardContent>
              </Card>
              
              {hoveredPartner === partner.name && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 fade-in">
                  <Card className="glass-dark border-primary/20 max-w-xs">
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${partner.color}`} />
                        <span className="font-medium text-foreground text-sm">{partner.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{partner.description}</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}