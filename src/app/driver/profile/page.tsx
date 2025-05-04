
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { getDriverById, Driver } from '@/services/driver';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Phone, Truck, Star, Edit, Save, Loader2, Bike } from 'lucide-react'; // Use Bike instead of Moped
import { motion } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


// Mock update function
async function updateDriverProfile(driverId: string, data: Partial<Driver>): Promise<Driver | null> {
  console.log(`Updating profile for driver ${driverId}`, data);
  await new Promise(resolve => setTimeout(resolve, 800));
  // In a real app, update the backend
  // For demo, find and update in mock data (careful, this is not persistent)
   const driverIndex = mockDrivers!.findIndex(d => d.id === driverId);
   if (driverIndex !== -1) {
       mockDrivers![driverIndex] = { ...mockDrivers![driverIndex], ...data };
       return { ...mockDrivers![driverIndex] }; // Return the updated mock data
   }
  return null; // Return null if not found (or throw error)
}

// Temp definition until service file is fixed
let mockDrivers: Driver[] | null = null;


export default function DriverProfilePage() {
  const { toast } = useToast();
  const driverId = 'driver-001'; // Replace with actual driver ID logic

  const [driver, setDriver] = useState<Driver | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state for editable fields
  const [formData, setFormData] = useState<Partial<Driver>>({});

  useEffect(() => {
    const fetchDriverData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getDriverById(driverId);
         // Assign mock data if service call fails (for development)
        if (!mockDrivers) mockDrivers = [ // Initialize if not already done
             {id: 'driver-001', name: 'Driver Dan', email: 'dan.driver@dispatch.com', phone: '555-555-6666', vehicleType: 'car', status: 'active', availability: 'available', rating: 4.7, licensePlate: 'DRV-123', joinedAt: new Date(Date.now() - 90*86400000)}
         ];
        const driverData = data ?? mockDrivers.find(d => d.id === driverId) ?? null; // Fallback to mock

        if (driverData) {
          setDriver(driverData);
          setFormData({ // Initialize form data
            name: driverData.name,
            phone: driverData.phone,
            email: driverData.email,
            vehicleType: driverData.vehicleType,
            vehicleDetails: driverData.vehicleDetails,
            licensePlate: driverData.licensePlate,
          });
        } else {
          setError("Could not find your driver profile.");
        }
      } catch (err) {
        console.error("Failed to fetch driver data:", err);
        setError("Failed to load profile. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDriverData();
  }, [driverId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

   const handleSelectChange = (name: keyof Driver, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
      if (!driver) return;
      setIsSaving(true);
      try {
          const updatedDriverData = await updateDriverProfile(driverId, formData);
          // If update successful, update local state 'driver'
          if (updatedDriverData) {
            setDriver(updatedDriverData);
            toast({ title: "Profile Updated", description: "Your profile details have been saved." });
            setIsEditing(false);
          } else {
             throw new Error("Failed to update profile on the server.");
          }
      } catch (err) {
          toast({ title: "Save Failed", description: "Could not save profile changes.", variant: "destructive"});
      } finally {
          setIsSaving(false);
      }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };


  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardHeader className="flex flex-row items-center gap-4"><Skeleton className="h-20 w-20 rounded-full" /><Skeleton className="h-10 w-1/2" /></CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </CardContent>
           <CardFooter><Skeleton className="h-10 w-24 ml-auto" /></CardFooter>
        </Card>
      </div>
    );
  }

  if (error || !driver) {
    return <p className="text-destructive">{error || "Driver profile not available."}</p>;
  }

  return (
    <motion.div
        className="space-y-6 max-w-3xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={cardVariants}
    >
      <h1 className="text-3xl font-bold tracking-tight">Your Driver Profile</h1>

      <Card className="shadow-md">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
           <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border-2 border-primary/30">
                    <AvatarImage src={`https://avatar.vercel.sh/${driver.email || driver.id}?size=80`} alt={driver.name} />
                    <AvatarFallback className="text-2xl bg-muted">{driver.name.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-2xl">{driver.name}</CardTitle>
                    {driver.rating && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500"/>
                            <span>{driver.rating.toFixed(1)} Average Rating</span>
                        </div>
                    )}
                     <p className="text-xs text-muted-foreground mt-1">Joined: {driver.joinedAt ? new Date(driver.joinedAt).toLocaleDateString() : 'N/A'}</p>
                </div>
           </div>
           <Button variant={isEditing ? "secondary" : "outline"} onClick={() => setIsEditing(!isEditing)} size="sm">
               {isEditing ? <XCircle className="mr-2 h-4 w-4"/> : <Edit className="mr-2 h-4 w-4" />}
               {isEditing ? 'Cancel Editing' : 'Edit Profile'}
           </Button>
        </CardHeader>

        <CardContent className="space-y-5 pt-4">
          {/* Contact Information */}
          <div className="space-y-3 border p-4 rounded-md bg-background">
            <h3 className="font-semibold text-lg flex items-center gap-2"><User className="h-5 w-5 text-primary"/>Contact Information</h3>
             {isEditing ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div className="space-y-1">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" name="name" value={formData.name || ''} onChange={handleInputChange} />
                         </div>
                         <div className="space-y-1">
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" name="phone" type="tel" value={formData.phone || ''} onChange={handleInputChange} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" value={formData.email || ''} onChange={handleInputChange} />
                    </div>
                </>
             ) : (
                 <>
                    <p className="text-sm flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground"/> <strong>Email:</strong> {driver.email || 'Not provided'}</p>
                    <p className="text-sm flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground"/> <strong>Phone:</strong> {driver.phone}</p>
                 </>
             )}
          </div>

          {/* Vehicle Information */}
           <div className="space-y-3 border p-4 rounded-md bg-background">
                <h3 className="font-semibold text-lg flex items-center gap-2"><Truck className="h-5 w-5 text-primary"/>Vehicle Information</h3>
                 {isEditing ? (
                    <>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <div className="space-y-1">
                                <Label htmlFor="vehicleType">Vehicle Type</Label>
                                <Select name="vehicleType" value={formData.vehicleType} onValueChange={(value) => handleSelectChange('vehicleType', value)}>
                                    <SelectTrigger id="vehicleType">
                                        <SelectValue placeholder="Select vehicle" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="car">Car</SelectItem>
                                        <SelectItem value="motorcycle">Motorcycle</SelectItem>
                                        <SelectItem value="bicycle">Bicycle</SelectItem>
                                        <SelectItem value="scooter">Scooter</SelectItem>
                                        <SelectItem value="van">Van</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                             </div>
                             <div className="space-y-1">
                                <Label htmlFor="licensePlate">License Plate</Label>
                                <Input id="licensePlate" name="licensePlate" value={formData.licensePlate || ''} onChange={handleInputChange} />
                            </div>
                        </div>
                         {formData.vehicleType === 'other' && (
                             <div className="space-y-1">
                                <Label htmlFor="vehicleDetails">Specify Vehicle</Label>
                                <Input id="vehicleDetails" name="vehicleDetails" placeholder="e.g., Electric Cargo Bike" value={formData.vehicleDetails || ''} onChange={handleInputChange} />
                            </div>
                         )}
                    </>
                 ) : (
                    <>
                        <p className="text-sm flex items-center gap-2"><Truck className="h-4 w-4 text-muted-foreground"/> <strong>Vehicle:</strong> <span className="capitalize">{driver.vehicleType}</span> {driver.vehicleType === 'other' && driver.vehicleDetails ? `(${driver.vehicleDetails})` : ''}</p>
                        <p className="text-sm flex items-center gap-2"><span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">LP</span> <strong>License Plate:</strong> {driver.licensePlate || 'N/A'}</p>
                    </>
                 )}
           </div>

        </CardContent>
         {isEditing && (
            <CardFooter className="border-t pt-4 justify-end">
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                </Button>
            </CardFooter>
         )}
      </Card>
    </motion.div>
  );
}

// Add XCircle icon
import { XCircle } from 'lucide-react';
