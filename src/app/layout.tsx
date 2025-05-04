import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/header';
import { cn } from '@/lib/utils';
import { LayoutAnimator } from '@/components/LayoutAnimator';
import { Logo } from '@/components/Logo'; // Import the Logo component

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
    <html lang="en">
      <body
        className={cn(
          "antialiased flex flex-col min-h-screen bg-background"
        )}
      >
        <Header />
        <main className="flex-grow w-full">
           <LayoutAnimator>
             {children}
           </LayoutAnimator>
        </main>
        <Toaster />
        <footer className="py-6 mt-auto border-t bg-muted/50">
            <div className="container mx-auto text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                <Logo className="h-6 w-auto mb-1 text-muted-foreground/80" /> {/* Use Logo */}
                © {new Date().getFullYear()} SwiftDispatch Marketplace. All rights reserved.
            </div>
        </footer>
      </body>
    </html>
  );
}
