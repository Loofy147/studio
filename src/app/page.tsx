
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { getDrivers, Driver } from "@/services/driver";
import { MapComponent } from "@/components/map";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { predictEta, PredictEtaInput } from "@/ai/flows/predict-eta"; // Assuming this flow exists

// Basic Order interface for demonstration
interface Order {
  id: string;
  pickupLocation: { address: string; lat: number; lng: number };
  dropoffLocation: { address: string; lat: number; lng: number };
  status: string;
  items: string[];
}

// Mock order data
const mockOrder: Order = {
  id: "ORD123",
  pickupLocation: { address: "123 Main St, Anytown", lat: 34.0522, lng: -118.2437 }, // Example coords
  dropoffLocation: { address: "456 Oak Ave, Anytown", lat: 34.0622, lng: -118.2537 }, // Example coords
  status: "Order Placed",
  items: ["Pizza", "Salad"],
};

export default function Home() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [order, setOrder] = useState<Order>(mockOrder); // Use mock order
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(true);
  const [errorLoadingDrivers, setErrorLoadingDrivers] = useState<string | null>(null);
  const [estimatedEta, setEstimatedEta] = useState<string | null>(null);
  const [isPredictingEta, setIsPredictingEta] = useState(false);

  useEffect(() => {
    const fetchDrivers = async () => {
      setIsLoadingDrivers(true);
      setErrorLoadingDrivers(null);
      try {
        const driverList = await getDrivers();
        setDrivers(driverList);
      } catch (error) {
        console.error("Failed to fetch drivers:", error);
        setErrorLoadingDrivers("Failed to load drivers. Please try again later.");
      } finally {
        setIsLoadingDrivers(false);
      }
    };

    fetchDrivers();
  }, []);

  const handleDriverSelect = async (driver: Driver) => {
    setSelectedDriver(driver);
    // Simulate order status update or assignment
    setOrder((prevOrder) => ({ ...prevOrder, status: "Driver Assigned" }));
    setEstimatedEta(null); // Reset ETA when driver changes
    setIsPredictingEta(true);

    // Placeholder for calling the predictEta flow
    try {
       // Construct input for the ETA prediction flow
       const etaInput: PredictEtaInput = {
        driverLocation: driver.location,
        pickupLocation: order.pickupLocation,
        dropoffLocation: order.dropoffLocation,
        // Add other relevant factors if the flow requires them
        // e.g., trafficConditions: "moderate", weatherConditions: "sunny"
      };
      // Replace with actual call when Genkit is configured
      // const etaResult = await predictEta(etaInput);
      // setEstimatedEta(etaResult.eta);

      // Mock prediction for now
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate AI processing time
      const randomMinutes = Math.floor(Math.random() * (30 - 5 + 1)) + 5; // Random ETA between 5 and 30 mins
       setEstimatedEta(`${randomMinutes} minutes`);


    } catch (error) {
        console.error("Failed to predict ETA:", error);
        setEstimatedEta("Unavailable");
    } finally {
        setIsPredictingEta(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
       <header className="mb-6">
         <h1 className="text-3xl font-bold">SwiftDispatch Dashboard</h1>
         <p className="text-muted-foreground">Manage and track your deliveries.</p>
       </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Drivers & Order Info */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Driver Listing */}
          <Card className="flex-grow">
            <CardHeader>
              <CardTitle>Available Drivers</CardTitle>
              <CardDescription>Select a driver for the delivery.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 max-h-96 overflow-y-auto">
               {isLoadingDrivers ? (
                 <div className="space-y-2">
                   <Skeleton className="h-10 w-full" />
                   <Skeleton className="h-10 w-full" />
                   <Skeleton className="h-10 w-full" />
                 </div>
               ) : errorLoadingDrivers ? (
                  <p className="text-destructive">{errorLoadingDrivers}</p>
               ) : drivers.length > 0 ? (
                 <ul className="space-y-2">
                   {drivers.map((driver) => (
                     <li
                       key={driver.id}
                       className={cn(
                         "p-3 rounded-md hover:bg-muted cursor-pointer border transition-colors",
                         selectedDriver?.id === driver.id ? "bg-muted border-primary" : "border-transparent"
                       )}
                       onClick={() => handleDriverSelect(driver)}
                     >
                       <div className="font-semibold">{driver.name}</div>
                       <div className="text-sm text-muted-foreground">{driver.vehicleType} - {driver.status}</div>
                     </li>
                   ))}
                 </ul>
               ) : (
                 <p>No available drivers found.</p>
               )}
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
             <CardHeader>
               <CardTitle>Current Order: {order.id}</CardTitle>
               <CardDescription>Details for the ongoing delivery.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-3">
               <div>
                  <h4 className="font-semibold text-sm mb-1">Pickup:</h4>
                  <p className="text-sm text-muted-foreground">{order.pickupLocation.address}</p>
               </div>
               <div>
                  <h4 className="font-semibold text-sm mb-1">Dropoff:</h4>
                  <p className="text-sm text-muted-foreground">{order.dropoffLocation.address}</p>
                </div>
               <div>
                  <h4 className="font-semibold text-sm mb-1">Items:</h4>
                  <p className="text-sm text-muted-foreground">{order.items.join(', ')}</p>
                </div>
               <Separator />
                <div>
                  <h4 className="font-semibold text-sm mb-1">Status:</h4>
                  <p className="text-sm font-medium">{order.status}</p>
                </div>
                {selectedDriver && (
                 <div>
                   <h4 className="font-semibold text-sm mb-1">Assigned Driver:</h4>
                   <p className="text-sm text-muted-foreground">{selectedDriver.name}</p>
                 </div>
                )}
                {isPredictingEta ? (
                   <div>
                     <h4 className="font-semibold text-sm mb-1">Estimated ETA:</h4>
                     <Skeleton className="h-5 w-24" />
                   </div>
                 ) : estimatedEta && (
                    <div>
                     <h4 className="font-semibold text-sm mb-1">Estimated ETA:</h4>
                     <p className="text-sm font-medium">{estimatedEta}</p>
                   </div>
                 )}
             </CardContent>
          </Card>
        </div>

        {/* Column 2: Map & Tracking */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Tracking</CardTitle>
              <CardDescription>View the live delivery route and location.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 min-h-[600px]">
              {selectedDriver ? (
                <>
                  <div className="h-[500px] w-full bg-muted rounded-md flex items-center justify-center">
                     {/* Replace with actual map component */}
                    <MapComponent
                        driverLocation={selectedDriver.location}
                        pickupLocation={order.pickupLocation}
                        dropoffLocation={order.dropoffLocation}
                     />
                  </div>
                </>
              ) : (
                <div className="h-[500px] w-full bg-muted rounded-md flex items-center justify-center">
                    <p className="text-muted-foreground">Select a driver to view the map and tracking details.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
