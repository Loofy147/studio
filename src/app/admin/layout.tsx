
'use client';

import React from 'react';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Store, Package, Users, Settings, BarChart2, FileText, ShieldCheck, LifeBuoy, Truck, MessageSquare, LogOut } from 'lucide-react'; // Removed BrainCircuit
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo'; // Correct import

// Admin specific navigation items
const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/stores", label: "Stores", icon: Store },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/orders", label: "Orders", icon: FileText },
  { href: "/admin/drivers", label: "Drivers", icon: Truck },
  // { href: "/admin/ai-model", label: "AI Model", icon: BrainCircuit }, // Removed AI Model Link
  { href: "/admin/reports", label: "Reports", icon: BarChart2 },
  { href: "/admin/content", label: "Content", icon: FileText },
  { href: "/admin/support", label: "Support", icon: LifeBuoy },
  { href: "/admin/security", label: "Security", icon: ShieldCheck },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Mock Admin User Info
   const adminName = "Admin User";
   const adminEmail = "admin@swiftdispatch.example";

  return (
    // Apply admin-layout class for scoping admin theme variables
    <SidebarProvider>
      <div className={cn("flex min-h-screen admin-layout")}> {/* Apply admin theme via class */}
        {/* Admin Sidebar */}
        {/* Added admin-sidebar class for specific sidebar theme overrides */}
        <Sidebar collapsible="icon" side="left" variant="sidebar" className={cn("bg-[--admin-sidebar-background] text-[--admin-sidebar-foreground] border-r border-[--admin-sidebar-border] shadow-lg admin-sidebar")}> {/* Use variable colors */}
          <SidebarHeader className="p-2 border-b border-[--admin-sidebar-border]">
             <div className="flex items-center justify-between p-2"> {/* Padding for logo area */}
                 <Link href="/admin" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
                      <Logo className="h-7 w-auto text-[var(--admin-sidebar-primary)]" /> {/* Use logo with primary color */}
                     <span className="font-bold text-lg group-data-[collapsible=icon]:hidden text-[var(--admin-sidebar-foreground)]">SwiftDispatch</span> {/* Adjusted size */}
                     <span className="font-semibold text-xs text-[var(--admin-sidebar-foreground)]/70 group-data-[collapsible=icon]:hidden ml-1">Admin</span>
                 </Link>
             </div>
              {/* Admin User Info - Full */}
              <div className="flex items-center gap-3 p-2 border-t border-[var(--admin-sidebar-border)] mt-2 group-data-[collapsible=icon]:hidden">
                   <Avatar className="h-9 w-9">
                        <AvatarImage src={`https://avatar.vercel.sh/${adminEmail}?size=36`} alt={adminName} />
                        <AvatarFallback>{adminName.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-medium text-[var(--admin-sidebar-foreground)]">{adminName}</p>
                        <p className="text-xs text-[var(--admin-sidebar-foreground)]/70">{adminEmail}</p>
                    </div>
              </div>
              {/* Admin User Info - Collapsed */}
               <div className="flex justify-center p-2 border-t border-[var(--admin-sidebar-border)] mt-2 group-data-[collapsible=icon]:flex hidden">
                   <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://avatar.vercel.sh/${adminEmail}?size=32`} alt={adminName} />
                        <AvatarFallback>{adminName.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                    </Avatar>
               </div>
          </SidebarHeader>
          <SidebarContent className="flex-1 overflow-y-auto">
            <SidebarMenu className="px-2 py-4">
              {adminNavItems.map(item => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href} passHref legacyBehavior>
                    <SidebarMenuButton
                      as="a" // Use 'as="a"' for proper SSR with legacyBehavior
                      isActive={pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))}
                      tooltip={item.label}
                      // Use admin theme variables for sidebar buttons
                      className="capitalize focus:bg-[var(--admin-sidebar-accent)] focus:text-[var(--admin-sidebar-accent-foreground)] data-[active=true]:bg-[var(--admin-sidebar-primary)] data-[active=true]:text-[var(--admin-sidebar-primary-foreground)] hover:bg-[var(--admin-sidebar-accent)]/80 hover:text-[var(--admin-sidebar-accent-foreground)]"
                      variant="ghost"
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
           {/* Footer section for copyright */}
           <SidebarHeader className="p-2 border-t border-[var(--admin-sidebar-border)] mt-auto">
                <SidebarMenu className="px-0">
                    {/* Example Logout Button */}
                    <SidebarMenuItem>
                         <SidebarMenuButton // Use SidebarMenuButton directly for actions
                            tooltip="Logout"
                            variant="ghost"
                            className="w-full justify-start text-red-400 hover:bg-red-900/50 hover:text-red-200 group-data-[collapsible=icon]:justify-center"
                          >
                            <LogOut className="h-4 w-4 group-data-[collapsible=icon]:mx-auto" />
                            <span className="ml-2 group-data-[collapsible=icon]:hidden">Logout</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                 <span className="text-xs text-center text-[var(--admin-sidebar-foreground)]/60 group-data-[collapsible=icon]:hidden mt-2 block">© {new Date().getFullYear()} SwiftDispatch</span>
           </SidebarHeader>
        </Sidebar>

        {/* Main Content Area for Admin Pages */}
        <SidebarInset className="flex-1 flex flex-col">
           {/* Admin Header */}
           <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur px-6 shadow-md"> {/* Use theme background, Added shadow */}
                <SidebarTrigger className="md:hidden" /> {/* Mobile Trigger */}
                <h1 className="text-xl font-semibold md:text-2xl flex-1 text-foreground"> {/* Use theme foreground */}
                     {/* Find the label for the currently active segment */}
                      {adminNavItems.find(item => item.href === '/' ? pathname === item.href : pathname.startsWith(item.href))?.label || 'Admin Dashboard'}
                </h1>
                {/* Add User menu/settings dropdown here */}
                {/* Example: */}
                {/* <UserMenu /> */}
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
