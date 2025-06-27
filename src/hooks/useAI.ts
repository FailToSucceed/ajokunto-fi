import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface SubscriptionInfo {
  type: 'free' | 'premium' | 'pro'
  queries_used: number
  queries_limit: number
  can_use_ai: boolean
}

interface AIAnalysisData {
  questions: string[]
  concerns: Array<{
    category: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    description: string
    recommendation: string
  }>
  maintenance_suggestions: Array<{
    item: string
    urgency: 'immediate' | 'soon' | 'routine'
    estimated_cost?: string
  }>
  overall_assessment: string
}

export function useAI() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<AIAnalysisData | null>(null)
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [error, setError] = useState('')

  const analyzeInspectionData = async (carId: string, inspectionData: any, carModel?: any) => {
    setIsAnalyzing(true)
    setError('')

    try {
      // Auth is now handled by middleware, just make the request
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          carId,
          inspectionData,
          carModel
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error === 'AI_LIMIT_EXCEEDED') {
          setError('AI-käyttöoikeus on loppunut. Päivitä tilauksesi jatkauksesi.')
        } else {
          setError('AI-analyysi epäonnistui. Yritä uudelleen.')
        }
        return null
      }

      setAnalysis(data.analysis)
      return data.analysis

    } catch (err) {
      console.error('AI analysis error:', err)
      setError('Verkkovirhe. Tarkista internet-yhteytesi.')
      return null
    } finally {
      setIsAnalyzing(false)
    }
  }

  const checkSubscription = async () => {
    try {
      // Auth is now handled by middleware, just make the request
      const response = await fetch('/api/ai/chat')
      if (response.ok) {
        const data = await response.json()
        setSubscription(data.subscription)
        return data.subscription
      }
    } catch (err) {
      console.error('Subscription check error:', err)
    }
    return null
  }

  const resetAnalysis = () => {
    setAnalysis(null)
    setError('')
  }

  return {
    isAnalyzing,
    analysis,
    subscription,
    error,
    analyzeInspectionData,
    checkSubscription,
    resetAnalysis
  }
}