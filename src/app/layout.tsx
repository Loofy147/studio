
import type {Metadata} from 'next';
// Removed Geist font import as it wasn't being explicitly used in body className
// import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import {Toaster} from '@/components/ui/toaster';

/*
// If you intend to use Geist fonts, uncomment these lines and add the variables to body className
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});
*/

export const metadata: Metadata = {
  title: 'SwiftDispatch - AI Delivery Management', // Updated Title
  description: 'Manage and track deliveries efficiently with AI-powered insights.', // Updated Description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* If using Geist fonts, add `${geistSans.variable} ${geistMono.variable}` below */}
      <body className={`antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
