-- 1. DROP TABLES (CASCADE)
DROP TABLE IF EXISTS time_blocks CASCADE;
DROP TABLE IF EXISTS work_shifts CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS gift_cards CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS specialists CASCADE;
DROP TABLE IF EXISTS page_content CASCADE;
DROP TABLE IF EXISTS access_requests CASCADE;

-- 2. CREATE TABLES

-- Specialists Table
CREATE TABLE specialists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  specialty TEXT NOT NULL,
  bio TEXT,
  avatar TEXT,
  email TEXT UNIQUE NOT NULL,
  profile_type TEXT NOT NULL, -- 'barber', 'estilista', 'terapeuta', 'mixto', 'admin'
  assigned_agendas TEXT[] NOT NULL, -- ['barberia', 'peluqueria', 'terapias']
  image_url TEXT,
  phone TEXT
);

-- Services Table
CREATE TABLE services (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL, -- 'barberia', 'peluqueria', 'terapias'
  name TEXT NOT NULL,
  price TEXT NOT NULL,
  duration TEXT NOT NULL,
  description TEXT,
  specialist_ids TEXT[] NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

-- Clients Table (CRM)
CREATE TABLE clients (
  phone TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  businesses TEXT[] DEFAULT '{}',
  total_spent INTEGER DEFAULT 0,
  last_visit TEXT,
  notes TEXT DEFAULT '',
  not_so_good_client BOOLEAN DEFAULT FALSE
);

-- Bookings Table
CREATE TABLE bookings (
  id TEXT PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_email TEXT,
  category TEXT NOT NULL,
  service_name TEXT NOT NULL,
  price TEXT NOT NULL,
  specialist_name TEXT NOT NULL,
  date TEXT NOT NULL, -- YYYY-MM-DD
  time TEXT NOT NULL, -- HH:MM
  channel TEXT NOT NULL DEFAULT 'Web', -- 'Web', 'WhatsApp', 'Walk-in'
  status TEXT NOT NULL DEFAULT 'confirmado', -- 'confirmado', 'pendiente', 'completado', 'bloqueado'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  gift_card_used TEXT
);

-- Gift Cards Table
CREATE TABLE gift_cards (
  code TEXT PRIMARY KEY,
  original_amount INTEGER NOT NULL,
  remaining_balance INTEGER NOT NULL,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  theme TEXT NOT NULL, -- 'barberia', 'peluqueria', 'terapias', 'santuario'
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Time Blocks Table
CREATE TABLE time_blocks (
  id TEXT PRIMARY KEY,
  specialist_id TEXT NOT NULL REFERENCES specialists(id) ON DELETE CASCADE,
  date TEXT NOT NULL, -- YYYY-MM-DD
  start_time TEXT NOT NULL, -- HH:MM
  end_time TEXT NOT NULL, -- HH:MM
  reason TEXT NOT NULL, -- 'Almuerzo', 'Permiso Médico', 'Capacitación', 'Vacaciones', 'Asunto Personal'
  is_recurring BOOLEAN DEFAULT FALSE
);

-- Work Shifts Table
CREATE TABLE work_shifts (
  id TEXT PRIMARY KEY,
  specialist_id TEXT NOT NULL REFERENCES specialists(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL, -- 0-6
  is_active BOOLEAN DEFAULT TRUE,
  start_time TEXT NOT NULL DEFAULT '09:00',
  end_time TEXT NOT NULL DEFAULT '18:00',
  has_break BOOLEAN DEFAULT TRUE,
  break_start_time TEXT DEFAULT '13:00',
  break_end_time TEXT DEFAULT '14:00',
  UNIQUE (specialist_id, day_of_week)
);

-- Page Content Table (CMS)
CREATE TABLE page_content (
  key TEXT PRIMARY KEY, -- 'home', 'barberia', 'peluqueria', 'terapias'
  content JSONB NOT NULL
);

-- Access Requests Table
CREATE TABLE access_requests (
  id BIGSERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  business TEXT NOT NULL, -- 'barberia', 'peluqueria', 'terapias'
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable Row Level Security (RLS) - Disable it or bypass it with service role.
-- For simplicity, since the app connects with service role/anon keys, we will allow all operations for public users during testing, or disable RLS.
ALTER TABLE specialists DISABLE ROW LEVEL SECURITY;
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE gift_cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE time_blocks DISABLE ROW LEVEL SECURITY;
ALTER TABLE work_shifts DISABLE ROW LEVEL SECURITY;
ALTER TABLE page_content DISABLE ROW LEVEL SECURITY;
ALTER TABLE access_requests DISABLE ROW LEVEL SECURITY;


-- 3. SEED INITIAL DATA

-- Specialists
INSERT INTO specialists (id, name, role, specialty, bio, avatar, email, profile_type, assigned_agendas, image_url) VALUES
('sp1', 'Sofia Valente', 'Directora de Estilo', 'Coloración de alta costura & Balayage', 'Con 15 años de trayectoria profesional formada en São Paulo y Las Vegas, Sofia fundó Alma Bela Studio bajo la convicción de que el salón no es solo un lugar de trabajo, sino un espacio donde al tocar el cabello se toca y sana la autoestima.', 'SV', 'sofia.valente@valentes.cl', 'admin', ARRAY['barberia', 'peluqueria', 'terapias'], 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80'),
('sp2', 'Lucía Rivas', 'Especialista en Salud Capilar', 'Tratamientos moleculares & Texturas', 'Apasionada por la química del cabello y el cuidado capilar empático. Se especializa en revivir cabellos dañados mediante protocolos de nutrición celular activa.', 'LR', 'lucia.rivas@valentes.cl', 'estilista', ARRAY['peluqueria'], 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'),
('sp3', 'Andrés Silva', 'Estilista Senior', 'Corte seco & Texturas naturales', 'Especialista en corte en seco con técnicas perfeccionadas en academias internacionales. Su filosofía sostiene que la belleza es identidad, expresión y confianza.', 'AS', 'andres.silva@valentes.cl', 'estilista', ARRAY['peluqueria'], 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'),
('sp4', 'Valentina Paz', 'Colorista Experta', 'Iluminaciones tridimensionales & Babylights', 'Experta en técnicas de iluminación francesas y graduada en workshops de Sebastian y Chloé. Crea tonos personalizados con un enfoque empático.', 'VP', 'valentina.paz@valentes.cl', 'estilista', ARRAY['peluqueria'], 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'),
('sb1', 'Carlos Mendoza', 'Maestro Barbero', 'Afeitado tradicional & Estructura capilar', 'Con más de 12 años de trayectoria en el arte clásico del afeitado a navaja, Carlos combina precisión geométrica con técnicas de relajación.', 'CM', 'carlos.mendoza@valentes.cl', 'barber', ARRAY['barberia'], 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'),
('sb2', 'Enrique Soto', 'Diseñador de Barba', 'Esculpido moderno & Cuidado de la piel', 'Especialista en visajismo. Adapta cada línea de la barba a la estructura ósea del rostro usando productos botánicos orgánicos.', 'ES', 'enrique.soto@valentes.cl', 'barber', ARRAY['barberia'], 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80'),
('sb3', 'Marcos Delgado', 'Estilista & Barbero', 'Cortes modernos & Cuidado capilar', 'Especialista en degradados de alta precisión y estilismo capilar masculino contemporáneo.', 'MD', 'marcos.delgado@valentes.cl', 'mixto', ARRAY['barberia', 'peluqueria'], 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80'),
('sb4', 'Javier Ortega', 'Fisioterapeuta Capilar & Barbero', 'Tratamientos de cuero cabelludo & Afeitado spa', 'Experto en salud capilar y afeitado terapéutico. Utiliza fitoterapia y toallas calientes con infusión de eucalipto.', 'JO', 'javier.ortega@valentes.cl', 'barber', ARRAY['barberia'], 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80'),
('st1', 'Mateo Silva', 'Terapeuta Geotermal', 'Masaje de tejido profundo & Liberación miofascial', 'Mateo entiende el cuerpo como un mapa emocional. Integra kinesiología y técnicas corporales orientales.', 'MS', 'mateo.silva@santuario.cl', 'terapeuta', ARRAY['terapias'], 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80'),
('st2', 'Elena Rostova', 'Maestra de Reiki & Sonoterapeuta', 'Sanación vibracional & Aromaterapia', 'Especialista en terapias integrativas. Utiliza el sonido, los aromas y la energía sutil para guiar a las personas.', 'ER', 'elena.rostova@santuario.cl', 'mixto', ARRAY['terapias', 'peluqueria'], 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'),
('st3', 'Camila Fuentes', 'Terapeuta Ayurveda', 'Masaje Abhyanga & Fitoterapia', 'Formada en India, Camila integra el conocimiento ancestral del Ayurveda con técnicas de aromaterapia clínica.', 'CF', 'camila.fuentes@santuario.cl', 'terapeuta', ARRAY['terapias'], 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'),
('st4', 'Nicolás Prat', 'Quiropráctico & Masoterapeuta', 'Descompresión vertebral & Drenaje', 'Especialista en alineación postural y alivio de dolores crónicos. Su enfoque combina la terapia manual.', 'NP', 'nicolas.prat@santuario.cl', 'terapeuta', ARRAY['terapias'], 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80');

-- Services
INSERT INTO services (id, category, name, price, duration, description, specialist_ids, is_active) VALUES
('b_cejas', 'barberia', 'Cejas', '$3.500', '15 min', 'Perfilado de cejas y/o líneas.', ARRAY['sb1', 'sb2', 'sb3', 'sb4'], TRUE),
('b_corte_3era', 'barberia', 'Corte 3era Edad', '$12.000', '45 min', 'Corte de cabello para adulto mayor de 65 años (VÁLIDO SOLO CON PAGO EN EFECTIVO O TRANSFERENCIA).', ARRAY['sb1', 'sb2', 'sb3', 'sb4'], TRUE),
('b_corte_general', 'barberia', 'Corte de Cabello', '$15.000', '45 min', 'INCLUYE: Pomada a elección y asesoría personalizada por nuestro equipo.', ARRAY['sb1', 'sb2', 'sb3', 'sb4'], TRUE),
('b_corte_nino', 'barberia', 'Corte Niño ( 10años)', '$13.000', '45 min', 'Corte de cabello para niños menores de 10 años (VÁLIDO SOLO CON PAGO EN EFECTIVO O TRANSFERENCIA).', ARRAY['sb1', 'sb2', 'sb3', 'sb4'], TRUE),
('b_barba_perfilado_navaja', 'barberia', 'Perfilado navaja', '$15.000', '45 min', 'Perfilado de barba con toalla caliente y navaja.', ARRAY['sb1', 'sb2', 'sb3', 'sb4'], TRUE),
('b_barba_perfilado_retoque', 'barberia', 'Perfilado + Retoque', '$17.000', '45 min', 'Perfilado de barba con toalla caliente, navaja y limpieza de contornos del cabello.', ARRAY['sb1', 'sb2', 'sb3', 'sb4'], TRUE),
('b_barba_retoque', 'barberia', 'Retoque Barba', '$12.000', '30 min', 'Retocamos barba solo con máquina (marcar y rebajar) y shaver a elección del cliente.', ARRAY['sb1', 'sb2', 'sb3', 'sb4'], TRUE),
('b_barba_rasurado_ras', 'barberia', 'Rasurado al ras', '$15.000', '45 min', 'Rasuramos por completo la barba con toalla caliente y navaja.', ARRAY['sb1', 'sb2', 'sb3', 'sb4'], TRUE),
('b_combo_corte_rasurado', 'barberia', 'Corte de cabello+ Rasurado', '$25.000', '1 hrs', 'Corte de cabello + Rasurado de barba con toalla caliente y navaja.', ARRAY['sb1', 'sb2', 'sb3', 'sb4'], TRUE),
('b_combo_corte_retoque', 'barberia', 'Corte de cabello + retoque de barba', '$20.000', '1 hrs', 'Corte de cabello y retocamos barba solo con máquina (marcar y rebajar) y shaver a elección del cliente.', ARRAY['sb1', 'sb2', 'sb3', 'sb4'], TRUE),
('b_combo_corte_perfilado', 'barberia', 'Corte de cabello + Perfilado de barba', '$25.000', '1 hrs', 'Corte de cabello y perfilado de barba con toalla caliente y navaja.', ARRAY['sb1', 'sb2', 'sb3', 'sb4'], TRUE),
('b_combo_corte_barba', 'barberia', 'servicio corte y barba', '$23.000', '1 hrs 20 min', 'Servicio premium completo que incluye corte de cabello y ritual de barba completo con toalla caliente.', ARRAY['sb1', 'sb2', 'sb3', 'sb4'], TRUE),
('p1', 'peluqueria', 'Corte de Diseño & Movimiento', '$38.000', '60 min', 'Asesoría de imagen profunda y técnica personalizada. Un corte adaptado a la caída y textura de tu cabello.', ARRAY['sp1', 'sp3'], TRUE),
('p2', 'peluqueria', 'Coloración Orgánica Integral', '$65.000', '90 min', 'Balayage, reflejos o cobertura total utilizando coloraciones botánicas libres de amoníaco.', ARRAY['sp1', 'sp4'], TRUE),
('p3', 'peluqueria', 'Tratamiento Seda Capilar y Brillo', '$48.000', '60 min', 'Cura nutritiva celular intensiva a base de queratina vegetal y ácido hialurónico.', ARRAY['sp2', 'sp3'], TRUE),
('p4', 'peluqueria', 'Peinado Editorial & Ondas', '$30.000', '45 min', 'Lavado y peinado profesional con ondas sedosas de alta duración con productos Sebastian y Chloé.', ARRAY['sp2', 'sp4'], TRUE),
('t1', 'terapias', 'Masaje de Piedras Calientes (Obsidiana)', '$55.000', '75 min', 'Termoterapia que utiliza piedras volcánicas calientes para aliviar la tensión muscular profunda.', ARRAY['st1', 'st3'], TRUE),
('t2', 'terapias', 'Alineación de Chakras & Reiki', '$45.000', '60 min', 'Canalización de energía vital para equilibrar los centros energéticos del cuerpo.', ARRAY['st2', 'st3'], TRUE),
('t3', 'terapias', 'Sonoterapia Vibracional & Cuencos', '$48.000', '60 min', 'Inmersión en ondas acústicas con cuencos de cuarzo y tibetanos.', ARRAY['st2', 'st4'], TRUE),
('t4', 'terapias', 'Ritual Desintoxicante Corporal', '$70.000', '90 min', 'Exfoliación con sales del Himalaya, envoltura nutritiva de arcilla botánica y masaje de drenaje.', ARRAY['st1', 'st4'], TRUE);

-- Clients
INSERT INTO clients (phone, name, email, businesses, total_spent, last_visit, notes, not_so_good_client) VALUES
('+56 9 8831 2234', 'Tomás Pérez', 'tomas.perez@gmail.com', ARRAY['barberia', 'terapias'], 70000, TO_CHAR(NOW(), 'YYYY-MM-DD'), 'Le gusta tomar té verde durante el masaje capilar. Prefiere cortes clásicos.', FALSE),
('+56 9 7721 9934', 'Felipe Castro', 'felipe.castro@outlook.com', ARRAY['barberia'], 15000, TO_CHAR(NOW(), 'YYYY-MM-DD'), 'Piel sensible, usar aceites hidratantes pre-afeitado.', FALSE),
('+56 9 6611 8844', 'Andrés Vicuña', 'andres.vic@live.cl', ARRAY['barberia'], 25000, TO_CHAR(NOW() + INTERVAL '1 day', 'YYYY-MM-DD'), 'Frecuente. Siempre agenda combo de cabello y barba.', FALSE),
('+56 9 9988 7766', 'María José Plaza', 'mj.plaza@gmail.com', ARRAY['peluqueria'], 65000, TO_CHAR(NOW(), 'YYYY-MM-DD'), 'Coloración botánica libre de amoníaco. Prefiere tonos cálidos.', FALSE),
('+56 9 8877 6655', 'Camila Silva', 'cami.silva@uai.cl', ARRAY['peluqueria'], 30000, TO_CHAR(NOW() + INTERVAL '1 day', 'YYYY-MM-DD'), 'Le gusta el peinado con ondas sueltas.', FALSE),
('+56 9 5544 3322', 'Javiera Montes', 'javiera.montes@gmail.com', ARRAY['terapias'], 45000, TO_CHAR(NOW() + INTERVAL '1 day', 'YYYY-MM-DD'), 'Sufre de dolor lumbar, ideal sugerir piedras calientes volcánicas.', FALSE);

-- Bookings
INSERT INTO bookings (id, client_name, client_phone, client_email, category, service_name, price, specialist_name, date, time, channel, status, created_at, gift_card_used) VALUES
('RIT-394812', 'Tomás Pérez', '+56 9 8831 2234', 'tomas.perez@gmail.com', 'barberia', 'Corte de Cabello', '$15.000', 'Carlos Mendoza', TO_CHAR(NOW(), 'YYYY-MM-DD'), '09:00', 'Web', 'confirmado', NOW(), NULL),
('RIT-901248', 'Felipe Castro', '+56 9 7721 9934', 'felipe.castro@outlook.com', 'barberia', 'Perfilado navaja', '$15.000', 'Enrique Soto', TO_CHAR(NOW(), 'YYYY-MM-DD'), '12:00', 'WhatsApp', 'confirmado', NOW(), NULL),
('RIT-773124', 'Andrés Vicuña', '+56 9 6611 8844', 'andres.vic@live.cl', 'barberia', 'Corte de cabello + Perfilado de barba', '$25.000', 'Marcos Delgado', TO_CHAR(NOW() + INTERVAL '1 day', 'YYYY-MM-DD'), '15:00', 'Walk-in', 'confirmado', NOW(), NULL),
('RIT-482103', 'María José Plaza', '+56 9 9988 7766', 'mj.plaza@gmail.com', 'peluqueria', 'Coloración Orgánica Integral', '$65.000', 'Sofia Valente', TO_CHAR(NOW(), 'YYYY-MM-DD'), '10:30', 'Web', 'pendiente', NOW(), NULL),
('RIT-591243', 'Camila Silva', '+56 9 8877 6655', 'cami.silva@uai.cl', 'peluqueria', 'Peinado Editorial & Ondas', '$30.000', 'Valentina Paz', TO_CHAR(NOW() + INTERVAL '1 day', 'YYYY-MM-DD'), '13:30', 'WhatsApp', 'confirmado', NOW(), NULL),
('RIT-103948', 'Tomás Pérez', '+56 9 8831 2234', 'tomas.perez@gmail.com', 'terapias', 'Masaje de Piedras Calientes (Obsidiana)', '$55.000', 'Mateo Silva', TO_CHAR(NOW(), 'YYYY-MM-DD'), '15:00', 'Web', 'confirmado', NOW(), NULL),
('RIT-229481', 'Javiera Montes', '+56 9 5544 3322', 'javiera.montes@gmail.com', 'terapias', 'Alineación de Chakras & Reiki', '$45.000', 'Elena Rostova', TO_CHAR(NOW() + INTERVAL '1 day', 'YYYY-MM-DD'), '16:30', 'WhatsApp', 'pendiente', NOW(), NULL),
('RIT-112233', 'Felipe Castro', '+56 9 7721 9934', 'felipe.castro@outlook.com', 'barberia', 'Corte de Cabello', '$15.000', 'Carlos Mendoza', TO_CHAR(NOW() - INTERVAL '1 day', 'YYYY-MM-DD'), '10:00', 'Web', 'completado', NOW() - INTERVAL '1 day', NULL),
('RIT-445566', 'María José Plaza', '+56 9 9988 7766', 'mj.plaza@gmail.com', 'peluqueria', 'Corte de Diseño & Movimiento', '$38.000', 'Sofia Valente', TO_CHAR(NOW() - INTERVAL '2 days', 'YYYY-MM-DD'), '14:30', 'Walk-in', 'completado', NOW() - INTERVAL '2 days', NULL),
('RIT-778899', 'Camila Silva', '+56 9 8877 6655', 'cami.silva@uai.cl', 'peluqueria', 'Coloración Orgánica Integral', '$65.000', 'Valentina Paz', TO_CHAR(NOW() - INTERVAL '3 days', 'YYYY-MM-DD'), '11:00', 'WhatsApp', 'completado', NOW() - INTERVAL '3 days', NULL),
('RIT-101112', 'Javiera Montes', '+56 9 5544 3322', 'javiera.montes@gmail.com', 'terapias', 'Masaje de Piedras Calientes (Obsidiana)', '$55.000', 'Mateo Silva', TO_CHAR(NOW() - INTERVAL '3 days', 'YYYY-MM-DD'), '16:00', 'Web', 'completado', NOW() - INTERVAL '3 days', NULL),
('RIT-131415', 'Tomás Pérez', '+56 9 8831 2234', 'tomas.perez@gmail.com', 'barberia', 'Perfilado navaja', '$15.000', 'Enrique Soto', TO_CHAR(NOW() - INTERVAL '4 days', 'YYYY-MM-DD'), '17:30', 'Walk-in', 'completado', NOW() - INTERVAL '4 days', NULL),
('RIT-161718', 'Andrés Vicuña', '+56 9 6611 8844', 'andres.vic@live.cl', 'barberia', 'Corte de Cabello', '$15.000', 'Marcos Delgado', TO_CHAR(NOW() - INTERVAL '5 days', 'YYYY-MM-DD'), '10:00', 'Web', 'completado', NOW() - INTERVAL '5 days', NULL),
('RIT-192021', 'Camila Silva', '+56 9 8877 6655', 'cami.silva@uai.cl', 'terapias', 'Alineación de Chakras & Reiki', '$45.000', 'Elena Rostova', TO_CHAR(NOW() - INTERVAL '6 days', 'YYYY-MM-DD'), '14:00', 'WhatsApp', 'completado', NOW() - INTERVAL '6 days', NULL),
('RIT-222324', 'María José Plaza', '+56 9 9988 7766', 'mj.plaza@gmail.com', 'peluqueria', 'Tratamiento Seda Capilar y Brillo', '$48.000', 'Lucía Rivas', TO_CHAR(NOW() - INTERVAL '8 days', 'YYYY-MM-DD'), '15:30', 'Web', 'completado', NOW() - INTERVAL '8 days', NULL),
('RIT-252627', 'Tomás Pérez', '+56 9 8831 2234', 'tomas.perez@gmail.com', 'barberia', 'servicio corte y barba', '$23.000', 'Carlos Mendoza', TO_CHAR(NOW() - INTERVAL '10 days', 'YYYY-MM-DD'), '11:00', 'WhatsApp', 'completado', NOW() - INTERVAL '10 days', NULL),
('RIT-282930', 'Felipe Castro', '+56 9 7721 9934', 'felipe.castro@outlook.com', 'barberia', 'Corte de Cabello', '$15.000', 'Enrique Soto', TO_CHAR(NOW() - INTERVAL '12 days', 'YYYY-MM-DD'), '12:00', 'Web', 'completado', NOW() - INTERVAL '12 days', NULL),
('RIT-313233', 'Javiera Montes', '+56 9 5544 3322', 'javiera.montes@gmail.com', 'terapias', 'Sonoterapia Vibracional & Cuencos', '$48.000', 'Elena Rostova', TO_CHAR(NOW() - INTERVAL '15 days', 'YYYY-MM-DD'), '16:00', 'Walk-in', 'completado', NOW() - INTERVAL '15 days', NULL),
('RIT-343536', 'Andrés Vicuña', '+56 9 6611 8844', 'andres.vic@live.cl', 'barberia', 'Corte de cabello + Perfilado de barba', '$25.000', 'Marcos Delgado', TO_CHAR(NOW() - INTERVAL '18 days', 'YYYY-MM-DD'), '15:00', 'WhatsApp', 'completado', NOW() - INTERVAL '18 days', NULL),
('RIT-373839', 'Camila Silva', '+56 9 8877 6655', 'cami.silva@uai.cl', 'peluqueria', 'Peinado Editorial & Ondas', '$30.000', 'Valentina Paz', TO_CHAR(NOW() - INTERVAL '22 days', 'YYYY-MM-DD'), '13:00', 'Web', 'completado', NOW() - INTERVAL '22 days', NULL),
('RIT-404142', 'María José Plaza', '+56 9 9988 7766', 'mj.plaza@gmail.com', 'terapias', 'Ritual Desintoxicante Corporal', '$70.000', 'Mateo Silva', TO_CHAR(NOW() - INTERVAL '25 days', 'YYYY-MM-DD'), '17:00', 'Walk-in', 'completado', NOW() - INTERVAL '25 days', NULL),
('RIT-434445', 'Tomás Pérez', '+56 9 8831 2234', 'tomas.perez@gmail.com', 'peluqueria', 'Corte de Diseño & Movimiento', '$38.000', 'Andrés Silva', TO_CHAR(NOW() - INTERVAL '28 days', 'YYYY-MM-DD'), '10:30', 'WhatsApp', 'completado', NOW() - INTERVAL '28 days', NULL);

-- Gift Cards
INSERT INTO gift_cards (code, original_amount, remaining_balance, sender_name, sender_email, recipient_name, recipient_email, theme, message, created_at, expires_at) VALUES
('SAN-GIFT-30K', 30000, 30000, 'Tomas Perez', 'tomas.perez@gmail.com', 'Camila Silva', 'cami.silva@uai.cl', 'santuario', '¡Feliz cumpleaños! Disfruta de un momento de relajo.', NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days'),
('VAL-GIFT-50K', 50000, 15000, 'Felipe Castro', 'felipe.castro@outlook.com', 'Andres Vicuña', 'andres.vic@live.cl', 'barberia', 'Para que te consientas con el mejor afeitado tradicional.', NOW() - INTERVAL '10 days', NOW() + INTERVAL '20 days'),
('ALM-GIFT-80K', 80000, 80000, 'Maria Jose Plaza', 'mj.plaza@gmail.com', 'Lucia Rivas', 'lucia.rivas@valentes.cl', 'peluqueria', 'Cambio de look de regalo, ¡te lo mereces!', NOW() - INTERVAL '40 days', NOW() - INTERVAL '10 days'),
('ESS-GIFT-45K', 45000, 0, 'Javiera Montes', 'javiera.montes@gmail.com', 'Mateo Silva', 'mateo@santuario.cl', 'terapias', 'Un respiro para tu bienestar corporal.', NOW() - INTERVAL '15 days', NOW() + INTERVAL '15 days');

-- Time Blocks
INSERT INTO time_blocks (id, specialist_id, date, start_time, end_time, reason, is_recurring) VALUES
('tb_1', 'sb1', TO_CHAR(NOW() + INTERVAL '1 day', 'YYYY-MM-DD'), '10:00', '12:00', 'Permiso Médico', FALSE),
('tb_2', 'sp2', TO_CHAR(NOW() + INTERVAL '2 days', 'YYYY-MM-DD'), '15:00', '17:00', 'Capacitación', FALSE),
('tb_3', 'st2', TO_CHAR(NOW() + INTERVAL '1 day', 'YYYY-MM-DD'), '14:00', '16:00', 'Asunto Personal', FALSE);

-- Work Shifts (12 specialists * 7 days = 84 entries)
-- Helper function or bulk insert to make it clean
-- Mon-Fri (1-5) 09:00 - 18:00 (Break 13:00 - 14:00)
-- Sat (6) 09:00 - 13:00 (No break)
-- Sun (0) inactive
-- Mon-Fri shifts for all
INSERT INTO work_shifts (id, specialist_id, day_of_week, is_active, start_time, end_time, has_break, break_start_time, break_end_time)
SELECT 
  sp.id || '_shift_' || dow AS id,
  sp.id AS specialist_id,
  dow,
  TRUE AS is_active,
  '09:00' AS start_time,
  '18:00' AS end_time,
  TRUE AS has_break,
  '13:00' AS break_start_time,
  '14:00' AS break_end_time
FROM specialists sp, generate_series(1, 5) dow;

-- Sat shifts for all
INSERT INTO work_shifts (id, specialist_id, day_of_week, is_active, start_time, end_time, has_break, break_start_time, break_end_time)
SELECT 
  sp.id || '_shift_6' AS id,
  sp.id AS specialist_id,
  6 AS day_of_week,
  TRUE AS is_active,
  '09:00' AS start_time,
  '13:00' AS end_time,
  FALSE AS has_break,
  '13:00' AS break_start_time,
  '14:00' AS break_end_time
FROM specialists sp;

-- Sun shifts for all
INSERT INTO work_shifts (id, specialist_id, day_of_week, is_active, start_time, end_time, has_break, break_start_time, break_end_time)
SELECT 
  sp.id || '_shift_0' AS id,
  sp.id AS specialist_id,
  0 AS day_of_week,
  FALSE AS is_active,
  '09:00' AS start_time,
  '18:00' AS end_time,
  FALSE AS has_break,
  '13:00' AS break_start_time,
  '14:00' AS break_end_time
FROM specialists sp;

-- Page Content (JSON structures matching defaultContent)
INSERT INTO page_content (key, content) VALUES
('home', '{
  "panel1Title": "Barbería Tradicional",
  "panel1Subtitle": "Cortes de autor, afeitados con navaja libre y rituales de toallas calientes.",
  "panel1Image": "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80",
  "panel2Title": "Peluquería de Autor",
  "panel2Subtitle": "Coloración botánica orgánica, cortes de diseño y nutrición molecular profunda.",
  "panel2Image": "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&q=80",
  "panel3Title": "Terapias Holísticas",
  "panel3Subtitle": "Masajes con piedras calientes volcánicas, reiki y sonoterapia vibracional.",
  "panel3Image": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80"
}'),
('barberia', '{
  "heroTitle": "VALENTES",
  "heroSubtitle": "Barbería",
  "discoverBtn": "Descubrir Rituales",
  "imageCabello": "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80",
  "imageBarba": "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80",
  "imageCompleto": "https://images.unsplash.com/photo-1512864084360-7c0c4d0a0845?auto=format&fit=crop&w=800&q=80",
  "pageTitle": "Barbería Tradicional",
  "pageDescription": "Cortes de autor, afeitados con navaja libre y rituales de toallas calientes diseñados para el caballero contemporáneo en un ambiente de calma absoluta."
}'),
('peluqueria', '{
  "overlayLine1": "ALMA",
  "overlayLine2": "BELA",
  "overlaySubtitle": "STUDIO",
  "pageTitle": "Peluquería de Autor",
  "pageDescription": "Un espacio de empatía, técnica y cuidado donde transformamos vidas. Entendemos que la belleza es mucho más que apariencia: es identidad, expresión, confianza y, sobre todo, tu autoestima.",
  "galleryItems": [
    {
      "id": "g1",
      "title": "Balayage Premium Vainilla",
      "technique": "Balayage tridimensional con difuminado de raíz y matices dorados fríos.",
      "stylist": "Sofia Valente",
      "duration": "3.5 hrs",
      "price": "$65.000",
      "imageUrl": "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80"
    },
    {
      "id": "g2",
      "title": "Ondas Editorial Surf",
      "technique": "Peinado texturizado con ondas desestructuradas y protector térmico orgánico.",
      "stylist": "Valentina Paz",
      "duration": "45 min",
      "price": "$30.000",
      "imageUrl": "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=800&q=80"
    },
    {
      "id": "g3",
      "title": "Corte Shag Moderno",
      "technique": "Corte texturizado en capas desconectadas con flequillo y volumen natural.",
      "stylist": "Andrés Silva",
      "duration": "60 min",
      "price": "$38.000",
      "imageUrl": "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=800&q=80"
    },
    {
      "id": "g4",
      "title": "Tratamiento Seda Celular",
      "technique": "Nutrición molecular profunda con ácido hialurónico y cauterización fría.",
      "stylist": "Lucía Rivas",
      "duration": "60 min",
      "price": "$48.000",
      "imageUrl": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80"
    },
    {
      "id": "g5",
      "title": "Corte Bob Simétrico",
      "technique": "Corte seco de precisión milimétrica adaptado a la forma del mentón.",
      "stylist": "Andrés Silva",
      "duration": "60 min",
      "price": "$38.000",
      "imageUrl": "https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?auto=format&fit=crop&w=800&q=80"
    },
    {
      "id": "g6",
      "title": "Iluminación Babylights Platinada",
      "technique": "Micro-reflejos de alta costura para un efecto aclarado natural ultra fino.",
      "stylist": "Valentina Paz",
      "duration": "3 hrs",
      "price": "$65.000",
      "imageUrl": "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80"
    }
  ]
}'),
('terapias', '{
  "pageTitle": "Terapias Holísticas",
  "pageDescription": "Espacio consagrado a la reconexión cuerpo-mente a través de terapias manuales de relajación profunda, masajes geotermales y sanación energética.",
  "videoUrl": "/videos/massage.mp4"
}');
