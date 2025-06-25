'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { supabase } from '@/lib/supabase'
import { createInvitation, getInvitations, deleteInvitation, generateInvitationUrl, checkUserExists, UserInvitation } from '@/lib/invitations'

interface Permission {
  id: string
  user_id: string
  role: 'owner' | 'contributor' | 'viewer'
  user_email?: string
}

interface PermissionsManagerProps {
  carId: string
  currentUserRole: string
  onClose: () => void
}

export default function PermissionsManager({
  carId,
  currentUserRole,
  onClose
}: PermissionsManagerProps) {
  const t = useTranslations()
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [invitations, setInvitations] = useState<UserInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserRole, setNewUserRole] = useState<'contributor' | 'viewer'>('viewer')
  const [addingUser, setAddingUser] = useState(false)
  const [error, setError] = useState('')
  const [showInvitationOption, setShowInvitationOption] = useState(false)

  useEffect(() => {
    loadPermissions()
    loadInvitations()
  }, [carId])

  const loadPermissions = async () => {
    try {
      // Note: This would require a view or RPC function to join with auth.users
      // For now, we'll load permissions without user emails
      const { data, error } = await supabase
        .from('car_permissions')
        .select('*')
        .eq('car_id', carId)

      if (error) {
        console.error('Error loading permissions:', error)
      } else {
        setPermissions(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadInvitations = async () => {
    try {
      const invites = await getInvitations(carId)
      setInvitations(invites)
    } catch (error) {
      console.error('Error loading invitations:', error)
    }
  }

  const addUserPermission = async () => {
    if (!newUserEmail.trim()) return

    setAddingUser(true)
    setError('')
    setShowInvitationOption(false)

    try {
      // First check if user exists
      const userExists = await checkUserExists(newUserEmail.trim())
      
      if (!userExists) {
        // User doesn't exist, show invitation option
        setShowInvitationOption(true)
        setAddingUser(false)
        return
      }

      // User exists - try to add directly
      const { data: userData, error: userError } = await supabase
        .rpc('get_user_by_email', { email: newUserEmail.trim() })

      if (userError || !userData) {
        // If RPC fails, also show invitation option
        setShowInvitationOption(true)
        setAddingUser(false)
        return
      }

      const { error: permissionError } = await supabase
        .from('car_permissions')
        .insert({
          car_id: carId,
          user_id: userData.id,
          role: newUserRole
        })

      if (permissionError) {
        if (permissionError.code === '23505') { // Unique constraint violation
          setError('Käyttäjällä on jo oikeudet tähän autoon')
        } else {
          setError(permissionError.message)
        }
      } else {
        setNewUserEmail('')
        setNewUserRole('viewer')
        await loadPermissions()
      }
    } catch (error) {
      console.error('Error in addUserPermission:', error)
      // On any error, show invitation option
      setShowInvitationOption(true)
    } finally {
      setAddingUser(false)
    }
  }

  const sendInvitation = async () => {
    if (!newUserEmail.trim()) return

    setAddingUser(true)
    setError('')

    try {
      const invitation = await createInvitation(carId, newUserEmail.trim(), newUserRole)
      
      if (invitation) {
        const inviteUrl = generateInvitationUrl(invitation.invitation_token)
        
        // Copy to clipboard and show success
        navigator.clipboard.writeText(inviteUrl)
        alert(`Kutsu lähetetty! Jakolinkki kopioitu leikepöydälle:\n\n${inviteUrl}\n\nJaa tämä linkki henkilölle: ${newUserEmail}`)
        
        setNewUserEmail('')
        setNewUserRole('viewer')
        setShowInvitationOption(false)
        await loadInvitations()
      } else {
        setError('Kutsun lähettäminen epäonnistui')
      }
    } catch (error) {
      console.error('Error sending invitation:', error)
      setError('Kutsun lähettäminen epäonnistui')
    } finally {
      setAddingUser(false)
    }
  }

  const deleteInvite = async (invitationId: string) => {
    const success = await deleteInvitation(invitationId)
    if (success) {
      await loadInvitations()
    }
  }

  const updatePermission = async (permissionId: string, newRole: 'owner' | 'contributor' | 'viewer') => {
    try {
      const { error } = await supabase
        .from('car_permissions')
        .update({ role: newRole })
        .eq('id', permissionId)

      if (error) {
        console.error('Error updating permission:', error)
      } else {
        await loadPermissions()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const removePermission = async (permissionId: string) => {
    try {
      const { error } = await supabase
        .from('car_permissions')
        .delete()
        .eq('id', permissionId)

      if (error) {
        console.error('Error removing permission:', error)
      } else {
        await loadPermissions()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const canManagePermissions = currentUserRole === 'owner'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">
            Käyttöoikeudet
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <span className="sr-only">{t('common.close')}</span>
            ✕
          </button>
        </div>

        {canManagePermissions && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-4">Lisää käyttäjä</h4>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="käyttäjä@esimerkki.fi"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as 'contributor' | 'viewer')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="viewer">Katselija</option>
                  <option value="contributor">Muokkaaja</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-2 mt-4">
              <button
                onClick={addUserPermission}
                disabled={addingUser || !newUserEmail.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
              >
                {addingUser ? 'Lisätään...' : 'Lisää käyttäjä'}
              </button>
              
              {showInvitationOption && (
                <button
                  onClick={sendInvitation}
                  disabled={addingUser || !newUserEmail.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400"
                >
                  {addingUser ? 'Lähetetään...' : 'Lähetä kutsu'}
                </button>
              )}
            </div>
            
            {showInvitationOption && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex">
                  <svg className="w-5 h-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-yellow-800">
                      <strong>Käyttäjää ei löytynyt tällä sähköpostiosoitteella.</strong>
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Voit lähettää kutsun, joka mahdollistaa henkilön rekisteröitymisen ja liittymisen autolle.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          <h4 className="font-medium">Nykyiset käyttöoikeudet</h4>
          
          {loading ? (
            <div className="animate-pulse space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {permissions.map((permission) => (
                <div key={permission.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium">
                      {permission.user_email || `Käyttäjä ${permission.user_id.slice(0, 8)}...`}
                    </div>
                    <div className="text-sm text-gray-600">
                      {permission.role === 'owner' ? 'Omistaja' :
                       permission.role === 'contributor' ? 'Muokkaaja' : 'Katselija'}
                    </div>
                  </div>

                  {canManagePermissions && permission.role !== 'owner' && (
                    <div className="flex items-center space-x-2">
                      <select
                        value={permission.role}
                        onChange={(e) => updatePermission(permission.id, e.target.value as any)}
                        className="text-sm px-2 py-1 border border-gray-300 rounded"
                      >
                        <option value="viewer">Katselija</option>
                        <option value="contributor">Muokkaaja</option>
                      </select>
                      <button
                        onClick={() => removePermission(permission.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Poista
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Invitations */}
        {canManagePermissions && invitations.length > 0 && (
          <div className="space-y-4 mt-6">
            <h4 className="font-medium">Odottavat kutsut</h4>
            <div className="space-y-2">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
                  <div>
                    <div className="font-medium">{invitation.email}</div>
                    <div className="text-sm text-gray-600">
                      {invitation.role === 'contributor' ? 'Muokkaaja' : 'Katselija'} • 
                      Kutsuttu {new Date(invitation.created_at).toLocaleDateString('fi-FI')}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        const url = generateInvitationUrl(invitation.invitation_token)
                        navigator.clipboard.writeText(url)
                        alert('Kutsu kopioitu leikepöydälle!')
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Kopioi linkki
                    </button>
                    <button
                      onClick={() => deleteInvite(invitation.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Poista
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <div className="text-sm text-gray-600 space-y-2">
            <h5 className="font-medium">Roolien kuvaus:</h5>
            <ul className="space-y-1 text-sm">
              <li><strong>Omistaja:</strong> Täydet oikeudet, voi hallita käyttöoikeuksia</li>
              <li><strong>Muokkaaja:</strong> Voi lisätä ja muokata tarkastustietoja ja mediaa</li>
              <li><strong>Katselija:</strong> Voi vain katsoa tietoja</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  )
}