import { supabase } from './supabase'
import * as Sentry from '@sentry/nextjs'

export interface UserToleranceProfile {
  id: string
  user_id: string
  weight_kg: number
  gender: 'male' | 'female' | 'other'
  tolerance_level: 'low' | 'moderate' | 'high' | 'custom'
  safe_threshold: number
  caution_threshold: number
  danger_threshold: number
  alcohol_elimination_rate: number
  food_absorption_factor: number
  created_at: string
  updated_at: string
}

export interface DrinkConsumption {
  id: string
  user_id: string
  order_id: string
  menu_item_id: string
  drink_name: string
  volume_ml: number
  abv_percentage: number
  alcohol_grams: number
  consumed_at: string
  food_consumed_recently: boolean
  food_consumed_within_minutes: number
}

export interface BACCalculation {
  current_bac: number
  safety_state: 'safe' | 'caution' | 'danger'
  drinks_consumed: number
  time_since_first_drink: number
  recommendation: string
}

export interface DrinkData {
  name: string
  volume_ml: number
  abv_percentage: number
  category: string
}

// Common drink data for automatic detection
export const COMMON_DRINKS: Record<string, DrinkData> = {
  // Beers
  'stella artois': { name: 'Stella Artois', volume_ml: 330, abv_percentage: 5.0, category: 'beer' },
  'corona extra': { name: 'Corona Extra', volume_ml: 330, abv_percentage: 4.5, category: 'beer' },
  'heineken': { name: 'Heineken', volume_ml: 330, abv_percentage: 5.0, category: 'beer' },
  'guinness': { name: 'Guinness', volume_ml: 568, abv_percentage: 4.2, category: 'beer' },
  
  // Spirits (single shots)
  'vodka': { name: 'Vodka', volume_ml: 25, abv_percentage: 40.0, category: 'spirits' },
  'gin': { name: 'Gin', volume_ml: 25, abv_percentage: 40.0, category: 'spirits' },
  'whiskey': { name: 'Whiskey', volume_ml: 25, abv_percentage: 40.0, category: 'spirits' },
  'rum': { name: 'Rum', volume_ml: 25, abv_percentage: 40.0, category: 'spirits' },
  'tequila': { name: 'Tequila', volume_ml: 25, abv_percentage: 40.0, category: 'spirits' },
  
  // Cocktails (estimated averages)
  'martini': { name: 'Martini', volume_ml: 120, abv_percentage: 28.0, category: 'cocktails' },
  'mojito': { name: 'Mojito', volume_ml: 200, abv_percentage: 12.0, category: 'cocktails' },
  'cosmopolitan': { name: 'Cosmopolitan', volume_ml: 120, abv_percentage: 20.0, category: 'cocktails' },
  'margarita': { name: 'Margarita', volume_ml: 150, abv_percentage: 18.0, category: 'cocktails' },
  
  // Wine
  'wine': { name: 'Wine', volume_ml: 175, abv_percentage: 12.5, category: 'wine' },
  'prosecco': { name: 'Prosecco', volume_ml: 125, abv_percentage: 11.0, category: 'wine' },
  'champagne': { name: 'Champagne', volume_ml: 125, abv_percentage: 12.0, category: 'wine' }
}

export const drunkSafeService = {
  // Create or update user tolerance profile
  async createToleranceProfile(profileData: Partial<UserToleranceProfile>) {
    return Sentry.startSpan(
      {
        op: "drunksafe.createProfile",
        name: "Create DrunkSafe Profile",
      },
      async (span) => {
        try {
          span.setAttribute("user_id", profileData.user_id || "unknown");
          span.setAttribute("tolerance_level", profileData.tolerance_level || "unknown");

          const { data, error } = await supabase
            .from('user_tolerance_profiles')
            .upsert(profileData, { onConflict: 'user_id' })
            .select()
            .single()

          if (error) {
            Sentry.captureException(error)
            throw error
          }

          span.setAttribute("profile_created", true);
          return data
        } catch (error) {
          span.setAttribute("profile_created", false);
          Sentry.captureException(error)
          throw error
        }
      }
    )
  },

  // Get user's tolerance profile
  async getUserToleranceProfile(userId: string): Promise<UserToleranceProfile | null> {
    return Sentry.startSpan(
      {
        op: "drunksafe.getProfile",
        name: "Get DrunkSafe Profile",
      },
      async (span) => {
        try {
          span.setAttribute("user_id", userId);

          const { data, error } = await supabase
            .from('user_tolerance_profiles')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

          if (error) {
            Sentry.captureException(error)
            throw error
          }

          span.setAttribute("profile_found", !!data);
          return data
        } catch (error) {
          Sentry.captureException(error)
          throw error
        }
      }
    )
  },

  // Get default thresholds based on tolerance level
  getDefaultThresholds(toleranceLevel: 'low' | 'moderate' | 'high') {
    const thresholds = {
      low: { safe: 0.020, caution: 0.040, danger: 0.060 },
      moderate: { safe: 0.030, caution: 0.050, danger: 0.080 },
      high: { safe: 0.040, caution: 0.065, danger: 0.100 }
    }
    return thresholds[toleranceLevel]
  },

  // Manually log a drink (for testing or manual entry)
  async logDrinkConsumption(drinkData: {
    user_id: string
    drink_name: string
    volume_ml: number
    abv_percentage: number
    order_id?: string
    menu_item_id?: string
    food_consumed_recently?: boolean
  }) {
    return Sentry.startSpan(
      {
        op: "drunksafe.logDrink",
        name: "Log Drink Consumption",
      },
      async (span) => {
        try {
          span.setAttribute("user_id", drinkData.user_id);
          span.setAttribute("drink_name", drinkData.drink_name);
          span.setAttribute("volume_ml", drinkData.volume_ml);
          span.setAttribute("abv_percentage", drinkData.abv_percentage);

          const { data, error } = await supabase
            .from('drink_consumption_log')
            .insert({
              ...drinkData,
              consumed_at: new Date().toISOString()
            })
            .select()
            .single()

          if (error) {
            Sentry.captureException(error)
            throw error
          }

          span.setAttribute("drink_logged", true);
          return data
        } catch (error) {
          span.setAttribute("drink_logged", false);
          Sentry.captureException(error)
          throw error
        }
      }
    )
  },

  // Get user's drink consumption history
  async getDrinkHistory(userId: string, hoursBack: number = 12) {
    return Sentry.startSpan(
      {
        op: "drunksafe.getDrinkHistory",
        name: "Get Drink History",
      },
      async (span) => {
        try {
          span.setAttribute("user_id", userId);
          span.setAttribute("hours_back", hoursBack);

          const cutoffTime = new Date()
          cutoffTime.setHours(cutoffTime.getHours() - hoursBack)

          const { data, error } = await supabase
            .from('drink_consumption_log')
            .select('*')
            .eq('user_id', userId)
            .gte('consumed_at', cutoffTime.toISOString())
            .order('consumed_at', { ascending: false })

          if (error) {
            Sentry.captureException(error)
            throw error
          }

          span.setAttribute("drinks_found", data?.length || 0);
          return data || []
        } catch (error) {
          Sentry.captureException(error)
          throw error
        }
      }
    )
  },

  // Calculate current BAC using the database function
  async calculateCurrentBAC(userId: string): Promise<BACCalculation> {
    return Sentry.startSpan(
      {
        op: "drunksafe.calculateBAC",
        name: "Calculate Current BAC",
      },
      async (span) => {
        try {
          span.setAttribute("user_id", userId);

          const { data, error } = await supabase
            .rpc('calculate_user_bac', { user_uuid: userId })

          if (error) {
            Sentry.captureException(error)
            throw error
          }
          
          if (!data || data.length === 0) {
            span.setAttribute("bac_calculated", false);
            return {
              current_bac: 0,
              safety_state: 'safe',
              drinks_consumed: 0,
              time_since_first_drink: 0,
              recommendation: 'No recent drinking detected'
            }
          }

          const result = data[0]
          span.setAttribute("bac_calculated", true);
          span.setAttribute("current_bac", result.current_bac);
          span.setAttribute("safety_state", result.safety_state);
          span.setAttribute("drinks_consumed", result.drinks_consumed);

          return result
        } catch (error) {
          span.setAttribute("bac_calculated", false);
          Sentry.captureException(error)
          throw error
        }
      }
    )
  },

  // Get BAC calculation history
  async getBACHistory(userId: string, limit: number = 50) {
    return Sentry.startSpan(
      {
        op: "drunksafe.getBACHistory",
        name: "Get BAC History",
      },
      async (span) => {
        try {
          span.setAttribute("user_id", userId);
          span.setAttribute("limit", limit);

          const { data, error } = await supabase
            .from('bac_calculations')
            .select('*')
            .eq('user_id', userId)
            .order('calculation_timestamp', { ascending: false })
            .limit(limit)

          if (error) {
            Sentry.captureException(error)
            throw error
          }

          span.setAttribute("calculations_found", data?.length || 0);
          return data || []
        } catch (error) {
          Sentry.captureException(error)
          throw error
        }
      }
    )
  },

  // Detect drink from menu item name and auto-populate data
  detectDrinkData(itemName: string, itemDescription?: string): DrinkData | null {
    const searchText = `${itemName} ${itemDescription || ''}`.toLowerCase()
    
    // Try exact matches first
    for (const [key, drinkData] of Object.entries(COMMON_DRINKS)) {
      if (searchText.includes(key)) {
        return drinkData
      }
    }

    // Try partial matches for common terms
    if (searchText.includes('beer') || searchText.includes('lager') || searchText.includes('ale')) {
      return { name: itemName, volume_ml: 330, abv_percentage: 4.5, category: 'beer' }
    }
    
    if (searchText.includes('wine') && !searchText.includes('cocktail')) {
      return { name: itemName, volume_ml: 175, abv_percentage: 12.5, category: 'wine' }
    }
    
    if (searchText.includes('cocktail') || searchText.includes('martini') || searchText.includes('mojito')) {
      return { name: itemName, volume_ml: 150, abv_percentage: 15.0, category: 'cocktails' }
    }
    
    if (searchText.includes('shot') || searchText.includes('vodka') || searchText.includes('gin') || 
        searchText.includes('whiskey') || searchText.includes('rum') || searchText.includes('tequila')) {
      return { name: itemName, volume_ml: 25, abv_percentage: 40.0, category: 'spirits' }
    }

    return null
  },

  // Process order completion and auto-log drinks
  async processOrderForDrinks(orderId: string) {
    return Sentry.startSpan(
      {
        op: "drunksafe.processOrder",
        name: "Process Order for Drinks",
      },
      async (span) => {
        try {
          span.setAttribute("order_id", orderId);

          // This would typically be called by a webhook or trigger
          // For now, it's a manual process that can be called from the frontend
          
          const { data: order, error: orderError } = await supabase
            .from('orders')
            .select(`
              *,
              order_items (
                *,
                menu_items (*)
              )
            `)
            .eq('id', orderId)
            .single()

          if (orderError) {
            Sentry.captureException(orderError)
            throw orderError
          }

          if (!order || order.payment_status !== 'completed') {
            return { message: 'Order not found or not completed' }
          }

          span.setAttribute("customer_id", order.customer_id);

          // Check for recent food orders
          const recentFoodOrder = await this.checkRecentFoodConsumption(order.customer_id)

          // Process each alcoholic item in the order
          const drinkLogs = []
          for (const orderItem of order.order_items || []) {
            const menuItem = orderItem.menu_items
            
            if (menuItem && ['cocktails', 'spirits', 'beer', 'wine'].includes(menuItem.category)) {
              const drinkData = this.detectDrinkData(menuItem.name, menuItem.description)
              
              if (drinkData) {
                for (let i = 0; i < orderItem.quantity; i++) {
                  const logEntry = await this.logDrinkConsumption({
                    user_id: order.customer_id,
                    order_id: orderId,
                    menu_item_id: menuItem.id,
                    drink_name: menuItem.name,
                    volume_ml: drinkData.volume_ml,
                    abv_percentage: drinkData.abv_percentage,
                    food_consumed_recently: recentFoodOrder.hasRecentFood,
                  })
                  drinkLogs.push(logEntry)
                }
              }
            }
          }

          span.setAttribute("drinks_logged", drinkLogs.length);
          return { drinkLogs, recentFood: recentFoodOrder }
        } catch (error) {
          Sentry.captureException(error)
          throw error
        }
      }
    )
  },

  // Check if user has consumed food recently
  async checkRecentFoodConsumption(userId: string, minutesBack: number = 90) {
    return Sentry.startSpan(
      {
        op: "drunksafe.checkRecentFood",
        name: "Check Recent Food Consumption",
      },
      async (span) => {
        try {
          span.setAttribute("user_id", userId);
          span.setAttribute("minutes_back", minutesBack);

          const cutoffTime = new Date()
          cutoffTime.setMinutes(cutoffTime.getMinutes() - minutesBack)

          const { data, error } = await supabase
            .from('orders')
            .select(`
              *,
              order_items (
                *,
                menu_items (category)
              )
            `)
            .eq('customer_id', userId)
            .eq('payment_status', 'completed')
            .gte('created_at', cutoffTime.toISOString())

          if (error) {
            Sentry.captureException(error)
            throw error
          }

          const hasRecentFood = (data || []).some(order => 
            order.order_items?.some((item: any) => 
              item.menu_items?.category === 'food'
            )
          )

          span.setAttribute("has_recent_food", hasRecentFood);
          span.setAttribute("orders_checked", data?.length || 0);

          return {
            hasRecentFood,
            minutesBack,
            ordersChecked: data?.length || 0
          }
        } catch (error) {
          Sentry.captureException(error)
          throw error
        }
      }
    )
  },

  // Get safety recommendations based on current state
  getSafetyRecommendations(bacLevel: number, safetyState: string, drinksCount: number) {
    const recommendations = {
      safe: [
        'Continue to pace yourself',
        'Drink water between alcoholic beverages',
        'Consider eating something if you haven\'t recently',
        'Stay with your group',
        'Keep your phone charged'
      ],
      caution: [
        'Slow down your drinking pace',
        'Drink a large glass of water now',
        'Order some food to help slow absorption',
        'Consider switching to non-alcoholic drinks',
        'Check in with your friends'
      ],
      danger: [
        'STOP drinking alcohol immediately',
        'Drink water and eat food if possible',
        'Stay with trusted friends',
        'Consider going home or to a safe place',
        'Do not drive or operate machinery',
        'Call someone if you feel unwell'
      ]
    }

    return recommendations[safetyState as keyof typeof recommendations] || recommendations.safe
  }
}