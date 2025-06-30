'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
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

export default function CarSharePage() {
  const params = useParams()
  const router = useRouter()
  const carId = params?.id as string
  
  const [loading, setLoading] = useState(true)
  const [car, setCar] = useState<Car | null>(null)
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadSharedData() {
      if (!carId) {
        setError('Invalid car ID')
        setLoading(false)
        return
      }

      try {
        // Get car data (no authentication required for public sharing)
        const { data: carData, error: carError } = await supabase
          .from('cars')
          .select('id, registration_number, make, model, year')
          .eq('id', carId)
          .single()

        if (carError || !carData) {
          setError('Car not found')
          setLoading(false)
          return
        }

        setCar(carData)

        // Get checklist items (no authentication required for public sharing)
        const { data: checklistData, error: checklistError } = await supabase
          .from('checklist_items')
          .select('id, item_key, status, comment, section')
          .eq('car_id', carId)
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
  }, [carId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Ladataan...</div>
      </div>
    )
  }

  if (error || !car) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Jaettu tarkastuslista ei löytynyt
          </h1>
          <p className="text-gray-600 mb-6">
            Auto ei löytynyt tai linkki on virheellinen.
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

  // Create a mock share link for the component
  const mockShareLink = {
    id: 'mock-share',
    car_id: carId,
    share_token: 'direct-share',
    permission_type: 'view' as const,
    expires_at: null,
    created_by: '',
    created_at: new Date().toISOString(),
    accessed_count: 0
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
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                Vain luku
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
            shareLink={mockShareLink}
            checklistItems={checklistItems}
          />
        </div>
      </main>
    </div>
  )
}