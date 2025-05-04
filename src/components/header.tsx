// src/components/header.tsx
'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, PackageSearch, LogIn, Menu, Package, Settings, Shield, Building, Truck, Bell } from 'lucide-react'; // Added Bell
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"; // Correct import
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Logo } from '@/components/Logo';

// Assume a cart state/hook exists (replace with actual implementation)
// import { useCart } from '@/hooks/useCart';
// Mock profile for conditional rendering examples (replace with actual auth logic)
const profile = { role: 'customer' }; // Change to 'customer', 'driver', 'store_owner', 'admin', or null as needed

export function Header() {
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
   const pathname = usePathname();
   const isAdminRoute = pathname.startsWith('/admin');
   const isDriverRoute = pathname.startsWith('/driver');
   const isStoreOwnerRoute = pathname.startsWith('/stores');

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
      { href: "/", label: "Browse", icon: PackageSearch },
      { href: "/orders", label: "My Orders", icon: Package },
      { href: "/stores", label: "My Stores", icon: Building }, // Link for users to manage their stores
      { href: "/driver/apply", label: "Drive", icon: Truck }, // Added Drive link
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
    let headerStyle = "customer-header"; // Default style

    if (isAdminRoute) {
        navItems = adminNavItems;
        logoLink = "/admin";
        accountLink = "/admin/settings"; // Link to admin settings
        logoText = "SDP Admin";
        headerStyle = "admin-header"; // Class for admin theme
    } else if (isDriverRoute) {
        navItems = driverNavItems;
        logoLink = "/driver/dashboard";
        accountLink = "/driver/profile";
        logoText = "SDP Driver";
        headerStyle = "driver-header"; // Class for driver theme
    } else if (isStoreOwnerRoute) {
        navItems = storeOwnerNavItems;
        logoLink = "/stores";
        accountLink = "/profile"; // Store owner uses main profile for now
        logoText = "SDP Stores";
        headerStyle = "store-owner-header"; // Class for store owner theme
    } else {
         navItems = customerNavItems;
         headerStyle = "customer-header";
    }


   const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    // Apply dynamic header style class
    <header className={cn("sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm", headerStyle)}>
      <div className="container flex h-16 items-center px-4 md:px-6">
        {/* Logo/Brand Name */}
         <div className="mr-4 md:mr-6 flex items-center">
             {/* Mobile Menu Trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                     {/* Use button variant that inherits color */}
                     <Button variant="ghost" size="icon" className="md:hidden mr-2 rounded-full text-foreground/80 hover:bg-accent/10 hover:text-accent-foreground">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                {/* Mobile Menu Content */}
                <SheetContent side="left" className={cn("w-[280px] sm:w-[320px] p-0 bg-background", headerStyle)}> {/* Apply theme class */}
                     <VisuallyHidden.Root asChild>
                         <SheetTitle>Main Navigation Menu</SheetTitle>
                     </VisuallyHidden.Root>
                    <SheetHeader className="p-4 border-b">
                         {/* Use themed logo */}
                        <SheetTitle className="flex items-center gap-2 text-xl">
                            <Logo className="h-7 w-auto text-primary"/>
                            <span className="font-bold">{logoText}</span>
                        </SheetTitle>
                    </SheetHeader>
                    {/* Mobile Navigation Links */}
                    <nav className="grid gap-2 p-4 text-base font-medium">
                        {navItems.map((item) => (
                           <Link
                            key={item.href}
                            href={item.href}
                            onClick={closeMobileMenu}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-3 transition-colors",
                                pathname === item.href
                                ? "bg-primary/10 text-primary font-semibold"
                                : "text-muted-foreground hover:bg-accent/10 hover:text-primary" // Use accent hover
                            )}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.label}
                            </Link>
                         ))}
                         {/* Account/Login Link */}
                         <Link
                            href={accountLink}
                            onClick={closeMobileMenu}
                             className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-3 transition-colors",
                                pathname.startsWith('/profile') || pathname.startsWith('/admin/settings') || pathname.startsWith('/driver/profile')
                                ? "bg-primary/10 text-primary font-semibold"
                                : "text-muted-foreground hover:bg-accent/10 hover:text-primary" // Use accent hover
                            )}
                         >
                            <User className="h-5 w-5"/>
                             {isAdminRoute ? 'Admin Settings' : (isDriverRoute ? 'My Profile' : (isStoreOwnerRoute ? 'My Profile' : 'Account'))}
                         </Link>
                         {/* Cart Link for Customer View */}
                         {(!isAdminRoute && !isDriverRoute && !isStoreOwnerRoute) && (
                             <Link
                                href="/cart" // Link to cart page
                                onClick={closeMobileMenu}
                                className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-3 transition-colors relative",
                                pathname === '/cart'
                                ? "bg-primary/10 text-primary font-semibold"
                                : "text-muted-foreground hover:bg-accent/10 hover:text-primary" // Use accent hover
                                )}
                            >
                                <ShoppingCart className="h-5 w-5"/>
                                Cart
                                {cartItemCount > 0 && (
                                    <Badge variant="destructive" className="absolute left-8 top-2 h-5 w-5 p-0 flex items-center justify-center text-[10px] rounded-full">
                                        {cartItemCount}
                                    </Badge>
                                )}
                            </Link>
                         )}
                          {/* Conditional Admin Link */}
                          {profile?.role === 'admin' && !isAdminRoute && (
                             <Link
                                href="/admin"
                                onClick={closeMobileMenu}
                                className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-3 text-muted-foreground hover:bg-accent/10 hover:text-primary"
                                )}
                             >
                                 <Shield className="h-5 w-5" />
                                 Admin Panel
                             </Link>
                         )}
                         {/* Logout Button */}
                         <Button
                            variant="ghost"
                            onClick={() => { /* Implement logout logic */ closeMobileMenu(); }}
                            className="flex items-center gap-3 rounded-lg px-3 py-3 text-destructive hover:bg-destructive/10 hover:text-destructive justify-start"
                        >
                            <LogIn className="h-5 w-5 transform rotate-180" /> Log Out
                         </Button>
                    </nav>
                </SheetContent>
            </Sheet>

            <Link href={logoLink} className="flex items-center space-x-2" onClick={closeMobileMenu}>
                 <Logo className="h-9 w-auto text-primary"/> {/* Use themed primary color */}
                <span className="font-bold text-xl hidden sm:inline-block text-foreground">{logoText}</span> {/* Use themed foreground */}
            </Link>
        </div>


        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-base font-medium flex-1 ml-6">
           {navItems.map((item) => (
               <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "transition-colors hover:text-primary relative after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300", // Underline animation
                  pathname === item.href ? "text-primary font-semibold after:w-full" : "text-muted-foreground" // Active state style
                )}
               >
                {item.label}
              </Link>
           ))}
            {/* Conditional Admin Link */}
            {profile?.role === 'admin' && !isAdminRoute && (
                <Link
                    href="/admin"
                     className={cn(
                        "transition-colors hover:text-primary relative after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300",
                        "text-muted-foreground" // Style as inactive for now
                    )}
                >
                    Admin Panel
                </Link>
            )}
        </nav>

         {/* Right side Actions (Cart, Login/Profile) */}
         <div className="flex items-center justify-end space-x-2 md:space-x-3 ml-auto">
            {/* Cart Button - Only for customer view */}
             {(!isAdminRoute && !isDriverRoute && !isStoreOwnerRoute) && (
                <Link href="/cart" passHref legacyBehavior>
                     <Button asChild variant="ghost" size="icon" className="relative rounded-full hover:bg-primary/10" aria-label={`Shopping Cart with ${cartItemCount} items`}>
                        <a> {/* Add anchor tag */}
                            <ShoppingCart className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                            {cartItemCount > 0 && (
                                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] rounded-full animate-pulse-badge" aria-hidden="true"> {/* Use pulse animation */}
                                    {cartItemCount}
                                </Badge>
                            )}
                        </a>
                     </Button>
                 </Link>
             )}

             {/* Login/Profile Button */}
              <Link href={accountLink} passHref legacyBehavior>
                 <Button asChild variant="outline" size="sm" className="rounded-full border-primary/40 hover:bg-primary/10 hover:border-primary/60">
                    <a> {/* Add anchor tag */}
                        <User className="h-4 w-4 md:mr-2" />
                        <span className="hidden md:inline">
                            {isAdminRoute ? 'Admin Settings' : (isDriverRoute ? 'My Profile' : (isStoreOwnerRoute ? 'My Profile' : 'Account'))}
                        </span>
                    </a>
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
