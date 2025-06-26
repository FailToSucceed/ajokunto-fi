import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { aiService } from '@/lib/ai-service'

export async function POST(request: NextRequest) {
  try {
    console.log('AI Analyze POST request received')
    
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      console.log('No user found - unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
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