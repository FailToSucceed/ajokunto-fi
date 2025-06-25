'use client'

import { useEffect, useState } from 'react'
import { useParams, notFound } from 'next/navigation'
import { validateShareToken, ShareLink } from '@/lib/sharing'
import { supabase } from '@/lib/supabase'
import SharedChecklistView from '@/components/car/SharedChecklistView'

interface Car {
  id: string
  registration_number: string
  make?: string
  model?: string
  year?: number
}

interface ChecklistItem {
  id: string
  item_key: string
  status: 'ok' | 'warning' | 'issue' | null
  comment?: string
  section: string
}

export default function SharedChecklistPage() {
  const params = useParams()
  const token = params?.token as string
  
  const [loading, setLoading] = useState(true)
  const [shareLink, setShareLink] = useState<ShareLink | null>(null)
  const [car, setCar] = useState<Car | null>(null)
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadSharedData() {
      if (!token) {
        setError('Invalid share token')
        setLoading(false)
        return
      }

      try {
        // Validate the share token
        const validatedShareLink = await validateShareToken(token)
        
        if (!validatedShareLink) {
          setError('Share link not found or expired')
          setLoading(false)
          return
        }

        setShareLink(validatedShareLink)

        // Get car data
        const { data: carData, error: carError } = await supabase
          .from('cars')
          .select('*')
          .eq('id', validatedShareLink.car_id)
          .single()

        if (carError || !carData) {
          setError('Car not found')
          setLoading(false)
          return
        }

        setCar(carData)

        // Get checklist items
        const { data: checklistData, error: checklistError } = await supabase
          .from('checklist_items')
          .select('*')
          .eq('car_id', validatedShareLink.car_id)
          .order('section')
          .order('item_key')

        if (checklistError) {
          console.error('Error loading checklist items:', checklistError)
        } else {
          setChecklistItems(checklistData || [])
        }

      } catch (err) {
        console.error('Error loading shared data:', err)
        setError('Failed to load shared checklist')
      } finally {
        setLoading(false)
      }
    }

    loadSharedData()
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Ladataan...</div>
      </div>
    )
  }

  if (error || !shareLink || !car) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Jaettu tarkastuslista ei löytynyt
          </h1>
          <p className="text-gray-600 mb-6">
            Linkki on vanhentunut tai poistettu.
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Ajokunto.fi - Jaettu tarkastuslista
              </h1>
              <p className="text-gray-600">
                {car.registration_number} 
                {(car.make || car.model || car.year) && (
                  <span> • {[car.make, car.model, car.year].filter(Boolean).join(' ')}</span>
                )}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                shareLink.permission_type === 'view' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {shareLink.permission_type === 'view' ? 'Vain luku' : 'Muokkausoikeus'}
              </span>
              <a 
                href="/auth/signup" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Rekisteröidy Ajokunto.fi:hin
              </a>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <SharedChecklistView
            car={car}
            shareLink={shareLink}
            checklistItems={checklistItems}
          />
        </div>
      </main>
    </div>
  )
}