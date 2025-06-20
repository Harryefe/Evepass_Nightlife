import * as Sentry from '@sentry/nextjs'

// ElevenLabs API configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1'

// Voice IDs for different personalities
export const VOICE_IDS = {
  EVE_DEFAULT: 'pNInz6obpgDQGcFmaJgB', // Adam - Professional, clear
  EVE_FRIENDLY: '21m00Tcm4TlvDq8ikWAM', // Rachel - Warm, friendly
  EVE_ENERGETIC: 'AZnzlk1XvdvUeBnXmlld', // Domi - Energetic, confident
  EVE_CALM: 'EXAVITQu4vr4xnSDxMaL', // Bella - Calm, soothing
} as const

export type VoiceId = typeof VOICE_IDS[keyof typeof VOICE_IDS]

export interface VoiceSettings {
  stability: number // 0.0 to 1.0
  similarity_boost: number // 0.0 to 1.0
  style?: number // 0.0 to 1.0 (for v2 models)
  use_speaker_boost?: boolean
}

export interface ElevenLabsResponse {
  success: boolean
  audioUrl?: string
  error?: string
  duration?: number
}

export const elevenLabsService = {
  // Check if ElevenLabs is properly configured
  isConfigured(): boolean {
    const isConfigured = !!ELEVENLABS_API_KEY && ELEVENLABS_API_KEY.startsWith('sk_')
    console.log('ElevenLabs configuration check:', {
      hasApiKey: !!ELEVENLABS_API_KEY,
      keyFormat: ELEVENLABS_API_KEY ? `${ELEVENLABS_API_KEY.substring(0, 5)}...` : 'none',
      isConfigured
    })
    return isConfigured
  },

  // Generate speech from text using ElevenLabs
  async generateSpeech(
    text: string,
    voiceId: VoiceId = VOICE_IDS.EVE_FRIENDLY,
    settings: VoiceSettings = {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.5,
      use_speaker_boost: true
    }
  ): Promise<ElevenLabsResponse> {
    return Sentry.startSpan(
      {
        op: "ai.voice.generate",
        name: "Generate ElevenLabs Speech",
      },
      async (span) => {
        try {
          // Check configuration
          if (!this.isConfigured()) {
            const error = 'ElevenLabs API key not configured or invalid format'
            span.setAttribute("error", error)
            console.error('ElevenLabs configuration error:', {
              hasKey: !!ELEVENLABS_API_KEY,
              keyLength: ELEVENLABS_API_KEY?.length || 0,
              startsWithSk: ELEVENLABS_API_KEY?.startsWith('sk_') || false
            })
            return { success: false, error }
          }

          span.setAttribute("voice_id", voiceId)
          span.setAttribute("text_length", text.length)
          span.setAttribute("stability", settings.stability)
          span.setAttribute("similarity_boost", settings.similarity_boost)

          // Validate input
          if (!text || text.trim().length === 0) {
            const error = 'Text is required for speech generation'
            span.setAttribute("error", error)
            return { success: false, error }
          }

          if (text.length > 5000) {
            const error = 'Text too long (max 5000 characters)'
            span.setAttribute("error", error)
            return { success: false, error }
          }

          console.log('Generating speech with ElevenLabs:', {
            textLength: text.length,
            voiceId,
            settings,
            apiKeyPresent: !!ELEVENLABS_API_KEY,
            apiKeyFormat: ELEVENLABS_API_KEY ? `${ELEVENLABS_API_KEY.substring(0, 8)}...` : 'none'
          })

          // Make request to ElevenLabs API
          const requestUrl = `${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}`
          const requestBody = {
            text: text.trim(),
            model_id: 'eleven_turbo_v2_5', // Fast, high-quality model
            voice_settings: {
              stability: settings.stability,
              similarity_boost: settings.similarity_boost,
              style: settings.style,
              use_speaker_boost: settings.use_speaker_boost
            }
          }

          console.log('Making ElevenLabs API request:', {
            url: requestUrl,
            bodySize: JSON.stringify(requestBody).length,
            headers: {
              'Accept': 'audio/mpeg',
              'Content-Type': 'application/json',
              'xi-api-key': ELEVENLABS_API_KEY ? `${ELEVENLABS_API_KEY.substring(0, 8)}...` : 'none'
            }
          })

          const response = await fetch(requestUrl, {
            method: 'POST',
            headers: {
              'Accept': 'audio/mpeg',
              'Content-Type': 'application/json',
              'xi-api-key': ELEVENLABS_API_KEY!
            },
            body: JSON.stringify(requestBody)
          })

          span.setAttribute("api_status", response.status)
          console.log('ElevenLabs API response:', {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
          })

          if (!response.ok) {
            let errorMessage = `ElevenLabs API error: ${response.status} ${response.statusText}`
            
            try {
              const errorText = await response.text()
              console.error('ElevenLabs API error response:', errorText)
              
              // Try to parse as JSON
              try {
                const errorData = JSON.parse(errorText)
                errorMessage = errorData.detail?.message || errorData.message || errorMessage
              } catch (e) {
                // If not JSON, use the raw text
                errorMessage = errorText || errorMessage
              }
            } catch (e) {
              console.error('Failed to read error response:', e)
            }

            span.setAttribute("error", errorMessage)
            Sentry.captureException(new Error(errorMessage))
            return { success: false, error: errorMessage }
          }

          // Convert response to blob and create URL
          const audioBlob = await response.blob()
          console.log('Audio blob created:', {
            size: audioBlob.size,
            type: audioBlob.type
          })

          if (audioBlob.size === 0) {
            const error = 'Received empty audio response from ElevenLabs'
            span.setAttribute("error", error)
            return { success: false, error }
          }

          const audioUrl = URL.createObjectURL(audioBlob)
          
          // Estimate duration (rough calculation: ~150 words per minute)
          const wordCount = text.split(' ').length
          const estimatedDuration = (wordCount / 150) * 60 // seconds

          span.setAttribute("success", true)
          span.setAttribute("audio_size", audioBlob.size)
          span.setAttribute("estimated_duration", estimatedDuration)

          console.log('Speech generated successfully:', {
            audioSize: audioBlob.size,
            audioType: audioBlob.type,
            estimatedDuration: estimatedDuration.toFixed(1) + 's',
            audioUrl: audioUrl.substring(0, 50) + '...'
          })

          return {
            success: true,
            audioUrl,
            duration: estimatedDuration
          }

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
          span.setAttribute("error", errorMessage)
          Sentry.captureException(error)
          console.error('ElevenLabs speech generation failed:', {
            error: errorMessage,
            stack: error instanceof Error ? error.stack : undefined
          })
          
          return {
            success: false,
            error: errorMessage
          }
        }
      }
    )
  },

  // Test the API connection
  async testConnection(): Promise<{ success: boolean; error?: string; info?: any }> {
    return Sentry.startSpan(
      {
        op: "ai.voice.test",
        name: "Test ElevenLabs Connection",
      },
      async (span) => {
        try {
          if (!this.isConfigured()) {
            return { 
              success: false, 
              error: 'ElevenLabs API key not configured. Please check your .env.local file.' 
            }
          }

          console.log('Testing ElevenLabs connection...')

          // Test with a simple request to get user info
          const response = await fetch(`${ELEVENLABS_BASE_URL}/user`, {
            headers: {
              'xi-api-key': ELEVENLABS_API_KEY!
            }
          })

          console.log('ElevenLabs test response:', {
            status: response.status,
            statusText: response.statusText
          })

          if (!response.ok) {
            let errorMessage = `API test failed: ${response.status} ${response.statusText}`
            
            try {
              const errorText = await response.text()
              const errorData = JSON.parse(errorText)
              errorMessage = errorData.detail?.message || errorData.message || errorMessage
            } catch (e) {
              // Use default error message
            }

            return { success: false, error: errorMessage }
          }

          const userData = await response.json()
          console.log('ElevenLabs connection successful:', userData)

          span.setAttribute("success", true)
          return { 
            success: true, 
            info: {
              subscription: userData.subscription,
              characterCount: userData.subscription?.character_count,
              characterLimit: userData.subscription?.character_limit
            }
          }

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Connection test failed'
          span.setAttribute("error", errorMessage)
          console.error('ElevenLabs connection test failed:', error)
          return { success: false, error: errorMessage }
        }
      }
    )
  },

  // Get available voices from ElevenLabs
  async getAvailableVoices() {
    return Sentry.startSpan(
      {
        op: "ai.voice.list",
        name: "Get ElevenLabs Voices",
      },
      async (span) => {
        try {
          if (!this.isConfigured()) {
            throw new Error('ElevenLabs API key not configured')
          }

          const response = await fetch(`${ELEVENLABS_BASE_URL}/voices`, {
            headers: {
              'xi-api-key': ELEVENLABS_API_KEY!
            }
          })

          if (!response.ok) {
            throw new Error(`Failed to fetch voices: ${response.statusText}`)
          }

          const data = await response.json()
          span.setAttribute("voices_count", data.voices?.length || 0)
          
          return data.voices || []
        } catch (error) {
          Sentry.captureException(error)
          span.setAttribute("error", error instanceof Error ? error.message : 'Unknown error')
          throw error
        }
      }
    )
  },

  // Get user's subscription info
  async getSubscriptionInfo() {
    return Sentry.startSpan(
      {
        op: "ai.voice.subscription",
        name: "Get ElevenLabs Subscription",
      },
      async (span) => {
        try {
          if (!this.isConfigured()) {
            throw new Error('ElevenLabs API key not configured')
          }

          const response = await fetch(`${ELEVENLABS_BASE_URL}/user/subscription`, {
            headers: {
              'xi-api-key': ELEVENLABS_API_KEY!
            }
          })

          if (!response.ok) {
            throw new Error(`Failed to fetch subscription: ${response.statusText}`)
          }

          const data = await response.json()
          span.setAttribute("tier", data.tier)
          span.setAttribute("character_count", data.character_count)
          span.setAttribute("character_limit", data.character_limit)
          
          return data
        } catch (error) {
          Sentry.captureException(error)
          span.setAttribute("error", error instanceof Error ? error.message : 'Unknown error')
          throw error
        }
      }
    )
  },

  // Cleanup audio URL to prevent memory leaks
  cleanupAudioUrl(audioUrl: string) {
    try {
      URL.revokeObjectURL(audioUrl)
    } catch (error) {
      console.warn('Failed to cleanup audio URL:', error)
    }
  }
}

// Helper function to get voice settings based on context
export function getVoiceSettingsForContext(context: 'greeting' | 'helpful' | 'emergency' | 'casual'): VoiceSettings {
  switch (context) {
    case 'greeting':
      return {
        stability: 0.7,
        similarity_boost: 0.8,
        style: 0.3,
        use_speaker_boost: true
      }
    case 'helpful':
      return {
        stability: 0.6,
        similarity_boost: 0.75,
        style: 0.4,
        use_speaker_boost: true
      }
    case 'emergency':
      return {
        stability: 0.8,
        similarity_boost: 0.9,
        style: 0.2,
        use_speaker_boost: true
      }
    case 'casual':
      return {
        stability: 0.4,
        similarity_boost: 0.7,
        style: 0.6,
        use_speaker_boost: true
      }
    default:
      return {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.5,
        use_speaker_boost: true
      }
  }
}