
"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getStores, Store, StoreCategory } from "@/services/store"; // Updated service import
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Link from "next/link";
import { Search, Store as StoreIcon } from 'lucide-react';

export default function Home() {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<StoreCategory | "all">("all");

  useEffect(() => {
    const fetchStores = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const storeList = await getStores();
        setStores(storeList);
      } catch (err) {
        console.error("Failed to fetch stores:", err);
        setError("Could not load stores. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStores();
  }, []);

  const filteredStores = useMemo(() => {
    return stores.filter(store => {
      const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            store.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || store.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [stores, searchTerm, selectedCategory]);

  const categories = useMemo(() => {
    const uniqueCategories = new Set(stores.map(store => store.category));
    return ["all", ...Array.from(uniqueCategories)] as (StoreCategory | "all")[];
  }, [stores]);

  const StoreCard = ({ store }: { store: Store }) => (
    <Card className="flex flex-col overflow-hidden h-full transform transition-transform duration-300 hover:scale-105 hover:shadow-lg">
      <CardHeader className="p-0">
        <div className="relative w-full h-48">
          <Image
            src={store.imageUrl || `https://picsum.photos/seed/${store.id}/400/300`}
            alt={`${store.name} banner`}
            layout="fill"
            objectFit="cover"
             data-ai-hint={`${store.category} store`}
          />
        </div>
         <div className="p-4">
             <CardTitle className="text-lg">{store.name}</CardTitle>
             <Badge variant="secondary" className="mt-1 capitalize">{store.category}</Badge>
         </div>
      </CardHeader>
      <CardContent className="flex-grow p-4 pt-0">
        <CardDescription className="text-sm line-clamp-3">{store.description}</CardDescription>
      </CardContent>
      <CardFooter className="p-4 pt-0">
         <Link href={`/store/${store.id}`} passHref legacyBehavior>
            <Button className="w-full">
                Visit Store <StoreIcon className="ml-2 h-4 w-4" />
            </Button>
         </Link>
      </CardFooter>
    </Card>
  );

  const StoreSkeleton = () => (
     <Card className="flex flex-col overflow-hidden">
        <Skeleton className="h-48 w-full" />
        <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/4 mt-1" />
        </CardHeader>
        <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6" />
        </CardContent>
        <CardFooter>
            <Skeleton className="h-10 w-full" />
        </CardFooter>
    </Card>
  )

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Explore Stores</h1>

      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search stores by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
           value={selectedCategory}
           onValueChange={(value: StoreCategory | "all") => setSelectedCategory(value)}
         >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
             {categories.map(category => (
               <SelectItem key={category} value={category} className="capitalize">
                 {category === "all" ? "All Categories" : category}
               </SelectItem>
             ))}
          </SelectContent>
        </Select>
      </div>

      {/* Store Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
             <StoreSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <p className="text-destructive text-center">{error}</p>
      ) : filteredStores.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStores.map(store => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground mt-10">No stores found matching your criteria.</p>
      )}
    </div>
  );
}
