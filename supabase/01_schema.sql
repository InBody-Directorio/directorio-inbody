-- ============================================================
-- BLOQUE 1: Schema inicial del directorio
-- ============================================================

-- Extensión para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de profesionales
CREATE TABLE IF NOT EXISTS profesionales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  especialidad TEXT NOT NULL,
  descripcion_breve TEXT,
  foto_perfil_url TEXT,
  foto_equipo_url TEXT,
  email TEXT NOT NULL,
  telefono TEXT,
  whatsapp TEXT,
  sitio_web TEXT,
  instagram TEXT,
  facebook TEXT,
  modelo_inbody TEXT,
  consentimiento_privacidad BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'aprobado', 'rechazado')),
  aprobado_por TEXT,
  aprobado_at TIMESTAMPTZ,
  rechazado_por TEXT,
  rechazado_at TIMESTAMPTZ,
  motivo_rechazo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de ubicaciones (1:N con profesionales)
CREATE TABLE IF NOT EXISTS ubicaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profesional_id UUID NOT NULL REFERENCES profesionales(id) ON DELETE CASCADE,
  direccion_completa TEXT NOT NULL,
  ciudad TEXT,
  estado TEXT,
  codigo_postal TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  es_principal BOOLEAN DEFAULT false,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices útiles
CREATE INDEX IF NOT EXISTS idx_profesionales_status ON profesionales(status);
CREATE INDEX IF NOT EXISTS idx_profesionales_email ON profesionales(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_ubicaciones_profesional ON ubicaciones(profesional_id);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profesionales_updated_at ON profesionales;
CREATE TRIGGER trg_profesionales_updated_at
BEFORE UPDATE ON profesionales
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Habilitar RLS
ALTER TABLE profesionales ENABLE ROW LEVEL SECURITY;
ALTER TABLE ubicaciones ENABLE ROW LEVEL SECURITY;

-- Policy: lectura pública SOLO para aprobados
DROP POLICY IF EXISTS "Public read aprobados profesionales" ON profesionales;
CREATE POLICY "Public read aprobados profesionales"
  ON profesionales FOR SELECT TO anon, authenticated
  USING (status = 'aprobado');

DROP POLICY IF EXISTS "Public read aprobados ubicaciones" ON ubicaciones;
CREATE POLICY "Public read aprobados ubicaciones"
  ON ubicaciones FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM profesionales p
    WHERE p.id = ubicaciones.profesional_id AND p.status = 'aprobado'
  ));

-- Storage bucket para fotos (crear desde Supabase Dashboard si no existe)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('directorio-fotos', 'directorio-fotos', true, 12582912)
ON CONFLICT (id) DO NOTHING;

SELECT 'Schema inicial aplicado' AS resultado;
