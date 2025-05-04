import { v4 as uuidv4 } from 'uuid';

// Define the Driver interface
export type DriverStatus = 'active' | 'inactive' | 'pending'; // Admin status
export type DriverAvailability = 'available' | 'busy' | 'offline'; // Driver-set status

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email?: string; // Added email
  vehicleType: 'car' | 'motorcycle' | 'bicycle' | 'van' | 'scooter' | 'other';
  vehicleDetails?: string; // For 'other' or specific details like make/model
  currentLocation?: { lat: number; lng: number }; // Optional: For real-time tracking
  status: DriverStatus; // Driver status (pending approval, active, inactive) - Managed by Admin
  availability: DriverAvailability; // Driver availability (available, busy, offline) - Managed by Driver
  rating?: number; // Average customer rating
  licensePlate?: string;
  joinedAt?: Date; // When the driver joined
}

// Mock data store for drivers
let mockDrivers: Driver[] | null = null;

// Helper to generate mock drivers
function generateMockDrivers(): Driver[] {
    const statuses: DriverStatus[] = ['active', 'inactive', 'pending'];
    const availabilities: DriverAvailability[] = ['available', 'busy', 'offline'];
    const vehicleTypes: Driver['vehicleType'][] = ['car', 'motorcycle', 'bicycle', 'van', 'scooter'];
    const names = ["John Doe", "Jane Smith", "Mike Johnson", "Sarah Lee", "David Chen", "Maria Garcia", "Driver Dan", "Fast Fiona"];
    const drivers: Driver[] = [];

    for (let i = 0; i < 15; i++) { // Generate 15 mock drivers
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const availability = status === 'active' ? availabilities[Math.floor(Math.random() * availabilities.length)] : 'offline';
        const name = names[Math.floor(Math.random() * names.length)]
        drivers.push({
            id: `driver-${uuidv4().substring(0, 8)}`,
            name: name,
            email: `${name.split(' ')[0].toLowerCase()}@driver.example.com`,
            phone: `555-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
            vehicleType: vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)],
            status: status,
            availability: availability,
            rating: status === 'active' ? parseFloat((3.5 + Math.random() * 1.5).toFixed(1)) : undefined, // Only active drivers have ratings
            licensePlate: `DRV-${Math.floor(100 + Math.random() * 900)}`,
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
                resolve({...driver}); // Return a copy
            } else {
                console.log("Driver not found");
                resolve(null);
            }
        }, 150);
    });
}

// Mock function for driver to update their availability status
export async function updateDriverAvailability(driverId: string, availability: DriverAvailability): Promise<Driver | null> {
    console.log(`Updating availability for driver ${driverId} to ${availability}`);
    await initializeMockDrivers();
    const driverIndex = mockDrivers!.findIndex(d => d.id === driverId);

    if (driverIndex === -1) {
        console.error(`Driver ${driverId} not found`);
        return null; // Or throw an error
    }
    if (mockDrivers![driverIndex].status !== 'active') {
        console.warn(`Driver ${driverId} is not active. Cannot change availability.`);
        // Optionally, allow offline setting even if inactive/pending
        if (availability !== 'offline') {
            return mockDrivers![driverIndex]; // Return current state without changes
        }
    }

    mockDrivers![driverIndex].availability = availability;
    console.log(`Driver ${driverId} availability set to ${availability}`);

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({...mockDrivers![driverIndex]}); // Return updated driver copy
        }, 100); // Simulate quick update
    });
}


// Add functions for creating, updating, deleting drivers as needed for Admin panel
// e.g., updateDriverStatus, approveDriver, etc.
