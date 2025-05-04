'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Truck, UserCircle, Settings, LogOut, Bell, DollarSign } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Logo } from '@/components/Logo'; // Import the new Logo component

// Driver specific navigation items
const driverNavItems = [
  { href: "/driver/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/driver/orders", label: "Available Orders", icon: Bell },
  { href: "/driver/route", label: "Current Route", icon: Truck },
  { href: "/driver/earnings", label: "Earnings", icon: DollarSign },
  { href: "/driver/profile", label: "Profile", icon: UserCircle },
];

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Mock driver info (replace with actual data from auth/state)
  const driverName = "Driver Dan";
  const driverEmail = "dan.driver@dispatch.com";

  return (
     <SidebarProvider>
      {/* Apply driver-layout class for scoping driver theme variables */}
      <div className={cn("flex min-h-screen", "driver-layout")}> {/* Removed explicit bg, uses variable */}
        {/* Driver Sidebar */}
        {/* Added driver-sidebar class for specific sidebar theme overrides */}
        <Sidebar collapsible="icon" side="left" variant="sidebar" className={cn("bg-[--driver-sidebar-background] text-[--driver-sidebar-foreground] border-r border-[--driver-sidebar-border]", "driver-sidebar")}> {/* Use variable colors */}
          <SidebarHeader className="p-2 border-b border-[--driver-sidebar-border]">
             <div className="flex items-center justify-between p-2">
                 <Link href="/driver/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
                     <Logo className="h-7 w-auto text-[--driver-sidebar-primary]" /> {/* Use logo with primary color */}
                     <span className="font-bold text-lg group-data-[collapsible=icon]:hidden text-[--driver-sidebar-foreground]">SwiftDispatch Driver</span>
                 </Link>
             </div>
              {/* Driver Avatar/Info */}
               <div className="flex items-center gap-3 p-2 border-t border-[--driver-sidebar-border] mt-2 group-data-[collapsible=icon]:hidden">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={`https://avatar.vercel.sh/${driverEmail}?size=36`} alt={driverName} />
                        <AvatarFallback>{driverName.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-medium text-[--driver-sidebar-foreground]">{driverName}</p>
                        <p className="text-xs text-[--driver-sidebar-foreground]/70">{driverEmail}</p>
                    </div>
               </div>
               <div className="flex justify-center p-2 border-t border-[--driver-sidebar-border] mt-2 group-data-[collapsible=icon]:flex hidden">
                   <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://avatar.vercel.sh/${driverEmail}?size=32`} alt={driverName} />
                        <AvatarFallback>{driverName.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                    </Avatar>
               </div>
          </SidebarHeader>
          <SidebarContent className="flex-1 overflow-y-auto">
            <SidebarMenu className="px-2 py-4">
              {driverNavItems.map(item => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href} passHref legacyBehavior>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href || (item.href !== '/driver/dashboard' && pathname.startsWith(item.href))}
                      tooltip={item.label}
                      // Use driver theme variables for sidebar buttons
                      className="capitalize focus:bg-[--driver-sidebar-accent] focus:text-[--driver-sidebar-accent-foreground] data-[active=true]:bg-[--driver-sidebar-primary] data-[active=true]:text-[--driver-sidebar-primary-foreground] hover:bg-[--driver-sidebar-accent]/80 hover:text-[--driver-sidebar-accent-foreground]"
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
           <SidebarHeader className="p-2 border-t border-[--driver-sidebar-border] mt-auto">
                <SidebarMenu className="px-0">
                    <SidebarMenuItem>
                         <SidebarMenuButton
                            tooltip="Settings"
                             className="capitalize focus:bg-[--driver-sidebar-accent] focus:text-[--driver-sidebar-accent-foreground] hover:bg-[--driver-sidebar-accent]/80 hover:text-[--driver-sidebar-accent-foreground]"
                            variant="ghost"
                        >
                             <a>
                                <Settings className="h-4 w-4" />
                                <span className="group-data-[collapsible=icon]:hidden">Settings</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                         <SidebarMenuButton
                            tooltip="Logout"
                            className="capitalize focus:bg-red-900/50 focus:text-white hover:bg-red-900/50 hover:text-white text-red-300 hover:!text-red-100"
                            variant="ghost"
                        >
                             <a>
                                <LogOut className="h-4 w-4" />
                                <span className="group-data-[collapsible=icon]:hidden">Logout</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
           </SidebarHeader>
        </Sidebar>

        {/* Main Content Area for Driver Pages */}
        <SidebarInset className="flex-1 flex flex-col">
           {/* Optional Driver Header */}
           <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur px-6 shadow-sm"> {/* Use theme background */}
                <SidebarTrigger className="md:hidden" /> {/* Mobile Trigger */}
                <h1 className="text-xl font-semibold md:text-2xl flex-1 text-foreground"> {/* Use theme foreground */}
                     {driverNavItems.find(item => pathname.startsWith(item.href))?.label || 'Driver Portal'}
                </h1>
                {/* Add any header actions: e.g., Notifications Bell, Quick Status Toggle? */}
           </header>
           {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-background"> {/* Ensure main bg matches layout variable */}
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
