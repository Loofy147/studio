export interface Driver {
  id: string;
  name: string;
  vehicleType: string;
  location: {
    lat: number;
    lng: number;
  };
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
        },
        {
          id: "2",
          name: "Bob Johnson",
          vehicleType: "Motorcycle",
          location: { lat: 40.7128, lng: -74.0060 }, // New York
        },
        {
          id: "3",
          name: "Charlie Brown",
          vehicleType: "Bicycle",
          location: { lat: 51.5074, lng: 0.1278 }, // London
        },
      ];
      resolve(fakeDrivers);
    }, 500);
  });
}
