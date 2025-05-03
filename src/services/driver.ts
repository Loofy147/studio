import { v4 as uuidv4 } from 'uuid';

// Define the Driver interface
export interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicleType: 'car' | 'motorcycle' | 'bicycle' | 'van';
  currentLocation?: { lat: number; lng: number }; // Optional: For real-time tracking
  status: 'active' | 'inactive' | 'pending'; // Driver status (pending approval, active, inactive)
  rating?: number; // Average customer rating
  // Add other relevant fields like license number, insurance details, etc.
  licensePlate?: string;
  joinedAt?: Date; // When the driver joined
}

// Mock data store for drivers
let mockDrivers: Driver[] | null = null;

// Helper to generate mock drivers
function generateMockDrivers(): Driver[] {
    const statuses: Driver['status'][] = ['active', 'inactive', 'pending'];
    const vehicleTypes: Driver['vehicleType'][] = ['car', 'motorcycle', 'bicycle', 'van'];
    const names = ["John Doe", "Jane Smith", "Mike Johnson", "Sarah Lee", "David Chen", "Maria Garcia"];
    const drivers: Driver[] = [];

    for (let i = 0; i < 15; i++) { // Generate 15 mock drivers
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        drivers.push({
            id: `driver-${uuidv4().substring(0, 8)}`,
            name: names[Math.floor(Math.random() * names.length)],
            phone: `555-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
            vehicleType: vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)],
            status: status,
            rating: status === 'active' ? parseFloat((3.5 + Math.random() * 1.5).toFixed(1)) : undefined, // Only active drivers have ratings
            licensePlate: `XYZ-${Math.floor(100 + Math.random() * 900)}`,
            joinedAt: new Date(Date.now() - Math.random() * 365 * 86400000), // Joined within the last year
            // Mock location (optional)
            // currentLocation: { lat: 34.0522 + (Math.random() - 0.5) * 0.1, lng: -118.2437 + (Math.random() - 0.5) * 0.1 }
        });
    }
    return drivers;
}

// Initialize mock data on first call
async function initializeMockDrivers() {
    if (!mockDrivers) {
        mockDrivers = generateMockDrivers();
    }
}

// Mock function to simulate fetching drivers
export async function getDrivers(): Promise<Driver[]> {
  console.log("Fetching drivers...");
  await initializeMockDrivers();
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Drivers fetched:", mockDrivers!.length);
      resolve([...mockDrivers!]); // Return a copy
    }, 300); // Simulate network delay
  });
}

// Mock function to get a single driver by ID
export async function getDriverById(driverId: string): Promise<Driver | null> {
    console.log(`Fetching driver by ID: ${driverId}`);
    await initializeMockDrivers();
    const driver = mockDrivers!.find(d => d.id === driverId);
    return new Promise((resolve) => {
        setTimeout(() => {
            if (driver) {
                console.log("Driver found:", driver.name);
                resolve(driver);
            } else {
                console.log("Driver not found");
                resolve(null);
            }
        }, 150);
    });
}

// Add functions for creating, updating, deleting drivers as needed for Admin panel
// e.g., updateDriverStatus, approveDriver, etc.
```