-- ============================================================
-- BLOQUE 3: Preparar schema para formulario de registro
-- ============================================================
-- Ejecutar este script en Supabase SQL Editor.
-- Solo agrega lo que falta, no toca lo que ya funciona.
-- ============================================================

-- 1. Asegurar que la columna codigo_postal existe en ubicaciones
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ubicaciones' AND column_name = 'codigo_postal'
  ) THEN
    ALTER TABLE ubicaciones ADD COLUMN codigo_postal TEXT;
  END IF;
END $$;

-- 2. Agregar columna telefono_obligatorio si no existe (ya era obligatorio en schema original)
-- (ya existe, solo confirmamos)

-- 3. Asegurar que el público puede insertar ubicaciones nuevas
-- (la policy ya existe del schema original pero la recreamos por seguridad)
DROP POLICY IF EXISTS "publico_inserta_ubicaciones" ON ubicaciones;
CREATE POLICY "publico_inserta_ubicaciones"
  ON ubicaciones FOR INSERT
  WITH CHECK (TRUE);

-- 4. Storage: políticas más permisivas para uploads del formulario
-- (ya existen del schema original, pero las refinamos)
DROP POLICY IF EXISTS "publico_sube_fotos" ON storage.objects;
CREATE POLICY "publico_sube_fotos_formulario"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'directorio-fotos'
    AND (storage.foldername(name))[1] IN ('perfil', 'equipo', 'lugar')
  );

DROP POLICY IF EXISTS "publico_lee_fotos" ON storage.objects;
CREATE POLICY "publico_lee_fotos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'directorio-fotos');

-- 5. Asegurar que la columna sitio_web acepta URLs largas
-- (ya es TEXT, solo confirmamos)

-- 6. Agregar índice para búsqueda rápida por email (validación de duplicados)
CREATE INDEX IF NOT EXISTS idx_profesionales_email ON profesionales(lower(email));

-- 7. Agregar columna para tracking de IP (rate limiting)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profesionales' AND column_name = 'submit_ip'
  ) THEN
    ALTER TABLE profesionales ADD COLUMN submit_ip TEXT;
  END IF;
END $$;

-- ============================================================
-- FIN
-- ============================================================
-- Verifica con: SELECT column_name FROM information_schema.columns WHERE table_name = 'profesionales';
-- ============================================================
