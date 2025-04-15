"use client";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {useEffect, useState} from "react";
import {getDrivers} from "@/services/driver";
import {Driver} from "@/services/driver";
import {MapComponent} from "@/components/map";

export default function Home() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [orderStatus, setOrderStatus] = useState("Order Placed");

  useEffect(() => {
    const fetchDrivers = async () => {
      const driverList = await getDrivers();
      setDrivers(driverList);
    };

    fetchDrivers();
  }, []);

  const handleDriverSelect = (driver: Driver) => {
    setSelectedDriver(driver);
  };

  return (
    <div className="container mx-auto p-4 flex gap-4">
      {/* Driver Listing */}
      <div className="w-1/4">
        <Card>
          <CardHeader>
            <CardTitle>Available Drivers</CardTitle>
            <CardDescription>Select a driver for your delivery.</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <ul>
              {drivers.map((driver) => (
                <li
                  key={driver.id}
                  className="mb-2 p-2 rounded hover:bg-secondary cursor-pointer"
                  onClick={() => handleDriverSelect(driver)}
                >
                  {driver.name} - {driver.vehicleType}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Map & Order Status */}
      <div className="w-3/4">
        <Card>
          <CardHeader>
            <CardTitle>Delivery Tracking</CardTitle>
            <CardDescription>View the delivery route and status.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {selectedDriver ? (
              <>
                <div className="h-64">
                  <MapComponent driverLocation={selectedDriver.location} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Order Status:</h3>
                  <p>{orderStatus}</p>
                </div>
              </>
            ) : (
              <p>Select a driver to view delivery details.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
