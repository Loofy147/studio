
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getUserProfile, UserProfile, DeliveryAddress, addUserAddress, updateUserAddress, deleteUserAddress } from '@/services/store';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, MapPin, Home, Briefcase, Plus, Edit, Trash2, XCircle, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AddressDialog } from '../AddressDialog'; // Assuming AddressDialog is in parent folder
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Re-define AddressFormData if needed or import from a shared types file
interface AddressFormData {
    id?: string;
    label: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
    isDefault: boolean;
}

export default function AddressesPage() {
    const userId = "user123"; // Hardcoded for demo
    const { toast } = useToast();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
    const [currentAddress, setCurrentAddress] = useState<AddressFormData | null>(null);

     // Animation variants
    const containerVariants = {
        hidden: { opacity: 1 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
    };

     // Fetch profile which includes addresses
    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const profileData = await getUserProfile(userId);
                setProfile(profileData);
                 if (!profileData) {
                    setError("Could not load your profile and addresses.");
                }
            } catch (err: any) {
                console.error("Failed to fetch profile/addresses:", err);
                setError(err.message || "Could not load addresses. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [userId]);


    const handleOpenAddressDialog = (address?: DeliveryAddress) => {
        setCurrentAddress(address ? { ...address } : null);
        setIsAddressDialogOpen(true);
    };

     const handleSaveAddress = async (addressFormData: AddressFormData) => {
        if (!profile) return;
        // Logic moved from AddressDialog to here
        try {
            let updatedProfile: UserProfile | null = null;
            if (addressFormData.id) { // Editing existing address
                updatedProfile = await updateUserAddress(userId, addressFormData.id, addressFormData);
            } else { // Adding new address
                const { id, ...newAddressData } = addressFormData;
                updatedProfile = await addUserAddress(userId, newAddressData as Omit<DeliveryAddress, 'id'>);
            }
            if (updatedProfile) {
                setProfile(updatedProfile); // Update local profile state
                 toast({ title: "Address Saved", description: "Your address list has been updated." });
                setIsAddressDialogOpen(false);
            } else {
                 throw new Error("Failed to save address.");
            }
        } catch (error) {
            console.error("Error saving address:", error);
            toast({ title: "Error Saving Address", description: "Could not save the address. Please try again.", variant: "destructive" });
             throw error; // Re-throw so AddressDialog knows it failed
        }
    };

     const handleDeleteAddress = useCallback(async (addressId: string) => {
        if (!profile) return;
        try {
            const updatedProfile = await deleteUserAddress(userId, addressId);
            if (updatedProfile) {
                setProfile(updatedProfile);
                 toast({ title: "Address Deleted", description: "The address has been removed.", variant: 'destructive' });
            } else {
                 toast({ title: "Deletion Failed", description: "Could not delete the address. Make sure it's not your only or default address.", variant: 'destructive' });
            }
        } catch (error) {
            console.error("Error deleting address:", error);
            toast({ title: "Error Deleting Address", description: "An error occurred while deleting the address.", variant: 'destructive' });
        }
    }, [userId, profile, toast]);


    const AddressCardSkeleton = () => (
        <Card className="animate-pulse border p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                 <Skeleton className="h-8 w-8 rounded bg-muted/50" />
                <div className="space-y-1.5">
                    <Skeleton className="h-5 w-32 bg-muted/50" />
                    <Skeleton className="h-4 w-48 bg-muted/50" />
                </div>
            </div>
             <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded-md bg-muted/50" />
                <Skeleton className="h-8 w-8 rounded-md bg-muted/50" />
             </div>
        </Card>
    );

    return (
         <div className="container mx-auto py-10 space-y-8">
            <div>
                <Link href="/profile" passHref legacyBehavior>
                    <Button variant="ghost" size="sm" className="mb-2 text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <MapPin className="h-7 w-7 text-primary" /> Your Delivery Addresses
                </h1>
                 <p className="text-muted-foreground mt-1">Manage your saved addresses for quicker checkout.</p>
            </div>

             {error && (
                <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Error Loading Addresses</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Button onClick={() => handleOpenAddressDialog()} variant="default">
                <Plus className="mr-2 h-4 w-4" /> Add New Address
            </Button>


            {isLoading ? (
                <motion.div
                    className="space-y-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <AddressCardSkeleton />
                    <AddressCardSkeleton />
                </motion.div>
            ) : profile && profile.addresses.length > 0 ? (
                <motion.div
                    className="space-y-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    layout // Animate layout shifts when items are removed
                >
                   <AnimatePresence>
                        {profile.addresses.map((address) => (
                            <motion.div key={address.id} variants={itemVariants} layout exit="exit">
                                <Card className="border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                                     <div className="flex items-center gap-4">
                                         {address.label === 'Home' ? <Home className="h-5 w-5 text-primary/80 shrink-0 mt-1" /> :
                                         address.label === 'Work' ? <Briefcase className="h-5 w-5 text-primary/80 shrink-0 mt-1" /> :
                                         <MapPin className="h-5 w-5 text-primary/80 shrink-0 mt-1" />}
                                        <div>
                                            <p className="font-semibold flex items-center">
                                                {address.label}
                                                {address.isDefault && (
                                                    <Badge variant="secondary" className="ml-2 text-xs px-1.5 py-0 h-5">
                                                        <Check className="h-3 w-3 mr-0.5"/> Default
                                                    </Badge>
                                                )}
                                            </p>
                                            <p className="text-sm text-muted-foreground">{address.street}, {address.city}, {address.state} {address.zipCode} {address.country && `(${address.country})`}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-3 sm:mt-0 self-end sm:self-center">
                                        <Button variant="outline" size="sm" onClick={() => handleOpenAddressDialog(address)} className="flex items-center gap-1">
                                             <Edit className="h-3.5 w-3.5"/> Edit
                                        </Button>
                                         <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="text-destructive hover:bg-destructive/10 h-9 w-9"
                                                    title={`Delete ${address.label} Address`}
                                                    disabled={profile.addresses.length === 1 || (address.isDefault && profile.addresses.length > 1)} // Disable if only 1 or if default & > 1 address
                                                >
                                                    <Trash2 className="h-4 w-4"/>
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                <AlertDialogTitle>Delete Address?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to delete the address labeled "{address.label}"?
                                                    {address.isDefault && profile.addresses.length > 1 && " You must set another address as default before deleting this one."}
                                                     {profile.addresses.length === 1 && " You cannot delete your only address."}
                                                </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleDeleteAddress(address.id)}
                                                    className={buttonVariants({ variant: "destructive" })}
                                                    disabled={profile.addresses.length === 1 || (address.isDefault && profile.addresses.length > 1)} // Double disable check
                                                    >
                                                    Yes, Delete
                                                </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                   </AnimatePresence>
                </motion.div>
            ) : !error && !isLoading ? ( // Show only if not loading and no error
                 <Card className="border-dashed border-muted-foreground/30 bg-card/50">
                    <CardContent className="p-10 text-center text-muted-foreground">
                        <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30"/>
                        <p className="text-lg font-medium">No addresses saved yet.</p>
                        <p className="text-sm mt-1">Click "Add New Address" to get started.</p>
                    </CardContent>
                 </Card>
            ) : null}

             {/* Address Dialog Component */}
             {profile && ( // Only render dialog if profile exists (needed for userAddresses prop)
                 <AddressDialog
                    isOpen={isAddressDialogOpen}
                    onOpenChange={setIsAddressDialogOpen}
                    addressData={currentAddress}
                    onSave={handleSaveAddress}
                    userId={userId}
                    userAddresses={profile.addresses || []} // Pass current addresses
                 />
             )}
        </div>
    );
}

    