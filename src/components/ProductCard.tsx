
'use client';

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Plus } from 'lucide-react'; // Import Plus
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Product } from "@/services/store";
import { formatCurrency, cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Bell, XCircle } from 'lucide-react'; // Import icons for toast and closed store

interface ProductCardProps {
  product: Product;
  storeIsOpen: boolean; // Pass store open status
  storeIsActive: boolean; // Pass store active status
  delay?: number;
}

export const ProductCard = React.memo(({ product, storeIsOpen, storeIsActive, delay = 0 }: ProductCardProps) => {
    const { toast } = useToast();

    const handleAddToCart = (e: React.MouseEvent) => {
     e.stopPropagation(); // Prevent card click if clicking button
     if (!storeIsOpen && storeIsActive) {
         toast({
             title: "Store Closed",
             description: `This store is currently closed. You can place a pre-order.`,
             variant: "default"
         });
         console.log(`Attempted to add ${product.name} from closed store. Pre-order?`);
         return;
     }
      if (!storeIsActive) {
          toast({
              title: "Store Unavailable",
              description: `This store is currently unavailable.`,
              variant: "destructive"
          });
          return;
      }

     console.log(`Adding ${product.name} to cart`);
     // Add to cart state/context logic here
     toast({
       title: "Added to Cart!",
       description: (
         <div className="flex items-center gap-2">
           <ShoppingCart className="h-4 w-4 text-primary" />
           <span>{product.name} added to your cart.</span>
         </div>
       ),
       variant: "default",
     });
   };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2, delay: delay * 0.05 }}
      className="h-full"
    >
      <Card className={cn(
          "flex flex-col overflow-hidden h-full transition-all duration-300 hover:shadow-lg border hover:border-primary/20 hover:bg-card/95 group bg-card p-0",
          (!storeIsOpen || !storeIsActive) && "opacity-60 cursor-not-allowed" // Dim if closed or inactive
      )}>
        <CardHeader className="p-0">
          <div className="relative w-full h-32 overflow-hidden rounded-t-md">
            <Image
              src={product.imageUrl || `https://picsum.photos/seed/${product.id}/300/200`}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105 bg-muted"
              data-ai-hint={`${product.category} product`}
              priority={delay < 6}
            />
             {product.storeName && product.storeId && (
                <Link href={`/store/${product.storeId}`} className="absolute bottom-1 left-1 z-10" onClick={(e) => e.stopPropagation()}>
                    <Badge variant="secondary" className="caption px-1.5 py-0.5 bg-black/60 text-white border-none hover:bg-black/80 transition-colors">{product.storeName}</Badge>
                </Link>
             )}
             {product.size && <Badge variant="secondary" className="absolute bottom-1 right-1 text-[10px] px-1.5 py-0.5 bg-black/50 text-white border-none">{product.size}</Badge>}
          </div>
          <div className="p-3 pb-0">
            <CardTitle className="h3 line-clamp-1">{product.name}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-3 pt-1">
          <p className="h2 text-primary font-bold">{formatCurrency(product.price)}</p>
        </CardContent>
        <CardFooter className="p-3 pt-0 mt-auto">
             <Button
                size="sm"
                variant="default"
                className={cn(
                    "w-full group/button h-8 btn-text-uppercase-semibold",
                     (!storeIsOpen || !storeIsActive) && "bg-muted hover:bg-muted text-muted-foreground cursor-not-allowed"
                )}
                onClick={handleAddToCart}
                disabled={!storeIsActive} // Disable only if completely inactive
                withRipple
                >
                 {storeIsActive ? (
                     storeIsOpen ? (
                         <>
                            <Plus className="mr-1 h-3 w-3 transition-transform duration-300 group-hover/button:rotate-90" /> Add to Cart
                         </>
                     ) : (
                          <>
                             <Bell className="mr-1 h-3 w-3"/> Pre-order
                          </>
                     )
                 ) : (
                    <XCircle className="mr-1 h-3 w-3"/> Unavailable
                 )}

            </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard'; // Add display name
