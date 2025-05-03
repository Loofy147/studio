
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogBody, // Use DialogBody for content padding
    DialogClose,
} from "@/components/ui/dialog";
import { DeliveryAddress } from '@/services/store';
import { useToast } from '@/hooks/use-toast';

interface AddressFormData {
    id?: string;
    label: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
    isDefault: boolean;
}

interface AddressDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    addressData: AddressFormData | null; // Pass null for adding new
    onSave: (address: AddressFormData) => Promise<void>; // Make async to handle saving state
    userId: string; // Needed for context (though not directly used in form logic here)
    userAddresses: DeliveryAddress[]; // Needed to check default logic
}

export function AddressDialog({
    isOpen,
    onOpenChange,
    addressData,
    onSave,
    userAddresses,
}: AddressDialogProps) {
    const [formData, setFormData] = useState<AddressFormData | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        // Initialize form data when dialog opens or addressData changes
        if (isOpen && addressData) {
            setFormData({ ...addressData });
        } else if (isOpen && !addressData) {
            // Default for adding new
            setFormData({ label: '', street: '', city: '', state: '', zipCode: '', isDefault: userAddresses.length === 0 });
        } else {
            setFormData(null); // Reset form data when closed
        }
    }, [isOpen, addressData, userAddresses.length]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? { ...prev, [name]: value } : null);
    };

    const handleCheckboxChange = (checked: boolean) => {
        setFormData(prev => prev ? { ...prev, isDefault: checked } : null);
    };

    const handleSaveClick = async () => {
        if (!formData) return;

        // Basic validation (more robust validation can be added with zod/react-hook-form)
        if (!formData.label || !formData.street || !formData.city || !formData.state || !formData.zipCode) {
            toast({ title: "Missing Fields", description: "Please fill in all required address fields.", variant: "destructive" });
            return;
        }

        setIsSaving(true);
        try {
            await onSave(formData);
            // onSave should handle closing the dialog on success
        } catch (error) {
            // Error handled in parent component's onSave implementation
            console.error("Error caught in Dialog save handler (should be handled by parent):", error);
        } finally {
            setIsSaving(false);
        }
    };

    // Logic to disable unchecking the default checkbox if it's the only address
    // or if it's the current default and no other address is marked as default
    const isOnlyAddress = userAddresses.length === 1 && !!formData?.id && userAddresses[0].id === formData.id;
    const isTheOnlyDefaultAddress = !!formData?.id && formData.isDefault && userAddresses.length > 1 && !userAddresses.some(addr => addr.id !== formData?.id && addr.isDefault);
    const disableDefaultUncheck = isOnlyAddress || isTheOnlyDefaultAddress;


    if (!formData) return null; // Don't render if no form data (dialog closed)

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[475px]">
                <DialogHeader>
                    <DialogTitle>{formData.id ? 'Edit Address' : 'Add New Address'}</DialogTitle>
                    <DialogDescription>
                        {formData.id ? 'Update your delivery address details.' : 'Enter the details for your new delivery address.'}
                    </DialogDescription>
                </DialogHeader>
                <DialogBody> {/* Use DialogBody for padding */}
                    <div className="grid gap-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="label" className="text-right">Label*</Label>
                            <Input id="label" name="label" value={formData.label} onChange={handleInputChange} className="col-span-3" placeholder="e.g., Home, Work" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="street" className="text-right">Street*</Label>
                            <Input id="street" name="street" value={formData.street} onChange={handleInputChange} className="col-span-3" placeholder="123 Main St" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="city" className="text-right">City*</Label>
                            <Input id="city" name="city" value={formData.city} onChange={handleInputChange} className="col-span-3" placeholder="Anytown" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="state" className="text-right">State*</Label>
                            <Input id="state" name="state" value={formData.state} onChange={handleInputChange} className="col-span-3" placeholder="CA" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="zipCode" className="text-right">Zip Code*</Label>
                            <Input id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleInputChange} className="col-span-3" placeholder="90210" required />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="country" className="text-right">Country</Label>
                            <Input id="country" name="country" value={formData.country || ''} onChange={handleInputChange} className="col-span-3" placeholder="USA (Optional)" />
                        </div>
                        <div className="flex items-center space-x-2 col-start-2 col-span-3">
                            <Checkbox
                                id="isDefault"
                                checked={formData.isDefault}
                                onCheckedChange={handleCheckboxChange}
                                disabled={disableDefaultUncheck}
                            />
                            <Label htmlFor="isDefault" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Set as default address
                            </Label>
                        </div>
                         {disableDefaultUncheck && !formData.isDefault && (
                             <p className="text-xs text-destructive col-start-2 col-span-3">Cannot unset the default address. Set another address as default first.</p>
                         )}
                    </div>
                </DialogBody>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="button" onClick={handleSaveClick} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Address"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
