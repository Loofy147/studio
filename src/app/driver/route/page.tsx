
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MapPin, Package, Store, Home, Phone, Navigation, CheckCircle, XCircle, Loader2 } from 'lucide-react'; // Added relevant icons
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';
import Link from 'next/link'; // Import Link

// Mock Order Data for Current Route
interface RouteOrder {
    orderId: string;
    storeName: string;
    storeAddress: string;
    customerName: string;
    deliveryAddress: string;
    customerPhone?: string; // Optional
    items: { name: string; quantity: number }[];
    status: 'picking_up' | 'en_route' | 'arrived_at_destination'; // Simplified route status
    estimatedTimeMinutes?: number; // Optional estimated remaining time
}

// Mock function to get current route details (replace with actual API call)
async function getCurrentRoute(driverId: string): Promise<RouteOrder | null> {
    console.log(`Fetching current route for driver ${driverId}`);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay

    // Simulate states: no active route, or an active route
    const hasActiveRoute = Math.random() > 0.3; // 70% chance of having an active route

    if (!hasActiveRoute) {
        return null;
    }

    const statuses: RouteOrder['status'][] = ['picking_up', 'en_route', 'arrived_at_destination'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    return {
        orderId: `order-${Math.random().toString(36).substring(2, 10)}`,
        storeName: ['ElectroMart', 'FreshGrocer', 'Mama Mia Pizzeria'][Math.floor(Math.random() * 3)],
        storeAddress: `${100 + Math.floor(Math.random() * 899)} Store St, Anytown`,
        customerName: ['Alex Ryder', 'Beth Green', 'Carlos Villa'][Math.floor(Math.random() * 3)],
        deliveryAddress: `${200 + Math.floor(Math.random() * 799)} Customer Ave, Anytown`,
        customerPhone: `555-123-${Math.floor(1000 + Math.random() * 9000)}`,
        items: [
            { name: 'Premium Laptop', quantity: 1 },
            { name: 'Wireless Mouse', quantity: 1 },
        ],
        status: status,
        estimatedTimeMinutes: status === 'en_route' ? Math.floor(Math.random() * 20) + 5 : undefined,
    };
}

// Mock function to update order status (e.g., mark as delivered)
async function updateOrderStatusOnRoute(orderId: string, newStatus: 'delivered' | 'issue_reported'): Promise<boolean> {
    console.log(`Updating order ${orderId} status to ${newStatus}`);
    await new Promise(resolve => setTimeout(resolve, 400));
    // In a real app, update the backend
    return true; // Simulate success
}


export default function DriverRoutePage() {
    const driverId = 'driver-001'; // Replace with actual driver ID
    const [currentRoute, setCurrentRoute] = useState<RouteOrder | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    useEffect(() => {
        const fetchRoute = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const routeData = await getCurrentRoute(driverId);
                setCurrentRoute(routeData);
            } catch (err) {
                console.error("Failed to fetch route:", err);
                setError("Could not load current route information. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchRoute();
    }, [driverId]);

     const handleMarkDelivered = async () => {
        if (!currentRoute) return;
        setIsUpdatingStatus(true);
        try {
             const success = await updateOrderStatusOnRoute(currentRoute.orderId, 'delivered');
             if (success) {
                 // Refetch route or update local state to show no active route
                 setCurrentRoute(null); // Simulate completion
                 // Show success toast
             } else {
                 throw new Error("Failed to update status on server.");
             }
        } catch (err) {
             console.error("Failed to mark as delivered:", err);
             // Show error toast
        } finally {
             setIsUpdatingStatus(false);
        }
    };


    const MapPlaceholder = () => (
        <div className="h-80 md:h-96 w-full bg-muted rounded-lg flex items-center justify-center text-muted-foreground border border-dashed border-muted-foreground/30">
             <MapPin className="h-12 w-12 opacity-30" />
            <span className="ml-2">Live Map Placeholder</span>
        </div>
    );

     const RouteSkeleton = () => (
        <div className="space-y-8 animate-pulse">
            <Skeleton className="h-8 w-56 bg-muted/50" />
            <Skeleton className="h-96 w-full bg-muted/50 rounded-lg" />
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-3/4 bg-muted/50" />
                    <Skeleton className="h-4 w-1/2 bg-muted/50" />
                </CardHeader>
                 <CardContent className="space-y-4">
                     <Skeleton className="h-5 w-24 bg-muted/50" />
                     <Skeleton className="h-4 w-full bg-muted/50" />
                     <Skeleton className="h-5 w-28 bg-muted/50 mt-4" />
                     <Skeleton className="h-4 w-full bg-muted/50" />
                 </CardContent>
                 <CardFooter className="flex justify-end gap-2">
                      <Skeleton className="h-10 w-28 bg-muted/50" />
                      <Skeleton className="h-10 w-36 bg-muted/50" />
                 </CardFooter>
            </Card>
        </div>
     );


    if (isLoading) {
        return <RouteSkeleton />;
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

     const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    };


    return (
        <motion.div
            className="space-y-8"
            initial="hidden"
            animate="visible"
            variants={cardVariants}
         >
            <h1 className="text-3xl font-bold tracking-tight text-[var(--driver-foreground)] flex items-center gap-2">
                <Navigation className="h-7 w-7 text-primary" /> Current Route
            </h1>

            {currentRoute ? (
                 <>
                     <MapPlaceholder />

                     <Card className="bg-[var(--driver-card)] text-[var(--driver-card-foreground)] border-[var(--driver-border)] shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-xl">Order #{currentRoute.orderId.substring(currentRoute.orderId.length - 6)}</CardTitle>
                            <CardDescription className="flex items-center gap-2 pt-1">
                                {currentRoute.status === 'picking_up' && <Store className="h-4 w-4 text-orange-500"/>}
                                {currentRoute.status === 'en_route' && <Truck className="h-4 w-4 text-blue-500"/>}
                                {currentRoute.status === 'arrived_at_destination' && <Home className="h-4 w-4 text-green-500"/>}
                                <span className="capitalize font-medium">
                                    Status: {currentRoute.status.replace('_', ' ')}
                                     {currentRoute.estimatedTimeMinutes && ` (Est. ${currentRoute.estimatedTimeMinutes} min)`}
                                </span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {/* Pickup Details */}
                            <div className="space-y-2">
                                <h3 className="font-semibold flex items-center gap-2"><Store className="h-5 w-5 text-muted-foreground"/> Pickup Location</h3>
                                <p className="text-sm font-medium">{currentRoute.storeName}</p>
                                <p className="text-sm text-muted-foreground">{currentRoute.storeAddress}</p>
                            </div>
                            <Separator />
                             {/* Delivery Details */}
                            <div className="space-y-2">
                                <h3 className="font-semibold flex items-center gap-2"><Home className="h-5 w-5 text-muted-foreground"/> Delivery Destination</h3>
                                <p className="text-sm font-medium">{currentRoute.customerName}</p>
                                <p className="text-sm text-muted-foreground">{currentRoute.deliveryAddress}</p>
                                 {currentRoute.customerPhone && (
                                     <Button variant="link" className="p-0 h-auto text-sm text-primary">
                                        <Phone className="mr-1.5 h-3.5 w-3.5"/> Call Customer
                                    </Button>
                                 )}
                            </div>
                             <Separator />
                             {/* Order Items */}
                             <div className="space-y-2">
                                <h3 className="font-semibold flex items-center gap-2"><Package className="h-5 w-5 text-muted-foreground"/> Order Items</h3>
                                <ul className="text-sm list-disc list-inside pl-2 text-muted-foreground space-y-1">
                                    {currentRoute.items.map((item, index) => (
                                        <li key={index}><span className="font-medium text-[var(--driver-card-foreground)]">{item.quantity}x</span> {item.name}</li>
                                    ))}
                                </ul>
                             </div>
                        </CardContent>
                         <CardFooter className="flex flex-col sm:flex-row justify-end gap-3 border-t border-[var(--driver-border)] pt-4">
                            <Button variant="outline" className="w-full sm:w-auto border-[var(--driver-border)]">Report Issue</Button>
                             <Button
                                className="w-full sm:w-auto"
                                disabled={isUpdatingStatus}
                                onClick={handleMarkDelivered}
                             >
                                {isUpdatingStatus ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                                Mark as Delivered
                             </Button>
                         </CardFooter>
                     </Card>
                 </>
            ) : (
                 <Card className="bg-[var(--driver-card)] text-[var(--driver-card-foreground)] border-[var(--driver-border)] shadow-sm">
                    <CardContent className="p-10 text-center text-muted-foreground">
                        <Truck className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30"/>
                        <p className="text-lg font-medium">No active route</p>
                        <p className="text-sm mt-2">You currently don't have an assigned delivery.</p>
                        <p className="text-sm">Make sure you are set to 'Available' in the dashboard to receive orders.</p>
                         <Link href="/driver/dashboard" passHref>
                            <Button variant="link" className="mt-4 text-primary">Go to Dashboard</Button>
                         </Link>
                    </CardContent>
                 </Card>
            )}

        </motion.div>
    );
}
