"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from 'next/navigation'; // Use hook for client components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getStoreById, Store, Product } from "@/services/store"; // Updated service import
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { ArrowLeft, ShoppingCart, Star, Plus, Filter, Tag } from 'lucide-react'; // Added Filter, Tag icons
import Link from "next/link";
import { useToast } from "@/hooks/use-toast"; // Import useToast
import { Separator } from "@/components/ui/separator"; // Import Separator
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Import Select
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion"; // Import motion

// Helper to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

// Helper to generate theme class based on store category
const getThemeClass = (category: StoreCategory | undefined): string => {
   if (!category) return '';
   // Replace spaces for CSS class compatibility
   const formattedCategory = category.replace(/\s+/g, '.');
   return `theme-category-${formattedCategory}`;
}


export default function StorePage() {
  const params = useParams();
  const storeId = params.storeId as string; // Get storeId from URL parameters
  const { toast } = useToast(); // Initialize toast

  const [store, setStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProductCategory, setSelectedProductCategory] = useState<string>("all");

  useEffect(() => {
    if (!storeId) {
        setError("Store ID is missing.");
        setIsLoading(false);
        return;
    };

    const fetchStoreDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const storeDetails = await getStoreById(storeId);
        if (storeDetails) {
           setStore(storeDetails);
        } else {
            setError("Store not found.");
        }
      } catch (err) {
        console.error("Failed to fetch store details:", err);
        setError("Could not load store details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoreDetails();
  }, [storeId]);

   // Memoize product categories
    const productCategories = useMemo(() => {
        if (!store?.products) return ["all"];
        const uniqueCategories = new Set(store.products.map(p => p.category));
        return ["all", ...Array.from(uniqueCategories).sort()];
    }, [store?.products]);

    // Memoize filtered products
    const filteredProducts = useMemo(() => {
        if (!store?.products) return [];
        if (selectedProductCategory === "all") return store.products;
        return store.products.filter(p => p.category === selectedProductCategory);
    }, [store?.products, selectedProductCategory]);


   const handleAddToCart = (product: Product) => {
     console.log(`Adding ${product.name} to cart (Store: ${store?.name})`);

     toast({
       title: "Added to Cart!",
       description: (
         <div className="flex items-center gap-2">
           <ShoppingCart className="h-4 w-4 text-primary" />
           <span>{product.name} added to your cart.</span>
         </div>
       ),
       variant: "default", // Use default variant
     });
   };

   // Updated Product Card with animation and refined style
  const ProductCard = ({ product, delay = 0 }: { product: Product, delay?: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.2, delay: delay * 0.04 }}
      className="h-full"
    >
        <Card className="flex flex-col overflow-hidden h-full transition-all duration-300 hover:shadow-lg border hover:border-[hsl(var(--store-accent))] group bg-card">
        <CardHeader className="p-0">
            <div className="relative w-full h-40 overflow-hidden">
            <Image
                src={product.imageUrl || `https://picsum.photos/seed/${product.id}/300/200`}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw" // Adjust sizes
                className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105 bg-muted" // Add bg-muted as fallback
                data-ai-hint={`${product.category} product`}
            />
            </div>
            <div className="p-3 pb-1"> {/* Adjusted padding */}
            <CardTitle className="text-base font-semibold line-clamp-1 group-hover:text-[hsl(var(--store-accent))] transition-colors">{product.name}</CardTitle>
            <Badge variant="secondary" className="mt-1 capitalize text-[10px] font-normal px-1.5 py-0.5 tracking-wide">{product.category}</Badge>
            </div>
        </CardHeader>
        <CardContent className="flex-grow p-3 pt-1"> {/* Adjusted padding */}
            <p className="font-bold text-lg text-[hsl(var(--store-accent))]">{formatCurrency(product.price)}</p>
        </CardContent>
        <CardFooter className="p-3 pt-1 mt-auto"> {/* Adjusted padding */}
            <Button
                size="sm"
                className="w-full group/button bg-[hsl(var(--store-accent))] text-[hsl(var(--store-accent-foreground))] hover:bg-[hsl(var(--store-accent))] hover:opacity-90"
                onClick={() => handleAddToCart(product)}
                style={{ '--store-accent': 'hsl(var(--store-accent))' } as React.CSSProperties} // Pass variable for potential direct use if needed
                >
                <Plus className="mr-1 h-4 w-4 transition-transform duration-300 group-hover/button:rotate-90" /> Add to Cart
            </Button>
        </CardFooter>
        </Card>
    </motion.div>
  );

   const ProductSkeleton = () => (
     <Card className="flex flex-col overflow-hidden border animate-pulse"> {/* Added border */}
        <Skeleton className="h-40 w-full bg-muted/50" /> {/* Darker skeleton */}
        <CardHeader className="p-3 pb-1"> {/* Matched padding */}
            <Skeleton className="h-5 w-3/4 mb-1 bg-muted/50" />
            <Skeleton className="h-3 w-1/3 bg-muted/50" />
        </CardHeader>
        <CardContent className="p-3 pt-1"> {/* Matched padding */}
            <Skeleton className="h-6 w-1/4 bg-muted/50" />
        </CardContent>
        <CardFooter className="p-3 pt-1"> {/* Matched padding */}
            <Skeleton className="h-9 w-full bg-muted/50" />
        </CardFooter>
    </Card>
   )

   const themeClass = getThemeClass(store?.category);

  if (isLoading) {
    return (
        <div className="space-y-8">
            {/* Loading state structure */}
            <div className="flex items-center mb-6">
                <Skeleton className="h-9 w-32" />
            </div>
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <Skeleton className="w-full md:w-1/3 lg:w-1/4 aspect-square rounded-lg bg-muted/50" />
                <div className="w-full md:w-2/3 lg:w-3/4 space-y-3">
                    <Skeleton className="h-10 w-3/4 bg-muted/50" />
                    <Skeleton className="h-6 w-1/4 bg-muted/50" />
                    <Skeleton className="h-4 w-full bg-muted/50" />
                    <Skeleton className="h-4 w-5/6 bg-muted/50" />
                    <Skeleton className="h-5 w-1/3 bg-muted/50" />
                </div>
            </div>
            <Separator className="my-8"/>
            <Skeleton className="h-8 w-1/3 mb-6 bg-muted/50" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {Array.from({ length: 10 }).map((_, index) => <ProductSkeleton key={index} />)}
            </div>
        </div>
    );
  }

  if (error) {
     return (
       <div className="flex flex-col items-center justify-center h-[50vh]">
           <Card className="w-full max-w-md bg-destructive/10 border-destructive">
               <CardContent className="p-6 text-center text-destructive font-medium">
                   <p className="text-lg mb-2">Oops! Something went wrong.</p>
                   <p className="text-sm">{error}</p>
                   <Link href="/" passHref legacyBehavior>
                       <Button variant="secondary" size="sm" className="mt-6">
                           <ArrowLeft className="mr-2 h-4 w-4" /> Back to Stores
                       </Button>
                   </Link>
               </CardContent>
           </Card>
       </div>
     );
   }

  if (!store) {
     return (
        <div className="flex flex-col items-center justify-center h-[50vh]">
           <Card className="w-full max-w-md">
               <CardContent className="p-10 text-center text-muted-foreground">
                   <p className="text-lg font-medium">Store Not Found</p>
                   <p className="text-sm mt-2">We couldn't find the store you were looking for.</p>
                    <Link href="/" passHref legacyBehavior>
                       <Button variant="outline" size="sm" className="mt-6">
                           <ArrowLeft className="mr-2 h-4 w-4" /> Back to Stores
                       </Button>
                   </Link>
               </CardContent>
           </Card>
       </div>
     );
   }

  return (
    <div className={cn("space-y-8", themeClass)}> {/* Apply theme class */}
      {/* Back Button */}
        <Link href="/" passHref legacyBehavior>
            <Button variant="ghost" size="sm" className="mb-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Stores
            </Button>
        </Link>

      {/* Store Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="overflow-hidden border shadow-sm bg-card">
            <CardHeader className="p-0 relative">
                 <div className="w-full h-56 bg-gradient-to-r from-[hsl(var(--store-accent))] to-primary relative"> {/* Gradient header */}
                     {/* Optional pattern overlay */}
                      <div className="absolute inset-0 opacity-10 bg-[url('/patterns/subtle-dots.svg')] bg-repeat"></div>
                     {/* Store Image centered */}
                     <div className="absolute inset-0 flex items-center justify-center p-4">
                         <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden shadow-lg border-4 border-background bg-background z-10">
                             <Image
                                src={store.imageUrl || `https://picsum.photos/seed/${store.id}/400/400`}
                                alt={`${store.name} logo`}
                                fill
                                sizes="(max-width: 768px) 128px, 160px"
                                className="object-cover"
                                data-ai-hint={`${store.category} store logo`}
                                priority // Prioritize loading the main store image
                             />
                         </div>
                    </div>
                 </div>
            </CardHeader>
            <CardContent className="pt-16 text-center -mt-12 relative z-0"> {/* Adjust padding for overlap */}
                 <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-1">{store.name}</h1>
                 <Badge
                     variant="default"
                     className="capitalize mb-3 text-sm py-1 px-3 bg-[hsl(var(--store-accent))] text-[hsl(var(--store-accent-foreground))] hover:bg-[hsl(var(--store-accent))] hover:opacity-90"
                 >
                    {store.category}
                 </Badge>
                 <p className="text-muted-foreground leading-relaxed mb-4 max-w-2xl mx-auto">{store.description}</p>
                 {store.rating && (
                    <div className="flex items-center justify-center gap-1.5 text-sm font-medium">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-500" />
                        <span className="font-bold text-lg">{store.rating.toFixed(1)}</span>
                        <span className="text-muted-foreground">/ 5.0 Average Rating</span>
                    </div>
                 )}
            </CardContent>
        </Card>
       </motion.div>

       <Separator className="border-[hsl(var(--store-accent))] opacity-30"/>

       {/* Products Section */}
       <div className="pt-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                   <Tag className="text-[hsl(var(--store-accent))]"/> Products
                </h2>
                 {/* Product Category Filter */}
                 {productCategories.length > 2 && ( // Only show filter if more than 'all' + 1 category
                     <Select
                        value={selectedProductCategory}
                        onValueChange={(value: string) => setSelectedProductCategory(value)}
                     >
                        <SelectTrigger className="w-full sm:w-[220px]">
                            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                            <SelectValue placeholder="Filter by product category" />
                        </SelectTrigger>
                        <SelectContent>
                            {productCategories.map(category => (
                            <SelectItem key={category} value={category} className="capitalize">
                                {category === "all" ? "All Products" : category}
                            </SelectItem>
                            ))}
                        </SelectContent>
                     </Select>
                 )}
            </div>

            {store.products && store.products.length > 0 ? (
                 filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                        <AnimatePresence>
                            {filteredProducts.map((product, index) => (
                                <ProductCard key={product.id} product={product} delay={index}/>
                            ))}
                        </AnimatePresence>
                    </div>
                 ) : (
                     <Card className="border-dashed border-muted-foreground/50">
                       <CardContent className="p-10 text-center text-muted-foreground">
                           <p className="text-lg font-medium">No products found in '{selectedProductCategory}'</p>
                           <p className="text-sm mt-1">Try selecting a different category.</p>
                            <Button variant="link" onClick={() => setSelectedProductCategory('all')} className="mt-4 text-[hsl(var(--store-accent))]">
                                Show All Products
                            </Button>
                       </CardContent>
                    </Card>
                 )
            ) : (
                <Card>
                   <CardContent className="p-10 text-center text-muted-foreground">
                       <p className="text-lg font-medium">No products found in this store yet.</p>
                       <p className="text-sm mt-2">Check back later for new items!</p>
                   </CardContent>
                </Card>
            )}
       </div>
    </div>
  );
}
