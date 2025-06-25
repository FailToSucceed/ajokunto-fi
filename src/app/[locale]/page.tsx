import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          {/* Logo/Brand Section */}
          <div className="mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Ajokunto.fi
            </h1>
            <p className="text-lg text-gray-600 mb-2 max-w-2xl mx-auto">
              Auton ostaja, myyjä tai käyttäjä – vahvista alta ohjeistukselle. Tarkista auton kunto 
              helposti ja luotua kuluttajat asioista. Valitä kallit yllätykset ja sästä rahaa.
            </p>
            <p className="text-sm text-gray-500 max-w-2xl mx-auto">
              Tämä on ensimmäinen pilottiversio. Arvostavamme souroa kaikkas palvelutte, jotta saamme kehitettyä 
              tuotteita mahtimaattamman hyödyksenne, kiitos kun katsoit!
            </p>
          </div>
          
          {/* Role Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
            
            {/* Buyer Card */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5H17M7 13v8a2 2 0 002 2h6a2 2 0 002-2v-8m-8 0V9a2 2 0 012-2h4a2 2 0 012 2v4.01" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Auton Ostajalle</h3>
              <p className="text-gray-600 text-sm mb-6">
                Valitä kallit virheet tarkastamaila auto ennen 
                ostopäätöstä ja varmistamaan.
              </p>
              <ul className="text-left text-sm text-gray-600 space-y-2 mb-6">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">▶</span>
                  Saat tarkastuslistan juuri sinua 
                  kiinnostavista autosta
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">▶</span>
                  Vältä kalmat ja salalit yllätykset
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">▶</span>
                  Tee tietoinen ostopäätös
                </li>
              </ul>
              <a href="/auth/signup" className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center">
                Aloita tarkastus →
              </a>
            </div>

            {/* Seller Card */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Auton Myyjälle</h3>
              <p className="text-gray-600 text-sm mb-6">
                Dokumentoi auton kunto ja lisää 
                luottamusta kauppaan.
              </p>
              <ul className="text-left text-sm text-gray-600 space-y-2 mb-6">
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">▶</span>
                  Lisää läpinäkyvyyttä ja luottamusta 
                  kauppaan
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">▶</span>
                  Nosta auton arvoa dokumentoimalla
                </li>
              </ul>
              <a href="/auth/signup" className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center">
                Aloita tarkastus →
              </a>
            </div>

            {/* Owner Card */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Auton Käyttäjälle</h3>
              <p className="text-gray-600 text-sm mb-6">
                Pidä autosi kunnossa ja sästä 
                ennakoivammassa ylläpidossa.
              </p>
              <ul className="text-left text-sm text-gray-600 space-y-2 mb-6">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">▶</span>
                  Saat yksilöllisen huolto- ja 
                  ylläpitosuunnitelman
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">▶</span>
                  Seurata rajaa kaikossituksissa ja 
                  optimoiduilla huoltokausilla
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">▶</span>
                  Säästät rahaa ehkäisevässä ja 
                  optimoiduissa huoltokustannuksissa
                </li>
              </ul>
              <a href="/auth/signup" className="block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center">
                Huolto- ja ylläpitosuunnitelma →
              </a>
            </div>
          </div>
          
          {/* Auth Buttons */}
          <div className="space-x-4">
            <a href="/auth/signin" className="bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors inline-block">
              Kirjaudu sisään
            </a>
            <a href="/auth/signup" className="bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-300 font-semibold py-3 px-8 rounded-lg text-lg transition-colors inline-block">
              Rekisteröidy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}