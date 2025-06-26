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
    
    if (error.message.includes('usage limit exceeded')) {
      return NextResponse.json({ 
        error: 'AI_LIMIT_EXCEEDED',
        message: 'AI usage limit exceeded. Please upgrade your subscription.'
      }, { status: 429 })
    }

    return NextResponse.json({ 
      error: 'ANALYSIS_FAILED',
      message: 'Failed to analyze inspection data' 
    }, { status: 500 })
  }
}