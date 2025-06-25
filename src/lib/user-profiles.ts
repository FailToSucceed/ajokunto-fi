import { supabase } from './supabase'

export interface UserProfile {
  id: string
  user_id: string
  first_name: string | null
  last_name: string | null
  phone_number: string | null
  created_at: string
  updated_at: string
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No profile found
      return null
    }
    console.error('Error fetching user profile:', error)
    return null
  }

  return data
}

export async function createUserProfile(
  userId: string,
  profileData: {
    first_name?: string
    last_name?: string
    phone_number?: string
  }
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert({
      user_id: userId,
      ...profileData
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating user profile:', error)
    return null
  }

  return data
}

export async function updateUserProfile(
  userId: string,
  profileData: {
    first_name?: string
    last_name?: string
    phone_number?: string
  }
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      ...profileData,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating user profile:', error)
    return null
  }

  return data
}

export async function upsertUserProfile(
  userId: string,
  profileData: {
    first_name?: string
    last_name?: string
    phone_number?: string
  }
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({
      user_id: userId,
      ...profileData,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Error upserting user profile:', error)
    return null
  }

  return data
}