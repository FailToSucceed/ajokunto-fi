'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, signOut } from '@/lib/auth'
import { getUserProfile, upsertUserProfile, UserProfile } from '@/lib/user-profiles'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function Profile() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    email: ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    setLoading(true)
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/auth/signin')
        return
      }

      setUser(currentUser)
      const userProfile = await getUserProfile(currentUser.id)
      setProfile(userProfile)
      
      setFormData({
        first_name: userProfile?.first_name || '',
        last_name: userProfile?.last_name || '',
        phone_number: userProfile?.phone_number || '',
        email: currentUser.email || ''
      })
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.email.includes('@')) {
      newErrors.email = 'Virheellinen sähköpostiosoite'
    }

    if (formData.phone_number && !/^[+]?[\d\s-()]+$/.test(formData.phone_number)) {
      newErrors.phone_number = 'Virheellinen puhelinnumero'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validatePassword = () => {
    const newErrors: {[key: string]: string} = {}

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Nykyinen salasana vaaditaan'
    }

    if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Uusi salasana on oltava vähintään 6 merkkiä'
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Salasanat eivät täsmää'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !validateForm()) return

    setSaving(true)
    try {
      // Update email if changed
      if (formData.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email
        })
        if (emailError) {
          setErrors({ email: 'Sähköpostin päivitys epäonnistui: ' + emailError.message })
          return
        }
      }

      // Update profile
      const updatedProfile = await upsertUserProfile(user.id, {
        first_name: formData.first_name || undefined,
        last_name: formData.last_name || undefined,
        phone_number: formData.phone_number || undefined
      })

      if (updatedProfile) {
        setProfile(updatedProfile)
        alert('Profiilin tiedot päivitetty onnistuneesti!')
      } else {
        alert('Profiilin päivitys epäonnistui')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Virhe profiilin tallentamisessa')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validatePassword()) return

    setChangingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) {
        setErrors({ newPassword: 'Salasanan vaihto epäonnistui: ' + error.message })
      } else {
        alert('Salasana vaihdettu onnistuneesti!')
        setShowPasswordForm(false)
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      }
    } catch (error) {
      console.error('Error changing password:', error)
      setErrors({ newPassword: 'Virhe salasanan vaihdossa' })
    } finally {
      setChangingPassword(false)
    }
  }

  const handleSignOut = async () => {
    if (confirm('Haluatko varmasti kirjautua ulos?')) {
      await signOut()
      router.push('/')
    }
  }

  const handleDeleteAccount = async () => {
    if (confirm('Haluatko varmasti poistaa tilisi? Tätä toimintoa ei voi peruuttaa.')) {
      try {
        // In a real app, you'd want to delete user data first
        // For now, just sign out
        await signOut()
        router.push('/')
        alert('Tili poistettu onnistuneesti')
      } catch (error) {
        console.error('Error deleting account:', error)
        alert('Virhe tilin poistamisessa')
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Ladataan...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Takaisin</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Käyttäjäprofiili</h1>
        </div>

        <div className="space-y-6">
          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Perustiedot</h2>
            
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Etunimi
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Sukunimi
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Sähköpostiosoite
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                  Puhelinnumero
                </label>
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+358 40 123 4567"
                />
                {errors.phone_number && (
                  <p className="text-red-600 text-sm mt-1">{errors.phone_number}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {saving ? 'Tallennetaan...' : 'Tallenna muutokset'}
              </button>
            </form>
          </div>

          {/* Password Change */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Salasanan vaihto</h2>
            
            {!showPasswordForm ? (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Vaihda salasana
              </button>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Nykyinen salasana
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.currentPassword && (
                    <p className="text-red-600 text-sm mt-1">{errors.currentPassword}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Uusi salasana
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    minLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.newPassword && (
                    <p className="text-red-600 text-sm mt-1">{errors.newPassword}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Vahvista uusi salasana
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    minLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    {changingPassword ? 'Vaihdetaan...' : 'Vaihda salasana'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false)
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      })
                      setErrors({})
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Peruuta
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
            <h2 className="text-xl font-semibold text-red-900 mb-4">Kirjaudu ulos tai poista tili</h2>
            
            <div className="space-y-4">
              <button
                onClick={handleSignOut}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Kirjaudu ulos
              </button>

              <button
                onClick={handleDeleteAccount}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Poista tili pysyvästi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}