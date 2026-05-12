import React, { useEffect, useState, useRef } from "react";
import { LatLngTuple, Icon, LatLngBounds } from "leaflet";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  Polyline,
} from "react-leaflet";
import { useNavigate, useSearchParams } from "react-router-dom";
import RiderAppLayout from "../../components/RiderAppLayout";
import {
  getRiderDeliveryById,
  getRiderDeliveries,
  type RiderDelivery,
} from "../../lib/riderData";
import RouteOptimizer from "../../components/RouteOptimizer";
import type { Stop } from "../../lib/routeOptimizer";
import { haversineDistance } from "../../lib/routeOptimizer";
import {
  calculateRoute,
  formatDistance,
  formatDuration,
  type RouteResponse,
} from "../../lib/routingService";
import { geocodeAddress } from "../../lib/geocodingService";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const manilaCenter: LatLngTuple = [14.5995, 120.9842];

// Custom marker icons for different waypoint types
const createMarkerIcon = (color: string) =>
  new Icon({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    className: `leaflet-marker-${color}`,
  });

const originMarker = createMarkerIcon("green");
const waypointMarker = createMarkerIcon("blue");
const destinationMarker = createMarkerIcon("red");

// Component to fit map bounds to route
function MapBoundsFitter({ bounds }: { bounds: LatLngBounds | null }) {
  const map = useMap();

  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);

  return null;
}

export default function RiderMapPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const deliveryId = searchParams.get("id") ?? "";

  const [delivery, setDelivery] = useState<RiderDelivery | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [route, setRoute] = useState<RouteResponse | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  // GPS Location tracking
  const [riderLocation, setRiderLocation] = useState<LatLngTuple | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const gpsWatchRef = useRef<number | null>(null);

  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsSignalQuality, setGpsSignalQuality] = useState<
    "acquiring" | "fair" | "good" | "excellent"
  >("acquiring");

  // Map state
  const [mapCenter, setMapCenter] = useState<LatLngTuple>(manilaCenter);
  const mapRef = useRef<LatLngBounds | null>(null);
  const [routeGeoError, setRouteGeoError] = useState<string | null>(null);

  // Waypoints state: [origin (rider), destination (customer)]
  const [waypoints, setWaypoints] = useState<LatLngTuple[]>([]);
  const [destinationCoords, setDestinationCoords] =
    useState<LatLngTuple | null>(null);
  // multiple deliveries / stops
  const [deliveriesList, setDeliveriesList] = useState<RiderDelivery[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [stopsToRender, setStopsToRender] = useState<Stop[]>([]);

  const requestRiderLocation = (): void => {
    if (!navigator.geolocation) {
      setGpsError("Location access is not supported on this device.");
      setRiderLocation(manilaCenter);
      return;
    }

    if (gpsWatchRef.current !== null) {
      navigator.geolocation.clearWatch(gpsWatchRef.current);
      gpsWatchRef.current = null;
    }

    const successCallback = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      const newLocation: LatLngTuple = [latitude, longitude];
      setRiderLocation(newLocation);
      setGpsError(null);

      const accuracy = position.coords.accuracy;
      setGpsAccuracy(accuracy);
      if (accuracy < 10) {
        setGpsSignalQuality("excellent");
      } else if (accuracy < 25) {
        setGpsSignalQuality("good");
      } else if (accuracy < 100) {
        setGpsSignalQuality("fair");
      } else {
        setGpsSignalQuality("acquiring");
      }
      // GPS acquired — stop showing the initial loading indicator
      setIsLoading(false);
    };

    const errorCallback = (error: GeolocationPositionError) => {
      console.warn("GPS Error:", error.message);

      if (error.code === error.PERMISSION_DENIED) {
        setGpsError(
          "Please allow location access for the Rider app in your browser settings and reload the page.",
        );
      } else {
        setGpsError(`GPS: ${error.message}`);
      }

      setRiderLocation(manilaCenter);
      // Ensure loading is cleared when GPS fails and we fall back
      setIsLoading(false);
    };

    gpsWatchRef.current = navigator.geolocation.watchPosition(
      successCallback,
      errorCallback,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  // Recompute the nearest stop whenever rider location or stop list updates
  useEffect(() => {
    if (!riderLocation) {
      // no GPS yet — don't set a nearest stop
      return;
    }

    if (!stops || stops.length === 0) {
      setStopsToRender([]);
      return;
    }

    let nearest = stops[0];
    let nearestDist = haversineDistance(riderLocation, [
      nearest.lat,
      nearest.lng,
    ]);

    for (let i = 1; i < stops.length; i++) {
      const s = stops[i];
      const d = haversineDistance(riderLocation, [s.lat, s.lng]);
      if (d < nearestDist) {
        nearest = s;
        nearestDist = d;
      }
    }

    setStopsToRender([nearest]);
  }, [riderLocation, stops]);

  // Clear single-delivery route state when using multi-stop mode
  useEffect(() => {
    if (!deliveryId) {
      setRoute(null);
    }
  }, [deliveryId, stopsToRender]);
  const [isLoadingStops, setIsLoadingStops] = useState(false);

  // Start GPS tracking on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation not supported on this device");
      setRiderLocation(manilaCenter);
      return;
    }

    const successCallback = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      const newLocation: LatLngTuple = [latitude, longitude];
      setRiderLocation(newLocation);
      setGpsError(null);

      // Track GPS accuracy and signal quality.
      const accuracy = position.coords.accuracy;
      setGpsAccuracy(accuracy);
      if (accuracy < 10) {
        setGpsSignalQuality("excellent");
      } else if (accuracy < 25) {
        setGpsSignalQuality("good");
      } else if (accuracy < 100) {
        setGpsSignalQuality("fair");
      } else {
        setGpsSignalQuality("acquiring");
      }
    };

    const errorCallback = (error: GeolocationPositionError) => {
      console.warn("GPS Error:", error.message);
      setGpsError(`GPS: ${error.message}`);
      // Fallback to Manila
      setRiderLocation(manilaCenter);
    };

    // Start watching position with high accuracy
    gpsWatchRef.current = navigator.geolocation.watchPosition(
      successCallback,
      errorCallback,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );

    // Cleanup on unmount
    return () => {
      if (gpsWatchRef.current !== null) {
        navigator.geolocation.clearWatch(gpsWatchRef.current);
      }
    };
  }, []);

  // Load selected delivery in single-delivery mode
  useEffect(() => {
    let cancelled = false;

    const loadSelectedDelivery = async () => {
      if (!deliveryId) {
        setDelivery(null);
        return;
      }

      setIsLoading(true);
      try {
        const selected = await getRiderDeliveryById(deliveryId);
        if (cancelled) {
          return;
        }

        setDelivery(selected);
        if (!selected) {
          setRouteGeoError("Delivery not found for this route.");
        } else {
          setRouteGeoError(null);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }
        console.error("Error loading delivery details:", error);
        setDelivery(null);
        setRouteGeoError("Unable to load delivery details.");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadSelectedDelivery();

    return () => {
      cancelled = true;
    };
  }, [deliveryId]);

  // Load delivery data
  useEffect(() => {
    const loadStops = async () => {
      setIsLoadingStops(true);
      try {
        const data = await getRiderDeliveries();
        const active = (data || []).filter((d) => d.status === "In Progress");
        setDeliveriesList(active);

        const resolvedStops: Stop[] = [];
        for (const d of active) {
          // try to detect coords in navigationText or navigation_text
          const nav = String(
            (d as any).navigationText ?? (d as any).navigation_text ?? "",
          ).trim();
          let coords: LatLngTuple | null = null;
          const coordMatch = nav.match(/(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/);
          if (coordMatch) {
            const lat = Number(coordMatch[1]);
            const lon = Number(coordMatch[2]);
            if (Number.isFinite(lat) && Number.isFinite(lon)) {
              coords = [lat, lon];
            }
          }

          if (!coords) {
            coords = await geocodeAddress(String(d.address ?? ""));
          }

          if (coords) {
            resolvedStops.push({
              id: d.id,
              lat: coords[0],
              lng: coords[1],
              label: d.customer,
            });
          }
        }

        setStops(resolvedStops);
        // compute nearest stop to riderLocation (if available) and render only that
        if (resolvedStops.length > 0 && riderLocation) {
          let nearest = resolvedStops[0];
          let nearestDist = haversineDistance(riderLocation, [
            nearest.lat,
            nearest.lng,
          ]);
          for (let i = 1; i < resolvedStops.length; i++) {
            const s = resolvedStops[i];
            const d = haversineDistance(riderLocation, [s.lat, s.lng]);
            if (d < nearestDist) {
              nearest = s;
              nearestDist = d;
            }
          }
          setStopsToRender([nearest]);
        } else {
          setStopsToRender([]);
        }
      } catch (err) {
        console.error("Error loading stops:", err);
        setStops([]);
      } finally {
        setIsLoadingStops(false);
      }
    };

    void loadStops();
  }, [deliveryId]);

  // Geocode destination address
  useEffect(() => {
    const address = String(delivery?.address ?? "").trim();
    if (!address) {
      setDestinationCoords(null);
      if (deliveryId && delivery && address === "-") {
        setRouteGeoError("This delivery has no saved address.");
      }
      return;
    }

    const controller = new AbortController();

    const geocodeDestinationAddress = async () => {
      try {
        const coords = await geocodeAddress(address, controller.signal);
        if (!coords) {
          setRouteGeoError("Address not found");
          return;
        }

        setDestinationCoords(coords);
        setRouteGeoError(null);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return; // Request cancelled
        }
        setRouteGeoError("Geocoding error");
      }
    };

    geocodeDestinationAddress();

    return () => {
      controller.abort();
    };
  }, [delivery?.address]);

  // Build waypoints: origin (actual rider GPS) → destination
  useEffect(() => {
    const points: LatLngTuple[] = [];

    // Start from rider's actual GPS location
    if (riderLocation) {
      points.push(riderLocation);
    } else {
      // Fallback to Manila if GPS not yet available
      points.push(manilaCenter);
    }

    // Add destination
    if (destinationCoords) {
      points.push(destinationCoords);
    }

    setWaypoints(points);
  }, [riderLocation, destinationCoords]);

  // Calculate route when waypoints change
  useEffect(() => {
    if (waypoints.length < 2) {
      setRoute(null);
      return;
    }

    const calculateAndSetRoute = async () => {
      setIsCalculatingRoute(true);
      const calculatedRoute = await calculateRoute(waypoints);
      setRoute(calculatedRoute);

      setIsCalculatingRoute(false);

      // Set map bounds to fit route
      if (calculatedRoute?.geometry && calculatedRoute.geometry.length > 0) {
        const bounds = new LatLngBounds(
          calculatedRoute.geometry[0],
          calculatedRoute.geometry[calculatedRoute.geometry.length - 1],
        );
        calculatedRoute.geometry.forEach((coord) => bounds.extend(coord));
        mapRef.current = bounds;
        // Route calculated — hide initial loading indicator
        setIsLoading(false);
      }
    };

    calculateAndSetRoute();
  }, [waypoints]);

  // Update map center to first route point or rider location
  useEffect(() => {
    if (route?.geometry && route.geometry.length > 0) {
      setMapCenter(route.geometry[0]);
    } else if (riderLocation) {
      setMapCenter(riderLocation);
    } else if (destinationCoords) {
      setMapCenter(destinationCoords);
    }
  }, [route, riderLocation, destinationCoords]);

  const openGoogleMaps = () => {
    const destination = String(delivery?.address ?? "").trim();
    if (!destination) {
      return;
    }

    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=driving`;
    window.open(mapsUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <RiderAppLayout
      showBack
      backTo={
        deliveryId
          ? `/rider/deliveries/details?id=${encodeURIComponent(deliveryId)}`
          : "/rider/deliveries"
      }
    >
      {isLoading ? (
        <p className="m-0 mb-3 text-sm text-[#5b645c]">Loading map...</p>
      ) : null}
      {isCalculatingRoute ? (
        <p className="m-0 mb-3 text-sm text-[#5b645c]">Calculating route...</p>
      ) : null}
      {gpsError && (
        <p className="m-0 mb-3 text-sm text-amber-600">
          {gpsError} (using fallback location)
        </p>
      )}

      {/* Delivery Info Card */}
      <article className="bg-rider-details-card rounded-xl p-3 mb-3">
        <h2 className="m-0 text-[#0c631f] text-[1.4rem] font-black">
          Delivery Route
        </h2>
        <p className="m-0 mt-1 text-sm text-[#3e473f]">
          {delivery?.customer || "-"}
        </p>
        <p className="m-0 mt-1 text-sm text-[#4d564e]">
          {delivery?.address || "No address available."}
        </p>
      </article>

      {/* Route Summary Card */}
      {route && (
        <article className="bg-rider-details-card rounded-xl p-3 mb-3 border border-[#d4e4d5]">
          <div className="flex gap-4">
            <div>
              <p className="m-0 text-xs text-[#5b645c] font-semibold">
                DISTANCE
              </p>
              <p className="m-0 text-[1.2rem] font-bold text-[#0c631f]">
                {formatDistance(route.distance)}
              </p>
            </div>
            <div>
              <p className="m-0 text-xs text-[#5b645c] font-semibold">
                DURATION
              </p>
              <p className="m-0 text-[1.2rem] font-bold text-[#0c631f]">
                {formatDuration(route.duration)}
              </p>
            </div>
          </div>
        </article>
      )}

      {/* Error Messages */}
      {routeGeoError && (
        <article className="bg-red-50 rounded-xl p-3 mb-3 border border-red-200">
          <p className="m-0 text-sm text-red-700">{routeGeoError}</p>
        </article>
      )}

      {/* GPS Status Badge */}
      <article className="bg-blue-50 rounded-xl p-3 mb-3 border border-blue-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block w-3 h-3 rounded-full ${
              gpsSignalQuality === "excellent"
                ? "bg-green-600"
                : gpsSignalQuality === "good"
                  ? "bg-green-500"
                  : gpsSignalQuality === "fair"
                    ? "bg-amber-500"
                    : "bg-orange-600 animate-pulse"
            }`}
          ></span>
          <span className="text-sm font-semibold text-blue-900">
            GPS:{" "}
            {gpsSignalQuality.charAt(0).toUpperCase() +
              gpsSignalQuality.slice(1)}
          </span>
        </div>
        {gpsAccuracy !== null && (
          <span className="text-xs text-blue-700 font-mono bg-white px-2 py-1 rounded">
            ±{gpsAccuracy.toFixed(0)}m
          </span>
        )}
      </article>

      {/* Map Container: single-delivery mode uses existing Map; otherwise use RouteOptimizer for active deliveries */}
      <article className="rounded-xl overflow-hidden border border-[#c7cec7] mb-3">
        {deliveryId ? (
          <MapContainer
            center={mapCenter}
            zoom={13}
            className="rider-route-map"
          >
            {mapRef.current && <MapBoundsFitter bounds={mapRef.current} />}

            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Route Polyline */}
            {route?.geometry && route.geometry.length > 0 && (
              <Polyline
                positions={route.geometry}
                color="#0c631f"
                weight={4}
                opacity={0.8}
                dashArray="5, 5"
              />
            )}

            {/* Origin Marker (Rider's Actual GPS Location) */}
            {waypoints.length > 0 && (
              <Marker position={waypoints[0]} icon={originMarker}>
                <Popup>
                  <strong>Your Location</strong>
                  <br />
                  {riderLocation
                    ? `${riderLocation[0].toFixed(4)}, ${riderLocation[1].toFixed(4)}`
                    : "Current Position"}
                  <div className="text-xs text-[#5b645c] mt-1">
                    {gpsAccuracy !== null && (
                      <>
                        Accuracy: ±{gpsAccuracy.toFixed(0)}m{" "}
                        <span
                          className={`font-bold ${
                            gpsSignalQuality === "excellent"
                              ? "text-green-600"
                              : gpsSignalQuality === "good"
                                ? "text-green-500"
                                : gpsSignalQuality === "fair"
                                  ? "text-amber-500"
                                  : "text-orange-600"
                          }`}
                        >
                          (
                          {gpsSignalQuality.charAt(0).toUpperCase() +
                            gpsSignalQuality.slice(1)}
                          )
                        </span>
                      </>
                    )}
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Destination Marker (Customer) */}
            {waypoints.length > 1 && (
              <Marker
                position={waypoints[waypoints.length - 1]}
                icon={destinationMarker}
              >
                <Popup>
                  <strong>{delivery?.customer || "Delivery"}</strong>
                  <br />
                  {delivery?.address || "No address available."}
                </Popup>
              </Marker>
            )}
          </MapContainer>
        ) : (
          // multi-stop optimized route using RouteOptimizer
          <div className="w-full h-[420px]">
            <RouteOptimizer
              key={`nearest-${stopsToRender[0]?.id ?? "none"}`}
              riderLocation={riderLocation}
              stops={stopsToRender}
              fitBounds={true}
              onRoute={(orderedStops, r) => {
                // expose route data to current page state (distance/duration)
                setRoute(r);
                if (r && r.geometry && r.geometry.length > 0) {
                  const pts = r.geometry as LatLngTuple[];
                  setMapCenter(pts[0]);
                }
              }}
            />
          </div>
        )}
      </article>

      {/* Actions */}
      <div className="flex gap-2 flex-col">
        <div className="flex gap-2 md:flex-row flex-col">
          <button
            type="button"
            className="flex-1 border-none rounded-[11px] bg-[#707070] text-[#e9e9e9] px-4 py-3.25 text-[1.05rem] font-bold cursor-pointer hover:opacity-90"
            onClick={openGoogleMaps}
            disabled={!delivery?.address}
          >
            Open in Google Maps
          </button>
        </div>

        {deliveryId && (
          <button
            type="button"
            className="w-full border-none rounded-[11px] bg-[#1f9d3a] text-white px-4 py-3.25 text-[1.05rem] font-bold cursor-pointer hover:opacity-90"
            onClick={() => {
              // navigate to the delivery details page
              navigate(
                `/rider/deliveries/details?id=${encodeURIComponent(deliveryId)}`,
              );
            }}
          >
            Arrived
          </button>
        )}

        <button
          type="button"
          className="w-full border-none rounded-[11px] bg-[#3b7f4a] text-white px-4 py-3.25 text-[1.05rem] font-bold cursor-pointer hover:opacity-90"
          onClick={() => {
            // Manually refresh GPS location
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const { latitude, longitude } = position.coords;
                  setRiderLocation([latitude, longitude]);
                  setGpsError(null);

                  const accuracy = position.coords.accuracy;
                  setGpsAccuracy(accuracy);
                  if (accuracy < 10) {
                    setGpsSignalQuality("excellent");
                  } else if (accuracy < 25) {
                    setGpsSignalQuality("good");
                  } else if (accuracy < 100) {
                    setGpsSignalQuality("fair");
                  } else {
                    setGpsSignalQuality("acquiring");
                  }
                },
                (error) => {
                  setGpsError(`GPS Error: ${error.message}`);
                },
              );
            }
          }}
        >
          📍 Refresh GPS Location
        </button>
      </div>
    </RiderAppLayout>
  );
}
