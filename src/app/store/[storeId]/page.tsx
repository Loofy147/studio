
"use client";

import { useState, useEffect } from "react";
import { useParams } from 'next/navigation'; // Use hook for client components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getStoreById, Store, Product } from "@/services/store"; // Updated service import
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { ArrowLeft, ShoppingCart, Star } from 'lucide-react';
import Link from "next/link";
import { useToast } from "@/hooks/use-toast"; // Import useToast

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
     // --- Placeholder for adding to cart functionality ---
     console.log(`Adding ${product.name} to cart (Store: ${store?.name})`);
     // In a real app, you'd update a cart state (e.g., using Context API, Zustand, or Redux)
     // or make an API call to add the item to the user's cart in the backend.

     // Show a confirmation toast
     toast({
       title: "Added to Cart",
       description: `${product.name} has been added to your shopping cart.`,
       // You could add an action, e.g., to view the cart
       // action: <ToastAction altText="View Cart">View Cart</ToastAction>,
     });
   };

  const ProductCard = ({ product }: { product: Product }) => (
    <Card className="flex flex-col overflow-hidden h-full">
      <CardHeader className="p-0">
        <div className="relative w-full h-40">
          <Image
            src={product.imageUrl || `https://picsum.photos/seed/${product.id}/300/200`}
            alt={product.name}
            layout="fill"
            objectFit="cover"
             data-ai-hint={`${product.category} product`}
          />
        </div>
        <div className="p-4 pb-0">
           <CardTitle className="text-base font-medium line-clamp-1">{product.name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4 pt-2">
        <CardDescription className="text-xs line-clamp-2 mb-2">{product.description}</CardDescription>
         <p className="font-semibold text-sm">{formatCurrency(product.price)}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button size="sm" className="w-full" onClick={() => handleAddToCart(product)}>
           <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );

   const ProductSkeleton = () => (
     <Card className="flex flex-col overflow-hidden">
        <Skeleton className="h-40 w-full" />
        <CardHeader className="p-4 pb-0">
            <Skeleton className="h-5 w-3/4" />
        </CardHeader>
        <CardContent className="p-4 pt-2">
            <Skeleton className="h-3 w-full mb-1" />
            <Skeleton className="h-3 w-5/6 mb-2" />
            <Skeleton className="h-4 w-1/4" />
        </CardContent>
        <CardFooter className="p-4 pt-0">
            <Skeleton className="h-9 w-full" />
        </CardFooter>
    </Card>
   )

  if (isLoading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-8 w-1/4 mb-4" /> {/* Back button skeleton */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
                <Skeleton className="w-full md:w-1/3 h-64 rounded-lg" />
                <div className="w-full md:w-2/3 space-y-3">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-5 w-1/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-5 w-1/3" />
                </div>
            </div>
            <Skeleton className="h-8 w-1/3 mt-8 mb-4" /> {/* Products title skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {Array.from({ length: 10 }).map((_, index) => <ProductSkeleton key={index} />)}
            </div>
        </div>
    );
  }

  if (error) {
    return <p className="text-destructive text-center">{error}</p>;
  }

  if (!store) {
    return <p className="text-center text-muted-foreground">Store not found.</p>;
  }

  return (
    <div>
      {/* Back Button */}
        <Link href="/" passHref legacyBehavior>
            <Button variant="outline" size="sm" className="mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Stores
            </Button>
        </Link>

      {/* Store Header Section */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start mb-8">
         <div className="w-full md:w-1/3 lg:w-1/4 relative aspect-square rounded-lg overflow-hidden shadow-md">
             <Image
                src={store.imageUrl || `https://picsum.photos/seed/${store.id}/400/400`}
                alt={`${store.name} banner`}
                layout="fill"
                objectFit="cover"
                className="bg-muted"
                 data-ai-hint={`${store.category} store logo`}
             />
         </div>
         <div className="w-full md:w-2/3 lg:w-3/4">
             <h1 className="text-3xl md:text-4xl font-bold mb-2">{store.name}</h1>
             <Badge variant="secondary" className="capitalize mb-3">{store.category}</Badge>
             <p className="text-muted-foreground mb-4">{store.description}</p>
             {store.rating && (
                <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-500" />
                    <span className="font-semibold">{store.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground">Average Rating</span>
                </div>
             )}
         </div>
      </div>

       {/* Products Section */}
       <h2 className="text-2xl font-semibold mt-10 mb-6 border-b pb-2">Products</h2>
       {store.products && store.products.length > 0 ? (
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
           {store.products.map(product => (
             <ProductCard key={product.id} product={product} />
           ))}
         </div>
       ) : (
         <p className="text-center text-muted-foreground mt-6">No products found in this store yet.</p>
       )}
    </div>
  );
}
