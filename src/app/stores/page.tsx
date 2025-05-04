
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { NewStoreForm } from "@/components/NewStoreForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getStores, Store } from "@/services/store"; // Assuming a way to get stores by owner
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, Building, ArrowRight, Edit, Star, XCircle } from 'lucide-react'; // Added XCircle
import Image from 'next/image';
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion'; // Import motion
import { cn } from '@/lib/utils'; // Import cn

export default function StoreManagementPage() {
  const [userStores, setUserStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Initialize with null
  const [showNewStoreForm, setShowNewStoreForm] = useState(false);
  const { toast } = useToast();

  // In a real app, you'd get the userId from authentication context
  const userId = "user123"; // Hardcoded for demonstration

  useEffect(() => {
    const fetchUserStores = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Simulate fetching stores owned by the current user
        // In a real backend, this would filter by ownerId
        const allStores = await getStores();
        // Ensure ownerId exists before filtering
        const ownedStores = allStores.filter(store => store.ownerId && store.ownerId === userId);
        setUserStores(ownedStores);
      } catch (err: any) { // Explicitly type error
        console.error("Failed to fetch user stores:", err);
        setError(err.message || "Could not load your stores. Please try again later."); // Set specific error message
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserStores();
  }, [userId]);

  const handleStoreCreated = (newStore: Store) => {
    setUserStores(prevStores => [...prevStores, newStore]);
    setShowNewStoreForm(false);
    toast({
      title: "Store Created Successfully!",
      description: `${newStore.name} is now ready to be managed.`,
      variant: "default", // Use accent (orange) for success?
    });
  };

   const StoreCardSkeleton = () => (
     <Card className="animate-pulse border bg-card/50"> {/* Use card background */}
        {/* Use p-4 */}
       <CardHeader className="p-0">
         <Skeleton className="h-48 w-full bg-muted/50" />
         {/* Use p-4 pb-2 */}
         <div className="p-4 pb-2 space-y-2">
            <Skeleton className="h-6 w-3/4 bg-muted/50" />
            <Skeleton className="h-4 w-1/4 bg-muted/50" />
         </div>
       </CardHeader>
        {/* Use p-4 pt-0 */}
       <CardContent className="p-4 pt-0">
         <Skeleton className="h-4 w-full mb-1 bg-muted/50" />
         <Skeleton className="h-4 w-5/6 bg-muted/50" />
       </CardContent>
        {/* Use p-4 pt-2 */}
       <CardFooter className="p-4 pt-0">
         <Skeleton className="h-10 w-full bg-muted/50 rounded-md" />
       </CardFooter>
     </Card>
   );

   // Animation variants
   const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1 // Stagger card appearance
      }
    }
  };
   const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0 }
  };
  const formVariants = {
    hidden: { opacity: 0, height: 0, marginTop: 0, marginBottom: 0, padding: 0, border: 0 },
    visible: { opacity: 1, height: 'auto', marginTop: '2rem', marginBottom: '2rem', padding: '1.5rem', border: '1px solid hsl(var(--store-owner-border))', transition: { duration: 0.3, ease: "easeInOut" } }, // Use themed border
     exit: { opacity: 0, height: 0, marginTop: 0, marginBottom: 0, padding: 0, border: 0, transition: { duration: 0.2, ease: "easeInOut" } }
  };


  return (
     // Use space-y-10
    <div className="container mx-auto py-10 space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6 border-[var(--store-owner-border)]">
         {/* Use H1 */}
        <h1 className="h1 flex items-center gap-2 text-[var(--store-owner-foreground)]">
          <Building className="h-8 w-8 text-[var(--store-owner-primary)]" /> Manage Your Stores
        </h1>
        <Button onClick={() => setShowNewStoreForm(!showNewStoreForm)} variant={showNewStoreForm ? "secondary" : "default"} size="lg" className="bg-[var(--store-owner-primary)] text-[var(--store-owner-primary-foreground)] hover:bg-[var(--store-owner-primary)]/90" withRipple>
          <PlusCircle className="mr-2 h-5 w-5" />
          {showNewStoreForm ? 'Cancel Creation' : 'Create New Store'}
        </Button>
      </div>

      <AnimatePresence>
        {showNewStoreForm && (
          <motion.div
              key="new-store-form"
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="rounded-lg overflow-hidden"
           >
              <Card className="border-[var(--store-owner-border)] bg-[var(--store-owner-card)] shadow-md">
                  <CardHeader>
                      {/* Use H2 */}
                      <CardTitle className="h2 text-[var(--store-owner-primary)]">Create a New Store</CardTitle>
                      {/* Use Body 2 */}
                      <CardDescription className="text-body2 text-[var(--store-owner-card-foreground)]/80">Fill in the details for your new marketplace storefront.</CardDescription>
                  </CardHeader>
                <CardContent>
                  <NewStoreForm onStoreCreated={handleStoreCreated} userId={userId}/>
                </CardContent>
              </Card>
           </motion.div>
        )}
      </AnimatePresence>


       {error && (
           <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Error Loading Stores</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
           </Alert>
       )}

      <div>
         {/* Use H2 */}
        <h2 className="h2 mb-6 text-[var(--store-owner-foreground)]/90">Your Stores ({userStores.length})</h2>
        {isLoading ? (
           <motion.div
               className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
               variants={containerVariants}
               initial="hidden"
               animate="visible"
           >
             <StoreCardSkeleton />
             <StoreCardSkeleton />
             <StoreCardSkeleton />
           </motion.div>
        ) : userStores.length > 0 ? (
          <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
          >
            {userStores.map((store) => (
             <motion.div key={store.id} variants={itemVariants} layout>
                 {/* Use p-4 */}
                <Card className="flex flex-col overflow-hidden h-full transition-all duration-300 hover:shadow-xl border hover:border-[var(--store-owner-primary)]/40 group bg-[var(--store-owner-card)] p-0">
                    <CardHeader className="p-0">
                        <div className="relative w-full h-48 overflow-hidden">
                        <Image
                            src={store.imageUrl || `https://picsum.photos/seed/${store.id}/400/300`}
                            alt={`${store.name} banner`}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105 bg-muted"
                            data-ai-hint={`${store.category} store`}
                        />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                            {/* Store Status Badge - Use Caption */}
                            <Badge
                                variant={store.isActive ? (store.isOpen ? 'secondary' : 'outline') : 'destructive'}
                                className={cn(
                                    "absolute top-2 left-2 caption font-medium px-2 py-0.5 rounded-full shadow",
                                    store.isActive && store.isOpen && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-700/50",
                                    store.isActive && !store.isOpen && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700",
                                    !store.isActive && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-700"
                                )}
                                >
                                {store.isActive ? (store.isOpen ? 'Open' : 'Closed') : 'Disabled'}
                            </Badge>

                            {store.rating && (
                                 /* Use Caption */
                                <Badge variant="secondary" className="absolute top-2 right-2 caption flex items-center gap-1 backdrop-blur-sm bg-black/40 text-white border-none px-2 py-1 rounded-full">
                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400"/> {store.rating.toFixed(1)}
                                </Badge>
                            )}
                        </div>
                         {/* Use p-4 pb-2 */}
                        <div className="p-4 pb-2">
                             {/* Use H2 */}
                            <CardTitle className="h2 group-hover:text-[var(--store-owner-primary)] transition-colors text-[var(--store-owner-card-foreground)]">{store.name}</CardTitle>
                             {/* Use Caption */}
                            <Badge variant="outline" className="mt-2 capitalize caption tracking-wide border-[var(--store-owner-primary)]/30 text-[var(--store-owner-primary)]/90 bg-[var(--store-owner-primary)]/5">{store.category}</Badge>
                        </div>
                    </CardHeader>
                     {/* Use p-4 pt-0 */}
                    <CardContent className="flex-grow p-4 pt-0">
                         {/* Use Body 2 */}
                        <CardDescription className="text-body2 line-clamp-3 text-[var(--store-owner-card-foreground)]/70">{store.description}</CardDescription>
                    </CardContent>
                     {/* Use p-4 pt-0 */}
                    <CardFooter className="p-4 pt-0 mt-auto">
                    <Link href={`/store/${store.id}/manage`} passHref legacyBehavior>
                         {/* Use Primary Button */}
                        <Button className="w-full group/button bg-[var(--store-owner-primary)] text-[var(--store-owner-primary-foreground)] hover:bg-[var(--store-owner-primary)]/90" size="lg" withRipple>
                            <Edit className="mr-2 h-4 w-4" />
                            Manage Store
                            <ArrowRight className="ml-auto h-4 w-4 transition-transform duration-300 group-hover/button:translate-x-1" />
                        </Button>
                    </Link>
                    </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : !isLoading && !error ? ( // Ensure we only show this if not loading and no errors
          <Card className="border-dashed border-[var(--store-owner-border)]/50 bg-[var(--store-owner-card)]/50">
             {/* Use p-4 */}
             <CardContent className="p-10 text-center text-[var(--store-owner-card-foreground)]/70">
                 <Building className="h-12 w-12 mx-auto mb-4 text-[var(--store-owner-card-foreground)]/30"/>
                 {/* Use text-lg */}
                <p className="text-lg font-medium">You haven't created any stores yet.</p>
                 {/* Use Body 2 */}
                <p className="text-body2 mt-1">Click the "Create New Store" button above to get started!</p>
             </CardContent>
          </Card>
        ) : null }
      </div>
    </div>
  );
}

