
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
import { Search, ArrowRight, Eye, Star, ShoppingBag, TrendingUp, Building, Filter, Truck as TruckIcon } from 'lucide-react'; // Added TruckIcon
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset } from "@/components/ui/sidebar"; // Import Sidebar components
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion"; // Import motion
import { cn, formatCurrency } from "@/lib/utils"; // Import cn and formatCurrency
// Removed Header import as it's in the root layout

// Helper to generate theme class based on store category
const getThemeClass = (category: Store['category'] | undefined): string => {
   if (!category) return '';
   // Replace spaces with hyphens for CSS class compatibility
   const formattedCategory = category.replace(/\s+/g, '-');
   return `theme-category-${formattedCategory}`;
}


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

  const StoreCard = ({ store, delay = 0 }: { store: Store, delay?: number }) => {
    const themeClass = getThemeClass(store?.category);
    return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay: delay * 0.05 }}
      className="h-full"
    >
      <Card className={cn("flex flex-col overflow-hidden h-full transition-all duration-300 hover:shadow-lg border hover:border-[hsl(var(--store-accent))] group bg-card", themeClass)}>
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            {store.rating && (
               <Badge variant="secondary" className="absolute top-2 right-2 text-xs flex items-center gap-1 backdrop-blur-sm bg-black/50 text-white border-none px-2 py-1 rounded-full shadow">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400"/> {store.rating.toFixed(1)}
               </Badge>
            )}
          </div>
          <div className="p-4 pb-2">
              <CardTitle className="text-lg font-semibold group-hover:text-[hsl(var(--store-accent))] transition-colors truncate">{store.name}</CardTitle>
              <Badge variant="outline" className="mt-1 capitalize text-[10px] tracking-wide border-[hsl(var(--store-accent))] text-[hsl(var(--store-accent))] bg-[hsl(var(--store-accent))]/10 px-1.5 py-0.5">{store.category}</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-4 pt-0">
          <CardDescription className="text-sm line-clamp-2 text-muted-foreground">{store.description}</CardDescription>
        </CardContent>
        <CardFooter className="p-4 pt-2 bg-muted/30">
          <Link href={`/store/${store.id}`} passHref legacyBehavior>
              <Button className="w-full group/button bg-[hsl(var(--store-accent))] text-[hsl(var(--store-accent-foreground))] hover:bg-[hsl(var(--store-accent))] hover:opacity-90 shadow hover:shadow-md transition-all" size="sm" style={{ '--store-accent': 'hsl(var(--store-accent))', '--store-accent-foreground': 'hsl(var(--store-accent-foreground))' } as React.CSSProperties}>
                  <Eye className="mr-1.5 h-4 w-4" />
                  Visit Store
                  <ArrowRight className="ml-auto h-4 w-4 transition-transform duration-300 group-hover/button:translate-x-1" />
              </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
    )
  };


  const ProductCard = ({ product, delay = 0 }: { product: Product, delay?: number }) => {
    const themeClass = getThemeClass(stores.find(s => s.id === product.storeId)?.category);
    return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2, delay: delay * 0.05 }}
      className="h-full"
    >
      <Card className={cn("flex flex-col overflow-hidden h-full transition-all duration-300 hover:shadow-md border hover:border-[hsl(var(--store-accent))] hover:bg-card/95 group", themeClass)}>
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
            <CardTitle className="text-sm font-semibold line-clamp-1 group-hover:text-[hsl(var(--store-accent))] transition-colors">{product.name}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-3 pt-1">
          <p className="font-bold text-base text-[hsl(var(--store-accent))]">{formatCurrency(product.price)}</p>
        </CardContent>
        <CardFooter className="p-3 pt-0 mt-auto bg-muted/30">
            {/* Link to product page or add to cart */}
             <Button size="sm" className="w-full group/button text-xs h-8" variant="outline">
                 View Details
             </Button>
        </CardFooter>
      </Card>
    </motion.div>
    )
  };


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
    <SidebarProvider>
      <div className="flex min-h-screen">
         {/* Sidebar for Categories */}
         <Sidebar side="left" collapsible="icon" variant="inset" className="bg-[--sidebar-background] text-[--sidebar-foreground] border-r border-[--sidebar-border]">
           <SidebarHeader className="p-2 border-b border-[--sidebar-border] group-data-[collapsible=icon]:justify-center">
             <span className="font-semibold text-lg group-data-[collapsible=icon]:hidden">Categories</span>
             <span className="group-data-[collapsible=icon]:flex items-center justify-center hidden">
                <Filter className="h-5 w-5"/>
             </span>
           </SidebarHeader>
           <SidebarContent className="flex-1 overflow-y-auto">
             <SidebarMenu className="px-2 py-4">
               {isLoadingStores ? (
                   // Show skeletons while loading categories
                   Array.from({ length: 5 }).map((_, index) => (
                       <SidebarMenuItem key={index} className="px-2 py-1">
                           <Skeleton className="h-5 w-full" />
                       </SidebarMenuItem>
                   ))
               ) : (
                   categories.map(category => (
                       <SidebarMenuItem key={category}>
                            <SidebarMenuButton
                                isActive={selectedCategory === category}
                                onClick={() => setSelectedCategory(category as StoreCategory | "all")}
                                tooltip={category === "all" ? "All Categories" : category}
                                className="capitalize w-full justify-start text-sm data-[active=true]:bg-[--sidebar-accent] data-[active=true]:text-[--sidebar-accent-foreground] hover:bg-[--sidebar-accent] hover:text-[--sidebar-accent-foreground]"
                                variant="ghost"
                            >
                                {/* Optional: Add category icons */}
                                <span className="group-data-[collapsible=icon]:hidden">{category === "all" ? "All Categories" : category}</span>
                                {category === "all" && <span className="group-data-[collapsible=icon]:flex hidden">A</span>}
                                {category !== "all" && <span className="group-data-[collapsible=icon]:flex hidden">{category.slice(0,1).toUpperCase()}</span>}
                            </SidebarMenuButton>
                       </SidebarMenuItem>
                   ))
               )}
             </SidebarMenu>
           </SidebarContent>
         </Sidebar>

         <SidebarInset className="flex-1 flex flex-col">
            {/* Main content area */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-10">

                {/* Hero/Welcome Section */}
                <section className="text-center py-10 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl shadow-sm border border-primary/10">
                  <motion.h1
                     initial={{ opacity: 0, y: -20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.5 }}
                     className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-primary mb-3"
                  >
                    Welcome to SwiftDispatch!
                 </motion.h1>
                  <motion.p
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.5, delay: 0.2 }}
                     className="mt-2 text-base md:text-lg text-muted-foreground max-w-xl mx-auto px-4"
                 >
                    Discover local stores, find unique products, and get everything delivered swiftly.
                  </motion.p>
                  <motion.div
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.5, delay: 0.4 }}
                     className="mt-8 relative w-full max-w-md mx-auto px-4"
                    >
                    <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search for stores..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 pr-4 py-3 text-base shadow-md rounded-full border-primary/30 focus:ring-primary/50"
                    />
                  </motion.div>
                </section>


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

                 {/* Become a Driver Section */}
                 <section className="bg-gradient-to-r from-blue-500 to-teal-500 text-white p-8 rounded-lg shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
                            <TruckIcon className="h-8 w-8"/> Become a SwiftDispatch Driver!
                        </h2>
                        <p className="text-lg opacity-90">
                            Earn extra income on your schedule. Deliver from local stores and be your own boss.
                        </p>
                    </div>
                    <Link href="/driver/apply" passHref>
                         <Button size="lg" variant="secondary" className="bg-white text-teal-600 hover:bg-gray-100 font-bold py-3 px-8 text-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                           Start Earning Now <ArrowRight className="ml-2 h-5 w-5"/>
                         </Button>
                    </Link>
                 </section>


                <Separator />

                {/* Top Stores Section */}
                <section className="space-y-6">
                  <h2 className="text-2xl font-semibold flex items-center gap-2 border-b pb-2">
                    <Building className="text-primary" /> Top Rated Stores
                  </h2>
                  {isLoadingStores ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {Array.from({ length: 3 }).map((_, index) => <StoreSkeleton key={index} />)}
                    </div>
                  ) : topStores.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {Array.from({ length: 6 }).map((_, index) => <StoreSkeleton key={index} />)}
                    </div>
                  ) : error ? (
                    <Card className="col-span-full bg-destructive/10 border-destructive">
                      <CardContent className="p-6 text-center text-destructive font-medium">{error}</CardContent>
                    </Card>
                  ) : filteredStores.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
         </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
