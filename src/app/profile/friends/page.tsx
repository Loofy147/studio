
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
// Assume a service function getUserProfiles exists, similar to getStores/getProducts
import { getUserProfile, UserProfile, removeFriend, getFriendProfiles } from '@/services/store';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Users, XCircle, Trash2, Loader2, MessageSquare, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from "@/components/ui/input";
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
import { FriendCardSkeleton } from '@/components/Skeletons'; // Import skeleton


export default function FriendsListPage() {
    const userId = "user123"; // Hardcoded for demo
    const { toast } = useToast();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [friends, setFriends] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [removingFriendId, setRemovingFriendId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState(''); // State for search input

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

    // Fetch profile and friend details
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const userProfile = await getUserProfile(userId);
                if (!userProfile) {
                    throw new Error("Could not load your profile.");
                }
                setProfile(userProfile);

                if (userProfile.friendIds && userProfile.friendIds.length > 0) {
                    const friendProfiles = await getFriendProfiles(userProfile.friendIds);
                    setFriends(friendProfiles);
                } else {
                    setFriends([]); // No friends
                }
            } catch (err: any) {
                console.error("Failed to fetch friends list:", err);
                setError(err.message || "Could not load your friends list. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [userId]);

    const handleRemoveFriend = useCallback(async (friendId: string, friendName: string) => {
        setRemovingFriendId(friendId);
        try {
            const updatedProfile = await removeFriend(userId, friendId);
            if (updatedProfile) {
                setProfile(updatedProfile); // Update local profile state
                // Refetch or filter friend list based on updated profile
                 setFriends(prevFriends => prevFriends.filter(friend => friend.id !== friendId));
                 toast({
                    title: "Friend Removed",
                    description: `You are no longer friends with ${friendName}.`,
                    variant: "destructive",
                 });
             } else {
                  throw new Error("Failed to update profile after removing friend.");
             }

        } catch (err: any) {
            console.error("Failed to remove friend:", err);
            toast({
                title: "Error",
                description: `Could not remove ${friendName}. Please try again.`,
                variant: "destructive",
            });
        } finally {
            setRemovingFriendId(null);
        }
    }, [userId, toast]);

     // Filter friends based on search term
     const filteredFriends = friends.filter(friend =>
        friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        friend.email.toLowerCase().includes(searchTerm.toLowerCase())
     );


    return (
        <div className="container mx-auto py-10 space-y-8">
            <div>
                <Link href="/profile" passHref>
                    <Button variant="ghost" size="sm" className="mb-2 text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Users className="h-7 w-7 text-primary" /> Friends List
                </h1>
                 <p className="text-muted-foreground mt-1">Manage your connections on the platform.</p>
            </div>

            {error && (
                <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Error Loading Friends</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

             {/* Search and Add Friend */}
            <div className="flex flex-col sm:flex-row gap-4">
                 <Input
                    placeholder="Search friends by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow"
                 />
                 <Button variant="outline" disabled> {/* Add friend functionality TBD */}
                     <UserPlus className="mr-2 h-4 w-4"/> Add Friend
                 </Button>
            </div>


            {isLoading ? (
                <motion.div
                    className="space-y-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <FriendCardSkeleton />
                    <FriendCardSkeleton />
                    <FriendCardSkeleton />
                </motion.div>
            ) : filteredFriends.length > 0 ? (
                <motion.div
                    className="space-y-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    layout // Animate layout shifts when items are removed
                >
                   <AnimatePresence>
                        {filteredFriends.map((friend) => (
                             <motion.div key={friend.id} variants={itemVariants} layout exit="exit">
                                <Card className="border p-4 flex flex-col sm:flex-row items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={`https://avatar.vercel.sh/${friend.email}?size=48`} alt={friend.name} />
                                            <AvatarFallback>{friend.name.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold"><Link href={`/profile?user=${friend.id}`} className="hover:underline">{friend.name}</Link></p>
                                            <p className="text-sm text-muted-foreground">{friend.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-3 sm:mt-0">
                                        <Button variant="outline" size="sm" asChild>
                                             <Link href={`/chat?user=${friend.id}`} className="flex items-center justify-center"> {/* Link to chat */}
                                                <MessageSquare className="mr-2 h-4 w-4"/> Chat
                                            </Link>
                                        </Button>
                                         <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="text-destructive hover:bg-destructive/10"
                                                    disabled={removingFriendId === friend.id}
                                                    title={`Remove ${friend.name} from friends`}
                                                >
                                                     {removingFriendId === friend.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4"/>}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                <AlertDialogTitle>Remove {friend.name}?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to remove {friend.name} from your friends list?
                                                </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleRemoveFriend(friend.id, friend.name)}
                                                    className={buttonVariants({ variant: "destructive" })}
                                                    >
                                                    Yes, Remove
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
            ) : (
                 <Card className="border-dashed border-muted-foreground/30 bg-card/50">
                    <CardContent className="p-10 text-center text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30"/>
                        <p className="text-lg font-medium">{searchTerm ? "No friends found matching your search." : "You haven't added any friends yet."}</p>
                        <p className="text-sm mt-1">{searchTerm ? "Try refining your search term." : "Find and add friends to connect!"}</p>
                         {!searchTerm && (
                             <Button variant="default" className="mt-6" disabled> {/* Add friend functionality TBD */}
                                <UserPlus className="mr-2 h-4 w-4"/> Add Friend
                             </Button>
                         )}
                    </CardContent>
                 </Card>
            )}
        </div>
    );
}
