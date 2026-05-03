import { LatLngTuple } from 'leaflet';

export interface Stop {
  id?: string;
  lat: number;
  lng: number;
  label?: string;
}

export interface OrderedStop extends Stop {
  originalIndex: number;
}

// Haversine distance in meters
export function haversineDistance(a: LatLngTuple, b: LatLngTuple): number {
  const toRad = (v: number) => (v * Math.PI) / 180;

  const lat1 = a[0];
  const lon1 = a[1];
  const lat2 = b[0];
  const lon2 = b[1];

  const R = 6371000; // meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const aHarv = sinDLat * sinDLat + sinDLon * sinDLon * Math.cos(φ1) * Math.cos(φ2);
  const c = 2 * Math.atan2(Math.sqrt(aHarv), Math.sqrt(1 - aHarv));
  return R * c;
}

// Nearest-neighbor greedy algorithm
export function optimizeNearestNeighbor(
  start: LatLngTuple,
  stops: Stop[],
  options?: { dedupeThresholdMeters?: number },
): OrderedStop[] {
  const threshold = options?.dedupeThresholdMeters ?? 10; // merge points within 10m

  // Normalize and dedupe stops: keep first occurrence
  const unique: Stop[] = [];
  const seen = new Set<string>();
  stops.forEach((s) => {
    const key = `${s.lat.toFixed(6)},${s.lng.toFixed(6)}`;
    if (seen.has(key)) return;

    // check approximate proximity to existing unique stops
    const isNear = unique.some((u) => {
      const d = haversineDistance([u.lat, u.lng], [s.lat, s.lng]);
      return d <= threshold;
    });
    if (!isNear) {
      unique.push(s);
      seen.add(key);
    }
  });

  const remaining = unique.map((s, idx) => ({ ...s, originalIndex: idx }));
  const ordered: OrderedStop[] = [];
  let current: LatLngTuple = start;

  while (remaining.length > 0) {
    let nearestIdx = 0;
    let nearestDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const r = remaining[i];
      const d = haversineDistance(current, [r.lat, r.lng]);
      if (d < nearestDist) {
        nearestDist = d;
        nearestIdx = i;
      }
    }

    const chosen = remaining.splice(nearestIdx, 1)[0];
    ordered.push(chosen as OrderedStop);
    current = [chosen.lat, chosen.lng];
  }

  return ordered;
}
