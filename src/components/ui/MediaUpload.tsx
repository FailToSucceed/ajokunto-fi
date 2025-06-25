'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { uploadCarMedia, getPublicUrl } from '@/lib/storage'
import { supabase } from '@/lib/supabase'

interface MediaUploadProps {
  carId: string
  checklistItemId?: string
  maintenanceRecordId?: string
  onUploadComplete?: (mediaData: any) => void
  acceptedTypes?: string
  maxSize?: number // in bytes
}

export default function MediaUpload({
  carId,
  checklistItemId,
  maintenanceRecordId,
  onUploadComplete,
  acceptedTypes = 'image/*,video/*,.pdf,audio/*',
  maxSize = 10 * 1024 * 1024 // 10MB
}: MediaUploadProps) {
  const t = useTranslations()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError('')

    // Validate file size
    if (file.size > maxSize) {
      setError(`Tiedosto on liian suuri. Maksimikoko on ${Math.round(maxSize / 1024 / 1024)}MB.`)
      return
    }

    // Validate file type
    const allowedTypes = acceptedTypes.split(',').map(type => type.trim())
    const isValidType = allowedTypes.some(type => {
      if (type.includes('*')) {
        const baseType = type.split('/')[0]
        return file.type.startsWith(baseType)
      }
      return file.type === type || file.name.toLowerCase().endsWith(type.replace('.', ''))
    })

    if (!isValidType) {
      setError('Tiedostotyyppi ei ole tuettu.')
      return
    }

    setUploading(true)

    try {
      const { data, error: uploadError } = await uploadCarMedia(
        carId,
        file,
        checklistItemId,
        maintenanceRecordId
      )

      if (uploadError) {
        setError(uploadError.message)
      } else if (data) {
        onUploadComplete?.(data)
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    } catch (err) {
      setError('Tiedoston lataus epäonnistui')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes}
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
          id={`file-upload-${carId}-${checklistItemId || maintenanceRecordId || 'general'}`}
        />
        <label
          htmlFor={`file-upload-${carId}-${checklistItemId || maintenanceRecordId || 'general'}`}
          className={`cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors ${
            uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {uploading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Ladataan...
            </>
          ) : (
            <>
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Lisää media
            </>
          )}
        </label>
        <span className="text-xs text-gray-500">
          Max {Math.round(maxSize / 1024 / 1024)}MB
        </span>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

interface MediaGalleryProps {
  carId: string
  checklistItemId?: string
  maintenanceRecordId?: string
  canDelete?: boolean
}

export function MediaGallery({
  carId,
  checklistItemId,
  maintenanceRecordId,
  canDelete = false
}: MediaGalleryProps) {
  const [media, setMedia] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Load media items on mount
  useEffect(() => {
    loadMedia()
  }, [carId, checklistItemId, maintenanceRecordId])

  const loadMedia = async () => {
    try {
      let query = supabase
        .from('media')
        .select('*')
        .eq('car_id', carId)

      if (checklistItemId) {
        query = query.eq('checklist_item_id', checklistItemId)
      }

      if (maintenanceRecordId) {
        query = query.eq('maintenance_record_id', maintenanceRecordId)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading media:', error)
      } else {
        setMedia(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteMedia = async (mediaId: string, filePath: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('car-media')
        .remove([filePath])

      if (storageError) {
        console.error('Error deleting from storage:', storageError)
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('media')
        .delete()
        .eq('id', mediaId)

      if (dbError) {
        console.error('Error deleting from database:', dbError)
      } else {
        setMedia(media.filter(item => item.id !== mediaId))
      }
    } catch (error) {
      console.error('Error deleting media:', error)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (media.length === 0) {
    return null
  }

  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium text-gray-900 mb-2">
        Liitetiedostoja ({media.length})
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {media.map((item) => (
          <div key={item.id} className="relative group">
            {item.file_type.startsWith('image/') ? (
              <img
                src={getPublicUrl('car-media', item.file_path)}
                alt="Media"
                className="w-full h-24 object-cover rounded border"
              />
            ) : (
              <div className="w-full h-24 bg-gray-100 border rounded flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl mb-1">
                    {item.file_type.includes('pdf') ? '📄' : 
                     item.file_type.includes('video') ? '🎥' : 
                     item.file_type.includes('audio') ? '🎵' : '📎'}
                  </div>
                  <div className="text-xs text-gray-600 truncate">
                    {item.file_path.split('/').pop()}
                  </div>
                </div>
              </div>
            )}

            {canDelete && (
              <button
                onClick={() => deleteMedia(item.id, item.file_path)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}