import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { aiService } from '@/lib/ai-service'

// Use anon key for token verification, service role is handled in aiService
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('AI Chat POST request received')
    
    // Get user ID from middleware (set by middleware after auth check)
    const userId = request.headers.get('x-user-id')
    console.log('User ID from middleware:', userId)
    
    if (!userId) {
      console.log('No user ID found - middleware auth failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Create user object for compatibility
    const user = { id: userId }
    
    console.log('User authenticated:', user.id)

    const body = await request.json()
    const { carId, message, conversationHistory = [] } = body
    
    console.log('Request body:', { carId, message: message?.substring(0, 50) + '...', historyLength: conversationHistory.length })

    if (!carId || !message) {
      console.log('Missing required fields:', { carId: !!carId, message: !!message })
      return NextResponse.json({ 
        error: 'Missing required fields: carId, message' 
      }, { status: 400 })
    }

    // Chat with AI
    const reply = await aiService.chatAboutCar(
      user.id,
      carId, 
      message,
      conversationHistory
    )

    return NextResponse.json({ 
      success: true, 
      reply,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('AI Chat API error:', error)
    console.error('Error stack:', error.stack)
    
    if (error.message.includes('usage limit exceeded')) {
      return NextResponse.json({ 
        error: 'AI_LIMIT_EXCEEDED',
        message: 'AI usage limit exceeded. Please upgrade your subscription.'
      }, { status: 429 })
    }

    if (error.message.includes('OPENAI_API_KEY')) {
      return NextResponse.json({ 
        error: 'API_KEY_MISSING',
        message: 'OpenAI API key not configured'
      }, { status: 500 })
    }

    return NextResponse.json({ 
      error: 'CHAT_FAILED',
      message: 'Failed to get AI response: ' + error.message
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('AI Chat GET request received')
    
    // Get user ID from middleware (set by middleware after auth check)
    const userId = request.headers.get('x-user-id')
    console.log('GET User ID from middleware:', userId)
    
    if (!userId) {
      console.log('GET No user ID found - middleware auth failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Create user object for compatibility
    const user = { id: userId }

    // Get user's AI usage info
    const subscription = await aiService.checkAIUsageLimit(user.id)

    return NextResponse.json({ success: true, subscription })

  } catch (error: any) {
    console.error('AI Usage check error:', error)
    return NextResponse.json({ 
      error: 'USAGE_CHECK_FAILED',
      message: 'Failed to check AI usage' 
    }, { status: 500 })
  }
}