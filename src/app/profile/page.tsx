
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserProfile, UserProfile, Order, getUserOrders } from "@/services/store"; // Assuming profile/order functions are in store service
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { User, ShoppingBag, MapPin, Phone, Mail, Award, Edit } from 'lucide-react';
import { format } from 'date-fns'; // For date formatting

// Helper to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export default function ProfilePage() {
  // In a real app, you'd get the userId from authentication context
  const userId = "user123"; // Hardcoded for demonstration

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoadingProfile(true);
      setError(null);
      try {
        const profileData = await getUserProfile(userId);
        setProfile(profileData);
        if (!profileData) {
            setError("Could not load profile.");
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError("Could not load profile information.");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    const fetchOrders = async () => {
        setIsLoadingOrders(true);
        // Keep profile error state separate if desired
        // setError(null);
        try {
            const orderData = await getUserOrders(userId);
            setOrders(orderData);
        } catch (err) {
            console.error("Failed to fetch orders:", err);
            // Append or set specific order error
            setError(prev => prev ? `${prev} Failed to load orders.` : "Failed to load orders.");
        } finally {
            setIsLoadingOrders(false);
        }
    }

    fetchProfileData();
    fetchOrders();
  }, [userId]);

  const ProfileInfoSkeleton = () => (
     <Card>
        <CardHeader className="flex flex-row items-center gap-4">
             <Skeleton className="h-16 w-16 rounded-full" />
             <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
             </div>
            <Skeleton className="h-9 w-20 ml-auto" />
        </CardHeader>
        <CardContent className="space-y-4">
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="flex items-center gap-3"> <Skeleton className="h-5 w-5 rounded" /> <Skeleton className="h-4 w-40" /> </div>
                 <div className="flex items-center gap-3"> <Skeleton className="h-5 w-5 rounded" /> <Skeleton className="h-4 w-32" /> </div>
                 <div className="flex items-center gap-3"> <Skeleton className="h-5 w-5 rounded" /> <Skeleton className="h-4 w-56" /> </div>
                 <div className="flex items-center gap-3"> <Skeleton className="h-5 w-5 rounded" /> <Skeleton className="h-4 w-28" /> </div>
            </div>
             <Separator />
             <div className="flex items-center gap-3"><Skeleton className="h-5 w-5 rounded" /> <Skeleton className="h-4 w-36" /></div>
        </CardContent>
     </Card>
  )

   const OrderHistorySkeleton = () => (
    <Card>
        <CardHeader>
             <Skeleton className="h-7 w-40" />
             <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                        <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                        <TableHead><Skeleton className="h-4 w-32" /></TableHead>
                        <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                        <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
   )

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold flex items-center gap-2">
         <User className="h-8 w-8" /> Your Profile
      </h1>

      {error && <p className="text-destructive">{error}</p>}

       {/* Profile Information Section */}
      {isLoadingProfile ? <ProfileInfoSkeleton /> : profile ? (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
             <Avatar className="h-16 w-16">
                {/* Placeholder for actual image */}
                <AvatarImage src={`https://avatar.vercel.sh/${profile.email}?size=64`} alt={profile.name} />
                <AvatarFallback className="text-xl">
                    {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
             </Avatar>
            <div className="flex-grow">
                <CardTitle className="text-2xl">{profile.name}</CardTitle>
                <CardDescription><Mail className="inline-block h-4 w-4 mr-1" />{profile.email}</CardDescription>
            </div>
             {/* Placeholder Edit Button */}
             <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" /> Edit Profile
             </Button>
          </CardHeader>
          <CardContent className="space-y-4">
             <Separator />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                 {profile.address && (
                    <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                            <span className="font-medium block">Address</span>
                            <span className="text-muted-foreground">{profile.address}</span>
                        </div>
                    </div>
                 )}
                 {profile.phone && (
                    <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <div>
                             <span className="font-medium block">Phone</span>
                            <span className="text-muted-foreground">{profile.phone}</span>
                        </div>
                    </div>
                 )}
            </div>
            <Separator />
            <div className="flex items-center gap-3">
                 <Award className="h-5 w-5 text-muted-foreground" />
                 <div>
                     <span className="font-medium block">Loyalty Points</span>
                     <span className="text-lg font-semibold text-primary">{profile.loyaltyPoints}</span> points
                 </div>
            </div>
          </CardContent>
        </Card>
      ) : !error ? (
         <p className="text-muted-foreground text-center">Could not load profile information.</p>
      ): null}


      {/* Order History Section */}
      <h2 className="text-2xl font-semibold flex items-center gap-2 mt-10 border-t pt-8">
        <ShoppingBag className="h-6 w-6" /> Order History
      </h2>
       {isLoadingOrders ? <OrderHistorySkeleton /> : orders.length > 0 ? (
         <Card>
             <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Store</TableHead>
                       <TableHead>Total</TableHead>
                       <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id.substring(order.id.length - 6)}</TableCell>
                        <TableCell>{format(order.orderDate, 'MMM d, yyyy')}</TableCell>
                         <TableCell>{order.storeName}</TableCell>
                        <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                        <TableCell>
                            <Badge variant={
                                order.status === 'Delivered' ? 'default' :
                                order.status === 'Shipped' ? 'secondary' :
                                order.status === 'Processing' ? 'outline' :
                                order.status === 'Cancelled' ? 'destructive' : 'secondary'
                                } className="capitalize">
                                {order.status}
                            </Badge>
                         </TableCell>
                         <TableCell className="text-right">
                            {/* Placeholder for viewing order details */}
                             <Button variant="ghost" size="sm">View</Button>
                         </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
             </CardContent>
         </Card>
       ) : !error ? (
         <p className="text-muted-foreground text-center">You haven't placed any orders yet.</p>
       ) : null}

    </div>
  );
}
