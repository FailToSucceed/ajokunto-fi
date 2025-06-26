import { useTranslations } from 'next-intl'

export default function PrivacyPage() {
  const t = useTranslations()

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Tietosuojaseloste – Ajokunto.fi</h1>
          
          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <p className="text-gray-600 mb-6">Päivitetty: 21.6.2025</p>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Rekisterinpitäjä</h2>
              <p className="mb-4">
                <strong>LLG Invest Oy / Ajokunto</strong><br />
                Y-tunnus: 3091528-7<br />
                Sähköposti: tietosuoja@ajokunto.fi
              </p>
              <p>
                LLG Invest Oy vastaa henkilötietojen käsittelystä tässä tietosuojaselosteessa kuvatulla tavalla.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Käsiteltävät henkilötiedot</h2>
              <p>Palvelussa käsitellään seuraavia tietoja:</p>
              <ul className="list-disc pl-6 mt-2">
                <li><strong>Perustiedot:</strong> nimi, sähköpostiosoite, puhelinnumero</li>
                <li><strong>Tekniset tiedot:</strong> IP-osoite, selaintiedot, kirjautumisajankohdat</li>
                <li><strong>Ajoneuvotiedot:</strong> rekisterinumero, merkki, malli, tarkastustiedot, kuvat ja kommentit</li>
                <li><strong>Käyttötiedot:</strong> palvelun käyttöhistoria, tallennukset ja ladatut liitteet</li>
              </ul>
              <p className="mt-3">
                Ajoneuvotiedot voivat muodostaa henkilötietoja, kun ne ovat yhdistettävissä luonnolliseen henkilöön 
                (esim. rekisterinumero + kuvat + kommentit).
              </p>
              <p className="mt-2">
                Käyttäjä on vastuussa siitä, ettei palveluun tallenneta muiden henkilöiden tunnistettavia tietoja 
                ilman asianmukaista suostumusta.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Tietojen käsittelyn tarkoitukset ja oikeusperusteet</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 my-4">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tarkoitus
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Oikeusperuste
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        Palvelun tarjoaminen ja asiakastilin hallinta
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        Sopimus
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        Yhteydenottoihin vastaaminen ja asiakastuki
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        Oikeutettu etu
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        Tietoturva ja väärinkäytösten estäminen
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        Oikeutettu etu
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        Palvelun kehittäminen ja analysointi
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        Oikeutettu etu
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Henkilötietojen säilytysaika</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 my-4">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tietotyyppi
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Säilytysaika
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        Käyttäjätiedot
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        Tilin olemassaolon ajan + 30 päivää
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        Ajoneuvotiedot
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        Tilin olemassaolon ajan + 30 päivää tai pidempään, jos tiedot ovat osa sopimusdokumentaatiota
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        Lokitiedot
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        12 kuukautta (tämän jälkeen tiedot anonymisoidaan, jos säilytys jatkuu)
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        Asiakaspalvelutiedot
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        24 kuukautta
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">
                Ajoneuvoprofiilit ja tietojen anonymisointi
              </h3>
              <p>
                Käyttäjien tallentamat tiedot (esim. tarkastushavainnot tai kommentit) voivat säilyä palvelussa 
                osana auton tietohistoriaa. Kun henkilötietojen säilytysaika päättyy, säilytettävät tiedot 
                anonymisoidaan tai pseudonymisoidaan siten, ettei käyttäjää voida enää tunnistaa ilman lisätietoa. 
                Näin mahdollistetaan ajoneuvokohtaisen historiatiedon hyödyntäminen myös pitkällä aikavälillä 
                ilman, että rekisteröityä voidaan tunnistaa.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Tietojen luovutus ja siirrot</h2>
              <p>
                Henkilötietoja ei luovuteta kolmansille osapuolille kaupallisiin tarkoituksiin. 
                Tietoja voidaan siirtää:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Palvelun teknisille kumppaneille (esim. hosting ja pilvipalvelut)</li>
                <li>Viranomaisille lakisääteisten velvoitteiden nojalla</li>
                <li>Käyttäjän suostumuksella</li>
              </ul>
              <p className="mt-3">
                Tietoja säilytetään EU-/ETA-alueella. EU:n ulkopuolelle siirryttäessä käytetään 
                asianmukaisia suojatoimia.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Tietoturva</h2>
              <p>
                Henkilötiedot suojataan teknisin ja organisatorisin toimenpitein:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Tietoliikenteen ja tallennuksen salaus</li>
                <li>Pääsynhallinta ja oikeuksien rajoittaminen</li>
                <li>Lokitus ja auditointi</li>
                <li>Henkilöstön tietosuojakoulutus</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Rekisteröidyn oikeudet</h2>
              <p>Sinulla on seuraavat oikeudet:</p>
              <ul className="list-disc pl-6 mt-2">
                <li>Oikeus tarkastaa itseäsi koskevat tiedot</li>
                <li>Oikeus vaatia virheellisten tietojen korjaamista</li>
                <li>Oikeus pyytää tietojen poistamista</li>
                <li>Oikeus rajoittaa tai vastustaa käsittelyä</li>
                <li>Oikeus siirtää tiedot järjestelmästä toiseen</li>
              </ul>
              <p className="mt-3">
                Voit käyttää oikeuksiasi ottamalla yhteyttä tietosuoja@ajokunto.fi
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Evästeet</h2>
              <p>
                Palvelu käyttää välttämättömiä evästeitä (esim. kirjautumisen hallintaan). 
                Seuranta- tai mainontaevästeitä ei käytetä ilman suostumustasi.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Automaattinen päätöksenteko ja profilointi</h2>
              <p>
                Tällä hetkellä palvelu ei sisällä automaattista päätöksentekoa tai profilointia. 
                Mahdollisista tulevista muutoksista tiedotetaan selkeästi etukäteen.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Tietosuojaselosteen päivitykset</h2>
              <p>
                Tietosuojaselostetta voidaan päivittää. Olennaisista muutoksista ilmoitetaan 
                palvelussa tai sähköpostitse.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Valitusoikeus</h2>
              <p>
                Sinulla on oikeus tehdä valitus valvontaviranomaiselle:
              </p>
              <div className="mt-3">
                <p><strong>Tietosuojavaltuutetun toimisto</strong></p>
                <p>PL 800, 00521 Helsinki</p>
                <p>Ratapihantie 9, 00520 Helsinki</p>
                <p>029 56 66700</p>
                <p>tietosuoja@om.fi</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}