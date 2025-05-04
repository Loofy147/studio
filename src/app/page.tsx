
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
import { Search, ArrowRight, Eye, Star, ShoppingBag, TrendingUp, Building, Filter, Truck as TruckIcon, XCircle } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { cn, formatCurrency } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LayoutAnimator } from "@/components/LayoutAnimator"; // Import Layout Animator

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
    return [...stores].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 3); // Show top 3
  }, [stores]);

  // Simplified StoreCard - uses SDP variables via globals.css context
  const StoreCard = ({ store, delay = 0 }: { store: Store, delay?: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay: delay * 0.05 }}
      className="h-full"
    >
      <Card className="flex flex-col overflow-hidden h-full transition-all duration-300 hover:shadow-xl border group bg-card">
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
          {/* Use Heading 2 size */}
          <div className="p-4 pb-2">
              <CardTitle className="text-2xl font-semibold group-hover:text-primary transition-colors truncate">{store.name}</CardTitle>
              {/* Use outline badge, color handled by CSS vars */}
              <Badge variant="outline" className="mt-1 capitalize text-[11px] tracking-wide border-accent/30 text-accent bg-accent/10 px-1.5 py-0.5">{store.category}</Badge>
          </div>
        </CardHeader>
        {/* Standard padding */}
        <CardContent className="flex-grow p-4 pt-0">
          <CardDescription className="text-sm line-clamp-3 text-muted-foreground">{store.description}</CardDescription>
        </CardContent>
        {/* Solid primary button */}
        <CardFooter className="p-4 pt-2 mt-auto">
          <Link href={`/store/${store.id}`} passHref legacyBehavior>
              <Button className="w-full group/button btn-text-uppercase-semibold" size="sm" variant="default">
                  <Eye className="mr-1.5 h-4 w-4" />
                  Visit Store
                  <ArrowRight className="ml-auto h-4 w-4 transition-transform duration-300 group-hover/button:translate-x-1" />
              </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );

  // Simplified ProductCard
  const ProductCard = ({ product, delay = 0 }: { product: Product, delay?: number }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2, delay: delay * 0.05 }}
      className="h-full"
    >
      <Card className="flex flex-col overflow-hidden h-full transition-all duration-300 hover:shadow-lg border hover:border-primary/20 hover:bg-card/95 group bg-card">
        <CardHeader className="p-0">
          <div className="relative w-full h-32 overflow-hidden rounded-t-md">
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
                <Link href={`/store/${product.storeId}`} className="absolute bottom-1 left-1 z-10">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-black/60 text-white border-none hover:bg-black/80 transition-colors">{product.storeName}</Badge>
                </Link>
             )}
          </div>
          {/* Use Heading 2 size */}
          <div className="p-3 pb-0">
            <CardTitle className="text-2xl font-semibold line-clamp-1 group-hover:text-primary transition-colors">{product.name}</CardTitle>
          </div>
        </CardHeader>
        {/* Use Heading 1/2 size, use Accent color for price */}
        <CardContent className="flex-grow p-3 pt-1">
          <p className="text-3xl font-bold text-accent">{formatCurrency(product.price)}</p>
        </CardContent>
        {/* Use solid primary button, uppercase text */}
        <CardFooter className="p-3 pt-0 mt-auto">
             <Button size="sm" variant="default" className="w-full group/button text-xs h-8 btn-text-uppercase-semibold">
                 View Details <ArrowRight className="ml-auto h-3 w-3 transition-transform duration-300 group-hover/button:translate-x-0.5" />
             </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );


  const StoreSkeleton = () => (
     <Card className="flex flex-col overflow-hidden border animate-pulse bg-card/50">
        <Skeleton className="h-40 w-full bg-muted/50" />
        <CardHeader className="p-4 pb-2">
            <Skeleton className="h-6 w-3/4 mb-1 bg-muted/50" />
            <Skeleton className="h-4 w-1/4 bg-muted/50" />
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-1">
            <Skeleton className="h-4 w-full bg-muted/50" />
            <Skeleton className="h-4 w-5/6 bg-muted/50" />
        </CardContent>
        <CardFooter className="p-4 pt-2">
            <Skeleton className="h-9 w-full bg-muted/50" />
        </CardFooter>
    </Card>
  )

   const ProductSkeleton = () => (
     <Card className="flex flex-col overflow-hidden border animate-pulse bg-card/50">
        <Skeleton className="h-32 w-full bg-muted/50 rounded-t-md" /> {/* Rounded top */}
        <CardHeader className="p-3 pb-0">
            <Skeleton className="h-6 w-3/4 mb-1 bg-muted/50" /> {/* Title skeleton adjusted */}
        </CardHeader>
        <CardContent className="p-3 pt-1">
             <Skeleton className="h-6 w-1/3 bg-muted/50" /> {/* Price skeleton adjusted */}
        </CardContent>
        <CardFooter className="p-3 pt-0">
            <Skeleton className="h-8 w-full bg-muted/50" />
        </CardFooter>
    </Card>
   )

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
         {/* Sidebar for Categories */}
         {/* Use default sidebar theme from globals.css */}
         <Sidebar side="left" collapsible="icon" variant="inset" className="bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
           <SidebarHeader className="p-2 border-b border-sidebar-border group-data-[collapsible=icon]:justify-center">
             <span className="font-semibold text-lg group-data-[collapsible=icon]:hidden">Categories</span>
             <span className="group-data-[collapsible=icon]:flex items-center justify-center hidden">
                <Filter className="h-5 w-5"/>
             </span>
           </SidebarHeader>
           <SidebarContent className="flex-1 overflow-y-auto">
             <SidebarMenu className="px-2 py-4">
               {isLoadingStores ? (
                   Array.from({ length: 5 }).map((_, index) => (
                       <SidebarMenuItem key={index} className="px-2 py-1">
                           <Skeleton className="h-5 w-full bg-muted/50" />
                       </SidebarMenuItem>
                   ))
               ) : (
                   categories.map(category => (
                       <SidebarMenuItem key={category}>
                            <SidebarMenuButton
                                isActive={selectedCategory === category}
                                onClick={() => setSelectedCategory(category as StoreCategory | "all")}
                                tooltip={category === "all" ? "All Categories" : category}
                                className="capitalize w-full justify-start text-sm data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
            {/* Main content area - Use 24px (p-6) or 32px (p-8) spacing, 32px (space-y-8) */}
            <LayoutAnimator> {/* Added Layout Animator */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">

                    {/* Hero/Welcome Section - Adjusted padding, colors, typography */}
                    <section className="text-center py-12 md:py-16 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10 rounded-xl shadow-sm border border-primary/10 relative overflow-hidden">
                        {/* Background shapes */}
                        <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full opacity-30 -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                        <div className="absolute bottom-0 right-0 w-48 h-48 bg-secondary/10 rounded-full opacity-30 translate-x-1/3 translate-y-1/3 blur-3xl"></div>

                      <motion.h1
                         initial={{ opacity: 0, y: -20 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ duration: 0.5 }}
                         className="text-4xl md:text-6xl font-extrabold tracking-tight text-primary mb-4 relative z-10" // Heading 1 size
                      >
                        Welcome to SwiftDispatch!
                     </motion.h1>
                      <motion.p
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ duration: 0.5, delay: 0.2 }}
                         className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto relative z-10" // Increased size
                     >
                        Discover local gems, find unique products, and get everything delivered swiftly to your door.
                      </motion.p>
                      <motion.div
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ duration: 0.5, delay: 0.4 }}
                         className="mt-8 relative w-full max-w-xl mx-auto z-10" // Increased max-width
                        >
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="Search stores, products, or categories..." // Updated placeholder
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-12 pr-4 py-3 text-base shadow-lg rounded-full border-primary/30 focus:ring-2 focus:ring-primary/50 focus:border-primary h-12" // Larger input
                        />
                      </motion.div>
                    </section>

                     {/* Error Display */}
                     {error && (
                        <Alert variant="destructive">
                            <XCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                     )}

                    {/* Best Selling Products Section - Adjusted spacing */}
                    <section className="space-y-6">
                      <h2 className="text-3xl font-bold flex items-center gap-2 border-b pb-4 text-foreground/90"> {/* Heading 2 size, adjusted padding */}
                        <TrendingUp className="text-secondary" /> Best Selling Products
                      </h2>
                      {isLoadingProducts ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6"> {/* Use 24px gap */}
                          {Array.from({ length: 6 }).map((_, index) => <ProductSkeleton key={index} />)}
                        </div>
                      ) : products.length > 0 ? (
                        <motion.div
                            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6" /* Use 24px gap */
                            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                            initial="hidden"
                            animate="visible"
                        >
                            <AnimatePresence>
                                {products.map((product, index) => (
                                <ProductCard key={product.id} product={product} delay={index} />
                                ))}
                            </AnimatePresence>
                        </motion.div>
                      ) : (
                        <p className="text-muted-foreground italic text-center py-4">No best selling products found at the moment.</p>
                      )}
                    </section>

                     {/* Become a Driver Section - Use primary color, animate */}
                      <motion.section
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ duration: 0.5, delay: 0.3 }}
                         className="bg-primary text-primary-foreground p-8 md:p-12 rounded-lg shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden" /* Use primary color */
                        >
                         {/* Subtle background pattern */}
                         <div className="absolute inset-0 opacity-10 bg-[url('/circuit-pattern.svg')] bg-repeat mix-blend-overlay"></div>
                        <motion.div
                            initial={{ x: -20 }}
                            animate={{ x: 0 }}
                            transition={{ delay: 0.5, type: 'spring', stiffness: 100 }}
                            className="flex-1 relative z-10 text-center md:text-left"
                        >
                            <h2 className="text-4xl font-bold mb-3 flex items-center justify-center md:justify-start gap-2"> {/* Heading 2 size */}
                                <TruckIcon className="h-8 w-8 animate-pulse"/> Become a SwiftDispatch Driver!
                            </h2>
                            <p className="text-lg opacity-90">
                                Earn extra income on your schedule. Deliver from local stores and be your own boss.
                            </p>
                        </motion.div>
                        <motion.div
                             initial={{ scale: 0.8, opacity: 0 }}
                             animate={{ scale: 1, opacity: 1 }}
                             transition={{ delay: 0.7, type: 'spring', stiffness: 120 }}
                        >
                            <Link href="/driver/apply" passHref legacyBehavior>
                                 {/* Use Secondary button for contrast */}
                                 <Button size="lg" variant="secondary" className="font-bold py-4 px-10 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative z-10 btn-text-uppercase-semibold">
                                   Start Earning Now <ArrowRight className="ml-2 h-5 w-5"/>
                                 </Button>
                            </Link>
                        </motion.div>
                     </motion.section>


                    <Separator className="my-10 border-border/50"/> {/* Use 40px margin */}

                    {/* Top Stores Section - Adjusted spacing */}
                    <section className="space-y-6">
                      <h2 className="text-3xl font-bold flex items-center gap-2 border-b pb-4 text-foreground/90"> {/* Heading 2 size, adjusted padding */}
                        <Building className="text-primary" /> Top Rated Stores
                      </h2>
                      {isLoadingStores ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Use 24px gap */}
                          {Array.from({ length: 3 }).map((_, index) => <StoreSkeleton key={index} />)}
                        </div>
                      ) : topStores.length > 0 ? (
                        <motion.div
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" /* Use 24px gap */
                            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
                            initial="hidden"
                            animate="visible"
                        >
                            <AnimatePresence>
                                {topStores.map((store, index) => (
                                <StoreCard key={store.id} store={store} delay={index} />
                                ))}
                            </AnimatePresence>
                        </motion.div>
                      ) : (
                         <p className="text-muted-foreground italic text-center py-4">No top rated stores available yet.</p>
                      )}
                    </section>

                    <Separator className="my-10 border-border/50"/> {/* Use 40px margin */}

                    {/* All Stores Section (Filtered) - Adjusted spacing */}
                    <section className="space-y-6">
                      <div className="flex justify-between items-center border-b pb-4 mb-6"> {/* Heading 2 size, adjusted padding */}
                        <h2 className="text-3xl font-bold">{selectedCategory === 'all' ? 'All Stores' : `Stores in ${selectedCategory}`}</h2>
                        <span className="text-sm text-muted-foreground">
                            {isLoadingStores ? 'Loading...' : `${filteredStores.length} store${filteredStores.length !== 1 ? 's' : ''} found`}
                        </span>
                      </div>

                      {isLoadingStores ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Use 24px gap */}
                          {Array.from({ length: 6 }).map((_, index) => <StoreSkeleton key={index} />)}
                        </div>
                      ) : error && !isLoadingStores ? ( // Show error only if not loading
                        <Card className="col-span-full bg-destructive/10 border-destructive">
                          <CardContent className="p-6 text-center text-destructive font-medium">{error}</CardContent>
                        </Card>
                      ) : filteredStores.length > 0 ? (
                        <motion.div
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" /* Use 24px gap */
                            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                            initial="hidden"
                            animate="visible"
                        >
                            <AnimatePresence>
                                {filteredStores.map((store, index) => (
                                <StoreCard key={store.id} store={store} delay={index}/>
                                ))}
                            </AnimatePresence>
                        </motion.div>
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
            </LayoutAnimator> {/* Added Layout Animator */}
         </SidebarInset>
      </div>
    </SidebarProvider>
  );
}