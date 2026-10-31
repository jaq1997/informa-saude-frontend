import { API_BASE_URL } from '../config/api';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

export const CATEGORIES = [
  { id: 'hospital', label: 'Hospitais' },
  { id: 'ubs', label: 'UBS / Postos' },
  { id: 'clinic', label: 'Clínicas' },
  { id: 'pharmacy', label: 'Farmácias' },
];

export function formatDistance(km) {
  if (!Number.isFinite(km)) return 'Distância indisponível';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1).replace('.', ',')} km`;
}

export function directionsUrl(place) {
  return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&to=${place.lat}%2C${place.lng}`;
}

export function haversineKm(pointA, pointB) {
  const earthRadiusKm = 6371;
  const toRadians = (degrees) => degrees * Math.PI / 180;
  const latDifference = toRadians(pointB.lat - pointA.lat);
  const lngDifference = toRadians(pointB.lng - pointA.lng);
  const a = Math.sin(latDifference / 2) ** 2
    + Math.cos(toRadians(pointA.lat)) * Math.cos(toRadians(pointB.lat))
      * Math.sin(lngDifference / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw Object.assign(new Error('O serviço de mapas está temporariamente indisponível.'), { code: 'NETWORK' });
  return response.json();
}

export async function getPlacePredictions(inputTerm) {
  const term = inputTerm.trim();
  if (term.length < 3) return [];
  const params = new URLSearchParams({ q: term, limit: '5' });
  const places = await fetchJson(`${API_BASE_URL}/api/mapa/enderecos?${params}`);
  return places.map((place) => place.label).filter(Boolean);
}

export async function searchPlaceLocation(query) {
  const term = query.trim();
  if (!term) throw Object.assign(new Error('Informe uma cidade, bairro ou endereço.'), { code: 'INVALID_REQUEST' });
  const params = new URLSearchParams({ q: term });
  const response = await fetch(`${API_BASE_URL}/api/mapa/geocodificar?${params}`);
  const place = await response.json().catch(() => null);
  if (!response.ok || !place) throw Object.assign(new Error(place?.detail || 'Não encontramos esse endereço. Tente informar a cidade e o estado.'), { code: response.status === 404 ? 'PLACE_NOT_FOUND' : 'NETWORK' });
  return { lat: Number(place.lat), lng: Number(place.lng), label: place.label };
}

export function classify(tags = {}, name = '') {
  const text = `${name} ${tags.name || ''}`.toLowerCase();
  if (/\b(ubs|unidade básica de saúde|unidade basica de saude|posto de saúde|posto de saude|usf|esf|centro de saúde|centro de saude)\b/i.test(text)) return 'ubs';
  if (tags.amenity === 'hospital' || tags.healthcare === 'hospital') return 'hospital';
  if (tags.amenity === 'pharmacy' || tags.healthcare === 'pharmacy') return 'pharmacy';
  if (tags.amenity === 'clinic' || tags.healthcare || tags.amenity === 'doctors' || tags.amenity === 'dentist') return 'clinic';
  return null;
}

function formatAddress(tags) {
  const parts = [tags['addr:housenumber'] ? `${tags['addr:street'] || ''}, ${tags['addr:housenumber']}`.replace(/^, /, '') : tags['addr:street'], tags['addr:suburb'], tags['addr:city'], tags['addr:postcode']];
  const address = parts.filter(Boolean).join(' - ');
  return address || null;
}

export async function searchHealthPlaces({ lat, lng, radiusM = 2000 }) {
  const query = `[out:json][timeout:25];(nwr[amenity=hospital](around:${radiusM},${lat},${lng});nwr[amenity=clinic](around:${radiusM},${lat},${lng});nwr[amenity=doctors](around:${radiusM},${lat},${lng});nwr[amenity=dentist](around:${radiusM},${lat},${lng});nwr[amenity=pharmacy](around:${radiusM},${lat},${lng});nwr[healthcare](around:${radiusM},${lat},${lng}););out center tags;`;
  const data = await fetchJson(OVERPASS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: new URLSearchParams({ data: query }),
  });

  const center = { lat, lng };
  const unique = new Map();
  for (const element of data.elements ?? []) {
    const point = element.type === 'node'
      ? { lat: Number(element.lat), lng: Number(element.lon) }
      : { lat: Number(element.center?.lat), lng: Number(element.center?.lon) };
    if (!Number.isFinite(point.lat) || !Number.isFinite(point.lng)) continue;
    const tags = element.tags ?? {};
    const category = classify(tags, tags.name || tags.operator || '');
    if (!category) continue;
    const distanceKm = haversineKm(center, point);
    if (distanceKm * 1000 > radiusM) continue;
    unique.set(`${element.type}/${element.id}`, {
      id: `${element.type}-${element.id}`,
      lat: point.lat,
      lng: point.lng,
      category,
      name: tags.name || tags.operator || 'Unidade de saúde',
      address: formatAddress(tags),
      phone: tags.phone || tags['contact:phone'] || null,
      distanceKm,
    });
  }
  return [...unique.values()].sort((a, b) => a.distanceKm - b.distanceKm);
}
