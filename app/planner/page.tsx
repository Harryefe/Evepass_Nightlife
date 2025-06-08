'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Clock, MapPin, Users, Star, Plus, Trash2, Share2, Save } from 'lucide-react';
import Link from 'next/link';

// Mock venues for planning
const availableVenues = [
  {
    id: 'venue-1',
    name: 'Pre-drinks Bar',
    type: 'Cocktail Bar',
    location: 'Shoreditch',
    time: '7:00 PM - 9:00 PM',
    estimatedCost: '£25',
    rating: 4.5,
    image: 'https://images.pexels.com/photos/274192/pexels-photo-274192.jpeg'
  },
  {
    id: 'venue-2',
    name: 'Fabric',
    type: 'Nightclub',
    location: 'Farringdon',
    time: '10:00 PM - 4:00 AM',
    estimatedCost: '£35',
    rating: 4.8,
    image: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg'
  },
  {
    id: 'venue-3',
    name: 'Late Night Eats',
    type: 'Restaurant',
    location: 'Camden',
    time: '4:00 AM - 6:00 AM',
    estimatedCost: '£15',
    rating: 4.2,
    image: 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg'
  },
  {
    id: 'venue-4',
    name: 'Rooftop Lounge',
    type: 'Bar',
    location: 'London Bridge',
    time: '8:30 PM - 11:30 PM',
    estimatedCost: '£40',
    rating: 4.6,
    image: 'https://images.pexels.com/photos/696218/pexels-photo-696218.jpeg'
  }
];

export default function NightPlannerPage() {
  const [plannedVenues, setPlannedVenues] = useState([]);
  const [planName, setPlanName] = useState('Epic Saturday Night');

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.droppableId === 'available' && destination.droppableId === 'planned') {
      const venue = availableVenues.find(v => v.id === result.draggableId);
      if (venue && !plannedVenues.find(v => v.id === venue.id)) {
        const newPlannedVenues = [...plannedVenues];
        newPlannedVenues.splice(destination.index, 0, venue);
        setPlannedVenues(newPlannedVenues);
      }
    } else if (source.droppableId === 'planned' && destination.droppableId === 'planned') {
      const newPlannedVenues = [...plannedVenues];
      const [removed] = newPlannedVenues.splice(source.index, 1);
      newPlannedVenues.splice(destination.index, 0, removed);
      setPlannedVenues(newPlannedVenues);
    } else if (source.droppableId === 'planned' && destination.droppableId === 'available') {
      const newPlannedVenues = [...plannedVenues];
      newPlannedVenues.splice(source.index, 1);
      setPlannedVenues(newPlannedVenues);
    }
  };

  const removeFromPlan = (venueId) => {
    setPlannedVenues(plannedVenues.filter(v => v.id !== venueId));
  };

  const totalCost = plannedVenues.reduce((sum, venue) => sum + parseInt(venue.estimatedCost.replace('£', '')), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black text-white">
      {/* Header */}
      <div className="border-b border-purple-500/20 bg-black/50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/explore" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Night Planner
            </Link>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="border-purple-400 text-purple-400">
                <Save className="h-4 w-4 mr-2" />
                Save Plan
              </Button>
              <Button variant="outline" size="sm" className="border-pink-400 text-pink-400">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
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
        {/* Plan Header */}
        <div className="mb-8">
          <Input 
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            className="text-2xl font-bold bg-transparent border-none text-white placeholder:text-gray-400 p-0 h-auto"
            placeholder="Name your night..."
          />
          <p className="text-gray-400 mt-2">Drag venues from the left to build your perfect night out</p>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Available Venues */}
            <div className="lg:col-span-1">
              <Card className="bg-white/5 border-purple-500/20 sticky top-4">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Plus className="h-5 w-5 mr-2 text-purple-400" />
                    Available Venues
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Drag venues to add them to your plan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Droppable droppableId="available">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-3"
                      >
                        {availableVenues.map((venue, index) => (
                          <Draggable key={venue.id} draggableId={venue.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`p-3 rounded-lg border border-purple-500/20 bg-white/5 cursor-move transition-all ${
                                  snapshot.isDragging ? 'shadow-lg scale-105 bg-white/10' : 'hover:bg-white/10'
                                }`}
                              >
                                <div className="flex items-center space-x-3">
                                  <img 
                                    src={venue.image} 
                                    alt={venue.name}
                                    className="w-12 h-12 rounded-lg object-cover"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-white text-sm font-medium truncate">{venue.name}</h4>
                                    <p className="text-xs text-gray-400">{venue.type} • {venue.location}</p>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <Badge variant="secondary" className="bg-purple-600/20 text-purple-300 text-xs">
                                        {venue.estimatedCost}
                                      </Badge>
                                      <div className="flex items-center">
                                        <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                                        <span className="text-xs text-gray-400">{venue.rating}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </CardContent>
              </Card>
            </div>

            {/* Planned Night */}
            <div className="lg:col-span-2">
              <Card className="bg-white/5 border-purple-500/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">Your Night Plan</CardTitle>
                      <CardDescription className="text-gray-400">
                        {plannedVenues.length} venues • Estimated total: £{totalCost}
                      </CardDescription>
                    </div>
                    {plannedVenues.length > 0 && (
                      <div className="flex space-x-2">
                        <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                          Book All Tables
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <Droppable droppableId="planned">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`min-h-96 ${plannedVenues.length === 0 ? 'border-2 border-dashed border-purple-500/30 rounded-lg flex items-center justify-center' : 'space-y-4'}`}
                      >
                        {plannedVenues.length === 0 ? (
                          <div className="text-center py-12">
                            <div className="text-gray-400 text-lg mb-2">Drop venues here to build your night</div>
                            <p className="text-gray-500 text-sm">Drag from the available venues on the left</p>
                          </div>
                        ) : (
                          plannedVenues.map((venue, index) => (
                            <Draggable key={venue.id} draggableId={venue.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`relative ${snapshot.isDragging ? 'scale-105' : ''}`}
                                >
                                  <Card className="bg-white/10 border-purple-500/30">
                                    <CardContent className="p-4">
                                      <div className="flex items-center space-x-4">
                                        <div 
                                          {...provided.dragHandleProps}
                                          className="flex-shrink-0 cursor-move"
                                        >
                                          <div className="w-3 h-3 bg-purple-400 rounded-full mb-1"></div>
                                          <div className="w-3 h-3 bg-purple-600 rounded-full mb-1"></div>
                                          <div className="w-3 h-3 bg-purple-800 rounded-full"></div>
                                        </div>
                                        
                                        <img 
                                          src={venue.image} 
                                          alt={venue.name}
                                          className="w-16 h-16 rounded-lg object-cover"
                                        />
                                        
                                        <div className="flex-1">
                                          <div className="flex items-start justify-between">
                                            <div>
                                              <h3 className="text-white font-medium text-lg">{venue.name}</h3>
                                              <p className="text-gray-400 text-sm">{venue.type}</p>
                                              <div className="flex items-center space-x-4 mt-2 text-sm">
                                                <div className="flex items-center text-gray-300">
                                                  <MapPin className="h-4 w-4 mr-1" />
                                                  {venue.location}
                                                </div>
                                                <div className="flex items-center text-gray-300">
                                                  <Clock className="h-4 w-4 mr-1" />
                                                  {venue.time}
                                                </div>
                                              </div>
                                            </div>
                                            
                                            <div className="flex items-center space-x-2">
                                              <Badge className="bg-green-600 text-white">
                                                {venue.estimatedCost}
                                              </Badge>
                                              <Button 
                                                size="sm" 
                                                variant="ghost" 
                                                onClick={() => removeFromPlan(venue.id)}
                                                className="text-gray-400 hover:text-red-400"
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                            </div>
                                          </div>
                                          
                                          <div className="flex items-center space-x-4 mt-3">
                                            <Button size="sm" variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white">
                                              Book Table
                                            </Button>
                                            <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                                              View Details
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                  
                                  {index < plannedVenues.length - 1 && (
                                    <div className="flex justify-center py-2">
                                      <div className="text-gray-500 text-sm bg-white/5 px-3 py-1 rounded-full">
                                        Travel time: ~15 mins
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          ))
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                  
                  {plannedVenues.length > 0 && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg border border-purple-500/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">Night Summary</h4>
                          <p className="text-gray-400 text-sm">
                            {plannedVenues.length} venues • Total estimated cost: £{totalCost}
                          </p>
                        </div>
                        <div className="text-right">
                          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                            Confirm & Book All
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}