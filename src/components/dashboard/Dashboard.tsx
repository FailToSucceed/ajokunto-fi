'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { signOut, getCurrentUser } from '@/lib/auth'
import { User } from '@supabase/supabase-js'
import CarCreationModal from './CarCreationModal'

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
  const [searchQuery, setSearchQuery] = useState('')
  const [showCarSelection, setShowCarSelection] = useState(false)
  const [selectionMode, setSelectionMode] = useState<'selling' | 'buying'>('selling')

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

  const handleAddCar = () => {
    setShowAddCar(true)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`)
  }

  const handleCarTrading = (mode: 'selling' | 'buying') => {
    setSelectionMode(mode)
    setShowCarSelection(true)
  }

  const handleCarSelect = (carId: string) => {
    router.push(`/car/${carId}`)
  }

  const handleCreateNewCar = () => {
    setShowAddCar(true)
    setShowCarSelection(false)
  }

  const handleCarCreated = async (carId: string) => {
    // Reload cars to include the new one
    if (user) {
      const { data: carData } = await supabase
        .from('cars')
        .select(`
          *,
          car_permissions!inner(role)
        `)
        .eq('car_permissions.user_id', user.id)
      
      if (carData) {
        const carsWithRoles = carData.map(car => ({
          ...car,
          role: car.car_permissions[0].role
        }))
        setCars(carsWithRoles)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Ladataan...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Car Creation Modal */}
      <CarCreationModal
        isOpen={showAddCar}
        onClose={() => setShowAddCar(false)}
        onCarCreated={handleCarCreated}
        userId={user?.id || ''}
      />

      {/* Car Selection Modal */}
      {showCarSelection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectionMode === 'selling' ? 'Valitse myytävä auto' : 'Valitse tarkastettava auto'}
                </h2>
                <button
                  onClick={() => setShowCarSelection(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-gray-600 mb-6">
                {selectionMode === 'selling' 
                  ? 'Valitse auto jonka haluat myydä ja täytä sen tarkastuslista ostajaa varten.'
                  : 'Valitse auto jota harkitset ostamaan ja käy tarkastuslista läpi myyjän kanssa.'
                }
              </p>

              {/* Existing Cars */}
              {cars.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Olemassa olevat autot</h3>
                  <div className="space-y-3">
                    {cars.map((car) => (
                      <button
                        key={car.id}
                        onClick={() => handleCarSelect(car.id)}
                        className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-4 text-left transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium text-gray-900">{car.registration_number}</h4>
                            <p className="text-sm text-gray-600">
                              {car.make} {car.model} {car.year && `(${car.year})`}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              car.role === 'owner' ? 'bg-green-100 text-green-800' :
                              car.role === 'contributor' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {car.role === 'owner' ? 'Omistaja' : 
                               car.role === 'contributor' ? 'Toimittaja' : 'Lukija'}
                            </span>
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Create New Car */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tai luo uusi auto</h3>
                <button
                  onClick={handleCreateNewCar}
                  className="w-full flex items-center justify-center space-x-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-4 px-6 rounded-lg border border-blue-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Lisää uusi auto tarkastuslistoineen</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 max-w-7xl py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kojelauta</h1>
            <p className="text-gray-600 mt-1">Hallitse autojesi tietoja ja käytä Ajokunto.fi -palveluja</p>
          </div>
          
          <button
            onClick={handleSignOut}
            className="flex items-center space-x-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 px-4 rounded-lg border border-red-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Kirjaudu ulos</span>
          </button>
        </div>

        {/* Dashboard Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Autokaupat Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Autokaupat</h2>
            </div>
            
            <p className="text-gray-600 mb-6">
              Helpota auton osto- ja myyntiprosessia yhdessä tehdyllä tarkastuksella ja dokumentoinnilla. 
              Lisää läpinäkyvyyttä ja vähemmän epävarmuutta - paremmat kaupat kaikille.
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={() => handleCarTrading('selling')}
                className="w-full flex items-center space-x-3 bg-green-50 hover:bg-green-100 text-green-700 font-medium py-3 px-4 rounded-lg border border-green-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Myyn autoa - Täytä tarkastuslista</span>
              </button>
              
              <button 
                onClick={() => handleCarTrading('buying')}
                className="w-full flex items-center space-x-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-3 px-4 rounded-lg border border-blue-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Ostan autoa - Käy tarkastuslista läpi</span>
              </button>
            </div>
          </div>

          {/* Omat autot Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Omat autot</h2>
              </div>
              
              <button
                onClick={handleAddCar}
                className="flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Lisää auto</span>
              </button>
            </div>

            {cars.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Et ole vielä lisännyt yhtään autoa</h3>
                <p className="text-gray-600 text-sm">Aloita lisäämällä ensimmäinen autosi</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {cars.map((car) => (
                  <div
                    key={car.id}
                    className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
                    onClick={() => router.push(`/car/${car.id}`)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{car.registration_number}</h3>
                          <p className="text-sm text-gray-600">
                            {car.make} {car.model} {car.year && `(${car.year})`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          car.role === 'owner' ? 'bg-green-100 text-green-800' :
                          car.role === 'contributor' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {car.role === 'owner' ? 'Omistaja' : 
                           car.role === 'contributor' ? 'Toimittaja' : 'Lukija'}
                        </span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Hae rekisterinumerolla Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Hae rekisterinumerolla</h2>
            </div>
            
            <p className="text-gray-600 mb-4">
              Etsi autoa rekisterinumerolla ja katso sen julkisia tietoja ja tarkastushistoriaa.
            </p>
            
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="ABC-123"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Hae
              </button>
            </div>
          </div>

          {/* Oma profiili Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Oma profiili</h2>
            </div>
            
            <p className="text-gray-600 mb-6">
              Hallitse käyttäjätietojasi, vaihda salasana ja päivitä yhteystiedot.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => router.push('/profile')}
                className="w-full flex items-center space-x-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-lg border border-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Muokkaa profiilia</span>
              </button>
              
              {user && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-sm text-gray-600">Kirjautunut käyttäjä:</p>
                  <p className="font-medium text-gray-900">{user.email}</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
    </>
  )
}