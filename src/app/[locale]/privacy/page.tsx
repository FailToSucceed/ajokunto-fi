import { useTranslations } from 'next-intl'

export default function PrivacyPage() {
  const t = useTranslations()

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Tietosuojaseloste</h1>
          
          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Rekisterinpitäjä</h2>
              <p>
                Ajokunto.fi-palvelun rekisterinpitäjä vastaa henkilötietojesi käsittelystä tämän tietosuojaselosteen mukaisesti. Rekisterinpitäjään voi ottaa yhteyttä palvelun kautta.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Käsiteltävät henkilötiedot</h2>
              <p>Käsittelemme seuraavia henkilötietoja:</p>
              <ul className="list-disc pl-6 mt-2">
                <li><strong>Perustiedot:</strong> Nimi, sähköpostiosoite, puhelinnumero</li>
                <li><strong>Tekniset tiedot:</strong> IP-osoite, selaimen tiedot, kirjautumisajat</li>
                <li><strong>Ajoneuvotiedot:</strong> Rekisterinumero, merkki, malli, tarkastustiedot</li>
                <li><strong>Käyttötiedot:</strong> Palvelun käyttöhistoria, tallennukset</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Tietojen käsittelyn tarkoitus ja oikeusperuste</h2>
              <p>Käsittelemme henkilötietoja seuraaviin tarkoituksiin:</p>
              <ul className="list-disc pl-6 mt-2">
                <li><strong>Palvelun tarjoaminen:</strong> Käyttäjätilin ylläpito ja palvelun toiminnallisuudet (sopimus)</li>
                <li><strong>Asiakaspalvelu:</strong> Yhteydenottoihin vastaaminen ja tekninen tuki (oikeutettu etu)</li>
                <li><strong>Turvallisuus:</strong> Väärinkäytösten estäminen ja tietoturva (oikeutettu etu)</li>
                <li><strong>Kehittäminen:</strong> Palvelun parantaminen ja uusien ominaisuuksien luominen (oikeutettu etu)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Tietojen säilytysaika</h2>
              <p>
                Säilytämme henkilötietoja vain niin kauan kuin se on tarpeellista käsittelyn tarkoituksen kannalta:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Käyttäjätiedot: Tilin olemassaolon ajan + 30 päivää</li>
                <li>Ajoneuvotiedot: Tilin olemassaolon ajan + 30 päivää</li>
                <li>Tekniset lokitiedot: 12 kuukautta</li>
                <li>Asiakaspalvelutiedot: 24 kuukautta</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Tietojen luovutus ja siirto</h2>
              <p>
                Emme myy, vuokraa tai luovuta henkilötietojasi kolmansille osapuolille kaupallisiin tarkoituksiin. Tietoja voidaan luovuttaa:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Teknisille palveluntarjoajille (hosting, pilvipalvelut)</li>
                <li>Lakisääteisten velvoitteiden täyttämiseksi</li>
                <li>Käyttäjän nimenomaisen suostumuksen perusteella</li>
              </ul>
              <p className="mt-3">
                Palvelun tekniset tiedot tallennetaan EU-alueella sijaitseville palvelimille. Tiedonsiirto EU:n ulkopuolelle tapahtuu vain tarvittaessa ja asianmukaisten suojatoimien kanssa.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Tietoturva</h2>
              <p>
                Suojaamme henkilötietoja asianmukaisin teknisin ja organisatorisin toimenpitein:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Salausteknologiat tiedonsiirrossa ja tallennuksessa</li>
                <li>Pääsynhallinta ja käyttöoikeuksien rajoittaminen</li>
                <li>Säännölliset tietoturvakartoitukset</li>
                <li>Henkilöstön koulutus tietosuoja-asioissa</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Sinun oikeutesi</h2>
              <p>Sinulla on seuraavat oikeudet henkilötietojesi käsittelyyn:</p>
              <ul className="list-disc pl-6 mt-2">
                <li><strong>Tarkastusoikeus:</strong> Voit pyytää tietoa käsiteltävistä henkilötiedoista</li>
                <li><strong>Oikaisuoikeus:</strong> Voit pyytää virheellisten tietojen korjaamista</li>
                <li><strong>Poisto-oikeus:</strong> Voit pyytää tietojesi poistamista tietyissä tilanteissa</li>
                <li><strong>Käsittelyn rajoittaminen:</strong> Voit pyytää käsittelyn rajoittamista</li>
                <li><strong>Vastustusoikeus:</strong> Voit vastustaa tietojesi käsittelyä</li>
                <li><strong>Siirrettävyys:</strong> Voit pyytää tietojesi siirtämistä toiseen palveluun</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Evästeet</h2>
              <p>
                Palvelu käyttää välttämättömiä teknisiä evästeitä kirjautumisen ja toiminnallisuuden varmistamiseksi. Emme käytä seurantaevästeitä tai mainontaevästeitä ilman nimenomaista suostumustasi.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Automaattinen päätöksenteko</h2>
              <p>
                Palvelu ei tee automaattista päätöksentekoa tai profilointia, jolla olisi oikeudellisia vaikutuksia tai joka vaikuttaisi sinuun merkittävästi.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Tietosuojaselosteen muutokset</h2>
              <p>
                Voimme päivittää tätä tietosuojaselostetta tarvittaessa. Olennaisista muutoksista ilmoitamme käyttäjille etukäteen sähköpostitse tai palvelussa.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Yhteystiedot ja valitusoikeus</h2>
              <p>
                Tietosuoja-asioissa voit ottaa yhteyttä rekisterinpitäjään palvelun kautta. Sinulla on myös oikeus tehdä valitus tietosuojaviranomaiselle, jos katsot ettei henkilötietojesi käsittely vastaa voimassa olevaa lainsäädäntöä.
              </p>
              <p className="mt-3">
                <strong>Suomen tietosuojavaltuutettu:</strong><br />
                Käyntiosoite: Ratapihantie 9, 6. krs, 00520 Helsinki<br />
                Postiosoite: PL 800, 00521 Helsinki<br />
                Puhelin: 029 56 66700<br />
                Sähköposti: tietosuoja@om.fi
              </p>
            </section>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Tietosuojaseloste päivitetty viimeksi: {new Date().toLocaleDateString('fi-FI')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}