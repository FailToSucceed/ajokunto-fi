'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

export default function Footer() {
  const t = useTranslations()
  const [feedback, setFeedback] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false)
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [emailStatus, setEmailStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingFeedback(true)
    setFeedbackStatus('idle')
    
    try {
      const user = await getCurrentUser()
      
      const { error } = await supabase
        .from('feedback')
        .insert({
          message: feedback.trim(),
          user_id: user?.id || null,
          user_email: user?.email || null
        })

      if (error) {
        console.error('Error submitting feedback:', error)
        setFeedbackStatus('error')
      } else {
        setFeedbackStatus('success')
        setFeedback('')
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
      setFeedbackStatus('error')
    } finally {
      setIsSubmittingFeedback(false)
    }
  }

  const handleEmailSignup = async () => {
    if (!email.trim()) return
    
    setIsSubmittingEmail(true)
    setEmailStatus('idle')
    
    try {
      const user = await getCurrentUser()
      
      const { error } = await supabase
        .from('email_signups')
        .insert({
          email: email.trim().toLowerCase(),
          user_id: user?.id || null
        })

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          setEmailStatus('error')
        } else {
          console.error('Error signing up for email:', error)
          setEmailStatus('error')
        }
      } else {
        setEmailStatus('success')
        setEmail('')
      }
    } catch (error) {
      console.error('Error signing up for email:', error)
      setEmailStatus('error')
    } finally {
      setIsSubmittingEmail(false)
    }
  }

  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Feedback Form */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Anna palautetta</h3>
            </div>
            
            <p className="text-gray-600 text-sm mb-4">
              Mikä toimi? Mikä ei toiminut? Mitä ominaisuuksia haluaisit? 
              Miten parannamme tätä?
            </p>
            
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Kirjoita palautteesi tähän..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                required
              />
              
              {feedbackStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-sm">
                  Kiitos palautteesta! Se auttaa meitä parantamaan palvelua.
                </div>
              )}
              
              {feedbackStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                  Palautteen lähettäminen epäonnistui. Yritä uudelleen.
                </div>
              )}
              
              <button
                type="submit"
                disabled={isSubmittingFeedback || !feedback.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
              >
                {isSubmittingFeedback ? 'Lähetetään...' : 'Lähetä palaute'}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Liity sähköpostilistalle</h3>
            </div>
            
            <p className="text-gray-600 text-sm mb-4">
              Sovellus muuttuu maksulliseksi tulevaisuudessa. Haluamme 
              tarjota rajatulle määrälle ensitestaajille maksuttoman palvelun 
              jatkossakin kiitoksena palautteesta, testauksesta ja 
              vaivannäöstä. Joten, jos haluat käyttää sovellusta jatkossa 
              maksutta, niin liity tästä sähköpostilistalle varmistaaksesi 
              itsellesi sovelluksen maksutto käyttö myös jatkossa.
            </p>
            
            <div className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sähköposti@esimerkki.fi"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              
              {emailStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-sm">
                  Kiitos! Sinut on lisätty sähköpostilistalle.
                </div>
              )}
              
              {emailStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                  Sähköposti on jo listalla tai tapahtui virhe. Yritä uudelleen.
                </div>
              )}
              
              <button
                type="button"
                onClick={handleEmailSignup}
                disabled={!email.trim() || isSubmittingEmail}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
              >
                {isSubmittingEmail ? 'Lisätään...' : 'Liity sähköpostilistalle'}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Links */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <a href="/terms" className="hover:text-gray-900 flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Käyttöehdot</span>
              </a>
              <a href="/privacy" className="hover:text-gray-900 flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Tietosuojaseloste</span>
              </a>
            </div>
            
            <div className="text-sm text-gray-500">
              © 2025 Ajokunto.fi. Kaikki oikeudet pidätetään.
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}