export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

if (!MAPBOX_TOKEN) {
  console.error('Falta VITE_MAPBOX_TOKEN. Revisa .env');
}

export const MEXICO_CENTER = {
  lng: -102.5528,
  lat: 23.6345,
  zoom: 4.5,
};

export async function geocodeAddress(address) {
  if (!address || !MAPBOX_TOKEN) return null;
  try {
    const encoded = encodeURIComponent(address);
    const url =
      'https://api.mapbox.com/geocoding/v5/mapbox.places/' +
      encoded +
      '.json?country=mx&language=es&limit=1&access_token=' +
      MAPBOX_TOKEN;

    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.features || data.features.length === 0) return null;

    const feature = data.features[0];
    return {
      lat: feature.center[1],
      lng: feature.center[0],
      formatted: feature.place_name,
    };
  } catch (err) {
    console.error('Error geocoding:', err);
    return null;
  }
}

export async function reverseGeocode(lat, lng) {
  if (!lat || !lng || !MAPBOX_TOKEN) return null;
  try {
    const url =
      'https://api.mapbox.com/geocoding/v5/mapbox.places/' +
      lng +
      ',' +
      lat +
      '.json?country=mx&language=es&types=address,place,postcode,locality,neighborhood&access_token=' +
      MAPBOX_TOKEN;

    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.features || data.features.length === 0) return null;

    const main = data.features[0];

    let direccion = '';
    const addressFeat = data.features.find(function (f) {
      return f.place_type && f.place_type.indexOf('address') !== -1;
    });
    if (addressFeat) {
      const numero = addressFeat.address || '';
      direccion = (numero ? numero + ' ' : '') + (addressFeat.text || '');
    } else if (main.place_type && main.place_type.indexOf('address') !== -1) {
      direccion = (main.address ? main.address + ' ' : '') + main.text;
    }

    let ciudad = '';
    let estado = '';
    let codigo_postal = '';

    const allContexts = [];
    data.features.forEach(function (f) {
      if (f.context) allContexts.push.apply(allContexts, f.context);
    });

    allContexts.forEach(function (ctx) {
      if (ctx.id && ctx.id.indexOf('place.') === 0 && !ciudad) ciudad = ctx.text;
      if (ctx.id && ctx.id.indexOf('region.') === 0 && !estado) estado = ctx.text;
      if (ctx.id && ctx.id.indexOf('postcode.') === 0 && !codigo_postal) codigo_postal = ctx.text;
    });

    return {
      formatted: main.place_name || '',
      direccion: direccion,
      ciudad: ciudad,
      estado: estado,
      codigo_postal: codigo_postal,
    };
  } catch (err) {
    console.error('Error reverse geocoding:', err);
    return null;
  }
}
