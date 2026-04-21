# Advanced Routing Examples & Code Snippets

## Table of Contents
1. [Complete Examples](#complete-examples)
2. [Advanced Waypoint Management](#advanced-waypoint-management)
3. [Custom UI Components](#custom-ui-components)
4. [Performance Optimization](#performance-optimization)
5. [Integration Patterns](#integration-patterns)

---

## Complete Examples

### Example 1: Multi-Stop Delivery Route

```typescript
// src/rider/pages/RiderMultiDeliveryMap.tsx
import React, { useState, useEffect } from 'react';
import { calculateRoute, formatDistance, formatDuration } from '../lib/routingService';

interface DeliveryStop {
  id: string;
  customer: string;
  address: string;
  coords?: [number, number];
}

export function MultiStopDeliveryMap() {
  const [stops, setStops] = useState<DeliveryStop[]>([]);
  const [route, setRoute] = useState(null);

  // Build route through all stops
  useEffect(() => {
    const buildRoute = async () => {
      // Geocode all addresses
      const coordsPromises = stops.map(async (stop) => {
        if (stop.coords) return stop.coords;
        
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(stop.address)}`
        );
        const data = await response.json();
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      });

      const allCoords = await Promise.all(coordsPromises);
      
      // Calculate route through all waypoints
      const calculatedRoute = await calculateRoute(allCoords);
      setRoute(calculatedRoute);
    };

    if (stops.length >= 2) {
      buildRoute();
    }
  }, [stops]);

  return (
    <div>
      <h2>Multi-Stop Route</h2>
      {route && (
        <div>
          <p>Total Distance: {formatDistance(route.distance)}</p>
          <p>Total Duration: {formatDuration(route.duration)}</p>
          <p>Number of Stops: {stops.length}</p>
        </div>
      )}
    </div>
  );
}
```

---

### Example 2: Route History Tracking

```typescript
// src/rider/lib/routeHistory.ts

interface RouteRecord {
  id: string;
  deliveryId: string;
  waypoints: LatLngTuple[];
  distance: number;
  duration: number;
  actualTime: number;
  timestamp: Date;
}

let routeHistory: RouteRecord[] = [];

export function recordRoute(record: Omit<RouteRecord, 'id' | 'timestamp'>) {
  const historyRecord: RouteRecord = {
    ...record,
    id: crypto.randomUUID(),
    timestamp: new Date(),
  };
  
  routeHistory.push(historyRecord);
  
  // Save to localStorage or Supabase
  localStorage.setItem('routeHistory', JSON.stringify(routeHistory));
  
  return historyRecord;
}

export function getRouteAnalytics(deliveryId?: string) {
  const filtered = deliveryId 
    ? routeHistory.filter(r => r.deliveryId === deliveryId)
    : routeHistory;

  return {
    totalRoutes: filtered.length,
    averageDistance: filtered.reduce((sum, r) => sum + r.distance, 0) / filtered.length,
    averageDuration: filtered.reduce((sum, r) => sum + r.duration, 0) / filtered.length,
    totalDistance: filtered.reduce((sum, r) => sum + r.distance, 0),
    accuracy: filtered.filter(r => r.duration > 0)
      .map(r => (r.actualTime / r.duration))
      .reduce((a, b) => a + b, 0) / filtered.length,
  };
}
```

---

### Example 3: Real-time Route Updates with GPS

```typescript
// src/rider/lib/gpsTracking.ts

export interface GPSTracker {
  watchId: number | null;
  onLocationChange: (coords: LatLngTuple) => void;
}

export function startGPSTracking(
  onLocationChange: (coords: LatLngTuple) => void,
  options?: PositionOptions
): GPSTracker {
  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      onLocationChange([latitude, longitude]);
    },
    (error) => {
      console.error('GPS Error:', error.message);
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
      ...options,
    }
  );

  return {
    watchId,
    onLocationChange,
  };
}

export function stopGPSTracking(tracker: GPSTracker) {
  if (tracker.watchId !== null) {
    navigator.geolocation.clearWatch(tracker.watchId);
  }
}
```

**Usage in component:**

```typescript
export function LiveMapComponent() {
  const [riderLocation, setRiderLocation] = useState<LatLngTuple | null>(null);
  const trackerRef = useRef<GPSTracker | null>(null);

  useEffect(() => {
    // Start GPS tracking
    trackerRef.current = startGPSTracking((coords) => {
      setRiderLocation(coords);
      
      // Recalculate route with new origin
      recalculateRoute(coords, destination);
    });

    return () => {
      if (trackerRef.current) {
        stopGPSTracking(trackerRef.current);
      }
    };
  }, []);

  return <MapContainer center={riderLocation || manilaCenter} />;
}
```

---

## Advanced Waypoint Management

### Smart Waypoint Ordering (TSP - Traveling Salesman Problem)

```typescript
// src/rider/lib/waypointOptimization.ts
import { calculateRoute } from './routingService';

/**
 * Optimize order of waypoints to minimize distance
 * Simple nearest-neighbor heuristic (good for <10 stops)
 */
export async function optimizeWaypoints(
  waypoints: LatLngTuple[]
): Promise<LatLngTuple[]> {
  if (waypoints.length <= 2) return waypoints;

  const [origin, ...destinations] = waypoints;
  const optimized = [origin];
  const remaining = [...destinations];

  // Start from origin, greedily pick nearest unvisited
  while (remaining.length > 0) {
    const lastPoint = optimized[optimized.length - 1];
    
    let nearestIdx = 0;
    let nearestDistance = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const distance = haversineDistance(lastPoint, remaining[i]);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIdx = i;
      }
    }

    optimized.push(remaining[nearestIdx]);
    remaining.splice(nearestIdx, 1);
  }

  return optimized;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function haversineDistance(
  [lat1, lon1]: LatLngTuple,
  [lat2, lon2]: LatLngTuple
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Usage example
 */
export async function buildOptimalRoute(deliveries: any[]) {
  // Extract addresses and geocode
  const waypoints = await Promise.all(
    deliveries.map(async (d) => {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(d.address)}`
      );
      const [result] = await response.json();
      return [parseFloat(result.lat), parseFloat(result.lon)];
    })
  );

  // Optimize order
  const optimized = await optimizeWaypoints(waypoints);

  // Calculate final route
  const route = await calculateRoute(optimized);
  
  return {
    route,
    optimizedDeliveries: optimized.map(coords => 
      deliveries.find(d => /* match by geocoded coords */)
    ),
  };
}
```

---

## Custom UI Components

### Route Details Sidebar

```typescript
// src/rider/components/RouteDetailsSidebar.tsx

interface RouteDetailsProps {
  route: RouteResponse;
  waypoints: string[]; // Customer names
  currentStop?: number;
}

export function RouteDetailsSidebar({
  route,
  waypoints,
  currentStop = 0,
}: RouteDetailsProps) {
  return (
    <aside className="w-80 bg-white p-4 overflow-y-auto border-r">
      <h2 className="text-lg font-bold mb-4">
        Route Details ({waypoints.length} stops)
      </h2>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard
          label="Total Distance"
          value={formatDistance(route.distance)}
        />
        <StatCard
          label="Total Time"
          value={formatDuration(route.duration)}
        />
      </div>

      {/* Waypoints List */}
      <div className="space-y-2">
        {waypoints.map((waypoint, idx) => (
          <WaypointItem
            key={idx}
            number={idx + 1}
            name={waypoint}
            isActive={idx === currentStop}
            isCompleted={idx < currentStop}
            legDistance={route.routes[0]?.legs[idx]?.distance}
            legDuration={route.routes[0]?.legs[idx]?.duration}
          />
        ))}
      </div>
    </aside>
  );
}

function WaypointItem({
  number,
  name,
  isActive,
  isCompleted,
  legDistance,
  legDuration,
}: any) {
  return (
    <div
      className={`p-3 rounded-lg border-l-4 ${
        isActive
          ? 'bg-blue-50 border-blue-500'
          : isCompleted
          ? 'bg-green-50 border-green-500'
          : 'bg-gray-50 border-gray-300'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
            isActive
              ? 'bg-blue-500 text-white'
              : isCompleted
              ? 'bg-green-500 text-white'
              : 'bg-gray-300 text-gray-700'
          }`}
        >
          {number}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900">{name}</p>
          <p className="text-xs text-gray-500">
            {legDistance && formatDistance(legDistance)} •{' '}
            {legDuration && formatDuration(legDuration)}
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

### Route Comparison View

```typescript
// src/rider/components/RouteComparison.tsx

interface RouteOption {
  name: string;
  distance: number;
  duration: number;
  polyline: LatLngTuple[];
  features: string[];
}

export function RouteComparison({ options }: { options: RouteOption[] }) {
  const [selected, setSelected] = useState(options[0].name);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {options.map((option) => (
        <div
          key={option.name}
          onClick={() => setSelected(option.name)}
          className={`p-4 border-2 rounded-lg cursor-pointer transition ${
            selected === option.name
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <h3 className="font-bold">{option.name}</h3>
          
          <div className="mt-3 space-y-2 text-sm">
            <p>
              <span className="font-semibold">Distance:</span>{' '}
              {formatDistance(option.distance)}
            </p>
            <p>
              <span className="font-semibold">Time:</span>{' '}
              {formatDuration(option.duration)}
            </p>
          </div>

          <div className="mt-3 flex gap-1 flex-wrap">
            {option.features.map((feature) => (
              <span
                key={feature}
                className="text-xs bg-gray-100 px-2 py-1 rounded"
              >
                {feature}
              </span>
            ))}
          </div>

          {selected === option.name && (
            <div className="mt-3 pt-3 border-t">
              <button className="w-full bg-green-500 text-white py-2 rounded font-semibold">
                Select This Route
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## Performance Optimization

### Route Caching Strategy

```typescript
// src/rider/lib/routeCache.ts

interface CachedRoute {
  key: string;
  waypoints: LatLngTuple[];
  route: RouteResponse;
  timestamp: number;
}

class RouteCache {
  private cache: Map<string, CachedRoute> = new Map();
  private maxAge = 1000 * 60 * 60; // 1 hour
  private maxSize = 100; // Max cached routes

  private getKey(waypoints: LatLngTuple[]): string {
    return waypoints
      .map(([lat, lng]) => `${lat.toFixed(4)},${lng.toFixed(4)}`)
      .join('|');
  }

  set(waypoints: LatLngTuple[], route: RouteResponse) {
    const key = this.getKey(waypoints);

    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldest = Array.from(this.cache.values()).sort(
        (a, b) => a.timestamp - b.timestamp
      )[0];
      this.cache.delete(oldest.key);
    }

    this.cache.set(key, {
      key,
      waypoints,
      route,
      timestamp: Date.now(),
    });
  }

  get(waypoints: LatLngTuple[]): RouteResponse | null {
    const key = this.getKey(waypoints);
    const cached = this.cache.get(key);

    if (!cached) return null;

    // Check if expired
    if (Date.now() - cached.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    return cached.route;
  }

  clear() {
    this.cache.clear();
  }
}

export const routeCache = new RouteCache();
```

**Usage:**

```typescript
import { routeCache } from '../lib/routeCache';

export async function calculateRouteWithCache(waypoints: LatLngTuple[]) {
  // Check cache first
  const cached = routeCache.get(waypoints);
  if (cached) {
    console.log('Using cached route');
    return cached;
  }

  // Fetch and cache
  const route = await calculateRoute(waypoints);
  if (route) {
    routeCache.set(waypoints, route);
  }

  return route;
}
```

---

### Debounced Route Recalculation

```typescript
// src/rider/lib/debounce.ts

export function debounce<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  delayMs: number
) {
  let timeoutId: NodeJS.Timeout;

  return async (...args: T): Promise<R | null> => {
    clearTimeout(timeoutId);

    return new Promise((resolve) => {
      timeoutId = setTimeout(async () => {
        const result = await fn(...args);
        resolve(result);
      }, delayMs);
    });
  };
}
```

**Usage in component:**

```typescript
const debouncedCalculateRoute = useMemo(
  () => debounce(calculateRoute, 500),
  []
);

useEffect(() => {
  if (waypoints.length >= 2) {
    debouncedCalculateRoute(waypoints).then(setRoute);
  }
}, [waypoints]);
```

---

## Integration Patterns

### With Supabase Delivery Queue

```typescript
// src/rider/lib/deliveryQueue.ts

export async function getOptimizedDeliveryQueue(riderId: string) {
  // Fetch pending deliveries for rider
  const { data: deliveries } = await supabase
    .from('orders')
    .select('id, customer, address, priority')
    .eq('rider_id', riderId)
    .eq('status', 'pending');

  // Geocode all addresses
  const withCoords = await Promise.all(
    deliveries.map(async (d) => {
      const coords = await geocodeAddress(d.address);
      return { ...d, coords };
    })
  );

  // Get rider's current location
  const riderLocation = await getRiderLocation(riderId);

  // Build optimized route
  const optimized = await optimizeWaypoints([
    riderLocation,
    ...withCoords.map(d => d.coords),
  ]);

  // Match back to deliveries
  return optimized.slice(1).map(coords =>
    withCoords.find(d =>
      Math.abs(d.coords[0] - coords[0]) < 0.001 &&
      Math.abs(d.coords[1] - coords[1]) < 0.001
    )
  );
}
```

---

### With Analytics Tracking

```typescript
// src/rider/lib/routeAnalytics.ts

export async function trackDeliveryRoute(
  deliveryId: string,
  riderLocation: LatLngTuple,
  destination: LatLngTuple,
  actualDuration: number
) {
  const route = await calculateRoute([riderLocation, destination]);

  await supabase
    .from('delivery_analytics')
    .insert({
      delivery_id: deliveryId,
      estimated_distance: route?.distance,
      estimated_duration: route?.duration,
      actual_duration: actualDuration,
      efficiency_ratio: actualDuration / (route?.duration || 1),
      timestamp: new Date(),
    });
}

// Generate reports
export async function getDeliveryEfficiencyReport(
  riderId: string,
  daysBack: number = 7
) {
  const { data } = await supabase
    .from('delivery_analytics')
    .select('*')
    .gte('timestamp', new Date(Date.now() - daysBack * 86400000));

  return {
    totalDeliveries: data.length,
    averageEfficiency:
      data.reduce((sum, r) => sum + r.efficiency_ratio, 0) / data.length,
    totalDistance: data.reduce((sum, r) => sum + r.estimated_distance, 0),
    trends: calculateTrends(data),
  };
}
```

---

## Testing Utilities

```typescript
// src/rider/lib/routeTestUtils.ts

export const MANILA_LANDMARKS = {
  mallOfAsia: [14.5331, 120.8863] as LatLngTuple,
  bgc: [14.5597, 121.0448] as LatLngTuple,
  makati: [14.5545, 121.0254] as LatLngTuple,
  sm_mall: [14.6197, 121.017] as LatLngTuple,
};

export async function testRoute(
  name: string,
  from: LatLngTuple,
  to: LatLngTuple
) {
  console.log(`Testing route: ${name}`);
  const start = performance.now();
  
  const route = await calculateRoute([from, to]);
  const duration = performance.now() - start;

  console.log(
    `✓ ${name}: ${formatDistance(route?.distance)} in ${formatDuration(route?.duration)} (API took ${duration.toFixed(0)}ms)`
  );

  return route;
}

// Run all tests
export async function runAllTests() {
  await testRoute('Mall of Asia → BGC', MANILA_LANDMARKS.mallOfAsia, MANILA_LANDMARKS.bgc);
  await testRoute('Makati → SM Mall', MANILA_LANDMARKS.makati, MANILA_LANDMARKS.sm_mall);
  await testRoute('BGC → Makati', MANILA_LANDMARKS.bgc, MANILA_LANDMARKS.makati);
}
```

---

## Configuration

Add to your `.env.local`:

```env
# Routing
VITE_OSRM_API_BASE=https://router.project-osrm.org
VITE_NOMINATIM_API_BASE=https://nominatim.openstreetmap.org
VITE_ROUTE_CACHE_MAX_AGE=3600000

# Optional - for ORS or Mapbox
VITE_ORS_API_KEY=your_key
VITE_MAPBOX_API_KEY=your_key
```

---

These examples provide a foundation for building sophisticated routing features. Customize based on your specific delivery workflow!
