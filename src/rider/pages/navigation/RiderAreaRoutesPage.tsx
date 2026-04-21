import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LatLngBounds, LatLngTuple } from 'leaflet';
import { CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import RiderAppLayout from '../../components/RiderAppLayout';
import { calculateRoute, formatDistance, formatDuration, type RouteResponse } from '../../lib/routingService';
import { getRiderDeliveries, type RiderDelivery } from '../../lib/riderData';
import { getRiderSupabaseClient } from '../../lib/supabaseClient';

const manilaCenter: LatLngTuple = [14.5995, 120.9842];

const ROUTE_COLORS = ['#0c631f', '#eab308', '#ef4444', '#3b82f6', '#f97316', '#a855f7', '#14b8a6', '#ec4899'];

interface AreaRoute {
  deliveryId: string;
  areaName: string;
  customer: string;
  address: string;
  coords: LatLngTuple;
  color: string;
  route: RouteResponse | null;
}

function deriveAreaName(address: string): string {
  const value = address.trim();
  if (!value) {
    return 'Unknown Area';
  }

  const parts = value.split(',').map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return parts[parts.length - 2];
  }
  return parts[0] || 'Unknown Area';
}

async function geocodeAddress(address: string): Promise<LatLngTuple | null> {
  const endpoint = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`;
  const response = await fetch(endpoint, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as Array<{ lat: string; lon: string }>;
  if (!payload.length) {
    return null;
  }

  const lat = Number(payload[0].lat);
  const lon = Number(payload[0].lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null;
  }

  return [lat, lon];
}

function MapBoundsFitter({ bounds }: { bounds: LatLngBounds | null }) {
  const map = useMap();

  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [bounds, map]);

  return null;
}

export default function RiderAreaRoutesPage() {
  const [riderLocation, setRiderLocation] = useState<LatLngTuple>(manilaCenter);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(true);
  const [isLoadingDeliveries, setIsLoadingDeliveries] = useState(true);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [liveDataError, setLiveDataError] = useState<string | null>(null);
  const [areaRoutes, setAreaRoutes] = useState<AreaRoute[]>([]);
  const [deliveries, setDeliveries] = useState<RiderDelivery[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const geocodeCacheRef = useRef<Map<string, LatLngTuple | null>>(new Map());
  const gpsWatchRef = useRef<number | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation not supported. Using Manila as default origin.');
      return;
    }

    gpsWatchRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setRiderLocation([position.coords.latitude, position.coords.longitude]);
        setGpsError(null);
      },
      (error) => {
        setGpsError(`GPS: ${error.message}. Using Manila as default origin.`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return () => {
      if (gpsWatchRef.current !== null) {
        navigator.geolocation.clearWatch(gpsWatchRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadDeliveries = async () => {
      setIsLoadingDeliveries(true);
      const all = await getRiderDeliveries();
      if (!isMounted) {
        return;
      }

      const inProgress = all.filter((item) => item.status === 'In Progress' && String(item.address ?? '').trim() && String(item.address ?? '').trim() !== '-');
      setDeliveries(inProgress);
      setLastUpdated(new Date());
      setIsLoadingDeliveries(false);
    };

    loadDeliveries();

    const client = getRiderSupabaseClient();
    const channel = client
      ?.channel('rider-area-routes-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deliveries' }, () => {
        loadDeliveries();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        loadDeliveries();
      })
      .subscribe();

    const intervalId = window.setInterval(loadDeliveries, 30000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
      if (channel && client) {
        client.removeChannel(channel);
      }
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const buildAreaRoutes = async () => {
      setIsLoadingRoutes(true);
      setLiveDataError(null);

      if (!deliveries.length) {
        setAreaRoutes([]);
        setIsLoadingRoutes(false);
        return;
      }

      try {
        const responses = await Promise.all(
          deliveries.map(async (delivery, index) => {
            const address = String(delivery.address ?? '').trim();
            let coords = geocodeCacheRef.current.get(address);

            if (coords === undefined) {
              coords = await geocodeAddress(address);
              geocodeCacheRef.current.set(address, coords);
            }

            const route = coords ? await calculateRoute([riderLocation, coords]) : null;

            return {
              deliveryId: delivery.id,
              areaName: deriveAreaName(address),
              customer: delivery.customer,
              address,
              coords: coords ?? manilaCenter,
              color: ROUTE_COLORS[index % ROUTE_COLORS.length],
              route,
            } satisfies AreaRoute;
          })
        );

        if (isMounted) {
          setAreaRoutes(responses);
        }
      } catch {
        if (isMounted) {
          setLiveDataError('Could not update live routes right now. Retrying on next refresh.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingRoutes(false);
        }
      }
    };

    buildAreaRoutes();

    return () => {
      isMounted = false;
    };
  }, [deliveries, riderLocation]);

  const mapBounds = useMemo(() => {
    const allPoints: LatLngTuple[] = [riderLocation];

    areaRoutes.forEach((entry) => {
      if (entry.route?.geometry?.length) {
        allPoints.push(...entry.route.geometry);
      } else {
        allPoints.push(entry.coords);
      }
    });

    if (!allPoints.length) {
      return null;
    }

    const bounds = new LatLngBounds(allPoints[0], allPoints[0]);
    allPoints.forEach((point) => bounds.extend(point));
    return bounds;
  }, [areaRoutes, riderLocation]);

  return (
    <RiderAppLayout pageTitle="All Area Routes" showBack backTo="/rider/home">
      {gpsError ? <p className="m-0 mb-3 text-sm text-amber-700">{gpsError}</p> : null}
      {liveDataError ? <p className="m-0 mb-3 text-sm text-red-700">{liveDataError}</p> : null}
      {isLoadingDeliveries ? <p className="m-0 mb-3 text-sm text-[#5b645c]">Loading live deliveries...</p> : null}
      {isLoadingRoutes ? <p className="m-0 mb-3 text-sm text-[#5b645c]">Updating live routes...</p> : null}
      <p className="m-0 mb-3 text-xs text-[#5b645c]">
        Live data source: active deliveries. Auto refresh every 30s.
        {lastUpdated ? ` Last update: ${lastUpdated.toLocaleTimeString()}.` : ''}
      </p>

      <article className="rounded-xl overflow-hidden border border-[#c7cec7] mb-3">
        <MapContainer center={riderLocation} zoom={12} style={{ width: '100%', height: '440px' }}>
          {mapBounds ? <MapBoundsFitter bounds={mapBounds} /> : null}

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <CircleMarker center={riderLocation} radius={9} pathOptions={{ color: '#145f1f', fillColor: '#22c55e', fillOpacity: 0.9 }}>
            <Popup>
              <strong>Your Location</strong>
              <br />
              {riderLocation[0].toFixed(5)}, {riderLocation[1].toFixed(5)}
            </Popup>
          </CircleMarker>

          {areaRoutes.map((entry) => (
            <React.Fragment key={entry.deliveryId}>
              <Marker position={entry.coords}>
                <Popup>
                  <strong>{entry.customer}</strong>
                  <br />
                  <strong>{entry.areaName}</strong>
                  <br />
                  {entry.address}
                </Popup>
              </Marker>

              {entry.route?.geometry?.length ? (
                <Polyline
                  positions={entry.route.geometry}
                  color={entry.color}
                  weight={4}
                  opacity={0.82}
                />
              ) : null}
            </React.Fragment>
          ))}
        </MapContainer>
      </article>

      <section className="flex flex-col gap-2">
        {!isLoadingDeliveries && !deliveries.length ? (
          <article className="bg-rider-details-card rounded-xl p-3 border border-[#d4e4d5]">
            <p className="m-0 text-sm text-[#4d564e]">No active deliveries found yet for live routing.</p>
          </article>
        ) : null}

        {areaRoutes.map((entry) => (
          <article key={`card-${entry.deliveryId}`} className="bg-rider-details-card rounded-xl p-3 border border-[#d4e4d5]">
            <div className="flex items-center justify-between gap-2">
              <strong className="text-[#0c631f]">{entry.customer}</strong>
              <span className="inline-flex items-center rounded-full px-2 py-1 text-[0.7rem] font-bold bg-[#eff6ef] text-[#2f4631]">
                {entry.route ? 'Route available' : 'No route found'}
              </span>
            </div>
            <p className="m-0 mt-1 text-xs text-[#59625b]">{entry.areaName} • {entry.address}</p>
            {entry.route ? (
              <p className="m-0 mt-1 text-sm text-[#4d564e]">
                {formatDistance(entry.route.distance)} • {formatDuration(entry.route.duration)}
              </p>
            ) : (
              <p className="m-0 mt-1 text-sm text-[#8b3a3a]">Could not calculate this route right now.</p>
            )}
          </article>
        ))}
      </section>
    </RiderAppLayout>
  );
}
