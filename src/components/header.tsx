"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, PackageSearch, LogIn, Menu, Package } from 'lucide-react'; // Added Package icon
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"; // Added more Sheet components
import { useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge"; // Import Badge for cart count

export function Header() {
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
   const pathname = usePathname();

   // TODO: Replace with actual cart count from state management
   const cartItemCount = 3; // Placeholder cart count

   const navItems = [
      { href: "/", label: "Stores", icon: PackageSearch },
      { href: "/orders", label: "My Orders", icon: Package }, // Changed icon to Package
      { href: "/profile", label: "Profile", icon: User },
      // Add more links as needed
   ];

   const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center"> {/* Increased height slightly */}
        {/* Logo/Brand Name */}
        <Link href="/" className="mr-6 flex items-center space-x-2" onClick={closeMobileMenu}>
           {/* Updated Logo Placeholder */}
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.51a2 2 0 0 1 1-1.72l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>
          <span className="font-bold text-lg sm:inline-block">Marketplace</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium flex-1 ml-6">
           {navItems.map((item) => (
               <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "transition-colors hover:text-primary", // Use primary for hover
                  pathname === item.href ? "text-primary font-semibold" : "text-muted-foreground" // Use muted-foreground for inactive
                )}
               >
                {item.label}
              </Link>
           ))}
        </nav>

         <div className="flex items-center justify-end space-x-2 md:space-x-4 ml-auto"> {/* Added ml-auto */}
            {/* Cart Button - Placeholder */}
             <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-accent/50"> {/* Rounded button */}
                <ShoppingCart className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                 {cartItemCount > 0 && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] rounded-full">
                        {cartItemCount}
                    </Badge>
                 )}
                <span className="sr-only">Shopping Cart</span>
             </Button>

             {/* Login/Profile Button - Placeholder */}
             <Link href="/profile" passHref legacyBehavior>
                 <Button variant="secondary" size="sm" className="rounded-full"> {/* Rounded button */}
                    <User className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">Account</span>
                 </Button>
             </Link>
             {/* <Button variant="default" size="sm" className="rounded-full">
                <LogIn className="mr-2 h-4 w-4" /> Login
            </Button> */}


            {/* Mobile Menu Trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                     <Button variant="ghost" size="icon" className="md:hidden rounded-full hover:bg-accent/50">
                        <Menu className="h-5 w-5 text-muted-foreground" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] sm:w-[320px]"> {/* Adjust width */}
                    <SheetHeader className="mb-6 border-b pb-4">
                        <SheetTitle className="flex items-center gap-2">
                             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary">
                                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.51a2 2 0 0 1 1-1.72l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            <span className="font-bold text-xl">Marketplace</span>
                        </SheetTitle>
                        {/* Optional: Add description or subtitle here */}
                        {/* <SheetDescription>Your shopping companion</SheetDescription> */}
                    </SheetHeader>
                    <nav className="grid gap-3 text-base font-medium">
                        {navItems.map((item) => (
                           <Link
                            key={item.href}
                            href={item.href}
                            onClick={closeMobileMenu}
                            className={cn(
                                "flex items-center gap-4 rounded-lg px-3 py-2 transition-colors",
                                pathname === item.href
                                ? "bg-primary/10 text-primary font-semibold" // Active state with subtle background
                                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground" // Inactive state
                            )}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.label}
                            </Link>
                         ))}
                    </nav>
                     {/* Add Mobile Specific Actions (Cart, Account) if needed */}
                     {/* <div className="mt-auto pt-6 border-t"> ... </div> */}
                </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  );
}
