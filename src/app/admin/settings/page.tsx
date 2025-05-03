'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Settings as SettingsIcon, Save, Loader2, Store, Palette, Truck } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock function to get settings (replace with actual API call)
async function getAppSettings() {
    console.log("Fetching app settings...");
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
        appName: "SwiftDispatch Marketplace",
        defaultCurrency: "USD",
        allowStoreSignups: true,
        maintenanceMode: false,
        supportEmail: "support@swiftdispatch.example",
        // Add theme/color settings if applicable
        primaryColor: "#008080", // Teal (example)
        accentColor: "#FFA500", // Orange (example)
        // Delivery Settings
        defaultDeliveryFee: 5.00,
        freeDeliveryThreshold: 50.00,
        maxDeliveryRadiusKm: 15,
    };
}

// Mock function to save settings (replace with actual API call)
async function saveAppSettings(settings: any) {
    console.log("Saving app settings:", settings);
    await new Promise(resolve => setTimeout(resolve, 800));
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
                toast({ title: "Settings Saved", description: "Application settings have been updated." });
             } else {
                 throw new Error("Failed to save settings on the server.");
             }
         } catch (error) {
             console.error("Failed to save settings:", error);
             toast({ title: "Error Saving Settings", description: "Could not save settings. Please try again.", variant: "destructive" });
         } finally {
             setIsSaving(false);
         }
    };

   // Simple Loading State
    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-1/3" />
                <Card><CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
                 <Card><CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader><CardContent><Skeleton className="h-32 w-full" /></CardContent></Card>
                  <Card><CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader><CardContent><Skeleton className="h-24 w-full" /></CardContent></Card>
            </div>
        );
    }


  return (
    <div className="space-y-8 max-w-4xl mx-auto"> {/* Limit width for settings page */}
      <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <SettingsIcon className="h-7 w-7" /> Application Settings
          </h1>
           <Button onClick={handleSaveSettings} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save All Settings
          </Button>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>Basic application configuration.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
             <div className="space-y-1">
                 <Label htmlFor="appName">Application Name</Label>
                 <Input id="appName" value={settings.appName || ''} onChange={(e) => handleInputChange('appName', e.target.value)} />
             </div>
              <div className="space-y-1">
                <Label htmlFor="defaultCurrency">Default Currency</Label>
                 <Select value={settings.defaultCurrency || 'USD'} onValueChange={(value) => handleInputChange('defaultCurrency', value)}>
                    <SelectTrigger id="defaultCurrency">
                        <SelectValue placeholder="Select Currency" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        {/* Add more currencies */}
                    </SelectContent>
                </Select>
             </div>
           </div>
            <div className="space-y-1">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input id="supportEmail" type="email" value={settings.supportEmail || ''} onChange={(e) => handleInputChange('supportEmail', e.target.value)} />
            </div>
           <div className="flex items-center space-x-2 pt-2">
                <Switch id="maintenanceMode" checked={settings.maintenanceMode || false} onCheckedChange={(checked) => handleInputChange('maintenanceMode', checked)} />
                <Label htmlFor="maintenanceMode">Enable Maintenance Mode</Label>
           </div>
           <p className="text-xs text-muted-foreground">If enabled, users will see a maintenance page instead of the app.</p>
        </CardContent>
      </Card>

       {/* Store Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Store className="h-5 w-5"/> Store Settings</CardTitle>
          <CardDescription>Configuration related to stores and vendors.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
                <Switch id="allowStoreSignups" checked={settings.allowStoreSignups === undefined ? true : settings.allowStoreSignups} onCheckedChange={(checked) => handleInputChange('allowStoreSignups', checked)} />
                <Label htmlFor="allowStoreSignups">Allow New Store Signups</Label>
           </div>
           <p className="text-xs text-muted-foreground">Control whether new vendors can register stores on the platform.</p>
            {/* Add other store-related settings, e.g., commission rate, review settings */}
        </CardContent>
      </Card>

       {/* Delivery Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5"/> Delivery Settings</CardTitle>
          <CardDescription>Configuration for delivery options and fees.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                 <div className="space-y-1">
                    <Label htmlFor="defaultDeliveryFee">Default Delivery Fee ($)</Label>
                    <Input id="defaultDeliveryFee" type="number" step="0.01" value={settings.defaultDeliveryFee || 0} onChange={(e) => handleInputChange('defaultDeliveryFee', parseFloat(e.target.value))} />
                 </div>
                  <div className="space-y-1">
                    <Label htmlFor="freeDeliveryThreshold">Free Delivery Threshold ($)</Label>
                    <Input id="freeDeliveryThreshold" type="number" step="0.01" value={settings.freeDeliveryThreshold || 0} onChange={(e) => handleInputChange('freeDeliveryThreshold', parseFloat(e.target.value))} />
                 </div>
                  <div className="space-y-1">
                    <Label htmlFor="maxDeliveryRadiusKm">Max Delivery Radius (km)</Label>
                    <Input id="maxDeliveryRadiusKm" type="number" step="1" value={settings.maxDeliveryRadiusKm || 0} onChange={(e) => handleInputChange('maxDeliveryRadiusKm', parseInt(e.target.value))} />
                 </div>
            </div>
             {/* Add more delivery settings, e.g., delivery time slots, driver payout rates */}
        </CardContent>
      </Card>

      {/* Theme/Appearance Settings (Optional) */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5"/> Appearance</CardTitle>
           <CardDescription>Customize the look and feel of the application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <Input id="primaryColor" type="color" value={settings.primaryColor || '#008080'} onChange={(e) => handleInputChange('primaryColor', e.target.value)} className="h-10" />
                </div>
                 <div className="space-y-1">
                    <Label htmlFor="accentColor">Accent Color</Label>
                    <Input id="accentColor" type="color" value={settings.accentColor || '#FFA500'} onChange={(e) => handleInputChange('accentColor', e.target.value)} className="h-10" />
                </div>
            </div>
            {/* Add Logo upload functionality here */ //}
      {/* </CardContent> */}
      {/* </Card> */}

       <div className="flex justify-end pt-4">
           <Button onClick={handleSaveSettings} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save All Settings
          </Button>
       </div>
    </div>
  );
}

// Add Skeleton component if not imported globally
import { Skeleton } from "@/components/ui/skeleton";
```