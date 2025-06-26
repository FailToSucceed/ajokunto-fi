import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    console.log('Auth test endpoint called')
    
    // Get auth header
    const authHeader = request.headers.get('authorization')
    console.log('Auth header present:', !!authHeader)
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ 
        success: false,
        message: 'No authorization header',
        hasHeader: !!authHeader,
        headerValue: authHeader?.substring(0, 20) + '...'
      })
    }

    const token = authHeader.substring(7)
    console.log('Token length:', token.length)
    
    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    return NextResponse.json({ 
      success: !error && !!user,
      hasUser: !!user,
      userId: user?.id,
      error: error?.message,
      tokenLength: token.length
    })

  } catch (error: any) {
    console.error('Auth test error:', error)
    return NextResponse.json({ 
      success: false,
      error: error.message
    })
  }
}