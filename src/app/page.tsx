"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getStores, Store, StoreCategory, Product, getProducts } from "@/services/store"; // Updated service import
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Link from "next/link";
import { Search, Filter, ArrowRight, Eye, Star, ShoppingBag, TrendingUp, Building } from 'lucide-react'; // Added new icons
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset } from "@/components/ui/sidebar"; // Import Sidebar components
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion"; // Import motion
import { cn } from "@/lib/utils";

// Helper to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export default function Home() {
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]); // State for best selling products
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
          getProducts({ limit: 8, sortBy: 'sales' }) // Fetch top 8 best-selling products
        ]);
        setStores(storeList);
        setProducts(productList);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Could not load stores or products. Please try again later.");
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
    }).sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)); // Sort by rating desc
  }, [stores, searchTerm, selectedCategory]);

  const categories = useMemo(() => {
    const uniqueCategories = new Set(stores.map(store => store.category));
    return ["all", ...Array.from(uniqueCategories).sort()] as (StoreCategory | "all")[];
  }, [stores]);

  const topStores = useMemo(() => {
     // Sort stores by rating and take top 4
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
      <Card className="flex flex-col overflow-hidden h-full transition-all duration-300 hover:shadow-lg border hover:border-primary/30 hover:bg-muted/20 group">
        <CardHeader className="p-0">
          <div className="relative w-full h-48 overflow-hidden">
            <Image
              src={store.imageUrl || `https://picsum.photos/seed/${store.id}/400/300`}
              alt={`${store.name} banner`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
              data-ai-hint={`${store.category} store`}
              priority={delay < 4} // Prioritize images in the first few cards
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
            {store.rating && (
               <Badge variant="secondary" className="absolute top-2 right-2 text-xs flex items-center gap-1 backdrop-blur-sm bg-black/40 text-white border-none px-2 py-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400"/> {store.rating.toFixed(1)}
               </Badge>
            )}
          </div>
          <div className="p-4 pb-2">
              <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors">{store.name}</CardTitle>
              <Badge variant="outline" className="mt-2 capitalize text-xs tracking-wide border-primary/30 text-primary/90">{store.category}</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-4 pt-0">
          <CardDescription className="text-sm line-clamp-3 text-muted-foreground">{store.description}</CardDescription>
        </CardContent>
        <CardFooter className="p-4 pt-2">
          <Link href={`/store/${store.id}`} passHref legacyBehavior>
              <Button className="w-full group/button" variant="default"> {/* Changed to default */}
                  <Eye className="mr-2 h-4 w-4" />
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
        <Card className="flex flex-col overflow-hidden h-full transition-all duration-300 hover:shadow-md border hover:border-accent/30 hover:bg-muted/20 group">
        <CardHeader className="p-0">
            <div className="relative w-full h-36 overflow-hidden"> {/* Smaller image */}
            <Image
                src={product.imageUrl || `https://picsum.photos/seed/${product.id}/300/200`}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw" // Adjust sizes
                className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105 bg-muted" // Add bg-muted as fallback
                data-ai-hint={`${product.category} product`}
                 priority={delay < 5}
            />
             {/* Optional: Link to store from product card */}
             {/* <Badge variant="secondary" className="absolute bottom-1 left-1 text-[10px] px-1.5 py-0.5 bg-black/50 text-white border-none">{product.storeName}</Badge> */}
            </div>
            <div className="p-3 pb-0">
            <CardTitle className="text-sm font-semibold line-clamp-1 group-hover:text-primary transition-colors">{product.name}</CardTitle>
            </div>
        </CardHeader>
        <CardContent className="flex-grow p-3 pt-1">
            {/* <CardDescription className="text-xs line-clamp-2 mb-1.5 text-muted-foreground">{product.description}</CardDescription> */}
            <p className="font-bold text-sm">{formatCurrency(product.price)}</p>
        </CardContent>
        <CardFooter className="p-3 pt-0 mt-auto">
            <Button size="sm" className="w-full group/button text-xs h-8" variant="outline"> {/* Use outline */}
                View Details
            </Button>
        </CardFooter>
        </Card>
    </motion.div>
  );


  const StoreSkeleton = () => (
     <Card className="flex flex-col overflow-hidden border animate-pulse">
        <Skeleton className="h-48 w-full bg-muted/50" />
        <CardHeader className="p-4 pb-2">
            <Skeleton className="h-6 w-3/4 mb-2 bg-muted/50" />
            <Skeleton className="h-4 w-1/4 bg-muted/50" />
        </CardHeader>
        <CardContent className="p-4 pt-0">
            <Skeleton className="h-4 w-full mb-2 bg-muted/50" />
            <Skeleton className="h-4 w-5/6 bg-muted/50" />
        </CardContent>
        <CardFooter className="p-4 pt-2">
            <Skeleton className="h-10 w-full bg-muted/50" />
        </CardFooter>
    </Card>
  )

   const ProductSkeleton = () => (
     <Card className="flex flex-col overflow-hidden border animate-pulse">
        <Skeleton className="h-36 w-full bg-muted/50" />
        <CardHeader className="p-3 pb-0">
            <Skeleton className="h-5 w-3/4 mb-1 bg-muted/50" />
        </CardHeader>
        <CardContent className="p-3 pt-1">
             <Skeleton className="h-5 w-1/4 bg-muted/50" />
        </CardContent>
        <CardFooter className="p-3 pt-0">
            <Skeleton className="h-8 w-full bg-muted/50" />
        </CardFooter>
    </Card>
   )

  return (
    <SidebarProvider>
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Sidebar for Categories */}
        <Sidebar collapsible="icon" side="left" variant="inset" className="md:border-r">
          <SidebarHeader>
            <h2 className="text-lg font-semibold text-sidebar-foreground px-2">Categories</h2>
          </SidebarHeader>
           <Separator className="mb-2 bg-sidebar-border" />
          <SidebarContent>
            <SidebarMenu>
              {categories.map(category => (
                <SidebarMenuItem key={category}>
                  <SidebarMenuButton
                     onClick={() => setSelectedCategory(category)}
                     isActive={selectedCategory === category}
                     tooltip={category === "all" ? "All Categories" : category}
                     className="capitalize"
                     variant="ghost" // Use ghost variant for subtle look
                  >
                    {category === "all" ? "All Categories" : category}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
             {/* Placeholder for daily order signup */}
             <div className="p-4 mt-auto border-t border-sidebar-border group-data-[collapsible=icon]:hidden">
                <h3 className="text-sm font-medium mb-2">Daily Orders</h3>
                <p className="text-xs text-sidebar-foreground/80 mb-3">Sign up for recurring daily deliveries.</p>
                <Button size="sm" className="w-full text-xs">Sign Up</Button>
            </div>
          </SidebarContent>
        </Sidebar>

        {/* Main Content Area */}
        <SidebarInset>
          <div className="p-6 space-y-12">
            {/* Header and Search */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight text-primary">Welcome to the Marketplace!</h1>
                <div className="relative w-full md:w-1/2 lg:w-1/3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search stores..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full shadow-sm" // Add subtle shadow
                    />
                </div>
            </div>

             {/* Best Selling Products Section */}
             <section className="space-y-6">
                <h2 className="text-2xl font-semibold flex items-center gap-2"><TrendingUp className="text-accent" /> Best Selling Products</h2>
                {isLoadingProducts ? (
                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {Array.from({ length: 6 }).map((_, index) => <ProductSkeleton key={index} />)}
                     </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                         <AnimatePresence>
                             {products.map((product, index) => (
                                <ProductCard key={product.id} product={product} delay={index} />
                             ))}
                         </AnimatePresence>
                    </div>
                ) : (
                    <p className="text-muted-foreground">No best selling products found.</p>
                )}
             </section>

             <Separator />

             {/* Top Stores Section */}
             <section className="space-y-6">
                <h2 className="text-2xl font-semibold flex items-center gap-2"><Building className="text-primary" /> Top Rated Stores</h2>
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
                    <p className="text-muted-foreground">No top stores found.</p>
                 )}
             </section>

            <Separator />

            {/* All Stores Section (Filtered) */}
            <section className="space-y-6">
               <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold">{selectedCategory === 'all' ? 'All Stores' : `Stores in ${selectedCategory}`}</h2>
                    {/* Optional: Add sorting dropdown here */}
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
                <Card className="col-span-full border-dashed border-muted-foreground/50">
                    <CardContent className="p-10 text-center text-muted-foreground">
                        <p className="text-lg font-medium">No stores found</p>
                        <p className="text-sm mt-1">Try adjusting your search or filters.</p>
                         <Button variant="link" onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }} className="mt-4 text-primary">
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
