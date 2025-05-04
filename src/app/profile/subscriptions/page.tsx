'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getUserProfile, UserProfile, Subscription, getUserSubscriptions, updateSubscriptionStatus } from '@/services/store';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CalendarClock, Play, Pause, Trash2, Repeat, XCircle, Eye, Loader2 } from 'lucide-react'; // Added Loader2
import { format } from 'date-fns';
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

// Define BadgeProps type locally if not exported from Badge component
import { type VariantProps } from "class-variance-authority"
import { badgeVariants } from "@/components/ui/badge"
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}


// Map status to icon and variant for the subscription table
const subscriptionStatusDetails: Record<Subscription['status'], { icon: React.ElementType; variant: BadgeProps['variant']; color: string; label: string }> = {
    'active': { icon: Play, variant: 'default', color: 'text-green-600 dark:text-green-400', label: 'Active' },
    'paused': { icon: Pause, variant: 'secondary', color: 'text-yellow-600 dark:text-yellow-400', label: 'Paused' },
    'cancelled': { icon: XCircle, variant: 'destructive', color: 'text-red-600 dark:text-red-400', label: 'Cancelled' }
};


export default function SubscriptionsPage() {
    const userId = "user123"; // Hardcoded for demo
    const { toast } = useToast();

    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [isLoadingSubs, setIsLoadingSubs] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingSubId, setUpdatingSubId] = useState<string | null>(null);

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

    // Fetch subscriptions
    useEffect(() => {
        const fetchSubscriptions = async () => {
            setIsLoadingSubs(true);
            setError(null);
            try {
                const subData = await getUserSubscriptions(userId);
                setSubscriptions(subData.sort((a, b) => b.startDate.getTime() - a.startDate.getTime()));
            } catch (err: any) {
                console.error("Failed to fetch subscriptions:", err);
                setError(err.message || "Could not load your subscriptions. Please try again.");
            } finally {
                setIsLoadingSubs(false);
            }
        };
        fetchSubscriptions();
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
    }, [toast]);


    const SubscriptionTableSkeleton = () => (
     <Card>
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
                     {Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i} className="hover:bg-muted/20">
                            <TableCell className="pl-4"><Skeleton className="h-4 w-full" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                            <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-full" /></TableCell>
                             <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell> {/* Status */}
                            <TableCell className="text-right pr-4 space-x-1">
                                <Skeleton className="h-8 w-8 inline-block rounded-md" />
                                <Skeleton className="h-8 w-8 inline-block rounded-md" />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
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
                    <CalendarClock className="h-7 w-7 text-primary" /> My Subscriptions
                </h1>
                 <p className="text-muted-foreground mt-1">Manage your recurring daily or weekly deliveries.</p>
            </div>

            {error && (
                <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Error Loading Subscriptions</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {isLoadingSubs ? <SubscriptionTableSkeleton /> : subscriptions.length > 0 ? (
                 <motion.div
                     variants={containerVariants}
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
                                                        {/* Optional: View Offer Details Button */}
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
            ) : (
                 <Card className="border-dashed border-muted-foreground/30 bg-card/50">
                    <CardContent className="p-10 text-center text-muted-foreground">
                        <CalendarClock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30"/>
                        <p className="text-lg font-medium">No active subscriptions found.</p>
                        <p className="text-sm mt-1">Explore stores offering daily or weekly deliveries!</p>
                         <Link href="/" passHref legacyBehavior>
                            <Button variant="default" className="mt-6">Browse Stores</Button>
                         </Link>
                    </CardContent>
                 </Card>
            )}
        </div>
    );
}
