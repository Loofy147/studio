
"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Store, Product, DailyOffer, Promotion, getStoreById, createProduct, createDailyOffer, dailyOfferEligibleCategories, deleteProduct, deleteDailyOffer, createPromotion, deletePromotion, toggleStoreOpenStatus, StoreCategory } from '@/services/store'; // Import Promotion, createPromotion, deletePromotion, toggleStoreOpenStatus, StoreCategory
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductForm } from "@/components/ProductForm";
import { DailyOfferForm } from "@/components/DailyOfferForm";
import { PromotionForm } from "@/components/PromotionForm"; // Create this component
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, PlusCircle, Edit, Trash2, Package, CalendarClock, XCircle, Building, Tag, Percent, Ticket, Power, PowerOff, Loader2 } from 'lucide-react'; // Added Percent, Ticket, Power, PowerOff, Loader2 icons
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
import { motion, AnimatePresence } from 'framer-motion'; // Import motion


interface RouteParams {
  storeId: string;
}

export default function StoreManagePage() {
  const params = useParams<RouteParams>();
  const storeId = params?.storeId;
  const { toast } = useToast();
  const userId = "user123"; // Hardcoded owner ID for demo

  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [dailyOffers, setDailyOffers] = useState<DailyOffer[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]); // Add state for promotions
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [showNewOfferForm, setShowNewOfferForm] = useState(false);
  const [showNewPromotionForm, setShowNewPromotionForm] = useState(false); // State for promotion form
  const [isTogglingOpenStatus, setIsTogglingOpenStatus] = useState(false);

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
        // TODO: Add check to ensure the current user (userId) owns this store
        const storeData = await getStoreById(storeId);
        if (storeData && storeData.ownerId === userId ) { // Uncomment owner check when auth is added
          setStore(storeData);
          setProducts(storeData.products || []);
          setDailyOffers(storeData.dailyOffers || []);
          setPromotions(storeData.promotions || []); // Set promotions state
        } else if (!storeData) {
          setError("Store not found.");
        } else {
            setError("You do not have permission to manage this store."); // Error if owner doesn't match
        }
      } catch (err) {
        console.error("Failed to fetch store data:", err);
        setError("Could not load store management details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoreData();
  }, [storeId, userId]); // Add userId dependency if owner check is implemented

  const handleToggleStoreStatus = async () => {
      if (!store) return;
      setIsTogglingOpenStatus(true);
      try {
          const updatedStore = await toggleStoreOpenStatus(store.id, userId); // Assuming userId is ownerId
          if (updatedStore) {
              setStore(updatedStore); // Update local state
              toast({
                  title: `Store ${updatedStore.isOpen ? 'Opened' : 'Closed'}`,
                  description: `${updatedStore.name} is now ${updatedStore.isOpen ? 'accepting orders' : 'temporarily closed'}.`,
                  variant: updatedStore.isOpen ? "default" : "destructive",
              });
          } else {
               throw new Error("Failed to update store status.");
          }
      } catch (err) {
           console.error("Failed to toggle store status:", err);
           toast({
                title: "Update Failed",
                description: "Could not change the store's open status. Please try again.",
                variant: "destructive",
            });
      } finally {
          setIsTogglingOpenStatus(false);
      }
  };


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

    // Animation Variants
    const formVariants = {
        hidden: { opacity: 0, height: 0, marginTop: 0, marginBottom: 0, padding: 0, border: 0 },
        visible: { opacity: 1, height: 'auto', marginTop: '1.5rem', marginBottom: '1.5rem', padding: '1.5rem', border: '1px dashed hsl(var(--border))', transition: { duration: 0.3 } },
        exit: { opacity: 0, height: 0, marginTop: 0, marginBottom: 0, padding: 0, border: 0, transition: { duration: 0.2 } }
    };
    const listVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0 } // Added exit variant
    };

  // Loading State
  if (isLoading) {
    return (
      <div className="container mx-auto py-10 space-y-8 animate-pulse">
        <Skeleton className="h-8 w-40 bg-muted/50" /> {/* Back button */}
        <Skeleton className="h-10 w-1/2 bg-muted/50" /> {/* Title */}
        <Skeleton className="h-6 w-1/4 mb-6 bg-muted/50" /> {/* Subtitle */}
         <Card>
           <CardHeader><Skeleton className="h-6 w-1/3 bg-muted/50" /></CardHeader>
           <CardContent><Skeleton className="h-32 w-full bg-muted/50" /></CardContent>
           <CardFooter><Skeleton className="h-10 w-32 bg-muted/50" /></CardFooter>
         </Card>
        <Card>
           <CardHeader><Skeleton className="h-6 w-1/3 bg-muted/50" /></CardHeader>
           <CardContent><Skeleton className="h-32 w-full bg-muted/50" /></CardContent>
        </Card>
         <Card> {/* Skeleton for promotions */}
           <CardHeader><Skeleton className="h-6 w-1/3 bg-muted/50" /></CardHeader>
           <CardContent><Skeleton className="h-24 w-full bg-muted/50" /></CardContent>
           <CardFooter><Skeleton className="h-10 w-32 bg-muted/50" /></CardFooter>
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

  // Store Not Found or Access Denied State
  if (!store) {
     return (
        <div className="container mx-auto py-10 flex flex-col items-center">
           <Card className="w-full max-w-md text-center border-dashed">
               <CardContent className="p-10">
                   <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30"/>
                   <p className="text-lg font-medium text-muted-foreground">Store Not Found or Access Denied</p>
                   <p className="text-sm text-muted-foreground mt-1">We couldn't find the store you're trying to manage, or you don't have permission.</p>
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
        <div className="space-y-3">
             <Link href="/stores" passHref legacyBehavior>
                <Button variant="ghost" size="sm" className="mb-1 text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Your Stores
                </Button>
            </Link>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manage: {store.name}</h1>
                    <p className="text-muted-foreground max-w-2xl">Add products, create offers, manage promotions, and control your store's availability.</p>
                </div>
                 {/* Open/Close Store Button */}
                 <Button
                    size="lg"
                    variant={store.isOpen ? "destructive" : "default"}
                    onClick={handleToggleStoreStatus}
                    disabled={isTogglingOpenStatus || !store.isActive} // Disable if not admin-approved
                    className={cn(
                      "w-full sm:w-auto text-base px-6 py-3 transition-all duration-300 transform hover:scale-105 font-semibold shadow-md hover:shadow-lg", // Make button bolder and larger
                    )}
                    title={!store.isActive ? "Store must be approved by admin first" : ""}
                  >
                    {isTogglingOpenStatus ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : store.isOpen ? (
                         <PowerOff className="mr-2 h-5 w-5" />
                    ) : (
                         <Power className="mr-2 h-5 w-5" />
                    )}
                    {isTogglingOpenStatus ? "Updating..." : store.isOpen ? "Close Store Temporarily" : "Open Store for Orders"}
                </Button>
             </div>
              {!store.isActive && (
                 <Alert variant="destructive" className="mt-4">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Store Not Active</AlertTitle>
                    <AlertDescription>
                        This store is currently disabled by the platform administrator and cannot be opened.
                    </AlertDescription>
                 </Alert>
             )}
              {!store.isOpen && store.isActive && (
                 <Alert variant="default" className="mt-4 border-yellow-500 bg-yellow-50 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300">
                     <PowerOff className="h-4 w-4 text-yellow-600 dark:text-yellow-400"/>
                    <AlertTitle>Store Closed</AlertTitle>
                    <AlertDescription>
                        Your store is currently closed to new orders. Customers can browse but cannot purchase or subscribe. Open the store to start accepting orders again. Pre-orders might still be possible if configured.
                    </AlertDescription>
                 </Alert>
             )}
        </div>

         {/* Main Content Wrapper - Apply dimming if store is closed */}
         <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: (!store.isOpen && store.isActive) ? 0.5 : 1 }} // Dim if closed but active
            transition={{ duration: 0.3 }}
            className={cn((!store.isOpen && store.isActive) ? "pointer-events-none cursor-not-allowed" : "")} // Prevent interaction when closed
          >
            <div className="space-y-10"> {/* Wrapper div for sections */}
                {/* Product Management Section */}
                <Card className="border shadow-lg overflow-hidden"> {/* Added shadow */}
                    <CardHeader className="flex flex-row justify-between items-center bg-muted/50 p-4 border-b">
                        <div>
                            <CardTitle className="text-xl flex items-center gap-2"><Package className="h-5 w-5 text-primary"/>Products</CardTitle>
                            <CardDescription>Manage the items available in your store.</CardDescription>
                        </div>
                        <Button size="sm" onClick={() => setShowNewProductForm(!showNewProductForm)} variant={showNewProductForm ? 'secondary' : 'default'} disabled={!store.isOpen && store.isActive}>
                            <PlusCircle className="mr-2 h-4 w-4" /> {showNewProductForm ? 'Cancel' : 'Add Product'}
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0"> {/* Remove padding for form/table */}
                        <AnimatePresence>
                            {showNewProductForm && (
                                <motion.div
                                    key="product-form"
                                    variants={formVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                >
                                    <div className="bg-background p-4 sm:p-6"> {/* Added padding inside animated div */}
                                        <h3 className="text-lg font-semibold mb-4 text-primary">New Product Details</h3>
                                        <ProductForm
                                            onProductCreated={handleProductCreated}
                                            storeId={store.id}
                                            storeCategory={store.category as StoreCategory}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Product List Grouped by Category */}
                        {products.length > 0 ? (
                            <Accordion type="multiple" defaultValue={productCategories.slice(0, 1)} className="w-full">
                            {productCategories.map((category) => (
                                <AccordionItem value={category} key={category} className="border-b-0 last:border-b-0"> {/* Remove internal borders */}
                                    <AccordionTrigger className="text-base font-medium capitalize hover:no-underline px-4 py-3 bg-secondary/50 hover:bg-secondary/70 border-b"> {/* Styled trigger */}
                                        {category === 'uncategorized' ? 'Uncategorized' : category} ({productsByCategory[category].length})
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-0 pb-0 data-[state=open]:border-t"> {/* Add border only when open */}
                                        <motion.div variants={listVariants} initial="hidden" animate="visible" className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-[60px] sm:w-[80px]">Image</TableHead>
                                                        <TableHead>Name</TableHead>
                                                        <TableHead className="hidden md:table-cell min-w-[200px]">Description</TableHead>
                                                        <TableHead className="text-right">Price</TableHead>
                                                        <TableHead className="text-right pr-4">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    <AnimatePresence>
                                                        {productsByCategory[category].map((product) => (
                                                            <motion.tr
                                                                key={product.id}
                                                                variants={itemVariants}
                                                                initial="hidden"
                                                                animate="visible"
                                                                exit="exit" // Apply exit animation
                                                                className="hover:bg-muted/50"
                                                                layout // Animate layout changes (like removal)
                                                            >
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
                                                                <TableCell className="text-xs text-muted-foreground hidden md:table-cell max-w-[250px] truncate">{product.description}</TableCell>
                                                                <TableCell className="text-right">{formatCurrency(product.price)}</TableCell>
                                                                <TableCell className="text-right space-x-1 pr-4">
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit Product (Not Implemented)" disabled={!store.isOpen && store.isActive}>
                                                                        <Edit className="h-4 w-4 opacity-50" />
                                                                    </Button>
                                                                    <AlertDialog>
                                                                        <AlertDialogTrigger asChild>
                                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" title="Delete Product" disabled={!store.isOpen && store.isActive}>
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
                                                            </motion.tr>
                                                        ))}
                                                    </AnimatePresence>
                                                </TableBody>
                                            </Table>
                                        </motion.div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                            </Accordion>
                        ) : !showNewProductForm && (
                            <div className="text-center text-muted-foreground py-10 px-4">
                                <Package className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30"/>
                                <p>No products added yet.</p>
                                <p className="text-sm">Click "Add Product" to get started.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Daily Offers Management Section (Conditional) */}
                {isEligibleForOffers && (
                    <Card className="border shadow-lg overflow-hidden">
                        <CardHeader className="flex flex-row justify-between items-center bg-muted/50 p-4 border-b">
                            <div>
                                <CardTitle className="text-xl flex items-center gap-2"><CalendarClock className="h-5 w-5 text-amber-500"/>Daily/Weekly Offers</CardTitle>
                                <CardDescription>Manage subscription offers for recurring deliveries.</CardDescription>
                            </div>
                            <Button size="sm" onClick={() => setShowNewOfferForm(!showNewOfferForm)} variant={showNewOfferForm ? 'secondary' : 'default'} disabled={!store.isOpen && store.isActive}>
                            <PlusCircle className="mr-2 h-4 w-4" /> {showNewOfferForm ? 'Cancel' : 'Add Offer'}
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                           <AnimatePresence>
                                {showNewOfferForm && (
                                    <motion.div
                                        key="offer-form"
                                        variants={formVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                    >
                                        <div className="bg-background p-4 sm:p-6">
                                            <h3 className="text-lg font-semibold mb-4 text-amber-600 dark:text-amber-400">New Subscription Offer</h3>
                                            <DailyOfferForm
                                                onOfferCreated={handleOfferCreated}
                                                storeId={store.id}
                                                availableProducts={products} // Pass products to select from
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            {dailyOffers.length > 0 ? (
                                <motion.div variants={listVariants} initial="hidden" animate="visible" className="overflow-x-auto">
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
                                            <AnimatePresence>
                                                {dailyOffers.map((offer) => (
                                                    <motion.tr
                                                        key={offer.id}
                                                        variants={itemVariants}
                                                        initial="hidden"
                                                        animate="visible"
                                                        exit="exit"
                                                        layout
                                                        className="hover:bg-muted/50"
                                                    >
                                                        <TableCell className="font-medium">{offer.name}</TableCell>
                                                        <TableCell className="capitalize hidden sm:table-cell">{offer.frequency}</TableCell>
                                                        <TableCell className="text-right">{formatCurrency(offer.price)}</TableCell>
                                                        <TableCell className="hidden md:table-cell">
                                                            <Badge variant={offer.isActive ? "secondary" : "outline"} className={cn(offer.isActive ? "text-green-600 border-green-400/50 bg-green-500/10" : "text-muted-foreground")}>
                                                                {offer.isActive ? "Active" : "Inactive"}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right space-x-1 pr-4">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit Offer (Not Implemented)" disabled={!store.isOpen && store.isActive}>
                                                                <Edit className="h-4 w-4 opacity-50" />
                                                            </Button>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" title="Delete Offer" disabled={!store.isOpen && store.isActive}>
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
                                                    </motion.tr>
                                                ))}
                                            </AnimatePresence>
                                        </TableBody>
                                    </Table>
                                </motion.div>
                            ) : !showNewOfferForm && (
                                <div className="text-center text-muted-foreground py-10 px-4">
                                    <CalendarClock className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30"/>
                                    <p>No daily or weekly offers created yet.</p>
                                    <p className="text-sm">Click "Add Offer" to create subscription options.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Promotions Management Section */}
                <Card className="border shadow-lg overflow-hidden">
                    <CardHeader className="flex flex-row justify-between items-center bg-muted/50 p-4 border-b">
                        <div>
                            <CardTitle className="text-xl flex items-center gap-2"><Ticket className="h-5 w-5 text-purple-500"/>Promotions</CardTitle>
                            <CardDescription>Manage discounts and special promotions for your store.</CardDescription>
                        </div>
                        <Button size="sm" onClick={() => setShowNewPromotionForm(!showNewPromotionForm)} variant={showNewPromotionForm ? 'secondary' : 'default'} disabled={!store.isOpen && store.isActive}>
                            <PlusCircle className="mr-2 h-4 w-4" /> {showNewPromotionForm ? 'Cancel' : 'Add Promotion'}
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <AnimatePresence>
                            {showNewPromotionForm && (
                                <motion.div
                                    key="promotion-form"
                                    variants={formVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                >
                                     <div className="bg-background p-4 sm:p-6">
                                        <h3 className="text-lg font-semibold mb-4 text-purple-600 dark:text-purple-400">New Promotion Details</h3>
                                        <PromotionForm
                                        onPromotionCreated={handlePromotionCreated}
                                        storeId={store.id}
                                        availableProducts={products}
                                        availableCategories={productCategories.filter(c => c !== 'uncategorized')} // Pass available categories
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        {promotions.length > 0 ? (
                            <motion.div variants={listVariants} initial="hidden" animate="visible" className="overflow-x-auto">
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
                                       <AnimatePresence>
                                            {promotions.map((promo) => (
                                                <motion.tr
                                                    key={promo.id}
                                                    variants={itemVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit="exit"
                                                    layout
                                                    className="hover:bg-muted/50"
                                                >
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
                                                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit Promotion (Not Implemented)" disabled={!store.isOpen && store.isActive}>
                                                            <Edit className="h-4 w-4 opacity-50" />
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" title="Delete Promotion" disabled={!store.isOpen && store.isActive}>
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
                                                </motion.tr>
                                            ))}
                                       </AnimatePresence>
                                    </TableBody>
                                </Table>
                            </motion.div>
                        ) : !showNewPromotionForm && (
                            <div className="text-center text-muted-foreground py-10 px-4">
                                <Ticket className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30"/>
                                <p>No promotions created yet.</p>
                                <p className="text-sm">Click "Add Promotion" to create discounts.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
         </motion.div>


         {/* Add other management sections as needed (e.g., Store Settings, Orders Received) */}

    </div>
  );
}
