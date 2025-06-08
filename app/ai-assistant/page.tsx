'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, Send, Mic, MicOff, Volume2, VolumeX, 
  MapPin, Calendar, CreditCard, Star, Navigation
} from 'lucide-react';
import Link from 'next/link';

// Mock conversation data
const initialMessages = [
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

const mockVenueRecommendations = [
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

export default function AIAssistantPage() {
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user' as const,
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputValue);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): any => {
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

  const toggleListening = () => {
    setIsListening(!isListening);
    // In a real app, this would start/stop speech recognition
  };

  const toggleSpeaking = () => {
    setIsSpeaking(!isSpeaking);
    // In a real app, this would start/stop text-to-speech
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
                onClick={toggleSpeaking}
                className={`border-purple-400 ${isSpeaking ? 'text-purple-400 bg-purple-400/20' : 'text-purple-400'}`}
              >
                {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
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
                            {message.venues.map((venue: any) => (
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
                            {message.suggestions.map((suggestion: string, index: number) => (
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
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask Eve anything about nightlife..."
                  className="bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400 pr-12"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleListening}
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${
                    isListening ? 'text-red-400' : 'text-gray-400'
                  }`}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Send className="h-4 w-4" />
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