
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"; // Added CardFooter
import { getUserOrders, Order } from "@/services/store"; // Assuming orders function is in store service
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge, badgeVariants } from "@/components/ui/badge"; // Import badgeVariants
import { format } from 'date-fns';
import { PackageCheck, PackageSearch, Truck, Home, CheckCircle, XCircle, Hourglass, ShoppingBag, Package, Eye } from 'lucide-react'; // Added ShoppingBag, Package, Eye
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress"; // Import Progress
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert
import Link from "next/link"; // Import Link
import { cn, formatCurrency } from "@/lib/utils"; // Import cn and formatCurrency
import React from 'react'; // Import React for forwardRef etc.
import { motion, AnimatePresence } from 'framer-motion'; // Import motion


// Map status to progress value, icon, color, and variant
const statusDetails: Record<Order['status'], { value: number; icon: React.ElementType; color: string; variant: VariantProps<typeof badgeVariants>["variant"]; description: string; progressColor: string }> = {
    'Pending': { value: 10, icon: Hourglass, color: 'text-yellow-600 dark:text-yellow-400', variant: 'outline', description: 'Order placed, awaiting confirmation.', progressColor: 'bg-yellow-500' },
    'Processing': { value: 35, icon: PackageSearch, color: 'text-blue-600 dark:text-blue-400', variant: 'outline', description: 'Store is preparing your order.', progressColor: 'bg-blue-500' },
    'Shipped': { value: 70, icon: Truck, color: 'text-purple-600 dark:text-purple-400', variant: 'secondary', description: 'Your order is on its way.', progressColor: 'bg-purple-500' },
    'Delivered': { value: 100, icon: PackageCheck, color: 'text-green-600 dark:text-green-400', variant: 'success', description: 'Your order has been delivered.', progressColor: 'bg-accent' }, // Use success variant
    'Cancelled': { value: 0, icon: XCircle, color: 'text-red-600 dark:text-red-400', variant: 'destructive', description: 'The order has been cancelled.', progressColor: 'bg-red-500' }
};


export default function OrdersPage() {
  // In a real app, get userId from authentication context
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
    <Card className="overflow-hidden border bg-card/50 animate-pulse"> {/* Use card background */}
        <CardHeader className="bg-muted/30 p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                 <div>
                     <Skeleton className="h-6 w-36 mb-1.5 bg-muted/50" />
                     <Skeleton className="h-4 w-56 bg-muted/50" />
                 </div>
                 <Skeleton className="h-7 w-28 rounded-full mt-1 sm:mt-0 bg-muted/50" />
            </div>
        </CardHeader>
        <CardContent className="p-4 space-y-5">
             <div>
                 <Skeleton className="h-4 w-20 mb-2 bg-muted/50" /> {/* Items title */}
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-full bg-muted/50" />
                    <Skeleton className="h-4 w-5/6 bg-muted/50" />
                 </div>
                 <Skeleton className="h-5 w-24 mt-3 ml-auto bg-muted/50" /> {/* Total */}
             </div>
             <Separator />
            <div className="space-y-2">
                <Skeleton className="h-4 w-32 mb-2 bg-muted/50" /> {/* Tracking Status title */}
                <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full bg-muted/50" />
                    <Skeleton className="h-4 w-48 bg-muted/50" />
                </div>
                <Skeleton className="h-2 w-full rounded-full bg-muted/50" /> {/* Progress bar skeleton */}
            </div>
             <Separator />
             <div className="flex items-start gap-2">
                 <Skeleton className="h-4 w-4 mt-0.5 shrink-0 bg-muted/50" />
                 <Skeleton className="h-4 w-full bg-muted/50" />
             </div>
        </CardContent>
         <CardFooter className="bg-muted/30 p-4 flex justify-end gap-2">
            <Skeleton className="h-9 w-24 bg-muted/50" />
            <Skeleton className="h-9 w-32 bg-muted/50" />
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
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  };

  return (
    // Use standard page padding
    <div className="space-y-8 container mx-auto py-8 px-4 md:px-6 lg:px-8">
       <div className="flex items-center gap-3 border-b pb-4">
            <ShoppingBag className="h-8 w-8 text-primary"/>
            {/* Use Heading 1 size */}
            <h1 className="text-4xl font-extrabold tracking-tight">Your Orders</h1>
       </div>
      <p className="text-lg text-muted-foreground max-w-2xl"> {/* Use text-lg */}
          Track the status and view details of your past and current orders. Find tracking numbers and estimated delivery dates here.
      </p>

      {error && (
           <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Error Loading Orders</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
           </Alert>
      )}

      {/* Use standard spacing */}
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
          <AnimatePresence> {/* Wrap list in AnimatePresence */}
            {orders.map((order) => {
                const details = statusDetails[order.status];
                const StatusIcon = details.icon;

                return (
                <motion.div key={order.id} variants={itemVariants} exit="exit" layout> {/* Add exit and layout */}
                    {/* Use standard padding */}
                    <Card className="overflow-hidden border shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200">
                    <CardHeader className="bg-muted/30 p-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                            {/* Use Heading 3 size */}
                            <CardTitle className="text-2xl font-semibold">Order #{order.id.substring(order.id.length - 6)}</CardTitle>
                            <CardDescription className="text-sm mt-0.5">
                                Placed on {format(order.orderDate, 'MMMM d, yyyy')} from{' '}
                                <Link href={`/store/${order.storeId}`} className="font-medium text-primary hover:underline">
                                    {order.storeName}
                                </Link>
                            </CardDescription>
                        </div>
                        <Badge
                            variant={details.variant ?? "default"} // Provide default variant
                            className={cn(
                                'capitalize text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 w-fit', // Increased padding and semibold
                                details.color,
                                // Removed specific background/border classes, rely on variant + color
                            )}
                        >
                            <StatusIcon className="h-3.5 w-3.5" /> {/* Slightly larger icon */}
                            <span>{order.status}</span>
                        </Badge>
                        </div>
                    </CardHeader>
                    {/* Use standard padding and spacing */}
                    <CardContent className="p-4 space-y-5">
                        {/* Item Summary */}
                        <div>
                            {/* Use Heading 4 size */}
                            <h4 className="text-lg font-semibold mb-2 flex items-center gap-1.5"><Package className="h-5 w-5 text-muted-foreground"/>Items</h4>
                            <ul className="text-sm text-muted-foreground list-disc list-inside pl-2 space-y-1">
                                {order.items.map(item => (
                                    <li key={item.productId}>
                                        <span className="font-medium text-foreground">{item.quantity} x {item.name}</span> ({formatCurrency(item.price)} each)
                                    </li>
                                ))}
                            </ul>
                            {/* Use Heading 3 size */}
                            <p className="text-right font-bold text-2xl mt-3">Total: {formatCurrency(order.totalAmount)}</p>
                        </div>

                        <Separator />

                        {/* Tracking Information */}
                        {order.status !== 'Cancelled' && (
                        <div>
                            {/* Use Heading 4 size */}
                            <h4 className="text-lg font-semibold mb-3">Tracking Status:</h4>
                            <div className="flex items-center gap-2 mb-2">
                                <StatusIcon className={`h-5 w-5 ${details.color}`} />
                                <span className={`text-base font-medium ${details.color}`}> {/* Use text-base */}
                                    {details.description}
                                </span>
                            </div>
                            <Progress value={details.value} className="h-2" indicatorClassName={details.progressColor} /> {/* Thicker progress bar */}
                            {order.status === 'Shipped' && order.trackingNumber && (
                                <p className="text-xs text-muted-foreground mt-2.5">
                                    Tracking Number: <span className="font-medium text-foreground">{order.trackingNumber}</span>
                                    {/* Add link to carrier if available */}
                                </p>
                            )}
                            {order.status === 'Delivered' && (
                                <p className="text-sm text-green-600 dark:text-green-400 mt-2.5 flex items-center gap-1"> {/* Use text-sm */}
                                    <CheckCircle className="h-4 w-4"/> Delivered successfully.
                                </p>
                            )}
                        </div>
                        )}
                        {order.status === 'Cancelled' && (
                            <div className="text-base text-destructive flex items-center gap-2"> {/* Use text-base */}
                                <XCircle className="h-5 w-5"/>
                                <span>This order was cancelled.</span>
                            </div>
                        )}

                        <Separator />

                        {/* Address */}
                        <div className="flex items-start gap-3 text-sm"> {/* Use gap-3 */}
                            <Home className="h-5 w-5 mt-0.5 shrink-0 text-muted-foreground" /> {/* Use h-5 w-5 */}
                            <div>
                                <span className="font-semibold block text-foreground text-base">Delivery Address</span> {/* Use text-base */}
                                <span className="text-muted-foreground">{order.deliveryAddress}</span>
                            </div>
                        </div>
                    </CardContent>
                    {/* Use standard padding */}
                    <CardFooter className="bg-muted/20 p-4 flex justify-end gap-3"> {/* Use gap-3 */}
                        {/* Use solid primary button for main action */}
                        <Button variant="default" size="sm">
                            <Eye className="mr-1.5 h-4 w-4" /> View Invoice
                        </Button>
                        {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                            <Button variant="outline" size="sm">Contact Store</Button>
                        )}
                        {order.status === 'Delivered' && (
                            <Button variant="secondary" size="sm">Leave Review</Button>
                        )}
                    </CardFooter>
                    </Card>
                </motion.div>
                );
            })}
          </AnimatePresence>
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