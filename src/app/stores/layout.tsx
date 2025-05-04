// src/app/stores/layout.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Package, CalendarClock, Ticket, Settings, LogOut, Building, ArrowLeft, BarChart } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Logo } from '@/components/Logo'; // Import the new Logo component
import { Button } from '@/components/ui/button';

// Store Owner specific navigation items
const storeOwnerNavItems = [
  { href: "/stores", label: "Overview", icon: LayoutDashboard },
  // Link to manage a specific store (will be dynamic later)
  // For now, just placeholders or link back to the list
  { href: "/stores", label: "Products", icon: Package }, // Potential duplicate href
  { href: "/stores", label: "Orders", icon: Package }, // Potential duplicate href, Reuse Package icon for orders
  { href: "/stores", label: "Subscriptions", icon: CalendarClock }, // Potential duplicate href
  { href: "/stores", label: "Promotions", icon: Ticket }, // Potential duplicate href
  { href: "/stores", label: "Analytics", icon: BarChart }, // Potential duplicate href
  { href: "/stores/settings", label: "Store Settings", icon: Settings },
];

export default function StoreOwnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Mock store owner info (replace with actual data)
  const ownerName = "Store Owner";
  const ownerEmail = "owner@example.com";

  // Determine if we are on the main /stores page or a manage/[storeId] page
  const isOnManagePage = pathname.includes('/manage/');
  const storeIdMatch = pathname.match(/\/stores\/([^/]+)\/manage/);
  const currentManagingStoreId = storeIdMatch ? storeIdMatch[1] : null;

  // Define navigation items specifically for the store management view
  const manageStoreNavItems = currentManagingStoreId ? [
      { href: `/stores/${currentManagingStoreId}/manage#details`, label: "Store Details", icon: Settings },
      { href: `/stores/${currentManagingStoreId}/manage#products`, label: "Products", icon: Package },
      { href: `/stores/${currentManagingStoreId}/manage#offers`, label: "Offers", icon: CalendarClock },
      { href: `/stores/${currentManagingStoreId}/manage#promotions`, label: "Promotions", icon: Ticket },
      // Add more manage-specific links as needed
  ] : [];


  return (
     <SidebarProvider>
      {/* Apply store-owner-layout class for scoping theme variables */}
      <div className={cn("flex min-h-screen", "store-owner-layout")}>
        {/* Store Owner Sidebar */}
        {/* Use store-owner theme for sidebar */}
        <Sidebar collapsible="icon" side="left" variant="sidebar" className={cn("bg-sidebar text-sidebar-foreground border-r border-sidebar-border", "store-owner-sidebar")}>
          <SidebarHeader className="p-2 border-b border-sidebar-border">
             <div className="flex items-center justify-between p-2">
                 <Link href="/stores" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
                      {/* Use themed logo */}
                     <Logo className="h-7 w-auto text-sidebar-primary" />
                     <span className="font-bold text-lg group-data-[collapsible=icon]:hidden text-sidebar-foreground">Your Stores</span>
                 </Link>
             </div>
             {/* Store Owner Avatar/Info */}
              <div className="flex items-center gap-3 p-2 border-t border-sidebar-border mt-2 group-data-[collapsible=icon]:hidden">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={`https://avatar.vercel.sh/${ownerEmail}?size=36`} alt={ownerName} />
                        <AvatarFallback>{ownerName.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-medium text-sidebar-foreground">{ownerName}</p>
                        <p className="text-xs text-sidebar-foreground/70">{ownerEmail}</p>
                    </div>
              </div>
              <div className="flex justify-center p-2 border-t border-sidebar-border mt-2 group-data-[collapsible=icon]:flex hidden">
                  <Avatar className="h-8 w-8">
                       <AvatarImage src={`https://avatar.vercel.sh/${ownerEmail}?size=32`} alt={ownerName} />
                       <AvatarFallback>{ownerName.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                   </Avatar>
              </div>
          </SidebarHeader>
          <SidebarContent className="flex-1 overflow-y-auto">
             {/* Conditionally render different nav based on page */}
             {isOnManagePage ? (
                 <SidebarMenu className="px-2 py-4">
                     {/* Back Button */}
                     <SidebarMenuItem>
                          <Link href="/stores" passHref legacyBehavior>
                             <SidebarMenuButton
                                asChild
                                tooltip="Back to Stores List"
                                 // Use themed styles
                                className="focus:bg-sidebar-accent focus:text-sidebar-accent-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground"
                                variant="ghost"
                              >
                                <a>
                                    <ArrowLeft className="h-4 w-4" />
                                    <span className="group-data-[collapsible=icon]:hidden">Back to Stores</span>
                                </a>
                             </SidebarMenuButton>
                         </Link>
                     </SidebarMenuItem>
                      {/* Manage-specific links */}
                      {manageStoreNavItems.map((item, index) => (
                          <SidebarMenuItem key={`${item.href}-${index}`}>
                             <Link href={item.href} passHref legacyBehavior>
                                 <SidebarMenuButton
                                     asChild
                                     tooltip={item.label}
                                      // Use themed styles
                                     className="focus:bg-sidebar-accent focus:text-sidebar-accent-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground"
                                     // Simple active check based on hash for now
                                     isActive={typeof window !== 'undefined' && window.location.hash === item.href.split('#')[1]}
                                     variant="ghost"
                                    >
                                    <a>
                                        <item.icon className="h-4 w-4"/>
                                        <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                                    </a>
                                 </SidebarMenuButton>
                             </Link>
                         </SidebarMenuItem>
                      ))}
                 </SidebarMenu>
             ) : (
                 <SidebarMenu className="px-2 py-4">
                    {storeOwnerNavItems.map((item, index) => (
                        // Use index in key to prevent duplicate key error if hrefs are the same
                        <SidebarMenuItem key={`${item.href}-${index}`}>
                        <Link href={item.href} passHref legacyBehavior>
                            <SidebarMenuButton
                            asChild
                            isActive={pathname === item.href} // Simple active check for this layout
                            tooltip={item.label}
                            // Use themed styles
                            className="capitalize focus:bg-sidebar-accent focus:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground"
                            variant="ghost"
                            >
                            <a>
                                <item.icon className="h-4 w-4" />
                                <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                            </a>
                            </SidebarMenuButton>
                        </Link>
                        </SidebarMenuItem>
                    ))}
                 </SidebarMenu>
             )}
          </SidebarContent>
           <SidebarHeader className="p-2 border-t border-sidebar-border mt-auto">
                <SidebarMenu className="px-0">
                     {/* Settings Button */}
                     <SidebarMenuItem>
                         <SidebarMenuButton
                            tooltip="Account Settings"
                            // Use themed styles
                            className="capitalize focus:bg-sidebar-accent focus:text-sidebar-accent-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground"
                            variant="ghost"
                         >
                             <Link href="/profile/account-settings" className="flex items-center w-full">
                                <Settings className="h-4 w-4" />
                                <span className="ml-2 group-data-[collapsible=icon]:hidden">Account Settings</span>
                             </Link>
                         </SidebarMenuButton>
                     </SidebarMenuItem>
                    {/* Logout Button */}
                     <SidebarMenuItem>
                         <SidebarMenuButton
                            tooltip="Logout"
                            // Use themed (destructive) styles
                            className="capitalize focus:bg-red-900/50 focus:text-white hover:bg-red-900/50 hover:text-white text-red-300 hover:!text-red-100"
                            variant="ghost"
                        >
                             <a>
                                <LogOut className="h-4 w-4" />
                                <span className="ml-2 group-data-[collapsible=icon]:hidden">Logout</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
           </SidebarHeader>
        </Sidebar>

        {/* Main Content Area */}
        <SidebarInset className="flex-1 flex flex-col">
             {/* Use themed header background */}
           <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-background/80 backdrop-blur px-6 shadow-sm">
                <SidebarTrigger className="md:hidden" /> {/* Mobile Trigger */}
                <h1 className="text-xl font-semibold md:text-2xl flex-1 text-foreground"> {/* Use themed text */}
                     {/* Dynamic Header Title */}
                     {isOnManagePage ? 'Manage Store' : 'Your Stores Overview'}
                </h1>
                {/* Add header actions if needed */}
           </header>
            {/* Use themed main background */}
          <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-background">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
