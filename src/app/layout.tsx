
import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Import Inter font
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/header'; // Import Header
import { cn } from '@/lib/utils'; // Import cn utility

// Initialize Inter font
const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Marketplace - Find Everything You Need', // Updated Title
  description: 'Browse stores, find products, and place orders easily.', // Updated Description
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
          inter.variable,
          "font-sans antialiased flex flex-col min-h-screen bg-background"
        )}
      >
        <Header />
        {/* Adjust main padding - might be overridden by page layout if sidebar exists */}
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Toaster />
        <footer className="py-6 mt-12 border-t bg-muted/50">
            <div className="container mx-auto text-center text-sm text-muted-foreground">
                © {new Date().getFullYear()} Marketplace App. All rights reserved.
            </div>
        </footer>
      </body>
    </html>
  );
}
