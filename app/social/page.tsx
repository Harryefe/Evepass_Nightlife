'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuthGuard } from '@/components/auth/auth-guard';
import { socialService, BottleShare, SongRequest } from '@/lib/social';
import { authService } from '@/lib/auth';
import { 
  Wine, Music, Users, Clock, MapPin, Share2, 
  Plus, Send, CheckCircle, XCircle, Loader2,
  Heart, MessageCircle, Calendar, Star
} from 'lucide-react';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';

// Mock venues for demo
const mockVenues = [
  { id: 'venue-1', name: 'Fabric London', location: 'Farringdon' },
  { id: 'venue-2', name: 'Ministry of Sound', location: 'Elephant & Castle' },
  { id: 'venue-3', name: 'XOYO', location: 'Shoreditch' }
];

function SocialPage() {
  const [activeTab, setActiveTab] = useState('bottle-shares');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Bottle Share State
  const [bottleShares, setBottleShares] = useState<BottleShare[]>([]);
  const [userBottleShares, setUserBottleShares] = useState<any[]>([]);
  const [showCreateBottleShare, setShowCreateBottleShare] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState('');
  const [bottleShareForm, setBottleShareForm] = useState({
    venue_id: '',
    bottle_id: '',
    max_participants: 2,
    message: '',
    vibe: ''
  });

  // Song Request State
  const [songRequests, setSongRequests] = useState<SongRequest[]>([]);
  const [showRequestSong, setShowRequestSong] = useState(false);
  const [songRequestForm, setSongRequestForm] = useState({
    venue_id: '',
    song_title: '',
    artist_name: ''
  });

  useEffect(() => {
    initializeSocial();
  }, []);

  const initializeSocial = async () => {
    return Sentry.startSpan(
      {
        op: "ui.action",
        name: "Initialize Social Features",
      },
      async (span) => {
        try {
          setLoading(true);
          
          const user = await authService.getCurrentUser();
          if (!user) return;
          
          setCurrentUser(user);
          span.setAttribute("user_id", user.id);
          
          // Load user's data
          await Promise.all([
            loadUserBottleShares(),
            loadUserSongRequests()
          ]);
          
          span.setAttribute("initialization_success", true);
        } catch (error) {
          console.error('Failed to initialize social features:', error);
          Sentry.captureException(error);
          span.setAttribute("initialization_success", false);
        } finally {
          setLoading(false);
        }
      }
    );
  };

  const loadUserBottleShares = async () => {
    try {
      const shares = await socialService.getUserBottleShares();
      setUserBottleShares(shares);
    } catch (error) {
      console.error('Failed to load bottle shares:', error);
      Sentry.captureException(error);
    }
  };

  const loadUserSongRequests = async () => {
    try {
      const requests = await socialService.getUserSongRequests();
      setSongRequests(requests);
    } catch (error) {
      console.error('Failed to load song requests:', error);
      Sentry.captureException(error);
    }
  };

  const loadVenueBottleShares = async (venueId: string) => {
    try {
      const shares = await socialService.getVenueBottleShares(venueId);
      setBottleShares(shares);
    } catch (error) {
      console.error('Failed to load venue bottle shares:', error);
      Sentry.captureException(error);
    }
  };

  const handleCreateBottleShare = async () => {
    return Sentry.startSpan(
      {
        op: "ui.click",
        name: "Create Bottle Share",
      },
      async (span) => {
        try {
          span.setAttribute("venue_id", bottleShareForm.venue_id);
          span.setAttribute("max_participants", bottleShareForm.max_participants);

          await socialService.createBottleShare(bottleShareForm);
          
          setShowCreateBottleShare(false);
          setBottleShareForm({
            venue_id: '',
            bottle_id: '',
            max_participants: 2,
            message: '',
            vibe: ''
          });
          
          await loadUserBottleShares();
          
          span.setAttribute("bottle_share_created", true);
        } catch (error) {
          console.error('Failed to create bottle share:', error);
          Sentry.captureException(error);
          span.setAttribute("bottle_share_created", false);
        }
      }
    );
  };

  const handleJoinBottleShare = async (shareId: string) => {
    return Sentry.startSpan(
      {
        op: "ui.click",
        name: "Join Bottle Share",
      },
      async (span) => {
        try {
          span.setAttribute("share_id", shareId);

          const result = await socialService.joinBottleShare(shareId);
          
          if (result.success) {
            // Refresh the bottle shares
            if (selectedVenue) {
              await loadVenueBottleShares(selectedVenue);
            }
          } else {
            alert(result.message);
          }
          
          span.setAttribute("join_success", result.success);
        } catch (error) {
          console.error('Failed to join bottle share:', error);
          Sentry.captureException(error);
          span.setAttribute("join_success", false);
        }
      }
    );
  };

  const handleCreateSongRequest = async () => {
    return Sentry.startSpan(
      {
        op: "ui.click",
        name: "Create Song Request",
      },
      async (span) => {
        try {
          span.setAttribute("venue_id", songRequestForm.venue_id);
          span.setAttribute("song_title", songRequestForm.song_title);

          await socialService.createSongRequest(songRequestForm);
          
          setShowRequestSong(false);
          setSongRequestForm({
            venue_id: '',
            song_title: '',
            artist_name: ''
          });
          
          await loadUserSongRequests();
          
          span.setAttribute("song_request_created", true);
        } catch (error) {
          console.error('Failed to create song request:', error);
          Sentry.captureException(error);
          span.setAttribute("song_request_created", false);
        }
      }
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'denied':
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'denied':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-400" />
          <p className="text-purple-400">Loading social features...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-lg border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-600/20 to-pink-600/20">
                <Share2 className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Social Hub</h1>
                <p className="text-sm text-gray-400">Connect, share, and enjoy together</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/explore">
                <Button variant="outline" size="sm" className="border-purple-400 text-purple-400">
                  Back to Explore
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-purple-500/20">
            <TabsTrigger value="bottle-shares" className="data-[state=active]:bg-purple-600">
              <Wine className="h-4 w-4 mr-2" />
              Share a Bottle
            </TabsTrigger>
            <TabsTrigger value="song-requests" className="data-[state=active]:bg-pink-600">
              <Music className="h-4 w-4 mr-2" />
              Request a Song
            </TabsTrigger>
          </TabsList>

          {/* BOTTLE SHARES TAB */}
          <TabsContent value="bottle-shares" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Share a Bottle</h2>
                <p className="text-gray-400">Split the cost and make new friends</p>
              </div>
              <Button 
                onClick={() => setShowCreateBottleShare(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Share
              </Button>
            </div>

            {/* Venue Selection for Browsing */}
            <Card className="bg-white/5 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Browse Bottle Shares</CardTitle>
                <CardDescription className="text-gray-400">
                  Find people to share bottles with at your favorite venues
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <Select value={selectedVenue} onValueChange={(value) => {
                    setSelectedVenue(value);
                    if (value) loadVenueBottleShares(value);
                  }}>
                    <SelectTrigger className="bg-white/10 border-purple-500/30 text-white">
                      <SelectValue placeholder="Select a venue" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockVenues.map((venue) => (
                        <SelectItem key={venue.id} value={venue.id}>
                          {venue.name} - {venue.location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedVenue && (
                  <div className="space-y-4">
                    {bottleShares.length === 0 ? (
                      <div className="text-center py-8">
                        <Wine className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-400">No active bottle shares at this venue</p>
                        <p className="text-sm text-gray-500">Be the first to create one!</p>
                      </div>
                    ) : (
                      bottleShares.map((share) => (
                        <Card key={share.id} className="bg-white/10 border-purple-500/30">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="text-white font-medium">{share.bottle_name}</h4>
                                <p className="text-sm text-gray-400">
                                  Created by {share.creator_name}
                                </p>
                                <div className="flex items-center space-x-4 mt-2 text-sm">
                                  <div className="flex items-center text-purple-300">
                                    <Users className="h-3 w-3 mr-1" />
                                    {share.current_participant_count}/{share.max_participants} people
                                  </div>
                                  <div className="flex items-center text-green-300">
                                    <span className="font-medium">£{share.cost_per_person?.toFixed(2)} per person</span>
                                  </div>
                                </div>
                                {share.message && (
                                  <p className="text-sm text-gray-300 mt-2 italic">"{share.message}"</p>
                                )}
                                {share.vibe && (
                                  <Badge className="mt-2 bg-pink-600/20 text-pink-300">
                                    {share.vibe}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex flex-col items-end space-y-2">
                                <Badge className={`${
                                  share.status === 'open' ? 'bg-green-600' : 'bg-gray-600'
                                } text-white`}>
                                  {share.status}
                                </Badge>
                                {share.status === 'open' && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleJoinBottleShare(share.id)}
                                    className="bg-purple-600 hover:bg-purple-700"
                                  >
                                    Join Share
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* User's Bottle Shares */}
            <Card className="bg-white/5 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Your Bottle Shares</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage your active and past bottle shares
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userBottleShares.length === 0 ? (
                  <div className="text-center py-8">
                    <Wine className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">You haven't created any bottle shares yet</p>
                    <Button 
                      onClick={() => setShowCreateBottleShare(true)}
                      className="mt-4 bg-purple-600 hover:bg-purple-700"
                    >
                      Create Your First Share
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userBottleShares.map((share) => (
                      <Card key={share.id} className="bg-white/10 border-purple-500/30">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-white font-medium">{share.menu_items?.name}</h4>
                              <p className="text-sm text-gray-400">
                                At {share.businesses?.business_name}
                              </p>
                              <div className="flex items-center space-x-4 mt-2 text-sm">
                                <Badge className={getStatusColor(share.status)}>
                                  {share.status}
                                </Badge>
                                <span className="text-gray-400">
                                  £{share.cost_per_person?.toFixed(2)} per person
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-400">
                                {new Date(share.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SONG REQUESTS TAB */}
          <TabsContent value="song-requests" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Request a Song</h2>
                <p className="text-gray-400">Send song requests directly to DJs</p>
              </div>
              <Button 
                onClick={() => setShowRequestSong(true)}
                className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
              >
                <Music className="h-4 w-4 mr-2" />
                Request Song
              </Button>
            </div>

            {/* User's Song Requests */}
            <Card className="bg-white/5 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Your Song Requests</CardTitle>
                <CardDescription className="text-gray-400">
                  Track your song requests and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {songRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">You haven't made any song requests yet</p>
                    <Button 
                      onClick={() => setShowRequestSong(true)}
                      className="mt-4 bg-pink-600 hover:bg-pink-700"
                    >
                      Make Your First Request
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {songRequests.map((request) => (
                      <Card key={request.id} className="bg-white/10 border-purple-500/30">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(request.status)}
                                <h4 className="text-white font-medium">{request.song_title}</h4>
                              </div>
                              {request.artist_name && (
                                <p className="text-sm text-gray-400">by {request.artist_name}</p>
                              )}
                              <p className="text-sm text-gray-400">
                                At {(request as any).businesses?.business_name}
                              </p>
                              {request.denial_reason && (
                                <p className="text-sm text-red-400 mt-1">
                                  Reason: {request.denial_reason}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <Badge className={getStatusColor(request.status)}>
                                {request.status}
                              </Badge>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(request.requested_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* CREATE BOTTLE SHARE MODAL */}
      {showCreateBottleShare && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-white/10 border-purple-500/20 backdrop-blur-lg max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-white">Create Bottle Share</CardTitle>
              <CardDescription className="text-gray-400">
                Find people to share a bottle with
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Venue</label>
                <Select value={bottleShareForm.venue_id} onValueChange={(value) => 
                  setBottleShareForm({...bottleShareForm, venue_id: value})
                }>
                  <SelectTrigger className="bg-white/10 border-purple-500/30 text-white">
                    <SelectValue placeholder="Select venue" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockVenues.map((venue) => (
                      <SelectItem key={venue.id} value={venue.id}>
                        {venue.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Bottle (Demo)</label>
                <Input
                  placeholder="e.g., Hennessy VS, Dom Pérignon"
                  value={bottleShareForm.bottle_id}
                  onChange={(e) => setBottleShareForm({...bottleShareForm, bottle_id: e.target.value})}
                  className="bg-white/10 border-purple-500/30 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Max Participants</label>
                <Select value={bottleShareForm.max_participants.toString()} onValueChange={(value) => 
                  setBottleShareForm({...bottleShareForm, max_participants: parseInt(value)})
                }>
                  <SelectTrigger className="bg-white/10 border-purple-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 people</SelectItem>
                    <SelectItem value="3">3 people</SelectItem>
                    <SelectItem value="4">4 people</SelectItem>
                    <SelectItem value="5">5 people</SelectItem>
                    <SelectItem value="6">6 people</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Message (Optional)</label>
                <Textarea
                  placeholder="e.g., Looking for chill vibes, celebrating a birthday!"
                  value={bottleShareForm.message}
                  onChange={(e) => setBottleShareForm({...bottleShareForm, message: e.target.value})}
                  className="bg-white/10 border-purple-500/30 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Vibe</label>
                <Select value={bottleShareForm.vibe} onValueChange={(value) => 
                  setBottleShareForm({...bottleShareForm, vibe: value})
                }>
                  <SelectTrigger className="bg-white/10 border-purple-500/30 text-white">
                    <SelectValue placeholder="Select vibe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chill">Chill</SelectItem>
                    <SelectItem value="party">Party</SelectItem>
                    <SelectItem value="celebration">Celebration</SelectItem>
                    <SelectItem value="networking">Networking</SelectItem>
                    <SelectItem value="date">Date Night</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateBottleShare(false)}
                  className="flex-1 border-gray-500 text-gray-300"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateBottleShare}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  disabled={!bottleShareForm.venue_id || !bottleShareForm.bottle_id}
                >
                  Create Share
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* REQUEST SONG MODAL */}
      {showRequestSong && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-white/10 border-purple-500/20 backdrop-blur-lg max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-white">Request a Song</CardTitle>
              <CardDescription className="text-gray-400">
                Send your song request to the DJ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Venue</label>
                <Select value={songRequestForm.venue_id} onValueChange={(value) => 
                  setSongRequestForm({...songRequestForm, venue_id: value})
                }>
                  <SelectTrigger className="bg-white/10 border-purple-500/30 text-white">
                    <SelectValue placeholder="Select venue" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockVenues.map((venue) => (
                      <SelectItem key={venue.id} value={venue.id}>
                        {venue.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Song Title *</label>
                <Input
                  placeholder="e.g., One More Time"
                  value={songRequestForm.song_title}
                  onChange={(e) => setSongRequestForm({...songRequestForm, song_title: e.target.value})}
                  className="bg-white/10 border-purple-500/30 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Artist (Optional)</label>
                <Input
                  placeholder="e.g., Daft Punk"
                  value={songRequestForm.artist_name}
                  onChange={(e) => setSongRequestForm({...songRequestForm, artist_name: e.target.value})}
                  className="bg-white/10 border-purple-500/30 text-white"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowRequestSong(false)}
                  className="flex-1 border-gray-500 text-gray-300"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateSongRequest}
                  className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                  disabled={!songRequestForm.venue_id || !songRequestForm.song_title}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Request
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function SocialPageWithAuth() {
  return (
    <AuthGuard allowedUserTypes={['customer']}>
      <SocialPage />
    </AuthGuard>
  );
}