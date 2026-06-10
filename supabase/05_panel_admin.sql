-- ============================================================
-- BLOQUE 4: Panel administrativo
-- ============================================================
-- Tabla admins + audit log
-- ============================================================

-- Tabla de administradores
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  nombre TEXT,
  nivel TEXT NOT NULL DEFAULT 'admin' CHECK (nivel IN ('admin', 'super_admin')),
  activo BOOLEAN DEFAULT true,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_admins_auth_user_id ON admins(auth_user_id);

-- Audit log
DROP TABLE IF EXISTS audit_log CASCADE;
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_email TEXT NOT NULL,
  accion TEXT NOT NULL,
  entidad TEXT,
  entidad_id UUID,
  detalles JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);

-- Habilitar RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: solo authenticated admins pueden leer admins
DROP POLICY IF EXISTS "Admins read self" ON admins;
CREATE POLICY "Admins read self"
  ON admins FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins a
      WHERE LOWER(a.email) = LOWER(auth.jwt() ->> 'email')
        AND a.activo = true
    )
  );

-- Policy audit_log: solo super_admin lee
DROP POLICY IF EXISTS "Super admin read audit" ON audit_log;
CREATE POLICY "Super admin read audit"
  ON audit_log FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins a
      WHERE LOWER(a.email) = LOWER(auth.jwt() ->> 'email')
        AND a.nivel = 'super_admin'
        AND a.activo = true
    )
  );

-- Policy: admins authenticated pueden leer profesionales en cualquier status
DROP POLICY IF EXISTS "Admins read all profesionales" ON profesionales;
CREATE POLICY "Admins read all profesionales"
  ON profesionales FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins a
      WHERE LOWER(a.email) = LOWER(auth.jwt() ->> 'email')
        AND a.activo = true
    )
  );

DROP POLICY IF EXISTS "Admins read all ubicaciones" ON ubicaciones;
CREATE POLICY "Admins read all ubicaciones"
  ON ubicaciones FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins a
      WHERE LOWER(a.email) = LOWER(auth.jwt() ->> 'email')
        AND a.activo = true
    )
  );

SELECT 'Panel admin schema aplicado' AS resultado;
