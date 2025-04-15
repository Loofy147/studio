"use client";

interface Location {
  lat: number;
  lng: number;
}

interface MapComponentProps {
  driverLocation: Location;
}

export const MapComponent: React.FC<MapComponentProps> = ({ driverLocation }) => {
  return (
    <img
      src={`https://picsum.photos/600/300?random=${driverLocation.lat}`} // Placeholder map
      alt="Delivery Route"
      className="w-full h-full object-cover rounded-md"
    />
  );
};
