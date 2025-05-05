
"use client";

import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Store, StoreCategory, Product, getStores, getProducts } from "@/services/store";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ArrowRight, Eye, TrendingUp, Building, Truck as TruckIcon, Filter as FilterIcon, XCircle, ShoppingBag, Tag } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset } from "@/components/ui/sidebar"; // Import Sidebar components
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { cn, debounce } from "@/lib/utils"; // Import debounce
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LayoutAnimator } from "@/components/LayoutAnimator"; // Import LayoutAnimator
import { StoreCard } from "@/components/StoreCard"; // Import StoreCard
import { ProductCard } from "@/components/ProductCard"; // Import ProductCard
import { HeroSection } from "@/components/HeroSection"; // Import HeroSection
import { CategorySidebar } from "@/components/CategorySidebar"; // Import CategorySidebar
import { SearchFilterBar } from "@/components/SearchFilterBar"; // Import SearchFilterBar
import { StoreList } from "@/components/StoreList"; // Import StoreList
import { ProductList } from "@/components/ProductList"; // Import ProductList
import { Button } from "@/components/ui/button"; // Import Button
import Link from "next/link"; // Import Link


export default function HomePage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingStores, setIsLoadingStores] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(""); // State for debounced search term
  const [selectedCategory, setSelectedCategory] = useState<StoreCategory | "all">("all");

   // Debounce search input
  const debounceSearch = useCallback(debounce((value: string) => {
    setDebouncedSearchTerm(value);
  }, 300), []); // 300ms delay

  useEffect(() => {
    debounceSearch(searchTerm);
  }, [searchTerm, debounceSearch]);

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

  // Filter stores based on debounced search term and category
  const filteredStores = useMemo(() => {
    return stores.filter(store => {
      const matchesSearch = store.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                            store.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || store.category === selectedCategory;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  }, [stores, debouncedSearchTerm, selectedCategory]);

  const categories = useMemo(() => {
    const uniqueCategories = new Set(stores.map(store => store.category));
    return ["all", ...Array.from(uniqueCategories).sort()] as (StoreCategory | "all")[];
  }, [stores]);

  const topStores = useMemo(() => {
    return [...stores].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 3); // Show top 3
  }, [stores]);


  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
         <CategorySidebar
             categories={categories}
             selectedCategory={selectedCategory}
             onSelectCategory={setSelectedCategory}
             isLoading={isLoadingStores}
         />

         <SidebarInset className="flex-1 flex flex-col">
            {/* Use p-6/p-8 spacing, space-y-12 */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-12">

                <HeroSection searchTerm={searchTerm} onSearchChange={setSearchTerm} />

                 {error && (
                    <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                 )}

                {/* Best Selling Products Section - Use H2, space-y-6 */}
                <section className="space-y-6">
                  <h2 className="h2 flex items-center gap-2 border-b pb-3 text-foreground/90">
                    <TrendingUp className="text-secondary" /> Best Selling Products
                  </h2>
                   <ProductList products={products} isLoading={isLoadingProducts} skeletonCount={6} />
                </section>

                 {/* Become a Driver Section */}
                 <motion.section
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true, amount: 0.3 }}
                     transition={{ duration: 0.5, delay: 0.1 }}
                     className="bg-primary text-primary-foreground p-8 md:p-12 rounded-lg shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden" // Increased gap
                    >
                     <div className="absolute inset-0 opacity-5 bg-[url('/circuit-pattern.svg')] bg-repeat mix-blend-overlay"></div>
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
                        className="flex-1 relative z-10 text-center md:text-left"
                    >
                        <h2 className="h2 font-bold mb-3 flex items-center justify-center md:justify-start gap-2">
                            <TruckIcon className="h-8 w-8 animate-spin-wheel" style={{ animationDuration: '2s' }}/>
                            Become a SwiftDispatch Driver!
                        </h2>
                        <p className="text-lg opacity-90">
                            Earn extra income on your schedule. Deliver from local stores and be your own boss.
                        </p>
                    </motion.div>
                    <motion.div
                         initial={{ scale: 0.8, opacity: 0 }}
                          whileInView={{ scale: 1, opacity: 1 }}
                         viewport={{ once: true }}
                         transition={{ delay: 0.4, type: 'spring', stiffness: 120 }}
                    >
                        <Link href="/driver/apply" passHref>
                             <Button size="lg" variant="secondary" className="btn-text-uppercase-semibold py-4 px-10 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative z-10" withRipple>
                               Start Earning Now <ArrowRight className="ml-2 h-5 w-5"/>
                             </Button>
                        </Link>
                    </motion.div>
                 </motion.section>


                <Separator className="my-12 border-border/50"/>

                {/* Top Stores Section */}
                <section className="space-y-6">
                  <h2 className="h2 flex items-center gap-2 border-b pb-3 text-foreground/90">
                    <Building className="text-primary" /> Top Rated Stores
                  </h2>
                  <StoreList stores={topStores} isLoading={isLoadingStores} skeletonCount={3} gridCols="lg:grid-cols-3" />
                </section>

                <Separator className="my-12 border-border/50"/>

                {/* All Stores Section (Filtered) */}
                <section className="space-y-6">
                  <SearchFilterBar
                      title={selectedCategory === 'all' ? 'All Stores' : `Stores in ${selectedCategory}`}
                      isLoading={isLoadingStores}
                      storeCount={filteredStores.length}
                      searchTerm={searchTerm}
                      onSearchChange={setSearchTerm}
                      selectedCategory={selectedCategory}
                      categories={categories}
                      onSelectCategory={setSelectedCategory}
                      onClearFilters={() => { setSearchTerm(''); setSelectedCategory('all'); }}
                  />
                  <StoreList
                      stores={filteredStores}
                      isLoading={isLoadingStores}
                      skeletonCount={8}
                      gridCols="lg:grid-cols-3 xl:grid-cols-4"
                      searchTerm={debouncedSearchTerm} // Use debounced term for filtering display
                      selectedCategory={selectedCategory}
                  />
                </section>
            </div>
         </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
