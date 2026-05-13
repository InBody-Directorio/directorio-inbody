/**
 * POST /api/upload-foto
 *
 * Recibe un archivo base64 y lo sube a Supabase Storage en el bucket directorio-fotos.
 * Usa SERVICE_ROLE para bypassar RLS de Storage.
 */
import { createClient } from '@supabase/supabase-js';

// Vercel: límite de payload aumentado (default es 4.5MB, queremos 6MB para fotos)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '8mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { fileBase64, folder, contentType } = req.body;

    if (!fileBase64 || !folder) {
      return res.status(400).json({ error: 'Faltan parámetros' });
    }

    if (!['perfil', 'equipo', 'lugar'].includes(folder)) {
      return res.status(400).json({ error: 'Carpeta no válida' });
    }

    // Decodificar base64
    const base64Data = fileBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Validar tamaño máximo (6MB después de decodificar)
    if (buffer.length > 6 * 1024 * 1024) {
      return res.status(400).json({ error: 'Archivo muy grande (máx 6MB)' });
    }

    const supabaseAdmin = createClient(
      process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const ext = contentType && contentType.includes('png') ? 'png' :
                contentType && contentType.includes('webp') ? 'webp' : 'jpg';
    const filename = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: upErr } = await supabaseAdmin.storage
      .from('directorio-fotos')
      .upload(filename, buffer, {
        contentType: contentType || 'image/jpeg',
        cacheControl: '3600',
        upsert: false,
      });

    if (upErr) {
      console.error('Error upload:', upErr);
      return res.status(500).json({ error: 'Error subiendo foto: ' + upErr.message });
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('directorio-fotos')
      .getPublicUrl(filename);

    return res.status(200).json({ ok: true, url: publicUrl });
  } catch (err) {
    console.error('Error en /api/upload-foto:', err);
    return res.status(500).json({ error: err.message });
  }
}
