// FR-EST-02 address search, provider-neutral and pure. The browser calls these URLs directly so the
// address never reaches our server (AGENTS §2.4). Mapbox is primary; Photon (OpenStreetMap data, free,
// fair use) takes over when Mapbox refuses the request.

export type Geocoder = "mapbox" | "photon";

export type AddressPick = { label: string; lng: number; lat: number; place: string | null };

/** Phoenix metro: [west, south, east, north]. */
export const PHOENIX_METRO_BBOX = [-112.65, 33.15, -111.55, 33.85] as const;

/** Mapbox answers these when a token is invalid, revoked or out of allowance: time to fall back. */
export function isProviderRefusal(status: number): boolean {
  return status === 401 || status === 403 || status === 429;
}

export function geocodeUrl(geocoder: Geocoder, query: string, mapboxToken?: string): URL {
  if (geocoder === "mapbox") {
    const url = new URL("https://api.mapbox.com/search/geocode/v6/forward");
    url.search = new URLSearchParams({
      q: query,
      autocomplete: "true",
      country: "us",
      bbox: PHOENIX_METRO_BBOX.join(","),
      types: "address",
      limit: "5",
      access_token: mapboxToken ?? "",
    }).toString();
    return url;
  }
  const url = new URL("https://photon.komoot.io/api/");
  url.search = new URLSearchParams({
    q: query,
    limit: "5",
    lang: "en",
    bbox: PHOENIX_METRO_BBOX.join(","),
    layer: "house",
  }).toString();
  return url;
}

type MapboxResponse = {
  features?: {
    geometry: { coordinates: [number, number] };
    properties: { full_address?: string; name?: string; context?: { place?: { name?: string } } };
  }[];
};

type PhotonResponse = {
  features?: {
    geometry: { coordinates: [number, number] };
    properties: {
      housenumber?: string;
      street?: string;
      name?: string;
      city?: string;
      state?: string;
      postcode?: string;
    };
  }[];
};

export function parseGeocode(geocoder: Geocoder, json: unknown, query: string): AddressPick[] {
  if (geocoder === "mapbox") {
    return ((json as MapboxResponse).features ?? []).map((f) => ({
      label: f.properties.full_address ?? f.properties.name ?? query,
      lng: f.geometry.coordinates[0],
      lat: f.geometry.coordinates[1],
      place: f.properties.context?.place?.name ?? null,
    }));
  }
  const seen = new Set<string>();
  return (
    ((json as PhotonResponse).features ?? [])
      .filter((f) => !f.properties.state || f.properties.state === "Arizona")
      .map((f) => {
        const p = f.properties;
        const street = [p.housenumber, p.street ?? p.name].filter(Boolean).join(" ");
        const tail = [p.city, [p.state, p.postcode].filter(Boolean).join(" ")].filter(Boolean).join(", ");
        return {
          label: [street, tail].filter(Boolean).join(", ") || query,
          lng: f.geometry.coordinates[0],
          lat: f.geometry.coordinates[1],
          place: p.city ?? null,
        };
      })
      // Photon returns one result per business at an address; the visitor needs the address once.
      .filter((pick) => !seen.has(pick.label) && seen.add(pick.label))
  );
}

/** Attribution each geocoder's terms ask for (Photon serves OpenStreetMap data, ODbL). */
export const GEOCODER_CREDIT: Record<Geocoder, string | null> = {
  mapbox: null, // shown by the Mapbox map itself
  photon: "Address search © OpenStreetMap contributors, via Photon",
};
