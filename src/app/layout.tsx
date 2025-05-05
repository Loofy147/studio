
import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Import Inter font
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/header';
import { cn } from '@/lib/utils';
import { LayoutAnimator } from '@/components/LayoutAnimator'; // Import LayoutAnimator
import { Logo } from '@/components/Logo'; // Correct single import

// Configure Inter font
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'SwiftDispatch Marketplace',
  description: 'Your central hub for browsing stores, tracking orders, and managing your deliveries.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning> {/* Add suppressHydrationWarning for theme changes */}
      {/* Apply Inter font variable to body */}
      <body
        className={cn(
          inter.variable, // Apply Inter font variable
          "font-sans antialiased flex flex-col min-h-screen bg-background" // Use 'font-sans' which defaults to the variable
        )}
      >
        <Header /> {/* Add Header */}
        <main className="flex-grow w-full">
           {/* Added Layout Animator - Wrapping the children */}
            <LayoutAnimator>
                {children}
            </LayoutAnimator>
        </main>
        <Toaster />
        <footer className="py-6 mt-auto border-t bg-muted/50">
            {/* Use p-4 padding */}
            <div className="container mx-auto text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                <Logo className="h-6 w-auto mb-1 text-muted-foreground/80" /> {/* Use Logo */}
                © {new Date().getFullYear()} SwiftDispatch Marketplace. All rights reserved.
            </div>
        </footer>
      </body>
    </html>
  );
}
