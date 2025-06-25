import { supabase } from './supabase'
import { getCurrentUser } from './auth'

export interface UserInvitation {
  id: string
  car_id: string
  email: string
  role: 'owner' | 'contributor' | 'viewer'
  invitation_token: string
  expires_at: string
  invited_by: string
  accepted_at: string | null
  accepted_by: string | null
  created_at: string
}

// Generate a unique invitation token
function generateInvitationToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function createInvitation(
  carId: string,
  email: string,
  role: 'contributor' | 'viewer'
): Promise<UserInvitation | null> {
  try {
    console.log('Creating invitation for:', email, 'to car:', carId, 'with role:', role)
    const user = await getCurrentUser()
    if (!user) {
      console.error('User not authenticated')
      throw new Error('User not authenticated')
    }

    const invitationToken = generateInvitationToken()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days

    console.log('Inserting invitation:', {
      car_id: carId,
      email: email.toLowerCase(),
      role,
      invitation_token: invitationToken,
      expires_at: expiresAt,
      invited_by: user.id
    })

    const { data, error } = await supabase
      .from('user_invitations')
      .insert({
        car_id: carId,
        email: email.toLowerCase(),
        role,
        invitation_token: invitationToken,
        expires_at: expiresAt,
        invited_by: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error creating invitation:', error)
      return null
    }

    console.log('Invitation created successfully:', data)
    return data
  } catch (error) {
    console.error('Error creating invitation:', error)
    return null
  }
}

export async function getInvitations(carId: string): Promise<UserInvitation[]> {
  try {
    const { data, error } = await supabase
      .from('user_invitations')
      .select('*')
      .eq('car_id', carId)
      .is('accepted_at', null) // Only pending invitations
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching invitations:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching invitations:', error)
    return []
  }
}

export async function deleteInvitation(invitationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_invitations')
      .delete()
      .eq('id', invitationId)

    if (error) {
      console.error('Error deleting invitation:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting invitation:', error)
    return false
  }
}

export async function acceptInvitation(invitationToken: string): Promise<boolean> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Get the invitation
    const { data: invitation, error: fetchError } = await supabase
      .from('user_invitations')
      .select('*')
      .eq('invitation_token', invitationToken)
      .is('accepted_at', null)
      .single()

    if (fetchError || !invitation) {
      console.error('Invitation not found or already accepted:', fetchError)
      return false
    }

    // Check if expired
    if (new Date(invitation.expires_at) < new Date()) {
      console.error('Invitation has expired')
      return false
    }

    // Check if email matches
    if (invitation.email !== user.email) {
      console.error('Email does not match invitation')
      return false
    }

    // Add user to car permissions
    const { error: permissionError } = await supabase
      .from('car_permissions')
      .insert({
        car_id: invitation.car_id,
        user_id: user.id,
        role: invitation.role
      })

    if (permissionError) {
      console.error('Error adding car permission:', permissionError)
      return false
    }

    // Mark invitation as accepted
    const { error: updateError } = await supabase
      .from('user_invitations')
      .update({
        accepted_at: new Date().toISOString(),
        accepted_by: user.id
      })
      .eq('id', invitation.id)

    if (updateError) {
      console.error('Error updating invitation:', updateError)
      return false
    }

    return true
  } catch (error) {
    console.error('Error accepting invitation:', error)
    return false
  }
}

export function generateInvitationUrl(invitationToken: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/invitation/${invitationToken}`
  }
  return `https://ajokunto-fi.vercel.app/invitation/${invitationToken}`
}

export async function checkUserExists(email: string): Promise<boolean> {
  try {
    // This is a simplified check - in a real app you might want to query users table
    // For now, we'll just return false to always show invitation option
    return false
  } catch (error) {
    console.error('Error checking user existence:', error)
    return false
  }
}