
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserProfile, getUserProfile } from '@/services/store'; // Assuming UserProfile type and fetch function
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Loader2, Mail, Lock, Phone, User } from 'lucide-react'; // Import User icon
import Link from 'next/link';
import { AccountSettingsSkeleton } from '@/components/Skeletons'; // Import skeleton

// Mock update functions (replace with actual API calls)
async function updateProfileInfo(userId: string, data: { name?: string; phone?: string }) {
    console.log(`Updating profile info for ${userId}:`, data);
    await new Promise(resolve => setTimeout(resolve, 600));
    return true; // Simulate success
}
async function updateEmail(userId: string, newEmail: string) {
    console.log(`Updating email for ${userId} to ${newEmail}`);
    await new Promise(resolve => setTimeout(resolve, 800));
    return true; // Simulate success
}
async function updatePassword(userId: string, currentPass: string, newPass: string) {
    console.log(`Updating password for ${userId}`);
    // Simulate password verification and update
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (currentPass === "password123") { // Mock current password check
        return true;
    }
    throw new Error("Incorrect current password.");
}


export default function AccountSettingsPage() {
    const userId = "user123"; // Hardcoded for demo
    const { toast } = useToast();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // State for editable fields
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    const [isSavingInfo, setIsSavingInfo] = useState(false);
    const [isSavingEmail, setIsSavingEmail] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            try {
                const profileData = await getUserProfile(userId);
                setProfile(profileData);
                if (profileData) {
                    setName(profileData.name);
                    setPhone(profileData.phone || "");
                    setEmail(profileData.email);
                }
            } catch (error) {
                console.error("Failed to load profile:", error);
                toast({ title: "Error", description: "Could not load profile data.", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [userId, toast]);


    const handleSaveInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;
        setIsSavingInfo(true);
        try {
            await updateProfileInfo(userId, { name, phone });
            // Optimistically update local state or refetch
            setProfile(prev => prev ? { ...prev, name, phone } : null);
            toast({ title: "Profile Updated", description: "Your name and phone number have been updated." });
        } catch (error) {
             toast({ title: "Error", description: "Failed to update profile information.", variant: "destructive" });
        } finally {
            setIsSavingInfo(false);
        }
    };

    const handleSaveEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile || email === profile.email) return;
        // Add email validation if needed
        setIsSavingEmail(true);
         try {
            await updateEmail(userId, email);
            setProfile(prev => prev ? { ...prev, email } : null);
            toast({ title: "Email Update Requested", description: "Please check your new email address for verification." }); // Simulate verification step
        } catch (error) {
             toast({ title: "Error", description: "Failed to update email address.", variant: "destructive" });
        } finally {
            setIsSavingEmail(false);
        }
    };

     const handleSavePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile || !currentPassword || !newPassword || newPassword !== confirmNewPassword) {
             if (newPassword !== confirmNewPassword) {
                toast({ title: "Passwords Mismatch", description: "New passwords do not match.", variant: "destructive" });
             } else {
                 toast({ title: "Missing Fields", description: "Please fill in all password fields.", variant: "destructive" });
             }
            return;
        }
        setIsSavingPassword(true);
         try {
            await updatePassword(userId, currentPassword, newPassword);
            toast({ title: "Password Updated", description: "Your password has been changed successfully." });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
        } catch (error: any) {
             toast({ title: "Error Updating Password", description: error.message || "Failed to update password.", variant: "destructive" });
        } finally {
            setIsSavingPassword(false);
        }
    };


    if (isLoading) {
        return <AccountSettingsSkeleton />;
    }

    if (!profile) {
         return (
            <div className="container mx-auto py-10 text-center">
                <p className="text-muted-foreground">Could not load profile data.</p>
                  <Link href="/profile" passHref>
                     <Button variant="outline" className="mt-4">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile
                    </Button>
                 </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 space-y-10 max-w-3xl">
            <div>
                <Link href="/profile" passHref>
                    <Button variant="ghost" size="sm" className="mb-2 text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
                <p className="text-muted-foreground">Manage your personal information, email, and password.</p>
            </div>

            {/* Personal Information */}
            <Card>
                 <form onSubmit={handleSaveInfo}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary"/>Personal Information</CardTitle>
                        <CardDescription>Update your name and phone number.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g., 555-123-4567" />
                        </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4 justify-end">
                        <Button type="submit" disabled={isSavingInfo || (name === profile.name && phone === (profile.phone || ''))}>
                            {isSavingInfo ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Changes
                        </Button>
                    </CardFooter>
                 </form>
            </Card>

            {/* Email Address */}
             <Card>
                 <form onSubmit={handleSaveEmail}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5 text-primary"/>Email Address</CardTitle>
                        <CardDescription>Update your login email. Verification may be required.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4 justify-end">
                        <Button type="submit" disabled={isSavingEmail || email === profile.email}>
                            {isSavingEmail ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Update Email
                        </Button>
                    </CardFooter>
                 </form>
            </Card>

             {/* Change Password */}
             <Card>
                 <form onSubmit={handleSavePassword}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5 text-primary"/>Change Password</CardTitle>
                        <CardDescription>Update your account password.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                        </div>
                         <div className="space-y-1">
                            <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                            <Input id="confirmNewPassword" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required />
                        </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4 justify-end">
                        <Button type="submit" disabled={isSavingPassword || !currentPassword || !newPassword || !confirmNewPassword || newPassword !== confirmNewPassword}>
                            {isSavingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Update Password
                        </Button>
                    </CardFooter>
                 </form>
            </Card>

             {/* Add sections for Payment Methods, Notifications etc. here */}

        </div>
    );
}
