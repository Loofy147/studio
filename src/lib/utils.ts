
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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
