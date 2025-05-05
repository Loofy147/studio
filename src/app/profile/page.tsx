
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserProfile, UserProfile, Order, getUserOrders, Subscription, getUserSubscriptions, DeliveryAddress, addUserAddress, updateUserAddress, deleteUserAddress } from '@/services/store'; // Added missing imports
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button, buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge, badgeVariants } from "@/components/ui/badge";
import type { BadgeProps } from "@/components/ui/badge"; // Explicit import
import { User, ShoppingBag, MapPin, Phone, Mail, Award, Settings, LogOut, PackageCheck, Truck, Hourglass, XCircle, Eye, CalendarClock, Building, Store as StoreIcon, Check, Play, Pause, Users as UsersIcon, BookmarkPlus, BookmarkMinus, ArrowLeft, Plus, Edit, Trash2, Briefcase, Home, Repeat } from 'lucide-react'; // Added more icons
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert
import Link from "next/link";
import { cn, formatCurrency } from "@/lib/utils";
import React from 'react'; // Import React
import { useToast } from '@/hooks/use-toast';
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
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutAnimator } from "@/components/LayoutAnimator"; // Import LayoutAnimator
import { AddressDialog } from './AddressDialog'; // Import AddressDialog
import { ProfileInfoSkeleton, OrderHistorySkeleton, SubscriptionsSkeleton } from '@/components/Skeletons'; // Import specific skeletons


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


// Map status to icon and variant for the order table
const orderStatusDetails: Record<Order['status'], { icon: React.ElementType; variant: BadgeProps["variant"]; color: string }> = {
    'Pending': { icon: Hourglass, variant: 'secondary', color: 'text-yellow-600 dark:text-yellow-400' }, // Use secondary for pending
    'Processing': { icon: Settings, variant: 'secondary', color: 'text-blue-600 dark:text-blue-400' }, // Use secondary for processing
    'Shipped': { icon: Truck, variant: 'secondary', color: 'text-purple-600 dark:text-purple-400' }, // Use secondary for shipped
    'Delivered': { icon: PackageCheck, variant: 'success', color: 'text-accent-foreground dark:text-accent-foreground' }, // Use success variant for delivered
    'Cancelled': { icon: XCircle, variant: 'destructive', color: 'text-destructive-foreground dark:text-destructive-foreground' } // Use destructive variant
};

// Map status to icon and variant for the subscription table
const subscriptionStatusDetails: Record<Subscription['status'], { icon: React.ElementType; variant: BadgeProps['variant']; color: string; label: string }> = {
    'active': { icon: Play, variant: 'success', color: 'text-accent-foreground dark:text-accent-foreground', label: 'Active' },
    'paused': { icon: Pause, variant: 'secondary', color: 'text-yellow-600 dark:text-yellow-400', label: 'Paused' },
    'cancelled': { icon: XCircle, variant: 'destructive', color: 'text-destructive-foreground dark:text-destructive-foreground', label: 'Cancelled' }
};


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
  const [updatingSubId, setUpdatingSubId] = useState<string | null>(null); // Added state for subscription updates

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
                setSubscriptions(subData.sort((a, b) => b.startDate.getTime() - a.startDate.getTime()).slice(0,3)); // Limit to 3 recent subs
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

    // Note: Address save/delete logic moved to Address page/component
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
    // Use standard page padding and spacing
    <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 space-y-12">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
            {/* Use Heading 1 size */}
            <h1 className="h1 flex items-center gap-3 text-foreground"> {/* Use h1 class */}
                <User className="h-8 w-8 text-primary" /> Your Profile Overview
            </h1>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive self-start sm:self-center">
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
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 bg-gradient-to-r from-primary/5 via-background to-secondary/5">
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
                <Link href="/profile/account-settings" passHref>
                     <Button variant="default" size="sm" className="self-start sm:self-center" withRipple>
                        <Settings className="mr-2 h-4 w-4" /> Account Settings
                    </Button>
                </Link>
            </CardHeader>

            {/* Use standard padding and spacing */}
            <CardContent className="space-y-6 p-6 pt-4">
                <Separator />
                 {/* Default Address Display */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                         {/* Use text-lg */}
                        <h3 className="text-lg font-medium flex items-center gap-2 text-foreground"><MapPin className="h-5 w-5 text-primary"/>Default Delivery Address</h3>
                        <Link href="/profile/addresses" passHref>
                            <Button variant="outline" size="sm" withRipple>Manage Addresses</Button>
                        </Link>
                    </div>
                    {profile.addresses && profile.addresses.length > 0 ? (
                        profile.addresses.filter(a => a.isDefault).map(address => (
                            <div key={address.id} className="p-3 border rounded-md bg-muted/30 text-sm text-muted-foreground">
                                <span className="font-semibold text-foreground block">{address.label}</span>
                                {address.street}, {address.city}, {address.state} {address.zipCode} {address.country && `(${address.country})`}
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground italic">No default address set.</p>
                    )}
                </div>

                {/* Friends & Followed Stores Links */}
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link href="/profile/friends" passHref>
                         <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-150 cursor-pointer h-full border">
                             {/* Use p-4 */}
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                                {/* Use text-lg */}
                                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
                                    <UsersIcon className="h-5 w-5 text-primary"/> My Friends
                                </CardTitle>
                                <span className="text-base font-semibold text-primary">({profile.friendIds?.length || 0})</span>
                            </CardHeader>
                             {/* Use p-4 pt-0 */}
                            <CardContent className="p-4 pt-0">
                                <p className="text-sm text-muted-foreground">View and manage your friends list.</p>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link href="/profile/followed-stores" passHref>
                         <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-150 cursor-pointer h-full border">
                             {/* Use p-4 */}
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                                 {/* Use text-lg */}
                                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
                                    <StoreIcon className="h-5 w-5 text-primary"/> Followed Stores
                                </CardTitle>
                                <span className="text-base font-semibold text-primary">({profile.followedStoreIds?.length || 0})</span>
                            </CardHeader>
                             {/* Use p-4 pt-0 */}
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
                         {/* Use text-lg */}
                        <span className="font-semibold block text-lg text-foreground/90">Loyalty Points</span>
                         {/* Use Heading 2 size */}
                        <span className="h2 text-secondary">{profile.loyaltyPoints}</span> {/* Use h2 class */}
                         {/* Use text-base */}
                        <span className="text-muted-foreground text-base"> points earned</span>
                    </div>
                </div>


                {/* Store Management Link (Conditional) */}
                {profile.role === 'store_owner' && (
                    <>
                        <Separator />
                         {/* Use p-6 */}
                        <div className="space-y-3 border p-6 rounded-md bg-muted/30">
                            {/* Use Heading 3 size */}
                            <h3 className="h3 flex items-center gap-2 text-foreground/90"><Building className="h-5 w-5 text-primary"/>Store Management</h3> {/* Use h3 class */}
                             {/* Use text-base */}
                            <p className="text-base text-muted-foreground">Manage your stores, products, and orders.</p>
                            <Link href="/stores" passHref>
                                 <Button variant="default" size="lg" withRipple>Go to Store Management</Button> {/* Use size="lg" */}
                            </Link>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
        ) : !profileError && !isLoadingProfile ? ( // Only show if not loading and no error message already shown
         // Use p-6
        <Card><CardContent className="p-6 text-muted-foreground text-center">Could not load profile information.</CardContent></Card>
        ): null}


        <Separator className="my-10 border-border/50"/> {/* Use my-10 */}

        {/* Recent Orders Section */}
         {/* Use space-y-6 */}
        <div className="space-y-6">
             {/* Use Heading 2 size */}
            <div className="flex justify-between items-center">
                <h2 className="h2 flex items-center gap-2 text-foreground"> {/* Use h2 class */}
                    <ShoppingBag className="h-6 w-6 text-primary" /> Recent Order History
                </h2>
                 <Link href="/orders" passHref>
                     <Button asChild variant="link" className="text-primary px-0"><a>View All Orders</a></Button>
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
                     <Card className="shadow-sm overflow-hidden border border-primary/10">
                         {/* Remove CardContent padding */}
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                     {/* Use text-xs */}
                                    <TableRow className="bg-muted/20 hover:bg-muted/30 text-xs uppercase tracking-wider">
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
                                                        <Link href={`/orders?orderId=${order.id}`} passHref>
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
                 <Card className="border-dashed border-border/50 bg-muted/20">
                     {/* Use p-4 */}
                     <CardContent className="p-10 text-center text-muted-foreground">
                        <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50"/>
                         {/* Use text-lg */}
                       <p className="text-lg font-medium">No recent orders found.</p>
                        {/* Use Body 2 */}
                       <p className="text-body2 mt-2">Start shopping to see your orders here!</p>
                       <Link href="/" passHref>
                            <Button variant="default" className="mt-6" withRipple>Browse Stores</Button>
                       </Link>
                   </CardContent>
                 </Card>
            ) : null}
        </div>


        <Separator className="my-10 border-border/50"/> {/* Use my-10 */}

        {/* Recent Subscriptions Section */}
         {/* Use space-y-6 */}
        <div className="space-y-6">
             {/* Use Heading 2 size */}
             <div className="flex justify-between items-center">
                 <h2 className="h2 flex items-center gap-2 text-foreground"> {/* Use h2 class */}
                    <CalendarClock className="h-7 w-7 text-primary" /> Recent Subscriptions
                </h2>
                <Link href="/profile/subscriptions" passHref>
                     <Button variant="link" className="text-primary px-0">View All Subscriptions</Button>
                 </Link>
            </div>

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
                     <Card className="shadow-sm overflow-hidden border border-primary/10">
                         {/* Remove padding */}
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                     {/* Use text-xs */}
                                    <TableRow className="bg-muted/20 hover:bg-muted/30 text-xs uppercase tracking-wider">
                                         {/* Add padding */}
                                        <TableHead className="pl-4">Offer</TableHead>
                                        <TableHead>Store</TableHead>
                                        <TableHead className="hidden md:table-cell">Next Delivery</TableHead>
                                        <TableHead>Status</TableHead>
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
                                                                'capitalize text-xs px-2 py-0.5 rounded-full font-medium border flex items-center gap-1 w-fit', // Use text-xs
                                                                details.color,
                                                                details.variant === 'destructive' ? '' : `${badgeBgClass} ${badgeBorderClass}`,
                                                                sub.status === 'active' && 'bg-green-500/10 dark:bg-green-500/20 border-green-500/30 text-green-600 dark:text-green-400'
                                                            )}
                                                        >
                                                            <StatusIcon className="h-3 w-3" />
                                                            <span>{details.label}</span>
                                                        </Badge>
                                                    </TableCell>
                                                    {/* Actions removed from overview */}
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
                 <Card className="border-dashed border-border/50 bg-muted/20">
                     {/* Use p-4 */}
                    <CardContent className="p-10 text-center text-muted-foreground">
                        <CalendarClock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50"/>
                         {/* Use text-lg */}
                       <p className="text-lg font-medium">No active subscriptions found.</p>
                        {/* Use Body 2 */}
                        <p className="text-body2 mt-2">Explore stores offering daily or weekly deliveries!</p>
                         <Link href="/" passHref>
                            <Button variant="default" className="mt-6" withRipple>Browse Stores</Button>
                         </Link>
                    </CardContent>
                 </Card>
            ) : null}
        </div>

         {/* Address Dialog for managing addresses */}
         {profile && (
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
