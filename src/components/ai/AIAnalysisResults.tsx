'use client'

import { useState } from 'react'

interface Concern {
  category: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  recommendation: string
}

interface MaintenanceSuggestion {
  item: string
  urgency: 'immediate' | 'soon' | 'routine'
  estimated_cost?: string
}

interface AIAnalysisData {
  questions: string[]
  concerns: Concern[]
  maintenance_suggestions: MaintenanceSuggestion[]
  overall_assessment: string
}

interface AIAnalysisResultsProps {
  analysis: AIAnalysisData
  onQuestionClick?: (question: string) => void
}

export default function AIAnalysisResults({ analysis, onQuestionClick }: AIAnalysisResultsProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('questions')

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'immediate': return 'bg-red-100 text-red-800 border-red-200'
      case 'soon': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'routine': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900">AI Tarkastusanalyysi</h2>
        <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
          Powered by AI
        </span>
      </div>

      {/* Overall Assessment */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-6 border border-purple-200">
        <h3 className="font-semibold text-gray-900 mb-2">📋 Kokonaisarvio</h3>
        <p className="text-gray-700">{analysis.overall_assessment}</p>
      </div>

      {/* Follow-up Questions */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('questions')}
          className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <span className="text-blue-600">❓</span>
            <h3 className="font-semibold text-gray-900">Tarkentavat kysymykset ({analysis.questions.length})</h3>
          </div>
          <svg 
            className={`w-5 h-5 text-blue-600 transform transition-transform ${expandedSection === 'questions' ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {expandedSection === 'questions' && (
          <div className="mt-3 space-y-2">
            {analysis.questions.map((question, index) => (
              <div
                key={index}
                className={`p-3 bg-white border border-blue-200 rounded-lg ${onQuestionClick ? 'cursor-pointer hover:bg-blue-50' : ''}`}
                onClick={() => onQuestionClick?.(question)}
              >
                <p className="text-gray-700">{question}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Concerns */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('concerns')}
          className="w-full flex items-center justify-between p-3 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <span className="text-orange-600">⚠️</span>
            <h3 className="font-semibold text-gray-900">Huomioitavaa ({analysis.concerns.length})</h3>
          </div>
          <svg 
            className={`w-5 h-5 text-orange-600 transform transition-transform ${expandedSection === 'concerns' ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {expandedSection === 'concerns' && (
          <div className="mt-3 space-y-3">
            {analysis.concerns.map((concern, index) => (
              <div key={index} className="p-4 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 capitalize">
                    {concern.category.replace('_', ' ')}
                  </h4>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getSeverityColor(concern.severity)}`}>
                    {concern.severity === 'critical' ? 'Kriittinen' :
                     concern.severity === 'high' ? 'Korkea' :
                     concern.severity === 'medium' ? 'Keskitaso' : 'Matala'}
                  </span>
                </div>
                <p className="text-gray-700 text-sm mb-2">{concern.description}</p>
                <p className="text-blue-600 text-sm font-medium">💡 {concern.recommendation}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Maintenance Suggestions */}
      <div>
        <button
          onClick={() => toggleSection('maintenance')}
          className="w-full flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <span className="text-green-600">🔧</span>
            <h3 className="font-semibold text-gray-900">Huoltosuositukset ({analysis.maintenance_suggestions.length})</h3>
          </div>
          <svg 
            className={`w-5 h-5 text-green-600 transform transition-transform ${expandedSection === 'maintenance' ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {expandedSection === 'maintenance' && (
          <div className="mt-3 space-y-3">
            {analysis.maintenance_suggestions.map((suggestion, index) => (
              <div key={index} className="p-4 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{suggestion.item}</h4>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getUrgencyColor(suggestion.urgency)}`}>
                    {suggestion.urgency === 'immediate' ? 'Välitön' :
                     suggestion.urgency === 'soon' ? 'Pian' : 'Rutiini'}
                  </span>
                </div>
                {suggestion.estimated_cost && (
                  <p className="text-gray-600 text-sm">💰 Arvioitu kustannus: {suggestion.estimated_cost}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Keskustele AI:n kanssa</span>
          </button>
          <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Lataa raportti</span>
          </button>
        </div>
      </div>
    </div>
  )
}