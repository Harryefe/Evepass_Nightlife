'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AuthGuard } from '@/components/auth/auth-guard';
import { 
  Bot, Send, Mic, MicOff, Volume2, VolumeX, 
  MapPin, Calendar, CreditCard, Star, Navigation, Settings, Loader2, AlertCircle, CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { elevenLabsAgentService, ConversationSession } from '@/lib/elevenlabs-agent';
import * as Sentry from '@sentry/nextjs';

// Define interfaces for type safety
interface Venue {
  id: number;
  name: string;
  type: string;
  rating: number;
  distance: string;
  priceRange: string;
  currentEvent: string;
}

interface Message {
  id: number;
  type: 'ai' | 'user';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  venues?: Venue[];
  audioUrl?: string;
  isPlaying?: boolean;
}

// Mock conversation data
const initialMessages: Message[] = [
  {
    id: 1,
    type: 'ai',
    content: "Hi! I'm Eve, your AI nightlife assistant. I can help you discover venues, plan your night, manage your budget, and keep you safe. What would you like to do tonight?",
    timestamp: new Date(),
    suggestions: [
      "Find venues near me",
      "Plan a night out",
      "Check my budget",
      "Safety tips"
    ]
  }
];

const mockVenueRecommendations: Venue[] = [
  {
    id: 1,
    name: 'Fabric',
    type: 'Nightclub',
    rating: 4.8,
    distance: '0.5 miles',
    priceRange: '£££',
    currentEvent: 'Saturday Night Sessions'
  },
  {
    id: 2,
    name: 'Ministry of Sound',
    type: 'Nightclub', 
    rating: 4.7,
    distance: '1.2 miles',
    priceRange: '£££',
    currentEvent: 'House Nation'
  }
];

function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'testing' | 'connected' | 'failed'>('unknown');
  const [conversationSession, setConversationSession] = useState<ConversationSession | null>(null);
  const [useAgentMode, setUseAgentMode] = useState(true); // New toggle for agent vs text-to-speech
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Test connection and start conversation on component mount
    initializeAgent();
  }, []);

  // Cleanup audio URLs when component unmounts
  useEffect(() => {
    return () => {
      messages.forEach(message => {
        if (message.audioUrl) {
          elevenLabsAgentService.cleanupAudioUrl(message.audioUrl);
        }
      });
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const initializeAgent = async () => {
    setConnectionStatus('testing');
    
    try {
      // Test agent connection
      const testResult = await elevenLabsAgentService.testAgentConnection();
      
      if (testResult.success) {
        setConnectionStatus('connected');
        
        // Start conversation session
        const session = await elevenLabsAgentService.startConversation(`user_${Date.now()}`);
        setConversationSession(session);
        console.log('Agent conversation started:', session);
      } else {
        setConnectionStatus('failed');
        console.error('Agent connection failed:', testResult.error);
      }
    } catch (error) {
      setConnectionStatus('failed');
      console.error('Agent initialization failed:', error);
    }
  };

  const handleSendMessage = async () => {
    return Sentry.startSpan(
      {
        op: "ui.click",
        name: "Send AI Agent Message",
      },
      async (span) => {
        if (!inputValue.trim()) return;

        span.setAttribute("message_length", inputValue.length);
        span.setAttribute("voice_enabled", voiceEnabled);
        span.setAttribute("agent_mode", useAgentMode);

        const userMessage: Message = {
          id: Date.now(),
          type: 'user',
          content: inputValue,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        const currentInput = inputValue;
        setInputValue('');
        setIsTyping(true);

        try {
          if (useAgentMode && conversationSession && connectionStatus === 'connected') {
            // Use ElevenLabs Conversational AI Agent
            const agentResponse = await elevenLabsAgentService.sendMessage(
              conversationSession.conversationId,
              currentInput
            );

            if (agentResponse.success) {
              const aiMessage: Message = {
                id: Date.now() + 1,
                type: 'ai',
                content: `Eve responded to: "${currentInput}"`, // We don't get text back from agent, just audio
                timestamp: new Date(),
                audioUrl: agentResponse.audioUrl,
                suggestions: generateSuggestions(currentInput)
              };

              setMessages(prev => [...prev, aiMessage]);
              
              // Auto-play the agent's voice response
              if (agentResponse.audioUrl && voiceEnabled) {
                setTimeout(() => playAudio(aiMessage.id, agentResponse.audioUrl!), 500);
              }

              span.setAttribute("agent_response_success", true);
            } else {
              throw new Error(agentResponse.error || 'Agent response failed');
            }
          } else {
            // Fallback to text-based AI response
            const response = await fetch('/api/ai-response', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                message: currentInput,
                conversationHistory: messages,
                voiceEnabled: voiceEnabled && connectionStatus === 'connected',
                context: determineContext(currentInput)
              }),
            });

            if (!response.ok) {
              throw new Error(`API request failed: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.error) {
              throw new Error(data.error);
            }

            const aiResponse: Message = {
              id: Date.now() + 1,
              type: 'ai',
              content: data.text,
              timestamp: new Date(),
              audioUrl: data.audioUrl,
              suggestions: generateSuggestions(data.text),
              venues: shouldShowVenues(data.text) ? mockVenueRecommendations : undefined
            };

            setMessages(prev => [...prev, aiResponse]);
            
            // Auto-play voice response if available
            if (data.audioUrl && voiceEnabled && connectionStatus === 'connected') {
              setTimeout(() => playAudio(aiResponse.id, data.audioUrl), 500);
            }

            span.setAttribute("ai_response_success", true);
          }
        } catch (error) {
          console.error('Failed to get AI response:', error);
          Sentry.captureException(error);
          
          const errorMessage: Message = {
            id: Date.now() + 1,
            type: 'ai',
            content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment, or feel free to explore the app while I get back online!",
            timestamp: new Date(),
            suggestions: ["Find venues", "Check safety features", "Explore social hub"]
          };

          setMessages(prev => [...prev, errorMessage]);
          span.setAttribute("ai_response_success", false);
        } finally {
          setIsTyping(false);
        }
      }
    );
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        
        if (conversationSession && useAgentMode) {
          setIsTyping(true);
          
          try {
            const agentResponse = await elevenLabsAgentService.sendMessage(
              conversationSession.conversationId,
              '', // No text, just audio
              audioBlob
            );

            if (agentResponse.success) {
              const userMessage: Message = {
                id: Date.now(),
                type: 'user',
                content: '[Voice message]',
                timestamp: new Date()
              };

              const aiMessage: Message = {
                id: Date.now() + 1,
                type: 'ai',
                content: 'Eve responded to your voice message',
                timestamp: new Date(),
                audioUrl: agentResponse.audioUrl
              };

              setMessages(prev => [...prev, userMessage, aiMessage]);
              
              if (agentResponse.audioUrl && voiceEnabled) {
                setTimeout(() => playAudio(aiMessage.id, agentResponse.audioUrl!), 500);
              }
            }
          } catch (error) {
            console.error('Voice message failed:', error);
          } finally {
            setIsTyping(false);
          }
        }
        
        // Cleanup
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleListening = () => {
    if (isRecording) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
    }
  };

  const determineContext = (message: string): string => {
    const input = message.toLowerCase();
    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) return 'greeting';
    if (input.includes('emergency') || input.includes('help') || input.includes('urgent')) return 'emergency';
    if (input.includes('plan') || input.includes('night out')) return 'helpful';
    return 'casual';
  };

  const generateSuggestions = (aiResponse: string): string[] => {
    const response = aiResponse.toLowerCase();
    
    if (response.includes('venue') || response.includes('club')) {
      return ["Book a table", "See venue details", "Check events tonight", "Get directions"];
    }
    if (response.includes('budget') || response.includes('money')) {
      return ["Set budget limit", "Track spending", "View history", "Budget tips"];
    }
    if (response.includes('plan') || response.includes('itinerary')) {
      return ["Create night plan", "Add venues", "Invite friends", "Set reminders"];
    }
    if (response.includes('safe') || response.includes('drunksafe')) {
      return ["Setup DrunkSafe™", "Add emergency contacts", "Safety tips", "Check BAC"];
    }
    
    return ["Find venues", "Plan night", "Safety features", "Social hub"];
  };

  const shouldShowVenues = (aiResponse: string): boolean => {
    return aiResponse.toLowerCase().includes('venue') || 
           aiResponse.toLowerCase().includes('recommend') ||
           aiResponse.toLowerCase().includes('fabric') ||
           aiResponse.toLowerCase().includes('ministry');
  };

  const playAudio = async (messageId: number, audioUrl: string) => {
    return Sentry.startSpan(
      {
        op: "ui.audio.play",
        name: "Play AI Voice Response",
      },
      async (span) => {
        try {
          // Stop any currently playing audio
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
          }

          setCurrentlyPlaying(messageId);
          
          // Update message state to show playing
          setMessages(prev => prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, isPlaying: true }
              : { ...msg, isPlaying: false }
          ));

          // Create and play audio
          const audio = new Audio(audioUrl);
          audioRef.current = audio;

          audio.onended = () => {
            setCurrentlyPlaying(null);
            setMessages(prev => prev.map(msg => ({ ...msg, isPlaying: false })));
            audioRef.current = null;
            // Cleanup the blob URL
            elevenLabsAgentService.cleanupAudioUrl(audioUrl);
          };

          audio.onerror = (error) => {
            console.error('Audio playback error:', error);
            setCurrentlyPlaying(null);
            setMessages(prev => prev.map(msg => ({ ...msg, isPlaying: false })));
            audioRef.current = null;
          };

          await audio.play();
          span.setAttribute("audio_played", true);
        } catch (error) {
          console.error('Failed to play audio:', error);
          Sentry.captureException(error);
          setCurrentlyPlaying(null);
          setMessages(prev => prev.map(msg => ({ ...msg, isPlaying: false })));
          span.setAttribute("audio_played", false);
        }
      }
    );
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setCurrentlyPlaying(null);
    setMessages(prev => prev.map(msg => ({ ...msg, isPlaying: false })));
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'testing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getConnectionStatusText = () => {
    if (useAgentMode) {
      switch (connectionStatus) {
        case 'connected':
          return 'Eve Agent Ready';
        case 'failed':
          return 'Agent Unavailable';
        case 'testing':
          return 'Connecting to Eve...';
        default:
          return 'Agent Status Unknown';
      }
    } else {
      switch (connectionStatus) {
        case 'connected':
          return 'Voice Ready';
        case 'failed':
          return 'Voice Unavailable';
        case 'testing':
          return 'Testing Voice...';
        default:
          return 'Voice Status Unknown';
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-lg border-b border-purple-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Eve AI Assistant</h1>
                <p className="text-sm text-gray-400">Your intelligent nightlife companion</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`border-purple-400 ${voiceEnabled ? 'text-purple-400 bg-purple-400/20' : 'text-gray-400'}`}
              >
                {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={initializeAgent}
                className="text-xs"
              >
                {getConnectionStatusIcon()}
                <span className="ml-1">{getConnectionStatusText()}</span>
              </Button>
              <Link href="/explore">
                <Button variant="outline" size="sm" className="border-purple-400 text-purple-400">
                  Back to Explore
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Agent Settings */}
        {voiceEnabled && (
          <Card className="bg-white/5 border-purple-500/20 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bot className="h-4 w-4 text-purple-400" />
                  <span className="text-sm text-white">Eve AI Agent</span>
                  {getConnectionStatusIcon()}
                  <span className="text-xs text-gray-400">{getConnectionStatusText()}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={useAgentMode}
                      onChange={(e) => setUseAgentMode(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-gray-300">Use Conversational AI</span>
                  </label>
                </div>
              </div>
              
              {connectionStatus === 'failed' && (
                <div className="mt-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <div className="flex items-center space-x-2 text-red-400 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>
                      {useAgentMode 
                        ? 'Conversational AI unavailable. Check your ElevenLabs agent configuration.'
                        : 'Voice features unavailable. Check your ElevenLabs API configuration.'
                      }
                    </span>
                  </div>
                </div>
              )}

              {connectionStatus === 'connected' && useAgentMode && conversationSession && (
                <div className="mt-3 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                  <div className="flex items-center space-x-2 text-green-400 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    <span>Connected to Eve AI Agent - Full conversational experience enabled!</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Chat Messages */}
        <div className="space-y-6 mb-8">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-3xl ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                <div className={`flex items-start space-x-3 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
                      : 'bg-gradient-to-r from-blue-600 to-cyan-600'
                  }`}>
                    {message.type === 'user' ? (
                      <span className="text-white text-sm font-medium">U</span>
                    ) : (
                      <Bot className="h-4 w-4 text-white" />
                    )}
                  </div>
                  
                  <div className={`flex-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                    <Card className={`${
                      message.type === 'user' 
                        ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30' 
                        : 'bg-white/5 border-blue-500/20'
                    } backdrop-blur-lg`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <p className="text-white flex-1">{message.content}</p>
                          {message.type === 'ai' && message.audioUrl && voiceEnabled && connectionStatus === 'connected' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => message.isPlaying ? stopAudio() : playAudio(message.id, message.audioUrl!)}
                              className="ml-2 text-blue-400 hover:text-blue-300"
                            >
                              {message.isPlaying ? (
                                <VolumeX className="h-4 w-4" />
                              ) : (
                                <Volume2 className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                        
                        {/* Venue Recommendations */}
                        {message.venues && (
                          <div className="mt-4 space-y-3">
                            {message.venues.map((venue) => (
                              <div key={venue.id} className="p-3 bg-white/10 rounded-lg border border-purple-500/20">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="text-white font-medium">{venue.name}</h4>
                                  <div className="flex items-center space-x-1">
                                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                    <span className="text-sm text-gray-300">{venue.rating}</span>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between text-sm text-gray-400">
                                  <span>{venue.type} • {venue.distance}</span>
                                  <Badge className="bg-purple-600/20 text-purple-300">{venue.priceRange}</Badge>
                                </div>
                                <p className="text-sm text-purple-300 mt-1">{venue.currentEvent}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Suggestions */}
                        {message.suggestions && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {message.suggestions.map((suggestion, index) => (
                              <Button
                                key={index}
                                size="sm"
                                variant="outline"
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="border-purple-400/50 text-purple-300 hover:bg-purple-400/20 text-xs"
                              >
                                {suggestion}
                              </Button>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    <p className="text-xs text-gray-500 mt-1 px-4">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <Card className="bg-white/5 border-blue-500/20 backdrop-blur-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                      <span className="text-blue-400 text-sm">Eve is thinking...</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <Card className="bg-white/5 border-purple-500/20 backdrop-blur-lg sticky bottom-4">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="flex-1 relative">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isTyping && handleSendMessage()}
                  placeholder="Ask Eve anything about nightlife..."
                  className="bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400 pr-12"
                  disabled={isTyping}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleListening}
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${
                    isRecording ? 'text-red-400' : 'text-gray-400'
                  }`}
                  disabled={!useAgentMode || connectionStatus !== 'connected'}
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isTyping ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSuggestionClick("Find venues near me")}
                className="border-purple-400/50 text-purple-300 hover:bg-purple-400/20 text-xs"
              >
                <MapPin className="h-3 w-3 mr-1" />
                Find Venues
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSuggestionClick("Plan my night")}
                className="border-purple-400/50 text-purple-300 hover:bg-purple-400/20 text-xs"
              >
                <Calendar className="h-3 w-3 mr-1" />
                Plan Night
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSuggestionClick("Check my budget")}
                className="border-purple-400/50 text-purple-300 hover:bg-purple-400/20 text-xs"
              >
                <CreditCard className="h-3 w-3 mr-1" />
                Budget Help
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSuggestionClick("Safety tips")}
                className="border-purple-400/50 text-purple-300 hover:bg-purple-400/20 text-xs"
              >
                <Navigation className="h-3 w-3 mr-1" />
                Safety
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Wrap the component with AuthGuard to require authentication
export default function AIAssistantPageWithAuth() {
  return (
    <AuthGuard allowedUserTypes={['customer']}>
      <AIAssistantPage />
    </AuthGuard>
  );
}