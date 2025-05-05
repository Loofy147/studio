
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getUserProfile, getStoreById, Store, UserProfile, unfollowStore } from '@/services/store';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, Building, XCircle, Star, Eye, Trash2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
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
import { FollowedStoreCardSkeleton } from '@/components/Skeletons'; // Import skeleton


export default function FollowedStoresPage() {
    const userId = "user123"; // Hardcoded for demo
    const { toast } = useToast();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [followedStores, setFollowedStores] = useState<Store[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [unfollowingStoreId, setUnfollowingStoreId] = useState<string | null>(null);

     // Animation variants
    const containerVariants = {
        hidden: { opacity: 1 },
        visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
        }
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
    };

     // Fetch profile and then followed stores
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const userProfile = await getUserProfile(userId);
                if (!userProfile) {
                    throw new Error("Could not load user profile.");
                }
                setProfile(userProfile);

                if (userProfile.followedStoreIds && userProfile.followedStoreIds.length > 0) {
                    const storePromises = userProfile.followedStoreIds.map(storeId => getStoreById(storeId));
                    const storesData = await Promise.all(storePromises);
                    // Filter out null results in case a store was deleted
                    const validStores = storesData.filter((store): store is Store => store !== null);
                    setFollowedStores(validStores);
                } else {
                    setFollowedStores([]); // No stores followed
                }
            } catch (err: any) {
                console.error("Failed to fetch followed stores:", err);
                setError(err.message || "Could not load followed stores. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [userId]);

     const handleUnfollow = useCallback(async (storeId: string, storeName: string) => {
        setUnfollowingStoreId(storeId);
        try {
            const updatedProfile = await unfollowStore(userId, storeId);
             if (updatedProfile) {
                setProfile(updatedProfile); // Update profile state
                // Refilter displayed stores based on updated profile
                 setFollowedStores(prevStores => prevStores.filter(store => store.id !== storeId));
                 toast({
                    title: "Store Unfollowed",
                    description: `You are no longer following ${storeName}.`,
                    variant: "destructive",
                 });
             } else {
                  throw new Error("Failed to update profile after unfollowing.");
             }

        } catch (err: any) {
            console.error("Failed to unfollow store:", err);
            toast({
                title: "Error",
                description: `Could not unfollow ${storeName}. Please try again.`,
                variant: "destructive",
            });
        } finally {
            setUnfollowingStoreId(null);
        }
    }, [userId, toast]);


    return (
        <div className="container mx-auto py-10 space-y-8">
             <div>
                <Link href="/profile" passHref>
                    <Button variant="ghost" size="sm" className="mb-2 text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Building className="h-7 w-7 text-primary" /> Followed Stores
                </h1>
                 <p className="text-muted-foreground mt-1">Stores you are following for updates and offers.</p>
            </div>

            {error && (
                <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Error Loading Stores</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

             {isLoading ? (
               <motion.div
                   className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                   variants={containerVariants}
                   initial="hidden"
                   animate="visible"
               >
                 <FollowedStoreCardSkeleton />
                 <FollowedStoreCardSkeleton />
                 <FollowedStoreCardSkeleton />
               </motion.div>
             ) : followedStores.length > 0 ? (
                 <motion.div
                     className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                     variants={containerVariants}
                     initial="hidden"
                     animate="visible"
                     layout // Animate layout shifts when items are removed
                 >
                     <AnimatePresence>
                        {followedStores.map((store) => (
                            <motion.div key={store.id} variants={itemVariants} layout exit="exit">
                                <Card className="flex flex-col overflow-hidden h-full transition-all duration-300 hover:shadow-lg border group">
                                     <CardHeader className="p-0">
                                        <div className="relative w-full h-48 overflow-hidden">
                                            <Image
                                                src={store.imageUrl || `https://picsum.photos/seed/${store.id}/400/300`}
                                                alt={`${store.name} banner`}
                                                fill
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105 bg-muted"
                                                data-ai-hint={`${store.category} store`}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                                             {store.rating && (
                                                <Badge variant="secondary" className="absolute top-2 right-2 text-xs flex items-center gap-1 backdrop-blur-sm bg-black/40 text-white border-none px-2 py-1">
                                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400"/> {store.rating.toFixed(1)}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="p-4 pb-2">
                                            <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors">{store.name}</CardTitle>
                                            <Badge variant="outline" className="mt-2 capitalize text-xs tracking-wide">{store.category}</Badge>
                                        </div>
                                    </CardHeader>
                                     <CardContent className="flex-grow p-4 pt-0">
                                        <CardDescription className="text-sm line-clamp-3 text-muted-foreground">{store.description}</CardDescription>
                                    </CardContent>
                                     <CardFooter className="p-4 pt-2 mt-auto bg-muted/20 flex justify-between items-center">
                                        <Link href={`/store/${store.id}`} passHref>
                                            <Button size="sm" variant="outline" className="group/button">
                                                <Eye className="mr-2 h-4 w-4" />
                                                Visit Store
                                            </Button>
                                        </Link>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="text-destructive hover:bg-destructive/10"
                                                    disabled={unfollowingStoreId === store.id}
                                                    title={`Unfollow ${store.name}`}
                                                >
                                                     {unfollowingStoreId === store.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4"/>}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                <AlertDialogTitle>Unfollow {store.name}?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to unfollow this store? You won't receive updates or special offers anymore.
                                                </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleUnfollow(store.id, store.name)}
                                                    className={buttonVariants({ variant: "destructive" })}
                                                    >
                                                    Yes, Unfollow
                                                </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                 </motion.div>
             ) : (
                 <Card className="border-dashed border-muted-foreground/30 bg-card/50">
                    <CardContent className="p-10 text-center text-muted-foreground">
                        <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30"/>
                        <p className="text-lg font-medium">You are not following any stores yet.</p>
                        <p className="text-sm mt-1">Visit stores you like and click the "Follow" button!</p>
                         <Link href="/" passHref>
                            <Button variant="default" className="mt-6">Browse Stores</Button>
                         </Link>
                    </CardContent>
                 </Card>
             )}
        </div>
    );
}
