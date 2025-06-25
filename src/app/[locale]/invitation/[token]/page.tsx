'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { acceptInvitation } from '@/lib/invitations'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface Invitation {
  id: string
  car_id: string
  email: string
  role: 'contributor' | 'viewer'
  expires_at: string
  car?: {
    registration_number: string
    make?: string
    model?: string
    year?: number
  }
}

export default function InvitationPage() {
  const params = useParams()
  const router = useRouter()
  const token = params?.token as string
  
  const [loading, setLoading] = useState(true)
  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [accepting, setAccepting] = useState(false)

  useEffect(() => {
    async function loadInvitation() {
      if (!token) {
        setError('Virheellinen kutsulinkki')
        setLoading(false)
        return
      }

      try {
        // Get current user
        const currentUser = await getCurrentUser()
        setUser(currentUser)

        // Get invitation details
        const { data: invitationData, error: invitationError } = await supabase
          .from('user_invitations')
          .select(`
            *,
            car:cars(registration_number, make, model, year)
          `)
          .eq('invitation_token', token)
          .is('accepted_at', null)
          .single()

        if (invitationError || !invitationData) {
          setError('Kutsu ei löytynyt tai se on jo hyväksytty')
          setLoading(false)
          return
        }

        // Check if expired
        if (new Date(invitationData.expires_at) < new Date()) {
          setError('Kutsu on vanhentunut')
          setLoading(false)
          return
        }

        setInvitation(invitationData)

        // If user is logged in and email matches, show accept option
        if (currentUser && currentUser.email === invitationData.email) {
          // User can accept immediately
        } else if (currentUser && currentUser.email !== invitationData.email) {
          setError(`Tämä kutsu on tarkoitettu sähköpostiosoitteelle: ${invitationData.email}. Olet kirjautunut sisään eri sähköpostiosoitteella: ${currentUser.email}`)
        }
        // If not logged in, user needs to register/login

      } catch (err) {
        console.error('Error loading invitation:', err)
        setError('Virhe ladattaessa kutsua')
      } finally {
        setLoading(false)
      }
    }

    loadInvitation()
  }, [token])

  const handleAccept = async () => {
    setAccepting(true)
    setError(null)

    try {
      const success = await acceptInvitation(token)
      if (success) {
        alert('Kutsu hyväksytty! Sinut on lisätty auton käyttäjäksi.')
        router.push('/dashboard')
      } else {
        setError('Kutsun hyväksyminen epäonnistui')
      }
    } catch (error) {
      console.error('Error accepting invitation:', error)
      setError('Virhe kutsun hyväksymisessä')
    } finally {
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Ladataan...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Virhe
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <a 
            href="/" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Takaisin etusivulle
          </a>
        </div>
      </div>
    )
  }

  if (!invitation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Kutsu ei löytynyt
          </h1>
          <p className="text-gray-600 mb-6">
            Kutsulinkki on virheellinen tai vanhentunut.
          </p>
          <a 
            href="/" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Takaisin etusivulle
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Ajokunto.fi - Kutsu auton käyttöoikeuksiin
          </h1>
        </div>
      </div>

      <main className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Sinut on kutsuttu auton käyttäjäksi
            </h2>
            
            <p className="text-gray-600">
              Sähköpostiosoite: <span className="font-medium">{invitation.email}</span>
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Auton tiedot</h3>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Rekisterinumero:</span> {invitation.car?.registration_number}
              </p>
              {(invitation.car?.make || invitation.car?.model || invitation.car?.year) && (
                <p>
                  <span className="font-medium">Auto:</span> {[invitation.car?.make, invitation.car?.model, invitation.car?.year].filter(Boolean).join(' ')}
                </p>
              )}
              <p>
                <span className="font-medium">Käyttöoikeus:</span> {invitation.role === 'contributor' ? 'Muokkaaja' : 'Katselija'}
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex">
              <svg className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Käyttöoikeuden kuvaus:</p>
                <p>
                  {invitation.role === 'contributor' 
                    ? 'Muokkaajana voit lisätä ja muokata auton tarkastustietoja sekä ladata mediaa.'
                    : 'Katselijana voit katsella auton tarkastustietoja ja historiaa.'
                  }
                </p>
              </div>
            </div>
          </div>

          {!user ? (
            <div className="text-center">
              <p className="text-gray-600 mb-6">
                Hyväksyäksesi kutsun, sinun tulee ensin rekisteröityä tai kirjautua sisään.
              </p>
              <div className="space-x-4">
                <a 
                  href={`/auth/signup?redirect=/invitation/${token}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Rekisteröidy
                </a>
                <a 
                  href={`/auth/signin?redirect=/invitation/${token}`}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Kirjaudu sisään
                </a>
              </div>
            </div>
          ) : user.email === invitation.email ? (
            <div className="text-center">
              <p className="text-gray-600 mb-6">
                Hyväksy kutsu liittyäksesi auton käyttäjäksi.
              </p>
              <button
                onClick={handleAccept}
                disabled={accepting}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                {accepting ? 'Hyväksytään...' : 'Hyväksy kutsu'}
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800">
                  Olet kirjautunut sisään väärällä sähköpostiosoitteella. Kirjaudu sisään osoitteella: <strong>{invitation.email}</strong>
                </p>
              </div>
              <a 
                href="/auth/signin"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Kirjaudu sisään oikealla tilillä
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}