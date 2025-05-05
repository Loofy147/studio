

'use client';

import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

// Skeletons for Profile Page
export const ProfileInfoSkeleton = () => (
     <Card className="border-primary/10 shadow-md">
        {/* Use p-6 for consistent padding */}
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 bg-gradient-to-r from-primary/5 via-background to-secondary/5">
             <Skeleton className="h-24 w-24 rounded-full bg-muted/50" />
             <div className="space-y-2 flex-grow mt-2 sm:mt-0">
                <Skeleton className="h-8 w-56 bg-muted/50" />
                <Skeleton className="h-6 w-64 bg-muted/50" />
                <Skeleton className="h-5 w-40 bg-muted/50" />
             </div>
            <div className="flex gap-2 self-start sm:self-center">
                <Skeleton className="h-9 w-32 bg-muted/50" />
            </div>
        </CardHeader>
        {/* Use p-6 for consistent padding */}
        <CardContent className="space-y-6 p-6 pt-4">
            <Separator />
             {/* Address Skeleton */}
              <div className="space-y-4">
                 <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-36 bg-muted/50" />
                    <Skeleton className="h-9 w-28 bg-muted/50" />
                 </div>
                 <div className="space-y-3">
                     <Skeleton className="h-8 w-full bg-muted/50" /> {/* Simulate address card */}
                 </div>
             </div>
             <Separator />
             {/* Friends/Followed Stores Skeleton */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 border rounded-md">
                     <Skeleton className="h-7 w-7 rounded bg-muted/50" />
                     <Skeleton className="h-5 w-32 bg-muted/50" />
                  </div>
                   <div className="flex items-center gap-3 p-4 border rounded-md">
                     <Skeleton className="h-7 w-7 rounded bg-muted/50" />
                     <Skeleton className="h-5 w-36 bg-muted/50" />
                  </div>
             </div>
             <Separator />
             <div className="flex items-center gap-3 p-4 border rounded-lg bg-gradient-to-r from-yellow-100/20 via-amber-50/20 to-orange-100/20 dark:from-yellow-900/30 dark:via-amber-950/30 dark:to-orange-950/30">
                 <Skeleton className="h-10 w-10 rounded-full bg-muted/50" />
                 <div className="space-y-1">
                    <Skeleton className="h-5 w-28 bg-muted/50" />
                    <Skeleton className="h-7 w-20 bg-muted/50" />
                 </div>
            </div>
        </CardContent>
     </Card>
  )

export const OrderHistorySkeleton = () => (
    <Card className="border-primary/10 shadow-md">
        {/* Use p-4 for consistent padding */}
        <CardHeader className="flex flex-row justify-between items-center p-4">
            <div className="space-y-1">
                <Skeleton className="h-6 w-40 bg-muted/50" />
                <Skeleton className="h-4 w-56 bg-muted/50" />
            </div>
            <Skeleton className="h-9 w-32 bg-muted/50" />
        </CardHeader>
        <CardContent className="p-0">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px] pl-4"><Skeleton className="h-4 w-16 bg-muted/50" /></TableHead>
                        <TableHead><Skeleton className="h-4 w-24 bg-muted/50" /></TableHead>
                        <TableHead><Skeleton className="h-4 w-32 bg-muted/50" /></TableHead>
                        <TableHead className="hidden md:table-cell text-right"><Skeleton className="h-4 w-20 bg-muted/50" /></TableHead>
                        <TableHead><Skeleton className="h-4 w-24 bg-muted/50" /></TableHead>
                        <TableHead className="text-right pr-4"><Skeleton className="h-4 w-16 bg-muted/50" /></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i} className="hover:bg-muted/20">
                            <TableCell className="pl-4"><Skeleton className="h-4 w-16 bg-muted/50" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24 bg-muted/50" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-32 bg-muted/50" /></TableCell>
                             <TableCell className="hidden md:table-cell text-right"><Skeleton className="h-4 w-20 bg-muted/50" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-20 rounded-full bg-muted/50" /></TableCell> {/* Status */}
                            <TableCell className="text-right pr-4"><Skeleton className="h-8 w-8 inline-block bg-muted/50" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
   )

export const SubscriptionsSkeleton = () => (
     <Card className="border-primary/10 shadow-md">
         {/* Use p-4 for consistent padding */}
        <CardHeader className="flex flex-row justify-between items-center p-4">
            <div className="space-y-1">
                <Skeleton className="h-7 w-44 bg-muted/50" />
                <Skeleton className="h-4 w-60 bg-muted/50" />
            </div>
            <Skeleton className="h-9 w-32 bg-muted/50" /> {/* View All Button */}
        </CardHeader>
        <CardContent className="p-0">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="pl-4"><Skeleton className="h-4 w-32 bg-muted/50" /></TableHead>
                        <TableHead><Skeleton className="h-4 w-24 bg-muted/50" /></TableHead>
                        <TableHead className="hidden md:table-cell"><Skeleton className="h-4 w-28 bg-muted/50" /></TableHead>
                        <TableHead><Skeleton className="h-4 w-20 bg-muted/50" /></TableHead>
                        <TableHead className="text-right pr-4"><Skeleton className="h-4 w-28 bg-muted/50" /></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                     {Array.from({ length: 2 }).map((_, i) => (
                        <TableRow key={i} className="hover:bg-muted/20">
                            <TableCell className="pl-4"><Skeleton className="h-4 w-full" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                            <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-full" /></TableCell>
                             <TableCell><Skeleton className="h-6 w-20 rounded-full bg-muted/50" /></TableCell> {/* Status */}
                            <TableCell className="text-right pr-4 space-x-1">
                                <Skeleton className="h-8 w-8 inline-block rounded-md bg-muted/50" />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
     </Card>
   )

// Skeleton for Account Settings Page
export const AccountSettingsSkeleton = () => (
    <div className="container mx-auto py-10 space-y-10 max-w-3xl animate-pulse">
        <div>
            <Skeleton className="h-8 w-32 mb-2 bg-muted/50" /> {/* Back Button */}
            <Skeleton className="h-10 w-1/2 bg-muted/50" /> {/* Title */}
            <Skeleton className="h-5 w-3/4 mt-1 bg-muted/50" /> {/* Description */}
        </div>
        <Card>
            <CardHeader><Skeleton className="h-6 w-1/4 bg-muted/50" /></CardHeader>
            <CardContent className="space-y-4">
                 <Skeleton className="h-10 w-full bg-muted/50" />
                 <Skeleton className="h-10 w-full bg-muted/50" />
            </CardContent>
             <CardFooter className="border-t pt-4 justify-end">
                 <Skeleton className="h-10 w-32 bg-muted/50" />
            </CardFooter>
        </Card>
        <Card>
            <CardHeader><Skeleton className="h-6 w-1/4 bg-muted/50" /></CardHeader>
             <CardContent className="space-y-4">
                 <Skeleton className="h-10 w-full bg-muted/50" />
             </CardContent>
             <CardFooter className="border-t pt-4 justify-end">
                 <Skeleton className="h-10 w-32 bg-muted/50" />
            </CardFooter>
        </Card>
        <Card>
            <CardHeader><Skeleton className="h-6 w-1/4 bg-muted/50" /></CardHeader>
             <CardContent className="space-y-4">
                 <Skeleton className="h-10 w-full bg-muted/50" />
                 <Skeleton className="h-10 w-full bg-muted/50" />
                 <Skeleton className="h-10 w-full bg-muted/50" />
             </CardContent>
             <CardFooter className="border-t pt-4 justify-end">
                 <Skeleton className="h-10 w-32 bg-muted/50" />
            </CardFooter>
        </Card>
    </div>
);

// Skeleton for Address Card
export const AddressCardSkeleton = () => (
    <Card className="animate-pulse border p-4 flex items-center justify-between bg-card/50">
        <div className="flex items-center gap-4">
             <Skeleton className="h-8 w-8 rounded bg-muted/50" />
            <div className="space-y-1.5">
                <Skeleton className="h-5 w-32 bg-muted/50" />
                <Skeleton className="h-4 w-48 bg-muted/50" />
            </div>
        </div>
         <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-md bg-muted/50" />
            <Skeleton className="h-8 w-8 rounded-md bg-muted/50" />
         </div>
    </Card>
);

// Skeleton for Friend Card
export const FriendCardSkeleton = () => (
    <Card className="animate-pulse border p-4 flex items-center justify-between bg-card/50">
        <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full bg-muted/50" />
            <div className="space-y-1.5">
                <Skeleton className="h-5 w-32 bg-muted/50" />
                <Skeleton className="h-4 w-40 bg-muted/50" />
            </div>
        </div>
         <div className="flex gap-2">
            <Skeleton className="h-9 w-9 rounded-md bg-muted/50" />
            <Skeleton className="h-9 w-9 rounded-full bg-muted/50" />
         </div>
    </Card>
);

// Skeleton for Followed Store Card
export const FollowedStoreCardSkeleton = () => (
    <Card className="animate-pulse border bg-card/50">
      <CardHeader className="p-0">
        <Skeleton className="h-48 w-full bg-muted/50" />
        <div className="p-4 space-y-2">
           <Skeleton className="h-6 w-3/4 bg-muted/50" />
           <Skeleton className="h-4 w-1/4 bg-muted/50" />
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <Skeleton className="h-4 w-full mb-1 bg-muted/50" />
        <Skeleton className="h-4 w-5/6 bg-muted/50" />
      </CardContent>
      <CardFooter className="p-4 pt-2 flex justify-between items-center">
         <Skeleton className="h-10 w-24 bg-muted/50 rounded-md" />
         <Skeleton className="h-8 w-8 bg-muted/50 rounded-full" />
      </CardFooter>
    </Card>
);

// Skeleton for Order Card
export const OrderCardSkeleton = () => (
    <Card className="overflow-hidden border bg-card/50 animate-pulse"> {/* Use card background */}
        <CardHeader className="bg-muted/30 p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                 <div>
                     <Skeleton className="h-6 w-36 mb-1.5 bg-muted/50" />
                     <Skeleton className="h-4 w-56 bg-muted/50" />
                 </div>
                 <Skeleton className="h-7 w-28 rounded-full mt-1 sm:mt-0 bg-muted/50" />
            </div>
        </CardHeader>
        <CardContent className="p-4 space-y-5">
             <div>
                 <Skeleton className="h-4 w-20 mb-2 bg-muted/50" /> {/* Items title */}
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-full bg-muted/50" />
                    <Skeleton className="h-4 w-5/6 bg-muted/50" />
                 </div>
                 <Skeleton className="h-5 w-24 mt-3 ml-auto bg-muted/50" /> {/* Total */}
             </div>
             <Separator />
            <div className="space-y-2">
                <Skeleton className="h-4 w-32 mb-2 bg-muted/50" /> {/* Tracking Status title */}
                <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full bg-muted/50" />
                    <Skeleton className="h-4 w-48 bg-muted/50" />
                </div>
                <Skeleton className="h-2 w-full rounded-full bg-muted/50" /> {/* Progress bar skeleton */}
            </div>
             <Separator />
             <div className="flex items-start gap-2">
                 <Skeleton className="h-4 w-4 mt-0.5 shrink-0 bg-muted/50" />
                 <Skeleton className="h-4 w-full bg-muted/50" />
             </div>
        </CardContent>
         <CardFooter className="bg-muted/30 p-4 flex justify-end gap-2">
            <Skeleton className="h-9 w-24 bg-muted/50" />
            <Skeleton className="h-9 w-32 bg-muted/50" />
         </CardFooter>
    </Card>
  );


// Skeleton for Driver Earnings Page
export const EarningsSkeleton = () => (
    <div className="space-y-8 animate-pulse">
        {/* Title Skeleton */}
        <Skeleton className="h-8 w-64 bg-muted/50" />
        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card><CardHeader><Skeleton className="h-5 w-24 bg-muted/50 mb-2" /><Skeleton className="h-7 w-32 bg-muted/50" /></CardHeader></Card>
            <Card><CardHeader><Skeleton className="h-5 w-24 bg-muted/50 mb-2" /><Skeleton className="h-7 w-32 bg-muted/50" /></CardHeader></Card>
            <Card><CardHeader><Skeleton className="h-5 w-24 bg-muted/50 mb-2" /><Skeleton className="h-7 w-32 bg-muted/50" /></CardHeader></Card>
        </div>
        {/* Filter Skeleton */}
         <div className="flex flex-col md:flex-row gap-4">
            <Skeleton className="h-10 w-full md:w-1/3 bg-muted/50"/>
             <Skeleton className="h-10 w-32 bg-muted/50"/>
        </div>
        {/* Chart Skeleton */}
        <Card>
            <CardHeader><Skeleton className="h-6 w-1/2 bg-muted/50" /></CardHeader>
            <CardContent><Skeleton className="h-64 w-full bg-muted/50" /></CardContent>
        </Card>
        {/* Table Skeleton */}
        <Card>
            <CardHeader><Skeleton className="h-6 w-1/3 bg-muted/50" /></CardHeader>
            <CardContent>
                <Skeleton className="h-10 w-full bg-muted/50 mb-2" /> {/* Header row */}
                <Skeleton className="h-12 w-full bg-muted/50 mb-1" />
                <Skeleton className="h-12 w-full bg-muted/50 mb-1" />
                <Skeleton className="h-12 w-full bg-muted/50" />
            </CardContent>
        </Card>
    </div>
);
