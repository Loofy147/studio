// src/components/header.tsx:219:17
'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, PackageSearch, LogIn, Menu, Package, Settings, Shield, Building, Truck } from 'lucide-react'; // Added Truck
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Logo } from '@/components/Logo'; // Import the new Logo component
// Assume a cart state/hook exists (replace with actual implementation)
// import { useCart } from '@/hooks/useCart';

function defaultHeader() {
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
      { href: "/stores", label: "My Stores", icon: Building }, // Changed from "Manage Stores"
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

    if (isAdminRoute) {
        navItems = adminNavItems;
        logoLink = "/admin";
        accountLink = "/admin/profile"; // Example admin profile link
        logoText = "SDP Admin";
    } else if (isDriverRoute) {
        navItems = driverNavItems;
        logoLink = "/driver/dashboard";
        accountLink = "/driver/profile";
        logoText = "SDP Driver";
    } else if (isStoreOwnerRoute) {
        navItems = storeOwnerNavItems;
        logoLink = "/stores";
        accountLink = "/profile"; // Store owner uses main profile for now
        logoText = "SDP Stores";
    } else {
         navItems = customerNavItems;
    }


   const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm"> {/* Added subtle shadow */}
      <div className="container flex h-16 items-center px-4 md:px-6"> {/* Adjusted padding */}
        {/* Logo/Brand Name */}
         <div className="mr-4 md:mr-6 flex items-center"> {/* Container for logo and mobile trigger */}
             {/* Mobile Menu Trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                     <Button variant="ghost" size="icon" className="md:hidden mr-2 rounded-full hover:bg-primary/10"> {/* Themed hover */}
                        <Menu className="h-5 w-5 text-muted-foreground" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                {/* Mobile Menu Content */}
                <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0 bg-background"> {/* Explicit background */}
                    <SheetHeader className="p-4 border-b border-border/60"> {/* Themed border */}
                        <SheetTitle className="flex items-center gap-2">
                            <Logo className="h-7 w-auto text-primary"/> {/* Use Logo */}
                            <span className="font-bold text-xl">{logoText}</span> {/* Larger title */}
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
                                "flex items-center gap-3 rounded-lg px-3 py-3 transition-colors", // Increased padding
                                pathname === item.href
                                ? "bg-primary/10 text-primary font-semibold" // Clearer active state
                                : "text-muted-foreground hover:bg-primary/5 hover:text-primary" // Themed hover
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
                                className="flex items-center gap-3 rounded-lg px-3 py-3 text-muted-foreground hover:bg-primary/5 hover:text-primary" // Themed hover
                            >
                                <User className="h-5 w-5"/>
                                Account
                            </Link>
                         )}
                         {(!isAdminRoute && !isDriverRoute && !isStoreOwnerRoute) && ( // Only show Cart for customer view
                             <Link
                                href="/cart" // Link to cart page
                                onClick={closeMobileMenu}
                                className="flex items-center gap-3 rounded-lg px-3 py-3 text-muted-foreground hover:bg-primary/5 hover:text-primary relative" // Themed hover
                            >
                                <ShoppingCart className="h-5 w-5"/>
                                Cart
                                {cartItemCount > 0 && (
                                    <Badge variant="destructive" className="absolute left-8 top-2 h-5 w-5 p-0 flex items-center justify-center text-[10px] rounded-full"> {/* Adjusted position */}
                                        {cartItemCount}
                                    </Badge>
                                )}
                            </Link>
                         )}
                    </nav>
                </SheetContent>
            </Sheet>

            <Link href={logoLink} className="flex items-center space-x-2" onClick={closeMobileMenu}>
                 <Logo className="h-9 w-auto text-primary"/> {/* Slightly larger Logo */}
                <span className="font-bold text-xl hidden sm:inline-block">{logoText}</span> {/* Larger text */}
            </Link>
        </div>


        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-base font-medium flex-1 ml-6"> {/* Increased base font size */}
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
        </nav>

         {/* Right side Actions (Cart, Login/Profile) */}
         <div className="flex items-center justify-end space-x-2 md:space-x-3 ml-auto">
            {/* Cart Button - Only for customer view */}
             {(!isAdminRoute && !isDriverRoute && !isStoreOwnerRoute) && (
                <Link href="/cart" passHref>
                     <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-primary/10" aria-label={`Shopping Cart with ${cartItemCount} items`}> {/* Themed hover */}
                        <ShoppingCart className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                        {cartItemCount > 0 && (
                            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] rounded-full animate-pulse" aria-hidden="true"> {/* Pulse animation */}
                                {cartItemCount}
                            </Badge>
                        )}
                     </Button>
                 </Link>
             )}

             {/* Login/Profile Button */}
              <Link href={accountLink} passHref>
                 <Button variant="outline" size="sm" className="rounded-full border-primary/40 hover:bg-primary/5 hover:border-primary/60"> {/* Themed outline */}
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
  )
}

Header=defaultHeader;

function _c1({className,side="right",...props}){
  const SheetContent =Sheet["SheetContent"];
  const X =lucideReact["X"];
  const SheetPrimitive =radixUiReactDialog;
  return SheetPrimitive.Content({ref:null,className:"cn(sheetVariants({ side }), className)",...props,children:[React.createElement(SheetPrimitive.Close,{className:"absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary"},React.createElement(X,{className:"h-4 w-4"}),React.createElement("span",{className:"sr-only"},"Close"))]})
}



//# sourceMappingURL=header.module.css.map
