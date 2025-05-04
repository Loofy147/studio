
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { StoreCategory } from "@/services/store"; // Import StoreCategory type

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper to format currency
export const formatCurrency = (amount: number | undefined | null) => {
  if (amount === undefined || amount === null) {
    return 'N/A'; // Or return a default value like '$0.00' or ''
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

// Helper to generate theme class based on store category
export const getThemeClass = (category: StoreCategory | undefined): string => {
   if (!category) return 'theme-category-other'; // Default theme
   // Basic sanitization: replace spaces with hyphens, lowercase, remove invalid chars
   const formattedCategory = category.replace(/\s+/g, '-').toLowerCase().replace(/[^a-z0-9-]/g, '');
   // Construct the class name
   return `theme-category-${formattedCategory}`;
};

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}
