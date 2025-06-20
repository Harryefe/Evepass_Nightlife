'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AuthGuard } from '@/components/auth/auth-guard';
import { EvePassKnowledgeService } from '@/lib/evepass-knowledge';
import { 
  Bot, Send, Mic, MicOff, Volume2, VolumeX, 
  MapPin, Calendar, CreditCard, Star, Navigation, Settings, Loader2, AlertCircle, CheckCircle, ExternalLink,
  Brain, Search, BookOpen, Users, Shield, Music, Wine
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
  platformStats?: any;
}

// Mock conversation data with EvePass knowledge
const initialMessages: Message[] = [
  {
    id: 1,
    type: 'ai',
    content: "Hi! I'm Eve, your AI nightlife assistant powered by the complete EvePass knowledge base! 🌟 I can help you discover venues, plan your perfect night, manage your budget with DrunkSafe™, explore social features like Share a Bottle, and keep you safe. I know everything about EvePass - from our 2,500+ partner venues to our 98% safety score. What would you like to explore tonight?",
    timestamp: new Date(),
    suggestions: [
      "Find venues near me",
      "How does DrunkSafe work?", 
      "Plan my perfect night",
      "What is Share a Bottle?",
      "Show me safety features",
      "How to request songs?"
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

// Global flag to track if the widget script has been loaded
let widgetScriptLoaded = false;
let widgetScriptPromise: Promise<boolean> | null = null;

function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [widgetMode, setWidgetMode] = useState<'embedded' | 'chat'>('embedded');
  const [widgetLoaded, setWidgetLoaded] = useState(false);
  const [widgetError, setWidgetError] = useState<string | null>(null);
  const [showKnowledgeSearch, setShowKnowledgeSearch] = useState(false);
  const [knowledgeQuery, setKnowledgeQuery] = useState('');
  const [knowledgeResults, setKnowledgeResults] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const widgetContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Only load the widget script if we're in embedded mode
    if (widgetMode === 'embedded') {
      loadElevenLabsWidget();
    }
  }, [widgetMode]);

  const loadElevenLabsWidget = async () => {
    try {
      // If script is already loaded or loading, wait for it
      if (widgetScriptPromise) {
        const success = await widgetScriptPromise;
        setWidgetLoaded(success);
        setWidgetError(success ? null : 'Failed to load widget script');
        return;
      }

      // If script was already loaded successfully, just set state
      if (widgetScriptLoaded) {
        setWidgetLoaded(true);
        setWidgetError(null);
        return;
      }

      // Check if custom element is already defined
      if (customElements.get('elevenlabs-convai')) {
        console.log('ElevenLabs widget already registered');
        widgetScriptLoaded = true;
        setWidgetLoaded(true);
        setWidgetError(null);
        return;
      }

      // Create a promise for script loading
      widgetScriptPromise = new Promise((resolve) => {
        // Check if script already exists in DOM
        const existingScript = document.querySelector('script[src*="convai-widget-embed"]');
        if (existingScript) {
          console.log('ElevenLabs script already exists in DOM');
          // Wait a bit for it to load if it hasn't already
          setTimeout(() => {
            const isLoaded = customElements.get('elevenlabs-convai');
            if (isLoaded) {
              widgetScriptLoaded = true;
              resolve(true);
            } else {
              resolve(false);
            }
          }, 1000);
          return;
        }

        // Create and load the script
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
        script.async = true;
        script.type = 'text/javascript';
        
        script.onload = () => {
          console.log('ElevenLabs widget script loaded successfully');
          // Give it a moment to register the custom element
          setTimeout(() => {
            const isRegistered = customElements.get('elevenlabs-convai');
            if (isRegistered) {
              widgetScriptLoaded = true;
              resolve(true);
            } else {
              console.error('Custom element not registered after script load');
              resolve(false);
            }
          }, 500);
        };
        
        script.onerror = (error) => {
          console.error('Failed to load ElevenLabs widget script:', error);
          resolve(false);
        };

        // Add script to head
        document.head.appendChild(script);
      });

      // Wait for the script to load
      const success = await widgetScriptPromise;
      setWidgetLoaded(success);
      setWidgetError(success ? null : 'Failed to load ElevenLabs widget');

    } catch (error) {
      console.error('Error loading ElevenLabs widget:', error);
      setWidgetError('Error loading widget');
      setWidgetLoaded(false);
      Sentry.captureException(error);
    }
  };

  const handleSendMessage = async () => {
    return Sentry.startSpan(
      {
        op: "ui.click",
        name: "Send AI Message with EvePass Knowledge",
      },
      async (span) => {
        if (!inputValue.trim()) return;

        span.setAttribute("message_length", inputValue.length);
        span.setAttribute("knowledge_enhanced", true);

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
          // Call the enhanced AI API with EvePass knowledge
          const response = await fetch('/api/ai-response', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: currentInput,
              conversationHistory: messages,
              voiceEnabled: false, // For text chat mode
              context: 'helpful'
            }),
          });

          if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
          }

          const data = await response.json();
          
          const aiResponse: Message = {
            id: Date.now() + 1,
            type: 'ai',
            content: data.text,
            timestamp: new Date(),
            suggestions: generateContextualSuggestions(currentInput),
            venues: shouldShowVenues(currentInput) ? mockVenueRecommendations : undefined,
            platformStats: data.platformStats
          };

          setMessages(prev => [...prev, aiResponse]);
          span.setAttribute("ai_response_success", true);
        } catch (error) {
          console.error('Failed to get AI response:', error);
          Sentry.captureException(error);
          
          const errorMessage: Message = {
            id: Date.now() + 1,
            type: 'ai',
            content: "I'm having trouble connecting right now, but I can still help! Try asking about EvePass features, DrunkSafe™, venue discovery, or our social features. You can also try the voice widget!",
            timestamp: new Date(),
            suggestions: ["Try voice widget", "What is DrunkSafe?", "Find venues", "Social features"]
          };

          setMessages(prev => [...prev, errorMessage]);
          span.setAttribute("ai_response_success", false);
        } finally {
          setIsTyping(false);
        }
      }
    );
  };

  const generateContextualSuggestions = (userInput: string): string[] => {
    const input = userInput.toLowerCase();
    
    if (input.includes('venue') || input.includes('club')) {
      return ["Book a table", "Plan my night", "Check safety features", "Find similar venues"];
    }
    
    if (input.includes('safe') || input.includes('drunk')) {
      return ["Set up safety profile", "Emergency contacts", "Budget tracking", "Transport options"];
    }
    
    if (input.includes('plan') || input.includes('night')) {
      return ["Find venues", "Set budget", "Add friends", "Check DrunkSafe"];
    }
    
    if (input.includes('bottle') || input.includes('share')) {
      return ["Create bottle share", "Join existing share", "Split the bill", "Find social venues"];
    }
    
    if (input.includes('song') || input.includes('music')) {
      return ["Request a song", "Find music venues", "Check DJ lineup", "Explore genres"];
    }
    
    return ["Find venues", "Plan night", "Safety features", "Social features"];
  };

  const shouldShowVenues = (userInput: string): boolean => {
    const input = userInput.toLowerCase();
    return input.includes('venue') || input.includes('club') || input.includes('bar') || input.includes('find');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const handleModeSwitch = (mode: 'embedded' | 'chat') => {
    setWidgetMode(mode);
    if (mode === 'embedded') {
      setWidgetError(null);
      setWidgetLoaded(false);
    }
  };

  const handleKnowledgeSearch = () => {
    if (!knowledgeQuery.trim()) return;
    
    const results = EvePassKnowledgeService.searchKnowledge(knowledgeQuery);
    setKnowledgeResults(results);
  };

  const handleKnowledgeInsert = (item: any) => {
    let query = '';
    
    switch (item.type) {
      case 'terminology':
        query = `What is ${item.term}?`;
        break;
      case 'faq':
        query = item.question;
        break;
      case 'feature':
        query = `Tell me about ${item.feature.name}`;
        break;
      default:
        query = knowledgeQuery;
    }
    
    setInputValue(query);
    setShowKnowledgeSearch(false);
    setKnowledgeQuery('');
    setKnowledgeResults([]);
  };

  const platformStats = EvePassKnowledgeService.getPlatformStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black text-white">
      {/* Enhanced Header with Knowledge Base Info */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-lg border-b border-purple-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Eve AI Assistant</h1>
                <p className="text-sm text-gray-400">Enhanced with complete EvePass knowledge base</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowKnowledgeSearch(!showKnowledgeSearch)}
                className="text-gray-400 hover:text-white"
              >
                <Search className="h-4 w-4 mr-2" />
                Knowledge
              </Button>
              <div className="flex items-center space-x-1">
                {widgetMode === 'embedded' ? (
                  widgetLoaded ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : widgetError ? (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  ) : (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  )
                ) : (
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                )}
                <span className="text-xs text-gray-400">
                  {widgetMode === 'embedded' ? (
                    widgetLoaded ? 'Voice AI Ready' : 
                    widgetError ? 'Widget Error' : 'Loading Widget...'
                  ) : 'Enhanced Chat Ready'}
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
        {/* Knowledge Search Panel */}
        {showKnowledgeSearch && (
          <Card className="bg-white/5 border-purple-500/20 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-purple-400" />
                EvePass Knowledge Base Search
              </CardTitle>
              <CardDescription className="text-gray-400">
                Search through EvePass terminology, features, and FAQs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Search EvePass knowledge..."
                  value={knowledgeQuery}
                  onChange={(e) => setKnowledgeQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleKnowledgeSearch()}
                  className="bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400"
                />
                <Button onClick={handleKnowledgeSearch} className="bg-purple-600 hover:bg-purple-700">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              
              {knowledgeResults.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {knowledgeResults.map((item, index) => (
                    <div 
                      key={index}
                      onClick={() => handleKnowledgeInsert(item)}
                      className="p-3 bg-white/10 rounded-lg border border-purple-500/30 cursor-pointer hover:bg-white/20 transition-colors"
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge className="bg-purple-600/20 text-purple-300 text-xs">
                          {item.type}
                        </Badge>
                        <span className="text-white font-medium text-sm">
                          {item.type === 'terminology' ? item.term : 
                           item.type === 'faq' ? item.question :
                           item.feature?.name}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs line-clamp-2">
                        {item.type === 'terminology' ? item.definition :
                         item.type === 'faq' ? item.answer :
                         item.feature?.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Platform Stats Display */}
        <Card className="bg-white/5 border-purple-500/20 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Brain className="h-5 w-5 text-purple-400" />
                <span className="text-white font-medium">EvePass Platform Stats</span>
              </div>
              <div className="flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <div className="text-purple-400 font-bold">{platformStats.partnerVenues}</div>
                  <div className="text-gray-400 text-xs">Partner Venues</div>
                </div>
                <div className="text-center">
                  <div className="text-green-400 font-bold">{platformStats.safetyScore}</div>
                  <div className="text-gray-400 text-xs">Safety Score</div>
                </div>
                <div className="text-center">
                  <div className="text-yellow-400 font-bold">{platformStats.userRating}</div>
                  <div className="text-gray-400 text-xs">User Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-pink-400 font-bold">{platformStats.nightPlansCreated}</div>
                  <div className="text-gray-400 text-xs">Night Plans</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
                  onClick={() => handleModeSwitch('embedded')}
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
                  onClick={() => handleModeSwitch('chat')}
                  className={widgetMode === 'chat' 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'border-blue-400 text-blue-400'
                  }
                >
                  <Send className="h-4 w-4 mr-2" />
                  Enhanced Text Chat
                </Button>
              </div>
            </div>
            
            <div className="mt-3 text-sm text-gray-400">
              {widgetMode === 'embedded' ? (
                <div className="flex items-center space-x-2">
                  {widgetLoaded ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : widgetError ? (
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  ) : (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                  )}
                  <span>
                    {widgetLoaded ? 'Full voice conversation with ElevenLabs AI - speak naturally with Eve!' :
                     widgetError ? 'Widget failed to load - try refreshing or use enhanced text chat' :
                     'Loading voice AI widget...'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-blue-400" />
                  <span>Enhanced text chat with complete EvePass knowledge base, venue recommendations, and intelligent suggestions</span>
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
              {widgetError ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">Widget Loading Error</h3>
                  <p className="text-gray-400 mb-4">{widgetError}</p>
                  <div className="space-y-2">
                    <Button 
                      onClick={() => {
                        setWidgetError(null);
                        setWidgetLoaded(false);
                        loadElevenLabsWidget();
                      }}
                      className="bg-purple-600 hover:bg-purple-700 mr-2"
                    >
                      Retry Loading
                    </Button>
                    <Button 
                      onClick={() => handleModeSwitch('chat')}
                      variant="outline" 
                      className="border-blue-400 text-blue-400"
                    >
                      Use Enhanced Text Chat Instead
                    </Button>
                  </div>
                </div>
              ) : widgetLoaded ? (
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
                    <div className="flex justify-center" ref={widgetContainerRef}>
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
                        <li>• Complete EvePass knowledge</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
                      <h4 className="text-blue-400 font-medium mb-2">🎯 Try Asking</h4>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• "What is DrunkSafe technology?"</li>
                        <li>• "How does Share a Bottle work?"</li>
                        <li>• "Find me venues tonight"</li>
                        <li>• "Plan my perfect night out"</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-400" />
                  <p className="text-gray-400">Loading voice AI widget...</p>
                  <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Enhanced Text Chat Mode */}
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
                            
                            {/* Platform Stats Display */}
                            {message.platformStats && message.type === 'ai' && (
                              <div className="mt-4 p-3 bg-purple-500/20 rounded-lg border border-purple-500/30">
                                <h4 className="text-purple-400 font-medium mb-2 flex items-center">
                                  <Brain className="h-4 w-4 mr-2" />
                                  EvePass Platform Insights
                                </h4>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div className="text-gray-300">
                                    <span className="text-purple-400 font-medium">{message.platformStats.partnerVenues}</span> Partner Venues
                                  </div>
                                  <div className="text-gray-300">
                                    <span className="text-green-400 font-medium">{message.platformStats.safetyScore}</span> Safety Score
                                  </div>
                                  <div className="text-gray-300">
                                    <span className="text-yellow-400 font-medium">{message.platformStats.userRating}</span> User Rating
                                  </div>
                                  <div className="text-gray-300">
                                    <span className="text-pink-400 font-medium">{message.platformStats.nightPlansCreated}</span> Night Plans
                                  </div>
                                </div>
                              </div>
                            )}
                            
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
                            
                            {/* Enhanced Suggestions */}
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
                          <span className="text-blue-400 text-sm">Eve is thinking with enhanced knowledge...</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Enhanced Input Area */}
            <Card className="bg-white/5 border-purple-500/20 backdrop-blur-lg sticky bottom-4">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-1 relative">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !isTyping && handleSendMessage()}
                      placeholder="Ask Eve anything about EvePass, nightlife, safety, or planning..."
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
                
                {/* Enhanced Quick Actions */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSuggestionClick("What is DrunkSafe technology?")}
                    className="border-purple-400/50 text-purple-300 hover:bg-purple-400/20 text-xs"
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    DrunkSafe™
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSuggestionClick("How does Share a Bottle work?")}
                    className="border-purple-400/50 text-purple-300 hover:bg-purple-400/20 text-xs"
                  >
                    <Wine className="h-3 w-3 mr-1" />
                    Share a Bottle
                  </Button>
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
                    onClick={() => handleSuggestionClick("Plan my perfect night")}
                    className="border-purple-400/50 text-purple-300 hover:bg-purple-400/20 text-xs"
                  >
                    <Calendar className="h-3 w-3 mr-1" />
                    Plan Night
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSuggestionClick("How to request songs?")}
                    className="border-purple-400/50 text-purple-300 hover:bg-purple-400/20 text-xs"
                  >
                    <Music className="h-3 w-3 mr-1" />
                    Song Requests
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Enhanced Feature Showcase */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <Card className="bg-white/5 border-purple-500/20">
            <CardContent className="p-6 text-center">
              <Shield className="h-8 w-8 text-purple-400 mx-auto mb-3" />
              <h3 className="text-white font-medium mb-2">DrunkSafe™ Technology</h3>
              <p className="text-gray-400 text-sm">AI-powered BAC monitoring with 98% safety score</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 border-blue-500/20">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-blue-400 mx-auto mb-3" />
              <h3 className="text-white font-medium mb-2">Social Features</h3>
              <p className="text-gray-400 text-sm">Share bottles, split bills, and connect with others</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 border-green-500/20">
            <CardContent className="p-6 text-center">
              <Brain className="h-8 w-8 text-green-400 mx-auto mb-3" />
              <h3 className="text-white font-medium mb-2">Complete Knowledge Base</h3>
              <p className="text-gray-400 text-sm">Enhanced with all EvePass features and workflows</p>
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