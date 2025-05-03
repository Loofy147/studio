"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getStores, Store, StoreCategory, Product, getProducts } from "@/services/store";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Link from "next/link";
import { Search, ArrowRight, Eye, Star, ShoppingBag, TrendingUp, Building, Filter } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { cn, formatCurrency } from "@/lib/utils"; // Import cn and formatCurrency
import { Header } from "@/components/header"; // Import Header for customer view


export default function HomePage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingStores, setIsLoadingStores] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<StoreCategory | "all">("all");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingStores(true);
      setIsLoadingProducts(true);
      setError(null);
      try {
        const [storeList, productList] = await Promise.all([
          getStores(),
          getProducts({ limit: 6, sortBy: 'sales' }) // Fetch top 6 best-selling products
        ]);
        setStores(storeList);
        setProducts(productList);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Could not load marketplace data. Please try again later.");
      } finally {
        setIsLoadingStores(false);
        setIsLoadingProducts(false);
      }
    };

    fetchData();
  }, []);

  const filteredStores = useMemo(() => {
    return stores.filter(store => {
      const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            store.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || store.category === selectedCategory;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  }, [stores, searchTerm, selectedCategory]);

  const categories = useMemo(() => {
    const uniqueCategories = new Set(stores.map(store => store.category));
    return ["all", ...Array.from(uniqueCategories).sort()] as (StoreCategory | "all")[];
  }, [stores]);

  const topStores = useMemo(() => {
    return [...stores].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 4);
  }, [stores]);

  const StoreCard = ({ store, delay = 0 }: { store: Store, delay?: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay: delay * 0.05 }}
      className="h-full"
    >
      <Card className="flex flex-col overflow-hidden h-full transition-all duration-300 hover:shadow-lg border hover:border-primary/30 hover:bg-card/95 group">
        <CardHeader className="p-0">
          <div className="relative w-full h-40 overflow-hidden">
            <Image
              src={store.imageUrl || `https://picsum.photos/seed/${store.id}/400/240`}
              alt={`${store.name} banner`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
              data-ai-hint={`${store.category} store`}
              priority={delay < 4}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
            {store.rating && (
               <Badge variant="secondary" className="absolute top-2 right-2 text-xs flex items-center gap-1 backdrop-blur-sm bg-black/50 text-white border-none px-2 py-1 rounded-full">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400"/> {store.rating.toFixed(1)}
               </Badge>
            )}
          </div>
          <div className="p-4 pb-2">
              <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors truncate">{store.name}</CardTitle>
              <Badge variant="outline" className="mt-1 capitalize text-[10px] tracking-wide border-primary/30 text-primary/90 bg-primary/5 px-1.5 py-0.5">{store.category}</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-4 pt-0">
          <CardDescription className="text-sm line-clamp-2 text-muted-foreground">{store.description}</CardDescription>
        </CardContent>
        <CardFooter className="p-4 pt-2 bg-muted/30">
          <Link href={`/store/${store.id}`} passHref legacyBehavior>
              <Button className="w-full group/button" size="sm">
                  <Eye className="mr-1.5 h-4 w-4" />
                  Visit Store
                  <ArrowRight className="ml-auto h-4 w-4 transition-transform duration-300 group-hover/button:translate-x-1" />
              </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );

  const ProductCard = ({ product, delay = 0 }: { product: Product, delay?: number }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2, delay: delay * 0.05 }}
      className="h-full"
    >
      <Card className="flex flex-col overflow-hidden h-full transition-all duration-300 hover:shadow-md border hover:border-accent/30 hover:bg-card/95 group">
        <CardHeader className="p-0">
          <div className="relative w-full h-32 overflow-hidden">
            <Image
              src={product.imageUrl || `https://picsum.photos/seed/${product.id}/300/200`}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105 bg-muted"
              data-ai-hint={`${product.category} product`}
              priority={delay < 6}
            />
             {product.storeName && (
                <Link href={`/store/${product.storeId}`} className="absolute bottom-1 left-1">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-black/60 text-white border-none hover:bg-black/80 transition-colors">{product.storeName}</Badge>
                </Link>
             )}
          </div>
          <div className="p-3 pb-0">
            <CardTitle className="text-sm font-semibold line-clamp-1 group-hover:text-primary transition-colors">{product.name}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-3 pt-1">
          <p className="font-bold text-base text-primary">{formatCurrency(product.price)}</p>
        </CardContent>
        <CardFooter className="p-3 pt-0 mt-auto bg-muted/30">
            {/* Link to product page or add to cart */}
             <Button size="sm" className="w-full group/button text-xs h-8" variant="outline">
                 View Details
             </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );


  const StoreSkeleton = () => (
     <Card className="flex flex-col overflow-hidden border animate-pulse">
        <Skeleton className="h-40 w-full bg-muted/50" />
        <CardHeader className="p-4 pb-2">
            <Skeleton className="h-6 w-3/4 mb-1 bg-muted/50" />
            <Skeleton className="h-4 w-1/4 bg-muted/50" />
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-1">
            <Skeleton className="h-4 w-full bg-muted/50" />
            <Skeleton className="h-4 w-5/6 bg-muted/50" />
        </CardContent>
        <CardFooter className="p-4 pt-2 bg-muted/30">
            <Skeleton className="h-9 w-full bg-muted/50" />
        </CardFooter>
    </Card>
  )

   const ProductSkeleton = () => (
     <Card className="flex flex-col overflow-hidden border animate-pulse">
        <Skeleton className="h-32 w-full bg-muted/50" />
        <CardHeader className="p-3 pb-0">
            <Skeleton className="h-5 w-3/4 mb-1 bg-muted/50" />
        </CardHeader>
        <CardContent className="p-3 pt-1">
             <Skeleton className="h-5 w-1/4 bg-muted/50" />
        </CardContent>
        <CardFooter className="p-3 pt-0 bg-muted/30">
            <Skeleton className="h-8 w-full bg-muted/50" />
        </CardFooter>
    </Card>
   )

  return (
    <>
      <Header /> {/* Customer facing header */}
      <div className="container mx-auto px-4 py-8 space-y-12"> {/* Added container and spacing */}

        {/* Hero/Welcome Section - Optional */}
        {/* <section className="text-center py-12 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
          <h1 className="text-4xl font-bold tracking-tight text-primary">Welcome to SwiftDispatch Marketplace!</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover local stores, find unique products, and get everything delivered swiftly.
          </p>
          <div className="mt-8 relative w-full max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for stores or products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 text-base shadow-md rounded-full"
            />
          </div>
        </section> */}

        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row items-center gap-4 p-4 bg-card border rounded-lg shadow-sm">
            <div className="relative flex-grow w-full md:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search stores..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                />
            </div>
            <div className="w-full md:w-auto md:min-w-[200px]">
                <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as StoreCategory | "all")}>
                    <SelectTrigger className="w-full">
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


        {/* Best Selling Products Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2 border-b pb-2">
            <TrendingUp className="text-accent" /> Best Selling Products
          </h2>
          {isLoadingProducts ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, index) => <ProductSkeleton key={index} />)}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              <AnimatePresence>
                {products.map((product, index) => (
                  <ProductCard key={product.id} product={product} delay={index} />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <p className="text-muted-foreground italic">No best selling products found at the moment.</p>
          )}
        </section>

        <Separator />

        {/* Top Stores Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2 border-b pb-2">
            <Building className="text-primary" /> Top Rated Stores
          </h2>
          {isLoadingStores ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, index) => <StoreSkeleton key={index} />)}
            </div>
          ) : topStores.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <AnimatePresence>
                {topStores.map((store, index) => (
                  <StoreCard key={store.id} store={store} delay={index} />
                ))}
              </AnimatePresence>
            </div>
          ) : (
             <p className="text-muted-foreground italic">No top rated stores available yet.</p>
          )}
        </section>

        <Separator />

        {/* All Stores Section (Filtered) */}
        <section className="space-y-6">
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="text-2xl font-semibold">{selectedCategory === 'all' ? 'All Stores' : `Stores in ${selectedCategory}`}</h2>
            <span className="text-sm text-muted-foreground">
                {isLoadingStores ? 'Loading...' : `${filteredStores.length} store${filteredStores.length !== 1 ? 's' : ''} found`}
            </span>
          </div>

          {isLoadingStores ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => <StoreSkeleton key={index} />)}
            </div>
          ) : error ? (
            <Card className="col-span-full bg-destructive/10 border-destructive">
              <CardContent className="p-6 text-center text-destructive font-medium">{error}</CardContent>
            </Card>
          ) : filteredStores.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {filteredStores.map((store, index) => (
                  <StoreCard key={store.id} store={store} delay={index}/>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <Card className="col-span-full border-dashed border-muted-foreground/30 bg-card/50">
              <CardContent className="p-10 text-center text-muted-foreground">
                  <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50"/>
                <p className="text-lg font-medium">No stores found matching your criteria.</p>
                <p className="text-sm mt-1">Try adjusting your search or selected category.</p>
                <Button variant="link" onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }} className="mt-4 text-primary h-auto p-0">
                  Clear Search & Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
      {/* Footer can be added here if it's part of the main customer layout */}
        <footer className="py-6 mt-12 border-t bg-muted/50">
            <div className="container mx-auto text-center text-sm text-muted-foreground">
                © {new Date().getFullYear()} SwiftDispatch Marketplace. All rights reserved.
            </div>
        </footer>
    </>
  );
}
