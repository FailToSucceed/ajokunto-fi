'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { signOut, getCurrentUser } from '@/lib/auth'
import { User } from '@supabase/supabase-js'

interface Car {
  id: string
  registration_number: string
  make?: string
  model?: string
  year?: number
  role: 'owner' | 'contributor' | 'viewer'
}

export default function Dashboard() {
  const t = useTranslations()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddCar, setShowAddCar] = useState(false)

  useEffect(() => {
    async function loadUserAndCars() {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          router.push('/auth/signin')
          return
        }
        
        setUser(currentUser)
        
        // Load cars with user permissions
        const { data: carData, error } = await supabase
          .from('cars')
          .select(`
            *,
            car_permissions!inner(role)
          `)
          .eq('car_permissions.user_id', currentUser.id)
        
        if (error) {
          console.error('Error loading cars:', error)
        } else {
          const carsWithRoles = carData?.map(car => ({
            ...car,
            role: car.car_permissions[0].role
          })) || []
          setCars(carsWithRoles)
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserAndCars()
  }, [router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const handleAddCar = () => {
    setShowAddCar(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">{t('common.loading')}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                {t('common.title')}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Kirjaudu ulos
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {t('dashboard.title')}
            </h2>
            <button
              onClick={handleAddCar}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              {t('dashboard.addCar')}
            </button>
          </div>

          {cars.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">
                {t('dashboard.noCars')}
              </div>
              <button
                onClick={handleAddCar}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                {t('dashboard.addCar')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map((car) => (
                <div
                  key={car.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(`/car/${car.id}`)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {car.registration_number}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${{
                      owner: 'bg-green-100 text-green-800',
                      contributor: 'bg-blue-100 text-blue-800',
                      viewer: 'bg-gray-100 text-gray-800'
                    }[car.role]}`}>
                      {car.role}
                    </span>
                  </div>
                  
                  {(car.make || car.model || car.year) && (
                    <div className="text-gray-600">
                      {[car.make, car.model, car.year].filter(Boolean).join(' ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showAddCar && (
        <AddCarModal
          onClose={() => setShowAddCar(false)}
          onCarAdded={(newCar) => {
            setCars([...cars, { ...newCar, role: 'owner' }])
            setShowAddCar(false)
          }}
        />
      )}
    </div>
  )
}

interface AddCarModalProps {
  onClose: () => void
  onCarAdded: (car: Car) => void
}

function AddCarModal({ onClose, onCarAdded }: AddCarModalProps) {
  const t = useTranslations()
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const user = await getCurrentUser()
      if (!user) {
        setError('Not authenticated')
        return
      }

      const { data, error: insertError } = await supabase
        .from('cars')
        .insert({
          registration_number: registrationNumber.toUpperCase(),
          make: make || null,
          model: model || null,
          year: year ? parseInt(year) : null,
          created_by: user.id
        })
        .select()
        .single()

      if (insertError) {
        setError(insertError.message)
      } else if (data) {
        onCarAdded(data)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {t('dashboard.addCar')}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <span className="sr-only">{t('common.close')}</span>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700 mb-1">
              {t('car.registrationNumber')} *
            </label>
            <input
              type="text"
              id="registrationNumber"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ABC-123"
            />
          </div>

          <div>
            <label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-1">
              Merkki
            </label>
            <input
              type="text"
              id="make"
              value={make}
              onChange={(e) => setMake(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Toyota"
            />
          </div>

          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
              Malli
            </label>
            <input
              type="text"
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Corolla"
            />
          </div>

          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
              Vuosimalli
            </label>
            <input
              type="number"
              id="year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              min="1900"
              max={new Date().getFullYear() + 1}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="2020"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? t('common.loading') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}