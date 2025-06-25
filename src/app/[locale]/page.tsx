import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('common.title')}
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            {t('landing.subtitle')}
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-4">🛒</div>
              <h3 className="text-xl font-semibold mb-2">{t('landing.buyer')}</h3>
              <p className="text-gray-600">Tarkasta auton kunto ennen ostoa</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-2">{t('landing.seller')}</h3>
              <p className="text-gray-600">Näytä auton kunto läpinäkyvästi</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-4">🔧</div>
              <h3 className="text-xl font-semibold mb-2">{t('landing.owner')}</h3>
              <p className="text-gray-600">Seuraa auton huoltohistoriaa</p>
            </div>
          </div>
          
          <div className="mt-12 space-x-4">
            <a href="/auth/signin" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors inline-block">
              Kirjaudu sisään
            </a>
            <a href="/auth/signup" className="bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 font-bold py-3 px-8 rounded-lg text-lg transition-colors inline-block">
              Rekisteröidy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}