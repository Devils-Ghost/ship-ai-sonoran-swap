import { describe, expect, it } from "vitest";
import { geocodeUrl, isProviderRefusal, parseGeocode } from "./geocode";

describe("geocoders (FR-EST-02)", () => {
  it("builds browser-only requests limited to the Phoenix metro", () => {
    const m = geocodeUrl("mapbox", "200 W Washington", "pk.test");
    expect(m.origin).toBe("https://api.mapbox.com");
    expect(m.searchParams.get("bbox")).toBe("-112.65,33.15,-111.55,33.85");
    expect(m.searchParams.get("access_token")).toBe("pk.test");

    const p = geocodeUrl("photon", "200 W Washington");
    expect(p.origin).toBe("https://photon.komoot.io");
    expect(p.searchParams.get("bbox")).toBe("-112.65,33.15,-111.55,33.85");
    expect(p.searchParams.get("layer")).toBe("house");
    expect(p.searchParams.has("access_token")).toBe(false);
  });

  it("treats auth and quota answers as a reason to fall back", () => {
    expect([401, 403, 429].every(isProviderRefusal)).toBe(true);
    expect([200, 404, 500].some(isProviderRefusal)).toBe(false);
  });

  it("parses Photon results into readable Arizona addresses", () => {
    const json = {
      features: [
        {
          geometry: { coordinates: [-112.0771, 33.4488] },
          properties: {
            housenumber: "200",
            street: "West Washington Street",
            city: "Phoenix",
            state: "Arizona",
            postcode: "85003",
          },
        },
        {
          geometry: { coordinates: [-112.0771, 33.4488] },
          properties: {
            housenumber: "200",
            street: "West Washington Street",
            name: "Phoenix City Hall",
            city: "Phoenix",
            state: "Arizona",
            postcode: "85003",
          },
        },
        {
          geometry: { coordinates: [-114, 35] },
          properties: { housenumber: "1", street: "Main St", city: "Elsewhere", state: "Nevada" },
        },
      ],
    };
    expect(parseGeocode("photon", json, "q")).toEqual([
      {
        label: "200 West Washington Street, Phoenix, Arizona 85003",
        lng: -112.0771,
        lat: 33.4488,
        place: "Phoenix",
      },
    ]);
  });

  it("parses Mapbox results", () => {
    const json = {
      features: [
        {
          geometry: { coordinates: [-111.84, 33.3] },
          properties: {
            full_address: "175 S Arizona Ave, Chandler, AZ",
            context: { place: { name: "Chandler" } },
          },
        },
      ],
    };
    expect(parseGeocode("mapbox", json, "q")[0]).toMatchObject({ place: "Chandler", lat: 33.3 });
  });
});
