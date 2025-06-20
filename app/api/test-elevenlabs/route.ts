import { NextRequest, NextResponse } from 'next/server';
import { elevenLabsService } from '@/lib/elevenlabs';
import * as Sentry from '@sentry/nextjs';

export async function POST(request: NextRequest) {
  return Sentry.startSpan(
    {
      op: "http.server",
      name: "POST /api/test-elevenlabs",
    },
    async (span) => {
      try {
        console.log('Testing ElevenLabs connection...');
        
        const result = await elevenLabsService.testConnection();
        
        span.setAttribute("test_success", result.success);
        
        if (result.success) {
          console.log('ElevenLabs connection test successful:', result.info);
          return NextResponse.json({
            success: true,
            message: 'ElevenLabs connection successful',
            info: result.info
          });
        } else {
          console.error('ElevenLabs connection test failed:', result.error);
          return NextResponse.json({
            success: false,
            error: result.error
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