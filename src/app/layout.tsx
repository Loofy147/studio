
import type {Metadata} from 'next';
import './globals.css';
import {Toaster} from '@/components/ui/toaster';
import { Header } from '@/components/header'; // Import Header

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
    <html lang="en">
      <body className={`antialiased flex flex-col min-h-screen`}>
        <Header /> {/* Add Header */}
        <main className="flex-grow container mx-auto px-4 py-8"> {/* Wrap children in main */}
          {children}
        </main>
        <Toaster />
        <footer className="py-4 mt-8 border-t">
            <div className="container mx-auto text-center text-sm text-muted-foreground">
                © {new Date().getFullYear()} Marketplace App. All rights reserved.
            </div>
        </footer>
      </body>
    </html>
  );
}
