export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

if (!MAPBOX_TOKEN) {
  console.error('Falta VITE_MAPBOX_TOKEN. Revisa .env');
}

/**
 * Convierte una dirección de texto a coordenadas geográficas usando Mapbox Geocoding.
 * Limitado a México (country=mx) para mayor precisión.
 *
 * @param {string} address Dirección completa, ej "Av. Insurgentes 123, CDMX"
 * @returns {Promise<{lat: number, lng: number, formatted: string} | null>}
 */
export async function geocodeAddress(address) {
  if (!address || !MAPBOX_TOKEN) return null;

  const encoded = encodeURIComponent(address);
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?country=mx&limit=1&access_token=${MAPBOX_TOKEN}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Geocoding failed');
    const data = await res.json();

    if (!data.features || data.features.length === 0) return null;

    const feature = data.features[0];
    const [lng, lat] = feature.center;

    return {
      lat,
      lng,
      formatted: feature.place_name,
    };
  } catch (err) {
    console.error('Error en geocodificación:', err);
    return null;
  }
}

// Coordenadas centrales de México (para inicializar el mapa)
export const MEXICO_CENTER = {
  lng: -102.5528,
  lat: 23.6345,
  zoom: 4.5,
};
