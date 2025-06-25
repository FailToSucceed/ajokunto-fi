'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getCurrentUser } from '@/lib/auth'
import type { User } from '@supabase/supabase-js'

export default function Header() {
  const t = useTranslations()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await getCurrentUser()
        console.log('Header: Current user:', currentUser?.email || 'No user')
        setUser(currentUser)
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [])

  return (
    <header className="bg-white border-b border-gray-200">
      {/* EMERGENCY DEBUG - SHOULD BE VISIBLE */}
      <div className="bg-red-500 text-white text-lg text-center py-4 font-black border-4 border-yellow-400" style={{zIndex: 9999}}>
        🔴 UUSI VERSIO KÄYTÖSSÄ v3.0
      </div>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">Ajokunto.fi</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-600 hover:text-gray-900 font-medium">
              Etusivu
            </Link>
            {user && (
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 font-medium">
                Autot
              </Link>
            )}
            {/* DEBUG: NO TEHTÄVÄT LINK HERE - REMOVED! */}
          </nav>

          {/* Auth Button */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="w-8 h-8 animate-pulse bg-gray-200 rounded-lg"></div>
            ) : user ? (
              <div className="flex items-center space-x-2">
                <Link 
                  href="/profile" 
                  className="flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium px-4 py-2 rounded-lg border border-gray-200 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Profiili</span>
                </Link>
                <Link 
                  href="/dashboard" 
                  className="flex items-center space-x-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium px-4 py-2 rounded-lg border border-blue-200 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>Autot</span>
                </Link>
              </div>
            ) : (
              <Link 
                href="/auth/signin" 
                className="flex items-center space-x-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium px-4 py-2 rounded-lg border border-blue-200 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>Kirjaudu sisään</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}