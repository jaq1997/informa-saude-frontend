const PLACES_URL = "https://places.googleapis.com/v1/places:searchNearby";
const SEARCH_TEXT_URL = "https://places.googleapis.com/v1/places:searchText";
const AUTOCOMPLETE_URL = "https://places.googleapis.com/v1/places:autocomplete";
const MAX_RESULTS_PER_TYPE = 20;

export const CATEGORIES = [
  { id: "hospital", label: "Hospitais" },
  { id: "ubs", label: "UBS / Postos" },
  { id: "clinic", label: "Clínicas" },
  { id: "pharmacy", label: "Farmácias" },
];

export function getApiKey() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    const error = new Error(
      "A chave da API do Google Maps não está configurada."
    );
    error.code = "NOT_CONFIGURED";
    throw error;
  }
  return apiKey;
}

export function formatDistance(km) {
  if (!Number.isFinite(km)) {
    return "Distância indisponível";
  }
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1).replace(".", ",")} km`;
}

export function directionsUrl(place) {
  const destination = `${place.lat},${place.lng}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    destination
  )}`;
}

export function haversineKm(pointA, pointB) {
  const earthRadiusKm = 6371;
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const latDifference = toRadians(pointB.lat - pointA.lat);
  const lngDifference = toRadians(pointB.lng - pointA.lng);
  const a = Math.sin(latDifference / 2) ** 2 + Math.cos(toRadians(pointA.lat)) * Math.cos(toRadians(pointB.lat)) * Math.sin(lngDifference / 2) ** 2;
  return (earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function getPlaceName(place) {
  return place.displayName?.text || "Nome não informado";
}

export function classify(place) {
  const name = getPlaceName(place);
  const types = place.types ?? [];
  const ubsPattern =
    /\b(ubs|unidade basica de saude|unidade básica de saúde|posto de saude|posto de saúde|centro de saude|centro de saúde|unidade de saude da familia|unidade de saúde da família|usf|esf)\b/i;
  if (ubsPattern.test(name)) {
    return "ubs";
  }
  if (types.includes("hospital")) {
    return "hospital";
  }
  if (types.includes("pharmacy")) {
    return "pharmacy";
  }
  if (
    types.some((type) =>
      [
        "medical_clinic",
        "doctor",
        "dentist",
        "physiotherapist",
        "medical_lab",
      ].includes(type)
    )
  ) {
    return "clinic";
  }
  return null;
}

function createApiError(response, data) {
  const apiStatus = data?.error?.status;
  const message = data?.error?.message || "Não foi possível consultar o Google Places.";
  const error = new Error(message);
  if (
    response.status === 429 ||
    apiStatus === "RESOURCE_EXHAUSTED"
  ) {
    error.code = "RATE_LIMIT";
  } else if (
    response.status === 403 ||
    apiStatus === "PERMISSION_DENIED" ||
    apiStatus === "API_KEY_INVALID" ||
    apiStatus === "REQUEST_DENIED"
  ) {
    error.code = "KEY_RESTRICTED";
  } else if (
    apiStatus === "INVALID_ARGUMENT" ||
    response.status === 400
  ) {
    error.code = "INVALID_REQUEST";
  } else {
    error.code = "NETWORK";
  }
  return error;
}

async function readResponse(response) {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw createApiError(response, data);
  }
  return data ?? {};
}

export async function getPlacePredictions(inputTerm) {
  const term = inputTerm.trim();
  if (!term) return [];

  const apiKey = getApiKey();
  const response = await fetch(AUTOCOMPLETE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
    },
    body: JSON.stringify({
      input: term,
      languageCode: "pt-BR",
      regionCode: "BR",
    }),
  });

  const data = await readResponse(response);
  return data.suggestions ?? [];
}

async function nearbyByType(center, radiusM, includedTypes) {
  const apiKey = getApiKey();
  const response = await fetch(PLACES_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": [
        "places.id",
        "places.displayName",
        "places.formattedAddress",
        "places.location",
        "places.types",
        "places.nationalPhoneNumber",
      ].join(","),
    },
    body: JSON.stringify({
      includedTypes,
      maxResultCount: MAX_RESULTS_PER_TYPE,
      languageCode: "pt-BR",
      regionCode: "BR",
      locationRestriction: {
        circle: {
          center: {
            latitude: center.lat,
            longitude: center.lng,
          },
          radius: radiusM,
        },
      },
    }),
  });
  const data = await readResponse(response);
  return data.places ?? [];
}

export async function searchPlaceLocation(query) {
  const term = query.trim();
  if (!term) {
    const error = new Error("Informe uma cidade, bairro ou endereço.");
    error.code = "INVALID_REQUEST";
    throw error;
  }
  const apiKey = getApiKey();
  const response = await fetch(SEARCH_TEXT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": [
        "places.id",
        "places.displayName",
        "places.formattedAddress",
        "places.location",
      ].join(","),
    },
    body: JSON.stringify({
      textQuery: term,
      languageCode: "pt-BR",
      regionCode: "BR",
      maxResultCount: 1,
    }),
  });
  const data = await readResponse(response);
  const place = data.places?.[0];
  if (
    !place?.location ||
    !Number.isFinite(place.location.latitude) ||
    !Number.isFinite(place.location.longitude)
  ) {
    const error = new Error(
      "Não encontramos esse endereço. Tente informar a cidade e o estado."
    );
    error.code = "PLACE_NOT_FOUND";
    throw error;
  }
  return {
    lat: place.location.latitude,
    lng: place.location.longitude,
    label:
      place.formattedAddress ||
      place.displayName?.text ||
      term,
  };
}

export async function searchHealthPlaces({ lat, lng, radiusM = 2000 }) {
  const center = { lat, lng };
  const results = await Promise.all([
    nearbyByType(center, radiusM, ["hospital"]),
    nearbyByType(center, radiusM, [
      "medical_clinic",
      "doctor",
      "dentist",
      "physiotherapist",
    ]),
    nearbyByType(center, radiusM, ["pharmacy"]),
  ]);
  const uniquePlaces = new Map();
  for (const group of results) {
    for (const place of group) {
      if (!place.id || !place.location) {
        continue;
      }
      if (uniquePlaces.has(place.id)) {
        continue;
      }
      const category = classify(place);
      if (!category) {
        continue;
      }
      const placePoint = {
        lat: place.location.latitude,
        lng: place.location.longitude,
      };
      const distanceKm = haversineKm(center, placePoint);
      if (distanceKm * 1000 > radiusM) {
        continue;
      }
      uniquePlaces.set(place.id, {
        id: place.id,
        lat: placePoint.lat,
        lng: placePoint.lng,
        category,
        name: getPlaceName(place),
        address: place.formattedAddress ?? null,
        phone: place.nationalPhoneNumber ?? null,
        distanceKm,
      });
    }
  }
  return [...uniquePlaces.values()].sort(
    (a, b) => a.distanceKm - b.distanceKm
  );
}