/**
 * Helpers para enviar el formulario de registro al backend (Vercel Functions).
 * Ya NO usa Supabase directamente desde el frontend público.
 * Todo va por /api/upload-foto y /api/registro que usan service_role en el servidor.
 */

/**
 * Convierte un File/Blob a base64.
 */
function fileToBase64(file) {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();
    reader.onload = function () {
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Sube una foto vía API y devuelve la URL pública.
 */
export async function uploadFoto(file, folder) {
  if (!file) return null;

  const base64 = await fileToBase64(file);

  const res = await fetch('/api/upload-foto', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileBase64: base64,
      folder: folder,
      contentType: file.type || 'image/jpeg',
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(function () { return {}; });
    throw new Error(errData.error || 'Error subiendo foto');
  }

  const data = await res.json();
  return data.url;
}

/**
 * Envía la solicitud completa al backend.
 * El backend hace TODO: subir registro, ubicaciones, mandar correos.
 */
export async function enviarSolicitud(payload) {
  const res = await fetch('/api/registro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = await res.json().catch(function () { return {}; });
    throw new Error(errData.error || 'Error al enviar la solicitud');
  }

  return await res.json();
}
