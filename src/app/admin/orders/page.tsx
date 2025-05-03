'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
// Assume a service function getAllOrders exists
import { Order, getUserOrders } from '@/services/store'; // Using existing type and fetch for now
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowUpDown, Search, FileText as FileTextIcon, Eye, Truck, PackageCheck, Settings, Hourglass, XCircle as XCircleIcon, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency, cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
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
import { buttonVariants } from "@/components/ui/button";


// Mock function to get all orders (replace with actual API call)
async function getAllOrders(options: {} = {}): Promise<Order[]> {
    console.log("Fetching all orders...");
    // For now, just fetch orders for a known user and duplicate/modify them slightly
    // In a real app, this would fetch from the orders collection/table
    const userOrders = await getUserOrders("user123"); // Reuse existing mock
    // Create more mock orders with different users/stores/statuses
    const additionalOrders: Order[] = [
        { ...userOrders[0], id: 'order-999', userId: 'user456', status: 'Pending', orderDate: new Date(Date.now() - 3600000), totalAmount: 75.20 },
        { ...userOrders[1], id: 'order-888', userId: 'user789', storeId: 'store-7', storeName: 'Gadget Hub', status: 'Delivered', orderDate: new Date(Date.now() - 5 * 86400000), totalAmount: 299.99 },
         { ...userOrders[2], id: 'order-777', userId: 'user101', storeId: 'store-9', storeName: 'The Daily Grind', status: 'Cancelled', orderDate: new Date(Date.now() - 2 * 86400000), totalAmount: 12.50 },
    ];
    const allMockOrders = [...userOrders, ...additionalOrders];

    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("All mock orders fetched:", allMockOrders.length);
            resolve(allMockOrders);
        }, 500); // Simulate delay
    });
}

// Mock function to update order status (replace with actual API call)
async function updateOrderStatus(orderId: string, newStatus: Order['status']): Promise<Order | null> {
    console.log(`Updating order ${orderId} to status ${newStatus}`);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
    // Find order in mock data and update (this won't persist across reloads)
    // In real app, make PUT/PATCH request
    return null; // Return updated order if successful
}

// Map status to details
const orderStatusDetails: Record<Order['status'], { icon: React.ElementType; variant: BadgeProps['variant']; color: string }> = {
    'Pending': { icon: Hourglass, variant: 'outline', color: 'text-yellow-600 border-yellow-300 bg-yellow-50 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700' },
    'Processing': { icon: Settings, variant: 'outline', color: 'text-blue-600 border-blue-300 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700' },
    'Shipped': { icon: Truck, variant: 'secondary', color: 'text-purple-600 border-purple-300 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700' },
    'Delivered': { icon: PackageCheck, variant: 'default', color: 'text-green-600 border-green-300 bg-green-50 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700' },
    'Cancelled': { icon: XCircleIcon, variant: 'destructive', color: 'text-red-600 border-red-300 bg-red-50 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700' }
};

// Define BadgeProps type locally if needed
import { type VariantProps } from "class-variance-authority";
import { badgeVariants } from "@/components/ui/badge";
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}


export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>('all');
  const [storeFilter, setStoreFilter] = useState<string>('all'); // Filter by store ID
  const [sortField, setSortField] = useState<keyof Order | 'orderDate' | 'totalAmount' | 'status' | 'storeName'>('orderDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc'); // Default sort newest first
  const { toast } = useToast();
  const [stores, setStores] = useState<{ id: string; name: string }[]>([]); // For store filter dropdown

   useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch orders and potentially stores for filtering
        const [orderData, storeData] = await Promise.all([
            getAllOrders(),
            getStores() // Get stores for filter dropdown
        ]);
        setOrders(orderData);
        setStores(storeData.map(s => ({ id: s.id, name: s.name }))); // Extract needed store info
      } catch (err) {
        console.error("Failed to fetch orders or stores:", err);
        setError("Could not load order data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSort = (field: keyof Order | 'orderDate' | 'totalAmount' | 'status' | 'storeName') => {
    const newDirection = (sortField === field && sortDirection === 'asc') ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
  };


  const filteredAndSortedOrders = useMemo(() => {
    let processedOrders = orders.filter(order => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = order.id.toLowerCase().includes(searchLower) ||
                            order.userId.toLowerCase().includes(searchLower) ||
                            order.storeName.toLowerCase().includes(searchLower) ||
                            (order.trackingNumber && order.trackingNumber.toLowerCase().includes(searchLower)) ||
                            order.items.some(item => item.name.toLowerCase().includes(searchLower));
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesStore = storeFilter === 'all' || order.storeId === storeFilter;
      return matchesSearch && matchesStatus && matchesStore;
    });

    processedOrders.sort((a, b) => {
      let valA: any = a[sortField as keyof Order];
      let valB: any = b[sortField as keyof Order];

      // Handle specific sort types
      if (sortField === 'orderDate') {
         valA = a.orderDate.getTime();
         valB = b.orderDate.getTime();
      } else if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }
      // totalAmount is number, status is string

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return processedOrders;
  }, [orders, searchTerm, statusFilter, storeFilter, sortField, sortDirection]);


  const TableSkeleton = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[120px]"><Skeleton className="h-4 w-full" /></TableHead>
          <TableHead className="w-[150px]"><Skeleton className="h-4 w-full" /></TableHead>
          <TableHead className="hidden sm:table-cell"><Skeleton className="h-4 w-full" /></TableHead>
          <TableHead className="hidden md:table-cell"><Skeleton className="h-4 w-full" /></TableHead>
          <TableHead className="hidden lg:table-cell"><Skeleton className="h-4 w-full" /></TableHead>
          <TableHead><Skeleton className="h-4 w-full" /></TableHead>
          <TableHead className="text-right"><Skeleton className="h-4 w-full" /></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton className="h-4 w-3/4" /></TableCell>
            <TableCell><Skeleton className="h-4 w-full" /></TableCell>
            <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-full" /></TableCell>
            <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-1/2" /></TableCell>
            <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-3/4" /></TableCell>
            <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
            <TableCell className="text-right space-x-1">
                <Skeleton className="h-8 w-8 inline-block" />
                {/* Add more skeleton buttons if needed */}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileTextIcon className="h-6 w-6" /> Order Management
          </CardTitle>
          <CardDescription>View, filter, and manage all orders on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
            <div className="relative flex-grow w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by Order ID, User ID, Store, Product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
             <Select value={storeFilter} onValueChange={(value) => setStoreFilter(value)}>
              <SelectTrigger className="w-full md:w-[200px]">
                 <StoreIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Filter by Store" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stores</SelectItem>
                {stores.map(store => (
                  <SelectItem key={store.id} value={store.id}>{store.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as Order['status'] | 'all')}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.keys(orderStatusDetails).map((status) => (
                  <SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
             {/* Optional: Add date range filter */}
          </div>

          {/* Order Table */}
           {error && (
            <Alert variant="destructive">
                <XCircleIcon className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
           )}

           <div className="rounded-md border overflow-hidden">
            {isLoading ? <TableSkeleton /> : (
              <Table>
                <TableHeader>
                  <TableRow>
                     <TableHead onClick={() => handleSort('id')} className="cursor-pointer hover:bg-muted w-[120px]">
                      Order ID <ArrowUpDown className={`ml-1 h-3 w-3 inline ${sortField === 'id' ? 'opacity-100' : 'opacity-30'}`} />
                    </TableHead>
                    <TableHead onClick={() => handleSort('orderDate')} className="cursor-pointer hover:bg-muted w-[150px]">
                      Date <ArrowUpDown className={`ml-1 h-3 w-3 inline ${sortField === 'orderDate' ? 'opacity-100' : 'opacity-30'}`} />
                    </TableHead>
                     <TableHead onClick={() => handleSort('storeName')} className="cursor-pointer hover:bg-muted hidden sm:table-cell">
                      Store <ArrowUpDown className={`ml-1 h-3 w-3 inline ${sortField === 'storeName' ? 'opacity-100' : 'opacity-30'}`} />
                    </TableHead>
                     <TableHead className="hidden md:table-cell">User ID</TableHead>
                     <TableHead onClick={() => handleSort('totalAmount')} className="cursor-pointer hover:bg-muted hidden lg:table-cell">
                      Total <ArrowUpDown className={`ml-1 h-3 w-3 inline ${sortField === 'totalAmount' ? 'opacity-100' : 'opacity-30'}`} />
                    </TableHead>
                    <TableHead onClick={() => handleSort('status')} className="cursor-pointer hover:bg-muted">
                      Status <ArrowUpDown className={`ml-1 h-3 w-3 inline ${sortField === 'status' ? 'opacity-100' : 'opacity-30'}`} />
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedOrders.length > 0 ? (
                    filteredAndSortedOrders.map((order) => {
                        const details = orderStatusDetails[order.status];
                        const StatusIcon = details.icon;
                        return (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono text-xs">#{order.id.substring(order.id.length - 6)}</TableCell>
                            <TableCell>{format(order.orderDate, 'MMM d, yyyy HH:mm')}</TableCell>
                            <TableCell className="hidden sm:table-cell">
                                <Link href={`/admin/stores?search=${order.storeId}`} className="hover:underline text-primary font-medium">
                                    {order.storeName}
                                </Link>
                            </TableCell>
                             <TableCell className="font-mono text-xs hidden md:table-cell">
                                <Link href={`/admin/users?search=${order.userId}`} className="hover:underline">
                                    {order.userId}
                                </Link>
                             </TableCell>
                            <TableCell className="hidden lg:table-cell">{formatCurrency(order.totalAmount)}</TableCell>
                            <TableCell>
                              <Badge variant={details.variant as any} className={cn("capitalize text-xs px-2 py-0.5 rounded-full font-medium border flex items-center gap-1 w-fit", details.color)}>
                                <StatusIcon className="h-3 w-3" />
                                <span>{order.status}</span>
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right space-x-1">
                               {/* Link to view order details (modal or dedicated page) */}
                                <Button variant="ghost" size="icon" className="h-8 w-8" title="View Order Details (Not Implemented)">
                                    <Eye className="h-4 w-4 opacity-50" />
                                </Button>
                                {/* Optional: Action to update status */}
                                {/* <Button variant="ghost" size="icon" className="h-8 w-8" title="Update Status (Not Implemented)">
                                    <Edit className="h-4 w-4 opacity-50" />
                                </Button> */}
                            </TableCell>
                          </TableRow>
                        );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        No orders found matching your criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
          {/* Add Pagination if needed */}
        </CardContent>
      </Card>
    </div>
  );
}
```