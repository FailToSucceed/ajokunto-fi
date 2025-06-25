'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import MediaUpload, { MediaGallery } from '@/components/ui/MediaUpload'
import { getChecklistSection, ChecklistItemData } from '@/data/checklist-items'

interface ChecklistItem {
  id: string
  item_key: string
  status: 'ok' | 'warning' | 'issue' | null
  comment?: string
  created_by: string
  updated_at: string
}

interface ChecklistSectionProps {
  carId: string
  section: string
  title: string
  icon: string
  canEdit: boolean
}


export default function ChecklistSection({
  carId,
  section,
  title,
  icon,
  canEdit
}: ChecklistSectionProps) {
  const t = useTranslations()
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const [editingItem, setEditingItem] = useState<string | null>(null)

  useEffect(() => {
    loadChecklistItems()
  }, [carId, section])

  const loadChecklistItems = async () => {
    try {
      const { data, error } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('car_id', carId)
        .eq('section', section)
        .order('item_key')

      if (error) {
        console.error('Error loading checklist items:', error)
      } else {
        setItems(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateChecklistItem = async (
    itemKey: string, 
    status: 'ok' | 'warning' | 'issue' | null, 
    comment?: string
  ) => {
    try {
      const user = await getCurrentUser()
      if (!user) return

      const existingItem = items.find(item => item.item_key === itemKey)
      
      if (existingItem) {
        const { error } = await supabase
          .from('checklist_items')
          .update({
            status,
            comment: comment || null,
            updated_at: new Date().toISOString(),
            created_by: user.id
          })
          .eq('id', existingItem.id)

        if (error) {
          console.error('Error updating checklist item:', error)
          return
        }
      } else {
        const { error } = await supabase
          .from('checklist_items')
          .insert({
            car_id: carId,
            section,
            item_key: itemKey,
            status,
            comment: comment || null,
            created_by: user.id
          })

        if (error) {
          console.error('Error creating checklist item:', error)
          return
        }
      }

      await loadChecklistItems()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const getItemData = (itemKey: string) => {
    return items.find(item => item.item_key === itemKey)
  }

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'ok': return 'bg-green-100 text-green-800 border-green-200'
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'issue': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const getSectionSummary = () => {
    const sectionData = getChecklistSection(section)
    const sectionItems = sectionData?.items || []
    const completedItems = sectionItems.filter(item => {
      const itemData = getItemData(item.key)
      return itemData && itemData.status
    })
    
    const statusCounts = {
      ok: 0,
      warning: 0,
      issue: 0
    }
    
    sectionItems.forEach(item => {
      const itemData = getItemData(item.key)
      if (itemData?.status) {
        statusCounts[itemData.status]++
      }
    })

    return {
      total: sectionItems.length,
      completed: completedItems.length,
      ...statusCounts
    }
  }

  const summary = getSectionSummary()

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div 
        className="p-6 cursor-pointer hover:bg-gray-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{icon}</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {title}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                <span>{summary.completed}/{summary.total} tarkastettu</span>
                {summary.ok > 0 && (
                  <span className="text-green-600">✓ {summary.ok} OK</span>
                )}
                {summary.warning > 0 && (
                  <span className="text-yellow-600">⚠ {summary.warning} Huomio</span>
                )}
                {summary.issue > 0 && (
                  <span className="text-red-600">✗ {summary.issue} Ongelma</span>
                )}
              </div>
            </div>
          </div>
          <div className="text-gray-400">
            {expanded ? '−' : '+'}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-200 p-6">
          <div className="space-y-4">
            {(getChecklistSection(section)?.items || []).map((item: ChecklistItemData) => {
              const itemData = getItemData(item.key)
              const isEditing = editingItem === item.key

              return (
                <div key={item.key} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-2">
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-sm text-gray-600 mb-3">
                          {item.description}
                        </p>
                      )}
                      
                      {canEdit && !isEditing ? (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            {['ok', 'warning', 'issue'].map((status) => (
                              <button
                                key={status}
                                onClick={() => updateChecklistItem(item.key, status as any, itemData?.comment)}
                                className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                                  itemData?.status === status
                                    ? getStatusColor(status)
                                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                {t(`checklist.status.${status}`)}
                              </button>
                            ))}
                            {itemData?.status && (
                              <button
                                onClick={() => updateChecklistItem(item.key, null)}
                                className="px-3 py-1 rounded-full text-sm font-medium bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                              >
                                Tyhjennä
                              </button>
                            )}
                          </div>
                          
                          <button
                            onClick={() => setEditingItem(item.key)}
                            className="flex items-center space-x-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                            <span>Kommentoi tai lataa tiedosto</span>
                          </button>
                        </div>
                      ) : itemData?.status ? (
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(itemData.status)}`}>
                          {t(`checklist.status.${itemData.status}`)}
                        </span>
                      ) : (
                        <span className="text-gray-500 text-sm">Ei tarkastettu</span>
                      )}

                      {itemData?.comment && (
                        <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          {itemData.comment}
                        </p>
                      )}

                      <MediaGallery
                        carId={carId}
                        checklistItemId={itemData?.id}
                        canDelete={canEdit}
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <CommentForm
                        carId={carId}
                        itemKey={item.key}
                        currentComment={itemData?.comment || ''}
                        currentStatus={itemData?.status || null}
                        onSave={(comment, status) => {
                          updateChecklistItem(item.key, status, comment)
                          setEditingItem(null)
                        }}
                        onCancel={() => setEditingItem(null)}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

interface CommentFormProps {
  carId: string
  itemKey: string
  currentComment: string
  currentStatus: 'ok' | 'warning' | 'issue' | null
  onSave: (comment: string, status: 'ok' | 'warning' | 'issue' | null) => void
  onCancel: () => void
}

function CommentForm({ carId, currentComment, currentStatus, onSave, onCancel }: CommentFormProps) {
  const t = useTranslations()
  const [comment, setComment] = useState(currentComment)
  const [status, setStatus] = useState<'ok' | 'warning' | 'issue' | null>(currentStatus)

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tila
        </label>
        <div className="flex space-x-2">
          {[
            { value: null, label: 'Ei asetettu' },
            { value: 'ok', label: t('checklist.status.ok') },
            { value: 'warning', label: t('checklist.status.warning') },
            { value: 'issue', label: t('checklist.status.issue') }
          ].map((option) => (
            <button
              key={option.value || 'none'}
              onClick={() => setStatus(option.value as any)}
              className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                status === option.value
                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Kommentti
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Lisää kommentti..."
        />
      </div>

      <div className="flex justify-end space-x-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          {t('common.cancel')}
        </button>
        <button
          onClick={() => onSave(comment, status)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
        >
          {t('common.save')}
        </button>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Lisää media
        </label>
        <MediaUpload
          carId={carId}
          onUploadComplete={() => {
            // Refresh media gallery
          }}
        />
      </div>
    </div>
  )
}