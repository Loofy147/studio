import type { Metadata } from 'next';
// Removed Inter font import, font stack defined in globals.css
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/header'; // Import Header
import { cn } from '@/lib/utils'; // Import cn utility
import { LayoutAnimator } from '@/components/LayoutAnimator'; // Import LayoutAnimator

// Removed font variable initialization

export const metadata: Metadata = {
  title: 'SwiftDispatch Marketplace', // Updated Title
  description: 'Your central hub for browsing stores, tracking orders, and managing your deliveries.', // Updated Description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Removed suppressHydrationWarning unless specifically needed later for theme switching issues
    <html lang="en">
      <body
        className={cn(
          // Removed font variable class
          "antialiased flex flex-col min-h-screen bg-background" // Apply base font and background
        )}
      >
        {/* Header is persistent */}
        <Header />

        {/* Main content area - Layout shifts (e.g., Admin sidebar) will be handled by nested layouts */}
        <main className="flex-grow w-full">
           <LayoutAnimator>
             {children}
           </LayoutAnimator>
        </main>

        <Toaster />

        {/* Footer */}
        <footer className="py-6 mt-auto border-t bg-muted/50">
            <div className="container mx-auto text-center text-sm text-muted-foreground">
                © {new Date().getFullYear()} SwiftDispatch Marketplace. All rights reserved.
            </div>
        </footer>
      </body>
    </html>
  );
}
