'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch"; // For toggling settings
import { Label } from "@/components/ui/label";
import { ShieldCheck, ListChecks, KeyRound, Lock, Loader2 } from 'lucide-react'; // Added Loader2
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from '@/components/ui/input'; // Import Input
import { useToast } from '@/hooks/use-toast'; // Import useToast

// Mock data for audit logs
const mockAuditLogs = [
  { id: 'log-001', timestamp: new Date(Date.now() - 1 * 3600000), user: 'admin@example.com', action: 'Disabled store: ElectroMart', ipAddress: '192.168.1.100' },
  { id: 'log-002', timestamp: new Date(Date.now() - 5 * 3600000), user: 'admin@example.com', action: 'Updated product: Premium Laptop price', ipAddress: '192.168.1.100' },
  { id: 'log-003', timestamp: new Date(Date.now() - 24 * 3600000), user: 'security_bot', action: 'Failed login attempt detected for user: user.456@example.com', ipAddress: '10.0.0.5' },
  { id: 'log-004', timestamp: new Date(Date.now() - 48 * 3600000), user: 'admin@example.com', action: 'Granted store owner role to: store.owner@greenbasket.com', ipAddress: '192.168.1.100' },
  { id: 'log-005', timestamp: new Date(Date.now() - 72 * 3600000), user: 'admin@example.com', action: 'Changed platform primary color setting', ipAddress: '192.168.1.100' },
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
    failedLoginAttempts: 5, // Number of attempts before lockout
    lockoutDurationMinutes: 15, // Lockout duration
    sessionTimeoutMinutes: 30,
    // Add password complexity later if needed
};

// Mock functions (replace with actual API calls)
async function getSecuritySettings() {
    console.log("Fetching security settings...");
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockSettings;
}
async function saveSecuritySettings(settings: any) {
     console.log("Saving security settings:", settings);
     await new Promise(resolve => setTimeout(resolve, 800));
     // Simulate potential error
     // if (Math.random() > 0.8) throw new Error("Failed to save settings");
     return true;
}
async function getAuditLogs() {
     console.log("Fetching audit logs...");
     await new Promise(resolve => setTimeout(resolve, 500));
     return mockAuditLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // Sort newest first
}


export default function AdminSecurityPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [securitySettings, setSecuritySettings] = useState<typeof mockSettings | null>(null);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const { toast } = useToast();

  // Fetch initial data
   React.useEffect(() => {
    const loadData = async () => {
        setIsLoadingSettings(true);
        setIsLoadingLogs(true);
        try {
            const [settingsData, logsData] = await Promise.all([
                getSecuritySettings(),
                getAuditLogs()
            ]);
            setSecuritySettings(settingsData);
            setAuditLogs(logsData);
        } catch (error) {
             console.error("Failed to load security data:", error);
             toast({ title: "Error", description: "Could not load security settings or logs.", variant: "destructive" });
        } finally {
            setIsLoadingSettings(false);
            setIsLoadingLogs(false);
        }
    };
    loadData();
  }, [toast]);


  const handleSettingChange = (key: keyof typeof mockSettings, value: boolean | number) => {
    setSecuritySettings(prev => prev ? { ...prev, [key]: value } : null);
  };

  const handleSaveSettings = async () => {
      if (!securitySettings) return;
      setIsSavingSettings(true);
      try {
         const success = await saveSecuritySettings(securitySettings);
         if (success) {
             toast({ title: "Settings Saved", description: "Security settings updated successfully." });
         } else {
             throw new Error("Server indicated failure.")
         }
      } catch (error: any) {
          toast({ title: "Error Saving Settings", description: error.message || "Could not save security settings.", variant: "destructive" });
      } finally {
          setIsSavingSettings(false);
      }
  }

  const LogTableSkeleton = () => (
      <Table>
        <TableHeader>
            <TableRow>
            <TableHead className="w-[200px]"><Skeleton className="h-4 w-full bg-muted/50" /></TableHead>
            <TableHead className="hidden sm:table-cell w-[180px]"><Skeleton className="h-4 w-full bg-muted/50" /></TableHead> {/* User */}
            <TableHead><Skeleton className="h-4 w-full bg-muted/50" /></TableHead> {/* Action */}
             <TableHead className="hidden md:table-cell w-[150px]"><Skeleton className="h-4 w-full bg-muted/50" /></TableHead> {/* IP */}
            </TableRow>
        </TableHeader>
        <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-3/4 bg-muted/50" /></TableCell>
                 <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-full bg-muted/50" /></TableCell>
                <TableCell><Skeleton className="h-4 w-full bg-muted/50" /></TableCell>
                 <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-full bg-muted/50" /></TableCell>
            </TableRow>
            ))}
        </TableBody>
      </Table>
  )

  const SettingsSkeleton = () => (
      <div className="space-y-6">
          <Skeleton className="h-16 w-full rounded-md border" />
          <Skeleton className="h-16 w-full rounded-md border" />
          <Skeleton className="h-20 w-full rounded-md border" />
      </div>
  )

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-[var(--admin-primary)]"> {/* Admin theme color */}
        <ShieldCheck className="h-7 w-7" /> Security Center
      </h1>

      {/* Security Settings Section */}
      <Card className="shadow-md border"> {/* Added shadow */}
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"> {/* Responsive layout */}
           <div>
                <CardTitle className="flex items-center gap-2 text-xl"><Lock className="h-5 w-5"/> Security Settings</CardTitle>
                <CardDescription>Configure platform security parameters like authentication and session management.</CardDescription>
           </div>
           <Button onClick={handleSaveSettings} disabled={isSavingSettings || isLoadingSettings}>
                {isSavingSettings ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4"/>}
                Save Settings
           </Button>
        </CardHeader>
        <CardContent className="pt-4"> {/* Added pt-4 */}
           {isLoadingSettings ? <SettingsSkeleton /> : securitySettings ? (
                <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-md bg-background">
                        <Label htmlFor="twoFactorAuth" className="flex flex-col space-y-1 cursor-pointer">
                            <span className="font-medium">Two-Factor Authentication (2FA)</span>
                            <span className="font-normal leading-snug text-muted-foreground text-xs">
                                Require 2FA for all administrator accounts for enhanced security.
                            </span>
                        </Label>
                        <Switch
                            id="twoFactorAuth"
                            checked={securitySettings.twoFactorAuth}
                            onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
                            disabled={isSavingSettings}
                            className="ml-4" // Added margin
                        />
                    </div>
                     <div className="p-4 border rounded-md bg-background space-y-4">
                         <div className="flex items-center justify-between">
                              <Label htmlFor="failedLoginLockout" className="flex flex-col space-y-1 cursor-pointer">
                                <span className="font-medium">Failed Login Lockout</span>
                                <span className="font-normal leading-snug text-muted-foreground text-xs">
                                    Temporarily lock accounts after multiple failed login attempts.
                                </span>
                              </Label>
                             <Switch
                                id="failedLoginLockout"
                                checked={securitySettings.failedLoginLockout}
                                onCheckedChange={(checked) => handleSettingChange('failedLoginLockout', checked)}
                                disabled={isSavingSettings}
                                className="ml-4"
                             />
                         </div>
                         {securitySettings.failedLoginLockout && ( // Show related settings only if enabled
                             <div className="grid grid-cols-2 gap-4 pl-4 pt-2 border-l-2 border-muted ml-1">
                                <div className="space-y-1">
                                    <Label htmlFor="failedLoginAttempts" className="text-xs text-muted-foreground">Attempts Before Lockout</Label>
                                    <Input
                                        id="failedLoginAttempts"
                                        type="number"
                                        min="3" max="10"
                                        value={securitySettings.failedLoginAttempts}
                                        onChange={(e) => handleSettingChange('failedLoginAttempts', parseInt(e.target.value) || 5)}
                                        className="h-8 text-sm"
                                        disabled={isSavingSettings}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="lockoutDurationMinutes" className="text-xs text-muted-foreground">Lockout Duration (Minutes)</Label>
                                    <Input
                                        id="lockoutDurationMinutes"
                                        type="number"
                                        min="5" max="60"
                                        value={securitySettings.lockoutDurationMinutes}
                                        onChange={(e) => handleSettingChange('lockoutDurationMinutes', parseInt(e.target.value) || 15)}
                                        className="h-8 text-sm"
                                        disabled={isSavingSettings}
                                    />
                                </div>
                            </div>
                         )}
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-md bg-background">
                        <Label htmlFor="sessionTimeout" className="flex flex-col space-y-1">
                            <span className="font-medium">Admin Session Timeout (Minutes)</span>
                            <span className="font-normal leading-snug text-muted-foreground text-xs">
                                Automatically log out inactive administrators after this period.
                            </span>
                        </Label>
                        <Input
                            id="sessionTimeout"
                            type="number"
                            min="5" max="120"
                            value={securitySettings.sessionTimeoutMinutes}
                            onChange={(e) => handleSettingChange('sessionTimeoutMinutes', parseInt(e.target.value) || 30)}
                            className="w-20 h-8 text-sm ml-4"
                            disabled={isSavingSettings}
                        />
                   </div>
                   {/* Placeholder for Password Complexity Settings */}
                   {/* <div className="p-4 border rounded-md bg-background">
                        <Label className="font-medium">Password Complexity</Label>
                         <p className="text-xs text-muted-foreground mt-1">Enforce strong password requirements (e.g., length, character types). (Not implemented)</p>
                         <Button variant="outline" size="sm" className="mt-2" disabled>Configure</Button>
                   </div> */}
                </div>
            ) : (
                 <p className="text-muted-foreground italic">Could not load settings.</p>
            )}
        </CardContent>
      </Card>

      {/* Audit Log Section */}
      <Card className="shadow-md border"> {/* Added shadow */}
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl"><ListChecks className="h-5 w-5"/> Audit Log</CardTitle>
          <CardDescription>Track important actions performed within the admin panel for security and compliance.</CardDescription>
          {/* Optional: Add filters for logs (user, action type, date range) */}
        </CardHeader>
        <CardContent>
           <div className="rounded-md border overflow-hidden shadow-sm"> {/* Added shadow */}
             {isLoadingLogs ? <LogTableSkeleton /> : (
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="w-[200px]">Timestamp</TableHead>
                        <TableHead className="hidden sm:table-cell w-[180px]">User/System</TableHead> {/* Show on sm+ */}
                        <TableHead>Action</TableHead>
                        <TableHead className="hidden md:table-cell w-[150px]">IP Address</TableHead> {/* Show on md+ */}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {auditLogs.length > 0 ? (
                            auditLogs.map((log) => (
                            <TableRow key={log.id} className="hover:bg-muted/50 transition-colors">
                                <TableCell className="text-xs text-muted-foreground">{format(log.timestamp, 'MMM d, yyyy HH:mm:ss')}</TableCell>
                                <TableCell className="font-medium text-sm hidden sm:table-cell">{log.user}</TableCell>
                                <TableCell className="text-sm">{log.action}</TableCell>
                                <TableCell className="hidden md:table-cell text-sm text-muted-foreground font-mono">{log.ipAddress || 'N/A'}</TableCell>
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
            {/* <div className="flex justify-center mt-4"><Button variant="outline" size="sm">Load More Logs</Button></div> */}
        </CardContent>
      </Card>
    </div>
  );
}
