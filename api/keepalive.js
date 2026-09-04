/**
 * GET /api/keepalive
 *
 * Mantiene ACTIVO el proyecto de Supabase (plan Free).
 *
 * Por qué existe: Supabase pausa automáticamente los proyectos gratuitos que
 * tienen poca actividad en la base de datos durante 7 días. Si el sitio tiene
 * pocas visitas una semana, el directorio se caería (mapa vacío, registro roto)
 * hasta que alguien entre al dashboard de Supabase a reactivarlo.
 *
 * Qué hace: ejecuta varias consultas de SOLO LECTURA (conteos), suficientes
 * para que Supabase registre actividad. No escribe, no borra, no modifica nada.
 *
 * Quién lo llama: el cron de Vercel configurado en vercel.json, una vez al día.
 * También se puede abrir manualmente en el navegador para verificar que todo
 * está vivo: https://directorio-inbody.vercel.app/api/keepalive
 *
 * Seguridad: si en Vercel existe la variable de entorno CRON_SECRET, el endpoint
 * exige el header "Authorization: Bearer <CRON_SECRET>" (Vercel lo manda solo).
 * Si no existe la variable, el endpoint es público, lo cual es aceptable porque
 * únicamente devuelve conteos y no expone datos personales.
 */
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.authorization || '';
    if (auth !== 'Bearer ' + cronSecret) {
      return res.status(401).json({ ok: false, error: 'No autorizado' });
    }
  }

  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return res.status(500).json({ ok: false, error: 'Faltan variables de entorno de Supabase' });
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    // Varias consultas de lectura para generar actividad real en la BD.
    // { count: 'exact', head: true } = solo cuenta filas, no descarga datos.
    const [total, aprobados, pendientes, ubicaciones, admins, audit] = await Promise.all([
      supabase.from('profesionales').select('id', { count: 'exact', head: true }),
      supabase.from('profesionales').select('id', { count: 'exact', head: true }).eq('status', 'aprobado'),
      supabase.from('profesionales').select('id', { count: 'exact', head: true }).eq('status', 'pendiente'),
      supabase.from('ubicaciones').select('id', { count: 'exact', head: true }),
      supabase.from('admins').select('id', { count: 'exact', head: true }),
      supabase.from('audit_log').select('id', { count: 'exact', head: true }),
    ]);

    const errores = [total, aprobados, pendientes, ubicaciones, admins, audit]
      .map(function (r) { return r.error ? r.error.message : null; })
      .filter(Boolean);

    if (errores.length > 0) {
      return res.status(500).json({ ok: false, error: errores.join(' | ') });
    }

    return res.status(200).json({
      ok: true,
      version: 'v6-aviso-4sep2026',
      mensaje: 'Supabase activo',
      fecha: new Date().toISOString(),
      conteos: {
        profesionales_total: total.count,
        profesionales_aprobados: aprobados.count,
        profesionales_pendientes: pendientes.count,
        ubicaciones: ubicaciones.count,
        administradores: admins.count,
        registros_audit_log: audit.count,
      },
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message || 'Error inesperado' });
  }
}
