import { supabase } from './supabase'
import * as Sentry from '@sentry/nextjs'

export interface BottleShare {
  id: string
  venue_id: string
  bottle_id: string
  creator_user_id: string
  max_participants: number
  current_participants: string[]
  cost_per_person: number
  message?: string
  vibe?: string
  status: 'open' | 'full' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
  expires_at: string
  // Joined data
  bottle_name?: string
  bottle_price?: number
  creator_name?: string
  current_participant_count?: number
}

export interface SongRequest {
  id: string
  user_id: string
  venue_id: string
  song_title: string
  artist_name?: string
  status: 'pending' | 'approved' | 'denied'
  denial_reason?: string
  requested_at: string
  responded_at?: string
  created_at: string
  updated_at: string
}

export interface BottleShareParticipant {
  id: string
  bottle_share_id: string
  user_id: string
  joined_at: string
  status: 'joined' | 'left' | 'completed'
}

export const socialService = {
  // ============================================
  // BOTTLE SHARE FUNCTIONS
  // ============================================

  // Create a new bottle share
  async createBottleShare(data: {
    venue_id: string
    bottle_id: string
    max_participants: number
    message?: string
    vibe?: string
  }) {
    return Sentry.startSpan(
      {
        op: "social.createBottleShare",
        name: "Create Bottle Share",
      },
      async (span) => {
        try {
          span.setAttribute("venue_id", data.venue_id);
          span.setAttribute("bottle_id", data.bottle_id);
          span.setAttribute("max_participants", data.max_participants);

          const { data: result, error } = await supabase
            .from('bottle_shares')
            .insert({
              venue_id: data.venue_id,
              bottle_id: data.bottle_id,
              creator_user_id: (await supabase.auth.getUser()).data.user?.id,
              max_participants: data.max_participants,
              message: data.message,
              vibe: data.vibe
            })
            .select()
            .single()

          if (error) {
            Sentry.captureException(error)
            throw error
          }

          span.setAttribute("bottle_share_created", true);
          return result
        } catch (error) {
          span.setAttribute("bottle_share_created", false);
          Sentry.captureException(error)
          throw error
        }
      }
    )
  },

  // Get bottle shares for a venue
  async getVenueBottleShares(venueId: string): Promise<BottleShare[]> {
    return Sentry.startSpan(
      {
        op: "social.getVenueBottleShares",
        name: "Get Venue Bottle Shares",
      },
      async (span) => {
        try {
          span.setAttribute("venue_id", venueId);

          const { data, error } = await supabase
            .rpc('get_venue_bottle_shares', { venue_uuid: venueId })

          if (error) {
            Sentry.captureException(error)
            throw error
          }

          span.setAttribute("bottle_shares_found", data?.length || 0);
          return data || []
        } catch (error) {
          span.setAttribute("bottle_shares_found", 0);
          Sentry.captureException(error)
          throw error
        }
      }
    )
  },

  // Join a bottle share
  async joinBottleShare(shareId: string) {
    return Sentry.startSpan(
      {
        op: "social.joinBottleShare",
        name: "Join Bottle Share",
      },
      async (span) => {
        try {
          span.setAttribute("share_id", shareId);

          const { data: user } = await supabase.auth.getUser()
          if (!user.user) throw new Error('Not authenticated')

          const { data, error } = await supabase
            .rpc('join_bottle_share', { 
              share_id: shareId, 
              joining_user_id: user.user.id 
            })

          if (error) {
            Sentry.captureException(error)
            throw error
          }

          const result = data[0]
          span.setAttribute("join_success", result.success);
          span.setAttribute("current_count", result.current_count);

          return result
        } catch (error) {
          span.setAttribute("join_success", false);
          Sentry.captureException(error)
          throw error
        }
      }
    )
  },

  // Get user's bottle shares
  async getUserBottleShares() {
    return Sentry.startSpan(
      {
        op: "social.getUserBottleShares",
        name: "Get User Bottle Shares",
      },
      async (span) => {
        try {
          const { data: user } = await supabase.auth.getUser()
          if (!user.user) throw new Error('Not authenticated')

          span.setAttribute("user_id", user.user.id);

          const { data, error } = await supabase
            .from('bottle_shares')
            .select(`
              *,
              menu_items (name, price),
              businesses (business_name)
            `)
            .eq('creator_user_id', user.user.id)
            .order('created_at', { ascending: false })

          if (error) {
            Sentry.captureException(error)
            throw error
          }

          span.setAttribute("user_shares_found", data?.length || 0);
          return data || []
        } catch (error) {
          span.setAttribute("user_shares_found", 0);
          Sentry.captureException(error)
          throw error
        }
      }
    )
  },

  // ============================================
  // SONG REQUEST FUNCTIONS
  // ============================================

  // Create a song request
  async createSongRequest(data: {
    venue_id: string
    song_title: string
    artist_name?: string
  }) {
    return Sentry.startSpan(
      {
        op: "social.createSongRequest",
        name: "Create Song Request",
      },
      async (span) => {
        try {
          span.setAttribute("venue_id", data.venue_id);
          span.setAttribute("song_title", data.song_title);

          const { data: user } = await supabase.auth.getUser()
          if (!user.user) throw new Error('Not authenticated')

          const { data: result, error } = await supabase
            .from('song_requests')
            .insert({
              user_id: user.user.id,
              venue_id: data.venue_id,
              song_title: data.song_title,
              artist_name: data.artist_name
            })
            .select()
            .single()

          if (error) {
            Sentry.captureException(error)
            throw error
          }

          span.setAttribute("song_request_created", true);
          return result
        } catch (error) {
          span.setAttribute("song_request_created", false);
          Sentry.captureException(error)
          throw error
        }
      }
    )
  },

  // Get user's song requests
  async getUserSongRequests() {
    return Sentry.startSpan(
      {
        op: "social.getUserSongRequests",
        name: "Get User Song Requests",
      },
      async (span) => {
        try {
          const { data: user } = await supabase.auth.getUser()
          if (!user.user) throw new Error('Not authenticated')

          span.setAttribute("user_id", user.user.id);

          const { data, error } = await supabase
            .from('song_requests')
            .select(`
              *,
              businesses (business_name)
            `)
            .eq('user_id', user.user.id)
            .order('requested_at', { ascending: false })
            .limit(20)

          if (error) {
            Sentry.captureException(error)
            throw error
          }

          span.setAttribute("song_requests_found", data?.length || 0);
          return data || []
        } catch (error) {
          span.setAttribute("song_requests_found", 0);
          Sentry.captureException(error)
          throw error
        }
      }
    )
  },

  // Get venue song requests (for business dashboard)
  async getVenueSongRequests(venueId: string) {
    return Sentry.startSpan(
      {
        op: "social.getVenueSongRequests",
        name: "Get Venue Song Requests",
      },
      async (span) => {
        try {
          span.setAttribute("venue_id", venueId);

          const { data, error } = await supabase
            .from('song_requests')
            .select(`
              *,
              customers (first_name, last_name)
            `)
            .eq('venue_id', venueId)
            .order('requested_at', { ascending: false })

          if (error) {
            Sentry.captureException(error)
            throw error
          }

          span.setAttribute("venue_requests_found", data?.length || 0);
          return data || []
        } catch (error) {
          span.setAttribute("venue_requests_found", 0);
          Sentry.captureException(error)
          throw error
        }
      }
    )
  },

  // Update song request status (for businesses)
  async updateSongRequestStatus(requestId: string, status: 'approved' | 'denied', reason?: string) {
    return Sentry.startSpan(
      {
        op: "social.updateSongRequestStatus",
        name: "Update Song Request Status",
      },
      async (span) => {
        try {
          span.setAttribute("request_id", requestId);
          span.setAttribute("new_status", status);

          const { data, error } = await supabase
            .rpc('update_song_request_status', { 
              request_id: requestId, 
              new_status: status,
              reason: reason 
            })

          if (error) {
            Sentry.captureException(error)
            throw error
          }

          const result = data[0]
          span.setAttribute("update_success", result.success);

          return result
        } catch (error) {
          span.setAttribute("update_success", false);
          Sentry.captureException(error)
          throw error
        }
      }
    )
  },

  // ============================================
  // REAL-TIME SUBSCRIPTIONS
  // ============================================

  // Subscribe to bottle share updates for a venue
  subscribeToVenueBottleShares(venueId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`bottle_shares_${venueId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bottle_shares',
          filter: `venue_id=eq.${venueId}`
        },
        callback
      )
      .subscribe()
  },

  // Subscribe to song request updates for a user
  subscribeToUserSongRequests(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`song_requests_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'song_requests',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()
  },

  // Subscribe to venue song requests (for businesses)
  subscribeToVenueSongRequests(venueId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`venue_song_requests_${venueId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'song_requests',
          filter: `venue_id=eq.${venueId}`
        },
        callback
      )
      .subscribe()
  }
}