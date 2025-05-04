
import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Import Inter font
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/header'; // Import Header
import { cn } from '@/lib/utils'; // Import cn utility
import Sidebar from "@/components/Sidebar";
import { LayoutAnimator } from '@/components/LayoutAnimator'; // Import LayoutAnimator

// Initialize Inter font
const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

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
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          inter.variable, // Apply font variable
          "font-sans antialiased flex flex-col min-h-screen bg-background" // Apply base font and background
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
