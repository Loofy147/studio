
"use client";

import { useState, useEffect } from "react";
import { useParams } from 'next/navigation'; // Use hook for client components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getStoreById, Store, Product } from "@/services/store"; // Updated service import
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { ArrowLeft, ShoppingCart, Star, Plus } from 'lucide-react'; // Added Plus icon
import Link from "next/link";
import { useToast } from "@/hooks/use-toast"; // Import useToast
import { Separator } from "@/components/ui/separator"; // Import Separator

// Helper to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export default function StorePage() {
  const params = useParams();
  const storeId = params.storeId as string; // Get storeId from URL parameters
  const { toast } = useToast(); // Initialize toast

  const [store, setStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const ProductCard = ({ product }: { product: Product }) => (
    <Card className="flex flex-col overflow-hidden h-full transition-all duration-300 hover:shadow-md border border-transparent hover:border-accent/20 group">
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
        <div className="p-4 pb-0">
           <CardTitle className="text-base font-semibold line-clamp-1 group-hover:text-primary transition-colors">{product.name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4 pt-1">
        <CardDescription className="text-xs line-clamp-2 mb-2 text-muted-foreground">{product.description}</CardDescription>
         <p className="font-bold text-sm">{formatCurrency(product.price)}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 mt-auto"> {/* Ensure footer sticks to bottom */}
        <Button size="sm" className="w-full group/button" onClick={() => handleAddToCart(product)}>
           <Plus className="mr-1 h-4 w-4 transition-transform duration-300 group-hover/button:rotate-90" /> Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );

   const ProductSkeleton = () => (
     <Card className="flex flex-col overflow-hidden">
        <Skeleton className="h-40 w-full" />
        <CardHeader className="p-4 pb-0">
            <Skeleton className="h-5 w-3/4 mb-1" />
        </CardHeader>
        <CardContent className="p-4 pt-1">
            <Skeleton className="h-3 w-full mb-1" />
            <Skeleton className="h-3 w-5/6 mb-2" />
            <Skeleton className="h-5 w-1/4" />
        </CardContent>
        <CardFooter className="p-4 pt-0">
            <Skeleton className="h-9 w-full" />
        </CardFooter>
    </Card>
   )

  if (isLoading) {
    return (
        <div className="space-y-8">
            {/* Loading state structure */}
            <div className="flex items-center mb-6">
                <Skeleton className="h-9 w-32" />
            </div>
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <Skeleton className="w-full md:w-1/3 lg:w-1/4 aspect-square rounded-lg" />
                <div className="w-full md:w-2/3 lg:w-3/4 space-y-3">
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-5 w-1/3" />
                </div>
            </div>
            <Separator className="my-8"/>
            <Skeleton className="h-8 w-1/3 mb-6" />
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
    <div className="space-y-8">
      {/* Back Button */}
        <Link href="/" passHref legacyBehavior>
            <Button variant="ghost" size="sm" className="mb-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Stores
            </Button>
        </Link>

      {/* Store Header Section */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start pb-8">
         <div className="w-full md:w-1/3 lg:w-1/4 relative aspect-square rounded-lg overflow-hidden shadow-md border bg-card">
             <Image
                src={store.imageUrl || `https://picsum.photos/seed/${store.id}/400/400`}
                alt={`${store.name} logo`}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover bg-muted"
                data-ai-hint={`${store.category} store logo`}
                priority // Prioritize loading the main store image
             />
         </div>
         <div className="w-full md:w-2/3 lg:w-3/4 mt-2 md:mt-0">
             <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">{store.name}</h1>
             <Badge variant="outline" className="capitalize mb-4 text-sm py-1 px-3">{store.category}</Badge>
             <p className="text-muted-foreground leading-relaxed mb-4">{store.description}</p>
             {store.rating && (
                <div className="flex items-center gap-1.5 text-sm font-medium">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-500" />
                    <span className="font-bold text-lg">{store.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground">/ 5.0 Average Rating</span>
                </div>
             )}
         </div>
      </div>

       <Separator />

       {/* Products Section */}
       <div className="pt-8">
            <h2 className="text-2xl font-semibold mb-6">Products</h2>
            {store.products && store.products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                    {store.products.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <Card>
                   <CardContent className="p-10 text-center text-muted-foreground">
                       <p className="text-lg">No products found in this store yet.</p>
                       <p className="text-sm mt-2">Check back later for new items!</p>
                   </CardContent>
                </Card>
            )}
       </div>
    </div>
  );
}
