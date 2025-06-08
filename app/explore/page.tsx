'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Clock, Users, Star, Heart, Filter, Search, Calendar, Navigation, Bot, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

// Mock data for UK venues
const mockVenues = [
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
    hasMenu: true
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
    hasMenu: true
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
    hasMenu: true
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
    hasMenu: false
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
    hasMenu: true
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
    hasMenu: true
  }
];

export default function ExplorePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState('All');
  const [currentLocation, setCurrentLocation] = useState('London, UK');
  const [filteredVenues, setFilteredVenues] = useState(mockVenues);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-lg border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Evepass
            </Link>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Navigation className="h-4 w-4 mr-2" />
                {currentLocation}
              </Button>
              <Link href="/ai-assistant">
                <Button variant="outline" size="sm" className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white">
                  <Bot className="h-4 w-4 mr-2" />
                  Ask Eve AI
                </Button>
              </Link>
              <Link href="/planner">
                <Button variant="outline" size="sm" className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white">
                  Night Planner
                </Button>
              </Link>
              <Link href="/safety">
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  DrunkSafe™
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search venues, events, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400"
              />
            </div>
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="w-full md:w-48 bg-white/10 border-purple-500/30 text-white">
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
              <SelectTrigger className="w-full md:w-32 bg-white/10 border-purple-500/30 text-white">
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
            <Card key={venue.id} className="bg-white/5 border-purple-500/20 backdrop-blur-lg hover:bg-white/10 transition-all duration-300 group cursor-pointer">
              <div className="relative">
                <img 
                  src={venue.image} 
                  alt={venue.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="absolute top-3 right-3">
                  <Button size="sm" variant="ghost" className="bg-black/50 hover:bg-black/70">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
                <div className="absolute bottom-3 left-3">
                  <Badge className={`${venue.bookingAvailable ? 'bg-green-600' : 'bg-red-600'} text-white`}>
                    {venue.bookingAvailable ? 'Available' : 'Sold Out'}
                  </Badge>
                </div>
              </div>
              
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white group-hover:text-purple-400 transition-colors">
                      {venue.name}
                    </CardTitle>
                    <CardDescription className="text-gray-400 flex items-center mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {venue.location} • {venue.distance}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-300">{venue.rating}</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white">{venue.type}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Open until:</span>
                    <span className="text-white flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {venue.openUntil}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Capacity:</span>
                    <span className="text-white flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {venue.capacity}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Price Range:</span>
                    <span className="text-white">{venue.priceRange}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm text-gray-400">Current Event:</div>
                    <div className="text-sm text-purple-400 font-medium">{venue.currentEvent}</div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {venue.genres.slice(0, 3).map((genre) => (
                      <Badge key={genre} variant="secondary" className="bg-purple-600/20 text-purple-300 text-xs">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Popular with {venue.popularWith}
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      disabled={!venue.bookingAvailable}
                    >
                      {venue.bookingAvailable ? 'Book Table' : 'Sold Out'}
                    </Button>
                    {venue.hasMenu && (
                      <Link href={`/menu/${venue.name.toLowerCase().replace(/\s+/g, '-')}`}>
                        <Button size="sm" variant="outline" className="border-green-400 text-green-400 hover:bg-green-400 hover:text-white">
                          <ShoppingCart className="h-3 w-3 mr-1" />
                          Menu
                        </Button>
                      </Link>
                    )}
                    <Button size="sm" variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white">
                      Add to Plan
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredVenues.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">No venues found matching your criteria</div>
            <Button 
              className="mt-4" 
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