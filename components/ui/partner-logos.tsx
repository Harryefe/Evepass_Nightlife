'use client';

import { Card } from '@/components/ui/card';

const partners = [
  { name: 'Fabric London', logo: '🎵' },
  { name: 'Ministry of Sound', logo: '🎧' },
  { name: 'XOYO', logo: '✨' },
  { name: 'Printworks', logo: '🏭' },
  { name: 'The Shard', logo: '🏢' },
  { name: 'Sky Garden', logo: '🌿' }
];

export function PartnerLogos() {
  return (
    <div className="py-16 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-4">Trusted by London's Premier Venues</h2>
          <p className="text-muted-foreground">Join the network of top nightlife destinations</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {partners.map((partner, index) => (
            <Card key={index} className="glass border-border/50 hover-lift group">
              <div className="p-6 text-center">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                  {partner.logo}
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  {partner.name}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}