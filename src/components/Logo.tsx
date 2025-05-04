// src/components/Logo.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  // Add any specific props if needed, e.g., size variants
}

export function Logo({ className, ...props }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 40" // Adjusted viewBox for a wider logo
      className={cn("h-8 w-auto", className)} // Default size, allow override
      {...props}
    >
      <defs>
        {/* Define gradients or filters if needed */}
      </defs>
      {/* Example simple logo: Overlapping shapes */}
      <g fill="currentColor"> {/* Use currentColor to inherit text color */}
        {/* S */}
        <path d="M25,10 C15,10 10,15 10,20 S15,30 25,30 C35,30 40,25 40,20 C40,15 35,10 25,10 M25,13 C33,13 37,17 37,20 C37,23 33,27 25,27 C17,27 13,23 13,20 C13,17 17,13 25,13" />
        <path d="M20,17 H30 V20 H15 V23 H25" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        {/* D - Simple shape */}
         <path d="M45 10 H 55 Q 65 10 65 20 Q 65 30 55 30 H 45 Z" />
         <rect x="48" y="13" width="8" height="14" rx="2" fill="var(--background)" />
        {/* P - Simple shape */}
        <path d="M70 10 H 80 Q 90 10 90 20 Q 90 30 80 30 V 23 H 70 Z" />
         <rect x="73" y="13" width="8" height="7" rx="2" fill="var(--background)" />
      </g>
       {/* Optional: Text element if SVG shapes are too complex */}
       {/*
       <text x="50" y="28" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="bold" textAnchor="middle" fill="currentColor">
         SDP
       </text>
       */}
    </svg>
  );
}
