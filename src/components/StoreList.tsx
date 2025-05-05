'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StoreCard } from './StoreCard';
import { StoreSkeleton } from './Skeletons'; // Assume StoreSkeleton is moved to Skeletons.tsx
import type { Store, StoreCategory } from '@/services/store';
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface StoreListProps {
    stores: Store[];
    isLoading: boolean;
    skeletonCount?: number;
    gridCols?: string; // e.g., "lg:grid-cols-3 xl:grid-cols-4"
    searchTerm?: string; // Optional: Pass search term for empty state message
    selectedCategory?: StoreCategory | "all"; // Optional: Pass category for empty state message
    onClearFilters?: () => void; // Optional: Callback to clear filters
}

export function StoreList({
    stores,
    isLoading,
    skeletonCount = 6,
    gridCols = "lg:grid-cols-3 xl:grid-cols-4", // Default grid columns
    searchTerm,
    selectedCategory,
    onClearFilters,
}: StoreListProps) {

    const containerVariants = {
        hidden: { opacity: 1 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
    };

    // Use standardized gap (24px from spec, gap-6 in Tailwind)
    const gridClassName = `grid grid-cols-1 sm:grid-cols-2 ${gridCols} gap-6`;

    return (
        <>
            {isLoading ? (
                <div className={gridClassName}>
                    {Array.from({ length: skeletonCount }).map((_, index) => (
                        <StoreSkeleton key={`store-skeleton-${index}`} />
                    ))}
                </div>
            ) : stores.length > 0 ? (
                <motion.div
                    className={gridClassName}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    layout // Enable layout animation for filtering
                >
                    <AnimatePresence>
                        {stores.map((store, index) => (
                            <StoreCard key={store.id} store={store} delay={index} />
                        ))}
                    </AnimatePresence>
                </motion.div>
            ) : (
                // Use p-10 for empty state padding
                <Card className="col-span-full border-dashed border-muted-foreground/30 bg-card/50">
                    <CardContent className="p-10 text-center text-muted-foreground">
                        <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                         {/* Use text-lg for title */}
                        <p className="text-lg font-medium">No stores found matching your criteria.</p>
                        {(searchTerm || selectedCategory !== 'all') && (
                           <>
                              {/* Use Body 2 style */}
                             <p className="text-body2 mt-1">Try adjusting your search or selected category.</p>
                             {onClearFilters && (
                                <Button variant="link" onClick={onClearFilters} className="mt-4 text-primary h-auto p-0">
                                Clear Search & Filters
                                </Button>
                             )}
                           </>
                        )}
                    </CardContent>
                </Card>
            )}
        </>
    );
}

    