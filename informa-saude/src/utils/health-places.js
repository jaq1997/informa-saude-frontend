const PLACES_URL = "https://places.googleapis.com/v1/places:searchNearby";
const GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json";
const MAX_RADIUS_M = 10000;
const MAX_RESULTS_PER_TYPE = 20;

export const CATEGORIES = [
  { id: "hospital", label: "Hospitais" },
  { id: "ubs", label: "UBS / Postos" },
  { id: "clinic", label: "Clínicas" },
  { id: "pharmacy", label: "Farmácias" },
];

export function formatDistance(km) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1).replace(".", ",")} km`;
}

export function directionsUrl(p) {
  return `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`;
}

function getApiKey() {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!key) throw new Error("VITE_GOOGLE_MAPS_API_KEY não configurada no arquivo .env");
  return key;
}

function haversineKm(a, b) {
  const R = 6371;
  const toRand = (d) => (d * Math.PI) / 180;
  const dLat = toRand(b.lat - a.lat);
  const dLng = toRand(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRand(a.lat)) * Math.cos(toRand(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function classify(p) {
  const types = p.types ?? [];
  const name = (p.displayName?.text ?? "").toLowerCase();
  if (/\b(ubs|unidade b[aá]sica|posto de sa[uú]de|centro de sa[uú]de|usf)\b/.test(name))
    return "ubs";
  if (types.includes("hospital")) return "hospital";
  if (types.includes("pharmacy") || types.includes("drugstore")) return "pharmacy";
  if (
    types.includes("doctor") ||
    types.includes("dentist") ||
    types.includes("physiotherapist") ||
    types.includes("medical_lab")
  )
    return "clinic";
  return null;
}

async function nearbyByType(center, radiusM, includedTypes) {
  const apiKey = getApiKey();
  const res = await fetch(PLACES_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.location,places.types,places.nationalPhoneNumber",
    },
    body: JSON.stringify({
      includedTypes,
      maxResultCount: MAX_RESULTS_PER_TYPE,
      languageCode: "pt-BR",
      locationRestriction: {
        circle: {
          center: { latitude: center.lat, longitude: center.lng },
          radius: radiusM,
        },
      },
    }),
  });
  if (!res.ok) throw new Error("Erro ao buscar locais no Google Maps");
  const json = await res.json();
  return json.places ?? [];
}

export async function searchHealthPlaces({ lat, lng, radiusM = 2000 }) {
  const center = { lat, lng };
  const groups = await Promise.all([
    nearbyByType(center, radiusM, ["hospital"]),
    nearbyByType(center, radiusM, ["doctor", "dentist", "physiotherapist"]),
    nearbyByType(center, radiusM, ["pharmacy", "drugstore"]),
  ]);

  const seen = new Set();
  const places = [];
  for (const p of groups.flat()) {
    if (seen.has(p.id) || !p.location) continue;
    const category = classify(p);
    if (!category) continue;
    seen.add(p.id);
    const point = { lat: p.location.latitude, lng: p.location.longitude };
    places.push({
      id: p.id,
      lat: point.lat,
      lng: point.lng,
      category,
      name: p.displayName?.text ?? null,
      address: p.formattedAddress ?? null,
      phone: p.nationalPhoneNumber ?? p.internationalPhoneNumber ?? null,
      distanceKm: haversineKm(center, point),
    });
  }
  places.sort((a, b) => a.distanceKm - b.distanceKm);
  return places;
}