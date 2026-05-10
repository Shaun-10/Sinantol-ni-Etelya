import React, { useEffect, useMemo, useState, type Key } from "react";
import { LatLngTuple, divIcon, Icon } from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
  Popup,
} from "react-leaflet";
import {
  haversineDistance,
  optimizeNearestNeighbor,
  type Stop,
  type OrderedStop,
} from "../lib/routeOptimizer";
import {
  calculateRoute,
  formatDistance,
  formatDuration,
  type RouteResponse,
} from "../lib/routingService";

interface RouteOptimizerProps {
  key?: Key;
  riderLocation: LatLngTuple | null;
  stops: Stop[]; // array of destinations {lat,lng,label}
  fitBounds?: boolean;
  onRoute?: (orderedStops: OrderedStop[], route: RouteResponse | null) => void;
}

function NumberedIcon(num: number, color = "#2b8a3e") {
  const markerClass =
    color === "#2b8a3e"
      ? "route-optimizer-marker route-optimizer-marker-default"
      : "route-optimizer-marker";

  return divIcon({
    html: `<div class="${markerClass}">${num}</div>`,
    className: "route-optimizer-marker-wrapper",
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });
}

function FitBoundsToRoute({ coords }: { coords: LatLngTuple[] }) {
  const map = useMap();
  useEffect(() => {
    if (!coords || coords.length === 0) return;
    map.fitBounds(coords as any, { padding: [40, 40] });
  }, [coords, map]);
  return null;
}

export default function RouteOptimizer({
  riderLocation,
  stops,
  fitBounds = true,
  onRoute,
}: RouteOptimizerProps) {
  const [orderedStops, setOrderedStops] = useState<OrderedStop[]>([]);
  const [route, setRoute] = useState<RouteResponse | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Compute optimized order when riderLocation or stops change
  useEffect(() => {
    const start: LatLngTuple = riderLocation ?? [14.5995, 120.9842];
    const filtered = (stops || []).filter(
      (s) => typeof s.lat === "number" && typeof s.lng === "number",
    );
    const optimized = optimizeNearestNeighbor(start, filtered);
    setOrderedStops(optimized);
  }, [riderLocation, stops]);

  // Build waypoint list and call routing
  useEffect(() => {
    const buildAndRoute = async () => {
      if (!riderLocation) {
        setRoute(null);
        return;
      }

      // if no stops, clear
      if (!orderedStops || orderedStops.length === 0) {
        setRoute(null);
        if (onRoute) onRoute([], null);
        return;
      }

      setIsCalculating(true);

      const waypoints: LatLngTuple[] = [
        riderLocation,
        ...(orderedStops.map(
          (s) => [s.lat, s.lng] as LatLngTuple,
        ) as LatLngTuple[]),
      ];

      const r = await calculateRoute(waypoints);
      setRoute(r);
      setIsCalculating(false);
      if (onRoute) onRoute(orderedStops, r);
    };

    void buildAndRoute();
  }, [riderLocation, orderedStops, onRoute]);

  const mapCenter =
    riderLocation ??
    (stops[0] ? [stops[0].lat, stops[0].lng] : [14.5995, 120.9842]);

  // Per-stop ETA/distances from route legs (if available)
  const stopSummaries = useMemo(() => {
    if (!route || !route.routes || route.routes.length === 0)
      return [] as Array<{ distance: number; duration: number }>;
    const legs = route.routes[0].legs || [];
    return legs.map((leg) => ({
      distance: leg.distance ?? 0,
      duration: leg.duration ?? 0,
    }));
  }, [route]);

  return (
    <div>
      {isCalculating && (
        <p className="text-sm text-gray-600">Optimizing route...</p>
      )}

      <MapContainer
        center={mapCenter}
        zoom={13}
        className="rider-route-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {fitBounds && route?.geometry && route.geometry.length > 0 && (
          <FitBoundsToRoute coords={route.geometry} />
        )}

        {/* polyline */}
        {route?.geometry && route.geometry.length > 0 && (
          <Polyline
            positions={route.geometry}
            color="#2b8a3e"
            weight={4}
            opacity={0.85}
          />
        )}

        {/* origin marker */}
        {riderLocation && (
          <Marker position={riderLocation}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {/* stop markers numbered */}
        {orderedStops.map((s, idx) => (
          <Marker
            key={`${s.lat}-${s.lng}-${idx}`}
            position={[s.lat, s.lng]}
            icon={NumberedIcon(idx + 1)}
          >
            <Popup>
              <div>
                <strong>{s.label ?? `Stop ${idx + 1}`}</strong>
                <div className="text-sm text-gray-600">
                  {stopSummaries[idx]
                    ? `${formatDistance(stopSummaries[idx].distance)} • ${formatDuration(stopSummaries[idx].duration)}`
                    : ""}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Ordered list */}
      <ol className="mt-2 space-y-2">
        {orderedStops.map((s, idx) => (
          <li
            key={`${s.lat}-${s.lng}-${idx}`}
            className="flex items-center gap-3"
          >
            <div className="w-7 h-7 rounded-full bg-green-700 text-white flex items-center justify-center font-bold">
              {idx + 1}
            </div>
            <div>
              <div className="font-semibold">
                {s.label ?? `${s.lat.toFixed(4)}, ${s.lng.toFixed(4)}`}
              </div>
              <div className="text-sm text-gray-600">
                {riderLocation
                  ? `${Math.round(haversineDistance(riderLocation, [s.lat, s.lng]))} m away (approx)`
                  : ""}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
