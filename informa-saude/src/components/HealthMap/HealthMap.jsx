import { useEffect, useRef } from "react";
import L from "leaflet";
import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import {
  CATEGORIES,
  directionsUrl,
  formatDistance,
} from "../../utils/health-places";

function placeIcon(category, active = false) {
  const size = active ? 38 : 30;

  return L.divIcon({
    className: "health-marker-wrapper",
    html: `
      <div class="health-marker health-marker-${category} ${
        active ? "health-marker-active" : ""
      }">
        <span aria-hidden="true">+</span>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

const userIcon = L.divIcon({
  className: "health-user-marker-wrapper",
  html: '<div class="health-user-marker"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function FitBounds({ center, radiusM }) {
  const map = useMap();

  useEffect(() => {
    if (!center) return;

    const latDelta = radiusM / 111320; 
    const lngDelta = radiusM / (111320 * Math.cos((center.lat * Math.PI) / 180));

    const bounds = L.latLngBounds(
      [center.lat - latDelta, center.lng - lngDelta],
      [center.lat + latDelta, center.lng + lngDelta]
    );

    map.fitBounds(bounds, {
      padding: [30, 30],
      maxZoom: 15,
    });
  }, [map, center.lat, center.lng, radiusM]);

  return null;
}

function FlyTo({ target }) {
  const map = useMap();

  useEffect(() => {
    if (!target) return;

    map.flyTo(
      [target.lat, target.lng],
      Math.max(map.getZoom(), 16),
      { duration: 0.6 }
    );
  }, [map, target]);

  return null;
}

function HealthMap({
  center,
  isExactLocation,
  radiusM,
  places,
  selected,
  onSelect,
}) {
  const markerRefs = useRef({});

  useEffect(() => {
    if (!selected) return;

    markerRefs.current[selected.id]?.openPopup();
  }, [selected]);

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={14}
      className="health-map"
      scrollWheelZoom
    >
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitBounds center={center} radiusM={radiusM} />
      <FlyTo target={selected} />

      <Circle
        center={[center.lat, center.lng]}
        radius={radiusM}
        pathOptions={{
          color: "#00645A",
          fillColor: "#00645A",
          fillOpacity: 0.06,
          weight: 1,
        }}
      />

      <Marker
        position={[center.lat, center.lng]}
        icon={userIcon}
      >
        <Popup>
          {isExactLocation
            ? "Sua localização atual"
            : "Centro da área pesquisada"}
        </Popup>
      </Marker>

      {places.map((place) => {
        const categoryLabel =
          CATEGORIES.find(
            (category) => category.id === place.category
          )?.label ?? "Estabelecimento de saúde";

        return (
          <Marker
            key={place.id}
            position={[place.lat, place.lng]}
            icon={placeIcon(
              place.category,
              selected?.id === place.id
            )}
            ref={(marker) => {
              markerRefs.current[place.id] = marker;
            }}
            eventHandlers={{
              click: () => onSelect(place),
            }}
          >
            <Popup>
              <div className="health-popup">
                <p
                  className={`health-popup-category health-popup-category-${place.category}`}
                >
                  {categoryLabel}
                </p>

                <h3 className="health-popup-name">
                  {place.name ??
                    "Nome não informado pela fonte"}
                </h3>

                <p className="health-popup-address">
                  {place.address ??
                    "Endereço não informado pela fonte"}
                </p>

                <p className="health-popup-distance">
                  {formatDistance(place.distanceKm)} em linha reta
                </p>

                {place.phone && (
                  <p className="health-popup-phone">
                    Telefone: {place.phone}
                  </p>
                )}

                <a
                  href={directionsUrl(place)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="health-popup-route"
                >
                  Como chegar ↗
                </a>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

export default HealthMap;