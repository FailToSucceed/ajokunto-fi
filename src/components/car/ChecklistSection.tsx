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
  onSave?: () => void
  onShare?: () => void
  onPermissions?: () => void
  onExportPDF?: () => void
  saving?: boolean
  exportingPDF?: boolean
  userRole?: 'owner' | 'contributor' | 'viewer'
}


export default function ChecklistSection({
  carId,
  section,
  title,
  icon,
  canEdit,
  onSave,
  onShare,
  onPermissions,
  onExportPDF,
  saving = false,
  exportingPDF = false,
  userRole = 'viewer'
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
          
          {/* Section action buttons */}
          {canEdit && expanded && (onSave || onShare || onPermissions || onExportPDF) && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-center">
                <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-3">
                  {onSave && (
                    <button
                      onClick={onSave}
                      disabled={saving}
                      className="flex items-center space-x-1 px-2 py-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-xs font-medium rounded transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span>{saving ? 'Tallennetaan...' : 'Tallenna'}</span>
                    </button>
                  )}
                  
                  {onShare && (
                    <button
                      onClick={onShare}
                      className="flex items-center space-x-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                      <span>Jaa</span>
                    </button>
                  )}
                  
                  {onPermissions && userRole === 'owner' && (
                    <button
                      onClick={onPermissions}
                      className="flex items-center space-x-1 px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs font-medium rounded transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                      <span>Käyttöoikeudet</span>
                    </button>
                  )}
                  
                  {onExportPDF && (
                    <button
                      onClick={onExportPDF}
                      disabled={exportingPDF}
                      className="flex items-center space-x-1 px-2 py-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-xs font-medium rounded transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>{exportingPDF ? 'Viedään...' : 'Vie PDF'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
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