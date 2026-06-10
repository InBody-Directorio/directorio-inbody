/**
 * POST /api/upload-foto
 * Sube una imagen a Supabase Storage usando SERVICE_ROLE.
 * Devuelve URL pública.
 */
import { createClient } from '@supabase/supabase-js';

export const config = {
  api: {
    bodyParser: false,
    sizeLimit: '15mb',
  },
};

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function parseMultipart(req) {
  const contentType = req.headers['content-type'] || '';
  const boundaryMatch = contentType.match(/boundary=(.+)$/);
  if (!boundaryMatch) throw new Error('Content-Type sin boundary');
  const boundary = '--' + boundaryMatch[1];

  const buffer = await streamToBuffer(req);
  const text = buffer.toString('binary');
  const parts = text.split(boundary);

  const result = { fields: {}, file: null };

  for (const part of parts) {
    if (!part || part === '--\r\n' || part.trim() === '--') continue;
    const headerEnd = part.indexOf('\r\n\r\n');
    if (headerEnd === -1) continue;

    const headers = part.substring(0, headerEnd);
    const body = part.substring(headerEnd + 4, part.lastIndexOf('\r\n'));

    const nameMatch = headers.match(/name="([^"]+)"/);
    const filenameMatch = headers.match(/filename="([^"]+)"/);
    const ctMatch = headers.match(/Content-Type:\s*(.+)/);

    if (!nameMatch) continue;
    const name = nameMatch[1];

    if (filenameMatch) {
      result.file = {
        filename: filenameMatch[1],
        contentType: ctMatch ? ctMatch[1].trim() : 'application/octet-stream',
        data: Buffer.from(body, 'binary'),
      };
    } else {
      result.fields[name] = body;
    }
  }

  return result;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { fields, file } = await parseMultipart(req);
    if (!file) return res.status(400).json({ error: 'No se envió archivo' });

    if (!file.contentType.startsWith('image/')) {
      return res.status(400).json({ error: 'Solo se permiten imágenes' });
    }

    if (file.data.length > 12 * 1024 * 1024) {
      return res.status(400).json({ error: 'La imagen excede 12 MB' });
    }

    const tipo = fields.tipo || 'general';
    const ext = (file.filename.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
    const safeExt = ['jpg', 'jpeg', 'png', 'webp'].indexOf(ext) !== -1 ? ext : 'jpg';
    const filename = tipo + '/' + Date.now() + '-' + Math.random().toString(36).slice(2, 10) + '.' + safeExt;

    const supabaseAdmin = createClient(
      process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { error: uploadErr } = await supabaseAdmin.storage
      .from('directorio-fotos')
      .upload(filename, file.data, {
        contentType: file.contentType,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadErr) {
      console.error('Error upload:', uploadErr);
      return res.status(500).json({ error: 'Error al subir: ' + uploadErr.message });
    }

    const { data: urlData } = supabaseAdmin.storage.from('directorio-fotos').getPublicUrl(filename);

    return res.status(200).json({ url: urlData.publicUrl });
  } catch (err) {
    console.error('Error /api/upload-foto:', err);
    return res.status(500).json({ error: err.message });
  }
}
