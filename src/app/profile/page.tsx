
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"; // Added CardFooter
import { getUserProfile, UserProfile, Order, getUserOrders } from "@/services/store"; // Assuming profile/order functions are in store service
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { User, ShoppingBag, MapPin, Phone, Mail, Award, Edit, Settings, LogOut, PackageCheck, Truck, Hourglass, XCircle } from 'lucide-react'; // Added more icons
import { format } from 'date-fns'; // For date formatting
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert
import Link from "next/link"; // Import Link

// Helper to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

// Map status to icon and variant for the table
const orderStatusDetails: Record<Order['status'], { icon: React.ElementType; variant: BadgeProps['variant']; color: string }> = {
    'Pending': { icon: Hourglass, variant: 'outline', color: 'text-yellow-600 dark:text-yellow-400' },
    'Processing': { icon: Settings, variant: 'outline', color: 'text-blue-600 dark:text-blue-400' },
    'Shipped': { icon: Truck, variant: 'secondary', color: 'text-purple-600 dark:text-purple-400' },
    'Delivered': { icon: PackageCheck, variant: 'default', color: 'text-green-600 dark:text-green-400' },
    'Cancelled': { icon: XCircle, variant: 'destructive', color: 'text-red-600 dark:text-red-400' }
};

// Define BadgeProps type locally if not exported from Badge component
import { type VariantProps } from "class-variance-authority"
import { badgeVariants } from "@/components/ui/badge"
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}


export default function ProfilePage() {
  // In a real app, you'd get the userId from authentication context
  const userId = "user123"; // Hardcoded for demonstration

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates on unmounted component

    const fetchProfileData = async () => {
      setIsLoadingProfile(true);
      setError(null);
      try {
        // Simulate loading
        // await new Promise(resolve => setTimeout(resolve, 800));
        const profileData = await getUserProfile(userId);
        if (isMounted) {
            setProfile(profileData);
             if (!profileData) {
                setError("Could not load profile.");
             }
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
         if (isMounted) setError("Could not load profile information.");
      } finally {
         if (isMounted) setIsLoadingProfile(false);
      }
    };

    const fetchOrders = async () => {
        setIsLoadingOrders(true);
        // Keep profile error state separate if desired
        // setError(null); // Reset order-specific error if needed
        try {
             // Simulate loading
            // await new Promise(resolve => setTimeout(resolve, 1200));
            const orderData = await getUserOrders(userId);
             if (isMounted) {
                // Get only the last 5 orders for the summary table
                setOrders(orderData.sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime()).slice(0, 5));
             }
        } catch (err) {
            console.error("Failed to fetch orders:", err);
            // Append or set specific order error
             if (isMounted) setError(prev => prev ? `${prev} Failed to load recent orders.` : "Failed to load recent orders.");
        } finally {
             if (isMounted) setIsLoadingOrders(false);
        }
    }

    fetchProfileData();
    fetchOrders();

    return () => {
        isMounted = false; // Cleanup function to set flag false when component unmounts
    }
  }, [userId]);

  const ProfileInfoSkeleton = () => (
     <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6">
             <Skeleton className="h-20 w-20 rounded-full" />
             <div className="space-y-2 flex-grow">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-5 w-64" />
             </div>
            <div className="flex gap-2 self-start sm:self-center">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
            </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6 pt-0">
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="flex items-start gap-3">
                     <Skeleton className="h-5 w-5 rounded mt-1" />
                     <div className="space-y-1.5">
                         <Skeleton className="h-4 w-20" />
                         <Skeleton className="h-4 w-40" />
                     </div>
                 </div>
                 <div className="flex items-start gap-3">
                     <Skeleton className="h-5 w-5 rounded mt-1" />
                     <div className="space-y-1.5">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-32" />
                    </div>
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
        <CardHeader className="flex flex-row justify-between items-center">
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
                        <TableHead className="w-[100px]"><Skeleton className="h-4 w-16" /></TableHead>
                        <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                        <TableHead><Skeleton className="h-4 w-32" /></TableHead>
                        <TableHead className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableHead>
                        <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                        <TableHead className="text-right"><Skeleton className="h-4 w-16" /></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                             <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-4 w-16" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
   )

  return (
    <div className="space-y-10">
        {/* Profile Header */}
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <User className="h-8 w-8" /> Your Profile
            </h1>
            {/* Placeholder Buttons */}
            <div className="flex gap-2">
                <Button variant="outline" size="sm">
                    <Settings className="mr-2 h-4 w-4" /> Account Settings
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" /> Log Out
                </Button>
            </div>
       </div>


      {error && !profile && !isLoadingProfile && ( // Show error only if profile failed and isn't loading
           <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Error Loading Profile</AlertTitle>
                <AlertDescription>{error.replace('Failed to load recent orders.', '').trim()}</AlertDescription>
           </Alert>
      )}

       {/* Profile Information Section */}
      {isLoadingProfile ? <ProfileInfoSkeleton /> : profile ? (
        <Card className="shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6">
             <Avatar className="h-20 w-20 border-2 border-primary/20"> {/* Larger avatar */}
                <AvatarImage src={`https://avatar.vercel.sh/${profile.email}?size=80`} alt={profile.name} />
                <AvatarFallback className="text-2xl bg-muted">
                    {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
             </Avatar>
            <div className="flex-grow">
                <CardTitle className="text-2xl font-semibold">{profile.name}</CardTitle>
                <CardDescription className="flex items-center gap-1.5 text-base mt-1">
                    <Mail className="h-4 w-4 text-muted-foreground"/>{profile.email}
                </CardDescription>
            </div>
             <Button variant="outline" size="sm" className="self-start sm:self-center">
                <Edit className="mr-2 h-4 w-4" /> Edit Profile
             </Button>
          </CardHeader>
          <CardContent className="space-y-6 p-6 pt-0">
             <Separator />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 text-sm">
                 {profile.address && (
                    <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                        <div>
                            <span className="font-medium block text-foreground">Address</span>
                            <span className="text-muted-foreground">{profile.address}</span>
                        </div>
                    </div>
                 )}
                 {profile.phone && (
                    <div className="flex items-start gap-3">
                        <Phone className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                        <div>
                             <span className="font-medium block text-foreground">Phone</span>
                            <span className="text-muted-foreground">{profile.phone}</span>
                        </div>
                    </div>
                 )}
            </div>
            <Separator />
            <div className="flex items-center gap-3">
                 <Award className="h-6 w-6 text-primary shrink-0" />
                 <div>
                     <span className="font-medium block text-foreground">Loyalty Points</span>
                     <span className="text-2xl font-bold text-primary">{profile.loyaltyPoints}</span>
                     <span className="text-muted-foreground"> points</span>
                 </div>
            </div>
          </CardContent>
        </Card>
      ) : !error && !isLoadingProfile ? ( // Only show if not loading and no error message already shown
         <Card><CardContent className="p-6 text-muted-foreground text-center">Could not load profile information.</CardContent></Card>
      ): null}


      {/* Order History Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
                <ShoppingBag className="h-6 w-6" /> Recent Order History
            </h2>
            <Link href="/orders" passHref legacyBehavior>
                <Button variant="link" className="text-primary">View All Orders</Button>
            </Link>
        </div>

        {error && orders.length === 0 && !isLoadingOrders && ( // Show order-specific error if orders failed
             <Alert variant="destructive">
                 <XCircle className="h-4 w-4" />
                 <AlertTitle>Error Loading Orders</AlertTitle>
                 <AlertDescription>{error.replace('Could not load profile information.', '').trim()}</AlertDescription>
             </Alert>
        )}

        {isLoadingOrders ? <OrderHistorySkeleton /> : orders.length > 0 ? (
            <Card className="shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="w-[100px]">Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Store</TableHead>
                        <TableHead className="hidden md:table-cell text-right">Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => {
                            const details = orderStatusDetails[order.status];
                            const StatusIcon = details.icon;
                            return (
                            <TableRow key={order.id} className="hover:bg-muted/30">
                                <TableCell className="font-mono text-xs">#{order.id.substring(order.id.length - 6)}</TableCell>
                                <TableCell>{format(order.orderDate, 'MMM d, yyyy')}</TableCell>
                                <TableCell>
                                    <Link href={`/store/${order.storeId}`} className="hover:underline font-medium">
                                        {order.storeName}
                                    </Link>
                                </TableCell>
                                <TableCell className="hidden md:table-cell text-right font-medium">{formatCurrency(order.totalAmount)}</TableCell>
                                <TableCell>
                                    <Badge variant={details.variant} className={`capitalize text-xs px-2 py-0.5 rounded-full font-medium border ${details.color} ${details.variant !== 'destructive' ? `border-${details.color?.replace('text-', '')}/30 bg-${details.color?.replace('text-', '')}/10 dark:bg-${details.color?.replace('text-', '')}/20` : ''} `}>
                                        <StatusIcon className="h-3 w-3 mr-1" />
                                        {order.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Link href={`/orders#order-${order.id}`} passHref legacyBehavior>
                                         <Button variant="ghost" size="sm">View</Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                            );
                        })}
                    </TableBody>
                    </Table>
                </CardContent>
            </Card>
        ) : !error && !isLoadingOrders ? ( // Only show if not loading and no error shown
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
