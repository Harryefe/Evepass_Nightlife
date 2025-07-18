'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { AuthGuard } from '@/components/auth/auth-guard';
import { MapPin, Clock, Users, Star, Heart, Filter, Search, Calendar, Navigation, Bot, ShoppingCart, LogOut, Wine, Music, Share2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { authService } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import * as Sentry from '@sentry/nextjs';

// Define interfaces for type safety
interface Venue {
  id: number;
  name: string;
  type: string;
  location: string;
  rating: number;
  priceRange: string;
  image: string;
  openUntil: string;
  capacity: number;
  genres: string[];
  distance: string;
  currentEvent: string;
  bookingAvailable: boolean;
  popularWith: string;
  hasMenu: boolean;
  hasSocialFeatures: boolean; // New field for social features
}

// Demo venues for fresh user experience
const mockVenues: Venue[] = [
  {
    id: 1,
    name: "Fabric",
    type: "Nightclub",
    location: "London, EC1A 9JQ",
    rating: 4.8,
    priceRange: "£££",
    image: "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg",
    openUntil: "6:00 AM",
    capacity: 2500,
    genres: ["Electronic", "Techno", "House"],
    distance: "0.5 miles",
    currentEvent: "Saturday Night Sessions",
    bookingAvailable: true,
    popularWith: "25-35 age group",
    hasMenu: true,
    hasSocialFeatures: true
  },
  {
    id: 2,
    name: "Ministry of Sound",
    type: "Nightclub",
    location: "London, SE1 1YG",
    rating: 4.7,
    priceRange: "£££",
    image: "https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg",
    openUntil: "5:00 AM",
    capacity: 1800,
    genres: ["House", "Electronic", "Dance"],
    distance: "1.2 miles",
    currentEvent: "House Nation",
    bookingAvailable: true,
    popularWith: "22-30 age group",
    hasMenu: true,
    hasSocialFeatures: true
  },
  {
    id: 3,
    name: "The Shard View Bar",
    type: "Cocktail Bar",
    location: "London, SE1 9SG",
    rating: 4.9,
    priceRange: "££££",
    image: "https://images.pexels.com/photos/274192/pexels-photo-274192.jpeg",
    openUntil: "2:00 AM",
    capacity: 150,
    genres: ["Lounge", "Jazz", "Ambient"],
    distance: "0.8 miles",
    currentEvent: "Friday Jazz Night",
    bookingAvailable: true,
    popularWith: "28-40 age group",
    hasMenu: true,
    hasSocialFeatures: true
  },
  {
    id: 4,
    name: "Printworks",
    type: "Event Space",
    location: "London, SE16 4RT",
    rating: 4.6,
    priceRange: "££",
    image: "https://images.pexels.com/photos/1540338/pexels-photo-1540338.jpeg",
    openUntil: "4:00 AM",
    capacity: 3000,
    genres: ["Techno", "Electronic", "Industrial"],
    distance: "2.1 miles",
    currentEvent: "Underground Sessions",
    bookingAvailable: false,
    popularWith: "20-32 age group",
    hasMenu: false,
    hasSocialFeatures: false
  },
  {
    id: 5,
    name: "Cargo",
    type: "Live Music Venue",
    location: "London, EC2A 3AY",
    rating: 4.5,
    priceRange: "££",
    image: "https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg",
    openUntil: "3:00 AM",
    capacity: 800,
    genres: ["Live Music", "Indie", "Alternative"],
    distance: "1.5 miles",
    currentEvent: "Indie Rock Night",
    bookingAvailable: true,
    popularWith: "23-35 age group",
    hasMenu: true,
    hasSocialFeatures: true
  },
  {
    id: 6,
    name: "Sky Garden",
    type: "Rooftop Bar",
    location: "London, EC3M 8AF",
    rating: 4.4,
    priceRange: "£££",
    image: "https://images.pexels.com/photos/696218/pexels-photo-696218.jpeg",
    openUntil: "1:00 AM",
    capacity: 300,
    genres: ["Lounge", "Cocktails", "Views"],
    distance: "0.7 miles",
    currentEvent: "Sunset Sessions",
    bookingAvailable: true,
    popularWith: "25-40 age group",
    hasMenu: true,
    hasSocialFeatures: true
  }
];

function ExplorePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState('All');
  const [currentLocation, setCurrentLocation] = useState('London, UK');
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>(mockVenues);
  const [favoriteVenues, setFavoriteVenues] = useState<Set<number>>(new Set());
  const router = useRouter();

  useEffect(() => {
    let filtered = mockVenues;
    
    if (searchTerm) {
      filtered = filtered.filter(venue => 
        venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venue.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedGenre !== 'All') {
      filtered = filtered.filter(venue => 
        venue.genres.includes(selectedGenre)
      );
    }
    
    if (selectedPrice !== 'All') {
      filtered = filtered.filter(venue => venue.priceRange === selectedPrice);
    }
    
    setFilteredVenues(filtered);
  }, [searchTerm, selectedGenre, selectedPrice]);

  const handleSignOut = async () => {
    return Sentry.startSpan(
      {
        op: "ui.click",
        name: "Customer Sign Out",
      },
      async (span) => {
        try {
          await authService.signOut();
          router.push('/');
          span.setAttribute("signout_success", true);
        } catch (error) {
          console.error('Sign out failed:', error);
          Sentry.captureException(error);
          span.setAttribute("signout_success", false);
        }
      }
    );
  };

  const toggleFavorite = (venueId: number) => {
    return Sentry.startSpan(
      {
        op: "ui.click",
        name: "Toggle Venue Favorite",
      },
      (span) => {
        const newFavorites = new Set(favoriteVenues);
        if (newFavorites.has(venueId)) {
          newFavorites.delete(venueId);
          span.setAttribute("action", "unfavorite");
        } else {
          newFavorites.add(venueId);
          span.setAttribute("action", "favorite");
        }
        setFavoriteVenues(newFavorites);
        span.setAttribute("venue_id", venueId);
      }
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <Image
                src="/High-res PNG-01.png"
                alt="Evepass"
                width={150}
                height={45}
                className="h-8 w-auto"
              />
            </Link>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Navigation className="h-4 w-4 mr-2" />
                {currentLocation}
              </Button>
              <Link href="/social">
                <Button variant="outline" size="sm" className="glass glow-purple">
                  <Share2 className="h-4 w-4 mr-2" />
                  Social Hub
                </Button>
              </Link>
              <Link href="/ai-assistant">
                <Button variant="outline" size="sm" className="glass glow-blue">
                  <Bot className="h-4 w-4 mr-2" />
                  Ask Eve AI
                </Button>
              </Link>
              <Link href="/planner">
                <Button variant="outline" size="sm" className="glass">
                  Night Planner
                </Button>
              </Link>
              <Link href="/safety">
                <Button size="sm" className="glass glow-green">
                  DrunkSafe™
                </Button>
              </Link>
              <ThemeToggle />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message for New Users */}
        <div className="mb-8 p-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg border border-purple-500/30">
          <h1 className="text-2xl font-bold text-foreground mb-2">Welcome to Evepass! 🎉</h1>
          <p className="text-muted-foreground mb-4">
            Discover amazing venues, order drinks with QR codes, plan your perfect night, and stay safe with DrunkSafe™. 
            Your nightlife journey starts here!
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/social">
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Share2 className="h-4 w-4 mr-2" />
                Explore Social Features
              </Button>
            </Link>
            <Link href="/ai-assistant">
              <Button variant="outline" className="border-blue-500 text-blue-500">
                <Bot className="h-4 w-4 mr-2" />
                Chat with Eve AI
              </Button>
            </Link>
            <Link href="/safety">
              <Button variant="outline" className="border-green-500 text-green-500">
                <span className="mr-2">🛡️</span>
                Setup DrunkSafe™
              </Button>
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search venues, events, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 glass border-border/50"
              />
            </div>
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="w-full md:w-48 glass border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Genres</SelectItem>
                <SelectItem value="Electronic">Electronic</SelectItem>
                <SelectItem value="House">House</SelectItem>
                <SelectItem value="Techno">Techno</SelectItem>
                <SelectItem value="Live Music">Live Music</SelectItem>
                <SelectItem value="Jazz">Jazz</SelectItem>
                <SelectItem value="Lounge">Lounge</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPrice} onValueChange={setSelectedPrice}>
              <SelectTrigger className="w-full md:w-32 glass border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Prices</SelectItem>
                <SelectItem value="£">£</SelectItem>
                <SelectItem value="££">££</SelectItem>
                <SelectItem value="£££">£££</SelectItem>
                <SelectItem value="££££">££££</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Venues Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVenues.map((venue) => (
            <Card key={venue.id} className="glass border-border/50 hover-lift group cursor-pointer">
              <div className="relative">
                <img 
                  src={venue.image} 
                  alt={venue.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="absolute top-3 right-3">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => toggleFavorite(venue.id)}
                    className={`glass ${favoriteVenues.has(venue.id) ? 'bg-red-500/20 text-red-400' : 'hover:bg-red-500/20'}`}
                  >
                    <Heart className={`h-4 w-4 ${favoriteVenues.has(venue.id) ? 'fill-current' : ''}`} />
                  </Button>
                </div>
                <div className="absolute bottom-3 left-3 flex space-x-2">
                  <Badge className={`${venue.bookingAvailable ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                    {venue.bookingAvailable ? 'Available' : 'Sold Out'}
                  </Badge>
                  {venue.hasSocialFeatures && (
                    <Badge className="bg-purple-500 text-white">
                      Social Features
                    </Badge>
                  )}
                </div>
              </div>
              
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-foreground group-hover:text-primary transition-colors">
                      {venue.name}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground flex items-center mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {venue.location} • {venue.distance}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-muted-foreground">{venue.rating}</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="text-foreground">{venue.type}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Open until:</span>
                    <span className="text-foreground flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {venue.openUntil}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Capacity:</span>
                    <span className="text-foreground flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {venue.capacity}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Price Range:</span>
                    <span className="text-foreground">{venue.priceRange}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Current Event:</div>
                    <div className="text-sm text-primary font-medium">{venue.currentEvent}</div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {venue.genres.slice(0, 3).map((genre) => (
                      <Badge key={genre} variant="secondary" className="bg-primary/20 text-primary text-xs">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Popular with {venue.popularWith}
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      className="flex-1 glass glow-green hover-lift"
                      disabled={!venue.bookingAvailable}
                    >
                      {venue.bookingAvailable ? 'Book Table' : 'Sold Out'}
                    </Button>
                    {venue.hasMenu && (
                      <Link href={`/menu/${venue.name.toLowerCase().replace(/\s+/g, '-')}`}>
                        <Button size="sm" variant="outline" className="glass glow-blue">
                          <ShoppingCart className="h-3 w-3 mr-1" />
                          Menu
                        </Button>
                      </Link>
                    )}
                    <Button size="sm" variant="outline" className="glass">
                      Add to Plan
                    </Button>
                  </div>

                  {/* Social Features Section */}
                  {venue.hasSocialFeatures && (
                    <div className="pt-2 border-t border-border/50">
                      <div className="flex gap-2">
                        <Link href="/social" className="flex-1">
                          <Button size="sm" variant="outline" className="w-full glass border-purple-500/50 text-purple-400 hover:bg-purple-500/20">
                            <Wine className="h-3 w-3 mr-1" />
                            Share Bottle
                          </Button>
                        </Link>
                        <Link href="/social" className="flex-1">
                          <Button size="sm" variant="outline" className="w-full glass border-pink-500/50 text-pink-400 hover:bg-pink-500/20">
                            <Music className="h-3 w-3 mr-1" />
                            Request Song
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredVenues.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground text-lg">No venues found matching your criteria</div>
            <Button 
              className="mt-4 glass" 
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedGenre('All');
                setSelectedPrice('All');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExplorePageWithAuth() {
  return (
    <AuthGuard allowedUserTypes={['customer']}>
      <ExplorePage />
    </AuthGuard>
  );
}