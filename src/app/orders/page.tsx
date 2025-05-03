
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserOrders, Order } from "@/services/store"; // Assuming orders function is in store service
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { PackageCheck, PackageSearch, Truck, Home, CheckCircle, XCircle, Hourglass } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress"; // Import Progress

// Helper to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

// Map status to progress value and icon
const statusDetails: Record<Order['status'], { value: number; icon: React.ElementType; color: string; description: string }> = {
    'Pending': { value: 10, icon: Hourglass, color: 'text-yellow-500', description: 'Order placed, awaiting confirmation.' },
    'Processing': { value: 35, icon: PackageSearch, color: 'text-blue-500', description: 'Store is preparing your order.' },
    'Shipped': { value: 70, icon: Truck, color: 'text-purple-500', description: 'Your order is on its way.' },
    'Delivered': { value: 100, icon: PackageCheck, color: 'text-green-500', description: 'Your order has been delivered.' },
    'Cancelled': { value: 0, icon: XCircle, color: 'text-red-500', description: 'The order has been cancelled.' }
};


export default function OrdersPage() {
  // In a real app, get userId from authentication
  const userId = "user123";

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoadingOrders(true);
      setError(null);
      try {
        const orderData = await getUserOrders(userId);
        // Sort orders by date, newest first
        setOrders(orderData.sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime()));
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setError("Could not load your orders. Please try again later.");
      } finally {
        setIsLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [userId]);

  const OrderCardSkeleton = () => (
    <Card>
        <CardHeader>
            <div className="flex justify-between items-start">
                 <div>
                     <Skeleton className="h-5 w-32 mb-1" />
                     <Skeleton className="h-4 w-48" />
                 </div>
                 <Skeleton className="h-6 w-24 rounded-full" />
            </div>
        </CardHeader>
        <CardContent className="space-y-4">
            <Skeleton className="h-16 w-full" /> {/* Placeholder for items */}
             <Separator />
            <div className="space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-full rounded-full" /> {/* Progress bar skeleton */}
            </div>
             <Separator />
            <div className="flex justify-between">
                 <Skeleton className="h-9 w-24" />
                 <Skeleton className="h-9 w-32" />
            </div>
        </CardContent>
    </Card>
  );


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Your Orders & Tracking</h1>
      <p className="text-muted-foreground">View the status and details of your recent orders.</p>

      {error && <p className="text-destructive">{error}</p>}

      {isLoadingOrders ? (
        <div className="space-y-6">
           {Array.from({ length: 3 }).map((_, i) => <OrderCardSkeleton key={i} />)}
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => {
            const details = statusDetails[order.status];
            const StatusIcon = details.icon;
            return (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50 p-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                     <div>
                         <CardTitle className="text-lg">Order #{order.id.substring(order.id.length - 6)}</CardTitle>
                         <CardDescription>
                             Placed on {format(order.orderDate, 'MMMM d, yyyy')} from <strong>{order.storeName}</strong>
                         </CardDescription>
                    </div>
                    <Badge
                         variant={
                             order.status === 'Delivered' ? 'default' :
                             order.status === 'Shipped' ? 'secondary' :
                             order.status === 'Processing' ? 'outline' :
                             order.status === 'Cancelled' ? 'destructive' : 'secondary'
                         }
                         className={`capitalize text-sm px-3 py-1 ${details.color} border-${details.color?.replace('text-', '')}/50`} // Basic color mapping
                     >
                        <StatusIcon className="h-4 w-4 mr-1.5" />
                        {order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                    {/* Item Summary */}
                    <div>
                        <h4 className="font-medium text-sm mb-1">Items:</h4>
                         <ul className="text-sm text-muted-foreground list-disc list-inside">
                            {order.items.map(item => (
                                <li key={item.productId}>
                                    {item.quantity} x {item.name} ({formatCurrency(item.price)} each)
                                </li>
                            ))}
                         </ul>
                         <p className="text-right font-semibold mt-2">Total: {formatCurrency(order.totalAmount)}</p>
                    </div>

                   <Separator />

                   {/* Tracking Information */}
                   {order.status !== 'Cancelled' && (
                     <div>
                         <h4 className="font-medium text-sm mb-2">Tracking Status:</h4>
                         <div className="flex items-center gap-2 mb-1">
                            <StatusIcon className={`h-5 w-5 ${details.color}`} />
                            <span className={`text-sm font-medium ${details.color}`}>
                                {details.description}
                            </span>
                         </div>
                         <Progress value={details.value} className="h-2" />
                         {order.status === 'Shipped' && order.trackingNumber && (
                            <p className="text-xs text-muted-foreground mt-2">
                                Tracking Number: <span className="font-medium">{order.trackingNumber}</span>
                                {/* Add link to carrier if available */}
                            </p>
                         )}
                     </div>
                   )}

                   <Separator />

                   {/* Address & Actions */}
                   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-sm">
                        <div className="flex items-start gap-2 text-muted-foreground">
                            <Home className="h-4 w-4 mt-0.5 shrink-0" />
                            <span>Delivery to: {order.deliveryAddress}</span>
                        </div>
                        <div className="flex gap-2 self-end sm:self-center">
                             {/* Placeholder buttons */}
                             <Button variant="outline" size="sm">View Details</Button>
                            {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                                <Button variant="ghost" size="sm">Contact Store</Button>
                            )}
                         </div>
                   </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-muted-foreground mt-10">You haven't placed any orders yet.</p>
      )}
    </div>
  );
}

