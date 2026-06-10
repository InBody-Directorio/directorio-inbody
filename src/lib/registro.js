import imageCompression from 'browser-image-compression';

const API_BASE = '';

/**
 * Comprime una foto y la sube a Supabase Storage via API.
 * Devuelve la URL pública.
 */
export async function uploadFoto(file, tipo) {
  if (!file) return null;

  // Comprimir imagen antes de subir
  const compressOptions = {
    maxSizeMB: 1.5,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    fileType: 'image/jpeg',
  };

  let compressed;
  try {
    compressed = await imageCompression(file, compressOptions);
  } catch (err) {
    console.error('Error comprimiendo, usando original:', err);
    compressed = file;
  }

  const formData = new FormData();
  formData.append('file', compressed);
  formData.append('tipo', tipo || 'general');

  const res = await fetch(API_BASE + '/api/upload-foto', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(function () { return { error: 'Error al subir' }; });
    throw new Error(err.error || 'Error al subir la foto');
  }

  const data = await res.json();
  return data.url;
}

/**
 * Envía la solicitud completa al backend (Vercel Function).
 */
export async function enviarSolicitud(payload) {
  const res = await fetch(API_BASE + '/api/registro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(function () { return { error: 'Error al enviar' }; });
    throw new Error(err.error || 'Error al enviar la solicitud');
  }

  return res.json();
}
