'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getStores, Store, StoreCategory } from '@/services/store'; // Assuming getStores exists
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowUpDown, Search, Store as StoreIcon, Eye, Edit, ToggleLeft, ToggleRight, Trash2, XCircle } from 'lucide-react';
import { format } from 'date-fns'; // Assuming stores have a creation date
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
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import { cn } from '@/lib/utils';

// Mock function to toggle store status (replace with actual API call)
async function toggleStoreStatus(storeId: string, currentStatus: boolean): Promise<boolean> {
    console.log(`Toggling status for store ${storeId} from ${currentStatus}`);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
    return !currentStatus; // Return the new status
}

// Mock function to delete a store (replace with actual API call)
async function deleteStore(storeId: string): Promise<void> {
    console.log(`Deleting store ${storeId}`);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    // In a real app, this would make a DELETE request
}


export default function AdminStoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all'); // Example filter
  const [categoryFilter, setCategoryFilter] = useState<StoreCategory | 'all'>('all');
  const [sortField, setSortField] = useState<keyof Store | 'rating' | 'name' | 'category'>('name'); // Default sort
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [updatingStoreId, setUpdatingStoreId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStores = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const storeData = await getStores();
        // Add mock status and creation date if they don't exist
        const storesWithStatus = storeData.map(s => ({
            ...s,
            isActive: s.isActive ?? Math.random() > 0.15, // Mock status (85% active)
            createdAt: s.createdAt ?? new Date(Date.now() - Math.random() * 30 * 86400000) // Mock creation date within last 30 days
        })) as (Store & { isActive: boolean; createdAt: Date })[];
        setStores(storesWithStatus);
      } catch (err) {
        console.error("Failed to fetch stores:", err);
        setError("Could not load stores. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStores();
  }, []);

  const handleSort = (field: keyof Store | 'rating' | 'name' | 'category') => {
    const newDirection = (sortField === field && sortDirection === 'asc') ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
  };

  const filteredAndSortedStores = useMemo(() => {
    let processedStores = stores.filter(store => {
      const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            store.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (store.ownerId && store.ownerId.toLowerCase().includes(searchTerm.toLowerCase())); // Search by ID or Owner ID too
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' && store.isActive) || (statusFilter === 'inactive' && !store.isActive);
      const matchesCategory = categoryFilter === 'all' || store.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });

    processedStores.sort((a, b) => {
      let valA: any = a[sortField as keyof Store];
      let valB: any = b[sortField as keyof Store];

      // Handle specific sort types
      if (sortField === 'rating') {
         valA = a.rating ?? 0;
         valB = b.rating ?? 0;
      } else if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      } else if (valA instanceof Date) {
          valA = valA.getTime();
          valB = valB.getTime();
      }


      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return processedStores;
  }, [stores, searchTerm, statusFilter, categoryFilter, sortField, sortDirection]);

   const categories = useMemo(() => {
    const uniqueCategories = new Set(stores.map(store => store.category));
    return ["all", ...Array.from(uniqueCategories).sort()] as (StoreCategory | "all")[];
  }, [stores]);


  const handleToggleStatus = async (store: Store & { isActive: boolean }) => {
        setUpdatingStoreId(store.id);
        try {
            const newStatus = await toggleStoreStatus(store.id, store.isActive);
            setStores(prevStores => prevStores.map(s => s.id === store.id ? { ...s, isActive: newStatus } : s));
             toast({
                title: `Store ${newStatus ? 'Enabled' : 'Disabled'}`,
                description: `${store.name} has been ${newStatus ? 'enabled' : 'disabled'}.`,
             });
        } catch (err) {
            console.error("Failed to toggle store status:", err);
            toast({
                title: "Update Failed",
                description: `Could not change the status for ${store.name}.`,
                variant: "destructive",
            });
        } finally {
            setUpdatingStoreId(null);
        }
    };

     const handleDeleteStore = async (storeId: string, storeName: string) => {
        // Optimistic UI update (optional)
         const originalStores = [...stores];
         setStores(prev => prev.filter(s => s.id !== storeId));

        try {
            await deleteStore(storeId);
            toast({
                title: "Store Deleted",
                description: `${storeName} has been permanently deleted.`,
                variant: "destructive"
            });
        } catch (err) {
            console.error("Failed to delete store:", err);
            // Revert optimistic update
            setStores(originalStores);
            toast({
                title: "Deletion Failed",
                description: `Could not delete ${storeName}. Please try again.`,
                variant: "destructive",
            });
        }
    };


  const TableSkeleton = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]"><Skeleton className="h-4 w-full" /></TableHead>
          <TableHead className="w-[150px]"><Skeleton className="h-4 w-full" /></TableHead>
          <TableHead><Skeleton className="h-4 w-full" /></TableHead>
          <TableHead><Skeleton className="h-4 w-full" /></TableHead>
          <TableHead className="hidden md:table-cell"><Skeleton className="h-4 w-full" /></TableHead>
          <TableHead><Skeleton className="h-4 w-full" /></TableHead>
           <TableHead className="text-right"><Skeleton className="h-4 w-full" /></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton className="h-10 w-10 rounded-sm" /></TableCell>
            <TableCell><Skeleton className="h-4 w-3/4" /></TableCell>
            <TableCell><Skeleton className="h-4 w-full" /></TableCell>
            <TableCell><Skeleton className="h-4 w-1/2" /></TableCell>
            <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-3/4" /></TableCell>
            <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
            <TableCell className="text-right space-x-1">
                <Skeleton className="h-8 w-8 inline-block" />
                <Skeleton className="h-8 w-8 inline-block" />
                <Skeleton className="h-8 w-8 inline-block" />
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
            <StoreIcon className="h-6 w-6" /> Store Management
          </CardTitle>
          <CardDescription>View, filter, and manage all stores on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
            <div className="relative flex-grow w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, ID, owner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as StoreCategory | 'all')}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                 {categories.map(category => (
                    <SelectItem key={category} value={category} className="capitalize">
                        {category === "all" ? "All Categories" : category}
                    </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | 'active' | 'inactive')}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
             {/* Optional: Add "Create New Store" button here */}
             {/* <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Store</Button> */}
          </div>

          {/* Store Table */}
          {error && (
            <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
           )}

          <div className="rounded-md border overflow-hidden">
            {isLoading ? <TableSkeleton /> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Image</TableHead>
                     <TableHead onClick={() => handleSort('name')} className="cursor-pointer hover:bg-muted w-[200px]">
                      Name <ArrowUpDown className={`ml-1 h-3 w-3 inline ${sortField === 'name' ? 'opacity-100' : 'opacity-30'}`} />
                    </TableHead>
                     <TableHead onClick={() => handleSort('category')} className="cursor-pointer hover:bg-muted hidden sm:table-cell">
                      Category <ArrowUpDown className={`ml-1 h-3 w-3 inline ${sortField === 'category' ? 'opacity-100' : 'opacity-30'}`} />
                    </TableHead>
                     <TableHead onClick={() => handleSort('rating')} className="cursor-pointer hover:bg-muted hidden lg:table-cell">
                      Rating <ArrowUpDown className={`ml-1 h-3 w-3 inline ${sortField === 'rating' ? 'opacity-100' : 'opacity-30'}`} />
                    </TableHead>
                     <TableHead onClick={() => handleSort('createdAt')} className="cursor-pointer hover:bg-muted hidden md:table-cell">
                      Created <ArrowUpDown className={`ml-1 h-3 w-3 inline ${sortField === 'createdAt' ? 'opacity-100' : 'opacity-30'}`} />
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedStores.length > 0 ? (
                    filteredAndSortedStores.map((store) => (
                      <TableRow key={store.id} className={cn(!store.isActive && 'bg-muted/50 opacity-70')}>
                         <TableCell>
                            <Image
                                src={store.imageUrl || `https://picsum.photos/seed/${store.id}/100/100`}
                                alt={store.name}
                                width={32}
                                height={32}
                                className="rounded-sm object-cover bg-muted"
                                data-ai-hint={`${store.category} store logo`}
                             />
                        </TableCell>
                        <TableCell className="font-medium">{store.name}</TableCell>
                        <TableCell className="capitalize hidden sm:table-cell">{store.category}</TableCell>
                         <TableCell className="hidden lg:table-cell">{store.rating ? store.rating.toFixed(1) : 'N/A'}</TableCell>
                        <TableCell className="hidden md:table-cell">{format(store.createdAt, 'MMM d, yyyy')}</TableCell>
                        <TableCell>
                          <Badge variant={store.isActive ? 'secondary' : 'outline'} className={cn(store.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-700/50' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-700/50')}>
                            {store.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                           <Link href={`/store/${store.id}`} target="_blank" legacyBehavior>
                                <Button variant="ghost" size="icon" className="h-8 w-8" title="View Storefront">
                                    <Eye className="h-4 w-4" />
                                </Button>
                           </Link>
                           <Link href={`/admin/stores/edit/${store.id}`} legacyBehavior>
                                <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit Store Details">
                                    <Edit className="h-4 w-4" />
                                </Button>
                           </Link>
                           <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleToggleStatus(store)}
                                disabled={updatingStoreId === store.id}
                                title={store.isActive ? 'Disable Store' : 'Enable Store'}
                            >
                                {updatingStoreId === store.id
                                    ? <Skeleton className="h-4 w-4 rounded-full" /> // Show spinner/skeleton when updating
                                    : store.isActive
                                        ? <ToggleRight className="h-4 w-4 text-green-600" />
                                        : <ToggleLeft className="h-4 w-4 text-red-600" />}
                           </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                     <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" title="Delete Store">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Store: {store.name}?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the store, its products, and associated data.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                         onClick={() => handleDeleteStore(store.id, store.name)}
                                         className={buttonVariants({ variant: "destructive" })}
                                        >
                                        Yes, Delete Store
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        No stores found matching your criteria.
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

// Extend Store type for client-side state
declare module '@/services/store' {
    interface Store {
        isActive?: boolean; // Add optional status
        createdAt?: Date; // Add optional creation date
    }
}
```