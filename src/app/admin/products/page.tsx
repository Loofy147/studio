'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getProducts, Product, getStores, Store } from '@/services/store'; // Assuming getProducts/Stores exist
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowUpDown, Search, Package as PackageIcon, Eye, Edit, Trash2, Filter, XCircle } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import Image from 'next/image';
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

// Mock delete function (replace with actual API call)
async function deleteProduct(productId: string): Promise<void> {
  console.log(`Deleting product: ${productId}`);
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
  // In a real app, make DELETE request to backend
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]); // For filtering by store
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [storeFilter, setStoreFilter] = useState<string>('all'); // Filter by store ID
  const [categoryFilter, setCategoryFilter] = useState<string>('all'); // Filter by product category
  const [sortField, setSortField] = useState<keyof Product | 'price' | 'name' | 'storeName'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [productData, storeData] = await Promise.all([
            getProducts({}), // Fetch all products initially
            getStores()
        ]);
        setProducts(productData);
        setStores(storeData);
      } catch (err) {
        console.error("Failed to fetch products or stores:", err);
        setError("Could not load product data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSort = (field: keyof Product | 'price' | 'name' | 'storeName') => {
    const newDirection = (sortField === field && sortDirection === 'asc') ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
  };

  const uniqueProductCategories = useMemo(() => {
    const categories = new Set(products.map(p => p.category).filter(Boolean));
    return ['all', ...Array.from(categories).sort()];
  }, [products]);


  const filteredAndSortedProducts = useMemo(() => {
    let processedProducts = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStore = storeFilter === 'all' || product.storeId === storeFilter;
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      return matchesSearch && matchesStore && matchesCategory;
    });

    processedProducts.sort((a, b) => {
      let valA: any = a[sortField as keyof Product];
      let valB: any = b[sortField as keyof Product];

      // Handle specific sort types
       if (sortField === 'storeName') {
           valA = a.storeName?.toLowerCase() ?? '';
           valB = b.storeName?.toLowerCase() ?? '';
       } else if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }
      // Price is already number

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return processedProducts;
  }, [products, searchTerm, storeFilter, categoryFilter, sortField, sortDirection]);


   const handleDeleteProduct = async (productId: string, productName: string) => {
        const originalProducts = [...products];
        setProducts(prev => prev.filter(p => p.id !== productId)); // Optimistic UI

        try {
            await deleteProduct(productId);
            toast({
                title: "Product Removed",
                description: `${productName} has been removed.`,
                variant: "destructive"
            });
        } catch (err) {
            console.error("Failed to delete product:", err);
            setProducts(originalProducts); // Revert UI on error
            toast({
                title: "Deletion Failed",
                description: `Could not remove ${productName}. Please try again.`,
                variant: "destructive",
            });
        }
    };


  const TableSkeleton = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]"><Skeleton className="h-4 w-full" /></TableHead>
          <TableHead className="w-[200px]"><Skeleton className="h-4 w-full" /></TableHead>
          <TableHead className="hidden sm:table-cell"><Skeleton className="h-4 w-full" /></TableHead>
          <TableHead className="hidden md:table-cell"><Skeleton className="h-4 w-full" /></TableHead>
          <TableHead className="hidden lg:table-cell"><Skeleton className="h-4 w-full" /></TableHead>
          <TableHead className="text-right"><Skeleton className="h-4 w-full" /></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton className="h-10 w-10 rounded-sm" /></TableCell>
            <TableCell><Skeleton className="h-4 w-3/4" /></TableCell>
            <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-full" /></TableCell>
            <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-1/2" /></TableCell>
            <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-3/4" /></TableCell>
            <TableCell className="text-right space-x-1">
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
            <PackageIcon className="h-6 w-6" /> Product Management
          </CardTitle>
          <CardDescription>View, filter, and manage all products across stores.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
            <div className="relative flex-grow w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name, ID, description..."
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
            <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value)}>
              <SelectTrigger className="w-full md:w-[180px]">
                 <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                {uniqueProductCategories.map(category => (
                    <SelectItem key={category} value={category} className="capitalize">
                        {category === "all" ? "All Categories" : category}
                    </SelectItem>
                ))}
              </SelectContent>
            </Select>
             {/* Optional: Add "Create New Product" button here? (Maybe better within store management) */}
          </div>

          {/* Product Table */}
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
                    <TableHead onClick={() => handleSort('name')} className="cursor-pointer hover:bg-muted w-[250px]">
                      Name <ArrowUpDown className={`ml-1 h-3 w-3 inline ${sortField === 'name' ? 'opacity-100' : 'opacity-30'}`} />
                    </TableHead>
                     <TableHead onClick={() => handleSort('storeName')} className="cursor-pointer hover:bg-muted hidden sm:table-cell">
                      Store <ArrowUpDown className={`ml-1 h-3 w-3 inline ${sortField === 'storeName' ? 'opacity-100' : 'opacity-30'}`} />
                    </TableHead>
                    <TableHead className="hidden md:table-cell">Category</TableHead>
                    <TableHead onClick={() => handleSort('price')} className="cursor-pointer hover:bg-muted hidden lg:table-cell">
                      Price <ArrowUpDown className={`ml-1 h-3 w-3 inline ${sortField === 'price' ? 'opacity-100' : 'opacity-30'}`} />
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedProducts.length > 0 ? (
                    filteredAndSortedProducts.map((product) => (
                      <TableRow key={product.id}>
                         <TableCell>
                            <Image
                                src={product.imageUrl || `https://picsum.photos/seed/${product.id}/100/100`}
                                alt={product.name}
                                width={32}
                                height={32}
                                className="rounded-sm object-cover bg-muted"
                                data-ai-hint={`${product.category} product`}
                             />
                         </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                           {product.storeId && product.storeName ? (
                               <Link href={`/admin/stores?search=${product.storeId}`} className="hover:underline text-primary">
                                   {product.storeName}
                               </Link>
                           ) : (
                                'N/A'
                           )}
                        </TableCell>
                        <TableCell className="capitalize hidden md:table-cell">{product.category}</TableCell>
                        <TableCell className="hidden lg:table-cell">{formatCurrency(product.price)}</TableCell>
                        <TableCell className="text-right space-x-1">
                           {/* Link to view product details (potentially on frontend store page?) */}
                           {product.storeId && (
                               <Link href={`/store/${product.storeId}?product=${product.id}`} target="_blank" legacyBehavior>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" title="View Product">
                                        <Eye className="h-4 w-4" />
                                    </Button>
                               </Link>
                           )}
                           {/* Link to edit product (maybe a modal or dedicated page) */}
                            {/* <Link href={`/admin/products/edit/${product.id}`} legacyBehavior>
                                <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit Product">
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </Link> */}
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit Product (Not Implemented)">
                                <Edit className="h-4 w-4 opacity-50" />
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                     <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" title="Remove Product">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Remove Product: {product.name}?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will remove the product "{product.name}" from the store "{product.storeName}". This action cannot be undone.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => handleDeleteProduct(product.id, product.name)}
                                        className={buttonVariants({ variant: "destructive" })}
                                        >
                                        Yes, Remove Product
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        No products found matching your criteria.
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