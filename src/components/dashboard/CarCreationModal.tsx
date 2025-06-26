'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface CarCreationModalProps {
  isOpen: boolean
  onClose: () => void
  onCarCreated: (carId: string) => void
  userId: string
}

export default function CarCreationModal({ isOpen, onClose, onCarCreated, userId }: CarCreationModalProps) {
  const [formData, setFormData] = useState({
    registration_number: '',
    make: '',
    model: '',
    year: '',
    role: 'owner'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'registration_number' ? value.toUpperCase() : value
    }))
  }

  const roleOptions = [
    { value: 'owner', label: 'Omistaja' },
    { value: 'holder', label: 'Haltija/käyttäjä' },
    { value: 'buyer', label: '(Mahdollinen) Ostaja' },
    { value: 'inspector', label: 'Kuntotarkastaja' },
    { value: 'mechanic', label: 'Korjaaja' },
    { value: 'other', label: 'Muu' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate required fields
      if (!formData.registration_number.trim()) {
        setError('Rekisterinumero on pakollinen')
        return
      }

      // Create the car
      const { data: carData, error: carError } = await supabase
        .from('cars')
        .insert({
          registration_number: formData.registration_number.trim(),
          make: formData.make.trim() || null,
          model: formData.model.trim() || null,
          year: formData.year ? parseInt(formData.year) : null
        })
        .select()
        .single()

      if (carError) {
        if (carError.code === '23505') {
          setError('Auto tällä rekisterinumerolla on jo olemassa')
        } else {
          setError('Auton luominen epäonnistui')
        }
        return
      }

      // Add user permission with selected role
      const { error: permissionError } = await supabase
        .from('car_permissions')
        .insert({
          car_id: carData.id,
          user_id: userId,
          role: formData.role
        })

      if (permissionError) {
        console.error('Error creating car permission:', permissionError)
        setError('Auton luominen epäonnistui')
        return
      }

      // Reset form and close modal
      setFormData({
        registration_number: '',
        make: '',
        model: '',
        year: '',
        role: 'owner'
      })
      onCarCreated(carData.id)
      onClose()

    } catch (error) {
      console.error('Error creating car:', error)
      setError('Auton luominen epäonnistui')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Lisää uusi auto</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="registration_number" className="block text-sm font-medium text-gray-700 mb-1">
                Rekisterinumero *
              </label>
              <input
                type="text"
                id="registration_number"
                name="registration_number"
                value={formData.registration_number}
                onChange={handleInputChange}
                placeholder="ABC-123"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-1">
                Merkki
              </label>
              <input
                type="text"
                id="make"
                name="make"
                value={formData.make}
                onChange={handleInputChange}
                placeholder="Toyota"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                Malli
              </label>
              <input
                type="text"
                id="model"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                placeholder="Corolla"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                Vuosimalli
              </label>
              <input
                type="number"
                id="year"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                placeholder="2020"
                min="1900"
                max="2030"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Rooli autoon *
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-lg border border-gray-200 transition-colors"
                disabled={loading}
              >
                Peruuta
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Luodaan...' : 'Luo auto'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}