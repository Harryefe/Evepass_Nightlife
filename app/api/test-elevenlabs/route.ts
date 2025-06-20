import { NextRequest, NextResponse } from 'next/server';
import { elevenLabsService } from '@/lib/elevenlabs';
import { elevenLabsAgentService } from '@/lib/elevenlabs-agent';
import * as Sentry from '@sentry/nextjs';

export async function POST(request: NextRequest) {
  return Sentry.startSpan(
    {
      op: "http.server",
      name: "POST /api/test-elevenlabs",
    },
    async (span) => {
      try {
        console.log('Testing ElevenLabs services...');
        
        // Test both text-to-speech and agent services
        const [ttsResult, agentResult] = await Promise.allSettled([
          elevenLabsService.testConnection(),
          elevenLabsAgentService.testAgentConnection()
        ]);
        
        const ttsSuccess = ttsResult.status === 'fulfilled' && ttsResult.value.success;
        const agentSuccess = agentResult.status === 'fulfilled' && agentResult.value.success;
        
        span.setAttribute("tts_success", ttsSuccess);
        span.setAttribute("agent_success", agentSuccess);
        
        if (agentSuccess) {
          console.log('ElevenLabs agent connection successful');
          return NextResponse.json({
            success: true,
            message: 'ElevenLabs Conversational AI Agent connected successfully',
            services: {
              agent: {
                success: true,
                info: agentResult.status === 'fulfilled' ? agentResult.value.info : null
              },
              textToSpeech: {
                success: ttsSuccess,
                info: ttsResult.status === 'fulfilled' ? ttsResult.value.info : null
              }
            }
          });
        } else if (ttsSuccess) {
          console.log('ElevenLabs TTS connection successful, agent failed');
          return NextResponse.json({
            success: true,
            message: 'ElevenLabs Text-to-Speech connected (Agent unavailable)',
            services: {
              agent: {
                success: false,
                error: agentResult.status === 'fulfilled' ? agentResult.value.error : 'Agent test failed'
              },
              textToSpeech: {
                success: true,
                info: ttsResult.status === 'fulfilled' ? ttsResult.value.info : null
              }
            }
          });
        } else {
          console.error('Both ElevenLabs services failed');
          return NextResponse.json({
            success: false,
            error: 'Both ElevenLabs services unavailable',
            services: {
              agent: {
                success: false,
                error: agentResult.status === 'fulfilled' ? agentResult.value.error : 'Agent test failed'
              },
              textToSpeech: {
                success: false,
                error: ttsResult.status === 'fulfilled' ? ttsResult.value.error : 'TTS test failed'
              }
            }
          });
        }
      } catch (error) {
        console.error('ElevenLabs test endpoint error:', error);
        span.setAttribute("test_success", false);
        Sentry.captureException(error);
        
        return NextResponse.json({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  );
}