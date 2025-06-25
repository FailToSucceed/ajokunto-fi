import { supabase } from './supabase'
import { getCurrentUser } from './auth'

export interface ShareLink {
  id: string
  car_id: string
  share_token: string
  permission_type: 'view' | 'edit'
  expires_at: string | null
  created_by: string
  created_at: string
  accessed_count: number
}

// Generate a unique share token
function generateShareToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function createShareLink(
  carId: string, 
  permissionType: 'view' | 'edit',
  expiresInDays?: number
): Promise<ShareLink | null> {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error('User not authenticated')

    const shareToken = generateShareToken()
    const expiresAt = expiresInDays 
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
      : null

    const { data, error } = await supabase
      .from('shared_checklists')
      .insert({
        car_id: carId,
        share_token: shareToken,
        permission_type: permissionType,
        expires_at: expiresAt,
        created_by: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating share link:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error creating share link:', error)
    return null
  }
}

export async function getShareLinks(carId: string): Promise<ShareLink[]> {
  try {
    const { data, error } = await supabase
      .from('shared_checklists')
      .select('*')
      .eq('car_id', carId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching share links:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching share links:', error)
    return []
  }
}

export async function deleteShareLink(shareId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('shared_checklists')
      .delete()
      .eq('id', shareId)

    if (error) {
      console.error('Error deleting share link:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting share link:', error)
    return false
  }
}

export async function validateShareToken(token: string): Promise<ShareLink | null> {
  try {
    const { data, error } = await supabase
      .from('shared_checklists')
      .select('*')
      .eq('share_token', token)
      .single()

    if (error || !data) {
      return null
    }

    // Check if expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return null
    }

    // Increment access count
    await supabase
      .from('shared_checklists')
      .update({ accessed_count: data.accessed_count + 1 })
      .eq('id', data.id)

    return data
  } catch (error) {
    console.error('Error validating share token:', error)
    return null
  }
}

export function generateShareUrl(shareToken: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/shared/${shareToken}`
  }
  return `https://ajokunto-fi.vercel.app/shared/${shareToken}`
}

export async function generateQRCode(text: string): Promise<string> {
  // For now, we'll use a simple QR code service
  // In production, you might want to use a library like 'qrcode'
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`
}