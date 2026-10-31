import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { SystemNavbar } from '../../components';
import { useGeolocation } from "../../hooks/use-geolocation";
import {
  CATEGORIES,
  directionsUrl,
  formatDistance,
  searchHealthPlaces,
  searchPlaceLocation,
  getPlacePredictions,
} from "../../utils/health-places";

const HealthMap = lazy(() =>
  import("../../components/HealthMap/HealthMap")
);

const RADII = [1000, 2000, 5000, 10000];
const ERR = {
  RATE_LIMIT:
    "O serviço de mapas está recebendo muitas consultas. Aguarde alguns segundos e tente novamente.",
  NETWORK:
    "Não foi possível consultar os estabelecimentos. Verifique sua conexão e tente novamente.",
  NOT_CONFIGURED:
    "O serviço de mapas não requer uma chave de API.",
  KEY_RESTRICTED:
    "O serviço de mapas recusou a consulta. Tente novamente mais tarde.",
  INVALID_REQUEST:
    "A solicitação à API é inválida. Confira o endereço pesquisado e as configurações do serviço.",
  PLACE_NOT_FOUND:
    "Não encontramos esse endereço. Tente informar a cidade e o estado.",
};
const GEO_MSG = {
  denied:
    "Você não permitiu o acesso à localização. Pesquise uma cidade, bairro ou endereço abaixo.",
  timeout:
    "A localização demorou demais para responder. Tente de novo ou pesquise um endereço.",
  unavailable:
    "Não conseguimos obter sua localização agora. Pesquise um endereço abaixo.",
  unsupported:
    "Seu navegador não oferece localização. Pesquise um endereço abaixo.",
};

function getFriendlyError(error) {
  return ERR[error?.code] ?? ERR.NETWORK;
}

export default function MapaSaude() {
  const geo = useGeolocation();
  const [manual, setManual] = useState(null);
  const [query, setQuery] = useState("");
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeErr, setGeocodeErr] = useState(null);
  const [radius, setRadius] = useState(2000);
  const [filters, setFilters] = useState(
    () => new Set(["hospital", "ubs", "clinic", "pharmacy"])
  );
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [reload, setReload] = useState(0);
  const [mobileView, setMobileView] = useState("map");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const center =
    manual?.point ??
    (geo.status === "ok" ? geo.position : null);
  const isExact = !manual && geo.status === "ok";

  useEffect(() => {
    if (!center) {
      setPlaces([]);
      setLoading(false);
      setError(null);
      return;
    }
    let stale = false;
    setLoading(true);
    setError(null);
    setSelected(null);
    searchHealthPlaces({
      lat: center.lat,
      lng: center.lng,
      radiusM: radius,
    })
      .then((results) => {
        if (!stale) {
          setPlaces(results);
        }
      })
      .catch((err) => {
        if (stale) return;
        setError(getFriendlyError(err));
        setPlaces([]);
      })
      .finally(() => {
        if (!stale) {
          setLoading(false);
        }
      });
    return () => {
      stale = true;
    };
  }, [center?.lat, center?.lng, radius, reload]);

  const visible = useMemo(
    () => places.filter((place) => filters.has(place.category)),
    [places, filters]
  );

  const toggle = (id) => {
    setFilters((previous) => {
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleInputChange = async (event) => {
    const term = event.target.value;
    setQuery(term);

    if (term.trim().length > 2) {
      try {
        const results = await getPlacePredictions(term);
        const formatted = results
          .map((item) => typeof item === "string" ? item : item.placePrediction?.text?.text)
          .filter(Boolean);
        setSuggestions(formatted);
        setShowSuggestions(true);
      } catch (err) {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = async (selectedText) => {
    setQuery(selectedText);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const onSearch = async (event) => {
    event.preventDefault();
    const term = query.trim();
    if (!term || geocoding) return;
    setShowSuggestions(false);
    setGeocoding(true);
    setGeocodeErr(null);
    try {
      const result = await searchPlaceLocation(term);
      setManual({
        label: result.label,
        point: {
          lat: result.lat,
          lng: result.lng,
        },
      });
      setSelected(null);
      setPlaces([]);
      setError(null);
      setMobileView("map");
    } catch (err) {
      setGeocodeErr(getFriendlyError(err));
    } finally {
      setGeocoding(false);
    }
  };

  const useMyLocation = () => {
    setManual(null);
    setGeocodeErr(null);
    setSelected(null);
    setMobileView("map");
    geo.request();
  };

  return (
    <div className="health-page">
      <SystemNavbar />
      <main className="health-main">
        <p className="health-eyebrow">
          Encontre atendimento
        </p>
        <h1 className="health-title">
          Pontos de Saúde Próximos
        </h1>
        <p className="health-description">
          Veja hospitais, unidades de saúde, clínicas e farmácias
          perto de você, com distância e rota.
        </p>
        <section
          className="health-search-panel"
          aria-label="Pesquisar estabelecimentos de saúde"
        >
          {!center && geo.status === "idle" && (
            <p className="health-location-notice">
              Para mostrar os locais mais próximos, precisamos
              da sua localização. Ela é usada apenas nesta página
              e não fica salva.
            </p>
          )}
          {GEO_MSG[geo.status] && !manual && (
            <p
              role="alert"
              className="health-message health-message-warning"
            >
              {GEO_MSG[geo.status]}
            </p>
          )}
          <div className="health-search-row">
            <button
              type="button"
              onClick={useMyLocation}
              disabled={geo.status === "loading"}
              className="health-button health-button-primary"
            >
              {geo.status === "loading"
                ? "Obtendo localização…"
                : isExact
                  ? "Atualizar minha localização"
                  : "Usar minha localização"}
            </button>
            <form
              onSubmit={onSearch}
              className="health-search-form"
              role="search"
              style={{ position: "relative" }}
            >
              <div style={{ position: "relative", flex: 1, display: "flex" }}>
                <input
                  type="search"
                  value={query}
                  onChange={handleInputChange}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowSuggestions(true);
                  }}
                  placeholder="Ou pesquise cidade, bairro ou endereço"
                  aria-label="Pesquisar endereço"
                  className="health-search-input"
                  style={{ width: "100%" }}
                />

                {/* Dropdown de sugestões */}
                {showSuggestions && suggestions.length > 0 && (
                  <ul
                    className="health-suggestions-dropdown"
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      zIndex: 1000,
                      background: "#ffffff",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      border: "1px solid #e5e7eb",
                      borderRadius: "0.375rem",
                      listStyle: "none",
                      padding: 0,
                      margin: "4px 0 0 0",
                      maxHeight: "200px",
                      overflowY: "auto",
                    }}
                  >
                    {suggestions.map((item, index) => (
                      <li
                        key={index}
                        onMouseDown={() => handleSelectSuggestion(item)}
                        style={{
                          padding: "10px 12px",
                          cursor: "pointer",
                          fontSize: "0.9rem",
                          borderBottom: "1px solid #f3f4f6",
                          color: "#374151",
                        }}
                        onMouseEnter={(e) => (e.target.style.background = "#f9fafb")}
                        onMouseLeave={(e) => (e.target.style.background = "#ffffff")}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <button
                type="submit"
                disabled={geocoding || !query.trim()}
                className="health-button health-button-outline"
              >
                {geocoding ? "Buscando…" : "Buscar"}
              </button>
            </form>
          </div>
          {geocodeErr && (
            <p
              role="alert"
              className="health-message health-message-error"
            >
              {geocodeErr}
            </p>
          )}
          {manual && (
            <p className="health-search-caption">
              Buscando perto de: {manual.label}
            </p>
          )}
          {center && (
            <div className="health-toolbar">
              <div
                className="health-filters"
                role="group"
                aria-label="Filtrar por categoria"
              >
                {CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => toggle(category.id)}
                    aria-pressed={filters.has(category.id)}
                    className={`health-filter health-filter-${category.id}`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
              <label className="health-radius">
                <span>Raio</span>
                <select
                  value={radius}
                  onChange={(event) =>
                    setRadius(Number(event.target.value))
                  }
                >
                  {RADII.map((value) => (
                    <option key={value} value={value}>
                      {value / 1000} km
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
        </section>
        {center && (
          <>
            <div
              className="health-mobile-tabs"
              role="group"
              aria-label="Visualização dos resultados"
            >
              <button
                type="button"
                onClick={() => setMobileView("map")}
                aria-pressed={mobileView === "map"}
                className={`health-mobile-tab ${
                  mobileView === "map"
                    ? "health-mobile-tab-active"
                    : ""
                }`}
              >
                Mapa
              </button>
              <button
                type="button"
                onClick={() => setMobileView("list")}
                aria-pressed={mobileView === "list"}
                className={`health-mobile-tab ${
                  mobileView === "list"
                    ? "health-mobile-tab-active"
                    : ""
                }`}
              >
                Lista ({visible.length})
              </button>
            </div>
            <section
              className="health-results-layout"
              aria-label="Mapa e estabelecimentos encontrados"
            >
              <div
                className={`health-map-container ${
                  mobileView === "list"
                    ? "health-map-hidden"
                    : ""
                }`}
              >
                <Suspense
                  fallback={
                    <div className="health-map-skeleton">
                      Carregando mapa…
                    </div>
                  }
                >
                  <HealthMap
                    center={center}
                    isExactLocation={isExact}
                    radiusM={radius}
                    places={visible}
                    selected={selected}
                    onSelect={setSelected}
                  />
                </Suspense>
                {loading && (
                  <div
                    className="health-map-loading"
                    role="status"
                  >
                    Buscando estabelecimentos…
                  </div>
                )}
              </div>
              <aside
                className={`health-results-panel ${
                  mobileView === "map"
                    ? "health-results-hidden"
                    : ""
                }`}
                aria-label="Lista de estabelecimentos"
              >
                <div className="health-results-header">
                  <p className="health-results-count">
                    {loading
                      ? "Carregando…"
                      : `${visible.length} locais encontrados`}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setReload((value) => value + 1)
                    }
                    disabled={loading}
                    className="health-refresh-button"
                  >
                    Atualizar
                  </button>
                </div>
                <div className="health-results-list">
                  {error && (
                    <div className="health-error-actions">
                      <p
                        role="alert"
                        className="health-message health-message-error"
                      >
                        {error}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          setReload((value) => value + 1)
                        }
                        className="health-button health-button-outline"
                      >
                        Tentar novamente
                      </button>
                    </div>
                  )}
                  {!error && !loading && visible.length === 0 && (
                    <p className="health-empty-state">
                      Nenhum estabelecimento encontrado neste raio.
                      Tente aumentar o raio ou ativar outras categorias.
                    </p>
                  )}
                  {!error && (
                    <ul className="health-places-list">
                      {visible.map((place) => {
                        const categoryLabel =
                          CATEGORIES.find(
                            (category) =>
                              category.id === place.category
                          )?.label ?? "Estabelecimento de saúde";
                        return (
                          <li
                            key={place.id}
                            className={`health-place ${
                              selected?.id === place.id
                                ? "health-place-selected"
                                : ""
                            }`}
                          >
                            <p
                              className={`health-place-category health-place-category-${place.category}`}
                            >
                              {categoryLabel}
                            </p>
                            <h2 className="health-place-name">
                              {place.name ??
                                "Nome não informado pela fonte"}
                            </h2>
                            <p className="health-place-address">
                              {place.address ??
                                "Endereço não informado pela fonte"}
                            </p>
                            <p className="health-place-distance">
                              {formatDistance(place.distanceKm)} em
                              linha reta
                            </p>
                            <div className="health-place-actions">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelected(place);
                                  setMobileView("map");
                                }}
                                className="health-place-action"
                              >
                                Ver no mapa
                              </button>
                              <a
                                href={directionsUrl(place)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="health-place-action health-place-action-primary"
                              >
                                Rota ↗
                              </a>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </aside>
            </section>
          </>
        )}
      </main>
    </div>
  );
}