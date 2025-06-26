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
    console.log('AI Analyze POST request received')
    
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
    const { carId, inspectionData, carModel } = body

    if (!carId || !inspectionData) {
      return NextResponse.json({ 
        error: 'Missing required fields: carId, inspectionData' 
      }, { status: 400 })
    }

    // Analyze with AI
    const analysis = await aiService.analyzeInspectionData({
      carId,
      userId: user.id,
      inspectionData,
      carModel
    })

    return NextResponse.json({ success: true, analysis })

  } catch (error: any) {
    console.error('AI Analysis API error:', error)
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
      error: 'ANALYSIS_FAILED',
      message: 'Failed to analyze inspection data: ' + error.message
    }, { status: 500 })
  }
}