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
import { Search, Store as StoreIcon, Filter, ArrowRight, Eye } from 'lucide-react'; // Added Eye icon

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
    <Card className="flex flex-col overflow-hidden h-full transition-all duration-300 hover:shadow-lg border hover:border-primary/30 hover:bg-muted/20 group">
      <CardHeader className="p-0">
        <div className="relative w-full h-48 overflow-hidden">
          <Image
            src={store.imageUrl || `https://picsum.photos/seed/${store.id}/400/300`}
            alt={`${store.name} banner`}
            fill // Use fill instead of layout
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" // Add sizes prop
            className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105" // Use className for object-fit and add hover effect
            data-ai-hint={`${store.category} store`}
          />
           <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" /> {/* Subtle gradient overlay */}
        </div>
         <div className="p-4 pb-2">
             <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors">{store.name}</CardTitle>
             <Badge variant="secondary" className="mt-2 capitalize text-xs tracking-wide">{store.category}</Badge>
         </div>
      </CardHeader>
      <CardContent className="flex-grow p-4 pt-0">
        <CardDescription className="text-sm line-clamp-3 text-muted-foreground">{store.description}</CardDescription>
      </CardContent>
      <CardFooter className="p-4 pt-2">
         <Link href={`/store/${store.id}`} passHref legacyBehavior>
            <Button className="w-full group/button" variant="outline">
                <Eye className="mr-2 h-4 w-4" /> {/* Replaced ArrowRight with Eye */}
                Visit Store
                <ArrowRight className="ml-auto h-4 w-4 transition-transform duration-300 group-hover/button:translate-x-1" /> {/* Kept arrow for visual cue */}
            </Button>
         </Link>
      </CardFooter>
    </Card>
  );

  const StoreSkeleton = () => (
     <Card className="flex flex-col overflow-hidden border"> {/* Added subtle border to skeleton */}
        <Skeleton className="h-48 w-full bg-muted-foreground/10" /> {/* Slightly darker skeleton */}
        <CardHeader className="p-4 pb-2">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/4" />
        </CardHeader>
        <CardContent className="p-4 pt-0">
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6" />
        </CardContent>
        <CardFooter className="p-4 pt-2">
            <Skeleton className="h-10 w-full" />
        </CardFooter>
    </Card>
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Explore Stores</h1>
         {/* Search and Filter Controls moved next to title on larger screens */}
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                type="text"
                placeholder="Search stores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full" // Ensure input takes full width on mobile
            />
            </div>
            <Select
            value={selectedCategory}
            onValueChange={(value: StoreCategory | "all") => setSelectedCategory(value)}
            >
            <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
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
      </div>


      {/* Store Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
             <StoreSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <Card className="col-span-full bg-destructive/10 border-destructive">
            <CardContent className="p-6 text-center text-destructive font-medium">
                 {error}
            </CardContent>
        </Card>
      ) : filteredStores.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStores.map(store => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      ) : (
         <Card className="col-span-full">
            <CardContent className="p-10 text-center text-muted-foreground">
                <p className="text-lg">No stores found matching your criteria.</p>
                <p className="text-sm mt-2">Try adjusting your search or filter.</p>
                <Button variant="link" onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }} className="mt-4">
                    Clear Filters
                </Button>
            </CardContent>
         </Card>
      )}
    </div>
  );
}
