'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { createShareLink, getShareLinks, deleteShareLink, generateShareUrl, generateQRCode, ShareLink } from '@/lib/sharing'

interface SharingModalProps {
  carId: string
  carRegistration: string
  isOpen: boolean
  onClose: () => void
}

export default function SharingModal({ carId, carRegistration, isOpen, onClose }: SharingModalProps) {
  const t = useTranslations()
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [qrCodes, setQrCodes] = useState<{[key: string]: string}>({})
  const [copySuccess, setCopySuccess] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadShareLinks()
    }
  }, [isOpen, carId])

  const loadShareLinks = async () => {
    setLoading(true)
    const links = await getShareLinks(carId)
    setShareLinks(links)
    setLoading(false)
  }

  const handleCreateShare = async (permissionType: 'view' | 'edit') => {
    console.log('handleCreateShare called with:', permissionType)
    setCreating(true)
    try {
      // For now, use simple direct car sharing until database sharing is fixed
      const directShareUrl = `${window.location.origin}/car/${carId}/share`
      
      // Create a mock share link for display
      const mockShareLink = {
        id: `direct-${Date.now()}`,
        car_id: carId,
        share_token: `direct-${carId}`,
        permission_type: permissionType as 'view' | 'edit',
        expires_at: null,
        created_by: 'current-user',
        created_at: new Date().toISOString(),
        accessed_count: 0,
        shareUrl: directShareUrl
      }
      
      setShareLinks([mockShareLink as ShareLink, ...shareLinks])
      console.log('Direct share link created:', directShareUrl)
    } catch (error) {
      console.error('Error in handleCreateShare:', error)
      alert('Virhe jakolinkin luomisessa: ' + error)
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteShare = async (shareId: string) => {
    const success = await deleteShareLink(shareId)
    if (success) {
      setShareLinks(shareLinks.filter(link => link.id !== shareId))
      // Remove QR code from cache
      setQrCodes(prev => {
        const newQrCodes = { ...prev }
        delete newQrCodes[shareId]
        return newQrCodes
      })
    }
  }

  const handleCopyLink = async (shareToken: string) => {
    // Use direct car share URL instead of token-based URL
    const url = `${window.location.origin}/car/${carId}/share`
    try {
      await navigator.clipboard.writeText(url)
      setCopySuccess(shareToken)
      setTimeout(() => setCopySuccess(null), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
      // Fallback: select the text
      const textArea = document.createElement('textarea')
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopySuccess(shareToken)
      setTimeout(() => setCopySuccess(null), 2000)
    }
  }

  const handleGenerateQR = async (shareId: string, shareToken: string) => {
    if (qrCodes[shareId]) return // Already generated
    
    const url = generateShareUrl(shareToken)
    const qrCodeUrl = await generateQRCode(url)
    setQrCodes(prev => ({ ...prev, [shareId]: qrCodeUrl }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Jaa tarkastuslista - {carRegistration}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Sulje</span>
              ✕
            </button>
          </div>

          <div className="space-y-6">
            {/* Create new share links */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Luo uusi jakolinkki</h4>
              <div className="flex gap-3">
                <button
                  onClick={() => handleCreateShare('view')}
                  disabled={creating}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {creating ? 'Luodaan...' : 'Vain lukuoikeus'}
                </button>
                <button
                  onClick={() => handleCreateShare('edit')}
                  disabled={creating}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {creating ? 'Luodaan...' : 'Muokkausoikeus'}
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Vain lukuoikeus:</strong> Vastaanottaja voi katsoa tarkastuslistaa ilman rekisteröitymistä<br/>
                <strong>Muokkausoikeus:</strong> Vastaanottaja voi muokata listaa (vaatii rekisteröitymisen)
              </p>
            </div>

            {/* Existing share links */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Aktiiviset jakolinkit</h4>
              {loading ? (
                <div className="text-center py-4">Ladataan...</div>
              ) : shareLinks.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  Ei aktiivisia jakolinkkejä
                </div>
              ) : (
                <div className="space-y-3">
                  {shareLinks.map((link) => (
                    <div key={link.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            link.permission_type === 'view' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {link.permission_type === 'view' ? 'Vain luku' : 'Muokkaus'}
                          </span>
                          <span className="text-sm text-gray-500">
                            Käytetty {link.accessed_count} kertaa
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteShare(link.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Poista
                        </button>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-3">
                        Luotu: {new Date(link.created_at).toLocaleDateString('fi-FI')}
                        {link.expires_at && (
                          <span> • Vanhenee: {new Date(link.expires_at).toLocaleDateString('fi-FI')}</span>
                        )}
                      </div>

                      {/* Visible share URL */}
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 mb-1">Jakolinkki:</p>
                            <p className="text-sm text-gray-800 font-mono break-all">
                              {(link as any).shareUrl || `${window.location.origin}/car/${carId}/share`}
                            </p>
                          </div>
                          {copySuccess === link.share_token && (
                            <div className="ml-2 flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-lg text-xs font-medium">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Linkki kopioitu!
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleCopyLink(link.share_token)}
                          className="flex items-center space-x-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span>{copySuccess === link.share_token ? 'Kopioitu!' : 'Kopioi linkki'}</span>
                        </button>
                        
                        <button
                          onClick={() => handleGenerateQR(link.id, link.share_token)}
                          className="flex items-center space-x-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                          </svg>
                          <span>QR-koodi</span>
                        </button>
                      </div>

                      {qrCodes[link.id] && (
                        <div className="mt-3 text-center">
                          <img 
                            src={qrCodes[link.id]} 
                            alt="QR Code" 
                            className="mx-auto border border-gray-200 rounded"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            QR-koodi jakolinkkiä varten
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}