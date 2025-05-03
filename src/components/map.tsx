
"use client";

import Image from 'next/image'; // Use next/image for optimization

interface Location {
  lat: number;
  lng: number;
}

interface MapComponentProps {
  driverLocation: Location;
  pickupLocation?: Location; // Optional pickup location marker
  dropoffLocation?: Location; // Optional dropoff location marker
}

export const MapComponent: React.FC<MapComponentProps> = ({
    driverLocation,
    pickupLocation,
    dropoffLocation
}) => {
  // In a real app, you'd use a map library (Leaflet, Mapbox GL JS, Google Maps SDK)
  // and plot the locations as markers, possibly drawing a route.
  // For this placeholder, we use a static image.

  // Use latitude/longitude to vary the placeholder image slightly
  // Combine all location data for a more varied seed
  const seedValues = [
      driverLocation.lat, driverLocation.lng,
      pickupLocation?.lat, pickupLocation?.lng,
      dropoffLocation?.lat, dropoffLocation?.lng
    ].filter(v => v !== undefined).join(',');
  const randomSeed = seedValues; // Use combined string as seed


  // Simulate marker positions based on lat/lng relative to a center point (e.g., Anytown's rough center)
  // This is HIGHLY simplified and not geographically accurate projection.
  // A real map library handles this properly.
  const centerLat = 34.05;
  const centerLng = -118.25;
  const scale = 400; // Adjust this to control how spread out markers are

  const calculatePosition = (loc: Location | undefined) => {
      if (!loc) return { left: '50%', top: '50%' }; // Default if no location
      // Very basic linear mapping - assumes a flat plane!
      const leftPercent = 50 + (loc.lng - centerLng) * scale;
      const topPercent = 50 - (loc.lat - centerLat) * scale; // Latitude increases downwards on screens usually

      // Clamp values to stay roughly within bounds (0-100)
      const clamp = (val: number) => Math.max(5, Math.min(95, val));

      return {
          left: `${clamp(leftPercent)}%`,
          top: `${clamp(topPercent)}%`
      };
  };


  return (
    <div className="relative w-full h-full overflow-hidden"> {/* Added overflow-hidden */}
      <Image
        // Use a more relevant placeholder source if possible
        src={`https://picsum.photos/seed/${randomSeed}/800/600`}
        alt="Map showing delivery route and driver location"
        layout="fill" // Fill the container
        objectFit="cover" // Cover the area, might crop
        className="rounded-md"
        priority // Prioritize loading if it's above the fold or critical
        data-ai-hint="city map navigation route" // AI hint for image generation
      />
       {/* Markers */}
       {/* Driver Marker (Blue) */}
      {driverLocation && (
          <div className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2" style={calculatePosition(driverLocation)} title={`Driver: ${driverLocation.lat.toFixed(4)}, ${driverLocation.lng.toFixed(4)}`}>
             <svg viewBox="0 0 24 24" fill="hsl(var(--primary))" className="drop-shadow-md">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
             </svg>
          </div>
      )}
      {/* Pickup Marker (Green) */}
       {pickupLocation && (
          <div className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2" style={calculatePosition(pickupLocation)} title={`Pickup: ${pickupLocation.lat.toFixed(4)}, ${pickupLocation.lng.toFixed(4)}`}>
              <svg viewBox="0 0 24 24" fill="rgb(34 197 94)" className="drop-shadow-md"> {/* Green color */}
                 <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
          </div>
      )}
      {/* Dropoff Marker (Red) */}
       {dropoffLocation && (
          <div className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2" style={calculatePosition(dropoffLocation)} title={`Dropoff: ${dropoffLocation.lat.toFixed(4)}, ${dropoffLocation.lng.toFixed(4)}`}>
              <svg viewBox="0 0 24 24" fill="rgb(239 68 68)" className="drop-shadow-md"> {/* Red color */}
                 <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
          </div>
      )}
       <div className="absolute bottom-2 left-2 bg-background/80 p-1 px-2 rounded text-xs shadow">
           Map Placeholder
       </div>
    </div>
  );
};
