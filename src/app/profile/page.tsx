
"use client";

import { useState, useEffect, useCallback } from "react"; // Added useCallback
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserProfile, UserProfile, Order, getUserOrders, Subscription, getUserSubscriptions, updateSubscriptionStatus, DailyOffer, DeliveryAddress, addUserAddress, updateUserAddress, deleteUserAddress } from '@/services/store'; // Import address functions
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button, buttonVariants } from "@/components/ui/button"; // Import buttonVariants
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge, badgeVariants, type BadgeProps } from "@/components/ui/badge"; // Import badgeVariants & type
import { User, ShoppingBag, MapPin, Phone, Mail, Award, Edit, Settings, LogOut, PackageCheck, Truck, Hourglass, XCircle, Eye, CalendarClock, Play, Pause, Trash2, Repeat, Home, Briefcase, Plus, Building, Lock, CreditCard, Bell, Users as UsersIcon, Store as StoreIcon, Check, Loader2 } from 'lucide-react'; // Added Check icon, Loader2
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert
import Link from "next/link";
import { cn, formatCurrency } from "@/lib/utils";
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
import { Input } from "@/components/ui/input"; // For edit forms
import { Label } from "@/components/ui/label"; // For edit forms
import { Checkbox } from "@/components/ui/checkbox"; // For default address
import { AddressDialog } from './AddressDialog'; // Import AddressDialog component
import { motion, AnimatePresence } from 'framer-motion'; // Import motion
import { LayoutAnimator } from "@/components/LayoutAnimator"; // Import LayoutAnimator


// Map status to icon and variant for the order table
const orderStatusDetails: Record<Order['status'], { icon: React.ElementType; variant: BadgeProps["variant"]; color: string }> = {
    'Pending': { icon: Hourglass, variant: 'secondary', color: 'text-yellow-600 dark:text-yellow-400' }, // Use secondary for pending
    'Processing': { icon: Settings, variant: 'secondary', color: 'text-blue-600 dark:text-blue-400' }, // Use secondary for processing
    'Shipped': { icon: Truck, variant: 'secondary', color: 'text-purple-600 dark:text-purple-400' }, // Use secondary for shipped
    'Delivered': { icon: PackageCheck, variant: 'success', color: 'text-accent-foreground dark:text-accent-foreground' }, // Use success variant for delivered
    'Cancelled': { icon: XCircle, variant: 'destructive', color: 'text-destructive-foreground dark:text-destructive-foreground' } // Use destructive variant
};

// Map status to icon and variant for the subscription table
const subscriptionStatusDetails: Record<Subscription['status'], { icon: React.ElementType; variant: BadgeProps["variant"]; color: string; label: string }> = {
    'active': { icon: Play, variant: 'success', color: 'text-accent-foreground dark:text-accent-foreground', label: 'Active' },
    'paused': { icon: Pause, variant: 'secondary', color: 'text-yellow-600 dark:text-yellow-400', label: 'Paused' },
    'cancelled': { icon: XCircle, variant: 'destructive', color: 'text-destructive-foreground dark:text-destructive-foreground', label: 'Cancelled' }
};

// Define state for the address form
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

  const handleUpdateSubscription = useCallback(async (subId: string, newStatus: Subscription['status']) => {
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
    }, [toast]); // Add toast to dependency array


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
    }, [userId, profile, toast]); // Add dependencies

  const ProfileInfoSkeleton = () => (
     <Card>
        {/* Use p-6 for consistent padding */}
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 bg-gradient-to-r from-primary/5 via-background to-accent/5">
             <Skeleton className="h-24 w-24 rounded-full bg-muted/50" />
             <div className="space-y-2 flex-grow mt-2 sm:mt-0">
                <Skeleton className="h-8 w-56 bg-muted/50" />
                <Skeleton className="h-6 w-64 bg-muted/50" />
                <Skeleton className="h-5 w-40 bg-muted/50" />
             </div>
            <div className="flex gap-2 self-start sm:self-center">
                <Skeleton className="h-9 w-32 bg-muted/50" />
            </div>
        </CardHeader>
        {/* Use p-6 for consistent padding */}
        <CardContent className="space-y-6 p-6 pt-4">
            <Separator />
             {/* Address Skeleton */}
              <div className="space-y-4">
                 <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-36 bg-muted/50" />
                    <div className="flex gap-2">
                        <Skeleton className="h-9 w-28 bg-muted/50" />
                        <Skeleton className="h-9 w-28 bg-muted/50" />
                    </div>
                 </div>
                 <div className="space-y-3">
                     <Skeleton className="h-16 w-full bg-muted/50" />
                     <Skeleton className="h-16 w-full bg-muted/50" />
                 </div>
             </div>
             <Separator />
             {/* Friends/Followed Stores Skeleton */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 border rounded-md">
                     <Skeleton className="h-7 w-7 rounded bg-muted/50" />
                     <Skeleton className="h-5 w-32 bg-muted/50" />
                  </div>
                   <div className="flex items-center gap-3 p-4 border rounded-md">
                     <Skeleton className="h-7 w-7 rounded bg-muted/50" />
                     <Skeleton className="h-5 w-36 bg-muted/50" />
                  </div>
             </div>
             <Separator />
             <div className="flex items-center gap-3 p-4 border rounded-lg bg-gradient-to-r from-yellow-100/20 via-amber-50/20 to-orange-100/20">
                 <Skeleton className="h-10 w-10 rounded-full bg-muted/50" />
                 <div className="space-y-1">
                    <Skeleton className="h-5 w-28 bg-muted/50" />
                    <Skeleton className="h-7 w-20 bg-muted/50" />
                 </div>
            </div>
        </CardContent>
     </Card>
  )

   const OrderHistorySkeleton = () => (
    <Card>
        {/* Use p-4 for consistent padding */}
        <CardHeader className="flex flex-row justify-between items-center p-4">
            <div className="space-y-1">
                <Skeleton className="h-6 w-40 bg-muted/50" />
                <Skeleton className="h-4 w-56 bg-muted/50" />
            </div>
            <Skeleton className="h-9 w-32 bg-muted/50" />
        </CardHeader>
        <CardContent className="p-0">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px] pl-4"><Skeleton className="h-4 w-16 bg-muted/50" /></TableHead>
                        <TableHead><Skeleton className="h-4 w-24 bg-muted/50" /></TableHead>
                        <TableHead><Skeleton className="h-4 w-32 bg-muted/50" /></TableHead>
                        <TableHead className="hidden md:table-cell text-right"><Skeleton className="h-4 w-20 bg-muted/50" /></TableHead>
                        <TableHead><Skeleton className="h-4 w-24 bg-muted/50" /></TableHead>
                        <TableHead className="text-right pr-4"><Skeleton className="h-4 w-16 bg-muted/50" /></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i} className="hover:bg-muted/20">
                            <TableCell className="pl-4"><Skeleton className="h-4 w-16 bg-muted/50" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24 bg-muted/50" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-32 bg-muted/50" /></TableCell>
                             <TableCell className="hidden md:table-cell text-right"><Skeleton className="h-4 w-20 bg-muted/50" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-20 rounded-full bg-muted/50" /></TableCell> {/* Status */}
                            <TableCell className="text-right pr-4"><Skeleton className="h-8 w-8 inline-block bg-muted/50" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
   )

   const SubscriptionsSkeleton = () => (
     <Card>
         {/* Use p-4 for consistent padding */}
        <CardHeader className="flex flex-row justify-between items-center p-4">
            <div className="space-y-1">
                <Skeleton className="h-7 w-44 bg-muted/50" />
                <Skeleton className="h-4 w-60 bg-muted/50" />
            </div>
        </CardHeader>
        <CardContent className="p-0">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="pl-4"><Skeleton className="h-4 w-32 bg-muted/50" /></TableHead>
                        <TableHead><Skeleton className="h-4 w-24 bg-muted/50" /></TableHead>
                        <TableHead className="hidden md:table-cell"><Skeleton className="h-4 w-28 bg-muted/50" /></TableHead>
                        <TableHead><Skeleton className="h-4 w-20 bg-muted/50" /></TableHead>
                        <TableHead className="text-right pr-4"><Skeleton className="h-4 w-28 bg-muted/50" /></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                     {Array.from({ length: 2 }).map((_, i) => (
                        <TableRow key={i} className="hover:bg-muted/20">
                            <TableCell className="pl-4"><Skeleton className="h-4 w-32 bg-muted/50" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24 bg-muted/50" /></TableCell>
                            <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-28 bg-muted/50" /></TableCell>
                             <TableCell><Skeleton className="h-6 w-20 rounded-full bg-muted/50" /></TableCell> {/* Status */}
                            <TableCell className="text-right pr-4 space-x-1">
                                <Skeleton className="h-8 w-8 inline-block bg-muted/50" />
                                <Skeleton className="h-8 w-8 inline-block bg-muted/50" />
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
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }, // Slightly slower stagger
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95 }, // Add scale effect on exit
  };


  return (
    <LayoutAnimator> {/* Added Layout Animator */}
        {/* Use standard page padding and spacing */}
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 space-y-10">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
                {/* Use Heading 1 size */}
                <h1 className="h1 flex items-center gap-3"> {/* Use h1 class */}
                    <User className="h-8 w-8 text-primary" /> Your Profile
                </h1>
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
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border border-primary/10">
                 {/* Use p-6 for padding */}
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 bg-gradient-to-r from-primary/5 via-background to-accent/5">
                    <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                        <AvatarImage src={`https://avatar.vercel.sh/${profile.email}?size=96`} alt={profile.name} />
                        <AvatarFallback className="text-3xl bg-muted">
                            {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-grow mt-2 sm:mt-0">
                         {/* Use Heading 2 size */}
                        <CardTitle className="h2 text-primary">{profile.name}</CardTitle> {/* Use h2 class */}
                         {/* Use text-lg */}
                        <CardDescription className="flex items-center gap-1.5 text-lg mt-1 text-muted-foreground">
                            <Mail className="h-5 w-5"/>{profile.email}
                        </CardDescription>
                        {profile.phone && (
                             {/* Use text-base */}
                            <CardDescription className="flex items-center gap-1.5 text-base mt-1 text-muted-foreground">
                                <Phone className="h-4 w-4"/>{profile.phone}
                            </CardDescription>
                        )}
                    </div>
                    <Link href="/profile/account-settings" passHref legacyBehavior>
                         <Button variant="default" size="sm" className="self-start sm:self-center">
                            <Settings className="mr-2 h-4 w-4" /> Account Settings
                        </Button>
                    </Link>
                </CardHeader>

                {/* Use standard padding and spacing */}
                <CardContent className="space-y-6 p-6 pt-4">
                    <Separator />
                    <div className="space-y-4">
                         {/* Use Heading 3 size */}
                        <div className="flex justify-between items-center">
                            <h3 className="h3 flex items-center gap-2 text-foreground/90"><MapPin className="h-5 w-5 text-primary"/>Delivery Addresses</h3> {/* Use h3 class */}
                             <Link href="/profile/addresses" passHref legacyBehavior>
                                 <Button variant="outline" size="sm" className="ml-auto mr-2">Manage All</Button>
                             </Link>
                            <Button variant="default" size="sm" onClick={() => handleOpenAddressDialog()}>
                                <Plus className="mr-2 h-4 w-4" /> Add Address
                            </Button>
                        </div>
                        {profile.addresses.length > 0 ? (
                            <motion.div layout className="space-y-3">
                                <AnimatePresence>
                                    {profile.addresses.map((address) => (
                                        <motion.div
                                            key={address.id}
                                            layout
                                            variants={itemVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            className="flex items-center justify-between p-3 border rounded-md bg-muted/30 hover:shadow-sm hover:border-primary/20 transition-all duration-150"
                                        >
                                            <div className="flex items-center gap-3 text-sm">
                                                {address.label === 'Home' ? <Home className="h-4 w-4 text-primary/80 shrink-0" /> :
                                                address.label === 'Work' ? <Briefcase className="h-4 w-4 text-primary/80 shrink-0" /> :
                                                <MapPin className="h-4 w-4 text-primary/80 shrink-0" />}
                                                <div>
                                                    <span className="font-medium block text-foreground">
                                                        {address.label} {address.isDefault && <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0 h-5"><Check className="h-3 w-3 mr-0.5"/> Default</Badge>}
                                                    </span>
                                                    <span className="text-muted-foreground text-xs">{address.street}, {address.city}, {address.state} {address.zipCode} {address.country && `(${address.country})`}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="icon" className="h-7 w-7" title="Edit Address" onClick={() => handleOpenAddressDialog(address)}>
                                                    <Edit className="h-3.5 w-3.5 opacity-70"/>
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                                            title="Delete Address"
                                                            disabled={profile.addresses.length === 1 || (address.isDefault && profile.addresses.length > 1)}
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
                                                            {profile.addresses.length === 1 && " You cannot delete your only address."}
                                                        </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDeleteAddress(address.id)}
                                                            className={buttonVariants({ variant: "destructive" })}
                                                            disabled={profile.addresses.length === 1 || (address.isDefault && profile.addresses.length > 1)}
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
                            <p className="text-sm text-muted-foreground italic text-center py-4 border border-dashed rounded-md">No addresses saved yet. Click "Add Address" to add one.</p>
                        )}
                    </div>

                    {/* Friends & Followed Stores Links */}
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link href="/profile/friends" passHref legacyBehavior>
                            <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-150 cursor-pointer h-full border">
                                 {/* Use p-4 */}
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                                    {/* Use text-lg */}
                                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                        <UsersIcon className="h-5 w-5 text-primary"/> My Friends
                                    </CardTitle>
                                    <span className="text-base font-semibold text-primary">({profile.friendIds?.length || 0})</span>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <p className="text-sm text-muted-foreground">View and manage your friends list.</p>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/profile/followed-stores" passHref legacyBehavior>
                            <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-150 cursor-pointer h-full border">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                        <StoreIcon className="h-5 w-5 text-primary"/> Followed Stores
                                    </CardTitle>
                                    <span className="text-base font-semibold text-primary">({profile.followedStoreIds?.length || 0})</span>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <p className="text-sm text-muted-foreground">See updates from stores you follow.</p>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>

                    <Separator />

                    {/* Loyalty Points */}
                     <div className="flex items-center gap-4 bg-gradient-to-r from-yellow-100 via-amber-50 to-orange-100 dark:from-yellow-900/30 dark:via-amber-950/30 dark:to-orange-950/30 rounded-lg p-6 border border-secondary/30 shadow-inner"> {/* Use p-6 */}
                        <Award className="h-10 w-10 text-secondary shrink-0" /> {/* Use h-10 w-10 */}
                        <div>
                            <span className="font-semibold block text-lg text-foreground/90">Loyalty Points</span>
                             {/* Use Heading 2 size */}
                            <span className="h2 text-secondary">{profile.loyaltyPoints}</span> {/* Use h2 class */}
                            <span className="text-muted-foreground text-base"> points earned</span>
                        </div>
                    </div>


                    {/* Store Management Link (Conditional) */}
                    {profile.role === 'store_owner' && (
                        <>
                            <Separator />
                            <div className="space-y-3 border p-6 rounded-md bg-muted/30"> {/* Use p-6 */}
                                {/* Use Heading 3 size */}
                                <h3 className="h3 flex items-center gap-2 text-foreground/90"><Building className="h-5 w-5 text-primary"/>Store Management</h3> {/* Use h3 class */}
                                <p className="text-base text-muted-foreground">Manage your stores, products, and orders.</p> {/* Use text-base */}
                                <Link href="/stores" passHref legacyBehavior>
                                     <Button variant="default" size="lg">Go to Store Management</Button> {/* Use size="lg" */}
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
                    userAddresses={profile.addresses || []} // Ensure addresses is not undefined
                />
            )}

            <Separator className="my-10 border-border/50"/> {/* Use my-10 */}

            {/* Recent Orders Section */}
            <div className="space-y-6">
                 {/* Use Heading 2 size */}
                <div className="flex justify-between items-center">
                    <h2 className="h2 flex items-center gap-2"> {/* Use h2 class */}
                        <ShoppingBag className="h-6 w-6 text-primary" /> Recent Order History
                    </h2>
                     <Link href="/orders" passHref>
                         <Button asChild variant="link" className="text-primary px-0">
                             <a>View All Orders</a>
                         </Button>
                     </Link>
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
                             {/* Remove CardContent padding */}
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                             {/* Add padding */}
                                            <TableHead className="w-[100px] pl-4">Order ID</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Store</TableHead>
                                            <TableHead className="hidden md:table-cell text-right">Total</TableHead>
                                            <TableHead>Status</TableHead>
                                             {/* Add padding */}
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
                                                        layout // Add layout animation
                                                        className="hover:bg-muted/20 transition-colors duration-150"
                                                     >
                                                         {/* Add padding */}
                                                        <TableCell className="font-mono text-xs pl-4">#{order.id.substring(order.id.length - 6)}</TableCell>
                                                        <TableCell className="text-xs text-muted-foreground">{format(order.orderDate, 'MMM d, yyyy')}</TableCell>
                                                        <TableCell className="text-sm">
                                                            <Link href={`/store/${order.storeId}`} className="hover:underline font-medium">
                                                                {order.storeName}
                                                            </Link>
                                                        </TableCell>
                                                        <TableCell className="hidden md:table-cell text-right font-medium">{formatCurrency(order.totalAmount)}</TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant={details.variant === 'default' ? 'secondary' : details.variant} // Adjust variant logic
                                                                className={cn(
                                                                    'capitalize text-[11px] px-2 py-0.5 rounded-full font-medium border flex items-center gap-1 w-fit', // Smaller text
                                                                    details.color,
                                                                    details.variant === 'destructive' ? '' : `${badgeBgClass} ${badgeBorderClass}`, // Conditionally apply bg/border
                                                                    order.status === 'Delivered' && 'bg-green-500/10 dark:bg-green-500/20 border-green-500/30 text-green-600 dark:text-green-400' // Specific success style
                                                                )}
                                                            >
                                                                <StatusIcon className="h-3 w-3" />
                                                                <span>{order.status}</span>
                                                            </Badge>
                                                        </TableCell>
                                                         {/* Add padding */}
                                                        <TableCell className="text-right pr-4">
                                                            <Link href={`/orders?orderId=${order.id}`} passHref legacyBehavior>
                                                                 <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-secondary/80" title="View Order Details">
                                                                     <Eye className="h-4 w-4 text-foreground/70" />
                                                                 </Button>
                                                            </Link>
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
                ) : !orderError && !isLoadingOrders ? (
                     <Card>
                         {/* Use p-4 */}
                         <CardContent className="p-10 text-center text-muted-foreground">
                            <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50"/>
                           <p className="text-lg font-medium">No recent orders found.</p>
                            {/* Use Body 2 */}
                           <p className="text-body2 mt-2">Start shopping to see your orders here!</p>
                           <Link href="/" passHref legacyBehavior>
                                <Button variant="default" className="mt-6">Browse Stores</Button>
                           </Link>
                       </CardContent>
                     </Card>
                ) : null}
            </div>


            <Separator className="my-10 border-border/50"/> {/* Use my-10 */}

            {/* Subscriptions Section */}
             {/* Use space-y-6 */}
            <div className="space-y-6">
                 {/* Use Heading 2 size */}
                <h2 className="h2 flex items-center gap-2"> {/* Use h2 class */}
                    <CalendarClock className="h-7 w-7 text-primary" /> My Subscriptions
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
                             {/* Remove padding */}
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                             {/* Add padding */}
                                            <TableHead className="pl-4">Offer</TableHead>
                                            <TableHead>Store</TableHead>
                                            <TableHead className="hidden md:table-cell">Next Delivery</TableHead>
                                            <TableHead>Status</TableHead>
                                             {/* Add padding */}
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
                                                         {/* Add padding */}
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
                                                         {/* Add padding */}
                                                        <TableCell className="text-right pr-4 space-x-1">
                                                            {sub.status === 'active' && (
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-yellow-100/50 dark:hover:bg-yellow-900/30" onClick={() => handleUpdateSubscription(sub.id, 'paused')} disabled={isUpdating} title="Pause Subscription">
                                                                    {isUpdating ? <Loader2 className="h-4 w-4 animate-spin"/> : <Pause className="h-4 w-4 text-yellow-600"/>}
                                                                </Button>
                                                            )}
                                                            {sub.status === 'paused' && (
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-green-100/50 dark:hover:bg-green-900/30" onClick={() => handleUpdateSubscription(sub.id, 'active')} disabled={isUpdating} title="Resume Subscription">
                                                                    {isUpdating ? <Loader2 className="h-4 w-4 animate-spin"/> : <Play className="h-4 w-4 text-green-600"/>}
                                                                </Button>
                                                            )}
                                                            {sub.status !== 'cancelled' && (
                                                                <AlertDialog>
                                                                    <AlertDialogTrigger asChild>
                                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" disabled={isUpdating} title="Cancel Subscription">
                                                                             {isUpdating ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4"/>}
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
                                                             <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-secondary/80" title="View Offer Details (Not Implemented)">
                                                                <Eye className="h-4 w-4 text-foreground/70" />
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
                ) : !subError && !isLoadingSubs ? (
                    <Card>
                        <CardContent className="p-10 text-center text-muted-foreground">
                            <CalendarClock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50"/>
                           <p className="text-lg font-medium">No active subscriptions found.</p>
                            <p className="text-sm mt-2">Explore stores offering daily or weekly deliveries!</p>
                             <Link href="/" passHref legacyBehavior>
                                <Button variant="default" className="mt-6">Browse Stores</Button>
                             </Link>
                        </CardContent>
                     </Card>
                ) : null}
            </div>
        </div>
    </LayoutAnimator>
  );
}
