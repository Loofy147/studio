// src/app/profile/layout.tsx
'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Settings, MapPin, Building, Users as UsersIcon, CalendarClock } from 'lucide-react';

// Navigation items for the profile section
const profileNavItems = [
  { href: "/profile", label: "Overview", icon: User },
  { href: "/profile/account-settings", label: "Account Settings", icon: Settings },
  { href: "/profile/addresses", label: "Addresses", icon: MapPin }, // Future: Use this page instead of managing on main profile
  { href: "/profile/followed-stores", label: "Followed Stores", icon: Building },
  { href: "/profile/friends", label: "Friends", icon: UsersIcon },
   { href: "/profile/subscriptions", label: "Subscriptions", icon: CalendarClock }, // Future: Separate subscriptions page
];

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
     <div className="container mx-auto py-8 px-4">
        {/* Optional: Add a consistent header for the profile section if needed */}
         {/* Example:
         <div className="mb-8">
             <h1 className="text-3xl font-bold">Your Profile</h1>
         </div>
         */}

        {/* Tabs Navigation - Consider replacing with sidebar or other nav pattern if preferred */}
         {/* <Tabs defaultValue={pathname} className="w-full mb-8">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
                {profileNavItems.map(item => (
                    <TabsTrigger key={item.href} value={item.href} asChild>
                         <Link href={item.href} className="flex items-center gap-2">
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    </TabsTrigger>
                ))}
            </TabsList>
         </Tabs> */}


      {/* Render the specific page content */}
      {children}
    </div>
  );
}