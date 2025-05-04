
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Eye, ArrowRight } from 'lucide-react';
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Store } from "@/services/store";
import { getThemeClass } from '@/lib/utils'; // Import the helper

interface StoreCardProps {
  store: Store;
  delay?: number;
}

export const StoreCard = React.memo(({ store, delay = 0 }: StoreCardProps) => {
   const themeClass = getThemeClass(store.category); // Get theme class based on category

   return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay: delay * 0.05 }}
      className="h-full"
    >
      <Card className={`flex flex-col overflow-hidden h-full transition-all duration-300 hover:shadow-xl border group bg-card p-0 ${themeClass}`}> {/* Apply theme class */}
        <CardHeader className="p-0">
          <div className="relative w-full h-40 overflow-hidden">
            <Image
              src={store.imageUrl || `https://picsum.photos/seed/${store.id}/400/240`}
              alt={`${store.name} banner`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105 bg-muted"
              data-ai-hint={`${store.category} store`}
              priority={delay < 4}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            {store.rating && (
              <Badge variant="secondary" className="absolute top-2 right-2 text-xs flex items-center gap-1 backdrop-blur-sm bg-black/50 text-white border-none px-2 py-1 rounded-full shadow">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400"/> {store.rating.toFixed(1)}
              </Badge>
            )}
          </div>
          <div className="p-4 pb-2">
              <CardTitle className="h2 line-clamp-1">{store.name}</CardTitle>
              {/* Use themed accent color for category badge */}
              <Badge
                variant="outline"
                className="mt-1 capitalize caption border-[hsl(var(--store-accent))] text-[hsl(var(--store-accent))] bg-[hsl(var(--store-accent))]/10 px-1.5 py-0.5"
                style={{ '--store-accent': `hsl(var(--store-accent-${store.category.replace(/\s+/g, '-').toLowerCase().replace(/[^a-z0-9-]/g, '')}))` } as React.CSSProperties} // Inline style for dynamic theme
              >
                {store.category}
              </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-4 pt-0">
          <CardDescription className="text-body2 line-clamp-3 text-muted-foreground">{store.description}</CardDescription>
        </CardContent>
        <CardFooter className="p-4 pt-0 mt-auto">
          <Link href={`/store/${store.id}`} passHref legacyBehavior>
              <Button className="w-full group/button" size="sm" variant="default" withRipple>
                  <Eye className="mr-1.5 h-4 w-4" />
                  Visit Store
                  <ArrowRight className="ml-auto h-4 w-4 transition-transform duration-300 group-hover/button:translate-x-1" />
              </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
   );
});

StoreCard.displayName = 'StoreCard'; // Add display name for React DevTools
