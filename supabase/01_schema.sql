-- ============================================================
-- DIRECTORIO INBODY MÉXICO · SCHEMA INICIAL
-- ============================================================
-- Versión: 1.0
-- Fecha: Mayo 2026
-- Ejecutar este script completo en Supabase SQL Editor.
-- ============================================================


-- ============================================================
-- 1. TABLAS PRINCIPALES
-- ============================================================

-- Tabla de profesionales (el doctor, clínica o gimnasio).
-- Aquí va info que NO depende de ubicación (puede tener varias).
CREATE TABLE IF NOT EXISTS profesionales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identidad
  nombre TEXT NOT NULL,
  especialidad TEXT NOT NULL,
  descripcion_breve TEXT,
  foto_perfil_url TEXT,

  -- Contacto
  email TEXT NOT NULL,
  telefono TEXT,
  whatsapp TEXT NOT NULL,
  sitio_web TEXT,
  instagram TEXT,
  facebook TEXT,
  tiktok TEXT,

  -- Equipo InBody (lo que poseen)
  modelo_inbody TEXT NOT NULL,
  foto_equipo_url TEXT,

  -- Estado del registro
  status TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (status IN ('pendiente', 'aprobado', 'rechazado', 'correccion_solicitada')),
  motivo_rechazo TEXT,
  notas_admin TEXT,
  consentimiento_privacidad BOOLEAN NOT NULL DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_profesionales_status ON profesionales(status);
CREATE INDEX IF NOT EXISTS idx_profesionales_especialidad ON profesionales(especialidad);
CREATE INDEX IF NOT EXISTS idx_profesionales_modelo ON profesionales(modelo_inbody);


-- Tabla de ubicaciones (un profesional puede tener varias sucursales).
CREATE TABLE IF NOT EXISTS ubicaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profesional_id UUID NOT NULL REFERENCES profesionales(id) ON DELETE CASCADE,

  -- Datos de la ubicación
  nombre_sucursal TEXT,
  direccion_completa TEXT NOT NULL,
  ciudad TEXT NOT NULL,
  estado TEXT NOT NULL,
  codigo_postal TEXT,

  -- Geocodificación
  lat NUMERIC(10, 7),
  lng NUMERIC(10, 7),

  -- Horarios (jsonb para flexibilidad)
  horarios JSONB,

  -- Foto del lugar (opcional, fotos del consultorio)
  foto_lugar_url TEXT,

  -- Metadata
  es_principal BOOLEAN DEFAULT FALSE,
  activa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ubicaciones_profesional ON ubicaciones(profesional_id);
CREATE INDEX IF NOT EXISTS idx_ubicaciones_estado ON ubicaciones(estado);
CREATE INDEX IF NOT EXISTS idx_ubicaciones_coords ON ubicaciones(lat, lng);


-- Tabla de logs de auditoría (quién hizo qué).
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profesional_id UUID REFERENCES profesionales(id) ON DELETE SET NULL,
  user_id UUID,
  user_email TEXT,
  accion TEXT NOT NULL,
  detalle JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_profesional ON audit_log(profesional_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at DESC);


-- ============================================================
-- 2. ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE profesionales ENABLE ROW LEVEL SECURITY;
ALTER TABLE ubicaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Política: cualquiera puede LEER profesionales aprobados (directorio público)
CREATE POLICY "publico_lee_profesionales_aprobados"
  ON profesionales FOR SELECT
  USING (status = 'aprobado');

-- Política: cualquiera puede LEER ubicaciones de profesionales aprobados
CREATE POLICY "publico_lee_ubicaciones_aprobadas"
  ON ubicaciones FOR SELECT
  USING (
    activa = TRUE AND
    EXISTS (SELECT 1 FROM profesionales WHERE id = ubicaciones.profesional_id AND status = 'aprobado')
  );

-- Política: cualquiera puede INSERTAR profesionales (formulario público) con status pendiente
CREATE POLICY "publico_inserta_profesionales"
  ON profesionales FOR INSERT
  WITH CHECK (status = 'pendiente');

-- Política: cualquiera puede INSERTAR ubicaciones (parte del registro)
CREATE POLICY "publico_inserta_ubicaciones"
  ON ubicaciones FOR INSERT
  WITH CHECK (TRUE);

-- Política: solo usuarios autenticados (Aza) pueden ACTUALIZAR profesionales
CREATE POLICY "admin_actualiza_profesionales"
  ON profesionales FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Política: solo usuarios autenticados pueden ACTUALIZAR ubicaciones
CREATE POLICY "admin_actualiza_ubicaciones"
  ON ubicaciones FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Política: solo usuarios autenticados pueden LEER todo (admin necesita ver pendientes y rechazados)
CREATE POLICY "admin_lee_todo_profesionales"
  ON profesionales FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "admin_lee_todo_ubicaciones"
  ON ubicaciones FOR SELECT
  USING (auth.role() = 'authenticated');

-- Política: solo usuarios autenticados pueden ver audit log
CREATE POLICY "admin_lee_audit"
  ON audit_log FOR SELECT
  USING (auth.role() = 'authenticated');

-- Política: solo usuarios autenticados pueden insertar audit
CREATE POLICY "admin_inserta_audit"
  ON audit_log FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');


-- ============================================================
-- 3. STORAGE BUCKETS (para fotos)
-- ============================================================

-- Bucket público de fotos del directorio (perfil, equipo, lugar).
-- Las fotos las suben desde el formulario y se muestran en el mapa.
INSERT INTO storage.buckets (id, name, public)
VALUES ('directorio-fotos', 'directorio-fotos', true)
ON CONFLICT (id) DO NOTHING;

-- Política: cualquiera puede subir fotos al bucket (en el formulario)
CREATE POLICY "publico_sube_fotos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'directorio-fotos');

-- Política: cualquiera puede leer fotos del bucket
CREATE POLICY "publico_lee_fotos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'directorio-fotos');


-- ============================================================
-- 4. FUNCIONES Y TRIGGERS
-- ============================================================

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_profesionales_updated
  BEFORE UPDATE ON profesionales
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER tr_ubicaciones_updated
  BEFORE UPDATE ON ubicaciones
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();


-- ============================================================
-- 5. SEED DATA (doctores ficticios para desarrollo)
-- ============================================================
-- Estos son 8 profesionales ficticios distribuidos en México para
-- que durante el desarrollo se vea el mapa lleno de pines.
-- Cuando se lance el directorio real, estos se borran o se editan.

INSERT INTO profesionales (nombre, especialidad, descripcion_breve, email, whatsapp, telefono, modelo_inbody, status, consentimiento_privacidad, approved_at)
VALUES
  ('Dra. María Hernández', 'nutricion', 'Especialista en nutrición clínica y deportiva con 10 años de experiencia.', 'maria@ejemplo.com', '5551234567', '5551234567', 'inbody-770', 'aprobado', true, NOW()),
  ('Centro Wellness Polanco', 'clinica-hospital', 'Clínica multidisciplinaria especializada en composición corporal y bienestar integral.', 'contacto@ejemplo.com', '5552345678', '5552345678', 'inbody-970', 'aprobado', true, NOW()),
  ('Dr. Carlos Mendoza', 'medicina-deportiva', 'Médico del deporte con experiencia en atletas olímpicos y de alto rendimiento.', 'carlos@ejemplo.com', '3331234567', '3331234567', 'inbody-770', 'aprobado', true, NOW()),
  ('Fit Lab Guadalajara', 'gimnasio', 'Gimnasio boutique con evaluación profesional de composición corporal.', 'info@ejemplo.com', '3332345678', '3332345678', 'inbody-570', 'aprobado', true, NOW()),
  ('Dra. Ana Sandoval', 'endocrinologia', 'Endocrinóloga con enfoque en obesidad, diabetes y trastornos metabólicos.', 'ana@ejemplo.com', '8181234567', '8181234567', 'inbody-770s', 'aprobado', true, NOW()),
  ('Spa Vita Querétaro', 'estetica-corporal', 'Spa especializado en tratamientos corporales con evaluación InBody previa.', 'reservas@ejemplo.com', '4421234567', '4421234567', 'inbody-270', 'aprobado', true, NOW()),
  ('Dr. Roberto López', 'bariatria-gastro', 'Cirujano bariatra y gastroenterólogo. Seguimiento integral pre y post operatorio.', 'roberto@ejemplo.com', '9981234567', '9981234567', 'inbody-970s', 'aprobado', true, NOW()),
  ('Lic. Patricia Ramos', 'fisioterapia', 'Fisioterapeuta especializada en rehabilitación deportiva y manejo del dolor crónico.', 'patricia@ejemplo.com', '2221234567', '2221234567', 'inbody-370', 'aprobado', true, NOW());

-- Ubicaciones para los profesionales ficticios
INSERT INTO ubicaciones (profesional_id, direccion_completa, ciudad, estado, lat, lng, es_principal)
SELECT id, 'Av. Insurgentes Sur 1234, Del Valle', 'Ciudad de México', 'Ciudad de México', 19.3754, -99.1717, true FROM profesionales WHERE email = 'maria@ejemplo.com';

INSERT INTO ubicaciones (profesional_id, direccion_completa, ciudad, estado, lat, lng, es_principal)
SELECT id, 'Av. Presidente Masaryk 250, Polanco', 'Ciudad de México', 'Ciudad de México', 19.4326, -99.1937, true FROM profesionales WHERE email = 'contacto@ejemplo.com';

INSERT INTO ubicaciones (profesional_id, direccion_completa, ciudad, estado, lat, lng, es_principal)
SELECT id, 'Av. Vallarta 3233, Vallarta Poniente', 'Guadalajara', 'Jalisco', 20.6736, -103.4054, true FROM profesionales WHERE email = 'carlos@ejemplo.com';

INSERT INTO ubicaciones (profesional_id, direccion_completa, ciudad, estado, lat, lng, es_principal)
SELECT id, 'Av. Patria 1845, Puerta de Hierro', 'Zapopan', 'Jalisco', 20.7045, -103.4218, true FROM profesionales WHERE email = 'info@ejemplo.com';

INSERT INTO ubicaciones (profesional_id, direccion_completa, ciudad, estado, lat, lng, es_principal)
SELECT id, 'Av. Constitución 444, Centro', 'Monterrey', 'Nuevo León', 25.6691, -100.3104, true FROM profesionales WHERE email = 'ana@ejemplo.com';

INSERT INTO ubicaciones (profesional_id, direccion_completa, ciudad, estado, lat, lng, es_principal)
SELECT id, 'Blvd. Bernardo Quintana 567, Centro Sur', 'Querétaro', 'Querétaro', 20.5888, -100.3899, true FROM profesionales WHERE email = 'reservas@ejemplo.com';

INSERT INTO ubicaciones (profesional_id, direccion_completa, ciudad, estado, lat, lng, es_principal)
SELECT id, 'Av. Bonampak 89, Zona Hotelera', 'Cancún', 'Quintana Roo', 21.1389, -86.8268, true FROM profesionales WHERE email = 'roberto@ejemplo.com';

INSERT INTO ubicaciones (profesional_id, direccion_completa, ciudad, estado, lat, lng, es_principal)
SELECT id, 'Blvd. Atlixco 4308, La Paz', 'Puebla', 'Puebla', 19.0413, -98.2062, true FROM profesionales WHERE email = 'patricia@ejemplo.com';


-- ============================================================
-- FIN DEL SCHEMA
-- ============================================================
-- Si todo se ejecutó sin errores:
-- 1. Verifica en Table Editor que veas 'profesionales', 'ubicaciones', 'audit_log'
-- 2. Verifica en Storage que veas el bucket 'directorio-fotos'
-- 3. Abre el sitio en Vercel y debe decir "8 profesionales en BD"
-- ============================================================
