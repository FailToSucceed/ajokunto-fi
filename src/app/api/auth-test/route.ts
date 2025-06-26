import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    console.log('Auth test endpoint called')
    
    // Create Supabase client for route handler
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get the current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    return NextResponse.json({ 
      success: !!session?.user,
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      sessionError: sessionError?.message,
      cookies: request.headers.get('cookie') ? 'Present' : 'Missing'
    })

  } catch (error: any) {
    console.error('Auth test error:', error)
    return NextResponse.json({ 
      success: false,
      error: error.message
    })
  }
}