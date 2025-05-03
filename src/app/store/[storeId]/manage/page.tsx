
"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Store, Product, DailyOffer, Promotion, getStoreById, createProduct, createDailyOffer, dailyOfferEligibleCategories, deleteProduct, deleteDailyOffer, createPromotion, deletePromotion } from '@/services/store'; // Import Promotion, createPromotion, deletePromotion
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductForm } from "@/components/ProductForm";
import { DailyOfferForm } from "@/components/DailyOfferForm";
import { PromotionForm } from "@/components/PromotionForm"; // Create this component
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, PlusCircle, Edit, Trash2, Package, CalendarClock, XCircle, Building, Tag, Percent, Ticket } from 'lucide-react'; // Added Percent, Ticket icons
import Image from 'next/image';
import { formatCurrency, cn } from '@/lib/utils';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion" // Import Accordion


interface RouteParams {
  storeId: string;
}

export default function StoreManagePage() {
  const params = useParams<RouteParams>();
  const storeId = params?.storeId;
  const { toast } = useToast();

  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [dailyOffers, setDailyOffers] = useState<DailyOffer[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]); // Add state for promotions
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [showNewOfferForm, setShowNewOfferForm] = useState(false);
  const [showNewPromotionForm, setShowNewPromotionForm] = useState(false); // State for promotion form

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
          setPromotions(storeData.promotions || []); // Set promotions state
        } else {
          setError("Store not found or you don't have permission to manage it.");
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

  const handlePromotionCreated = (newPromotion: Promotion) => {
      setPromotions(prevPromotions => [...prevPromotions, newPromotion]);
      setShowNewPromotionForm(false);
      toast({ title: "Promotion Created", description: `${newPromotion.name} added successfully.` });
  }

  const handleDeleteProduct = async (productId: string, productName: string) => {
        // Optimistic UI update
        const originalProducts = [...products];
        setProducts(prev => prev.filter(p => p.id !== productId));

        try {
            await deleteProduct(productId); // Call the actual delete function
             toast({
                title: "Product Deleted",
                description: `${productName} removed from your store.`,
                variant: "destructive"
            });
        } catch (err) {
            console.error("Failed to delete product from backend:", err);
            // Revert UI on error
            setProducts(originalProducts);
            toast({
                 title: "Deletion Failed",
                 description: `Failed to sync deletion for ${productName} with the server.`,
                 variant: "destructive",
            });
        }
  };

    const handleDeleteOffer = async (offerId: string, offerName: string) => {
        // Optimistic UI update
        const originalOffers = [...dailyOffers];
        setDailyOffers(prev => prev.filter(o => o.id !== offerId));

         try {
            await deleteDailyOffer(offerId); // Call the actual delete function
             toast({
                title: "Offer Deleted",
                description: `${offerName} removed from your store.`,
                variant: "destructive"
            });
        } catch (err) {
            console.error("Failed to delete offer from backend:", err);
            setDailyOffers(originalOffers);
            toast({
                 title: "Deletion Failed",
                 description: `Failed to sync deletion for ${offerName} with the server.`,
                 variant: "destructive",
            });
        }
    };

    const handleDeletePromotion = async (promotionId: string, promotionName: string) => {
        // Optimistic UI update
        const originalPromotions = [...promotions];
        setPromotions(prev => prev.filter(p => p.id !== promotionId));

        try {
            await deletePromotion(promotionId);
            toast({
                title: "Promotion Deleted",
                description: `${promotionName} has been removed.`,
                variant: "destructive",
            });
        } catch (err) {
            console.error("Failed to delete promotion from backend:", err);
            setPromotions(originalPromotions);
             toast({
                title: "Deletion Failed",
                description: `Could not remove promotion ${promotionName}. Please try again.`,
                variant: "destructive",
            });
        }
    }


    // Group products by category
    const productsByCategory = products.reduce((acc, product) => {
        const category = product.category || 'uncategorized';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(product);
        return acc;
    }, {} as Record<string, Product[]>);

    const productCategories = Object.keys(productsByCategory).sort();

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
         <Card> {/* Skeleton for promotions */}
           <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
           <CardContent><Skeleton className="h-24 w-full" /></CardContent>
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

  // Store Not Found State (Redundant if error state handles it, but good practice)
  if (!store) {
     return (
        <div className="container mx-auto py-10 flex flex-col items-center">
           <Card className="w-full max-w-md text-center border-dashed">
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
            <p className="text-muted-foreground">Add, edit, or remove products, offers, and promotions for your storefront.</p>
        </div>

        {/* Product Management Section */}
        <Card className="border shadow-sm">
            <CardHeader className="flex flex-row justify-between items-center">
                <div>
                    <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5 text-primary"/>Products</CardTitle>
                    <CardDescription>Manage the items available in your store.</CardDescription>
                </div>
                <Button size="sm" onClick={() => setShowNewProductForm(!showNewProductForm)} variant={showNewProductForm ? 'secondary' : 'default'}>
                    <PlusCircle className="mr-2 h-4 w-4" /> {showNewProductForm ? 'Cancel' : 'Add Product'}
                </Button>
            </CardHeader>
            <CardContent className="space-y-6">
                 {showNewProductForm && (
                    <Card className="bg-muted/30 p-4 sm:p-6 border border-dashed">
                        <h3 className="text-lg font-medium mb-4">New Product Details</h3>
                      <ProductForm
                        onProductCreated={handleProductCreated}
                        storeId={store.id}
                        storeCategory={store.category}
                      />
                    </Card>
                  )}

                  {/* Product List Grouped by Category */}
                 {products.length > 0 ? (
                    <Accordion type="multiple" defaultValue={productCategories.slice(0, 1)} className="w-full">
                       {productCategories.map((category) => (
                        <AccordionItem value={category} key={category}>
                            <AccordionTrigger className="text-lg font-medium capitalize hover:no-underline px-1">
                                {category} ({productsByCategory[category].length})
                            </AccordionTrigger>
                            <AccordionContent className="pt-0 pb-0">
                                <div className="border rounded-md overflow-hidden mt-2 mb-4">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[60px] sm:w-[80px]">Image</TableHead>
                                                <TableHead>Name</TableHead>
                                                {/* <TableHead className="hidden sm:table-cell">Category</TableHead> */}
                                                <TableHead className="hidden md:table-cell">Description</TableHead>
                                                <TableHead className="text-right">Price</TableHead>
                                                <TableHead className="text-right pr-4">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {productsByCategory[category].map((product) => (
                                                <TableRow key={product.id} className="hover:bg-muted/50">
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
                                                    {/* <TableCell className="capitalize text-muted-foreground hidden sm:table-cell">{product.category}</TableCell> */}
                                                     <TableCell className="text-xs text-muted-foreground hidden md:table-cell max-w-[250px] truncate">{product.description}</TableCell>
                                                    <TableCell className="text-right">{formatCurrency(product.price)}</TableCell>
                                                    <TableCell className="text-right space-x-1 pr-4">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit Product (Not Implemented)">
                                                            <Edit className="h-4 w-4 opacity-50" />
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
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                       ))}
                    </Accordion>
                 ) : !showNewProductForm && (
                    <div className="text-center text-muted-foreground py-8 border border-dashed rounded-md">
                        <Package className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30"/>
                        <p>No products added yet.</p>
                        <p className="text-sm">Click "Add Product" to get started.</p>
                    </div>
                 )}
            </CardContent>
        </Card>

        {/* Daily Offers Management Section (Conditional) */}
        {isEligibleForOffers && (
            <Card className="border shadow-sm">
                <CardHeader className="flex flex-row justify-between items-center">
                     <div>
                        <CardTitle className="flex items-center gap-2"><CalendarClock className="h-5 w-5 text-amber-500"/>Daily/Weekly Offers</CardTitle>
                        <CardDescription>Manage subscription offers for recurring deliveries.</CardDescription>
                    </div>
                     <Button size="sm" onClick={() => setShowNewOfferForm(!showNewOfferForm)} variant={showNewOfferForm ? 'secondary' : 'default'}>
                       <PlusCircle className="mr-2 h-4 w-4" /> {showNewOfferForm ? 'Cancel' : 'Add Offer'}
                    </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                     {showNewOfferForm && (
                         <Card className="bg-muted/30 p-4 sm:p-6 border border-dashed">
                            <h3 className="text-lg font-medium mb-4">New Subscription Offer</h3>
                            <DailyOfferForm
                                onOfferCreated={handleOfferCreated}
                                storeId={store.id}
                                availableProducts={products} // Pass products to select from
                            />
                         </Card>
                     )}
                    {dailyOffers.length > 0 ? (
                         <div className="border rounded-md overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead className="hidden sm:table-cell">Frequency</TableHead>
                                        <TableHead className="text-right">Price</TableHead>
                                        <TableHead className="hidden md:table-cell">Status</TableHead>
                                        <TableHead className="text-right pr-4">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {dailyOffers.map((offer) => (
                                        <TableRow key={offer.id} className="hover:bg-muted/50">
                                            <TableCell className="font-medium">{offer.name}</TableCell>
                                            <TableCell className="capitalize hidden sm:table-cell">{offer.frequency}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(offer.price)}</TableCell>
                                             <TableCell className="hidden md:table-cell">
                                                 <Badge variant={offer.isActive ? "secondary" : "outline"} className={cn(offer.isActive ? "text-green-600 border-green-400/50 bg-green-500/10" : "text-muted-foreground")}>
                                                    {offer.isActive ? "Active" : "Inactive"}
                                                 </Badge>
                                             </TableCell>
                                            <TableCell className="text-right space-x-1 pr-4">
                                                 <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit Offer (Not Implemented)">
                                                    <Edit className="h-4 w-4 opacity-50" />
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
                        </div>
                    ) : !showNewOfferForm && (
                         <div className="text-center text-muted-foreground py-8 border border-dashed rounded-md">
                            <CalendarClock className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30"/>
                            <p>No daily or weekly offers created yet.</p>
                             <p className="text-sm">Click "Add Offer" to create subscription options.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        )}

        {/* Promotions Management Section */}
        <Card className="border shadow-sm">
            <CardHeader className="flex flex-row justify-between items-center">
                <div>
                    <CardTitle className="flex items-center gap-2"><Ticket className="h-5 w-5 text-purple-500"/>Promotions</CardTitle>
                    <CardDescription>Manage discounts and special promotions for your store.</CardDescription>
                </div>
                <Button size="sm" onClick={() => setShowNewPromotionForm(!showNewPromotionForm)} variant={showNewPromotionForm ? 'secondary' : 'default'}>
                    <PlusCircle className="mr-2 h-4 w-4" /> {showNewPromotionForm ? 'Cancel' : 'Add Promotion'}
                </Button>
            </CardHeader>
            <CardContent className="space-y-6">
                 {showNewPromotionForm && (
                    <Card className="bg-muted/30 p-4 sm:p-6 border border-dashed">
                        <h3 className="text-lg font-medium mb-4">New Promotion Details</h3>
                        <PromotionForm
                           onPromotionCreated={handlePromotionCreated}
                           storeId={store.id}
                           availableProducts={products}
                           availableCategories={productCategories.filter(c => c !== 'uncategorized')} // Pass available categories
                        />
                    </Card>
                  )}
                {promotions.length > 0 ? (
                    <div className="border rounded-md overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Value</TableHead>
                                    <TableHead className="hidden sm:table-cell">Scope</TableHead>
                                    <TableHead className="hidden md:table-cell">Status</TableHead>
                                    <TableHead className="text-right pr-4">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {promotions.map((promo) => (
                                    <TableRow key={promo.id} className="hover:bg-muted/50">
                                        <TableCell className="font-medium">{promo.name}</TableCell>
                                        <TableCell className="capitalize">{promo.discountType.replace('_', ' ')}</TableCell>
                                        <TableCell>
                                            {promo.discountType === 'percentage' ? `${promo.discountValue}%` : formatCurrency(promo.discountValue)}
                                        </TableCell>
                                        <TableCell className="capitalize hidden sm:table-cell">{promo.scope.replace('_', ' ')}</TableCell>
                                        <TableCell className="hidden md:table-cell">
                                             <Badge variant={promo.isActive ? "secondary" : "outline"} className={cn(promo.isActive ? "text-green-600 border-green-400/50 bg-green-500/10" : "text-muted-foreground")}>
                                                {promo.isActive ? "Active" : "Inactive"}
                                             </Badge>
                                         </TableCell>
                                        <TableCell className="text-right space-x-1 pr-4">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit Promotion (Not Implemented)">
                                                <Edit className="h-4 w-4 opacity-50" />
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" title="Delete Promotion">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Promotion?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to delete the promotion "{promo.name}"? This action cannot be undone.
                                                    </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDeletePromotion(promo.id, promo.name)}
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
                    </div>
                ) : !showNewPromotionForm && (
                    <div className="text-center text-muted-foreground py-8 border border-dashed rounded-md">
                        <Ticket className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30"/>
                        <p>No promotions created yet.</p>
                         <p className="text-sm">Click "Add Promotion" to create discounts.</p>
                    </div>
                )}
            </CardContent>
        </Card>


         {/* Add other management sections as needed (e.g., Store Settings, Orders Received) */}

    </div>
  );
}
