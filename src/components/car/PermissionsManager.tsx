'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { supabase } from '@/lib/supabase'

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
  const [loading, setLoading] = useState(true)
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserRole, setNewUserRole] = useState<'contributor' | 'viewer'>('viewer')
  const [addingUser, setAddingUser] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadPermissions()
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

  const addUserPermission = async () => {
    if (!newUserEmail.trim()) return

    setAddingUser(true)
    setError('')

    try {
      // First, we need to find the user by email
      // Note: In a real implementation, you'd need an RPC function for this
      // since direct access to auth.users is restricted
      
      // For now, let's assume we have a way to get user ID by email
      // This would typically be done through a server-side function
      
      // Placeholder implementation
      const { data: userData, error: userError } = await supabase
        .rpc('get_user_by_email', { email: newUserEmail })

      if (userError || !userData) {
        setError('Käyttäjää ei löytynyt tällä sähköpostiosoitteella')
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
      setError('Käyttäjän lisääminen epäonnistui')
    } finally {
      setAddingUser(false)
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

            <button
              onClick={addUserPermission}
              disabled={addingUser || !newUserEmail.trim()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
            >
              {addingUser ? 'Lisätään...' : 'Lisää käyttäjä'}
            </button>
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