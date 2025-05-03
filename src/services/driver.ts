
export interface Driver {
  id: string;
  name: string;
  vehicleType: string;
  location: {
    lat: number;
    lng: number;
  };
  status: 'Available' | 'Busy' | 'Offline'; // Added status
}

export async function getDrivers(): Promise<Driver[]> {
  // Simulate fetching drivers from a database or API
  return new Promise((resolve) => {
    setTimeout(() => {
      const fakeDrivers: Driver[] = [
        {
          id: "1",
          name: "Alice Smith",
          vehicleType: "Car",
          location: { lat: 34.0522, lng: -118.2437 }, // Los Angeles
          status: 'Available',
        },
        {
          id: "2",
          name: "Bob Johnson",
          vehicleType: "Motorcycle",
          location: { lat: 40.7128, lng: -74.0060 }, // New York
          status: 'Available',
        },
        {
          id: "3",
          name: "Charlie Brown",
          vehicleType: "Bicycle",
          location: { lat: 51.5074, lng: 0.1278 }, // London
          status: 'Busy',
        },
         {
          id: "4",
          name: "Diana Prince",
          vehicleType: "Van",
          location: { lat: 41.8781, lng: -87.6298 }, // Chicago
          status: 'Available',
        },
        {
          id: "5",
          name: "Ethan Hunt",
          vehicleType: "Scooter",
          location: { lat: 34.0580, lng: -118.2400 }, // Near LA
          status: 'Offline',
        },
      ];
      // Filter out offline drivers for the "Available Drivers" list potentially
      // resolve(fakeDrivers.filter(d => d.status !== 'Offline'));
      resolve(fakeDrivers); // Keep all for now, filter in UI if needed
    }, 700); // Increased delay slightly
  });
}
