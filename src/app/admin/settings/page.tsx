'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Settings as SettingsIcon, Save, Loader2, Store, Truck, Palette, Info, Bell, CreditCard } from 'lucide-react'; // Added Info, Bell, CreditCard
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton
import { Separator } from '@/components/ui/separator'; // Import Separator

// Mock function to get settings (replace with actual API call)
async function getAppSettings() {
    console.log("Fetching app settings...");
    await new Promise(resolve => setTimeout(resolve, 400)); // Simulate delay
    return {
        // General
        appName: "SwiftDispatch Marketplace",
        supportEmail: "support@swiftdispatch.example",
        maintenanceMode: false,
        // Store
        allowStoreSignups: true,
        requireAdminApproval: true, // New setting
        defaultCommissionRate: 10, // Example percentage
        // Delivery
        defaultCurrency: "USD",
        defaultDeliveryFee: 5.00,
        freeDeliveryThreshold: 50.00,
        maxDeliveryRadiusKm: 15,
        // Notifications (placeholders)
        notifyAdminOnNewStore: true,
        notifyUserOnOrderStatus: true,
        // Payments (placeholders)
        stripeApiKey: "sk_test_...", // Example - DO NOT HARDCODE REAL KEYS
        paypalClientId: "...",
        enableCod: true, // Cash on Delivery
        // Appearance (placeholders - theme managed by CSS vars now)
        // primaryColor: "#008080",
        // accentColor: "#FFA500",
    };
}

// Mock function to save settings (replace with actual API call)
async function saveAppSettings(settings: any) {
    console.log("Saving app settings:", settings);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate save delay
    // Simulate potential failure
    // if (Math.random() > 0.8) throw new Error("Server error saving settings.");
    return true; // Assume success
}


export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>({}); // Use 'any' for simplicity, define a type ideally
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

   React.useEffect(() => {
        const loadSettings = async () => {
            setIsLoading(true);
            try {
                const currentSettings = await getAppSettings();
                setSettings(currentSettings);
            } catch (error) {
                console.error("Failed to load app settings:", error);
                 toast({ title: "Error", description: "Could not load application settings.", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        };
        loadSettings();
    }, [toast]);

   const handleInputChange = (key: string, value: string | number | boolean) => {
        setSettings((prev: any) => ({ ...prev, [key]: value }));
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);
         try {
            const success = await saveAppSettings(settings);
             if (success) {
                toast({ title: "Settings Saved", description: "Application settings have been updated successfully." });
             } else {
                 throw new Error("Failed to save settings on the server.");
             }
         } catch (error: any) {
             console.error("Failed to save settings:", error);
             toast({ title: "Error Saving Settings", description: error.message || "Could not save settings. Please try again.", variant: "destructive" });
         } finally {
             setIsSaving(false);
         }
    };

   // Simple Loading State
    if (isLoading) {
        return (
            <div className="space-y-8 max-w-4xl mx-auto">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-10 w-1/3" />
                    <Skeleton className="h-10 w-28" />
                </div>
                 <Card className="border"><CardHeader><Skeleton className="h-6 w-1/4 mb-2" /><Skeleton className="h-4 w-1/2" /></CardHeader><CardContent className="pt-4"><Skeleton className="h-32 w-full" /></CardContent></Card>
                 <Card className="border"><CardHeader><Skeleton className="h-6 w-1/4 mb-2" /><Skeleton className="h-4 w-1/2" /></CardHeader><CardContent className="pt-4"><Skeleton className="h-24 w-full" /></CardContent></Card>
                 <Card className="border"><CardHeader><Skeleton className="h-6 w-1/4 mb-2" /><Skeleton className="h-4 w-1/2" /></CardHeader><CardContent className="pt-4"><Skeleton className="h-28 w-full" /></CardContent></Card>
                 <Card className="border"><CardHeader><Skeleton className="h-6 w-1/4 mb-2" /><Skeleton className="h-4 w-1/2" /></CardHeader><CardContent className="pt-4"><Skeleton className="h-16 w-full" /></CardContent></Card>
            </div>
        );
    }


  return (
    <div className="space-y-8 max-w-4xl mx-auto"> {/* Limit width for settings page */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-[var(--admin-primary)]"> {/* Use admin theme color */}
            <SettingsIcon className="h-7 w-7" /> Application Settings
          </h1>
           <Button onClick={handleSaveSettings} disabled={isSaving || isLoading} size="lg">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save All Settings
          </Button>
      </div>

      {/* General Settings */}
      <Card className="shadow-md border"> {/* Added shadow */}
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl"><Info className="h-5 w-5 text-primary"/>General</CardTitle> {/* Updated Icon */}
          <CardDescription>Basic application configuration and site-wide settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-4"> {/* Added pt-4 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
             <div className="space-y-1.5"> {/* Increased spacing */}
                 <Label htmlFor="appName">Application Name</Label>
                 <Input id="appName" value={settings.appName || ''} onChange={(e) => handleInputChange('appName', e.target.value)} placeholder="Your Marketplace Name" />
             </div>
              <div className="space-y-1.5">
                <Label htmlFor="defaultCurrency">Default Currency</Label>
                 <Select value={settings.defaultCurrency || 'USD'} onValueChange={(value) => handleInputChange('defaultCurrency', value)}>
                    <SelectTrigger id="defaultCurrency">
                        <SelectValue placeholder="Select Currency" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="USD">USD ($) - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR (€) - Euro</SelectItem>
                        <SelectItem value="GBP">GBP (£) - British Pound</SelectItem>
                        <SelectItem value="CAD">CAD ($) - Canadian Dollar</SelectItem>
                        {/* Add more currencies */}
                    </SelectContent>
                </Select>
             </div>
           </div>
            <div className="space-y-1.5">
                <Label htmlFor="supportEmail">Support Email Address</Label>
                <Input id="supportEmail" type="email" value={settings.supportEmail || ''} onChange={(e) => handleInputChange('supportEmail', e.target.value)} placeholder="support@yourdomain.com" />
                 <p className="text-xs text-muted-foreground">Email address for customer support inquiries.</p>
            </div>
           <Separator/>
           <div className="flex items-center justify-between rounded-md border p-4 bg-background"> {/* Added border and bg */}
               <Label htmlFor="maintenanceMode" className="flex flex-col space-y-1 cursor-pointer">
                    <span className="font-medium">Maintenance Mode</span>
                     <span className="font-normal leading-snug text-muted-foreground text-xs">
                        Temporarily disable user access to the main application for maintenance. Admins can still log in.
                     </span>
                </Label>
               <Switch
                    id="maintenanceMode"
                    checked={settings.maintenanceMode || false}
                    onCheckedChange={(checked) => handleInputChange('maintenanceMode', checked)}
                    className="ml-4"
               />
           </div>
        </CardContent>
      </Card>

       {/* Store Settings */}
      <Card className="shadow-md border"> {/* Added shadow */}
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl"><Store className="h-5 w-5 text-primary"/> Store Settings</CardTitle>
          <CardDescription>Configuration related to store registration, approval, and operation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-4">
            <div className="flex items-center justify-between rounded-md border p-4 bg-background">
               <Label htmlFor="allowStoreSignups" className="flex flex-col space-y-1 cursor-pointer">
                   <span className="font-medium">Allow New Store Signups</span>
                    <span className="font-normal leading-snug text-muted-foreground text-xs">
                       Enable or disable the ability for new vendors to register stores on the platform.
                    </span>
               </Label>
                <Switch
                    id="allowStoreSignups"
                    checked={settings.allowStoreSignups === undefined ? true : settings.allowStoreSignups}
                    onCheckedChange={(checked) => handleInputChange('allowStoreSignups', checked)}
                    className="ml-4"
                />
           </div>
            <div className="flex items-center justify-between rounded-md border p-4 bg-background">
               <Label htmlFor="requireAdminApproval" className="flex flex-col space-y-1 cursor-pointer">
                    <span className="font-medium">Require Admin Approval for New Stores</span>
                     <span className="font-normal leading-snug text-muted-foreground text-xs">
                        If enabled, new stores must be approved by an administrator before they become active.
                     </span>
               </Label>
               <Switch
                    id="requireAdminApproval"
                    checked={settings.requireAdminApproval === undefined ? true : settings.requireAdminApproval}
                    onCheckedChange={(checked) => handleInputChange('requireAdminApproval', checked)}
                    className="ml-4"
                />
           </div>
            <div className="space-y-1.5">
                <Label htmlFor="defaultCommissionRate">Default Commission Rate (%)</Label>
                <Input
                    id="defaultCommissionRate"
                    type="number"
                    min="0" max="100" step="0.1"
                    value={settings.defaultCommissionRate || 0}
                    onChange={(e) => handleInputChange('defaultCommissionRate', parseFloat(e.target.value))}
                     placeholder="e.g., 10"
                />
                <p className="text-xs text-muted-foreground">Default percentage commission charged on store sales.</p>
            </div>
        </CardContent>
      </Card>

       {/* Delivery Settings */}
      <Card className="shadow-md border"> {/* Added shadow */}
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl"><Truck className="h-5 w-5 text-primary"/> Delivery Settings</CardTitle>
          <CardDescription>Configuration for delivery options, fees, and operational radius.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                 <div className="space-y-1.5">
                    <Label htmlFor="defaultDeliveryFee">Default Delivery Fee ({settings.defaultCurrency})</Label>
                    <Input id="defaultDeliveryFee" type="number" step="0.01" min="0" value={settings.defaultDeliveryFee || 0} onChange={(e) => handleInputChange('defaultDeliveryFee', parseFloat(e.target.value))} />
                 </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="freeDeliveryThreshold">Free Delivery Threshold ({settings.defaultCurrency})</Label>
                    <Input id="freeDeliveryThreshold" type="number" step="0.01" min="0" value={settings.freeDeliveryThreshold || 0} onChange={(e) => handleInputChange('freeDeliveryThreshold', parseFloat(e.target.value))} />
                 </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="maxDeliveryRadiusKm">Max Delivery Radius (km)</Label>
                    <Input id="maxDeliveryRadiusKm" type="number" step="1" min="1" value={settings.maxDeliveryRadiusKm || 0} onChange={(e) => handleInputChange('maxDeliveryRadiusKm', parseInt(e.target.value))} />
                 </div>
            </div>
            <p className="text-xs text-muted-foreground">Set base delivery charges and the maximum distance drivers operate within.</p>
             {/* Add more delivery settings, e.g., delivery time slots, driver payout rates */}
        </CardContent>
      </Card>

      {/* Notification Settings */}
       <Card className="shadow-md border"> {/* Added shadow */}
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl"><Bell className="h-5 w-5 text-primary"/> Notification Settings</CardTitle>
          <CardDescription>Control automated email and push notifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
            <div className="flex items-center justify-between rounded-md border p-4 bg-background">
               <Label htmlFor="notifyAdminOnNewStore" className="flex flex-col space-y-1 cursor-pointer">
                    <span className="font-medium">Notify Admins on New Store Signup</span>
                    <span className="font-normal leading-snug text-muted-foreground text-xs">Send an email to admins when a new store registers.</span>
               </Label>
               <Switch id="notifyAdminOnNewStore" checked={settings.notifyAdminOnNewStore || false} onCheckedChange={(checked) => handleInputChange('notifyAdminOnNewStore', checked)} />
            </div>
            <div className="flex items-center justify-between rounded-md border p-4 bg-background">
               <Label htmlFor="notifyUserOnOrderStatus" className="flex flex-col space-y-1 cursor-pointer">
                    <span className="font-medium">Notify Users on Order Status Changes</span>
                    <span className="font-normal leading-snug text-muted-foreground text-xs">Send notifications (email/push) to customers when their order status updates.</span>
               </Label>
               <Switch id="notifyUserOnOrderStatus" checked={settings.notifyUserOnOrderStatus || false} onCheckedChange={(checked) => handleInputChange('notifyUserOnOrderStatus', checked)} />
            </div>
            {/* Add more notification toggles (e.g., driver notifications, promotion alerts) */}
        </CardContent>
       </Card>

        {/* Payment Settings */}
       <Card className="shadow-md border"> {/* Added shadow */}
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl"><CreditCard className="h-5 w-5 text-primary"/> Payment Settings</CardTitle>
          <CardDescription>Configure payment gateways and methods.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-4">
             <div className="space-y-1.5">
                <Label htmlFor="stripeApiKey">Stripe API Key (Secret)</Label>
                <Input id="stripeApiKey" type="password" value={settings.stripeApiKey || ''} onChange={(e) => handleInputChange('stripeApiKey', e.target.value)} placeholder="sk_test_xxxxxxxxxxxxxxxxxxxxx" />
                <p className="text-xs text-muted-foreground">Enter your Stripe secret key to enable card payments. Keep this confidential.</p>
            </div>
             <div className="space-y-1.5">
                <Label htmlFor="paypalClientId">PayPal Client ID</Label>
                <Input id="paypalClientId" value={settings.paypalClientId || ''} onChange={(e) => handleInputChange('paypalClientId', e.target.value)} placeholder="PayPal Client ID..." />
                 <p className="text-xs text-muted-foreground">Enter your PayPal Client ID to enable PayPal payments.</p>
            </div>
            <Separator/>
             <div className="flex items-center justify-between rounded-md border p-4 bg-background">
               <Label htmlFor="enableCod" className="flex flex-col space-y-1 cursor-pointer">
                    <span className="font-medium">Enable Cash on Delivery (COD)</span>
                    <span className="font-normal leading-snug text-muted-foreground text-xs">Allow customers to pay with cash upon delivery.</span>
               </Label>
               <Switch id="enableCod" checked={settings.enableCod || false} onCheckedChange={(checked) => handleInputChange('enableCod', checked)} />
            </div>
        </CardContent>
       </Card>

      {/* Theme/Appearance Settings (Commented out as theme is CSS variable based) */}
      {/* <Card> ... </Card> */}

       <div className="flex justify-end pt-4">
           <Button onClick={handleSaveSettings} disabled={isSaving || isLoading} size="lg">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save All Settings
          </Button>
       </div>
    </div>
  );
}
