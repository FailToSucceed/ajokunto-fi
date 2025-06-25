'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CHECKLIST_SECTIONS, getChecklistSection } from '@/data/checklist-items'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { ShareLink } from '@/lib/sharing'
import { MediaGallery } from '@/components/ui/MediaUpload'
import type { User } from '@supabase/supabase-js'

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

interface SharedChecklistViewProps {
  car: Car
  shareLink: ShareLink
  checklistItems: ChecklistItem[]
}

export default function SharedChecklistView({ car, shareLink, checklistItems }: SharedChecklistViewProps) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [items, setItems] = useState<ChecklistItem[]>(checklistItems)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function checkUser() {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        
        // If edit permission required but no user, redirect to sign in
        if (shareLink.permission_type === 'edit' && !currentUser) {
          router.push(`/auth/signin?redirect=/shared/${shareLink.share_token}`)
        }
      } catch (error) {
        console.error('Error checking user:', error)
        setUser(null)
      }
    }
    
    checkUser()
  }, [shareLink, router])

  const canEdit = shareLink.permission_type === 'edit' && user

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const getItemData = (itemKey: string, section: string) => {
    return items.find(item => item.item_key === itemKey && item.section === section)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'issue':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const updateChecklistItem = async (
    itemKey: string,
    section: string,
    status: 'ok' | 'warning' | 'issue' | null,
    comment?: string
  ) => {
    if (!canEdit || !user) return

    try {
      const existingItem = items.find(item => item.item_key === itemKey && item.section === section)
      
      if (existingItem) {
        const { error } = await supabase
          .from('checklist_items')
          .update({
            status,
            comment: comment || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingItem.id)

        if (!error) {
          setItems(items.map(item => 
            item.id === existingItem.id 
              ? { ...item, status, comment }
              : item
          ))
        }
      } else if (status) {
        const { data, error } = await supabase
          .from('checklist_items')
          .insert({
            car_id: car.id,
            section,
            item_key: itemKey,
            status,
            comment: comment || null,
            created_by: user.id
          })
          .select()
          .single()

        if (!error && data) {
          setItems([...items, data])
        }
      }
    } catch (error) {
      console.error('Error updating checklist item:', error)
    }
  }

  const getSectionStats = (section: string) => {
    const sectionData = getChecklistSection(section)
    if (!sectionData) return { total: 0, completed: 0, issues: 0 }

    const total = sectionData.items.length
    const sectionItems = items.filter(item => item.section === section)
    const completed = sectionItems.filter(item => item.status === 'ok').length
    const issues = sectionItems.filter(item => item.status === 'issue').length

    return { total, completed, issues }
  }

  return (
    <div className="space-y-6">
      {/* Share info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-blue-800">
            {shareLink.permission_type === 'view' 
              ? 'Voit tarkastella tätä tarkastuslistaa. Muokkaus vaatii rekisteröitymisen.'
              : canEdit 
                ? 'Voit muokata tätä tarkastuslistaa.'
                : 'Kirjaudu sisään muokataksesi tarkastuslistaa.'
            }
          </p>
        </div>
      </div>

      {/* Checklist sections */}
      <div className="space-y-4">
        {CHECKLIST_SECTIONS.map((section) => {
          const isExpanded = expandedSections.has(section.key)
          const stats = getSectionStats(section.key)
          
          return (
            <div key={section.key} className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div 
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection(section.key)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{section.icon}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                      <p className="text-sm text-gray-600">
                        {stats.completed}/{stats.total} tarkastettu
                        {stats.issues > 0 && (
                          <span className="text-red-600 ml-2">• {stats.issues} ongelmaa</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-gray-400">
                    {isExpanded ? '−' : '+'}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-200 p-6">
                  <div className="space-y-4">
                    {(getChecklistSection(section.key)?.items || []).map((item) => {
                      const itemData = getItemData(item.key, section.key)

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
                              
                              {canEdit ? (
                                <div className="space-y-3">
                                  <div className="flex items-center space-x-2">
                                    {['ok', 'warning', 'issue'].map((status) => (
                                      <button
                                        key={status}
                                        onClick={() => updateChecklistItem(item.key, section.key, status as any, itemData?.comment)}
                                        className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                                          itemData?.status === status
                                            ? getStatusColor(status)
                                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                        }`}
                                      >
                                        {status === 'ok' ? 'OK' : status === 'warning' ? 'Huomio' : 'Ongelma'}
                                      </button>
                                    ))}
                                    {itemData?.status && (
                                      <button
                                        onClick={() => updateChecklistItem(item.key, section.key, null)}
                                        className="px-3 py-1 rounded-full text-sm font-medium bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                                      >
                                        Tyhjennä
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ) : itemData?.status ? (
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(itemData.status)}`}>
                                  {itemData.status === 'ok' ? 'OK' : itemData.status === 'warning' ? 'Huomio' : 'Ongelma'}
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
                                carId={car.id}
                                checklistItemId={itemData?.id}
                                canDelete={false}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Haluatko oman tarkastuslistan?
        </h3>
        <p className="text-gray-600 mb-4">
          Rekisteröidy Ajokunto.fi:hin ja luo omia tarkastuslistoja autoillesi.
        </p>
        <a 
          href="/auth/signup"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Rekisteröidy maksutta
        </a>
      </div>
    </div>
  )
}