import { NextRequest, NextResponse } from 'next/server';
import { elevenLabsService, VOICE_IDS, getVoiceSettingsForContext } from '@/lib/elevenlabs';
import { authService } from '@/lib/auth';
import { EvePassKnowledgeService } from '@/lib/evepass-knowledge';
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

        // Generate AI text response with EvePass knowledge base
        const textResponse = EvePassKnowledgeService.generateEvePassResponse(
          message, 
          conversationHistory, 
          currentUser
        );
        
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
          },
          // Include EvePass platform stats for context
          platformStats: EvePassKnowledgeService.getPlatformStats()
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