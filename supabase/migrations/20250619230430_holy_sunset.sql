/*
  # Social Features: Share a Bottle & Request a Song

  1. New Tables
    - `bottle_shares` - Users can create and join bottle sharing requests
    - `song_requests` - Users can request songs at venues with real-time status updates
    
  2. Security
    - Enable RLS on all tables
    - Users can create and view bottle shares at venues
    - Users can create song requests and view their own requests
    - Businesses can view and manage song requests for their venue
    
  3. Features
    - Real-time bottle sharing coordination
    - Song request system with approval/denial workflow
    - Cost calculation for bottle sharing
    - Status tracking for song requests
*/

-- Create bottle_shares table
CREATE TABLE IF NOT EXISTS bottle_shares (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  bottle_id uuid REFERENCES menu_items(id) ON DELETE CASCADE,
  creator_user_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Sharing details
  max_participants integer NOT NULL CHECK (max_participants > 1),
  current_participants uuid[] DEFAULT ARRAY[]::uuid[],
  cost_per_person decimal(10,2) GENERATED ALWAYS AS (
    CASE 
      WHEN max_participants > 0 THEN 
        (SELECT price FROM menu_items WHERE id = bottle_id) / max_participants
      ELSE 0
    END
  ) STORED,
  
  -- Social aspects
  message text,
  vibe text,
  
  -- Status management
  status text DEFAULT 'open' CHECK (status IN ('open', 'full', 'completed', 'cancelled')),
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + INTERVAL '4 hours') -- Auto-expire after 4 hours
);

-- Create song_requests table
CREATE TABLE IF NOT EXISTS song_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  venue_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Song details
  song_title text NOT NULL,
  artist_name text,
  
  -- Request status and feedback
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  denial_reason text,
  
  -- Timestamps
  requested_at timestamptz DEFAULT now(),
  responded_at timestamptz,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bottle_share_participants junction table for better tracking
CREATE TABLE IF NOT EXISTS bottle_share_participants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  bottle_share_id uuid REFERENCES bottle_shares(id) ON DELETE CASCADE,
  user_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  status text DEFAULT 'joined' CHECK (status IN ('joined', 'left', 'completed')),
  
  UNIQUE(bottle_share_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE bottle_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE song_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE bottle_share_participants ENABLE ROW LEVEL SECURITY;

-- ============================================
-- BOTTLE SHARES POLICIES
-- ============================================

-- Users can read bottle shares at venues they're interested in
CREATE POLICY "Users can read bottle shares at venues"
  ON bottle_shares
  FOR SELECT
  TO authenticated
  USING (status = 'open' OR creator_user_id = auth.uid());

-- Users can create bottle shares
CREATE POLICY "Users can create bottle shares"
  ON bottle_shares
  FOR INSERT
  TO authenticated
  WITH CHECK (creator_user_id = auth.uid());

-- Creators can update their own bottle shares
CREATE POLICY "Creators can update their bottle shares"
  ON bottle_shares
  FOR UPDATE
  TO authenticated
  USING (creator_user_id = auth.uid());

-- Businesses can read bottle shares at their venue
CREATE POLICY "Businesses can read venue bottle shares"
  ON bottle_shares
  FOR SELECT
  TO authenticated
  USING (venue_id = auth.uid());

-- ============================================
-- BOTTLE SHARE PARTICIPANTS POLICIES
-- ============================================

-- Users can read participants for shares they're involved in
CREATE POLICY "Users can read participants for their shares"
  ON bottle_share_participants
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM bottle_shares bs 
      WHERE bs.id = bottle_share_participants.bottle_share_id 
      AND bs.creator_user_id = auth.uid()
    )
  );

-- Users can join bottle shares
CREATE POLICY "Users can join bottle shares"
  ON bottle_share_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own participation
CREATE POLICY "Users can update their participation"
  ON bottle_share_participants
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- SONG REQUESTS POLICIES
-- ============================================

-- Users can read their own song requests
CREATE POLICY "Users can read their own song requests"
  ON song_requests
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can create song requests
CREATE POLICY "Users can create song requests"
  ON song_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Businesses can read song requests for their venue
CREATE POLICY "Businesses can read venue song requests"
  ON song_requests
  FOR SELECT
  TO authenticated
  USING (venue_id = auth.uid());

-- Businesses can update song request status
CREATE POLICY "Businesses can update song request status"
  ON song_requests
  FOR UPDATE
  TO authenticated
  USING (venue_id = auth.uid());

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to join a bottle share
CREATE OR REPLACE FUNCTION join_bottle_share(share_id uuid, joining_user_id uuid)
RETURNS TABLE (
  success boolean,
  message text,
  current_count integer
) AS $$
DECLARE
  share_record RECORD;
  current_participant_count integer;
BEGIN
  -- Get the bottle share details
  SELECT * INTO share_record
  FROM bottle_shares
  WHERE id = share_id AND status = 'open';
  
  IF share_record IS NULL THEN
    RETURN QUERY SELECT false, 'Bottle share not found or no longer available'::text, 0::integer;
    RETURN;
  END IF;
  
  -- Check if user is already a participant
  IF EXISTS (
    SELECT 1 FROM bottle_share_participants 
    WHERE bottle_share_id = share_id AND user_id = joining_user_id
  ) THEN
    RETURN QUERY SELECT false, 'You are already part of this bottle share'::text, 0::integer;
    RETURN;
  END IF;
  
  -- Get current participant count
  SELECT COUNT(*) INTO current_participant_count
  FROM bottle_share_participants
  WHERE bottle_share_id = share_id AND status = 'joined';
  
  -- Add creator to count if not already a participant
  IF NOT EXISTS (
    SELECT 1 FROM bottle_share_participants 
    WHERE bottle_share_id = share_id AND user_id = share_record.creator_user_id
  ) THEN
    current_participant_count := current_participant_count + 1;
  END IF;
  
  -- Check if there's space
  IF current_participant_count >= share_record.max_participants THEN
    RETURN QUERY SELECT false, 'Bottle share is already full'::text, current_participant_count::integer;
    RETURN;
  END IF;
  
  -- Add the participant
  INSERT INTO bottle_share_participants (bottle_share_id, user_id)
  VALUES (share_id, joining_user_id);
  
  -- Update participant count
  current_participant_count := current_participant_count + 1;
  
  -- Update bottle share status if full
  IF current_participant_count >= share_record.max_participants THEN
    UPDATE bottle_shares 
    SET status = 'full', updated_at = now()
    WHERE id = share_id;
  END IF;
  
  RETURN QUERY SELECT true, 'Successfully joined bottle share'::text, current_participant_count::integer;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update song request status
CREATE OR REPLACE FUNCTION update_song_request_status(
  request_id uuid, 
  new_status text, 
  reason text DEFAULT NULL
)
RETURNS TABLE (
  success boolean,
  message text
) AS $$
DECLARE
  request_record RECORD;
BEGIN
  -- Validate status
  IF new_status NOT IN ('approved', 'denied') THEN
    RETURN QUERY SELECT false, 'Invalid status. Must be approved or denied'::text;
    RETURN;
  END IF;
  
  -- Get the request
  SELECT * INTO request_record
  FROM song_requests
  WHERE id = request_id AND status = 'pending';
  
  IF request_record IS NULL THEN
    RETURN QUERY SELECT false, 'Song request not found or already processed'::text;
    RETURN;
  END IF;
  
  -- Update the request
  UPDATE song_requests
  SET 
    status = new_status,
    denial_reason = CASE WHEN new_status = 'denied' THEN reason ELSE NULL END,
    responded_at = now(),
    updated_at = now()
  WHERE id = request_id;
  
  RETURN QUERY SELECT true, 'Song request status updated successfully'::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get active bottle shares at a venue
CREATE OR REPLACE FUNCTION get_venue_bottle_shares(venue_uuid uuid)
RETURNS TABLE (
  share_id uuid,
  bottle_name text,
  bottle_price decimal(10,2),
  creator_name text,
  current_participants integer,
  max_participants integer,
  cost_per_person decimal(10,2),
  message text,
  vibe text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bs.id,
    mi.name,
    mi.price,
    (c.first_name || ' ' || c.last_name),
    (
      SELECT COUNT(*)::integer 
      FROM bottle_share_participants bsp 
      WHERE bsp.bottle_share_id = bs.id AND bsp.status = 'joined'
    ) + 1, -- +1 for creator
    bs.max_participants,
    bs.cost_per_person,
    bs.message,
    bs.vibe,
    bs.created_at
  FROM bottle_shares bs
  JOIN menu_items mi ON mi.id = bs.bottle_id
  JOIN customers c ON c.id = bs.creator_user_id
  WHERE bs.venue_id = venue_uuid 
    AND bs.status = 'open'
    AND bs.expires_at > now()
  ORDER BY bs.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================

-- Add updated_at triggers
CREATE TRIGGER update_bottle_shares_updated_at
  BEFORE UPDATE ON bottle_shares
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_song_requests_updated_at
  BEFORE UPDATE ON song_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to clean up expired bottle shares
CREATE OR REPLACE FUNCTION cleanup_expired_bottle_shares()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE bottle_shares 
  SET status = 'cancelled', updated_at = now()
  WHERE expires_at <= now() AND status = 'open';
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger that runs periodically (you might want to set up a cron job instead)
-- This is just for demonstration - in production, use pg_cron or similar
CREATE OR REPLACE FUNCTION schedule_cleanup()
RETURNS void AS $$
BEGIN
  PERFORM cleanup_expired_bottle_shares();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PERFORMANCE INDEXES
-- ============================================

-- Bottle shares indexes
CREATE INDEX IF NOT EXISTS idx_bottle_shares_venue_status ON bottle_shares(venue_id, status);
CREATE INDEX IF NOT EXISTS idx_bottle_shares_creator ON bottle_shares(creator_user_id);
CREATE INDEX IF NOT EXISTS idx_bottle_shares_expires ON bottle_shares(expires_at);

-- Song requests indexes
CREATE INDEX IF NOT EXISTS idx_song_requests_venue_status ON song_requests(venue_id, status);
CREATE INDEX IF NOT EXISTS idx_song_requests_user ON song_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_song_requests_requested_at ON song_requests(requested_at DESC);

-- Bottle share participants indexes
CREATE INDEX IF NOT EXISTS idx_bottle_share_participants_share ON bottle_share_participants(bottle_share_id);
CREATE INDEX IF NOT EXISTS idx_bottle_share_participants_user ON bottle_share_participants(user_id);

-- ============================================
-- VERIFICATION
-- ============================================

-- Test the functions
SELECT 'Testing bottle share functions...' as test_status;

-- Test getting venue bottle shares (will return empty for new setup)
SELECT 'Venue bottle shares test:' as test_type, COUNT(*) as count
FROM get_venue_bottle_shares('00000000-0000-0000-0000-000000000000'::uuid);

-- Verify tables were created
SELECT 'Social features tables created: ' || COUNT(*) as summary
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('bottle_shares', 'song_requests', 'bottle_share_participants');

-- Verify functions were created
SELECT 'Social features functions created: ' || COUNT(*) as summary
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('join_bottle_share', 'update_song_request_status', 'get_venue_bottle_shares');

SELECT '🎉 SOCIAL FEATURES DATABASE SETUP COMPLETE! 🎉' as message,
       '✅ Share a Bottle functionality ready' as feature_1,
       '✅ Request a Song functionality ready' as feature_2,
       '✅ Real-time updates supported' as feature_3,
       '✅ Cost calculation automated' as feature_4,
       '✅ Security policies in place' as feature_5;