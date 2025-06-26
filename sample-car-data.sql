-- Sample data for testing AI features
-- Run this in Supabase SQL Editor after running supabase-ai-features.sql

-- Insert sample car models (use ON CONFLICT to avoid duplicates)
INSERT INTO car_models (make, model, year_from, year_to, engine_type, fuel_type, transmission_type, body_type) VALUES
('BMW', '320d', 2012, 2019, '2.0 TDI', 'Diesel', 'Manual', 'Sedan'),
('BMW', '320d', 2012, 2019, '2.0 TDI', 'Diesel', 'Automatic', 'Sedan'),
('Volkswagen', 'Golf', 2013, 2020, '1.6 TDI', 'Diesel', 'Manual', 'Hatchback'),
('Volkswagen', 'Golf', 2013, 2020, '1.4 TSI', 'Petrol', 'Manual', 'Hatchback'),
('Toyota', 'Corolla', 2014, 2022, '1.6 VVT-i', 'Petrol', 'Manual', 'Sedan'),
('Ford', 'Focus', 2011, 2018, '1.6 TDCi', 'Diesel', 'Manual', 'Hatchback'),
('Audi', 'A4', 2016, 2023, '2.0 TDI', 'Diesel', 'Automatic', 'Sedan'),
('Mercedes-Benz', 'C-Class', 2014, 2021, '2.1 CDI', 'Diesel', 'Automatic', 'Sedan')
ON CONFLICT (make, model, year_from, engine_type) DO NOTHING;

-- Insert common issues for BMW 320d
INSERT INTO common_issues (car_model_id, issue_category, issue_title, issue_description, frequency_percentage, severity_level, average_repair_cost, mileage_range_from, mileage_range_to, symptoms, prevention_tips) 
SELECT 
  id,
  'engine',
  'DPF (Dieselhiukkassuodatin) tukkeutuminen',
  'Dieselhiukkassuodatin tukkeutuu erityisesti kaupunkiajossa, aiheuttaa vikatiloja ja suorituskyvyn heikkenemistä.',
  35.5,
  3,
  800.00,
  80000,
  150000,
  ARRAY['Vikatila', 'Suorituskyvyn heikkeneminen', 'Savutus', 'Polttoaineen kulutus nousee'],
  'Aja säännöllisesti pidempiä matkoja maantienopeudella DPF:n regeneroitumiseksi.'
FROM car_models WHERE make = 'BMW' AND model = '320d' LIMIT 1;

INSERT INTO common_issues (car_model_id, issue_category, issue_title, issue_description, frequency_percentage, severity_level, average_repair_cost, mileage_range_from, mileage_range_to, symptoms, prevention_tips)
SELECT 
  id,
  'electrical',
  'AdBlue-järjestelmän ongelmat',
  'AdBlue-järjestelmässä voi esiintyä vikoja sensoreissa tai suuttimissa, mikä aiheuttaa vikatiloja.',
  28.3,
  4,
  1200.00,
  100000,
  200000,
  ARRAY['AdBlue-varoitusvalot', 'Käynnistysongelmat', 'Suorituskyvyn rajoitus'],
  'Käytä laadukasta AdBlue-nestettä ja täytä säiliö ajoissa.'
FROM car_models WHERE make = 'BMW' AND model = '320d' LIMIT 1;

-- Insert recalls for BMW 320d
INSERT INTO recalls (car_model_id, recall_number, recall_date, issue_title, issue_description, severity_level, affected_vehicles_count, fix_available, fix_description, recall_source)
SELECT 
  id,
  'BMW-2018-001',
  '2018-03-15',
  'Jarrulevyjen halkeamariski',
  'Etujarrulevyissä on havaittu halkeamia, jotka voivat vaikuttaa jarrutehoon.',
  4,
  15420,
  true,
  'Jarrulevyjen vaihto parannettuihin malleihin.',
  'EU'
FROM car_models WHERE make = 'BMW' AND model = '320d' LIMIT 1;

-- Insert inspection statistics
INSERT INTO inspection_statistics (car_model_id, inspection_year, total_inspections, pass_rate, common_failure_reasons, average_mileage_at_inspection, data_source)
SELECT 
  id,
  2023,
  2847,
  87.5,
  ARRAY['Jarrulevy kulunut', 'Äänenvaimentimen korroosio', 'Lokasuojien kiinnitys'],
  142000,
  'Trafi'
FROM car_models WHERE make = 'BMW' AND model = '320d' LIMIT 1;

-- Insert maintenance schedules
INSERT INTO maintenance_schedules (car_model_id, service_type, recommended_mileage, recommended_months, service_description, average_cost, criticality_level)
SELECT 
  id,
  'oil_change',
  15000,
  12,
  'Moottorinöljyn ja -suodattimen vaihto',
  180.00,
  4
FROM car_models WHERE make = 'BMW' AND model = '320d' LIMIT 1;

INSERT INTO maintenance_schedules (car_model_id, service_type, recommended_mileage, recommended_months, service_description, average_cost, criticality_level)
SELECT 
  id,
  'brake_pads',
  60000,
  NULL,
  'Jarrupalojen vaihto',
  320.00,
  5
FROM car_models WHERE make = 'BMW' AND model = '320d' LIMIT 1;

INSERT INTO maintenance_schedules (car_model_id, service_type, recommended_mileage, recommended_months, service_description, average_cost, criticality_level)
SELECT 
  id,
  'timing_belt',
  120000,
  96,
  'Jakohihnan vaihto vesipumppuineen',
  850.00,
  5
FROM car_models WHERE make = 'BMW' AND model = '320d' LIMIT 1;

-- Insert sample data for Volkswagen Golf
INSERT INTO common_issues (car_model_id, issue_category, issue_title, issue_description, frequency_percentage, severity_level, average_repair_cost, mileage_range_from, mileage_range_to, symptoms, prevention_tips)
SELECT 
  id,
  'transmission',
  'DSG-vaihteiston nykiminen',
  'DSG-automaattivaihteistossa voi esiintyä nykimistä ja epätasaista vaihtamista.',
  42.1,
  3,
  650.00,
  80000,
  160000,
  ARRAY['Nykiminen kiihdytettäessä', 'Viivästynyt vaihtaminen', 'Vaihteiston varoitusvalot'],
  'Vaihda DSG-öljy säännöllisesti 60,000 km välein.'
FROM car_models WHERE make = 'Volkswagen' AND model = 'Golf' AND engine_type = '1.6 TDI' LIMIT 1;

-- Insert sample Ford Focus issues
INSERT INTO common_issues (car_model_id, issue_category, issue_title, issue_description, frequency_percentage, severity_level, average_repair_cost, mileage_range_from, mileage_range_to, symptoms, prevention_tips)
SELECT 
  id,
  'electrical',
  'Generaattorin ongelmat',
  'Generaattori voi rikkoutua ennenaikaisesti, aiheuttaen latausongelmia.',
  31.8,
  4,
  420.00,
  100000,
  180000,
  ARRAY['Akun varoitusvalo', 'Käynnistysongelmat', 'Himmeät valot'],
  'Tarkista generaattorin kiila säännöllisesti.'
FROM car_models WHERE make = 'Ford' AND model = 'Focus' LIMIT 1;

-- Add free subscriptions for any existing users (if any)
INSERT INTO user_subscriptions (user_id, subscription_type, ai_queries_limit)
SELECT id, 'free', 3 
FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM user_subscriptions WHERE user_id IS NOT NULL);