
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, PackageSearch, LogIn, Menu, Package, Settings, Shield, Building } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Logo } from '@/components/Logo'; // Import the new Logo component
// Assume a cart state/hook exists (replace with actual implementation)
// import { useCart } from '@/hooks/useCart';

export function Header() {
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
   const pathname = usePathname();
   const isAdminRoute = pathname.startsWith('/admin');
   const isDriverRoute = pathname.startsWith('/driver');
   const isStoreOwnerRoute = pathname.startsWith('/stores'); // Assuming /stores is the owner portal

   // TODO: Replace with actual cart count from state management
   // const { cartItemCount } = useCart(); // Example usage
    const [cartItemCount, setCartItemCount] = useState(3); // Placeholder cart count

    // Example effect to update count (remove if using actual cart hook)
    useEffect(() => {
        // Simulate cart changes
        const interval = setInterval(() => {
            //setCartItemCount(prev => (prev + 1) % 6); // Cycle count 0-5
        }, 5000);
        return () => clearInterval(interval);
    }, []);


   // Define different nav items based on route context
   const customerNavItems = [
      { href: "/", label: "Browse Stores", icon: PackageSearch },
      { href: "/orders", label: "My Orders", icon: Package },
      { href: "/stores", label: "Manage Stores", icon: Building }, // Added Manage Stores link for owners
      { href: "/profile", label: "Profile", icon: User },
   ];

   // Basic Admin links - sidebar is primary nav for admin
    const adminNavItems: typeof customerNavItems = []; // Admin header might not need these

    // Basic Driver links - sidebar is primary nav for driver
    const driverNavItems: typeof customerNavItems = []; // Driver header might not need these

    // Basic Store Owner links - sidebar is primary nav for store owner
    const storeOwnerNavItems: typeof customerNavItems = []; // Store owner header might not need these

   // Choose nav items based on route
    let navItems: typeof customerNavItems = [];
    let logoLink = "/";
    let accountLink = "/profile";
    let logoText = "SwiftDispatch";

    if (isAdminRoute) {
        navItems = adminNavItems;
        logoLink = "/admin";
        accountLink = "/admin/profile"; // Example admin profile link
        logoText = "SwiftDispatch Admin";
    } else if (isDriverRoute) {
        navItems = driverNavItems;
        logoLink = "/driver/dashboard";
        accountLink = "/driver/profile";
        logoText = "SwiftDispatch Driver";
    } else if (isStoreOwnerRoute) {
        navItems = storeOwnerNavItems;
        logoLink = "/stores";
        accountLink = "/profile"; // Store owner uses main profile for now
        logoText = "SwiftDispatch Stores";
    } else {
         navItems = customerNavItems;
    }


   const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 md:px-6"> {/* Adjusted padding */}
        {/* Logo/Brand Name */}
         <div className="mr-4 md:mr-6 flex items-center"> {/* Container for logo and mobile trigger */}
             {/* Mobile Menu Trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                     <Button variant="ghost" size="icon" className="md:hidden mr-2 rounded-full hover:bg-accent/50">
                        <Menu className="h-5 w-5 text-muted-foreground" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                {/* Mobile Menu Content */}
                <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0"> {/* Remove padding for full control */}
                    {/* Add accessible title */}
                    <VisuallyHidden asChild>
                        <SheetTitle>Main Navigation</SheetTitle>
                    </VisuallyHidden>
                    <SheetHeader className="p-4 mb-0 border-b"> {/* Adjust padding/margin */}
                        <SheetTitle className="flex items-center gap-2">
                            <Logo className="h-6 w-auto text-primary"/> {/* Use Logo */}
                            <span className="font-bold text-lg">{logoText}</span>
                        </SheetTitle>
                    </SheetHeader>
                    {/* Mobile Navigation Links */}
                    <nav className="grid gap-2 p-4 text-base font-medium">
                        {navItems.map((item) => ( // Show relevant links
                           <Link
                            key={item.href}
                            href={item.href}
                            onClick={closeMobileMenu}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                                pathname === item.href
                                ? "bg-primary/10 text-primary font-semibold"
                                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                            )}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.label}
                            </Link>
                         ))}
                         {/* Add conditional Login/Account link for mobile */}
                         {( !isDriverRoute && !isStoreOwnerRoute) && ( // Show Account for Customer/Admin
                            <Link
                                href={accountLink}
                                onClick={closeMobileMenu}
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                            >
                                <User className="h-5 w-5"/>
                                Account
                            </Link>
                         )}
                         {(!isAdminRoute && !isDriverRoute && !isStoreOwnerRoute) && ( // Only show Cart for customer view
                             <Link
                                href="/cart" // Link to cart page
                                onClick={closeMobileMenu}
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-accent/50 hover:text-foreground relative"
                            >
                                <ShoppingCart className="h-5 w-5"/>
                                Cart
                                {cartItemCount > 0 && (
                                    <Badge variant="destructive" className="absolute left-8 top-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] rounded-full">
                                        {cartItemCount}
                                    </Badge>
                                )}
                            </Link>
                         )}
                    </nav>
                </SheetContent>
            </Sheet>

            <Link href={logoLink} className="flex items-center space-x-2" onClick={closeMobileMenu}>
                 <Logo className="h-8 w-auto text-primary"/> {/* Use Logo */}
                <span className="font-bold text-lg hidden sm:inline-block">{logoText}</span>
            </Link>
        </div>


        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium flex-1 ml-6">
           {navItems.map((item) => (
               <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "transition-colors hover:text-primary",
                  pathname === item.href ? "text-primary font-semibold" : "text-muted-foreground"
                )}
               >
                {item.label}
              </Link>
           ))}
        </nav>

         {/* Right side Actions (Cart, Login/Profile) */}
         <div className="flex items-center justify-end space-x-2 md:space-x-3 ml-auto">
            {/* Cart Button - Only for customer view */}
             {(!isAdminRoute && !isDriverRoute && !isStoreOwnerRoute) && (
                <Link href="/cart" passHref>
                     <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-accent/50" aria-label={`Shopping Cart with ${cartItemCount} items`}> {/* Added ARIA Label */}
                        <ShoppingCart className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                        {cartItemCount > 0 && (
                            <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] rounded-full" aria-hidden="true"> {/* Hide badge from screen reader */}
                                {cartItemCount}
                            </Badge>
                        )}
                        {/* <span className="sr-only">Shopping Cart</span> - Removed in favor of aria-label */}
                     </Button>
                 </Link>
             )}

             {/* Login/Profile Button */}
              <Link href={accountLink} passHref>
                 <Button variant="outline" size="sm" className="rounded-full border-border" aria-label="Account options"> {/* Use outline and border */}
                    <User className="h-4 w-4 md:mr-2" />
                     <span className="hidden md:inline">
                        {isAdminRoute ? 'Admin' : (isDriverRoute ? 'Driver' : (isStoreOwnerRoute ? 'Owner' : 'Account'))}
                     </span>
                 </Button>
             </Link>
             {/* Example Login Button (use if no user logged in) */}
             {/* <Button variant="default" size="sm" className="rounded-full">
                <LogIn className="mr-2 h-4 w-4" /> Login
            </Button> */}
        </div>
      </div>
    </header>
  );
}
