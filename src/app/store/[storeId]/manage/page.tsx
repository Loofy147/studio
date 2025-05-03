
"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Store, Product, DailyOffer, getStoreById, createProduct, createDailyOffer, dailyOfferEligibleCategories, deleteProduct, deleteDailyOffer } from '@/services/store'; // Import necessary types and functions
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductForm } from "@/components/ProductForm";
import { DailyOfferForm } from "@/components/DailyOfferForm"; // Create this component
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, PlusCircle, Edit, Trash2, Package, CalendarClock, XCircle, Building, Tag } from 'lucide-react'; // Added icons
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils'; // Assuming you have this helper
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';
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
} from "@/components/ui/alert-dialog"
import { buttonVariants } from "@/components/ui/button";


interface RouteParams {
  storeId: string;
}

export default function StoreManagePage() {
  const params = useParams<RouteParams>();
  const storeId = params?.storeId; // Make sure params and storeId exist
  const { toast } = useToast();

  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [dailyOffers, setDailyOffers] = useState<DailyOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [showNewOfferForm, setShowNewOfferForm] = useState(false);

  useEffect(() => {
    if (!storeId) {
        setError("Store ID is missing from the URL.");
        setIsLoading(false);
        return;
    }

    const fetchStoreData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const storeData = await getStoreById(storeId);
        if (storeData) {
          setStore(storeData);
          setProducts(storeData.products || []);
          setDailyOffers(storeData.dailyOffers || []);
        } else {
          setError("Store not found.");
        }
      } catch (err) {
        console.error("Failed to fetch store data:", err);
        setError("Could not load store management details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoreData();
  }, [storeId]);

  const handleProductCreated = (newProduct: Product) => {
    setProducts(prevProducts => [...prevProducts, newProduct]);
    setShowNewProductForm(false);
    toast({ title: "Product Created", description: `${newProduct.name} added successfully.` });
  };

  const handleOfferCreated = (newOffer: DailyOffer) => {
    setDailyOffers(prevOffers => [...prevOffers, newOffer]);
    setShowNewOfferForm(false);
    toast({ title: "Offer Created", description: `${newOffer.name} added successfully.` });
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
        // Mock deletion - remove from state
        setProducts(prev => prev.filter(p => p.id !== productId));
        toast({
            title: "Product Deleted",
            description: `${productName} removed from your store.`,
            variant: "destructive"
        });
        // In real app: await deleteProduct(productId); + error handling
  };

    const handleDeleteOffer = async (offerId: string, offerName: string) => {
        // Mock deletion - remove from state
        setDailyOffers(prev => prev.filter(o => o.id !== offerId));
        toast({
            title: "Offer Deleted",
            description: `${offerName} removed from your store.`,
            variant: "destructive"
        });
        // In real app: await deleteDailyOffer(offerId); + error handling
    };

  // Loading State
  if (isLoading) {
    return (
      <div className="container mx-auto py-10 space-y-8 animate-pulse">
        <Skeleton className="h-8 w-40" /> {/* Back button */}
        <Skeleton className="h-10 w-1/2" /> {/* Title */}
        <Skeleton className="h-6 w-1/4 mb-6" /> {/* Subtitle */}
         <Card>
           <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
           <CardContent><Skeleton className="h-32 w-full" /></CardContent>
           <CardFooter><Skeleton className="h-10 w-32" /></CardFooter>
         </Card>
        <Card>
           <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
           <CardContent><Skeleton className="h-32 w-full" /></CardContent>
           <CardFooter><Skeleton className="h-10 w-32" /></CardFooter>
         </Card>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="container mx-auto py-10 flex flex-col items-center">
         <Alert variant="destructive" className="max-w-lg w-full">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Store Management</AlertTitle>
              <AlertDescription>
                   {error}
                   <div className="mt-4">
                      <Link href="/stores" passHref legacyBehavior>
                         <Button variant="secondary" size="sm">
                             <ArrowLeft className="mr-2 h-4 w-4" /> Back to Your Stores
                         </Button>
                     </Link>
                   </div>
              </AlertDescription>
         </Alert>
      </div>
    );
  }

  // Store Not Found State
  if (!store) {
     return (
        <div className="container mx-auto py-10 flex flex-col items-center">
           <Card className="w-full max-w-md text-center">
               <CardContent className="p-10">
                   <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30"/>
                   <p className="text-lg font-medium text-muted-foreground">Store Not Found</p>
                   <p className="text-sm text-muted-foreground mt-1">We couldn't find the store you're trying to manage.</p>
                   <Link href="/stores" passHref legacyBehavior>
                      <Button variant="outline" size="sm" className="mt-6">
                           <ArrowLeft className="mr-2 h-4 w-4" /> Back to Your Stores
                       </Button>
                   </Link>
               </CardContent>
           </Card>
       </div>
     );
  }

  const isEligibleForOffers = dailyOfferEligibleCategories.includes(store.category);

  return (
    <div className="container mx-auto py-10 space-y-10">
       {/* Header */}
        <div>
             <Link href="/stores" passHref legacyBehavior>
                <Button variant="ghost" size="sm" className="mb-2 text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Your Stores
                </Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">Manage Store: {store.name}</h1>
            <p className="text-muted-foreground">Add, edit, or remove products and offers for your storefront.</p>
        </div>

        {/* Product Management Section */}
        <Card>
            <CardHeader className="flex flex-row justify-between items-center">
                <div>
                    <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5 text-primary"/>Products</CardTitle>
                    <CardDescription>Manage the items available in your store.</CardDescription>
                </div>
                <Button size="sm" onClick={() => setShowNewProductForm(!showNewProductForm)}>
                    <PlusCircle className="mr-2 h-4 w-4" /> {showNewProductForm ? 'Cancel' : 'Add Product'}
                </Button>
            </CardHeader>
            <CardContent className="space-y-6">
                 {showNewProductForm && (
                    <Card className="bg-muted/30 p-6">
                      <ProductForm
                        onProductCreated={handleProductCreated}
                        storeId={store.id}
                        storeCategory={store.category}
                      />
                    </Card>
                  )}
                {products.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        <Image
                                            src={product.imageUrl || `https://picsum.photos/seed/${product.id}/100/100`}
                                            alt={product.name}
                                            width={40}
                                            height={40}
                                            className="rounded-sm object-cover bg-muted"
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell className="capitalize text-muted-foreground">{product.category}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(product.price)}</TableCell>
                                    <TableCell className="text-right space-x-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit Product">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                         <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" title="Delete Product">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to delete "{product.name}"? This action cannot be undone.
                                                </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                     onClick={() => handleDeleteProduct(product.id, product.name)}
                                                     className={buttonVariants({ variant: "destructive" })}
                                                    >
                                                    Yes, Delete
                                                </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : !showNewProductForm && (
                    <p className="text-center text-muted-foreground py-6">No products added yet. Click "Add Product" to get started.</p>
                )}
            </CardContent>
        </Card>

        {/* Daily Offers Management Section (Conditional) */}
        {isEligibleForOffers && (
            <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                     <div>
                        <CardTitle className="flex items-center gap-2"><CalendarClock className="h-5 w-5 text-amber-500"/>Daily/Weekly Offers</CardTitle>
                        <CardDescription>Manage subscription offers for recurring deliveries.</CardDescription>
                    </div>
                     <Button size="sm" variant="outline" onClick={() => setShowNewOfferForm(!showNewOfferForm)}>
                       <PlusCircle className="mr-2 h-4 w-4" /> {showNewOfferForm ? 'Cancel' : 'Add Offer'}
                    </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                     {showNewOfferForm && (
                         <Card className="bg-muted/30 p-6">
                            <DailyOfferForm
                                onOfferCreated={handleOfferCreated}
                                storeId={store.id}
                                availableProducts={products} // Pass products to select from
                            />
                         </Card>
                     )}
                    {dailyOffers.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Frequency</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                     <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {dailyOffers.map((offer) => (
                                    <TableRow key={offer.id}>
                                        <TableCell className="font-medium">{offer.name}</TableCell>
                                        <TableCell className="capitalize">{offer.frequency}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(offer.price)}</TableCell>
                                         <TableCell>
                                             <Badge variant={offer.isActive ? "secondary" : "outline"} className={cn(offer.isActive ? "text-green-600 border-green-400/50 bg-green-500/10" : "text-muted-foreground")}>
                                                {offer.isActive ? "Active" : "Inactive"}
                                             </Badge>
                                         </TableCell>
                                        <TableCell className="text-right space-x-1">
                                             <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit Offer">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                             <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                     <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" title="Delete Offer">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Offer?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to delete the offer "{offer.name}"? This will not affect existing subscriptions, but users can no longer subscribe.
                                                    </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                         onClick={() => handleDeleteOffer(offer.id, offer.name)}
                                                          className={buttonVariants({ variant: "destructive" })}
                                                        >
                                                        Yes, Delete
                                                    </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : !showNewOfferForm && (
                         <p className="text-center text-muted-foreground py-6">No daily or weekly offers created yet.</p>
                    )}
                </CardContent>
            </Card>
        )}

         {/* Add other management sections as needed (e.g., Store Settings, Orders Received) */}

    </div>
  );
}

// Mock delete functions (replace with actual API calls)
async function deleteProduct(productId: string): Promise<void> {
  console.log(`Mock deleting product: ${productId}`);
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call
  // No actual data modification in this mock
}

async function deleteDailyOffer(offerId: string): Promise<void> {
  console.log(`Mock deleting offer: ${offerId}`);
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call
   // No actual data modification in this mock
}
