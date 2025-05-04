"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserProfile, UserProfile, Order, getUserOrders, Subscription, getUserSubscriptions, updateSubscriptionStatus, DailyOffer, DeliveryAddress, addUserAddress, updateUserAddress, deleteUserAddress } from "@/services/store"; // Import address functions
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { User, ShoppingBag, MapPin, Phone, Mail, Award, Edit, Settings, LogOut, PackageCheck, Truck, Hourglass, XCircle, Eye, CalendarClock, Play, Pause, Trash2, Repeat, Home, Briefcase, Plus, Building, Lock, CreditCard, Bell, Users as UsersIcon, Store as StoreIcon } from 'lucide-react'; // Added UsersIcon, StoreIcon
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { cn } from "@/lib/utils";
import React from 'react';
import { useToast } from '@/hooks/use-toast'; // Import useToast
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
} from "@/components/ui/alert-dialog" // Import Alert Dialog
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // For edit forms
import { Label } from "@/components/ui/label"; // For edit forms
import { Checkbox } from "@/components/ui/checkbox"; // For default address
import { AddressDialog } from './AddressDialog'; // Import AddressDialog component
import { motion, AnimatePresence } from 'framer-motion'; // Import motion


// Helper to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

// Map status to icon and variant for the order table
const orderStatusDetails: Record<Order['status'], { icon: React.ElementType; variant: BadgeProps['variant']; color: string }> = {
    'Pending': { icon: Hourglass, variant: 'outline', color: 'text-yellow-600 dark:text-yellow-400' },
    'Processing': { icon: Settings, variant: 'outline', color: 'text-blue-600 dark:text-blue-400' },
    'Shipped': { icon: Truck, variant: 'secondary', color: 'text-purple-600 dark:text-purple-400' },
    'Delivered': { icon: PackageCheck, variant: 'default', color: 'text-green-600 dark:text-green-400' }, // Use default for styling below
    'Cancelled': { icon: XCircle, variant: 'destructive', color: 'text-red-600 dark:text-red-400' }
};

// Map status to icon and variant for the subscription table
const subscriptionStatusDetails: Record<Subscription['status'], { icon: React.ElementType; variant: BadgeProps['variant']; color: string; label: string }> = {
    'active': { icon: Play, variant: 'default', color: 'text-green-600 dark:text-green-400', label: 'Active' },
    'paused': { icon: Pause, variant: 'secondary', color: 'text-yellow-600 dark:text-yellow-400', label: 'Paused' },
    'cancelled': { icon: XCircle, variant: 'destructive', color: 'text-red-600 dark:text-red-400', label: 'Cancelled' }
};


// Define BadgeProps type locally if not exported from Badge component
import { type VariantProps } from "class-variance-authority"
import { badgeVariants } from "@/components/ui/badge"
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

// Define state for the address form
interface AddressFormData {
    id?: string; // Optional for editing
    label: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
    isDefault: boolean;
}

export default function ProfilePage() {
  // In a real app, you'd get the userId from authentication context
  const userId = "user123"; // Hardcoded for demonstration
  const { toast } = useToast();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isLoadingSubs, setIsLoadingSubs] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingSubId, setUpdatingSubId] = useState<string | null>(null);

  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<AddressFormData | null>(null);


  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates on unmounted component

    const fetchProfileData = async () => {
      setIsLoadingProfile(true);
      setError(null); // Reset primary error on new fetch attempt
      try {
        const profileData = await getUserProfile(userId);
        if (isMounted) {
            setProfile(profileData);
             if (!profileData) {
                 // Set error only if profile specifically failed
                 setError(prev => prev ? `${prev} Failed to load profile.` : "Failed to load profile.");
             }
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
         if (isMounted) setError(prev => prev ? `${prev} Failed to load profile information.` : "Failed to load profile information.");
      } finally {
         if (isMounted) setIsLoadingProfile(false);
      }
    };

    const fetchOrders = async () => {
        setIsLoadingOrders(true);
        try {
            const orderData = await getUserOrders(userId);
             if (isMounted) {
                setOrders(orderData.sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime()).slice(0, 5));
             }
        } catch (err) {
            console.error("Failed to fetch orders:", err);
             if (isMounted) setError(prev => prev ? `${prev} Failed to load recent orders.` : "Failed to load recent orders.");
        } finally {
             if (isMounted) setIsLoadingOrders(false);
        }
    }

    const fetchSubscriptions = async () => {
        setIsLoadingSubs(true);
         try {
            const subData = await getUserSubscriptions(userId);
             if (isMounted) {
                setSubscriptions(subData.sort((a, b) => b.startDate.getTime() - a.startDate.getTime()));
             }
         } catch (err) {
            console.error("Failed to fetch subscriptions:", err);
             if (isMounted) setError(prev => prev ? `${prev} Failed to load subscriptions.` : "Failed to load subscriptions.");
         } finally {
             if (isMounted) setIsLoadingSubs(false);
         }
    }

    fetchProfileData();
    fetchOrders();
    fetchSubscriptions();

    return () => {
        isMounted = false; // Cleanup function to set flag false when component unmounts
    }
  }, [userId]);

  const handleUpdateSubscription = async (subId: string, newStatus: Subscription['status']) => {
        setUpdatingSubId(subId);
        try {
             const updatedSub = await updateSubscriptionStatus(subId, newStatus);
             if (updatedSub) {
                setSubscriptions(prevSubs =>
                    prevSubs.map(sub => (sub.id === subId ? updatedSub : sub))
                );
                 toast({
                    title: `Subscription ${newStatus}`,
                    description: `Your subscription has been successfully ${newStatus}.`,
                    variant: newStatus === 'cancelled' ? 'destructive' : 'default',
                 });
             } else {
                 throw new Error("Subscription not found or update failed.");
             }
        } catch (err) {
            console.error(`Failed to ${newStatus} subscription:`, err);
            toast({
                title: "Update Failed",
                description: `Could not ${newStatus} the subscription. Please try again.`,
                variant: "destructive",
            });
        } finally {
            setUpdatingSubId(null);
        }
    };


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
                 // Create a new object without the 'id' property if it exists
                const { id, ...newAddressData } = addressFormData;
                updatedProfile = await addUserAddress(userId, newAddressData as Omit<DeliveryAddress, 'id'>);
            }
            if (updatedProfile) {
                setProfile(updatedProfile);
                 toast({ title: "Address Saved", description: "Your address has been updated successfully." });
                setIsAddressDialogOpen(false);
            } else {
                 throw new Error("Failed to save address.");
            }
        } catch (error) {
            console.error("Error saving address:", error);
            toast({ title: "Error Saving Address", description: "Could not save the address. Please try again.", variant: "destructive" });
            // Rethrow or handle error so AddressDialog knows saving failed
             throw error;
        }
    };

     const handleDeleteAddress = async (addressId: string) => {
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
    };

  const ProfileInfoSkeleton = () => (
     <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6">
             <Skeleton className="h-24 w-24 rounded-full" />
             <div className="space-y-2 flex-grow">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-5 w-64" />
             </div>
            <div className="flex gap-2 self-start sm:self-center">
                <Skeleton className="h-9 w-28" />
                <Skeleton className="h-9 w-28" />
            </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6 pt-0">
            <Separator />
             {/* Address Skeleton */}
              <div className="space-y-4">
                 <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-9 w-24" />
                 </div>
                 <div className="space-y-3">
                     <Skeleton className="h-16 w-full" />
                     <Skeleton className="h-16 w-full" />
                 </div>
             </div>
             <Separator />
             {/* Friends/Followed Stores Skeleton */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                     <Skeleton className="h-7 w-7 rounded" />
                     <Skeleton className="h-5 w-32" />
                  </div>
                   <div className="flex items-center gap-3">
                     <Skeleton className="h-7 w-7 rounded" />
                     <Skeleton className="h-5 w-36" />
                  </div>
             </div>
             <Separator />
             <div className="flex items-center gap-3">
                 <Skeleton className="h-6 w-6 rounded" />
                 <div className="space-y-1">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-6 w-20" />
                 </div>
            </div>
        </CardContent>
     </Card>
  )

   const OrderHistorySkeleton = () => (
    <Card>
        <CardHeader className="flex flex-row justify-between items-center p-4">
            <div className="space-y-1">
                <Skeleton className="h-7 w-40" />
                <Skeleton className="h-4 w-56" />
            </div>
            <Skeleton className="h-9 w-32" />
        </CardHeader>
        <CardContent className="p-0">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px] pl-4"><Skeleton className="h-4 w-16" /></TableHead>
                        <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                        <TableHead><Skeleton className="h-4 w-32" /></TableHead>
                        <TableHead className="hidden md:table-cell text-right"><Skeleton className="h-4 w-20" /></TableHead>
                        <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                        <TableHead className="text-right pr-4"><Skeleton className="h-4 w-16" /></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i} className="hover:bg-muted/20">
                            <TableCell className="pl-4"><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                             <TableCell className="hidden md:table-cell text-right"><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell className="text-right pr-4"><Skeleton className="h-4 w-16" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
   )

   const SubscriptionsSkeleton = () => (
     <Card>
        <CardHeader className="flex flex-row justify-between items-center p-4">
            <div className="space-y-1">
                <Skeleton className="h-7 w-44" />
                <Skeleton className="h-4 w-60" />
            </div>
        </CardHeader>
        <CardContent className="p-0">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="pl-4"><Skeleton className="h-4 w-32" /></TableHead>
                        <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                        <TableHead className="hidden md:table-cell"><Skeleton className="h-4 w-28" /></TableHead>
                        <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                        <TableHead className="text-right pr-4"><Skeleton className="h-4 w-28" /></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                     {Array.from({ length: 2 }).map((_, i) => (
                        <TableRow key={i} className="hover:bg-muted/20">
                            <TableCell className="pl-4"><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-28" /></TableCell>
                             <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell className="text-right pr-4 space-x-1">
                                <Skeleton className="h-8 w-8 inline-block" />
                                <Skeleton className="h-8 w-8 inline-block" />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
     </Card>
   )


  // Separate error messages for clarity
  const profileError = error?.includes("profile") ? error.replace(/Failed to load (recent orders|subscriptions)\./g, '').trim() : null;
  const orderError = error?.includes("orders") ? "Failed to load recent orders." : null;
  const subError = error?.includes("subscriptions") ? "Failed to load subscriptions." : null;

  // Animation variants
  const listVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }, // Stagger table row animations
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0 },
  };

  return (
    <div className="container mx-auto px-4 py-12 space-y-12"> {/* Added container and padding */}
        {/* Profile Header */}
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <User className="h-8 w-8 text-primary" /> Your Profile
            </h1>
             {/* Add Log Out button */}
             <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                <LogOut className="mr-2 h-4 w-4" /> Log Out
            </Button>
       </div>

       {profileError && !isLoadingProfile && ( // Show profile-specific error
           <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Error Loading Profile</AlertTitle>
                <AlertDescription>{profileError}</AlertDescription>
           </Alert>
       )}


       {/* Profile Information Section */}
      {isLoadingProfile ? <ProfileInfoSkeleton /> : profile ? (
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6">
             <Avatar className="h-24 w-24 border-2 border-primary/30">
                <AvatarImage src={`https://avatar.vercel.sh/${profile.email}?size=96`} alt={profile.name} />
                <AvatarFallback className="text-3xl bg-muted">
                    {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
             </Avatar>
            <div className="flex-grow mt-2 sm:mt-0">
                <CardTitle className="text-2xl font-semibold">{profile.name}</CardTitle>
                <CardDescription className="flex items-center gap-1.5 text-base mt-1 text-muted-foreground">
                    <Mail className="h-4 w-4"/>{profile.email}
                </CardDescription>
                 {profile.phone && (
                     <CardDescription className="flex items-center gap-1.5 text-sm mt-1 text-muted-foreground">
                        <Phone className="h-4 w-4"/>{profile.phone}
                     </CardDescription>
                 )}
            </div>
             {/* Link to Account Settings Page */}
             <Link href="/profile/account-settings" passHref legacyBehavior>
                <Button variant="outline" size="sm" className="self-start sm:self-center">
                    <Settings className="mr-2 h-4 w-4" /> Account Settings
                </Button>
             </Link>
          </CardHeader>

          {/* Addresses */}
          <CardContent className="space-y-6 p-6 pt-2">
             <Separator />
             <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium flex items-center gap-2"><MapPin className="h-5 w-5 text-primary"/>Delivery Addresses</h3>
                      <Button variant="outline" size="sm" onClick={() => handleOpenAddressDialog()}>
                          <Plus className="mr-2 h-4 w-4" /> Add Address
                      </Button>
                </div>
                {profile.addresses.length > 0 ? (
                    <motion.div layout className="space-y-3"> {/* Add layout animation */}
                         <AnimatePresence>
                            {profile.addresses.map((address) => (
                                <motion.div
                                    key={address.id}
                                    layout // Enable layout animation for add/remove
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="flex items-start justify-between p-3 border rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-start gap-3 text-sm">
                                        {address.label === 'Home' ? <Home className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" /> :
                                        address.label === 'Work' ? <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" /> :
                                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />}
                                        <div>
                                            <span className="font-medium block text-foreground">
                                                {address.label} {address.isDefault && <Badge variant="secondary" className="ml-1 text-xs">Default</Badge>}
                                            </span>
                                            <span className="text-muted-foreground">{address.street}, {address.city}, {address.state} {address.zipCode}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Edit Address" onClick={() => handleOpenAddressDialog(address)}>
                                            <Edit className="h-3.5 w-3.5 opacity-70"/>
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                                title="Delete Address"
                                                disabled={profile.addresses.length === 1 || address.isDefault} // Disable deleting the only or default address
                                                >
                                                    <Trash2 className="h-3.5 w-3.5"/>
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                <AlertDialogTitle>Delete Address?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to delete the address labeled "{address.label}"?
                                                    {address.isDefault && profile.addresses.length > 1 && " You must set another address as default before deleting this one."}
                                                </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleDeleteAddress(address.id)}
                                                    className={buttonVariants({ variant: "destructive" })}
                                                    disabled={address.isDefault && profile.addresses.length > 1} // Double disable check
                                                    >
                                                    Yes, Delete
                                                </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>

                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                     <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-md">No addresses saved yet. Click "Add Address" to add one.</p>
                )}
             </div>

             {/* Friends & Followed Stores Links */}
             <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/profile/friends" passHref legacyBehavior>
                         <Card className="hover:bg-muted/40 transition-colors cursor-pointer h-full">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-medium flex items-center gap-2">
                                    <UsersIcon className="h-5 w-5 text-primary"/> My Friends
                                </CardTitle>
                                <span className="text-sm text-muted-foreground">({profile.friendIds?.length || 0})</span>
                            </CardHeader>
                             <CardContent>
                                <p className="text-xs text-muted-foreground">View and manage your friends list.</p>
                             </CardContent>
                        </Card>
                     </Link>
                    <Link href="/profile/followed-stores" passHref legacyBehavior>
                         <Card className="hover:bg-muted/40 transition-colors cursor-pointer h-full">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-medium flex items-center gap-2">
                                    <StoreIcon className="h-5 w-5 text-primary"/> Followed Stores
                                </CardTitle>
                                 <span className="text-sm text-muted-foreground">({profile.followedStoreIds?.length || 0})</span>
                            </CardHeader>
                             <CardContent>
                                <p className="text-xs text-muted-foreground">See updates from stores you follow.</p>
                             </CardContent>
                        </Card>
                     </Link>
                </div>

            <Separator />

            {/* Loyalty Points */}
            <div className="flex items-center gap-3 bg-primary/5 rounded-md p-4 border border-primary/10">
                 <Award className="h-7 w-7 text-primary shrink-0" />
                 <div>
                     <span className="font-medium block text-foreground">Loyalty Points</span>
                     <span className="text-2xl font-bold text-primary">{profile.loyaltyPoints}</span>
                     <span className="text-muted-foreground text-sm"> points earned</span>
                 </div>
            </div>


            {/* Store Management Link (Conditional) */}
             {profile.role === 'store_owner' && (
                <>
                    <Separator />
                     <div className="space-y-3">
                        <h3 className="text-lg font-medium flex items-center gap-2"><Building className="h-5 w-5 text-primary"/>Store Management</h3>
                         <p className="text-sm text-muted-foreground">Manage your stores, products, and orders.</p>
                         <Link href="/stores" passHref>
                            <Button variant="default">Go to Store Management</Button>
                         </Link>
                    </div>
                 </>
             )}


          </CardContent>
        </Card>
      ) : !profileError && !isLoadingProfile ? ( // Only show if not loading and no error message already shown
         <Card><CardContent className="p-6 text-muted-foreground text-center">Could not load profile information.</CardContent></Card>
      ): null}

       {/* Address Dialog */}
        {profile && (
             <AddressDialog
                isOpen={isAddressDialogOpen}
                onOpenChange={setIsAddressDialogOpen}
                addressData={currentAddress}
                onSave={handleSaveAddress}
                userId={userId}
                userAddresses={profile.addresses}
             />
        )}

        <Separator />

       {/* Subscriptions Section */}
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
                <CalendarClock className="h-6 w-6 text-primary" /> My Subscriptions
            </h2>

             {subError && !isLoadingSubs && ( // Show subscription-specific error
                 <Alert variant="destructive">
                     <XCircle className="h-4 w-4" />
                     <AlertTitle>Error Loading Subscriptions</AlertTitle>
                     <AlertDescription>{subError}</AlertDescription>
                 </Alert>
             )}

            {isLoadingSubs ? <SubscriptionsSkeleton /> : subscriptions.length > 0 ? (
                <motion.div
                     variants={listVariants}
                     initial="hidden"
                     animate="visible"
                 >
                    <Card className="shadow-sm overflow-hidden border">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="pl-4">Offer</TableHead>
                                        <TableHead>Store</TableHead>
                                        <TableHead className="hidden md:table-cell">Next Delivery</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right pr-4">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                   <AnimatePresence>
                                        {subscriptions.map((sub) => {
                                            const details = subscriptionStatusDetails[sub.status];
                                            const StatusIcon = details.icon;
                                            const badgeBaseColor = details.color.replace('text-', '').replace(/-\d+$/, '');
                                            const badgeBgClass = `bg-${badgeBaseColor}-500/10 dark:bg-${badgeBaseColor}-500/20`;
                                            const badgeBorderClass = `border-${badgeBaseColor}-500/30`;
                                            const isUpdating = updatingSubId === sub.id;

                                            return (
                                                <motion.tr
                                                    key={sub.id}
                                                    variants={itemVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit="exit"
                                                    layout
                                                    className="hover:bg-muted/20 transition-colors duration-150"
                                                >
                                                    <TableCell className="font-medium pl-4">{sub.offerName}</TableCell>
                                                    <TableCell>
                                                        <Link href={`/store/${sub.storeId}`} className="hover:underline text-primary">
                                                            {sub.storeName}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell">
                                                        {sub.status === 'active' && sub.nextDeliveryDate ? format(sub.nextDeliveryDate, 'MMM d, yyyy') : '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={details.variant === 'default' ? 'secondary' : details.variant}
                                                            className={cn(
                                                                'capitalize text-xs px-2 py-0.5 rounded-full font-medium border flex items-center gap-1 w-fit',
                                                                details.color,
                                                                details.variant === 'destructive' ? '' : `${badgeBgClass} ${badgeBorderClass}`,
                                                                sub.status === 'active' && 'bg-green-500/10 dark:bg-green-500/20 border-green-500/30 text-green-600 dark:text-green-400'
                                                            )}
                                                        >
                                                            <StatusIcon className="h-3 w-3" />
                                                            <span>{details.label}</span>
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right pr-4 space-x-1">
                                                        {sub.status === 'active' && (
                                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleUpdateSubscription(sub.id, 'paused')} disabled={isUpdating} title="Pause Subscription">
                                                                {isUpdating ? <Repeat className="h-4 w-4 animate-spin"/> : <Pause className="h-4 w-4 text-yellow-600"/>}
                                                            </Button>
                                                        )}
                                                        {sub.status === 'paused' && (
                                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleUpdateSubscription(sub.id, 'active')} disabled={isUpdating} title="Resume Subscription">
                                                                {isUpdating ? <Repeat className="h-4 w-4 animate-spin"/> : <Play className="h-4 w-4 text-green-600"/>}
                                                            </Button>
                                                        )}
                                                        {sub.status !== 'cancelled' && (
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" disabled={isUpdating} title="Cancel Subscription">
                                                                        <Trash2 className="h-4 w-4"/>
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This will permanently cancel your subscription to "{sub.offerName}". This action cannot be undone.
                                                                    </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                    <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => handleUpdateSubscription(sub.id, 'cancelled')}
                                                                        className={buttonVariants({ variant: "destructive" })}
                                                                        disabled={isUpdating}
                                                                    >
                                                                        {isUpdating ? 'Cancelling...' : 'Yes, Cancel'}
                                                                    </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        )}
                                                        {sub.status === 'cancelled' && (
                                                                <span className="text-xs text-muted-foreground italic mr-2">Cancelled</span>
                                                        )}
                                                    </TableCell>
                                                </motion.tr>
                                            );
                                        })}
                                   </AnimatePresence>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </motion.div>
             ) : !subError && !isLoadingSubs ? (
                 <Card>
                    <CardContent className="p-10 text-center text-muted-foreground">
                        <CalendarClock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50"/>
                        <p className="text-lg font-medium">No active subscriptions found.</p>
                        <p className="text-sm mt-2">Explore stores offering daily or weekly deliveries!</p>
                    </CardContent>
                 </Card>
             ) : null}
        </div>

      <Separator />

      {/* Order History Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
                <ShoppingBag className="h-6 w-6 text-primary" /> Recent Order History
            </h2>
            <Button asChild variant="link" className="text-primary px-0">
                <Link href="/orders">View All Orders</Link>
            </Button>
        </div>

        {orderError && !isLoadingOrders && ( // Show order-specific error
             <Alert variant="destructive">
                 <XCircle className="h-4 w-4" />
                 <AlertTitle>Error Loading Orders</AlertTitle>
                 <AlertDescription>{orderError}</AlertDescription>
             </Alert>
        )}

        {isLoadingOrders ? <OrderHistorySkeleton /> : orders.length > 0 ? (
             <motion.div
                 variants={listVariants}
                 initial="hidden"
                 animate="visible"
             >
                <Card className="shadow-sm overflow-hidden border">
                    <CardContent className="p-0">
                        <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead className="w-[100px] pl-4">Order ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Store</TableHead>
                            <TableHead className="hidden md:table-cell text-right">Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right pr-4">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence>
                                {orders.map((order) => {
                                    const details = orderStatusDetails[order.status];
                                    const StatusIcon = details.icon;
                                    const badgeBaseColor = details.color.replace('text-', '').replace(/-\d+$/, '');
                                    const badgeBgClass = `bg-${badgeBaseColor}-500/10 dark:bg-${badgeBaseColor}-500/20`;
                                    const badgeBorderClass = `border-${badgeBaseColor}-500/30`;
                                    return (
                                    <motion.tr
                                        key={order.id}
                                        variants={itemVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        layout
                                        className="hover:bg-muted/20 transition-colors duration-150"
                                    >
                                        <TableCell className="font-mono text-xs pl-4">#{order.id.substring(order.id.length - 6)}</TableCell>
                                        <TableCell>{format(order.orderDate, 'MMM d, yyyy')}</TableCell>
                                        <TableCell>
                                            <Link href={`/store/${order.storeId}`} className="hover:underline font-medium text-primary">
                                                {order.storeName}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-right font-medium">{formatCurrency(order.totalAmount)}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={details.variant === 'default' ? 'secondary' : details.variant}
                                                className={cn(
                                                    'capitalize text-xs px-2 py-0.5 rounded-full font-medium border flex items-center gap-1 w-fit',
                                                    details.color,
                                                    details.variant === 'destructive' ? '' : `${badgeBgClass} ${badgeBorderClass}`,
                                                    order.status === 'Delivered' && 'bg-green-500/10 dark:bg-green-500/20 border-green-500/30 text-green-600 dark:text-green-400'
                                                )}
                                            >
                                                <StatusIcon className="h-3 w-3" />
                                                <span>{order.status}</span>
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right pr-4">
                                            {/* Link to specific order section on /orders page */}
                                            <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                                            <Link href={`/orders#order-${order.id}`}> {/* Adjusted size */}
                                                <Eye className="h-4 w-4"/>
                                                <span className="sr-only">View Order</span>
                                            </Link>
                                            </Button>
                                        </TableCell>
                                    </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                        </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </motion.div>
        ) : !orderError && !isLoadingOrders ? ( // Only show if not loading and no error shown
            <Card>
                <CardContent className="p-10 text-center text-muted-foreground">
                    <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50"/>
                    <p className="text-lg font-medium">No recent orders found.</p>
                    <p className="text-sm mt-2">You haven't placed any orders in a while.</p>
                </CardContent>
            </Card>
        ) : null}
      </div>

    </div>
  );
}