import * as Sentry from '@sentry/nextjs'

// ElevenLabs Conversational AI configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1'

// Your agent ID from the URL
export const EVE_AGENT_ID = 'agent_01jy55g4rae74rc7vktwjw0mjv'

export interface ConversationResponse {
  success: boolean
  audioUrl?: string
  text?: string
  error?: string
  conversationId?: string
}

export interface ConversationSession {
  conversationId: string
  agentId: string
  userId?: string
}

export const elevenLabsAgentService = {
  // Check if ElevenLabs is properly configured
  isConfigured(): boolean {
    const isConfigured = !!ELEVENLABS_API_KEY && ELEVENLABS_API_KEY.startsWith('sk_')
    console.log('ElevenLabs Agent configuration check:', {
      hasApiKey: !!ELEVENLABS_API_KEY,
      keyFormat: ELEVENLABS_API_KEY ? `${ELEVENLABS_API_KEY.substring(0, 5)}...` : 'none',
      agentId: EVE_AGENT_ID,
      isConfigured
    })
    return isConfigured
  },

  // Start a new conversation with the agent
  async startConversation(userId?: string): Promise<ConversationSession> {
    return Sentry.startSpan(
      {
        op: "ai.agent.start",
        name: "Start ElevenLabs Agent Conversation",
      },
      async (span) => {
        try {
          if (!this.isConfigured()) {
            throw new Error('ElevenLabs API key not configured')
          }

          span.setAttribute("agent_id", EVE_AGENT_ID)
          span.setAttribute("user_id", userId || "anonymous")

          console.log('Starting conversation with ElevenLabs agent:', EVE_AGENT_ID)

          const response = await fetch(`${ELEVENLABS_BASE_URL}/convai/conversations`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'xi-api-key': ELEVENLABS_API_KEY!
            },
            body: JSON.stringify({
              agent_id: EVE_AGENT_ID,
              user_id: userId || `user_${Date.now()}`
            })
          })

          if (!response.ok) {
            const errorText = await response.text()
            console.error('Failed to start conversation:', {
              status: response.status,
              statusText: response.statusText,
              error: errorText
            })
            throw new Error(`Failed to start conversation: ${response.statusText}`)
          }

          const data = await response.json()
          console.log('Conversation started successfully:', data)

          span.setAttribute("conversation_id", data.conversation_id)
          span.setAttribute("success", true)

          return {
            conversationId: data.conversation_id,
            agentId: EVE_AGENT_ID,
            userId: userId
          }
        } catch (error) {
          span.setAttribute("success", false)
          Sentry.captureException(error)
          console.error('Failed to start conversation:', error)
          throw error
        }
      }
    )
  },

  // Send a message to the agent and get response
  async sendMessage(
    conversationId: string,
    message: string,
    audioInput?: Blob
  ): Promise<ConversationResponse> {
    return Sentry.startSpan(
      {
        op: "ai.agent.message",
        name: "Send Message to ElevenLabs Agent",
      },
      async (span) => {
        try {
          if (!this.isConfigured()) {
            throw new Error('ElevenLabs API key not configured')
          }

          span.setAttribute("conversation_id", conversationId)
          span.setAttribute("message_length", message.length)
          span.setAttribute("has_audio_input", !!audioInput)

          console.log('Sending message to agent:', {
            conversationId,
            messageLength: message.length,
            hasAudio: !!audioInput
          })

          // Prepare form data
          const formData = new FormData()
          formData.append('text', message)
          
          if (audioInput) {
            formData.append('audio', audioInput, 'input.wav')
          }

          const response = await fetch(
            `${ELEVENLABS_BASE_URL}/convai/conversations/${conversationId}`,
            {
              method: 'POST',
              headers: {
                'xi-api-key': ELEVENLABS_API_KEY!
              },
              body: formData
            }
          )

          span.setAttribute("api_status", response.status)

          if (!response.ok) {
            const errorText = await response.text()
            console.error('Agent message failed:', {
              status: response.status,
              statusText: response.statusText,
              error: errorText
            })
            throw new Error(`Agent response failed: ${response.statusText}`)
          }

          // The response should be audio
          const audioBlob = await response.blob()
          console.log('Agent response received:', {
            audioSize: audioBlob.size,
            audioType: audioBlob.type
          })

          if (audioBlob.size === 0) {
            throw new Error('Received empty audio response from agent')
          }

          const audioUrl = URL.createObjectURL(audioBlob)

          span.setAttribute("success", true)
          span.setAttribute("audio_size", audioBlob.size)

          return {
            success: true,
            audioUrl,
            conversationId,
            text: message // Echo back the user's message for display
          }

        } catch (error) {
          span.setAttribute("success", false)
          Sentry.captureException(error)
          console.error('Failed to send message to agent:', error)
          
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      }
    )
  },

  // Get conversation history
  async getConversationHistory(conversationId: string) {
    return Sentry.startSpan(
      {
        op: "ai.agent.history",
        name: "Get Agent Conversation History",
      },
      async (span) => {
        try {
          if (!this.isConfigured()) {
            throw new Error('ElevenLabs API key not configured')
          }

          span.setAttribute("conversation_id", conversationId)

          const response = await fetch(
            `${ELEVENLABS_BASE_URL}/convai/conversations/${conversationId}`,
            {
              headers: {
                'xi-api-key': ELEVENLABS_API_KEY!
              }
            }
          )

          if (!response.ok) {
            throw new Error(`Failed to get conversation history: ${response.statusText}`)
          }

          const data = await response.json()
          span.setAttribute("message_count", data.messages?.length || 0)
          
          return data
        } catch (error) {
          Sentry.captureException(error)
          span.setAttribute("error", error instanceof Error ? error.message : 'Unknown error')
          throw error
        }
      }
    )
  },

  // Test the agent connection
  async testAgentConnection(): Promise<{ success: boolean; error?: string; info?: any }> {
    return Sentry.startSpan(
      {
        op: "ai.agent.test",
        name: "Test ElevenLabs Agent Connection",
      },
      async (span) => {
        try {
          if (!this.isConfigured()) {
            return { 
              success: false, 
              error: 'ElevenLabs API key not configured. Please check your .env.local file.' 
            }
          }

          console.log('Testing ElevenLabs agent connection...')

          // Test by getting agent info
          const response = await fetch(`${ELEVENLABS_BASE_URL}/convai/agents/${EVE_AGENT_ID}`, {
            headers: {
              'xi-api-key': ELEVENLABS_API_KEY!
            }
          })

          console.log('ElevenLabs agent test response:', {
            status: response.status,
            statusText: response.statusText
          })

          if (!response.ok) {
            let errorMessage = `Agent test failed: ${response.status} ${response.statusText}`
            
            try {
              const errorText = await response.text()
              const errorData = JSON.parse(errorText)
              errorMessage = errorData.detail?.message || errorData.message || errorMessage
            } catch (e) {
              // Use default error message
            }

            return { success: false, error: errorMessage }
          }

          const agentData = await response.json()
          console.log('ElevenLabs agent connection successful:', agentData)

          span.setAttribute("success", true)
          return { 
            success: true, 
            info: {
              agentId: agentData.agent_id,
              name: agentData.name,
              description: agentData.description
            }
          }

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Agent connection test failed'
          span.setAttribute("error", errorMessage)
          console.error('ElevenLabs agent connection test failed:', error)
          return { success: false, error: errorMessage }
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