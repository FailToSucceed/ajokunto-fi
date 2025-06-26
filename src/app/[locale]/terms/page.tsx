import { useTranslations } from 'next-intl'

export default function TermsPage() {
  const t = useTranslations()

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Käyttöehdot</h1>
          
          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Soveltamisala</h2>
              <p>
                Nämä käyttöehdot koskevat Ajokunto.fi-palvelun käyttöä. Palvelu on tarkoitettu ajoneuvojen kunnon seurantaan ja tarkastuslistojen hallintaan. Käyttämällä palvelua hyväksyt nämä käyttöehdot.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Käyttäjätili</h2>
              <p>
                Palvelun käyttö edellyttää käyttäjätilin luomista. Olet vastuussa tilisi turvallisuudesta ja kaikista tilillä tehdyistä toimista. Pidä kirjautumistietosi turvassa äläkä jaa niitä muiden kanssa.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Palvelun käyttö</h2>
              <p>
                Sitoudut käyttämään palvelua laillisesti ja näiden ehtojen mukaisesti. Et saa:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Häiritä palvelun toimintaa tai turvallisuutta</li>
                <li>Jakaa harhaanjohtavia tai vääriä tietoja</li>
                <li>Käyttää palvelua kaupallisiin tarkoituksiin ilman lupaa</li>
                <li>Loukata muiden käyttäjien oikeuksia</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Tietojen tallentaminen</h2>
              <p>
                Palveluun tallentamasi ajoneuvoja ja tarkastuksia koskevat tiedot säilyvät palvelimilla. Suosittelemme varmuuskopioiden ottamista tärkeistä tiedoista. Emme vastaa tietojen menettämisestä teknisten ongelmien vuoksi.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Vastuunrajoitukset</h2>
              <p>
                Palvelu toimitetaan "sellaisenaan". Emme takaa palvelun keskeytyksettömyyttä tai virheettömyyttä. Käyttäjä on vastuussa omista päätöksistään palvelussa olevien tietojen perusteella. Ajoneuvon todellinen kunto ja turvallisuus tulee aina tarkistaa ammattilaiselta.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Hinnoittelu</h2>
              <p>
                Palvelun perusominaisuudet ovat maksuttomia. Mahdolliset maksulliset lisäominaisuudet hinnoitellaan erikseen. Pidätämme oikeuden muuttaa hinnoittelua 30 päivän ennakkoilmoituksella.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Ehtojen muutokset</h2>
              <p>
                Voimme päivittää näitä käyttöehtoja tarvittaessa. Olennaisista muutoksista ilmoitamme käyttäjille sähköpostitse tai palvelussa. Jatkamalla palvelun käyttöä hyväksyt päivitetyt ehdot.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Tilin päättäminen</h2>
              <p>
                Voit päättää tilisi milloin tahansa profiiliasetuksista. Pidätämme oikeuden päättää tilejä, jotka rikkovat näitä käyttöehtoja. Tilin päättyessä tallennetut tiedot poistetaan 30 päivän kuluessa.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Sovellettava laki</h2>
              <p>
                Näihin käyttöehtoihin sovelletaan Suomen lakia. Erimielisyydet ratkaistaan ensisijaisesti neuvottelemalla. Mikäli sovintoa ei saavuteta, riita-asiat käsitellään Suomen tuomioistuimissa.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Yhteystiedot</h2>
              <p>
                Jos sinulla on kysymyksiä näistä käyttöehdoista, voit ottaa yhteyttä palvelun ylläpitoon palvelun kautta tai sähköpostitse.
              </p>
            </section>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Käyttöehdot päivitetty viimeksi: {new Date().toLocaleDateString('fi-FI')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}