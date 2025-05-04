'use client';

import React from 'react';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Store, Package, Users, Settings, BarChart2, FileText, ShieldCheck, LifeBuoy, Truck, MessageSquare } from 'lucide-react'; // Added Truck and MessageSquare

// Admin specific navigation items
const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/stores", label: "Stores", icon: Store },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/orders", label: "Orders", icon: FileText },
  { href: "/admin/drivers", label: "Drivers", icon: Truck }, // Added Drivers
  { href: "/admin/reports", label: "Reports", icon: BarChart2 },
  { href: "/admin/content", label: "Content", icon: FileText },
  { href: "/admin/support", label: "Support", icon: LifeBuoy }, // Changed icon
  { href: "/admin/security", label: "Security", icon: ShieldCheck },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    // Apply admin-layout class for scoping admin theme variables
    <SidebarProvider>
      <div className={cn("flex min-h-screen bg-background", "admin-layout")}>
        {/* Admin Sidebar */}
        {/* Added admin-sidebar class for specific sidebar theme overrides */}
        <Sidebar collapsible="icon" side="left" variant="sidebar" className={cn("bg-[--admin-sidebar-background] text-[--admin-sidebar-foreground] border-r border-[--admin-sidebar-border]", "admin-sidebar")}>
          <SidebarHeader className="p-2 border-b border-[--admin-sidebar-border]">
             <div className="flex items-center justify-between">
                {/* Simplified Logo for Admin */}
                 <Link href="/admin" className="flex items-center gap-2 px-2 group-data-[collapsible=icon]:justify-center">
                     <Truck className="h-6 w-6 text-[--admin-sidebar-primary]" />
                     <span className="font-bold text-lg group-data-[collapsible=icon]:hidden text-[--admin-sidebar-foreground]">SwiftDispatch Admin</span>
                 </Link>
                  {/* Optional: Add trigger inside header for icon mode? */}
                  {/* <SidebarTrigger className="group-data-[collapsible=icon]:hidden" /> */}
             </div>
          </SidebarHeader>
          <SidebarContent className="flex-1 overflow-y-auto">
            <SidebarMenu className="px-2 py-4">
              {adminNavItems.map(item => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href} passHref legacyBehavior>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))}
                      tooltip={item.label}
                      // Use admin theme variables for sidebar buttons
                      className="capitalize focus:bg-[--admin-sidebar-accent] focus:text-[--admin-sidebar-accent-foreground] data-[active=true]:bg-[--admin-sidebar-accent] data-[active=true]:text-[--admin-sidebar-accent-foreground] hover:bg-[--admin-sidebar-accent]/80 hover:text-[--admin-sidebar-accent-foreground]"
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
          </SidebarContent>
           <SidebarHeader className="p-2 border-t border-[--admin-sidebar-border] group-data-[collapsible=icon]:hidden">
                <span className="text-xs text-center text-[--admin-sidebar-foreground]/60">© {new Date().getFullYear()} SwiftDispatch</span>
           </SidebarHeader>
        </Sidebar>

        {/* Main Content Area for Admin Pages */}
        <SidebarInset className="flex-1 flex flex-col">
           {/* Optional Admin Header */}
           <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-6 shadow-sm">
                <SidebarTrigger className="md:hidden" /> {/* Mobile Trigger */}
                <h1 className="text-lg font-semibold md:text-xl flex-1">
                    {/* Dynamically set title based on route? */}
                    {adminNavItems.find(item => pathname.startsWith(item.href))?.label || 'Admin Dashboard'}
                </h1>
                {/* Add User menu/settings dropdown here */}
           </header>
           {/* Page Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
