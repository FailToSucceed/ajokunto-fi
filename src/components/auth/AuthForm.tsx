'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { signIn, signUp } from '@/lib/auth'
import { useRouter } from 'next/navigation'

interface AuthFormProps {
  mode: 'signin' | 'signup'
  onSuccess?: () => void
}

export default function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const t = useTranslations()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showEmailVerification, setShowEmailVerification] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])

  const validatePassword = (password: string): string[] => {
    const errors: string[] = []
    if (password.length < 8) {
      errors.push('Salasanan tulee olla vähintään 8 merkkiä pitkä')
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Salasanassa tulee olla vähintään yksi pieni kirjain')
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Salasanassa tulee olla vähintään yksi iso kirjain')
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Salasanassa tulee olla vähintään yksi numero')
    }
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setPasswordErrors([])

    if (mode === 'signup') {
      const passwordValidationErrors = validatePassword(password)
      if (passwordValidationErrors.length > 0) {
        setPasswordErrors(passwordValidationErrors)
        setLoading(false)
        return
      }
      
      if (password !== confirmPassword) {
        setError('Salasanat eivät täsmää')
        setLoading(false)
        return
      }
      
      if (!firstName.trim() || !lastName.trim()) {
        setError('Etunimi ja sukunimi ovat pakollisia')
        setLoading(false)
        return
      }
    }

    try {
      const { error } = mode === 'signin' 
        ? await signIn(email, password)
        : await signUp(email, password, firstName.trim(), lastName.trim())

      if (error) {
        setError(error.message)
      } else {
        if (mode === 'signup') {
          setShowEmailVerification(true)
        } else {
          if (onSuccess) {
            onSuccess()
          } else {
            router.push('/dashboard')
          }
        }
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (showEmailVerification) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Tarkasta sähköpostisi
          </h2>
          <p className="text-gray-600 mb-6">
            Tarkasta seuraavaksi sähköposti ja vahvista rekisteröityminen. 
            Lähetimme vahvistuslinkin osoitteeseen:
          </p>
          <p className="font-medium text-gray-900 mb-6">{email}</p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/auth/signin')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Siirry kirjautumissivulle
            </button>
            <button
              onClick={() => setShowEmailVerification(false)}
              className="w-full text-gray-600 hover:text-gray-900 text-sm"
            >
              Takaisin rekisteröitymiseen
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-center mb-6">
        {mode === 'signin' ? 'Kirjaudu sisään' : 'Rekisteröidy'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        {mode === 'signup' && (
          <>
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                Etunimi *
              </label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                placeholder="Etunimi"
              />
            </div>
            
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Sukunimi *
              </label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                placeholder="Sukunimi"
              />
            </div>
          </>
        )}
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Sähköposti *
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="sinun@sahkoposti.fi"
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Salasana *
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={mode === 'signup' ? "Vähintään 8 merkkiä" : "Salasana"}
          />
          {mode === 'signup' && (
            <div className="mt-2 text-sm text-gray-600">
              <p className="font-medium mb-1">Vahva salasana sisältää:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Vähintään 8 merkkiä</li>
                <li>Vähintään yhden ison kirjaimen (A-Z)</li>
                <li>Vähintään yhden pienen kirjaimen (a-z)</li>
                <li>Vähintään yhden numeron (0-9)</li>
              </ul>
            </div>
          )}
          {passwordErrors.length > 0 && (
            <div className="mt-2">
              {passwordErrors.map((error, index) => (
                <div key={index} className="text-sm text-red-600">
                  {error}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {mode === 'signup' && (
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Vahvista salasana *
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Kirjoita salasana uudestaan"
            />
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-2 px-4 rounded-md transition-colors"
        >
          {loading ? t('common.loading') : (mode === 'signin' ? 'Kirjaudu sisään' : 'Rekisteröidy')}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <button
          onClick={() => router.push(mode === 'signin' ? '/auth/signup' : '/auth/signin')}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          {mode === 'signin' 
            ? 'Eikö sinulla ole tiliä? Rekisteröidy'
            : 'Onko sinulla jo tili? Kirjaudu sisään'
          }
        </button>
      </div>
    </div>
  )
}