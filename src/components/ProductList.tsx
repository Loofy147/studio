
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductCard } from './ProductCard';
import { ProductSkeleton } from './Skeletons'; // Assume ProductSkeleton is moved to Skeletons.tsx
import type { Product } from '@/services/store';
import { Tag } from 'lucide-react';

interface ProductListProps {
    products: Product[];
    isLoading: boolean;
    skeletonCount?: number;
    gridCols?: string; // e.g., "lg:grid-cols-4 xl:grid-cols-6"
    storeIsOpen?: boolean; // Optional: Pass store status for ProductCard
    storeIsActive?: boolean; // Optional: Pass store status for ProductCard
}

export function ProductList({
    products,
    isLoading,
    skeletonCount = 6,
    gridCols = "lg:grid-cols-4 xl:grid-cols-6",
    storeIsOpen = true, // Default to open if not provided (e.g., homepage)
    storeIsActive = true, // Default to active if not provided
}: ProductListProps) {

    const containerVariants = {
        hidden: { opacity: 1 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
    };

    return (
        <>
            {isLoading ? (
                <div className={`grid grid-cols-2 sm:grid-cols-3 ${gridCols} gap-6`}>
                    {Array.from({ length: skeletonCount }).map((_, index) => (
                        <ProductSkeleton key={`product-skeleton-${index}`} />
                    ))}
                </div>
            ) : products.length > 0 ? (
                <motion.div
                    className={`grid grid-cols-2 sm:grid-cols-3 ${gridCols} gap-6`}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    layout
                >
                    <AnimatePresence>
                        {products.map((product, index) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                storeIsOpen={storeIsOpen}
                                storeIsActive={storeIsActive}
                                delay={index}
                            />
                        ))}
                    </AnimatePresence>
                </motion.div>
            ) : (
                 <p className="caption italic text-center py-4 col-span-full">No best selling products found at the moment.</p> // Adjust empty state message if needed
            )}
        </>
    );
}
