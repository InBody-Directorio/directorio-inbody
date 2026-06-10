-- ============================================================
-- TANDA 1: Cambios estructurales
-- ============================================================
-- 1. Agregar campo numero_serie (obligatorio para nuevos registros)
-- 2. NO migra especialidades viejas (los 3 pendientes reales quedan intactos)
-- ============================================================

-- Agregar columna numero_serie (nullable para no romper los 3 registros reales existentes)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profesionales' AND column_name = 'numero_serie'
  ) THEN
    ALTER TABLE profesionales ADD COLUMN numero_serie TEXT;
  END IF;
END $$;

-- Comentario en la columna para documentar
COMMENT ON COLUMN profesionales.numero_serie IS 'Número de serie del equipo InBody. Obligatorio en registros nuevos, opcional en los anteriores.';

-- Verificación
SELECT 'Tanda 1 aplicada' AS resultado, COUNT(*) AS profesionales_existentes FROM profesionales;
