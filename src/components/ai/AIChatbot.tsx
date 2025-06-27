'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface SubscriptionInfo {
  type: 'free' | 'premium' | 'pro'
  queries_used: number
  queries_limit: number
  can_use_ai: boolean
}

interface AIChatbotProps {
  carId: string
  carInfo: {
    make: string
    model: string
    year: number
    registration_number: string
  }
  embedded?: boolean
}

export default function AIChatbot({ carId, carInfo, embedded = false }: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [error, setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen || embedded) {
      loadSubscriptionInfo()
      if (messages.length === 0) {
        // Add welcome message
        setMessages([{
          role: 'assistant',
          content: `Hei! Olen Kimi-Mika, kesäharjoittelija joka tietää paljon autoista! 🚗 Voin auttaa sinua ${carInfo.make} ${carInfo.model} ${carInfo.year} (${carInfo.registration_number}) liittyvissä kysymyksissä. Kysy minulta mitä vaan - auton kunnosta, huollosta, yleisistä ongelmista tai mitä ikinä mietityttääkään!`,
          timestamp: new Date().toISOString()
        }])
      }
    }
  }, [isOpen, carInfo, embedded])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadSubscriptionInfo = async () => {
    // Just set unlimited for now - no API calls
    setSubscription({
      type: 'free',
      queries_used: 0,
      queries_limit: 999,
      can_use_ai: true
    })
    setError('')
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    if (!subscription?.can_use_ai) {
      setError('AI-käyttöoikeus on loppunut. Päivitä tilauksesi jatkaaksesi.')
      return
    }

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)
    setError('')

    try {
      // Auth is now handled by middleware, just make the request
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          carId,
          message: inputMessage,
          conversationHistory: messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      })

      const data = await response.json()
      
      console.log('Chat API response:', { status: response.status, ok: response.ok, data })

      if (!response.ok) {
        console.error('Chat API error:', data)
        if (data.error === 'AI_LIMIT_EXCEEDED') {
          setError('AI-käyttöoikeus on loppunut. Päivitä tilauksesi jatkaaksesi.')
        } else if (data.error === 'UNAUTHORIZED') {
          setError('Kirjautuminen vaaditaan AI-keskusteluun.')
        } else {
          setError(`Virhe AI-vastauksessa: ${data.message || 'Tuntematon virhe'}`)
        }
        return
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.reply,
        timestamp: data.timestamp
      }

      setMessages(prev => [...prev, assistantMessage])
      
      // Update usage counter locally
      if (subscription) {
        setSubscription({
          ...subscription,
          queries_used: subscription.queries_used + 1
        })
      }

    } catch (error) {
      console.error('Chat error:', error)
      setError('Virhe keskustelussa. Tarkista verkkoyhteytesi.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Embedded mode - show inline chat
  if (embedded) {
    return (
      <div className="w-full bg-gray-50 rounded-lg border border-gray-200">
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            className="w-full p-4 text-left hover:bg-gray-100 transition-colors rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-gray-900">💬 Aloita keskustelu Kimi-Mikan kanssa</div>
                <div className="text-sm text-gray-500">Klikkaa tästä kysyäksesi autosta</div>
              </div>
            </div>
          </button>
        ) : (
          <div className="p-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h4 className="font-medium text-gray-900">Kimi-Mika</h4>
                {subscription && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {subscription.queries_used}/{subscription.queries_limit === -1 ? '∞' : subscription.queries_limit}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="max-h-64 overflow-y-auto mb-4 space-y-3">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs p-3 rounded-lg text-sm ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Input */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={!subscription?.can_use_ai ? "Lataa tilaustietoja..." : "Kysy autostasi..."}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading || !subscription?.can_use_ai}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim() || !subscription?.can_use_ai}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>

            {subscription ? (
              subscription.type === 'free' && (
                <p className="text-xs text-gray-500 mt-2">
                  Ilmaiskäyttäjä: {subscription.queries_used}/{subscription.queries_limit} kysymystä käytetty
                </p>
              )
            ) : (
              <p className="text-xs text-red-500 mt-2">
                Ladataan tilaustietoja... Jos ongelma jatkuu, tarkista API-avain.
              </p>
            )}
          </div>
        )}
      </div>
    )
  }

  // Floating mode (original)
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-colors z-50"
        title="Kysy AI:lta autostasi"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-xl flex justify-between items-center">
        <div>
          <h3 className="font-semibold">AI Auto-assistentti</h3>
          <p className="text-sm opacity-90">{carInfo.make} {carInfo.model}</p>
        </div>
        <div className="flex items-center space-x-2">
          {subscription && (
            <span className="text-xs bg-blue-500 px-2 py-1 rounded">
              {subscription.queries_used}/{subscription.queries_limit === -1 ? '∞' : subscription.queries_limit}
            </span>
          )}
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-blue-500 p-1 rounded"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={!subscription?.can_use_ai ? "Lataa tilaustietoja..." : "Kysy autostasi..."}
            className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={1}
            disabled={isLoading || !subscription?.can_use_ai}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !inputMessage.trim() || !subscription?.can_use_ai}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        
        {subscription ? (
          subscription.type === 'free' && (
            <p className="text-xs text-gray-500 mt-2">
              Ilmaiskäyttäjä: {subscription.queries_used}/{subscription.queries_limit} kysymystä käytetty
            </p>
          )
        ) : (
          <p className="text-xs text-red-500 mt-2">
            Ladataan tilaustietoja... Jos ongelma jatkuu, tarkista API-avain.
          </p>
        )}
      </div>
    </div>
  )
}