
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from 'next/navigation'; // Use hook for client components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getStoreById, Store, Product, DailyOffer, createSubscription, dailyOfferEligibleCategories, getUserProfile, UserProfile, followStore, unfollowStore, StoreCategory } from "@/services/store"; // Added follow/unfollow, StoreCategory
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { ArrowLeft, ShoppingCart, Star, Plus, Filter, Tag, Clock, MapPin, CalendarClock, Repeat, CheckCircle, XCircle, Store as StoreIcon, Bell, BookmarkPlus, BookmarkMinus } from 'lucide-react'; // Added Bookmark icons
import Link from "next/link";
import { useToast } from "@/hooks/use-toast"; // Import useToast
import { Separator } from "@/components/ui/separator"; // Import Separator
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Import Select
import { cn, formatCurrency } from "@/lib/utils"; // Updated import path for formatCurrency
import { motion, AnimatePresence } from "framer-motion"; // Import motion
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert

// Helper to generate theme class based on store category
const getThemeClass = (category: StoreCategory | undefined): string => {
   if (!category) return 'theme-category-other'; // Default theme
   const formattedCategory = category.replace(/\s+/g, '-').toLowerCase();
   return `theme-category-theme-category-${formattedCategory}`; // Ensure prefix matches CSS
}


export default function StorePage() {
  const params = useParams();
  const storeId = params.storeId as string; // Get storeId from URL parameters
  const userId = "user123"; // Hardcoded for demo - replace with auth context
  const { toast } = useToast(); // Initialize toast

  const [store, setStore] = useState<Store | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null); // Add user profile state
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true); // Loading state for profile
  const [error, setError] = useState<string | null>(null);
  const [selectedProductCategory, setSelectedProductCategory] = useState<string>("all");
  const [isSubscribing, setIsSubscribing] = useState<string | null>(null); // Track which offer is being subscribed to
  const [isTogglingFollow, setIsTogglingFollow] = useState(false); // State for follow button loading

  useEffect(() => {
    if (!storeId) {
        setError("Store ID is missing.");
        setIsLoading(false);
        setIsLoadingProfile(false);
        return;
    };

    let isMounted = true; // Flag to prevent state updates on unmounted component

    const fetchStoreDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const storeDetails = await getStoreById(storeId);
        if (isMounted) {
           if (storeDetails) {
             setStore(storeDetails);
           } else {
              setError("Store not found.");
           }
        }
      } catch (err: any) {
        console.error("Failed to fetch store details:", err);
         if (isMounted) setError(err.message || "Could not load store details. Please try again later.");
      } finally {
         if (isMounted) setIsLoading(false);
      }
    };

     const fetchUserProfile = async () => {
        setIsLoadingProfile(true);
         try {
            const profile = await getUserProfile(userId);
             if (isMounted) setUserProfile(profile);
         } catch (err: any) {
             console.error("Failed to fetch user profile:", err);
              if (isMounted) setError(prev => prev ? `${prev} Failed to load user info.` : "Failed to load user information."); // Add to existing error or set new
         } finally {
              if (isMounted) setIsLoadingProfile(false);
         }
     }

    fetchStoreDetails();
    fetchUserProfile();

     return () => { isMounted = false; } // Cleanup function

  }, [storeId, userId]);

   // Memoize product categories
    const productCategories = useMemo(() => {
        if (!store?.products) return ["all"];
        const uniqueCategories = new Set(store.products.map(p => p.category));
        return ["all", ...Array.from(uniqueCategories).sort()];
    }, [store?.products]);

    // Memoize filtered products
    const filteredProducts = useMemo(() => {
        if (!store?.products) return [];
        if (selectedProductCategory === "all") return store.products;
        return store.products.filter(p => p.category === selectedProductCategory);
    }, [store?.products, selectedProductCategory]);

   // Memoize active daily offers
   const activeDailyOffers = useMemo(() => {
       // Only show offers if the store is active AND open
       if (!store?.isActive || !store?.isOpen) return [];
      return store?.dailyOffers?.filter(offer => offer.isActive) || [];
   }, [store?.dailyOffers, store?.isActive, store?.isOpen]);

   // Check if the current user is following this store
   const isFollowing = useMemo(() => {
       return userProfile?.followedStoreIds?.includes(storeId) ?? false;
   }, [userProfile?.followedStoreIds, storeId]);


   const handleAddToCart = (product: Product) => {
     if (!store?.isOpen) {
         toast({
             title: "Store Closed",
             description: `${store.name} is currently closed. You can place a pre-order.`,
             variant: "default"
         });
         // Implement pre-order logic here if needed
         console.log(`Attempted to add ${product.name} from closed store ${store.name}. Pre-order?`);
         return;
     }
     console.log(`Adding ${product.name} to cart (Store: ${store?.name})`);
     // In a real app, add to cart state/context
     toast({
       title: "Added to Cart!",
       description: (
         <div className="flex items-center gap-2">
           <ShoppingCart className="h-4 w-4 text-primary" />
           <span>{product.name} added to your cart.</span>
         </div>
       ),
       variant: "default",
     });
   };

   const handleSubscribe = async (offer: DailyOffer) => {
        if (!store || isSubscribing || !store.isOpen) {
             if (!store?.isOpen) {
                 toast({ title: "Store Closed", description: `${store?.name} is currently closed and cannot accept new subscriptions.`});
             }
            return;
        }
        setIsSubscribing(offer.id);
        console.log(`Subscribing to ${offer.name} from ${store.name}`);
        // Assume userId is available (e.g., from auth context)
        // const userId = "user123"; // Already defined above

        try {
            await createSubscription(userId, offer.id);
            toast({
                title: "Subscription Successful!",
                description: (
                 <div className="flex items-center gap-2">
                   <CheckCircle className="h-4 w-4 text-green-500" />
                   <span>You've subscribed to {offer.name}. Check 'My Subscriptions' in your profile.</span>
                 </div>
                ),
                variant: "default", // Or a success variant
            });
        } catch (err: any) { // Explicitly type error
             console.error("Subscription failed:", err);
             toast({
                title: "Subscription Failed",
                description: err.message || "Could not subscribe to this offer. Please try again.", // Show error message
                variant: "destructive",
             });
        } finally {
            setIsSubscribing(null);
        }
   };

    const handleToggleFollow = useCallback(async () => {
        if (!userProfile || !store) return;
        setIsTogglingFollow(true);
        try {
            let updatedProfile;
            if (isFollowing) {
                updatedProfile = await unfollowStore(userId, storeId);
            } else {
                updatedProfile = await followStore(userId, storeId);
            }
            if (updatedProfile) {
                setUserProfile(updatedProfile); // Update local profile state
                toast({
                    title: isFollowing ? "Store Unfollowed" : "Store Followed",
                    description: `You are now ${isFollowing ? 'no longer following' : 'following'} ${store.name}.`,
                    variant: isFollowing ? "destructive" : "default",
                });
            } else {
                throw new Error("Failed to update profile after follow/unfollow.");
            }
        } catch (err: any) { // Explicitly type error
            console.error("Failed to toggle follow:", err);
            toast({
                title: "Error",
                description: err.message || "Could not update follow status. Please try again.", // Show error message
                variant: "destructive",
            });
        } finally {
            setIsTogglingFollow(false);
        }
    }, [userId, storeId, userProfile, isFollowing, store, toast]);


   // Updated Product Card
   const ProductCard = ({ product, delay = 0 }: { product: Product, delay?: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.2, delay: delay * 0.04 }}
      className="h-full"
    >
        <Card className={cn(
             "flex flex-col overflow-hidden h-full transition-all duration-300 hover:shadow-lg border hover:border-[hsl(var(--store-accent))] group bg-card",
             !store?.isOpen && "opacity-60" // Dim closed store products
             )}>
            <CardHeader className="p-0">
                <div className="relative w-full h-40 overflow-hidden">
                    <Image
                        src={product.imageUrl || `https://picsum.photos/seed/${product.id}/300/200`}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105 bg-muted"
                        data-ai-hint={`${product.category} product`}
                    />
                     {product.size && <Badge variant="secondary" className="absolute bottom-1 right-1 text-[10px] px-1.5 py-0.5 bg-black/50 text-white border-none">{product.size}</Badge>}
                </div>
                 {/* Adjusted padding */}
                <div className="p-3 pb-1">
                    {/* Applied h2 typography */}
                    <CardTitle className="text-2xl font-semibold line-clamp-1 group-hover:text-[hsl(var(--store-accent))] transition-colors">{product.name}</CardTitle>
                    <Badge variant="secondary" className="mt-1 capitalize text-[10px] font-normal px-1.5 py-0.5 tracking-wide">{product.category}</Badge>
                </div>
            </CardHeader>
            {/* Adjusted padding */}
            <CardContent className="flex-grow p-3 pt-1 space-y-1">
                 {/* Applied h2 typography */}
                <p className="text-2xl font-bold text-[hsl(var(--store-accent))]">{formatCurrency(product.price)}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
                 {product.ingredients && (
                     <p className="text-xs text-muted-foreground/80 pt-1">Ingredients: {product.ingredients.join(', ')}</p>
                 )}
            </CardContent>
             {/* Adjusted padding */}
            <CardFooter className="p-3 pt-1 mt-auto">
                <Button
                    size="sm"
                    variant="default" // Use solid primary button
                    className={cn(
                        "w-full group/button btn-text-uppercase-semibold", // Added uppercase class
                         !store?.isOpen && "bg-muted hover:bg-muted text-muted-foreground cursor-not-allowed" // Style for closed store button
                    )}
                    onClick={() => handleAddToCart(product)}
                    style={{ '--store-accent': 'hsl(var(--store-accent))' } as React.CSSProperties}
                    disabled={!store?.isOpen || !store?.isActive} // Disable button if store is closed OR inactive
                    >
                     {store?.isOpen && store?.isActive ? (
                         <>
                            <Plus className="mr-1 h-4 w-4 transition-transform duration-300 group-hover/button:rotate-90" /> Add to Cart
                         </>
                     ) : !store?.isActive ? (
                        <XCircle className="mr-1 h-4 w-4"/> Unavailable
                     ) : (
                          <>
                             <Bell className="mr-1 h-4 w-4"/> Pre-order
                          </>
                     )}
                </Button>
            </CardFooter>
        </Card>
    </motion.div>
   );

   // Daily Offer Card
    const DailyOfferCard = ({ offer, delay = 0 }: { offer: DailyOffer, delay?: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.2, delay: delay * 0.05 }}
        className="h-full"
    >
        <Card className={cn(
             "flex flex-col overflow-hidden h-full transition-all duration-300 hover:shadow-lg border border-amber-400/50 hover:border-amber-500 group bg-amber-50/30 dark:bg-amber-950/20",
             !store?.isOpen && "opacity-60 cursor-not-allowed" // Dim if store closed
             )}>
            <CardHeader className="p-0">
                 <div className="relative w-full h-32 overflow-hidden">
                     <Image
                         src={offer.imageUrl || `https://picsum.photos/seed/${offer.id}/300/150`}
                         alt={offer.name}
                         fill
                         sizes="(max-width: 768px) 100vw, 50vw"
                         className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105 bg-muted"
                         data-ai-hint={`${offer.frequency} ${store?.category} offer`}
                     />
                     <Badge variant="secondary" className="absolute top-1 left-1 text-[10px] px-1.5 py-0.5 bg-black/50 text-white border-none capitalize flex items-center gap-1">
                         <Repeat className="w-2.5 h-2.5"/> {offer.frequency}
                     </Badge>
                 </div>
                 <div className="p-3 pb-1">
                     <CardTitle className="text-base font-semibold line-clamp-1 text-amber-700 dark:text-amber-400 group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">{offer.name}</CardTitle>
                 </div>
            </CardHeader>
            <CardContent className="flex-grow p-3 pt-1 space-y-1">
                 <p className="font-bold text-lg text-amber-600 dark:text-amber-400">{formatCurrency(offer.price)} <span className="text-xs font-normal text-muted-foreground">per {offer.frequency === 'daily' ? 'day' : 'week'}</span></p>
                 <p className="text-xs text-muted-foreground line-clamp-3">{offer.description}</p>
                 {/* Optionally list items - could get long */}
                 {/* <ul className="text-xs text-muted-foreground/80 list-disc list-inside pt-1">
                    {offer.items.map(item => <li key={item.productId}>{item.quantity}x {item.productId}</li>)}
                 </ul> */}
            </CardContent>
            <CardFooter className="p-3 pt-1 mt-auto">
                 <Button
                    size="sm"
                    variant="default" // Consider a different variant for subscriptions
                    className={cn(
                        "w-full group/button bg-amber-500 hover:bg-amber-600 text-white btn-text-uppercase-semibold", // Added uppercase class
                        !store?.isOpen && "bg-muted hover:bg-muted text-muted-foreground cursor-not-allowed"
                    )}
                    onClick={() => handleSubscribe(offer)}
                    disabled={isSubscribing === offer.id || !store?.isOpen || !store?.isActive}
                    >
                     {isSubscribing === offer.id ? (
                        <Repeat className="mr-1 h-4 w-4 animate-spin" />
                     ) : (
                         <CalendarClock className="mr-1 h-4 w-4" />
                     )}
                     {isSubscribing === offer.id ? 'Subscribing...' : 'Subscribe Now'}
                 </Button>
            </CardFooter>
        </Card>
    </motion.div>
    );


   const ProductSkeleton = () => (
     <Card className="flex flex-col overflow-hidden border animate-pulse bg-card/50">
        <Skeleton className="h-40 w-full bg-muted/50" />
        <CardHeader className="p-3 pb-1">
            <Skeleton className="h-6 w-3/4 mb-1 bg-muted/50" /> {/* Title skeleton adjusted */}
            <Skeleton className="h-3 w-1/3 bg-muted/50" />
        </CardHeader>
        <CardContent className="p-3 pt-1 space-y-1">
            <Skeleton className="h-6 w-1/4 bg-muted/50" /> {/* Price skeleton adjusted */}
            <Skeleton className="h-3 w-full bg-muted/50" />
            <Skeleton className="h-3 w-5/6 bg-muted/50" />
        </CardContent>
        <CardFooter className="p-3 pt-1">
            <Skeleton className="h-9 w-full bg-muted/50" />
        </CardFooter>
    </Card>
   )

    const DailyOfferSkeleton = () => (
     <Card className="flex flex-col overflow-hidden border animate-pulse bg-card/50">
        <Skeleton className="h-32 w-full bg-muted/50" />
        <CardHeader className="p-3 pb-1">
            <Skeleton className="h-5 w-3/4 mb-1 bg-muted/50" />
        </CardHeader>
        <CardContent className="p-3 pt-1 space-y-1">
            <Skeleton className="h-6 w-1/3 bg-muted/50" />
            <Skeleton className="h-3 w-full bg-muted/50" />
            <Skeleton className="h-3 w-4/5 bg-muted/50" />
        </CardContent>
        <CardFooter className="p-3 pt-1">
            <Skeleton className="h-9 w-full bg-muted/50" />
        </CardFooter>
    </Card>
   )

   const themeClass = getThemeClass(store?.category);

  if (isLoading || isLoadingProfile) { // Show loading skeleton if either store or profile is loading
    return (
        <div className="container mx-auto px-4 py-10 space-y-8 animate-pulse"> {/* Adjusted container padding */}
            {/* Loading state structure */}
             <div className="flex items-center mb-6">
                <Skeleton className="h-8 w-32 bg-muted/50" /> {/* Back button */}
            </div>
            <Card className="overflow-hidden border shadow-sm bg-card/50">
                <CardHeader className="p-0 relative">
                    <Skeleton className="h-56 w-full bg-muted/50" /> {/* Banner area */}
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                         <Skeleton className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background bg-background/50 z-10"/>
                    </div>
                </CardHeader>
                <CardContent className="pt-16 text-center -mt-12 relative z-0 space-y-2 pb-6">
                    <Skeleton className="h-8 w-1/2 mx-auto bg-muted/50" /> {/* Title */}
                    <Skeleton className="h-6 w-1/4 mx-auto bg-muted/50" /> {/* Badge */}
                    <Skeleton className="h-4 w-3/4 mx-auto bg-muted/50" /> {/* Description */}
                    <Skeleton className="h-4 w-2/3 mx-auto bg-muted/50" /> {/* Description */}
                    <Skeleton className="h-5 w-1/3 mx-auto bg-muted/50" /> {/* Rating/Details */}
                     <Skeleton className="h-10 w-32 mx-auto mt-2 bg-muted/50"/> {/* Follow Button Skeleton */}
                </CardContent>
            </Card>

            <Separator className="my-8"/>

             {/* Offer Skeleton section (if applicable) */}
             <>
                 <Skeleton className="h-8 w-1/3 mb-4 bg-muted/50" />
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"> {/* Adjusted gap */}
                    <DailyOfferSkeleton />
                    <DailyOfferSkeleton />
                 </div>
                 <Separator className="my-8"/>
            </>

            <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-8 w-1/4 bg-muted/50" /> {/* Products Title */}
                <Skeleton className="h-10 w-[220px] bg-muted/50" /> {/* Filter */}
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"> {/* Adjusted gap */}
                {Array.from({ length: 10 }).map((_, index) => <ProductSkeleton key={index} />)}
            </div>
        </div>
    );
  }

  if (error) {
     return (
       <div className="container mx-auto px-6 md:px-8 py-10 flex flex-col items-center justify-center h-[60vh]"> {/* Adjusted padding */}
           <Alert variant="destructive" className="max-w-md w-full">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Oops! Something went wrong.</AlertTitle>
                <AlertDescription>
                     {error}
                     <div className="mt-4">
                        <Link href="/" passHref legacyBehavior>
                           <Button variant="secondary" size="sm">
                               <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Stores
                           </Button>
                       </Link>
                     </div>
                </AlertDescription>
           </Alert>
       </div>
     );
   }

  if (!store) {
     return (
        <div className="container mx-auto px-6 md:px-8 py-10 flex flex-col items-center justify-center h-[60vh]"> {/* Adjusted padding */}
           <Card className="w-full max-w-md">
               <CardContent className="p-10 text-center text-muted-foreground">
                   <StoreIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30"/> {/* Changed Icon */}
                   <p className="text-lg font-medium">Store Not Found</p>
                   <p className="text-sm mt-2">We couldn't find the store you were looking for.</p>
                    <Link href="/" passHref legacyBehavior>
                       <Button variant="outline" size="sm" className="mt-6">
                           <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Stores
                       </Button>
                   </Link>
               </CardContent>
           </Card>
       </div>
     );
   }

  return (
     <div className={cn("container mx-auto px-6 md:px-8 py-10 space-y-10", themeClass)}> {/* Adjusted padding and spacing */}
      {/* Back Button */}
        <Link href="/" passHref legacyBehavior>
            <Button variant="ghost" size="sm" className="mb-0 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Stores
            </Button>
        </Link>

      {/* Store Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="overflow-hidden border shadow-md bg-card"> {/* Subtle shadow */}
            <CardHeader className="p-0 relative">
                 {/* Gradient or Image Banner */}
                 <div className="w-full h-48 md:h-56 bg-gradient-to-br from-[hsl(var(--store-accent))] to-primary/70 relative">
                     {/* Store Image/Logo */}
                     <div className="absolute inset-0 flex items-center justify-center p-4">
                         <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden shadow-xl border-4 border-background bg-background z-10 flex items-center justify-center">
                             <Image
                                src={store.imageUrl || `https://picsum.photos/seed/${store.id}/400/400`}
                                alt={`${store.name} logo`}
                                fill
                                sizes="(max-width: 768px) 112px, 144px"
                                className="object-cover"
                                data-ai-hint={`${store.category} store logo`}
                                priority
                             />
                         </div>
                    </div>
                    {/* Store Status Overlay/Badge */}
                     {!store.isOpen && store.isActive && ( // Show closed overlay only if store is active but closed by owner
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-20">
                           <StoreIcon className="h-12 w-12 text-white/70 mb-2"/>
                           <Badge variant="destructive" className="text-lg px-4 py-1 font-semibold">
                                Currently Closed
                           </Badge>
                           <p className="text-white/80 text-sm mt-2">Pre-orders may be available.</p>
                        </div>
                     )}
                     {!store.isActive && ( // Admin disabled overlay
                         <div className="absolute inset-0 bg-red-900/80 flex flex-col items-center justify-center z-20">
                            <XCircle className="h-12 w-12 text-white/90 mb-2"/>
                            <Badge variant="destructive" className="text-lg px-4 py-1 font-semibold bg-white text-red-700">
                                 Store Disabled
                            </Badge>
                            <p className="text-white/90 text-sm mt-2">This store is temporarily unavailable.</p>
                         </div>
                     )}
                 </div>
            </CardHeader>
             {/* Adjusted padding */}
            <CardContent className={cn("pt-16 text-center -mt-14 relative z-0 pb-6 space-y-2", (!store.isOpen || !store.isActive) && "opacity-70")}> {/* Adjust padding for overlap, reduce opacity if closed/inactive */}
                 <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{store.name}</h1>
                 <Badge
                     variant="outline" // Use outline for category
                     className="capitalize text-sm py-0.5 px-3 border-[hsl(var(--store-accent))] text-[hsl(var(--store-accent))] bg-[hsl(var(--store-accent))]/10"
                 >
                    {store.category}
                 </Badge>
                 <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto text-sm">{store.description}</p>

                 {/* Store Details Row */}
                  {/* Adjusted spacing and font size */}
                 <div className="flex items-center justify-center flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
                    {store.rating && (
                        <div className="flex items-center gap-1 font-medium">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" /> {/* Filled star */}
                            <span className="font-bold text-sm text-foreground">{store.rating.toFixed(1)}</span> / 5.0
                        </div>
                     )}
                     {store.address && (
                        <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" /> {store.address}
                        </div>
                     )}
                      {store.openingHours && (
                        <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" /> {store.openingHours}
                        </div>
                     )}
                 </div>
                 {/* Follow Button */}
                {userProfile && store.isActive && ( // Only show follow button if profile loaded and store is active
                    <Button
                        variant={isFollowing ? "secondary" : "outline"}
                        size="sm"
                        onClick={handleToggleFollow}
                        disabled={isTogglingFollow}
                        className="mt-4"
                    >
                        {isTogglingFollow ? (
                             <Repeat className="mr-2 h-4 w-4 animate-spin" />
                        ) : isFollowing ? (
                            <BookmarkMinus className="mr-2 h-4 w-4 text-destructive" />
                        ) : (
                             <BookmarkPlus className="mr-2 h-4 w-4 text-primary" />
                        )}
                        {isFollowing ? "Unfollow Store" : "Follow Store"}
                    </Button>
                )}
            </CardContent>
        </Card>
       </motion.div>

       {/* Daily Offers Section (if applicable) */}
       {dailyOfferEligibleCategories.includes(store.category as StoreCategory) && activeDailyOffers.length > 0 && store.isActive && ( // Ensure StoreCategory type check and active check
          <section className="pt-0"> {/* Removed top padding */}
             {/* Adjusted spacing */}
            <h2 className="text-3xl font-semibold flex items-center gap-2 mb-6">
               <CalendarClock className="text-amber-500"/> Daily & Weekly Offers
            </h2>
             {/* Adjusted gap */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 <AnimatePresence>
                    {activeDailyOffers.map((offer, index) => ( // Render only active offers
                        <DailyOfferCard key={offer.id} offer={offer} delay={index} />
                    ))}
                </AnimatePresence>
            </div>
             {/* Removed 'no offers' message from here, handled by section conditional */}
             <Separator className="mt-10 border-[hsl(var(--store-accent))] opacity-30"/>
          </section>
       )}


       {/* Products Section */}
       <div className="pt-0"> {/* Removed top padding */}
            {/* Adjusted spacing */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                 {/* Applied h2 typography */}
                <h2 className="text-3xl font-semibold flex items-center gap-2">
                   <Tag className="text-[hsl(var(--store-accent))]"/> Products
                </h2>
                 {/* Product Category Filter */}
                 {productCategories.length > 2 && store.isActive && ( // Only show filter if store is active
                     <Select
                        value={selectedProductCategory}
                        onValueChange={(value: string) => setSelectedProductCategory(value)}
                        disabled={!store.isActive} // Disable if store inactive
                     >
                        <SelectTrigger className="w-full sm:w-[240px] shadow-sm"> {/* Added shadow */}
                            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                            <SelectValue placeholder="Filter by product category" />
                        </SelectTrigger>
                        <SelectContent>
                            {productCategories.map(category => (
                            <SelectItem key={category} value={category} className="capitalize">
                                {category === "all" ? "All Products" : category}
                            </SelectItem>
                            ))}
                        </SelectContent>
                     </Select>
                 )}
            </div>

            {store.products && store.products.length > 0 && store.isActive ? ( // Only render product grid if store is active
                 filteredProducts.length > 0 ? (
                     // Adjusted gap
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        <AnimatePresence>
                            {filteredProducts.map((product, index) => (
                                <ProductCard key={product.id} product={product} delay={index}/>
                            ))}
                        </AnimatePresence>
                    </div>
                 ) : ( // Render 'no products found' only if store is active
                     <Card className="border-dashed border-muted-foreground/50 col-span-full">
                       <CardContent className="p-10 text-center text-muted-foreground">
                            <Tag className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30"/>
                           <p className="text-lg font-medium">No products found in '{selectedProductCategory}'</p>
                           <p className="text-sm mt-1">Try selecting a different category.</p>
                            <Button variant="link" onClick={() => setSelectedProductCategory('all')} className="mt-4 text-[hsl(var(--store-accent))]">
                                Show All Products
                            </Button>
                       </CardContent>
                    </Card>
                 )
            ) : !store.isActive ? null // Don't show products if store is inactive
            : ( // Render 'no products yet' only if store is active
                <Card className="border-dashed border-muted-foreground/50 col-span-full">
                   <CardContent className="p-10 text-center text-muted-foreground">
                        <Tag className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30"/>
                       <p className="text-lg font-medium">No products found in this store yet.</p>
                       <p className="text-sm mt-2">Check back later for new items!</p>
                   </CardContent>
                </Card>
            )}
       </div>
    </div>
  );
}
