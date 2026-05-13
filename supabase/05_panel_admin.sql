-- ============================================================
-- BLOQUE 4: Panel Administrativo
-- ============================================================
-- Este script crea:
-- 1. Tabla `admins` con niveles (super_admin, admin)
-- 2. Tabla `audit_log` para tracking de acciones
-- 3. Columnas en profesionales: motivo_rechazo, rechazado_por, aprobado_por
-- 4. Seed de los 2 admins iniciales
-- 5. Reactivar RLS con arquitectura segura
-- ============================================================

-- ============================================================
-- TABLA: admins
-- ============================================================
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  nombre TEXT,
  nivel TEXT NOT NULL DEFAULT 'admin' CHECK (nivel IN ('super_admin', 'admin')),
  activo BOOLEAN DEFAULT TRUE,
  ultimo_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(lower(email));

-- ============================================================
-- TABLA: audit_log (registro de acciones de admins)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email TEXT NOT NULL,
  accion TEXT NOT NULL,
  entidad TEXT,
  entidad_id UUID,
  detalles JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_admin ON audit_log(admin_email);
CREATE INDEX IF NOT EXISTS idx_audit_log_entidad ON audit_log(entidad, entidad_id);

-- ============================================================
-- COLUMNAS ADICIONALES EN profesionales
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profesionales' AND column_name='motivo_rechazo') THEN
    ALTER TABLE profesionales ADD COLUMN motivo_rechazo TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profesionales' AND column_name='aprobado_por') THEN
    ALTER TABLE profesionales ADD COLUMN aprobado_por TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profesionales' AND column_name='rechazado_por') THEN
    ALTER TABLE profesionales ADD COLUMN rechazado_por TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profesionales' AND column_name='aprobado_at') THEN
    ALTER TABLE profesionales ADD COLUMN aprobado_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profesionales' AND column_name='rechazado_at') THEN
    ALTER TABLE profesionales ADD COLUMN rechazado_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profesionales' AND column_name='notas_admin') THEN
    ALTER TABLE profesionales ADD COLUMN notas_admin TEXT;
  END IF;
END $$;

-- ============================================================
-- SEED: admins iniciales
-- ============================================================
INSERT INTO admins (email, nombre, nivel) VALUES
  ('directorioinbody@gmail.com', 'Equipo InBody México', 'super_admin'),
  ('rodrigo@marketinglab.mx', 'Rodrigo Vázquez (MKT LAB)', 'super_admin')
ON CONFLICT (email) DO UPDATE SET
  nivel = EXCLUDED.nivel,
  activo = TRUE;

-- ============================================================
-- REACTIVAR RLS CON ARQUITECTURA SEGURA
-- ============================================================
-- IMPORTANTE: el formulario público ahora usa SERVICE_ROLE desde Vercel Function,
-- así que el rol 'anon' SOLO necesita permisos de SELECT en profesionales aprobados.
-- ============================================================

ALTER TABLE profesionales ENABLE ROW LEVEL SECURITY;
ALTER TABLE ubicaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Limpiar policies viejas
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname, tablename FROM pg_policies
    WHERE schemaname='public'
    AND tablename IN ('profesionales','ubicaciones','admins','audit_log')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- ===== profesionales =====
-- Público (anon): SOLO puede leer aprobados
CREATE POLICY "prof_anon_lee_aprobados"
  ON profesionales FOR SELECT
  TO anon
  USING (status = 'aprobado');

-- Autenticados (admins logueados): pueden ver todo
CREATE POLICY "prof_auth_lee_todo"
  ON profesionales FOR SELECT
  TO authenticated
  USING (true);

-- Autenticados: pueden actualizar (aprobar, rechazar, editar)
CREATE POLICY "prof_auth_actualiza"
  ON profesionales FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

-- Autenticados: pueden insertar (cuando agreguen profesional manualmente desde admin)
CREATE POLICY "prof_auth_inserta"
  ON profesionales FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Autenticados: pueden eliminar
CREATE POLICY "prof_auth_elimina"
  ON profesionales FOR DELETE
  TO authenticated
  USING (true);

-- NOTA: anon NO puede insertar. El INSERT se hace via service_role desde Vercel Function.

-- ===== ubicaciones =====
CREATE POLICY "ubic_anon_lee_aprobadas"
  ON ubicaciones FOR SELECT
  TO anon
  USING (
    activa = TRUE AND
    EXISTS (
      SELECT 1 FROM profesionales
      WHERE profesionales.id = ubicaciones.profesional_id
      AND profesionales.status = 'aprobado'
    )
  );

CREATE POLICY "ubic_auth_lee_todo"
  ON ubicaciones FOR SELECT TO authenticated USING (true);

CREATE POLICY "ubic_auth_inserta"
  ON ubicaciones FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "ubic_auth_actualiza"
  ON ubicaciones FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "ubic_auth_elimina"
  ON ubicaciones FOR DELETE TO authenticated USING (true);

-- ===== admins =====
-- Solo autenticados pueden leer la tabla admins
CREATE POLICY "admins_auth_lee"
  ON admins FOR SELECT TO authenticated USING (true);

-- Solo autenticados pueden modificar admins (se valida nivel super_admin a nivel app)
CREATE POLICY "admins_auth_inserta"
  ON admins FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "admins_auth_actualiza"
  ON admins FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "admins_auth_elimina"
  ON admins FOR DELETE TO authenticated USING (true);

-- ===== audit_log =====
CREATE POLICY "audit_auth_lee"
  ON audit_log FOR SELECT TO authenticated USING (true);

CREATE POLICY "audit_auth_inserta"
  ON audit_log FOR INSERT TO authenticated WITH CHECK (true);

-- ===== storage =====
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects'
    AND (policyname LIKE '%directorio%' OR policyname LIKE '%publico%' OR policyname LIKE '%storage_%')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "storage_anon_lee"
  ON storage.objects FOR SELECT TO anon
  USING (bucket_id = 'directorio-fotos');

CREATE POLICY "storage_auth_lee"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'directorio-fotos');

CREATE POLICY "storage_auth_actualiza"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'directorio-fotos') WITH CHECK (bucket_id = 'directorio-fotos');

CREATE POLICY "storage_auth_elimina"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'directorio-fotos');

-- NOTA: el INSERT a storage lo hace el Vercel Function con service_role.

-- ============================================================
-- VERIFICACIÓN
-- ============================================================
SELECT 'Admins creados:' AS info, COUNT(*) AS total FROM admins;
SELECT 'Policies activas en profesionales:' AS info, COUNT(*) AS total FROM pg_policies WHERE tablename='profesionales';
