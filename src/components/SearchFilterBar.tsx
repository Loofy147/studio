
'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter as FilterIcon } from 'lucide-react';
import type { StoreCategory } from '@/services/store';

interface SearchFilterBarProps {
    title: string;
    isLoading: boolean;
    storeCount: number;
    searchTerm: string;
    onSearchChange: (term: string) => void;
    selectedCategory: StoreCategory | "all";
    categories: (StoreCategory | "all")[];
    onSelectCategory: (category: StoreCategory | "all") => void;
    onClearFilters: () => void; // Callback to clear filters
}

export function SearchFilterBar({
    title,
    isLoading,
    storeCount,
    searchTerm,
    onSearchChange,
    selectedCategory,
    categories,
    onSelectCategory,
    onClearFilters,
}: SearchFilterBarProps) {
    const showClearButton = searchTerm !== "" || selectedCategory !== "all";

    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-3 mb-6">
            <h2 className="h2 flex-grow">{title}</h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                 {/* Search Input (Optional, could rely on hero search) */}
                 {/* <div className="relative flex-grow w-full md:w-auto">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search in results..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10 w-full h-10"
                        disabled={isLoading}
                    />
                 </div> */}

                {/* Category Select (if more than 'all') */}
                {categories.length > 1 && (
                    <Select
                        value={selectedCategory}
                        onValueChange={(value: string) => onSelectCategory(value as StoreCategory | "all")}
                        disabled={isLoading}
                    >
                        <SelectTrigger className="w-full sm:w-[200px] h-10 shadow-sm">
                            <FilterIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                            <SelectValue placeholder="Filter by category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map(category => (
                                <SelectItem key={category} value={category} className="capitalize">
                                    {category === "all" ? "All Categories" : category}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
                {showClearButton && (
                   <Button variant="ghost" onClick={onClearFilters} size="sm" className="h-10 text-muted-foreground">
                       Clear Filters
                   </Button>
                )}
                {/* Loading/Count Indicator */}
                <span className="caption text-right md:ml-2 shrink-0 h-10 flex items-center justify-end">
                    {isLoading ? 'Loading...' : `${storeCount} store${storeCount !== 1 ? 's' : ''} found`}
                </span>
            </div>
        </div>
    );
}
