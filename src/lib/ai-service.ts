import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role for admin operations
)

export interface AIAnalysisRequest {
  carId: string
  userId: string
  inspectionData: any
  carModel?: {
    make: string
    model: string
    year: number
  }
}

export interface AIAnalysisResponse {
  questions: string[]
  concerns: Array<{
    category: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    description: string
    recommendation: string
  }>
  maintenance_suggestions: Array<{
    item: string
    urgency: 'immediate' | 'soon' | 'routine'
    estimated_cost?: string
  }>
  overall_assessment: string
}

export interface SubscriptionInfo {
  type: 'free' | 'premium' | 'pro'
  queries_used: number
  queries_limit: number
  can_use_ai: boolean
}

export class AIService {
  private openaiApiKey: string

  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY!
    if (!this.openaiApiKey) {
      console.error('OPENAI_API_KEY is not configured in environment variables')
      throw new Error('OPENAI_API_KEY is not configured')
    }
    console.log('AI Service initialized with API key:', this.openaiApiKey ? 'Present' : 'Missing')
  }

  /**
   * Check if user can use AI features
   */
  async checkAIUsageLimit(userId: string): Promise<SubscriptionInfo> {
    console.log('Checking AI usage limit for user:', userId)
    
    // For testing: if it's a test user, return default limits without DB check
    if (userId.startsWith('test-user-')) {
      console.log('Test user detected, returning default subscription')
      return {
        type: 'free',
        queries_used: 0,
        queries_limit: 3,
        can_use_ai: true
      }
    }
    
    const { data, error } = await supabase
      .rpc('check_ai_usage_limit', { user_uuid: userId })

    if (error) {
      console.error('RPC check_ai_usage_limit error:', error)
      
      // If RPC function doesn't exist, create a default subscription
      if (error.message.includes('function') || error.code === '42883') {
        console.log('RPC function missing, creating default subscription')
        
        // Try to create subscription directly
        const { error: insertError } = await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: userId,
            subscription_type: 'free',
            ai_queries_limit: 3,
            ai_queries_used: 0
          })
          
        if (insertError) {
          console.error('Failed to create subscription:', insertError)
          // Return default values if everything fails
          return {
            type: 'free',
            queries_used: 0,
            queries_limit: 3,
            can_use_ai: true
          }
        }
        
        // Return default for new subscription
        return {
          type: 'free',
          queries_used: 0,
          queries_limit: 3,
          can_use_ai: true
        }
      }
      
      throw error
    }

    // Get current subscription info
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()
      
    if (subError) {
      console.error('Subscription query error:', subError)
      // Create default subscription if not found
      if (subError.code === 'PGRST116') { // No rows returned
        console.log('No subscription found, creating default free subscription')
        const { data: newSub, error: createError } = await supabase
          .from('user_subscriptions')
          .insert({
            user_id: userId,
            subscription_type: 'free',
            ai_queries_limit: 3,
            ai_queries_used: 0
          })
          .select()
          .single()
          
        if (createError) {
          console.error('Failed to create subscription:', createError)
          throw createError
        }
        
        return {
          type: 'free',
          queries_used: 0,
          queries_limit: 3,
          can_use_ai: true
        }
      }
      throw subError
    }

    return {
      type: subscription?.subscription_type || 'free',
      queries_used: subscription?.ai_queries_used || 0,
      queries_limit: subscription?.ai_queries_limit || 3,
      can_use_ai: data || false
    }
  }

  /**
   * Increment AI usage counter
   */
  async incrementAIUsage(userId: string): Promise<void> {
    // For testing: skip DB update for test users
    if (userId.startsWith('test-user-')) {
      console.log('Test user - skipping usage increment')
      return
    }
    
    const { error } = await supabase
      .rpc('increment_ai_usage', { user_uuid: userId })
    
    if (error) throw error
  }

  /**
   * Get car model knowledge from database
   */
  async getCarKnowledge(make: string, model: string, year: number) {
    const { data: carModel } = await supabase
      .from('car_models')
      .select(`
        *,
        common_issues(*),
        recalls(*),
        inspection_statistics(*),
        maintenance_schedules(*)
      `)
      .eq('make', make)
      .eq('model', model)
      .lte('year_from', year)
      .gte('year_to', year)
      .single()

    return carModel
  }

  /**
   * Analyze inspection data with AI
   */
  async analyzeInspectionData(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    // Check usage limits
    const subscription = await this.checkAIUsageLimit(request.userId)
    if (!subscription.can_use_ai) {
      throw new Error('AI usage limit exceeded. Please upgrade your subscription.')
    }

    // Get car knowledge from our database
    let carKnowledge = null
    if (request.carModel) {
      carKnowledge = await this.getCarKnowledge(
        request.carModel.make, 
        request.carModel.model, 
        request.carModel.year
      )
    }

    // Prepare context for AI
    const context = {
      inspection_data: request.inspectionData,
      car_knowledge: carKnowledge,
      analysis_focus: [
        'missing_information',
        'potential_issues',
        'maintenance_recommendations',
        'safety_concerns'
      ]
    }

    // Create AI prompt
    const prompt = this.createAnalysisPrompt(context)

    try {
      console.log('Making OpenAI API call for analysis...')
      
      // Call OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an expert automotive inspector and mechanic. Analyze the provided inspection data and car knowledge to provide helpful insights.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.3
        })
      })

      console.log('OpenAI API response status:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('OpenAI API error response:', errorText)
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const aiResponse = await response.json()
      console.log('=== OPENAI RESPONSE START ===')
      console.log('OpenAI API response:', JSON.stringify(aiResponse, null, 2))
      console.log('=== OPENAI RESPONSE END ===')
      
      const rawContent = aiResponse.choices[0].message.content
      console.log('=== RAW AI CONTENT START ===')
      console.log(rawContent)
      console.log('=== RAW AI CONTENT END ===')
      
      let analysis
      try {
        // Try to extract JSON from the response - OpenAI might include extra text
        let jsonContent = rawContent.trim()
        
        // Look for JSON object markers
        const jsonStart = jsonContent.indexOf('{')
        const jsonEnd = jsonContent.lastIndexOf('}')
        
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          jsonContent = jsonContent.substring(jsonStart, jsonEnd + 1)
        }
        
        console.log('CLEANED JSON CONTENT:', jsonContent)
        analysis = JSON.parse(jsonContent)
        
      } catch (parseError) {
        console.error('JSON PARSE ERROR:', parseError.message)
        console.error('RAW CONTENT:', rawContent)
        
        // Create a fallback response if JSON parsing fails
        analysis = {
          questions: ["Analyysi epäonnistui teknisen virheen vuoksi."],
          concerns: [{
            category: "system",
            severity: "low",
            description: "AI-analyysi ei onnistunut",
            recommendation: "Yritä uudelleen tai tarkista tiedot manuaalisesti"
          }],
          maintenance_suggestions: [],
          overall_assessment: "Tekninen virhe AI-analyysissä. Tarkastustiedot näyttävät olevan kunnossa."
        }
      }

      // Save conversation to database (skip for test users)
      if (!request.userId.startsWith('test-user-')) {
        try {
          await supabase.from('ai_conversations').insert({
            user_id: request.userId,
            car_id: request.carId,
            conversation_type: 'analysis',
            input_data: context,
            ai_response: analysis,
            tokens_used: aiResponse.usage?.total_tokens || 0
          })
        } catch (dbError) {
          console.error('Failed to save conversation to DB:', dbError)
          // Don't throw error - analysis worked
        }
      }

      // Increment usage counter
      await this.incrementAIUsage(request.userId)

      return analysis

    } catch (error) {
      console.error('AI Analysis error:', error)
      throw new Error('Failed to analyze inspection data')
    }
  }

  /**
   * Chat about car issues
   */
  async chatAboutCar(
    userId: string, 
    carId: string, 
    message: string, 
    conversationHistory: Array<{role: string, content: string}> = []
  ): Promise<string> {
    // Check usage limits
    const subscription = await this.checkAIUsageLimit(userId)
    if (!subscription.can_use_ai) {
      throw new Error('AI usage limit exceeded. Please upgrade your subscription.')
    }

    // Simple system prompt for all users
    const systemPrompt = `You are Kimi-Mika, a friendly Finnish automotive expert and summer intern. Answer car-related questions helpfully and accurately in Finnish. Keep responses concise but informative.`

    try {
      console.log('Making OpenAI API call for chat...')
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            ...conversationHistory,
            { role: 'user', content: message }
          ],
          max_tokens: 800,
          temperature: 0.7
        })
      })

      console.log('OpenAI API chat response status:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('OpenAI API chat error response:', errorText)
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const aiResponse = await response.json()
      const reply = aiResponse.choices[0].message.content

      // Increment usage
      await this.incrementAIUsage(userId)

      return reply

    } catch (error) {
      console.error('AI Chat error:', error)
      throw new Error('Failed to get AI response')
    }
  }

  private createAnalysisPrompt(context: any): string {
    return `
Please analyze this car inspection data and provide insights in JSON format:

Inspection Data:
${JSON.stringify(context.inspection_data, null, 2)}

Car Knowledge:
${context.car_knowledge ? JSON.stringify(context.car_knowledge, null, 2) : 'No specific model data available'}

Please respond with JSON in this exact format:
{
  "questions": ["List of 3-5 specific follow-up questions based on missing or unclear inspection data"],
  "concerns": [
    {
      "category": "brake_system",
      "severity": "medium",
      "description": "Description of the concern",
      "recommendation": "What should be done"
    }
  ],
  "maintenance_suggestions": [
    {
      "item": "Brake pads",
      "urgency": "soon",
      "estimated_cost": "200-400 EUR"
    }
  ],
  "overall_assessment": "Brief summary of the car's condition and key recommendations"
}

Focus on:
1. Missing inspection data that would be important
2. Potential issues based on the filled data
3. Known issues for this car model
4. Maintenance recommendations based on mileage/age
5. Safety-critical items that need attention
`
  }
}

export const aiService = new AIService()