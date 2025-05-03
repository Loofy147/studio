"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, PackageSearch, LogIn, Menu, Package, Settings, Shield } from 'lucide-react'; // Added admin icons
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function Header() {
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
   const pathname = usePathname();
   const isAdminRoute = pathname.startsWith('/admin');

   // TODO: Replace with actual cart count from state management
   const cartItemCount = 3; // Placeholder cart count

   // Define different nav items based on route context
   const customerNavItems = [
      { href: "/", label: "Stores", icon: PackageSearch },
      { href: "/orders", label: "My Orders", icon: Package },
      { href: "/profile", label: "Profile", icon: User },
   ];

   // Basic Admin links - consider moving to Admin Layout's sidebar
    const adminNavItems = [
      { href: "/admin", label: "Dashboard", icon: Settings }, // Example admin link
      { href: "/admin/settings", label: "App Settings", icon: Shield }, // Example admin link
   ];

   // Choose nav items based on route
   const navItems = isAdminRoute ? [] : customerNavItems; // Admin header might not need main nav

   const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 md:px-6"> {/* Adjusted padding */}
        {/* Logo/Brand Name */}
         <div className="mr-4 md:mr-6 flex items-center"> {/* Container for logo and mobile trigger */}
             {/* Mobile Menu Trigger (Moved near logo for common pattern) */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                     <Button variant="ghost" size="icon" className="md:hidden mr-2 rounded-full hover:bg-accent/50">
                        <Menu className="h-5 w-5 text-muted-foreground" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                {/* Mobile Menu Content */}
                <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0"> {/* Remove padding for full control */}
                    <SheetHeader className="p-4 mb-0 border-b"> {/* Adjust padding/margin */}
                        <SheetTitle className="flex items-center gap-2">
                             {/* Re-use logo SVG */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary">
                                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.51a2 2 0 0 1 1-1.72l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            <span className="font-bold text-lg">SwiftDispatch</span>
                        </SheetTitle>
                    </SheetHeader>
                    {/* Mobile Navigation Links */}
                    <nav className="grid gap-2 p-4 text-base font-medium">
                        {(isAdminRoute ? adminNavItems : customerNavItems).map((item) => ( // Show relevant links
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
                         {!isAdminRoute && (
                            <Link
                                href="/profile" // Or /login if not authenticated
                                onClick={closeMobileMenu}
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                            >
                                <User className="h-5 w-5"/>
                                Account
                            </Link>
                         )}
                         {!isAdminRoute && (
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

            <Link href={isAdminRoute ? "/admin" : "/"} className="flex items-center space-x-2" onClick={closeMobileMenu}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.51a2 2 0 0 1 1-1.72l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <span className="font-bold text-lg hidden sm:inline-block">SwiftDispatch{isAdminRoute ? ' Admin' : ''}</span>
            </Link>
        </div>


        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium flex-1 ml-6">
           {navItems.map((item) => ( // Only shows customer items or empty for admin
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
            {/* Cart Button - Placeholder (Only for customer view) */}
             {!isAdminRoute && (
                 <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-accent/50">
                    <ShoppingCart className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                    {cartItemCount > 0 && (
                        <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] rounded-full">
                            {cartItemCount}
                        </Badge>
                    )}
                    <span className="sr-only">Shopping Cart</span>
                 </Button>
             )}

             {/* Login/Profile Button - Placeholder */}
              <Link href={isAdminRoute ? "/admin/profile" : "/profile"} passHref legacyBehavior> {/* Adjust link for admin */}
                 <Button variant="outline" size="sm" className="rounded-full border-border"> {/* Use outline and border */}
                    <User className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">{isAdminRoute ? 'Admin' : 'Account'}</span>
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
```