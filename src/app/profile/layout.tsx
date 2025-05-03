
// src/app/profile/layout.tsx
import React from 'react';

// This layout applies to /profile and its sub-routes like /profile/account-settings
export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* Can add profile-specific navigation or context providers here if needed */}
      {children}
    </div>
  );
}
