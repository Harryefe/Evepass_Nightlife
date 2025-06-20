import * as Sentry from '@sentry/nextjs'

// EvePass Knowledge Base - Core terminology and definitions
export const EVEPASS_TERMINOLOGY = {
  // Core Platform Terms
  'evepass': 'The official name of the nightlife application - a revolutionary AI-powered platform for discovering clubs, planning nights out, and staying safe.',
  'eve ai assistant': 'Your personal Artificial Intelligence guide within the app, designed to help plan your night with personalized recommendations.',
  'drunksafe technology': 'The pioneering in-app feature that monitors alcohol consumption, estimates BAC, and provides safety assistance.',
  'bac': 'Blood Alcohol Content - An estimated measure of alcohol in a person\'s bloodstream, calculated by the DrunkSafe technology.',
  'drinking tolerance level': 'A user-selected setting (Low, Moderate, High, Custom) that personalizes the DrunkSafe warnings to the individual\'s alcohol response.',
  
  // App Features
  'explorer': 'The section of the app dedicated to discovering and browsing nightclubs and venues.',
  'share a bottle': 'A unique feature allowing users to find others to split the cost of a full bottle of drinks at a venue, fostering social connection and affordability.',
  'split the bill': 'A feature allowing users to easily divide the cost of a group order or tab.',
  'plan my night': 'The core function of Eve AI where it creates personalized nightlife itineraries for the user.',
  'song request': 'The feature allowing users to send song requests directly to the DJ/venue through the app, with real-time approval/denial feedback.',
  
  // Business Terms
  'business partner': 'Refers to nightclub or bar owners/managers who use the EvePass platform to manage their venue\'s presence and engage with customers.',
  'venue profile': 'The public-facing page for a nightclub or bar on EvePass, managed by the business partner.',
  'analytics dashboard': 'The section for business partners to view insights into their sales, customer activity, and menu performance.',
  
  // Technical Terms
  'abv': 'Alcohol by Volume - The percentage of pure alcohol in a drink, crucial for DrunkSafe calculations.',
  'happy hour function': 'Special promotions or deals offered by venues, often at specific times, that users can leverage to optimize their budget.',
  'emergency numbers': 'Direct access to emergency services (e.g., 999) and pre-set trusted contacts within DrunkSafe.'
}

// User Journey Workflows
export const USER_WORKFLOWS = {
  findNightclub: {
    title: 'How to find and explore a nightclub',
    steps: [
      'Open the EvePass app',
      'Tap the "Explorer" button on the homepage',
      'Choose to use your current location or manually search for a city/area',
      'Browse through the list of venues, use filters for music genre, vibe, amenities, or events',
      'Tap on a club\'s listing to view its detailed profile, including photos, menu, and reviews',
      'Choose to "Plan My Night" with Eve AI, "Get Directions," or "Book a Table"'
    ]
  },
  useDrunkSafe: {
    title: 'How to use DrunkSafe for personal safety',
    steps: [
      'Ensure you have entered your weight, gender, and selected your drinking tolerance level in your profile settings',
      'As you order drinks through the app, DrunkSafe automatically tracks your consumption',
      'Access the "DrunkSafe" section from the app\'s main navigation',
      'Monitor your estimated BAC level displayed prominently',
      'If the app indicates a "Caution" or "Danger" state, follow the prompts for safety tips, access emergency numbers, or quickly call a trusted contact',
      'Use the integrated transport options to arrange a safe ride home'
    ]
  },
  shareBottle: {
    title: 'How to use the "Share a Bottle" feature',
    steps: [
      'Navigate to a specific venue\'s profile page, or find the "Share a Bottle" section in the app',
      'Tap "Create a Bottle Share" if you want to initiate one, selecting the bottle and number of people needed',
      'Or, tap "Browse Bottle Shares" to see existing requests at your current venue',
      'If you find a suitable share, tap "Join Share"',
      'Coordinate with the share creator via in-app messaging, and then use the "Split the Bill" feature for easy payment'
    ]
  },
  requestSong: {
    title: 'How to request a song at a venue',
    steps: [
      'Ensure you are physically at a partner venue that supports song requests',
      'Navigate to that specific venue\'s profile page within the EvePass app',
      'Look for and tap the "Request Song" button',
      'A form will appear where you can type in the Song Title and Artist Name',
      'Tap "Send Request"',
      'You will receive a real-time notification and see a status update (Pending, Approved, Denied) on your screen once the DJ/venue has processed your request'
    ]
  },
  businessManagement: {
    title: 'How a business owner manages their menu and orders',
    steps: [
      'Log in to the EvePass Business Partner dashboard',
      'To add or update menu items, go to the "Menu" section. Here you can input item names, prices, and critically, ABV and volume for alcoholic beverages',
      'To view customer orders, navigate to the "Orders" section. You will see real-time lists of pending and completed orders, including table numbers, items ordered, and payment status',
      'For song requests, go to the dedicated "Song Requests" section (if enabled). Here you can see incoming requests and use the \'Approve\' or \'Deny\' buttons to respond, which will send immediate feedback to the user'
    ]
  }
}

// Frequently Asked Questions
export const EVEPASS_FAQS = {
  'what is evepass': 'EvePass is a revolutionary nightlife app designed to help you discover clubs, plan your nights out, manage your budget, and stay safe, all from one platform.',
  'how to find clubs': 'Use the "Explorer" feature on the homepage. You can enable location services for automatic suggestions or search manually by city, postcode, or area.',
  'how does drunksafe work': 'DrunkSafe tracks your in-app drink orders and, combined with your personal profile data (weight, gender, and tolerance), estimates your Blood Alcohol Content (BAC). It provides real-time warnings and access to safety tools like emergency contacts and transport options if your estimated BAC reaches concerning levels.',
  'alcohol tolerance levels': 'Yes! During signup or in your profile settings, you can choose a drinking tolerance level (Low, Moderate, High, or Custom) so DrunkSafe\'s warnings are personalized to you.',
  'budget tracking': 'You can set a budget for your night out within the app. The budget tracker monitors your in-app expenses (drinks, food, etc.) and gives you alerts as you approach or exceed your limit.',
  'emergency help': 'The DrunkSafe feature provides quick access to emergency numbers (like 999 in the UK) and allows you to set up and quickly call trusted contacts.',
  'share a bottle explained': '"Share a Bottle" allows you to find other users at your venue who want to split the cost of a full bottle of spirits or champagne. You can create a request or join an existing one, making premium bottles more affordable and helping you connect with new people.',
  'eve ai planning': 'Eve AI is your personal AI assistant within the app. It learns your preferences and uses that information to suggest personalized nightlife itineraries, including recommended clubs, timings, and activities based on your desired vibe.',
  'business listing': 'Go to the "Join as Partner" section on the website or app. You\'ll create a business account and gain access to a dedicated dashboard where you can manage your venue profile, upload menus, view orders, and access analytics.',
  'menu upload': 'Once logged into your business dashboard, navigate to the "Menu" section. You can add new items, specifying name, price, and crucially, the ABV (Alcohol by Volume) and serving size for all alcoholic beverages.',
  'song requests business': 'Yes, if your venue has enabled the "Song Request" feature. Requests will appear in real-time on your business dashboard, where you can approve or deny them. The user will be notified of your decision immediately.',
  'payment security': 'EvePass uses secure payment gateways to process all in-app transactions, ensuring your financial information is protected. We aim to prevent price inflation even if you\'re impaired.'
}

// Core Features and Capabilities
export const EVEPASS_FEATURES = {
  explorer: {
    name: 'Explorer (Discover & Browse Nightlife)',
    description: 'Allows users to easily discover and browse a curated list of nightclubs, bars, and nightlife venues across the UK.',
    capabilities: [
      'Search by location, venue type, music genre, vibe, or specific events',
      'Detailed venue profiles with descriptions, photos, amenities, opening hours, dress codes, and user reviews',
      'Comprehensive listings for thousands of nightlife spots'
    ]
  },
  drunkSafe: {
    name: 'DrunkSafe Technology (User Safety & Well-being)',
    description: 'A groundbreaking safety feature designed to keep users informed and safe during their night out.',
    capabilities: [
      'Personalized BAC calculation based on in-app orders and user profile',
      'Customizable tolerance levels (Low, Moderate, High, Custom)',
      'Real-time safety warnings and recommendations',
      'Budget tracking to prevent overspending',
      'One-tap access to emergency services (999) and trusted contacts',
      'Integration with transport services (Uber, Bolt, Night Tube)',
      'Practical safety tips and advice'
    ]
  },
  socialFeatures: {
    name: 'Social & Cost-Sharing Features',
    description: 'Unique features that enhance social connections and affordability.',
    capabilities: [
      'Share a Bottle: Connect with others to split premium bottle costs',
      'Split the Bill: Easy expense division for group orders',
      'In-app messaging for coordination',
      'Social discovery at venues'
    ]
  },
  eveAI: {
    name: 'Plan My Night (Eve AI Personalized Recommendations)',
    description: 'The intelligent core of EvePass, offering personalized recommendations for nightlife activities.',
    capabilities: [
      'Personalized itinerary creation based on preferences',
      'Learning from past behavior to refine suggestions',
      'Music, vibe, budget, and location-based recommendations',
      'Optimal timing suggestions for venues and activities'
    ]
  },
  businessTools: {
    name: 'Business Partner Features',
    description: 'Powerful tools for nightlife venues to manage their presence and operations.',
    capabilities: [
      'Customizable venue profiles with up to 6 high-quality photos',
      'Complete menu management with ABV and volume data',
      'Real-time order management dashboard',
      'Table booking and reservation tracking',
      'Promotions and happy hour management',
      'Comprehensive analytics and insights',
      'Song request management system'
    ]
  },
  songRequests: {
    name: 'Request a Song (Direct Venue Engagement)',
    description: 'Enables users to directly request songs from DJs with real-time feedback.',
    capabilities: [
      'Direct song requests to venue DJs',
      'Real-time approval/denial notifications',
      'Business dashboard for managing requests',
      'Enhanced user engagement and interaction'
    ]
  }
}

// AI Response Generation Service
export class EvePassKnowledgeService {
  
  // Enhanced AI response generation with EvePass knowledge
  static generateEvePassResponse(userMessage: string, conversationHistory: any[] = [], currentUser: any): string {
    return Sentry.startSpan(
      {
        op: "ai.knowledge.generate",
        name: "Generate EvePass Knowledge Response",
      },
      (span) => {
        const input = userMessage.toLowerCase();
        const userName = currentUser?.profile?.first_name || 'there';
        
        span.setAttribute("user_message", userMessage);
        span.setAttribute("user_name", userName);
        span.setAttribute("message_length", userMessage.length);

        // Check for EvePass-specific terminology
        for (const [term, definition] of Object.entries(EVEPASS_TERMINOLOGY)) {
          if (input.includes(term.toLowerCase())) {
            span.setAttribute("terminology_match", term);
            return `Great question about ${term}, ${userName}! ${definition} ${this.getRelatedSuggestions(term)}`;
          }
        }

        // Check for FAQ matches
        for (const [question, answer] of Object.entries(EVEPASS_FAQS)) {
          if (this.matchesQuestion(input, question)) {
            span.setAttribute("faq_match", question);
            return `${answer} ${this.getRelatedActions(question)}`;
          }
        }

        // Check for workflow requests
        if (input.includes('how to') || input.includes('how do i')) {
          const workflow = this.findMatchingWorkflow(input);
          if (workflow) {
            span.setAttribute("workflow_match", workflow.title);
            return this.formatWorkflowResponse(workflow, userName);
          }
        }

        // Feature-specific responses
        if (input.includes('venue') || input.includes('club') || input.includes('discover') || input.includes('explore')) {
          span.setAttribute("feature_category", "venue_discovery");
          return this.generateVenueDiscoveryResponse(userName);
        }

        if (input.includes('safe') || input.includes('drunk') || input.includes('bac') || input.includes('alcohol')) {
          span.setAttribute("feature_category", "safety");
          return this.generateSafetyResponse(userName);
        }

        if (input.includes('plan') || input.includes('night') || input.includes('itinerary')) {
          span.setAttribute("feature_category", "planning");
          return this.generatePlanningResponse(userName);
        }

        if (input.includes('bottle') || input.includes('share') || input.includes('split')) {
          span.setAttribute("feature_category", "social");
          return this.generateSocialResponse(userName);
        }

        if (input.includes('song') || input.includes('music') || input.includes('dj')) {
          span.setAttribute("feature_category", "song_requests");
          return this.generateSongRequestResponse(userName);
        }

        if (input.includes('business') || input.includes('venue owner') || input.includes('dashboard')) {
          span.setAttribute("feature_category", "business");
          return this.generateBusinessResponse(userName);
        }

        if (input.includes('budget') || input.includes('money') || input.includes('spend') || input.includes('cost')) {
          span.setAttribute("feature_category", "budget");
          return this.generateBudgetResponse(userName);
        }

        // Greeting responses
        if (input.includes('hello') || input.includes('hi ') || input.includes('hey') || input.includes('what can you')) {
          span.setAttribute("response_type", "greeting");
          return this.generateGreetingResponse(userName);
        }

        // Default EvePass response
        span.setAttribute("response_type", "default");
        return this.generateDefaultResponse(userName);
      }
    );
  }

  private static matchesQuestion(input: string, questionKey: string): boolean {
    const keywords = questionKey.split(' ');
    return keywords.some(keyword => input.includes(keyword));
  }

  private static findMatchingWorkflow(input: string): any {
    for (const workflow of Object.values(USER_WORKFLOWS)) {
      const titleWords = workflow.title.toLowerCase().split(' ');
      if (titleWords.some(word => input.includes(word))) {
        return workflow;
      }
    }
    return null;
  }

  private static formatWorkflowResponse(workflow: any, userName: string): string {
    const steps = workflow.steps.map((step: string, index: number) => 
      `${index + 1}. ${step}`
    ).join('\n');
    
    return `Here's how to ${workflow.title.toLowerCase()}, ${userName}:\n\n${steps}\n\nNeed help with any of these steps? Just ask!`;
  }

  private static generateVenueDiscoveryResponse(userName: string): string {
    return `Perfect! I can help you discover amazing venues, ${userName}! 🎉 

With EvePass Explorer, you can:
• Find clubs and bars near you using location services
• Filter by music genre, vibe, and events
• View detailed venue profiles with photos and reviews
• See real-time availability and book tables

Try saying "find venues near me" or "show me techno clubs" to get started! I can also help you plan your entire night with personalized recommendations.`;
  }

  private static generateSafetyResponse(userName: string): string {
    return `Safety is our top priority, ${userName}! 🛡️ 

DrunkSafe™ Technology helps you stay safe by:
• Tracking your drinks and estimating your BAC in real-time
• Providing personalized warnings based on your tolerance level
• Offering quick access to emergency contacts (999) and trusted friends
• Monitoring your budget to prevent overspending
• Connecting you with safe transport options (Uber, Bolt, Night Tube)

You can set your drinking tolerance level (Low, Moderate, High, or Custom) in your profile. Want me to help you set up your safety profile?`;
  }

  private static generatePlanningResponse(userName: string): string {
    return `I'd love to help you plan the perfect night out, ${userName}! ✨

As your Eve AI assistant, I can:
• Create personalized itineraries based on your music and vibe preferences
• Suggest optimal timing for venues and activities
• Recommend the best route between locations
• Help you book tables and coordinate with friends
• Factor in your budget and safety preferences

Tell me what kind of night you're looking for - are you into electronic music, cocktail bars, live music, or something else? I'll create a custom plan just for you!`;
  }

  private static generateSocialResponse(userName: string): string {
    return `Great question about our social features, ${userName}! 🍾

**Share a Bottle** lets you:
• Find others at your venue to split premium bottle costs
• Make new friends while saving money
• Coordinate through in-app messaging

**Split the Bill** makes it easy to:
• Divide group orders fairly
• Handle payments seamlessly
• Avoid awkward money conversations

These features make premium nightlife experiences more affordable and help you connect with like-minded people. Want to know how to create or join a bottle share?`;
  }

  private static generateSongRequestResponse(userName: string): string {
    return `Music makes the night, ${userName}! 🎵

Our Song Request feature lets you:
• Send song requests directly to the DJ at your venue
• Get real-time feedback (Approved/Denied) instantly
• See the status of your requests in the app
• Help shape the music experience for everyone

Just go to your venue's profile page, tap "Request Song," enter the title and artist, and send it! The DJ will see it immediately and you'll get notified of their decision. It's the first feature of its kind with real-time feedback!`;
  }

  private static generateBusinessResponse(userName: string): string {
    return `Welcome to EvePass Business, ${userName}! 🏢

Our Business Partner dashboard gives you:
• Complete venue profile management with photo galleries
• Real-time menu management (crucial for DrunkSafe™ BAC calculations)
• Live order tracking and fulfillment
• Table booking and reservation management
• Analytics and insights into customer behavior
• Song request management system
• Promotion and happy hour tools

Over 2,500+ venues already trust EvePass! Want to know more about setting up your venue profile or managing orders?`;
  }

  private static generateBudgetResponse(userName: string): string {
    return `Smart budgeting makes for better nights, ${userName}! 💰

EvePass Budget Tracker helps you:
• Set spending limits before you go out
• Monitor expenses in real-time as you order
• Get alerts when approaching your limit
• Prevent overspending when you're having fun
• Use "Split the Bill" for group expenses

This is especially important with DrunkSafe™ - we help prevent price inflation when you're impaired. You can set your budget in the app and I'll help you stick to it while still having an amazing time!`;
  }

  private static generateGreetingResponse(userName: string): string {
    const greetings = [
      `Hi ${userName}! I'm Eve, your AI nightlife assistant! 🌟 I'm here to help you discover amazing venues, plan epic nights out, stay safe with DrunkSafe™, and make the most of your nightlife experience. What can I help you with tonight?`,
      
      `Hey ${userName}! Welcome to EvePass! 🎉 I'm Eve, and I'm excited to be your personal nightlife companion. Whether you want to find the perfect venue, plan your night, stay safe, or explore our social features, I've got you covered!`,
      
      `Hello ${userName}! I'm Eve, your intelligent nightlife guide! ✨ I can help you with venue discovery, night planning, safety monitoring, budget tracking, and so much more. Ready to make tonight unforgettable?`
    ];
    
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  private static generateDefaultResponse(userName: string): string {
    return `I'm here to help with all your nightlife needs, ${userName}! 🌃

I can assist you with:
🎯 **Venue Discovery** - Find the perfect clubs and bars
🗓️ **Night Planning** - Create personalized itineraries  
🛡️ **DrunkSafe™** - Stay safe with BAC monitoring
💰 **Budget Tracking** - Manage your spending
🍾 **Social Features** - Share bottles and split bills
🎵 **Song Requests** - Request music from DJs
🏢 **Business Tools** - For venue owners and managers

What would you like to explore? Just ask me anything about nightlife, safety, planning, or our features!`;
  }

  private static getRelatedSuggestions(term: string): string {
    const suggestions: { [key: string]: string } = {
      'drunksafe': 'Want to set up your safety profile or learn about BAC monitoring?',
      'explorer': 'Ready to discover some amazing venues near you?',
      'eve ai': 'Shall I help you plan your perfect night out?',
      'share a bottle': 'Interested in finding others to share premium bottles with?',
      'song request': 'Want to know how to request songs at venues?'
    };
    
    return suggestions[term] || 'What would you like to know more about?';
  }

  private static getRelatedActions(question: string): string {
    if (question.includes('find clubs')) return 'Ready to explore venues near you?';
    if (question.includes('drunksafe')) return 'Want me to help set up your safety profile?';
    if (question.includes('budget')) return 'Shall I help you set a budget for tonight?';
    if (question.includes('eve ai')) return 'Ready to plan your perfect night?';
    if (question.includes('business')) return 'Need help setting up your venue dashboard?';
    
    return 'What else can I help you with?';
  }

  // Get platform statistics
  static getPlatformStats(): any {
    return {
      partnerVenues: '2,500+',
      nightPlansCreated: '150K+',
      safetyScore: '98%',
      userRating: '4.9★',
      features: Object.keys(EVEPASS_FEATURES).length,
      workflows: Object.keys(USER_WORKFLOWS).length,
      faqs: Object.keys(EVEPASS_FAQS).length
    };
  }

  // Search knowledge base
  static searchKnowledge(query: string): any[] {
    const results = [];
    const searchTerm = query.toLowerCase();

    // Search terminology
    for (const [term, definition] of Object.entries(EVEPASS_TERMINOLOGY)) {
      if (term.includes(searchTerm) || definition.toLowerCase().includes(searchTerm)) {
        results.push({ type: 'terminology', term, definition });
      }
    }

    // Search FAQs
    for (const [question, answer] of Object.entries(EVEPASS_FAQS)) {
      if (question.includes(searchTerm) || answer.toLowerCase().includes(searchTerm)) {
        results.push({ type: 'faq', question, answer });
      }
    }

    // Search features
    for (const [key, feature] of Object.entries(EVEPASS_FEATURES)) {
      if (feature.name.toLowerCase().includes(searchTerm) || 
          feature.description.toLowerCase().includes(searchTerm)) {
        results.push({ type: 'feature', key, feature });
      }
    }

    return results;
  }
}