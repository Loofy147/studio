
'use client';

import React from 'react';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Filter as FilterIcon } from 'lucide-react';
import type { StoreCategory } from '@/services/store';

interface CategorySidebarProps {
    categories: (StoreCategory | "all")[];
    selectedCategory: StoreCategory | "all";
    onSelectCategory: (category: StoreCategory | "all") => void;
    isLoading: boolean;
}

export function CategorySidebar({ categories, selectedCategory, onSelectCategory, isLoading }: CategorySidebarProps) {
    return (
        <Sidebar side="left" collapsible="icon" variant="inset" className="bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
           <SidebarHeader className="p-2 border-b border-sidebar-border group-data-[collapsible=icon]:justify-center">
             <span className="overline group-data-[collapsible=icon]:hidden">Categories</span>
             <span className="group-data-[collapsible=icon]:flex items-center justify-center hidden">
                <FilterIcon className="h-5 w-5"/>
             </span>
           </SidebarHeader>
           <SidebarContent className="flex-1 overflow-y-auto">
             <SidebarMenu className="px-2 py-4">
               {isLoading ? (
                   Array.from({ length: 5 }).map((_, index) => (
                       <SidebarMenuItem key={`cat-skeleton-${index}`} className="px-2 py-1">
                           <Skeleton className="h-5 w-full bg-muted/50" />
                       </SidebarMenuItem>
                   ))
               ) : (
                   categories.map(category => (
                       <SidebarMenuItem key={category}>
                            <SidebarMenuButton
                                isActive={selectedCategory === category}
                                onClick={() => onSelectCategory(category)}
                                tooltip={category === "all" ? "All Categories" : category}
                                className="capitalize w-full justify-start text-body2 data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                variant="ghost"
                            >
                                <span className="group-data-[collapsible=icon]:hidden">{category === "all" ? "All Categories" : category}</span>
                                {category === "all" && <span className="group-data-[collapsible=icon]:flex hidden">A</span>}
                                {category !== "all" && <span className="group-data-[collapsible=icon]:flex hidden">{category.slice(0,1).toUpperCase()}</span>}
                            </SidebarMenuButton>
                       </SidebarMenuItem>
                   ))
               )}
             </SidebarMenu>
           </SidebarContent>
         </Sidebar>
    );
}
