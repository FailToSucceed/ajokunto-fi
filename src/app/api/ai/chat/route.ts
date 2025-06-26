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
    console.log('Headers:', Object.fromEntries(request.headers.entries()))
    
    // Get auth header
    const authHeader = request.headers.get('authorization')
    console.log('Auth header:', authHeader ? 'Present' : 'Missing')
    
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('No valid auth header found')
      return NextResponse.json({ 
        error: 'Unauthorized', 
        debug: 'No authorization header or invalid format'
      }, { status: 401 })
    }

    const token = authHeader.substring(7)
    console.log('Token length:', token.length)
    
    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)
    console.log('Supabase auth result:', { user: user?.id, error: error?.message })
    
    if (error || !user) {
      console.log('Token verification failed:', error?.message)
      return NextResponse.json({ 
        error: 'Unauthorized', 
        debug: error?.message || 'User not found'
      }, { status: 401 })
    }
    
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
    
    // Get auth header
    const authHeader = request.headers.get('authorization')
    console.log('GET Auth header:', authHeader ? 'Present' : 'Missing')
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        debug: 'No authorization header or invalid format'
      }, { status: 401 })
    }

    const token = authHeader.substring(7)
    console.log('GET Token length:', token.length)
    
    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)
    console.log('GET Supabase auth result:', { user: user?.id, error: error?.message })
    
    if (error || !user) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        debug: error?.message || 'User not found'
      }, { status: 401 })
    }

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