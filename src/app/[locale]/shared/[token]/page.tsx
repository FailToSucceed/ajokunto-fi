import { validateShareToken } from '@/lib/sharing'
import { supabase } from '@/lib/supabase'
import { CHECKLIST_SECTIONS } from '@/data/checklist-items'
import { notFound, redirect } from 'next/navigation'
import SharedChecklistView from '@/components/car/SharedChecklistView'

interface SharedPageProps {
  params: Promise<{ token: string; locale: string }>
}

export default async function SharedChecklistPage({ params }: SharedPageProps) {
  const { token, locale } = await params
  
  // Validate the share token
  const shareLink = await validateShareToken(token)
  
  if (!shareLink) {
    notFound()
  }

  // Get car data
  const { data: car, error: carError } = await supabase
    .from('cars')
    .select('*')
    .eq('id', shareLink.car_id)
    .single()

  if (carError || !car) {
    notFound()
  }

  // Get checklist items
  const { data: checklistItems, error: checklistError } = await supabase
    .from('checklist_items')
    .select('*')
    .eq('car_id', shareLink.car_id)
    .order('section')
    .order('item_key')

  if (checklistError) {
    console.error('Error loading checklist items:', checklistError)
  }

  // If edit permission is required and user is not logged in, redirect to sign in
  if (shareLink.permission_type === 'edit') {
    // This will be handled in the client component
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Ajokunto.fi - Jaettu tarkastuslista
              </h1>
              <p className="text-gray-600">
                {car.registration_number} 
                {(car.make || car.model || car.year) && (
                  <span> • {[car.make, car.model, car.year].filter(Boolean).join(' ')}</span>
                )}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                shareLink.permission_type === 'view' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {shareLink.permission_type === 'view' ? 'Vain luku' : 'Muokkausoikeus'}
              </span>
              <a 
                href="/auth/signup" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Rekisteröidy Ajokunto.fi:hin
              </a>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <SharedChecklistView
            car={car}
            shareLink={shareLink}
            checklistItems={checklistItems || []}
          />
        </div>
      </main>
    </div>
  )
}