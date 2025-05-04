
'use client';

import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export const StoreSkeleton = () => (
     <Card className="flex flex-col overflow-hidden border animate-pulse bg-card/50 p-0">
        <Skeleton className="h-40 w-full bg-muted/50" />
        <CardHeader className="p-4 pb-2">
            <Skeleton className="h-6 w-3/4 mb-1 bg-muted/50" />
            <Skeleton className="h-4 w-1/4 bg-muted/50" />
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-1">
            <Skeleton className="h-4 w-full bg-muted/50" />
            <Skeleton className="h-4 w-5/6 bg-muted/50" />
        </CardContent>
        <CardFooter className="p-4 pt-0">
            <Skeleton className="h-9 w-full bg-muted/50" />
        </CardFooter>
    </Card>
);

export const ProductSkeleton = () => (
     <Card className="flex flex-col overflow-hidden border animate-pulse bg-card/50 p-0">
        <Skeleton className="h-32 w-full bg-muted/50 rounded-t-md" />
        <CardHeader className="p-3 pb-0">
            <Skeleton className="h-5 w-3/4 mb-1 bg-muted/50" />
        </CardHeader>
        <CardContent className="p-3 pt-1">
             <Skeleton className="h-7 w-1/3 bg-muted/50" />
        </CardContent>
        <CardFooter className="p-3 pt-0">
            <Skeleton className="h-8 w-full bg-muted/50" />
        </CardFooter>
    </Card>
);

// Add other skeleton components here as needed (e.g., OrderSkeleton, ProfileSkeleton)
