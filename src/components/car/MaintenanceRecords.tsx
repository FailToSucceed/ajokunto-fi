'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import MediaUpload from '@/components/ui/MediaUpload'

interface MaintenanceRecord {
  id: string
  car_id: string
  type: string
  date: string
  mileage?: number
  notes?: string
  cost?: number
  created_at: string
  created_by: string
}

interface MaintenanceRecordsProps {
  carId: string
  canEdit: boolean
}

export default function MaintenanceRecords({ carId, canEdit }: MaintenanceRecordsProps) {
  const [records, setRecords] = useState<MaintenanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showPhotoUpload, setShowPhotoUpload] = useState(false)
  const [formData, setFormData] = useState({
    type: '',
    date: '',
    mileage: '',
    notes: '',
    cost: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadMaintenanceRecords()
  }, [carId])

  const loadMaintenanceRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('maintenance_records')
        .select('*')
        .eq('car_id', carId)
        .order('date', { ascending: false })

      if (error) {
        console.error('Error loading maintenance records:', error)
      } else {
        setRecords(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.type.trim() || !formData.date) return

    setSaving(true)
    try {
      const user = await getCurrentUser()
      if (!user) return

      const { error } = await supabase
        .from('maintenance_records')
        .insert({
          car_id: carId,
          type: formData.type.trim(),
          date: formData.date,
          mileage: formData.mileage ? parseInt(formData.mileage) : null,
          notes: formData.notes.trim() || null,
          cost: formData.cost ? parseFloat(formData.cost) : null,
          created_by: user.id
        })

      if (error) {
        console.error('Error saving maintenance record:', error)
        alert('Huoltotiedon tallentaminen epäonnistui')
      } else {
        // Reset form
        setFormData({
          type: '',
          date: '',
          mileage: '',
          notes: '',
          cost: ''
        })
        setShowAddForm(false)
        loadMaintenanceRecords()
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Huoltotiedon tallentaminen epäonnistui')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const commonMaintenanceTypes = [
    'Öljynvaihto',
    'Määräaikaishuolto',
    'Katsastus',
    'Rengasvaihto',
    'Jarrujen huolto',
    'Ilmansuodatin',
    'Polttoainesuodatin',
    'Sytytystulpat',
    'Akku',
    'Muu huolto'
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Huoltohistoria</h2>
        {canEdit && (
          <div className="flex space-x-3">
            <button
              onClick={() => setShowPhotoUpload(true)}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              📷 Lataa huoltokirjan kuvia
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              + Lisää huoltotieto
            </button>
          </div>
        )}
      </div>

      {/* Photo Upload Modal */}
      {showPhotoUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Lataa huoltokirjan kuvia</h3>
                <button
                  onClick={() => setShowPhotoUpload(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <p className="text-gray-600 mb-4">
                Lataa kuvia huoltokirjasta tai huoltotositteista. Tämä auttaa säilyttämään huoltohistorian dokumentoituna.
              </p>
              
              <MediaUpload
                carId={carId}
                onUploadComplete={() => {
                  setShowPhotoUpload(false)
                  // You could reload maintenance photos here if needed
                }}
                acceptedTypes="image/*"
              />
            </div>
          </div>
        </div>
      )}

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Lisää huoltotieto</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={saving}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    Huollon tyyppi *
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={saving}
                  >
                    <option value="">Valitse huollon tyyppi</option>
                    {commonMaintenanceTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Päivämäärä *
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={saving}
                  />
                </div>

                <div>
                  <label htmlFor="mileage" className="block text-sm font-medium text-gray-700 mb-1">
                    Kilometrit
                  </label>
                  <input
                    type="number"
                    id="mileage"
                    name="mileage"
                    value={formData.mileage}
                    onChange={handleInputChange}
                    placeholder="120000"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-1">
                    Hinta (€)
                  </label>
                  <input
                    type="number"
                    id="cost"
                    name="cost"
                    value={formData.cost}
                    onChange={handleInputChange}
                    placeholder="150.00"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Lisätiedot
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Huollon tarkemmat tiedot, vaihdetut osat jne."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={saving}
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-lg border border-gray-200 transition-colors"
                    disabled={saving}
                  >
                    Peruuta
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                    disabled={saving}
                  >
                    {saving ? 'Tallennetaan...' : 'Tallenna'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Records List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {records.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h5.586a1 1 0 00.707-.293l5.414-5.414a1 1 0 00.293-.707V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ei huoltotietoja</h3>
            <p className="text-gray-500 mb-4">
              {canEdit 
                ? 'Aloita lisäämällä ensimmäinen huoltotieto tai lataamalla kuvia huoltokirjasta.' 
                : 'Huoltotietoja ei ole vielä lisätty.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {records.map((record) => (
              <div key={record.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{record.type}</h3>
                      <span className="text-sm text-gray-500">
                        {new Date(record.date).toLocaleDateString('fi-FI')}
                      </span>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4 mb-3">
                      {record.mileage && (
                        <div>
                          <span className="text-sm text-gray-500">Kilometrit:</span>
                          <div className="font-medium">{record.mileage.toLocaleString('fi-FI')} km</div>
                        </div>
                      )}
                      {record.cost && (
                        <div>
                          <span className="text-sm text-gray-500">Hinta:</span>
                          <div className="font-medium">{record.cost.toFixed(2)} €</div>
                        </div>
                      )}
                      <div>
                        <span className="text-sm text-gray-500">Lisätty:</span>
                        <div className="text-sm">{new Date(record.created_at).toLocaleDateString('fi-FI')}</div>
                      </div>
                    </div>
                    
                    {record.notes && (
                      <div className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
                        {record.notes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}