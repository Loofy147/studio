'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { getDriverById, Driver, DriverAvailability, updateDriverAvailability } from '@/services/driver';
import { useToast } from '@/hooks/use-toast';
import { User, Activity, Bell, MessageSquare, Map, CheckCircle, XCircle, Loader2, Power, PowerOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function DriverDashboardPage() {
  const { toast } = useToast();
  // Assume driver ID is obtained from authentication
  const driverId = 'driver-001'; // Replace with actual driver ID logic

  const [driver, setDriver] = useState<Driver | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  useEffect(() => {
    const fetchDriverData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getDriverById(driverId);
        if (data) {
          setDriver(data);
        } else {
          setError("Could not find your driver profile.");
        }
      } catch (err) {
        console.error("Failed to fetch driver data:", err);
        setError("Failed to load dashboard. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDriverData();
  }, [driverId]);

  const handleAvailabilityToggle = async (checked: boolean) => {
    if (!driver) return;
    const newAvailability: DriverAvailability = checked ? 'available' : 'offline';
    setIsTogglingStatus(true);

    try {
      const updatedDriver = await updateDriverAvailability(driverId, newAvailability);
      if (updatedDriver) {
        setDriver(updatedDriver);
        toast({
          title: `Status Updated: ${checked ? 'Available' : 'Offline'}`,
          description: `You are now ${checked ? 'online and available' : 'offline'}.`,
          variant: 'default',
        });
      } else {
        throw new Error("Failed to update status on server.");
      }
    } catch (err) {
      console.error("Failed to update availability:", err);
      toast({
        title: "Update Failed",
        description: "Could not update your status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const getAvailabilityBadge = (availability: DriverAvailability) => {
    switch (availability) {
      case 'available':
        // Use theme colors for consistency
        return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-700/50"><CheckCircle className="h-3 w-3 mr-1"/>Available</Badge>;
      case 'busy':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700"><Loader2 className="h-3 w-3 mr-1 animate-spin"/>Busy</Badge>;
      case 'offline':
        return <Badge variant="outline" className="bg-gray-100 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400 border-gray-300 dark:border-gray-700"><XCircle className="h-3 w-3 mr-1"/>Offline</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Animation variants
   const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-48 bg-muted/50" />
        <Card className="bg-card border-border">
          <CardHeader><Skeleton className="h-6 w-1/2 bg-muted/50" /></CardHeader>
          <CardContent><Skeleton className="h-20 w-full bg-muted/50" /></CardContent>
          <CardFooter><Skeleton className="h-10 w-32 bg-muted/50" /></Card>
        </Card>
        <Card className="bg-card border-border">
           <CardHeader><Skeleton className="h-6 w-1/3 bg-muted/50" /></CardHeader>
           <CardContent><Skeleton className="h-16 w-full bg-muted/50" /></CardContent>
        </Card>
      </div>
    );
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

  if (!driver) {
     return <p className="text-muted-foreground">Driver profile not loaded.</p>;
  }

   if (driver.status === 'pending') {
    return (
       <Alert variant="default" className="border-yellow-500 bg-yellow-50 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300">
            <Bell className="h-4 w-4 text-yellow-600 dark:text-yellow-400"/>
           <AlertTitle>Account Pending Approval</AlertTitle>
           <AlertDescription>
                Your application is under review. You will be notified once it's approved. You cannot go online until approved.
           </AlertDescription>
        </Alert>
    );
  }

   if (driver.status === 'inactive') {
    return (
       <Alert variant="destructive">
           <XCircle className="h-4 w-4"/>
           <AlertTitle>Account Disabled</AlertTitle>
           <AlertDescription>
                Your driver account is currently disabled. Please contact support for assistance.
           </AlertDescription>
        </Alert>
    );
  }


  return (
    <motion.div
        className="space-y-8"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
    >
      {/* Use driver foreground color */}
      <motion.h1 variants={cardVariants} className="text-3xl font-bold tracking-tight text-[var(--driver-foreground)]">Driver Dashboard</motion.h1>

      {/* Status & Availability Card */}
      <motion.div variants={cardVariants}>
        {/* Apply driver card styles */}
        <Card className="shadow-lg border-[var(--driver-border)] bg-[var(--driver-card)] text-[var(--driver-card-foreground)]">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2"><Activity className="h-5 w-5 text-primary"/> Your Status</span>
                {getAvailabilityBadge(driver.availability)}
            </CardTitle>
            <CardDescription>Toggle your availability to receive new delivery requests.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center space-x-4">
             <div className="flex items-center space-x-2">
                <Switch
                    id="availability-toggle"
                    checked={driver.availability === 'available'}
                    onCheckedChange={handleAvailabilityToggle}
                    disabled={isTogglingStatus || driver.status !== 'active'} // Disabled if not active or toggling
                    aria-label={driver.availability === 'available' ? 'Set status to Offline' : 'Set status to Available'}
                    // Apply driver theme primary color to switch
                    className="data-[state=checked]:bg-primary"
                />
                <Label htmlFor="availability-toggle" className={cn("text-lg font-medium", driver.availability === 'available' ? 'text-green-600' : 'text-muted-foreground')}>
                    {driver.availability === 'available' ? 'Available for Orders' : 'Offline'}
                </Label>
            </div>
             {isTogglingStatus && <Loader2 className="h-5 w-5 animate-spin text-primary"/>}
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">
              You are currently {driver.availability}. Set to 'Available' to receive new orders.
            </p>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Quick Actions Card */}
       <motion.div variants={cardVariants}>
            {/* Apply driver card styles */}
            <Card className="bg-[var(--driver-card)] text-[var(--driver-card-foreground)] border-[var(--driver-border)]">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Map className="h-5 w-5 text-primary"/>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Use driver theme colors for buttons */}
                    <Button variant="outline" size="lg" className="flex flex-col h-auto py-4 gap-1 border-[var(--driver-border)] hover:bg-accent hover:text-accent-foreground">
                        <MessageSquare className="h-6 w-6 mb-1"/>
                        <span>View Orders</span>
                    </Button>
                    <Button variant="outline" size="lg" className="flex flex-col h-auto py-4 gap-1 border-[var(--driver-border)] hover:bg-accent hover:text-accent-foreground">
                        <Map className="h-6 w-6 mb-1"/>
                        <span>Current Route</span>
                    </Button>
                     <Button variant="outline" size="lg" className="flex flex-col h-auto py-4 gap-1 border-[var(--driver-border)] hover:bg-accent hover:text-accent-foreground">
                        <User className="h-6 w-6 mb-1"/>
                        <span>My Profile</span>
                    </Button>
                     <Button variant="outline" size="lg" className="flex flex-col h-auto py-4 gap-1 border-[var(--driver-border)] hover:bg-accent hover:text-accent-foreground relative">
                        <Bell className="h-6 w-6 mb-1"/>
                        <span>Notifications</span>
                         {/* Use driver theme colors */}
                         <Badge variant="destructive" className="absolute top-2 right-2 bg-destructive text-destructive-foreground">3</Badge>
                    </Button>
                </CardContent>
            </Card>
       </motion.div>

        {/* Order Requests/Current Delivery Placeholder */}
         <motion.div variants={cardVariants}>
            {/* Apply driver card styles */}
            <Card className="bg-[var(--driver-card)] text-[var(--driver-card-foreground)] border-[var(--driver-border)]">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-primary"/>Delivery Requests</CardTitle>
                    <CardDescription>Incoming delivery orders will appear here.</CardDescription>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground py-12">
                    <p>No new delivery requests right now.</p>
                    {driver.availability !== 'available' && (
                        <p className="text-sm mt-2">Go online to start receiving orders.</p>
                    )}
                </CardContent>
                {/* Example: Display current delivery info if driver is 'busy' */}
                {driver.availability === 'busy' && (
                     <CardFooter className="border-t pt-4 border-[var(--driver-border)]">
                        <p className="text-sm text-primary font-medium">Currently on delivery to 123 Main St.</p>
                        {/* Add more details */}
                     </CardFooter>
                )}
            </Card>
         </motion.div>

    </motion.div>
  );
}
