import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { aiService } from '@/lib/ai-service'

export async function POST(request: NextRequest) {
  try {
    console.log('AI Analyze POST request received')
    
    // Create Supabase client for route handler
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get the current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    console.log('Session check:', { hasSession: !!session, error: sessionError })
    
    if (!session?.user) {
      console.log('No user session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const user = session.user
    
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