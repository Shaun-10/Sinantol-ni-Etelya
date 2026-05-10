import type { LatLngTuple } from "leaflet";

interface NominatimResult {
  lat: string;
  lon: string;
}

function buildAddressQueries(address: string): string[] {
  const normalized = address
    .replace(/\s+/g, " ")
    .replace(/\s+,/g, ",")
    .trim();

  if (!normalized) {
    return [];
  }

  const withoutLeadingNumber = normalized.replace(/^\d+\s+/, "").trim();
  const parts = normalized
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  const queries = [
    normalized,
    normalized.includes("Philippines") ? normalized : `${normalized}, Philippines`,
    withoutLeadingNumber,
    withoutLeadingNumber && !withoutLeadingNumber.includes("Philippines")
      ? `${withoutLeadingNumber}, Philippines`
      : "",
    parts.length > 1 ? parts.slice(1).join(", ") : "",
    parts.length > 1 ? `${parts.slice(1).join(", ")}, Philippines` : "",
    parts.length > 2 ? parts.slice(-3).join(", ") : "",
    parts.length > 2 ? `${parts.slice(-3).join(", ")}, Philippines` : "",
  ];

  return [...new Set(queries.filter(Boolean))];
}

export async function geocodeAddress(
  address: string,
  signal?: AbortSignal,
): Promise<LatLngTuple | null> {
  const queries = buildAddressQueries(address);

  for (const query of queries) {
    const endpoint = new URL("https://nominatim.openstreetmap.org/search");
    endpoint.searchParams.set("format", "json");
    endpoint.searchParams.set("limit", "1");
    endpoint.searchParams.set("countrycodes", "ph");
    endpoint.searchParams.set("q", query);

    const response = await fetch(endpoint.toString(), {
      signal,
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      continue;
    }

    const payload = (await response.json()) as NominatimResult[];
    const result = payload[0];
    if (!result) {
      continue;
    }

    const lat = Number(result.lat);
    const lon = Number(result.lon);
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      return [lat, lon];
    }
  }

  return null;
}
