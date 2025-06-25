export interface ChecklistItemData {
  key: string
  title: string
  description?: string
}

export interface ChecklistSection {
  key: string
  title: string
  icon: string
  items: ChecklistItemData[]
}

export const CHECKLIST_SECTIONS: ChecklistSection[] = [
  {
    key: 'documentation',
    title: 'Dokumentaatio',
    icon: '📄',
    items: [
      {
        key: 'trafi_data_match',
        title: 'Traficomin tiedot vastaavat ilmoitettuja',
        description: 'Rekisterinumero, omistajahistoria, ajokiellot, rekisteröintitiedot ja tekniset tiedot ovat kunnossa.'
      },
      {
        key: 'inspection_history',
        title: 'Katsastushistoria on kunnossa',
        description: 'Ei hylkyjä, ja kilometrilukemat täsmäävät.'
      },
      {
        key: 'service_history',
        title: 'Huoltohistoria on dokumentoitu ja luotettava',
        description: 'Huollot on tehty merkkiliikkeessä tai luotettavassa huoltoliikkeessä.'
      },
      {
        key: 'vin_check',
        title: 'VIN-koodihaku tehty',
        description: 'Tiedot (varusteet, kolarihistoria, ulkomaanhistoria) vastaavat ilmoitettua.'
      },
      {
        key: 'type_defects_recalls',
        title: 'Tyyppiviat, takaisinkutsut ja valmistajan kampanjat tarkastettu',
        description: 'Ei olennaista puutteellisuutta.'
      },
      {
        key: 'price_market_level',
        title: 'Hinta vastaa markkinatasoa',
        description: 'Suhteessa ikään, ajomäärään ja varusteluun.'
      },
      {
        key: 'no_commercial_use',
        title: 'Auto ei ole ollut leasing-, taksi-, vuokra- tai autokoulukäytössä'
      },
      {
        key: 'no_total_loss',
        title: 'Autoa ei ole lunastettu vakuutusyhtiölle',
        description: 'Ei total loss -historiaa.'
      },
      {
        key: 'authorized_equipment',
        title: 'Ei luvattomia varusteita',
        description: 'Kaikki lisävarusteet on asianmukaisesti rekisteröity.'
      },
      {
        key: 'seller_verification',
        title: 'Myyjä on yksityishenkilö tai rekisteröity autoliike',
        description: 'Tiedot kunnossa.'
      },
      {
        key: 'import_car_data',
        title: 'Tuontiauton tiedot kunnossa',
        description: 'Auto ei ole tuontiauto TAI tuontiauton tiedot (autovero, CO₂-arvo, Euro-luokka) ovat kunnossa.'
      },
      {
        key: 'electronic_service_history',
        title: 'Sähköinen huoltohistoria saatavilla',
        description: 'Valmistajan järjestelmässä.'
      },
      {
        key: 'registration_certificate',
        title: 'Rekisteröintitodistuksen osat tallessa',
        description: 'Molemmat osat (osa I ja II) ovat tallessa.'
      },
      {
        key: 'service_book',
        title: 'Huoltokirja kunnossa',
        description: 'Sähköinen tai paperinen, kattavasti täytetty.'
      },
      {
        key: 'service_receipts',
        title: 'Huolto- ja korjauslaskut tallessa',
        description: 'Alkuperäiset tai kopiot.'
      },
      {
        key: 'warranty_valid',
        title: 'Takuu voimassa',
        description: 'Autossa tai osissa on voimassa oleva takuu, ja takuuehdot on täytetty.'
      },
      {
        key: 'no_financing_company',
        title: 'Auto ei ole rahoitusyhtiön omistuksessa',
        description: 'Ei maksamatonta osamaksua.'
      },
      {
        key: 'no_usage_restrictions',
        title: 'Ei käyttörajoituksia',
        description: 'Esim. leasing tai perikuntaomistus.'
      },
      {
        key: 'ownership_transfer_allowed',
        title: 'Omistajasiirtoa ei rajoita mikään sopimus',
        description: 'Esim. leasing.'
      },
      {
        key: 'found_in_register',
        title: 'Auto löytyy Traficomin rekisteristä'
      },
      {
        key: 'previous_purchase_papers',
        title: 'Vanha kauppakirja tai ostopaperit saatavilla'
      },
      {
        key: 'not_wanted',
        title: 'Auto ei ole etsintäkuulutettu',
        description: 'Esim. Interpolin VIN-rekisteri.'
      }
    ]
  },
  {
    key: 'exterior',
    title: 'Ulkopuoli',
    icon: '🚗',
    items: [
      {
        key: 'paint_condition',
        title: 'Maalipinta on tasainen ja virheetön',
        description: 'Ei uudelleenmaalauksia tai värieroja.'
      },
      {
        key: 'body_rust_dents',
        title: 'Korissa ei ole ruostetta tai kolhuja'
      },
      {
        key: 'undercarriage_suspension',
        title: 'Pohjalevy ja jousituksen kiinnityspisteet kunnossa'
      },
      {
        key: 'lights_function',
        title: 'Valot toimivat ja umpiot ovat ehjät'
      },
      {
        key: 'glass_mirrors',
        title: 'Lasit ja peilit ovat ehjät',
        description: 'Ilman säröjä tai vaurioita.'
      },
      {
        key: 'tire_condition',
        title: 'Renkaiden kulutuspinta riittävä',
        description: 'Ikä on tiedossa ja kuluma tasainen.'
      },
      {
        key: 'seasonal_tires',
        title: 'Vaatimustenmukaiset kesä- ja talvirenkaat'
      },
      {
        key: 'panel_gaps',
        title: 'Ovien, konepellin ja takaluukun saumat symmetriset',
        description: 'Oikein asennettu.'
      }
    ]
  },
  {
    key: 'interior',
    title: 'Sisätilat',
    icon: '🛋️',
    items: [
      {
        key: 'no_odors_moisture',
        title: 'Sisätiloissa ei ole hajuja, hometta, kosteutta tai kulumia'
      },
      {
        key: 'seats_safety_equipment',
        title: 'Istuimet, turvavyöt ja turvavarusteet kunnossa'
      },
      {
        key: 'electrical_interior_features',
        title: 'Kaikki sähköiset sisävarusteet toimivat',
        description: 'Esim. penkinlämmittimet, ikkunat, ratinlämmitin.'
      }
    ]
  },
  {
    key: 'technical',
    title: 'Tekniset tarkistukset',
    icon: '🔧',
    items: [
      {
        key: 'battery_tested',
        title: 'Akku testattu',
        description: 'Jännite ja ikä ovat kunnossa.'
      },
      {
        key: 'brakes_discs',
        title: 'Jarrut ja levyt kunnossa silmämääräisesti'
      },
      {
        key: 'alternator_belts',
        title: 'Laturi ja hihnat ehjät',
        description: 'Ei ääniä tai kulumaa havaittu.'
      },
      {
        key: 'obd2_diagnostics',
        title: 'OBD2-portti toimii, vikakoodit luettu',
        description: 'Jos vikakoodeja, luettele ne huomiot-osioon tarvittavine korjaustoimenpiteineen.'
      },
      {
        key: 'software_modifications',
        title: 'Auton ohjelmistoa ei ole muokattu',
        description: 'Jos on muokattu, muokkaus on hyväksytty tieliikennekäyttöön ja rekisteröity asianmukaisesti.'
      }
    ]
  },
  {
    key: 'test_drive',
    title: 'Koeajo',
    icon: '🛣️',
    items: [
      {
        key: 'transmission_function',
        title: 'Vaihteisto toimii kaikissa vaihteissa',
        description: 'Ilman viiveitä tai tärinöitä.'
      },
      {
        key: 'driving_modes',
        title: 'Ajotilat toimivat moitteettomasti',
        description: 'Eco, sport, AWD jne.'
      },
      {
        key: 'signals_lights_driving',
        title: 'Vilkut ja ajovalot toimivat ajon aikana'
      },
      {
        key: 'windows_sunroof_electric',
        title: 'Ikkunat, kattoluukku ja sähkötoimiset varusteet toimivat'
      },
      {
        key: 'hood_doors_trunk',
        title: 'Konepelti, ovet ja peräkontti avautuvat ja sulkeutuvat normaalisti'
      },
      {
        key: 'electric_mirrors',
        title: 'Sähköpeilit toimivat ja säätyvät oikein'
      },
      {
        key: 'navigation_infotainment',
        title: 'Navigaattori ja tietoviihdejärjestelmä toimivat normaalisti'
      },
      {
        key: 'software_updates',
        title: 'Ohjelmistojen tila tarkastettu',
        description: 'Ei päivitystarpeita havaittu.'
      },
      {
        key: 'handbrake_function',
        title: 'Käsijarru toimii moitteettomasti'
      },
      {
        key: 'interior_compartments',
        title: 'Sisätilojen luukut ja kotelot toimivat'
      },
      {
        key: 'door_handles_locks',
        title: 'Ovenkahvat ja lukitukset toimivat kaikissa ovissa'
      },
      {
        key: 'remote_key',
        title: 'Kauko-ohjattava avain toimii',
        description: 'Kaikki sen toiminnot testattu.'
      },
      {
        key: 'trailer_hitch',
        title: 'Peräkoukku toimii normaalisti',
        description: 'Sähköinen tai mekaaninen.'
      },
      {
        key: 'air_suspension',
        title: 'Ilmajousitus toimii normaalisti',
        description: 'Reagoi ajon aikana.'
      }
    ]
  },
  {
    key: 'expert_review',
    title: 'Erityistarkastukset',
    icon: '🧪',
    items: [
      {
        key: 'software_updates_recalls',
        title: 'Kaikki ohjelmistopäivitykset ja takaisinkutsutoimenpiteet tehty'
      },
      {
        key: 'professional_inspection',
        title: 'Auto on tarkastettu asiantuntijan toimesta',
        description: 'Nosturilla.'
      }
    ]
  },
  {
    key: 'cost_estimates',
    title: 'Kustannusarviot',
    icon: '💰',
    items: [
      {
        key: 'maintenance_parts_condition',
        title: 'Huoltojen ja kulutusosien tila arvioitu',
        description: 'Ei vaadi välitöntä toimenpidettä.'
      },
      {
        key: 'usage_tax_calculated',
        title: 'Käyttövoimavero laskettu ja tiedossa'
      },
      {
        key: 'insurance_costs',
        title: 'Vakuutusmaksut selvitetty ja vertailtu',
        description: 'Liikenne + kasko.'
      }
    ]
  },
  {
    key: 'buyer_advice',
    title: 'Ostoneuvot',
    icon: '📌',
    items: [
      {
        key: 'external_expert_present',
        title: 'Tarkastuksessa on ollut mukana ulkopuolinen asiantuntija'
      },
      {
        key: 'all_keys_manuals',
        title: 'Kaikki avaimet, ohjekirjat ja huoltokirjat ovat mukana'
      },
      {
        key: 'defects_equipment_documented',
        title: 'Kaikki viat ja varusteet on dokumentoitu kuvin ja tekstein'
      },
      {
        key: 'registration_ownership_transfer',
        title: 'Rekisteröinti ja omistajanvaihto tapahtuu kaupanteon yhteydessä'
      },
      {
        key: 'insurance_starts_before_driving',
        title: 'Vakuutus alkaa ennen ajoon lähtöä'
      },
      {
        key: 'written_contract',
        title: 'Kauppa tehdään kirjallisesti',
        description: 'Kauppakirja, myyntiehdot.'
      },
      {
        key: 'identity_verification',
        title: 'Ostajan ja myyjän henkilöllisyydet tarkastettu',
        description: 'Kaupantekoon on oikeus.'
      }
    ]
  }
]

export function getChecklistSection(sectionKey: string): ChecklistSection | undefined {
  return CHECKLIST_SECTIONS.find(section => section.key === sectionKey)
}

export function getChecklistItem(sectionKey: string, itemKey: string): ChecklistItemData | undefined {
  const section = getChecklistSection(sectionKey)
  return section?.items.find(item => item.key === itemKey)
}