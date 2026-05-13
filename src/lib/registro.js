import { supabase } from './supabase.js';

/**
 * Sube un archivo (File/Blob) a Supabase Storage en el bucket directorio-fotos.
 * Lo organiza por carpetas: perfil/, equipo/, lugar/
 *
 * @param {File} file
 * @param {string} folder - 'perfil' | 'equipo' | 'lugar'
 * @returns {Promise<string>} URL pública del archivo
 */
export async function uploadFoto(file, folder) {
  if (!file) return null;

  const ext = (file.name && file.name.split('.').pop()) || 'jpg';
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  const filename = `${folder}/${timestamp}_${random}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('directorio-fotos')
    .upload(filename, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'image/jpeg',
    });

  if (uploadError) throw new Error('Error al subir foto: ' + uploadError.message);

  const { data: publicUrlData } = supabase.storage
    .from('directorio-fotos')
    .getPublicUrl(filename);

  return publicUrlData.publicUrl;
}

/**
 * Verifica si ya existe un registro con el mismo email.
 *
 * @param {string} email
 * @returns {Promise<boolean>}
 */
export async function checkEmailDuplicado(email) {
  if (!email) return false;
  const { data, error } = await supabase
    .from('profesionales')
    .select('id')
    .ilike('email', email)
    .limit(1);

  if (error) {
    console.error('Error verificando duplicado:', error);
    return false;
  }
  return data && data.length > 0;
}

/**
 * Crea el registro completo del profesional + sus ubicaciones en Supabase.
 *
 * @param {Object} payload
 * @returns {Promise<{profesionalId, fotoPerfilUrl, fotoEquipoUrl, ubicaciones}>}
 */
export async function crearRegistro(payload) {
  // 1. Subir fotos primero
  const fotoPerfilUrl = payload.foto_perfil
    ? await uploadFoto(payload.foto_perfil, 'perfil')
    : null;

  const fotoEquipoUrl = payload.foto_equipo
    ? await uploadFoto(payload.foto_equipo, 'equipo')
    : null;

  // 2. Crear el profesional con status='pendiente'
  const { data: profesional, error: profError } = await supabase
    .from('profesionales')
    .insert({
      nombre: payload.nombre,
      especialidad: payload.especialidad,
      descripcion_breve: payload.descripcion_breve || null,
      foto_perfil_url: fotoPerfilUrl,
      foto_equipo_url: fotoEquipoUrl,
      email: payload.email,
      telefono: payload.telefono,
      whatsapp: payload.whatsapp,
      sitio_web: payload.sitio_web || null,
      instagram: payload.instagram || null,
      facebook: payload.facebook || null,
      modelo_inbody: payload.modelo_inbody,
      consentimiento_privacidad: !!payload.consentimiento_privacidad,
      status: 'pendiente',
    })
    .select('id')
    .single();

  if (profError) throw new Error('Error creando profesional: ' + profError.message);

  // 3. Crear las ubicaciones
  const ubicacionesPayload = (payload.ubicaciones || []).map(function (u, idx) {
    return {
      profesional_id: profesional.id,
      direccion_completa: u.direccion_completa,
      ciudad: u.ciudad,
      estado: u.estado,
      codigo_postal: u.codigo_postal || null,
      lat: u.lat || null,
      lng: u.lng || null,
      es_principal: idx === 0,
      activa: true,
    };
  });

  const { error: ubicError } = await supabase
    .from('ubicaciones')
    .insert(ubicacionesPayload);

  if (ubicError) throw new Error('Error creando ubicaciones: ' + ubicError.message);

  return {
    profesionalId: profesional.id,
    fotoPerfilUrl: fotoPerfilUrl,
    fotoEquipoUrl: fotoEquipoUrl,
  };
}
