import { NextRequest, NextResponse } from 'next/server';
import { elevenLabsService, VOICE_IDS, getVoiceSettingsForContext } from '@/lib/elevenlabs';
import { authService } from '@/lib/auth';
import * as Sentry from '@sentry/nextjs';

// This API route handles AI responses with voice synthesis
// REQUIRES AUTHENTICATION - Users must be signed in to access Eve AI
export async function POST(request: NextRequest) {
  return Sentry.startSpan(
    {
      op: "http.server",
      name: "POST /api/ai-response",
    },
    async (span) => {
      try {
        // AUTHENTICATION CHECK - Verify user is signed in
        const currentUser = await authService.getCurrentUser();
        if (!currentUser) {
          span.setAttribute("auth_failed", true);
          return NextResponse.json(
            { error: 'Authentication required. Please sign in to access Eve AI.' },
            { status: 401 }
          );
        }

        // Only allow customers to access AI assistant
        if (currentUser.user_type !== 'customer') {
          span.setAttribute("user_type_denied", true);
          return NextResponse.json(
            { error: 'AI Assistant is only available for customers. Please sign in with a customer account.' },
            { status: 403 }
          );
        }

        span.setAttribute("user_id", currentUser.id);
        span.setAttribute("user_type", currentUser.user_type);

        const body = await request.json();
        const { message, conversationHistory, voiceEnabled = true, voiceId, context = 'helpful' } = body;

        span.setAttribute("message_length", message?.length || 0);
        span.setAttribute("history_length", conversationHistory?.length || 0);
        span.setAttribute("voice_enabled", voiceEnabled);
        span.setAttribute("context", context);

        // Validate input
        if (!message || typeof message !== 'string') {
          const error = new Error('Message is required and must be a string');
          Sentry.captureException(error);
          return NextResponse.json(
            { error: 'Message is required and must be a string' },
            { status: 400 }
          );
        }

        // Generate AI text response with user context
        const textResponse = generateAIResponse(message, conversationHistory, currentUser);
        
        let audioUrl = null;
        let audioDuration = null;
        let voiceError = null;

        // Generate voice response if enabled and ElevenLabs is configured
        if (voiceEnabled && elevenLabsService.isConfigured()) {
          try {
            span.setAttribute("generating_voice", true);
            
            const selectedVoiceId = voiceId || VOICE_IDS.EVE_FRIENDLY;
            const voiceSettings = getVoiceSettingsForContext(context);
            
            const voiceResult = await elevenLabsService.generateSpeech(
              textResponse,
              selectedVoiceId,
              voiceSettings
            );

            if (voiceResult.success) {
              audioUrl = voiceResult.audioUrl;
              audioDuration = voiceResult.duration;
              span.setAttribute("voice_generated", true);
            } else {
              voiceError = voiceResult.error;
              span.setAttribute("voice_error", voiceError);
              console.warn('Voice generation failed:', voiceError);
            }
          } catch (error) {
            voiceError = error instanceof Error ? error.message : 'Voice generation failed';
            span.setAttribute("voice_error", voiceError);
            Sentry.captureException(error);
            console.error('Voice generation error:', error);
          }
        } else if (voiceEnabled && !elevenLabsService.isConfigured()) {
          voiceError = 'ElevenLabs API not configured';
          span.setAttribute("voice_error", voiceError);
        }

        const response = {
          text: textResponse,
          audioUrl,
          audioDuration,
          voiceError,
          timestamp: new Date().toISOString(),
          voiceEnabled: voiceEnabled && elevenLabsService.isConfigured(),
          user: {
            id: currentUser.id,
            name: currentUser.profile?.first_name || 'User'
          }
        };

        span.setAttribute("response_generated", true);
        
        return NextResponse.json(response);
      } catch (error) {
        span.setAttribute("response_generated", false);
        Sentry.captureException(error);
        console.error('AI response error:', error);
        
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      }
    }
  );
}

function generateAIResponse(userMessage: string, conversationHistory: any[] = [], currentUser: any): string {
  const input = userMessage.toLowerCase();
  const userName = currentUser.profile?.first_name || 'there';
  
  // Analyze conversation context
  const isFirstMessage = !conversationHistory || conversationHistory.length === 0;
  const recentMessages = conversationHistory.slice(-3); // Last 3 messages for context
  
  // Greeting responses with personalization
  if (isFirstMessage || input.includes('hello') || input.includes('hi ') || input.includes('hey')) {
    const greetings = [
      `Hi ${userName}! I'm Eve, your AI nightlife assistant. I'm here to help you discover amazing venues, plan your perfect night out, and keep you safe with DrunkSafe™. What can I help you with tonight?`,
      `Hey ${userName}! Welcome to Evepass! I'm Eve, and I'm excited to help you explore the best nightlife experiences. Whether you want to find venues, book tables, or get safety tips, I've got you covered!`,
      `Hello ${userName}! I'm Eve, your personal nightlife companion. I can help you discover venues, manage your night out, track your safety with DrunkSafe™, and so much more. What sounds good to you?`
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  // Venue discovery
  if (input.includes('venue') || input.includes('club') || input.includes('bar') || input.includes('find') || input.includes('discover')) {
    return `I found some fantastic venues for you, ${userName}! Based on your location and preferences, I recommend checking out Fabric for incredible electronic music, Ministry of Sound for house vibes, or The Shard View Bar for cocktails with a view. Would you like me to help you book a table or check their current events?`;
  }
  
  // Budget and spending
  if (input.includes('budget') || input.includes('money') || input.includes('spend') || input.includes('cost') || input.includes('price')) {
    return `Let me help you manage your nightlife budget, ${userName}! Based on typical London prices, I'd suggest budgeting £80-150 for a great night out. This covers entry, drinks, and maybe some late-night food. I can track your spending in real-time and send alerts when you're approaching your limit. Want me to set up budget tracking for tonight?`;
  }
  
  // Planning and itinerary
  if (input.includes('plan') || input.includes('itinerary') || input.includes('schedule') || input.includes('night out')) {
    return `I'd love to help you plan the perfect night, ${userName}! Here's what I suggest: Start with pre-drinks at a cocktail bar around 7-8 PM, then head to your main venue by 10 PM when the energy really picks up. I can help you book tables, coordinate with friends, and even suggest the best routes between venues. Shall I create a detailed plan for you?`;
  }
  
  // Safety and DrunkSafe
  if (input.includes('safe') || input.includes('safety') || input.includes('drunk') || input.includes('bac') || input.includes('alcohol')) {
    return `Safety is my absolute top priority, ${userName}! DrunkSafe™ is your personal safety companion that monitors your alcohol consumption, calculates your BAC in real-time, and provides personalized safety recommendations. I can set up emergency contacts, track your location, help you get home safely, and even remind you to drink water. Your safety profile shows you're doing great - want me to activate any additional safety features?`;
  }
  
  // Social features
  if (input.includes('friends') || input.includes('social') || input.includes('meet') || input.includes('share') || input.includes('bottle')) {
    return `The social side of nightlife is amazing, ${userName}! You can use our 'Share a Bottle' feature to split costs and meet new people, or send song requests directly to DJs at venues. I can help you connect with other party-goers, coordinate group bookings, and even find people with similar music tastes. Want to explore our social features?`;
  }
  
  // Booking and reservations
  if (input.includes('book') || input.includes('table') || input.includes('reservation') || input.includes('reserve')) {
    return `I can definitely help you secure the perfect table, ${userName}! I have real-time availability for VIP areas, regular tables, and bar spots at top venues. Most places offer instant booking, and I can even negotiate group discounts for larger parties. Which venue interests you, and how many people will be joining?`;
  }
  
  // Music and entertainment
  if (input.includes('music') || input.includes('dj') || input.includes('song') || input.includes('dance') || input.includes('genre')) {
    return `Music makes the night, ${userName}! I can help you find venues that match your musical taste - whether you're into house, techno, hip-hop, or live bands. You can even request songs directly through the app, and I'll send them to the DJ. What kind of vibe are you feeling tonight?`;
  }
  
  // Transportation and getting home
  if (input.includes('uber') || input.includes('taxi') || input.includes('ride') || input.includes('home') || input.includes('transport')) {
    return `Getting home safely is crucial, ${userName}! I can book rides for you through Uber, Bolt, or traditional black cabs. I'll also remind you about Night Tube schedules and can share your location with trusted contacts. When you're ready to head home, just let me know and I'll sort out the safest, quickest option for you.`;
  }
  
  // Food and late night eats
  if (input.includes('food') || input.includes('eat') || input.includes('hungry') || input.includes('restaurant')) {
    return `Late-night munchies are real, ${userName}! I know all the best spots for post-club food - from 24-hour kebab shops to upscale late-night restaurants. Eating while drinking also helps slow alcohol absorption, which is great for your DrunkSafe™ profile. Want me to find some food options near your current location?`;
  }
  
  // Help and features
  if (input.includes('help') || input.includes('what can you') || input.includes('features') || input.includes('do')) {
    return `I'm your complete nightlife assistant, ${userName}! I can help you discover venues, book tables, manage your budget, plan your entire night, keep you safe with DrunkSafe™, connect you with other party-goers, request songs, order rides, find food, and so much more. I'm here 24/7 to make sure you have the best possible night out. What would you like to explore first?`;
  }
  
  // Default helpful response with personalization
  const defaultResponses = [
    `I'm here to make your night out amazing, ${userName}! I can help with venue recommendations, table bookings, safety monitoring, budget tracking, and connecting with other party-goers. What aspect of your night would you like to focus on?`,
    `That's interesting, ${userName}! As your nightlife AI assistant, I can help you with venues, safety, planning, social features, and much more. Is there something specific about your night out I can help you with?`,
    `I'm Eve, your AI nightlife companion, ${userName}! I specialize in venue discovery, safety monitoring with DrunkSafe™, night planning, and social features. How can I enhance your nightlife experience tonight?`
  ];
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}