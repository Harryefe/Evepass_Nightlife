'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AuthGuard } from '@/components/auth/auth-guard';
import { 
  Bot, Send, Mic, MicOff, Volume2, VolumeX, 
  MapPin, Calendar, CreditCard, Star, Navigation, Settings, Loader2, AlertCircle, CheckCircle, ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
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
  const [isTyping, setIsTyping] = useState(false);
  const [widgetMode, setWidgetMode] = useState<'embedded' | 'chat'>('embedded');
  const [widgetLoaded, setWidgetLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load the ElevenLabs widget script
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
    script.async = true;
    script.type = 'text/javascript';
    
    script.onload = () => {
      console.log('ElevenLabs widget script loaded');
      setWidgetLoaded(true);
    };
    
    script.onerror = () => {
      console.error('Failed to load ElevenLabs widget script');
      setWidgetLoaded(false);
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const handleSendMessage = async () => {
    return Sentry.startSpan(
      {
        op: "ui.click",
        name: "Send AI Message",
      },
      async (span) => {
        if (!inputValue.trim()) return;

        span.setAttribute("message_length", inputValue.length);

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
          // Simulate AI response for chat mode
          setTimeout(() => {
            const aiResponse = generateAIResponse(currentInput);
            setMessages(prev => [...prev, aiResponse]);
            setIsTyping(false);
          }, 1500);

          span.setAttribute("ai_response_success", true);
        } catch (error) {
          console.error('Failed to get AI response:', error);
          Sentry.captureException(error);
          
          const errorMessage: Message = {
            id: Date.now() + 1,
            type: 'ai',
            content: "I'm sorry, I'm having trouble connecting right now. Please try the voice widget or feel free to explore the app!",
            timestamp: new Date(),
            suggestions: ["Try voice widget", "Find venues", "Check safety features"]
          };

          setMessages(prev => [...prev, errorMessage]);
          setIsTyping(false);
          span.setAttribute("ai_response_success", false);
        }
      }
    );
  };

  const generateAIResponse = (userInput: string): Message => {
    const input = userInput.toLowerCase();
    
    if (input.includes('venue') || input.includes('club') || input.includes('bar')) {
      return {
        id: Date.now(),
        type: 'ai',
        content: "I found some great venues near you! Here are my top recommendations based on your location and preferences:",
        timestamp: new Date(),
        venues: mockVenueRecommendations,
        suggestions: ["Book a table", "Add to night plan", "Get directions", "See more venues"]
      };
    }
    
    if (input.includes('budget') || input.includes('money') || input.includes('spend')) {
      return {
        id: Date.now(),
        type: 'ai',
        content: "Let me help you manage your budget for tonight. Based on your spending history, I recommend setting a limit of £120 for a great night out. Would you like me to track your spending?",
        timestamp: new Date(),
        suggestions: ["Set budget limit", "View spending history", "Enable alerts", "Budget tips"]
      };
    }
    
    if (input.includes('plan') || input.includes('itinerary')) {
      return {
        id: Date.now(),
        type: 'ai',
        content: "I'd love to help you plan the perfect night! Based on your preferences, I suggest starting with pre-drinks at a cocktail bar around 8 PM, then moving to a nightclub by 10:30 PM. Would you like me to create a detailed itinerary?",
        timestamp: new Date(),
        suggestions: ["Create night plan", "Find pre-drinks spot", "Book tables", "Set reminders"]
      };
    }
    
    if (input.includes('safe') || input.includes('safety') || input.includes('drunk')) {
      return {
        id: Date.now(),
        type: 'ai',
        content: "Safety is my top priority! I can help you stay safe with budget alerts, BAC monitoring, ride reminders, and emergency contacts. Your current safety status looks good. Would you like me to set up any safety features?",
        timestamp: new Date(),
        suggestions: ["Set up DrunkSafe", "Add emergency contacts", "Book return ride", "Safety tips"]
      };
    }
    
    return {
      id: Date.now(),
      type: 'ai',
      content: "I'm here to help with all your nightlife needs! I can assist with venue discovery, night planning, budget management, and safety features. What would you like to explore?",
      timestamp: new Date(),
      suggestions: ["Find venues", "Plan night", "Budget help", "Safety features"]
    };
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
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
              <div className="flex items-center space-x-1">
                {widgetLoaded ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                )}
                <span className="text-xs text-gray-400">
                  {widgetLoaded ? 'Voice AI Ready' : 'Loading...'}
                </span>
              </div>
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
        {/* Mode Selection */}
        <Card className="bg-white/5 border-purple-500/20 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bot className="h-5 w-5 text-purple-400" />
                <span className="text-white font-medium">Choose Your Experience</span>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  size="sm"
                  variant={widgetMode === 'embedded' ? 'default' : 'outline'}
                  onClick={() => setWidgetMode('embedded')}
                  className={widgetMode === 'embedded' 
                    ? 'bg-purple-600 hover:bg-purple-700' 
                    : 'border-purple-400 text-purple-400'
                  }
                >
                  <Mic className="h-4 w-4 mr-2" />
                  Voice Chat
                </Button>
                <Button
                  size="sm"
                  variant={widgetMode === 'chat' ? 'default' : 'outline'}
                  onClick={() => setWidgetMode('chat')}
                  className={widgetMode === 'chat' 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'border-blue-400 text-blue-400'
                  }
                >
                  <Send className="h-4 w-4 mr-2" />
                  Text Chat
                </Button>
              </div>
            </div>
            
            <div className="mt-3 text-sm text-gray-400">
              {widgetMode === 'embedded' ? (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>Full voice conversation with ElevenLabs AI - speak naturally with Eve!</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-blue-400" />
                  <span>Text-based chat with venue recommendations and suggestions</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Voice Widget Mode */}
        {widgetMode === 'embedded' && (
          <Card className="bg-white/5 border-purple-500/20 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Mic className="h-5 w-5 mr-2 text-purple-400" />
                Voice Conversation with Eve
              </CardTitle>
              <CardDescription className="text-gray-400">
                Speak naturally with Eve using advanced conversational AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              {widgetLoaded ? (
                <div className="space-y-4">
                  {/* ElevenLabs Widget Container */}
                  <div className="bg-black/50 rounded-lg p-6 border border-purple-500/30">
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Bot className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-white font-medium mb-2">Eve is ready to chat!</h3>
                      <p className="text-gray-400 text-sm">Click the microphone below to start a voice conversation</p>
                    </div>
                    
                    {/* ElevenLabs Widget */}
                    <div className="flex justify-center">
                      <elevenlabs-convai agent-id="agent_01jy55g4rae74rc7vktwjw0mjv"></elevenlabs-convai>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                      <h4 className="text-green-400 font-medium mb-2">✨ Voice Features</h4>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• Natural voice conversations</li>
                        <li>• Real-time responses</li>
                        <li>• Context awareness</li>
                        <li>• Memory of your chat</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
                      <h4 className="text-blue-400 font-medium mb-2">🎯 Try Asking</h4>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• "Find me venues tonight"</li>
                        <li>• "Help me plan my night"</li>
                        <li>• "What safety features do you have?"</li>
                        <li>• "Tell me about bottle sharing"</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-400" />
                  <p className="text-gray-400">Loading voice AI widget...</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Text Chat Mode */}
        {widgetMode === 'chat' && (
          <>
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
                            <p className="text-white">{message.content}</p>
                            
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
                      className="bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400"
                      disabled={isTyping}
                    />
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
          </>
        )}

        {/* Feature Showcase */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <Card className="bg-white/5 border-purple-500/20">
            <CardContent className="p-6 text-center">
              <MapPin className="h-8 w-8 text-purple-400 mx-auto mb-3" />
              <h3 className="text-white font-medium mb-2">Venue Discovery</h3>
              <p className="text-gray-400 text-sm">Find the perfect spots for your night out</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 border-blue-500/20">
            <CardContent className="p-6 text-center">
              <Calendar className="h-8 w-8 text-blue-400 mx-auto mb-3" />
              <h3 className="text-white font-medium mb-2">Night Planning</h3>
              <p className="text-gray-400 text-sm">Create the perfect itinerary with Eve's help</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 border-green-500/20">
            <CardContent className="p-6 text-center">
              <Navigation className="h-8 w-8 text-green-400 mx-auto mb-3" />
              <h3 className="text-white font-medium mb-2">Safety First</h3>
              <p className="text-gray-400 text-sm">DrunkSafe™ keeps you protected all night</p>
            </CardContent>
          </Card>
        </div>
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