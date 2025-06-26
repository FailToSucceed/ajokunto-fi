import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { aiService } from '@/lib/ai-service'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { carId, message, conversationHistory = [] } = body

    if (!carId || !message) {
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
    
    if (error.message.includes('usage limit exceeded')) {
      return NextResponse.json({ 
        error: 'AI_LIMIT_EXCEEDED',
        message: 'AI usage limit exceeded. Please upgrade your subscription.'
      }, { status: 429 })
    }

    return NextResponse.json({ 
      error: 'CHAT_FAILED',
      message: 'Failed to get AI response' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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