/**
 * Routing Service - Integrates with OSRM (Open Source Routing Machine)
 * Free API endpoint: router.project-osrm.org
 * 
 * Features:
 * - Calculate routes between multiple waypoints
 * - Decode polyline geometry
 * - Extract distance and duration
 */

import { LatLngTuple } from 'leaflet';

export interface RouteRequest {
  waypoints: LatLngTuple[];
}

export interface RouteResponse {
  distance: number; // meters
  duration: number; // seconds
  geometry: LatLngTuple[]; // decoded polyline coordinates
  waypoints: Array<{
    hint: string;
    distance: number;
    location: LatLngTuple;
    name: string;
  }>;
  routes: Array<{
    geometry: string; // polyline6 encoded
    legs: Array<{
      distance: number;
      duration: number;
      steps: Array<Record<string, unknown>>;
    }>;
    distance: number;
    duration: number;
  }>;
}

/**
 * Decode polyline6 format (OSRM default)
 * Converts encoded string to lat/lng coordinates
 */
function decodePolyline(encoded: string): LatLngTuple[] {
  const points: LatLngTuple[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let result = 0;
    let shift = 0;
    let byte = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dlat = (result & 1) ? ~(result >> 1) : result >> 1;
    lat += dlat;

    result = 0;
    shift = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dlng = (result & 1) ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push([lat / 1e6, lng / 1e6]);
  }

  return points;
}

/**
 * Calculate route using OSRM API
 * @param waypoints - Array of [lat, lng] coordinates
 * @returns Route with geometry, distance, and duration
 */
export async function calculateRoute(waypoints: LatLngTuple[]): Promise<RouteResponse | null> {
  if (waypoints.length < 2) {
    console.warn('Route requires at least 2 waypoints');
    return null;
  }

  try {
    // OSRM expects: lng1,lat1;lng2,lat2;...
    const coordinates = waypoints.map(([lat, lng]) => `${lng},${lat}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=polyline6&steps=true`;

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      console.error('OSRM routing failed:', response.status);
      return null;
    }

    const data = (await response.json()) as RouteResponse;

    if (!data.routes || data.routes.length === 0) {
      console.warn('No route found for waypoints');
      return null;
    }

    const route = data.routes[0];

    return {
      distance: route.distance,
      duration: route.duration,
      geometry: decodePolyline(route.geometry),
      waypoints: data.waypoints,
      routes: data.routes,
    };
  } catch (error) {
    console.error('Error calculating route:', error);
    return null;
  }
}

/**
 * Format distance in km
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Format duration in minutes/hours
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}min`;
}
