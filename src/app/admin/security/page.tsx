'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch"; // For toggling settings
import { Label } from "@/components/ui/label";
import { ShieldCheck, ListChecks, KeyRound, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";

// Mock data for audit logs
const mockAuditLogs = [
  { id: 'log-001', timestamp: new Date(Date.now() - 1 * 3600000), user: 'admin@example.com', action: 'Disabled store: ElectroMart', ipAddress: '192.168.1.100' },
  { id: 'log-002', timestamp: new Date(Date.now() - 5 * 3600000), user: 'admin@example.com', action: 'Updated product: Premium Laptop price', ipAddress: '192.168.1.100' },
  { id: 'log-003', timestamp: new Date(Date.now() - 24 * 3600000), user: 'security_bot', action: 'Failed login attempt detected for user: user.456@example.com', ipAddress: '10.0.0.5' },
  { id: 'log-004', timestamp: new Date(Date.now() - 48 * 3600000), user: 'admin@example.com', action: 'Granted store owner role to: store.owner@greenbasket.com', ipAddress: '192.168.1.100' },
];

interface AuditLog {
    id: string;
    timestamp: Date;
    user: string; // User email or system identifier
    action: string; // Description of the action taken
    ipAddress?: string; // Optional: IP address associated with the action
}

// Mock security settings state
const mockSettings = {
    twoFactorAuth: true,
    failedLoginLockout: true,
    sessionTimeoutMinutes: 30,
};

export default function AdminSecurityPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(mockAuditLogs);
  const [securitySettings, setSecuritySettings] = useState(mockSettings);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // TODO: Implement functions to fetch logs and save settings

  const handleSettingChange = (key: keyof typeof mockSettings, value: boolean | number) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }));
    // In a real app, you might want to debounce or have a save button
    // For now, we just update local state.
    console.log(`Setting ${key} changed to ${value}`);
  };

  const saveSettings = async () => {
      setIsSavingSettings(true);
      console.log("Saving security settings:", securitySettings);
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call
      setIsSavingSettings(false);
       // Add toast notification on success/failure
  }

  const LogTableSkeleton = () => (
      <Table>
        <TableHeader>
            <TableRow>
            <TableHead className="w-[200px]"><Skeleton className="h-4 w-full" /></TableHead>
            <TableHead><Skeleton className="h-4 w-full" /></TableHead>
            <TableHead className="hidden md:table-cell"><Skeleton className="h-4 w-full" /></TableHead>
             <TableHead className="hidden lg:table-cell"><Skeleton className="h-4 w-full" /></TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {Array.from({ length: 4 }).map((_, i) => (
            <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-full" /></TableCell>
                 <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-full" /></TableCell>
            </TableRow>
            ))}
        </TableBody>
      </Table>
  )

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
        <ShieldCheck className="h-7 w-7" /> Security Center
      </h1>

      {/* Security Settings Section */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
           <div>
                <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5"/> Security Settings</CardTitle>
                <CardDescription>Configure platform security parameters.</CardDescription>
           </div>
           <Button onClick={saveSettings} disabled={isSavingSettings}>
                {isSavingSettings ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Settings
           </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-md">
             <Label htmlFor="twoFactorAuth" className="flex flex-col space-y-1">
                <span>Two-Factor Authentication (2FA)</span>
                <span className="font-normal leading-snug text-muted-foreground">
                    Require 2FA for all admin accounts.
                </span>
            </Label>
            <Switch
                id="twoFactorAuth"
                checked={securitySettings.twoFactorAuth}
                onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
                disabled={isSavingSettings}
            />
          </div>
          <div className="flex items-center justify-between p-4 border rounded-md">
            <Label htmlFor="failedLoginLockout" className="flex flex-col space-y-1">
                <span>Failed Login Lockout</span>
                 <span className="font-normal leading-snug text-muted-foreground">
                    Temporarily lock accounts after multiple failed login attempts.
                 </span>
            </Label>
            <Switch
                id="failedLoginLockout"
                checked={securitySettings.failedLoginLockout}
                 onCheckedChange={(checked) => handleSettingChange('failedLoginLockout', checked)}
                 disabled={isSavingSettings}
            />
          </div>
           {/* Add more settings like session timeout, password complexity rules etc. */}
            {/* <div className="flex items-center justify-between p-4 border rounded-md">
                 <Label htmlFor="sessionTimeout" className="flex flex-col space-y-1">
                     <span>Admin Session Timeout (Minutes)</span>
                     <span className="font-normal leading-snug text-muted-foreground">
                         Automatically log out admins after inactivity.
                     </span>
                 </Label>
                 <Input
                    id="sessionTimeout"
                    type="number"
                    min="5"
                    max="120"
                    value={securitySettings.sessionTimeoutMinutes}
                    onChange={(e) => handleSettingChange('sessionTimeoutMinutes', parseInt(e.target.value) || 30)}
                    className="w-20"
                    disabled={isSavingSettings}
                 />
           </div> */}
        </CardContent>
      </Card>

      {/* Audit Log Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ListChecks className="h-5 w-5"/> Audit Log</CardTitle>
          <CardDescription>Track important actions performed within the admin panel.</CardDescription>
          {/* Optional: Add filters for logs (user, action type, date range) */}
        </CardHeader>
        <CardContent>
           <div className="rounded-md border overflow-hidden">
             {isLoadingLogs ? <LogTableSkeleton /> : (
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="w-[200px]">Timestamp</TableHead>
                        <TableHead>User/System</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead className="hidden md:table-cell w-[150px]">IP Address</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {auditLogs.length > 0 ? (
                            auditLogs.map((log) => (
                            <TableRow key={log.id}>
                                <TableCell className="text-sm text-muted-foreground">{format(log.timestamp, 'MMM d, yyyy HH:mm:ss')}</TableCell>
                                <TableCell className="font-medium text-sm">{log.user}</TableCell>
                                <TableCell className="text-sm">{log.action}</TableCell>
                                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{log.ipAddress || 'N/A'}</TableCell>
                            </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                No audit logs available.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
             )}
           </div>
            {/* Optional: Add pagination for logs */}
        </CardContent>
      </Card>
    </div>
  );
}

// Added Loader2 to imports for saving state
import { Loader2 } from 'lucide-react';
```