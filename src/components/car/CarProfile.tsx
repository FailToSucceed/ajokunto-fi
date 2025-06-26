'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { User } from '@supabase/supabase-js'
import ChecklistSection from './ChecklistSection'
import PermissionsManager from './PermissionsManager'
import SharingModal from './SharingModal'
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
  const [showSharing, setShowSharing] = useState(false)
  const [exportingPDF, setExportingPDF] = useState(false)
  const [saving, setSaving] = useState(false)

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

  const handleSave = async () => {
    setSaving(true)
    try {
      // This is more of a visual feedback since auto-save is already happening
      // In a real scenario, you might batch save pending changes
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate save
      alert('Tarkastuslista tallennettu onnistuneesti!')
    } catch (error) {
      console.error('Error saving checklist:', error)
      alert('Tallentamisessa tapahtui virhe')
    } finally {
      setSaving(false)
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
          {/* Car Basic Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Auton perustiedot</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rekisterinumero</label>
                  <div className="mt-1 text-lg font-mono font-semibold text-gray-900">
                    {car.registration_number}
                  </div>
                </div>
                {car.make && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Merkki</label>
                    <div className="mt-1 text-gray-900">{car.make}</div>
                  </div>
                )}
                {car.model && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Malli</label>
                    <div className="mt-1 text-gray-900">{car.model}</div>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                {car.year && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Vuosimalli</label>
                    <div className="mt-1 text-gray-900">{car.year}</div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Luotu</label>
                  <div className="mt-1 text-gray-900">
                    {new Date(car.created_at).toLocaleDateString('fi-FI')}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Käyttöoikeus</label>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                    car.userRole === 'owner' ? 'bg-green-100 text-green-800' :
                    car.userRole === 'contributor' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {car.userRole === 'owner' ? 'Omistaja' :
                     car.userRole === 'contributor' ? 'Muokkaaja' : 'Katselija'}
                  </span>
                </div>
              </div>
            </div>
          </div>

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
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center space-x-1 px-2 sm:px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors min-w-0 flex-shrink-0"
                    >
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="hidden sm:inline">{saving ? 'Tallennetaan...' : 'Tallenna'}</span>
                      <span className="sm:hidden">{saving ? 'Tallenna...' : 'Tallenna'}</span>
                    </button>
                    
                    <button
                      onClick={() => setShowSharing(true)}
                      className="flex items-center space-x-1 px-2 sm:px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors min-w-0 flex-shrink-0"
                    >
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                      <span>Jaa</span>
                    </button>
                    
                    {car.userRole === 'owner' && (
                      <button
                        onClick={() => setShowPermissions(true)}
                        className="flex items-center space-x-1 px-2 sm:px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors min-w-0 flex-shrink-0"
                      >
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        <span className="hidden sm:inline">Käyttöoikeudet</span>
                        <span className="sm:hidden">Oikeudet</span>
                      </button>
                    )}
                    
                    <button 
                      onClick={handleExportPDF}
                      disabled={exportingPDF}
                      className="flex items-center space-x-1 px-2 sm:px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors min-w-0 flex-shrink-0"
                    >
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="hidden sm:inline">{exportingPDF ? 'Viedään...' : 'Vie PDF'}</span>
                      <span className="sm:hidden">{exportingPDF ? 'PDF...' : 'PDF'}</span>
                    </button>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                {CHECKLIST_SECTIONS.map((section) => (
                  <ChecklistSection
                    key={section.key}
                    carId={carId}
                    section={section.key}
                    title={section.title}
                    icon={section.icon}
                    canEdit={car.userRole !== 'viewer'}
                    onSave={handleSave}
                    onShare={() => setShowSharing(true)}
                    onPermissions={() => setShowPermissions(true)}
                    onExportPDF={handleExportPDF}
                    saving={saving}
                    exportingPDF={exportingPDF}
                    userRole={car.userRole}
                  />
                ))}
              </div>
              
              {/* Bottom action buttons */}
              {car.userRole !== 'viewer' && (
                <div className="flex justify-center">
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 w-full max-w-4xl overflow-hidden">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center space-x-1 px-2 sm:px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors min-w-0 flex-shrink-0"
                    >
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="hidden sm:inline">{saving ? 'Tallennetaan...' : 'Tallenna'}</span>
                      <span className="sm:hidden">{saving ? 'Tallenna...' : 'Tallenna'}</span>
                    </button>
                    
                    <button
                      onClick={() => setShowSharing(true)}
                      className="flex items-center space-x-1 px-2 sm:px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors min-w-0 flex-shrink-0"
                    >
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                      <span>Jaa</span>
                    </button>
                    
                    {car.userRole === 'owner' && (
                      <button
                        onClick={() => setShowPermissions(true)}
                        className="flex items-center space-x-1 px-2 sm:px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors min-w-0 flex-shrink-0"
                      >
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        <span className="hidden sm:inline">Käyttöoikeudet</span>
                        <span className="sm:hidden">Oikeudet</span>
                      </button>
                    )}
                    
                    <button 
                      onClick={handleExportPDF}
                      disabled={exportingPDF}
                      className="flex items-center space-x-1 px-2 sm:px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors min-w-0 flex-shrink-0"
                    >
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="hidden sm:inline">{exportingPDF ? 'Viedään...' : 'Vie PDF'}</span>
                      <span className="sm:hidden">{exportingPDF ? 'PDF...' : 'PDF'}</span>
                    </button>
                  </div>
                </div>
              )}
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

      {showSharing && (
        <SharingModal
          carId={carId}
          carRegistration={car.registration_number}
          isOpen={showSharing}
          onClose={() => setShowSharing(false)}
        />
      )}
    </div>
  )
}