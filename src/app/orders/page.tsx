
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"; // Added CardFooter
import { getUserOrders, Order } from "@/services/store"; // Assuming orders function is in store service
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { PackageCheck, PackageSearch, Truck, Home, CheckCircle, XCircle, Hourglass, ShoppingBag, Package, Eye } from 'lucide-react'; // Added ShoppingBag, Package, Eye
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress"; // Import Progress
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert
import Link from "next/link"; // Import Link
import { cn } from "@/lib/utils"; // Import cn
import React from 'react'; // Import React for forwardRef etc.
import { motion } from 'framer-motion'; // Import motion
import * as ProgressPrimitive from "@radix-ui/react-progress"; // Need primitive for custom component

// Helper to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

// Map status to progress value, icon, color, and variant
const statusDetails: Record<Order['status'], { value: number; icon: React.ElementType; color: string; variant: 'default' | 'secondary' | 'outline' | 'destructive'; description: string; progressColor: string }> = {
    'Pending': { value: 10, icon: Hourglass, color: 'text-yellow-600 dark:text-yellow-400', variant: 'outline', description: 'Order placed, awaiting confirmation.', progressColor: 'bg-yellow-500' },
    'Processing': { value: 35, icon: PackageSearch, color: 'text-blue-600 dark:text-blue-400', variant: 'outline', description: 'Store is preparing your order.', progressColor: 'bg-blue-500' },
    'Shipped': { value: 70, icon: Truck, color: 'text-purple-600 dark:text-purple-400', variant: 'secondary', description: 'Your order is on its way.', progressColor: 'bg-purple-500' },
    'Delivered': { value: 100, icon: PackageCheck, color: 'text-green-600 dark:text-green-400', variant: 'default', description: 'Your order has been delivered.', progressColor: 'bg-green-500' },
    'Cancelled': { value: 0, icon: XCircle, color: 'text-red-600 dark:text-red-400', variant: 'destructive', description: 'The order has been cancelled.', progressColor: 'bg-red-500' }
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
    <Card className="overflow-hidden border"> {/* Add border */}
        <CardHeader className="bg-muted/30 p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                 <div>
                     <Skeleton className="h-6 w-36 mb-1.5" />
                     <Skeleton className="h-4 w-56" />
                 </div>
                 <Skeleton className="h-7 w-28 rounded-full mt-1 sm:mt-0" />
            </div>
        </CardHeader>
        <CardContent className="p-4 space-y-5">
             <div>
                 <Skeleton className="h-4 w-20 mb-2" /> {/* Items title */}
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                 </div>
                 <Skeleton className="h-5 w-24 mt-3 ml-auto" /> {/* Total */}
             </div>
             <Separator />
            <div className="space-y-2">
                <Skeleton className="h-4 w-32 mb-2" /> {/* Tracking Status title */}
                <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-2 w-full rounded-full bg-muted-foreground/20" /> {/* Progress bar skeleton */}
            </div>
             <Separator />
             <div className="flex items-start gap-2">
                 <Skeleton className="h-4 w-4 mt-0.5 shrink-0" />
                 <Skeleton className="h-4 w-full" />
             </div>
        </CardContent>
         <CardFooter className="bg-muted/30 p-4 flex justify-end gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-32" />
         </CardFooter>
    </Card>
  );

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 1 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1 // Stagger children animation
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div className="space-y-8 container mx-auto py-10"> {/* Added container */}
       <div className="flex items-center gap-3">
            <ShoppingBag className="h-8 w-8 text-primary"/>
            <h1 className="text-3xl font-bold tracking-tight">Your Orders</h1>
       </div>
      <p className="text-muted-foreground max-w-2xl">
          Track the status and view details of your past and current orders. Find tracking numbers and estimated delivery dates here.
      </p>

      {error && (
           <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Error Loading Orders</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
           </Alert>
      )}

      {isLoadingOrders ? (
        <div className="space-y-6">
           {Array.from({ length: 3 }).map((_, i) => <OrderCardSkeleton key={i} />)}
        </div>
      ) : orders.length > 0 ? (
        <motion.div
           className="space-y-6"
           variants={containerVariants}
           initial="hidden"
           animate="show"
         >
          {orders.map((order) => {
            const details = statusDetails[order.status];
            const StatusIcon = details.icon;
            const badgeBaseColor = details.color.replace('text-', '').replace(/-\d+$/, ''); // e.g., 'yellow', 'blue'
            const badgeBgClass = `bg-${badgeBaseColor}-500/10 dark:bg-${badgeBaseColor}-500/20`;
            const badgeBorderClass = `border-${badgeBaseColor}-500/30`;

            return (
              <motion.div key={order.id} variants={itemVariants}>
                <Card className="overflow-hidden border shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200">
                  <CardHeader className="bg-muted/30 p-4"> {/* Slightly lighter header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                          <CardTitle className="text-lg font-semibold">Order #{order.id.substring(order.id.length - 6)}</CardTitle>
                          <CardDescription className="text-sm mt-0.5">
                              Placed on {format(order.orderDate, 'MMMM d, yyyy')} from{' '}
                                <Link href={`/store/${order.storeId}`} className="font-medium text-primary hover:underline">
                                    {order.storeName}
                                </Link>
                          </CardDescription>
                      </div>
                      <Badge
                          variant={details.variant === 'default' ? 'secondary' : details.variant} // Use secondary for delivered badge base
                          className={cn(
                              'capitalize text-xs px-2 py-0.5 rounded-full font-medium border flex items-center gap-1 w-fit',
                              details.color,
                              details.variant === 'destructive' ? '' : `${badgeBgClass} ${badgeBorderClass}`,
                              details.variant === 'default' && 'bg-green-500/10 dark:bg-green-500/20 border-green-500/30 text-green-600 dark:text-green-400' // Specific style for 'Delivered'
                          )}
                      >
                          <StatusIcon className="h-3 w-3" />
                          <span>{order.status}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-5">
                      {/* Item Summary */}
                      <div>
                          <h4 className="font-medium text-sm mb-2 flex items-center gap-1.5"><Package className="h-4 w-4 text-muted-foreground"/>Items</h4>
                          <ul className="text-sm text-muted-foreground list-disc list-inside pl-2 space-y-1">
                              {order.items.map(item => (
                                  <li key={item.productId}>
                                      <span className="font-medium text-foreground">{item.quantity} x {item.name}</span> ({formatCurrency(item.price)} each)
                                  </li>
                              ))}
                          </ul>
                          <p className="text-right font-semibold text-base mt-3">Total: {formatCurrency(order.totalAmount)}</p>
                      </div>

                    <Separator />

                    {/* Tracking Information */}
                    {order.status !== 'Cancelled' && (
                      <div>
                          <h4 className="font-medium text-sm mb-2">Tracking Status:</h4>
                          <div className="flex items-center gap-2 mb-2">
                              <StatusIcon className={`h-5 w-5 ${details.color}`} />
                              <span className={`text-sm font-medium ${details.color}`}>
                                  {details.description}
                              </span>
                          </div>
                          <Progress value={details.value} className="h-1.5" indicatorClassName={details.progressColor} />
                          {order.status === 'Shipped' && order.trackingNumber && (
                              <p className="text-xs text-muted-foreground mt-2.5">
                                  Tracking Number: <span className="font-medium text-foreground">{order.trackingNumber}</span>
                                  {/* Add link to carrier if available */}
                              </p>
                          )}
                          {order.status === 'Delivered' && (
                              <p className="text-xs text-green-600 dark:text-green-400 mt-2.5 flex items-center gap-1">
                                <CheckCircle className="h-3.5 w-3.5"/> Delivered successfully.
                              </p>
                          )}
                      </div>
                    )}
                      {order.status === 'Cancelled' && (
                          <div className="text-sm text-destructive flex items-center gap-2">
                              <XCircle className="h-4 w-4"/>
                              <span>This order was cancelled.</span>
                          </div>
                      )}

                    <Separator />

                    {/* Address */}
                    <div className="flex items-start gap-2 text-sm">
                          <Home className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                          <div>
                              <span className="font-medium block text-foreground">Delivery Address</span>
                              <span className="text-muted-foreground">{order.deliveryAddress}</span>
                          </div>
                      </div>
                  </CardContent>
                  <CardFooter className="bg-muted/20 p-4 flex justify-end gap-2"> {/* Slightly lighter footer */}
                      <Button variant="outline" size="sm">
                          <Eye className="mr-1.5 h-3.5 w-3.5" /> View Invoice
                      </Button>
                      {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                          <Button variant="ghost" size="sm">Contact Store</Button>
                      )}
                      {order.status === 'Delivered' && (
                          <Button variant="secondary" size="sm">Leave Review</Button>
                      )}
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <Card>
           <CardContent className="p-10 text-center text-muted-foreground">
                <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50"/>
               <p className="text-lg font-medium">You haven't placed any orders yet.</p>
               <p className="text-sm mt-2">Start exploring stores and find something you like!</p>
               <Link href="/" passHref legacyBehavior>
                    <Button variant="default" className="mt-6">
                        Browse Stores
                    </Button>
               </Link>
           </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper to add class to Progress indicator
declare module 'react' {
  interface HTMLAttributes<T> extends React.AriaAttributes, React.DOMAttributes<T> {
    indicatorClassName?: string;
  }
}
