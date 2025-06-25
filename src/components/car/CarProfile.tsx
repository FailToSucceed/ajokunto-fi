'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { User } from '@supabase/supabase-js'
import ChecklistSection from './ChecklistSection'
import PermissionsManager from './PermissionsManager'
import { generateChecklistPDF, downloadPDF } from '@/lib/pdf-export'
import { CHECKLIST_SECTIONS } from '@/data/checklist-items'

interface Car {
  id: string
  registration_number: string
  make?: string
  model?: string
  year?: number
  created_at: string
  userRole?: 'owner' | 'contributor' | 'viewer'
}

interface CarProfileProps {
  carId: string
}


export default function CarProfile({ carId }: CarProfileProps) {
  const t = useTranslations()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [car, setCar] = useState<Car | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('checklist')
  const [showPermissions, setShowPermissions] = useState(false)
  const [exportingPDF, setExportingPDF] = useState(false)

  useEffect(() => {
    async function loadCarData() {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          router.push('/auth/signin')
          return
        }
        
        setUser(currentUser)
        
        // Load car with user permissions
        const { data: carData, error } = await supabase
          .from('cars')
          .select(`
            *,
            car_permissions!inner(role)
          `)
          .eq('id', carId)
          .eq('car_permissions.user_id', currentUser.id)
          .single()
        
        if (error) {
          console.error('Error loading car:', error)
          router.push('/dashboard')
        } else if (carData) {
          setCar({
            ...carData,
            userRole: carData.car_permissions[0].role
          })
        }
      } catch (error) {
        console.error('Error:', error)
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    loadCarData()
  }, [carId, router])

  const handleExportPDF = async () => {
    if (!car) return
    
    setExportingPDF(true)
    try {
      const pdfBlob = await generateChecklistPDF(carId)
      const filename = `ajokunto-raportti-${car.registration_number}-${new Date().toISOString().split('T')[0]}.html`
      downloadPDF(pdfBlob, filename)
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('PDF:n viennissä tapahtui virhe')
    } finally {
      setExportingPDF(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">{t('common.loading')}</div>
      </div>
    )
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">Auto ei löytynyt</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-500 hover:text-gray-700"
              >
                ← Takaisin
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                {car.registration_number}
              </h1>
              {(car.make || car.model || car.year) && (
                <span className="text-gray-500">
                  {[car.make, car.model, car.year].filter(Boolean).join(' ')}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {car.userRole === 'owner' && (
                <button
                  onClick={() => setShowPermissions(true)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Käyttöoikeudet
                </button>
              )}
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${{
                owner: 'bg-green-100 text-green-800',
                contributor: 'bg-blue-100 text-blue-800',
                viewer: 'bg-gray-100 text-gray-800'
              }[car.userRole || 'viewer']}`}>
                {car.userRole}
              </span>
              <span className="text-sm text-gray-700">
                {user?.email}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'checklist', label: t('car.inspectionChecklist') },
                { key: 'maintenance', label: t('car.maintenanceRecords') },
                { key: 'suggested', label: t('car.suggestedMaintenance') },
                { key: 'approvals', label: t('car.approvals') }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'checklist' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {t('checklist.title')}
                </h2>
                {car.userRole !== 'viewer' && (
                  <button 
                    onClick={handleExportPDF}
                    disabled={exportingPDF}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    {exportingPDF ? 'Viedään...' : 'Vie PDF'}
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                {CHECKLIST_SECTIONS.map((section) => (
                  <ChecklistSection
                    key={section.key}
                    carId={carId}
                    section={section.key}
                    title={t(`checklist.${section.key}`)}
                    icon={section.icon}
                    canEdit={car.userRole !== 'viewer'}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t('car.maintenanceRecords')}
              </h2>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-500">Huoltohistoria tulossa pian...</p>
              </div>
            </div>
          )}

          {activeTab === 'suggested' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t('car.suggestedMaintenance')}
              </h2>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-500">Ehdotettu huolto tulossa pian...</p>
              </div>
            </div>
          )}

          {activeTab === 'approvals' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t('car.approvals')}
              </h2>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-500">Hyväksynnät tulossa pian...</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {showPermissions && (
        <PermissionsManager
          carId={carId}
          currentUserRole={car.userRole || 'viewer'}
          onClose={() => setShowPermissions(false)}
        />
      )}
    </div>
  )
}