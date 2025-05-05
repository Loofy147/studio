
'use client';

import React from 'react'; // Ensure React is imported
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Plus, Bell, XCircle, ShoppingCart } from 'lucide-react';
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion"; // Correct import for motion
import type { Product } from '@/services/store';
import { formatCurrency, cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
  storeIsOpen: boolean;
  storeIsActive: boolean;
  delay?: number;
}

// Wrap component definition with React.memo
const ProductCardComponent = ({ product, storeIsOpen, storeIsActive, delay = 0 }: ProductCardProps) => {
    const { toast } = useToast();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering link navigation if card is wrapped in Link
        if (!storeIsOpen && storeIsActive) {
            toast({
                title: "Store Closed",
                description: `${product.storeName || 'This store'} is currently closed. You can place a pre-order.`,
                variant: "default"
            });
            console.log(`Attempted to add ${product.name} from closed store ${product.storeName}. Pre-order?`);
            return;
        }
        if (!storeIsActive) {
            toast({
                title: "Store Unavailable",
                description: `${product.storeName || 'This store'} is currently unavailable.`,
                variant: "destructive"
            });
            return;
        }

        console.log(`Adding ${product.name} to cart`);
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

    const cardVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.2, delay: delay * 0.04 } },
        exit: { opacity: 0, y: -15, transition: { duration: 0.2 } },
    };

    return (
        // Ensure no stray characters around here
        <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="h-full"
            layout
        >
            <Card className={cn(
                "flex flex-col overflow-hidden h-full transition-all duration-300 hover:shadow-lg border hover:border-[hsl(var(--store-accent))] group bg-card p-0",
                (!storeIsOpen || !storeIsActive) && "opacity-60 cursor-not-allowed"
                )}>
                <CardHeader className="p-0">
                    <div className="relative w-full h-40 overflow-hidden">
                        <Image
                            src={product.imageUrl || `https://picsum.photos/seed/${product.id}/300/200`}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                            className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105 bg-muted"
                            data-ai-hint={`${product.category} product`}
                            priority={delay < 6}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
                        {product.storeName && product.storeId && (
                            <Badge variant="secondary" className="absolute top-1 left-1 caption font-medium px-1.5 py-0.5 bg-black/50 text-white border-none shadow">
                                <Link href={`/store/${product.storeId}`} className="hover:underline text-white" onClick={(e) => e.stopPropagation()}>
                                    {product.storeName}
                                </Link>
                            </Badge>
                        )}
                        {product.size && <Badge variant="secondary" className="absolute bottom-1 right-1 caption px-1.5 py-0.5 bg-black/50 text-white border-none shadow">{product.size}</Badge>}
                    </div>
                    {/* Use p-4 pb-1 */}
                    <div className="p-4 pb-1">
                        {/* Apply Heading 2 */}
                        <CardTitle className="h2 line-clamp-1">{product.name}</CardTitle>
                        {/* Apply Caption */}
                        <Badge variant="outline" className="mt-1 capitalize caption font-normal px-1.5 py-0.5 tracking-wide">{product.category}</Badge>
                    </div>
                </CardHeader>
                {/* Use p-4 pt-1 */}
                <CardContent className="flex-grow p-4 pt-1 space-y-1">
                    {/* Apply Heading 2 */}
                    <p className="h2 font-bold text-[hsl(var(--store-accent))]">{formatCurrency(product.price)}</p>
                    {/* Apply Body 2 */}
                    <p className="text-body2 text-muted-foreground line-clamp-2">{product.description}</p>
                    {product.ingredients && (
                        /* Apply Caption */
                        <p className="caption pt-1">Ingredients: {product.ingredients.join(', ')}</p>
                    )}
                </CardContent>
                {/* Use p-4 pt-0 */}
                <CardFooter className="p-4 pt-0 mt-auto">
                    {/* Use solid primary button */}
                    <Button
                        size="sm"
                        variant="default"
                        className={cn(
                            "w-full group/button btn-text-uppercase-semibold",
                             (!storeIsOpen || !storeIsActive) && "bg-muted hover:bg-muted text-muted-foreground cursor-not-allowed"
                        )}
                        onClick={handleAddToCart}
                        style={{ '--store-accent': 'hsl(var(--store-accent))' } as React.CSSProperties}
                        disabled={!storeIsOpen || !storeIsActive}
                        withRipple // Enable ripple effect
                        >
                        {storeIsOpen && storeIsActive ? (
                            <>
                                <Plus className="mr-1 h-4 w-4 transition-transform duration-300 group-hover/button:rotate-90" /> Add to Cart
                            </>
                        ) : !storeIsActive ? (
                            <XCircle className="mr-1 h-4 w-4"/> Unavailable
                        ) : (
                            <>
                                <Bell className="mr-1 h-4 w-4"/> Pre-order
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    );
};

// Export the memoized component
export const ProductCard = React.memo(ProductCardComponent);
// Add display name for React DevTools
ProductCard.displayName = 'ProductCard';
