
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ShoppingCart, Trash2, Package, CreditCard, Truck, MapPin } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn, formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { DeliveryAddress, UserProfile, getUserProfile } from '@/services/store'; // Import necessary types/functions
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

// Mock cart items (replace with actual cart state management)
interface CartItem {
    productId: string;
    storeId: string;
    storeName: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl?: string;
    category?: string; // Added category
}

const initialCartItems: CartItem[] = [
    { productId: 'store-1-prod-1-laptop', storeId: 'store-1', storeName: 'ElectroMart', name: 'Premium Laptop', price: 1200, quantity: 1, imageUrl: 'https://picsum.photos/seed/electromart-laptop-1/100/100', category: 'electronics' },
    { productId: 'store-3-prod-1-apple', storeId: 'store-3', storeName: 'FreshGrocer', name: 'Organic Apple', price: 0.8, quantity: 5, imageUrl: 'https://picsum.photos/seed/freshgrocer-apple-1/100/100', category: 'groceries' },
    { productId: 'store-9-prod-1-latte', storeId: 'store-9', storeName: 'The Daily Grind', name: 'Large Latte', price: 4.5, quantity: 2, imageUrl: 'https://picsum.photos/seed/dailygrind-latte-1/100/100', category: 'coffee shops' },
];

export default function CartPage() {
    const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);
    const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>(undefined); // Store selected address ID
    const [deliveryMethod, setDeliveryMethod] = useState<string>("standard"); // "standard", "express"
    const [promoCode, setPromoCode] = useState<string>("");
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const { toast } = useToast();
    const userId = "user123"; // Hardcoded for demo

     useEffect(() => {
        const fetchProfile = async () => {
            setIsLoadingProfile(true);
            try {
                const profile = await getUserProfile(userId);
                setUserProfile(profile);
                // Set default delivery address if available
                const defaultAddr = profile?.addresses.find(a => a.isDefault);
                if (defaultAddr) {
                    setSelectedAddressId(defaultAddr.id);
                } else if (profile?.addresses && profile.addresses.length > 0) {
                     setSelectedAddressId(profile.addresses[0].id); // Fallback to first address
                }
            } catch (err) {
                console.error("Failed to load user profile for cart:", err);
                toast({ title: "Error", description: "Could not load your addresses.", variant: "destructive" });
            } finally {
                 setIsLoadingProfile(false);
            }
        };
        fetchProfile();
    }, [userId, toast]);


    const handleQuantityChange = (productId: string, change: number) => {
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.productId === productId
                    ? { ...item, quantity: Math.max(1, item.quantity + change) } // Ensure quantity >= 1
                    : item
            )
        );
    };

    const handleRemoveItem = (productId: string) => {
        const itemToRemove = cartItems.find(item => item.productId === productId);
        setCartItems(prevItems => prevItems.filter(item => item.productId !== productId));
         if (itemToRemove) {
            toast({
                title: "Item Removed",
                description: `${itemToRemove.name} removed from your cart.`,
                variant: "destructive" // Or default
            });
        }
    };

    const calculateSubtotal = () => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const subtotal = calculateSubtotal();
    // Mock fees and discounts
    const deliveryFee = deliveryMethod === "express" ? 7.99 : 3.99;
    const taxes = subtotal * 0.08; // 8% tax rate example
    const discount = promoCode.toUpperCase() === 'SAVE10' ? subtotal * 0.10 : 0; // 10% discount
    const total = subtotal + deliveryFee + taxes - discount;

    const handlePlaceOrder = () => {
        if (!selectedAddressId) {
            toast({ title: "Missing Information", description: "Please select a delivery address.", variant: "destructive" });
            return;
        }
        if (cartItems.length === 0) {
             toast({ title: "Empty Cart", description: "Your cart is empty.", variant: "destructive" });
            return;
        }
        console.log("Placing order with:", { cartItems, deliveryAddressId: selectedAddressId, deliveryMethod, promoCode, total });
        // In a real app: send order to backend, clear cart, navigate to order confirmation
        toast({ title: "Order Placed!", description: "Thank you for your purchase!" });
        setCartItems([]); // Clear cart on successful order (mock)
    };

     const formatAddress = (addr: DeliveryAddress | undefined) => {
        if (!addr) return "Select address";
        return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}`;
    };

    const selectedAddressObj = userProfile?.addresses.find(a => a.id === selectedAddressId);

     const CartItemSkeleton = () => (
        <div className="flex items-center gap-4 py-4">
            <Skeleton className="h-16 w-16 rounded-md bg-muted/50" />
            <div className="flex-grow space-y-1.5">
                <Skeleton className="h-5 w-3/4 bg-muted/50" />
                <Skeleton className="h-4 w-1/2 bg-muted/50" />
                <Skeleton className="h-4 w-1/4 bg-muted/50" />
            </div>
            <div className="flex items-center gap-2">
                 <Skeleton className="h-8 w-8 bg-muted/50" />
                 <Skeleton className="h-5 w-5 bg-muted/50" />
                 <Skeleton className="h-8 w-8 bg-muted/50" />
            </div>
             <Skeleton className="h-8 w-8 bg-muted/50" />
        </div>
    );

     const AddressSelectorSkeleton = () => (
         <div className="space-y-2">
             <Skeleton className="h-5 w-24 bg-muted/50" />
             <Skeleton className="h-10 w-full bg-muted/50" />
         </div>
     )


    return (
        <div className="container mx-auto px-4 py-12 space-y-10">
            <div className="flex items-center gap-3 border-b pb-4">
                <ShoppingCart className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight">Your Shopping Cart</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                {/* Cart Items Section */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="shadow-sm border">
                        <CardHeader>
                            <CardTitle>Items in Cart ({cartItems.length})</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {cartItems.length > 0 ? (
                                <div className="divide-y">
                                    {cartItems.map(item => (
                                        <div key={item.productId} className="flex items-center gap-4 px-4 py-4 hover:bg-muted/30 transition-colors duration-150">
                                            <Image
                                                src={item.imageUrl || `https://picsum.photos/seed/${item.productId}/100/100`}
                                                alt={item.name}
                                                width={64}
                                                height={64}
                                                className="rounded-md object-cover border bg-muted"
                                                 data-ai-hint={`${item.category} product`}
                                            />
                                            <div className="flex-grow">
                                                <Link href={`/store/${item.storeId}?product=${item.productId}`} className="font-semibold text-base hover:text-primary hover:underline line-clamp-1">{item.name}</Link>
                                                <p className="text-sm text-muted-foreground">From: <Link href={`/store/${item.storeId}`} className="hover:underline">{item.storeName}</Link></p>
                                                <p className="text-sm font-medium">{formatCurrency(item.price)}</p>
                                            </div>
                                            <div className="flex items-center gap-2 border rounded-md p-1">
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleQuantityChange(item.productId, -1)}> - </Button>
                                                <span className="text-sm font-medium w-5 text-center">{item.quantity}</span>
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleQuantityChange(item.productId, 1)}> + </Button>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleRemoveItem(item.productId)} title="Remove Item">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-10 text-center text-muted-foreground">
                                     <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30"/>
                                    <p>Your cart is currently empty.</p>
                                    <Link href="/" passHref>
                                        <Button variant="link" className="mt-2 text-primary">Continue Shopping</Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Order Summary Section */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="shadow-sm border sticky top-24"> {/* Make summary sticky */}
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Delivery Address Selector */}
                             <div className="space-y-2">
                                <Label htmlFor="delivery-address" className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary"/>Delivery Address</Label>
                                {isLoadingProfile ? <AddressSelectorSkeleton /> : (
                                    <Select value={selectedAddressId} onValueChange={setSelectedAddressId} disabled={!userProfile?.addresses || userProfile.addresses.length === 0}>
                                        <SelectTrigger id="delivery-address">
                                            <SelectValue placeholder={userProfile?.addresses?.length === 0 ? "No addresses saved" : "Select delivery address"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {userProfile?.addresses.map(addr => (
                                                <SelectItem key={addr.id} value={addr.id}>
                                                    {addr.label} - {addr.street.substring(0, 20)}...
                                                </SelectItem>
                                            ))}
                                             <Separator className="my-1"/>
                                             <Link href="/profile#addresses" passHref>
                                                 <p className="text-xs px-2 py-1.5 hover:bg-accent rounded-sm cursor-pointer">Manage Addresses</p>
                                            </Link>
                                        </SelectContent>
                                    </Select>
                                )}
                                {selectedAddressObj && <p className="text-xs text-muted-foreground px-1">{formatAddress(selectedAddressObj)}</p>}
                             </div>

                            {/* Delivery Method */}
                             <div className="space-y-2">
                                <Label className="flex items-center gap-1.5"><Truck className="h-4 w-4 text-primary"/>Delivery Method</Label>
                                <RadioGroup value={deliveryMethod} onValueChange={setDeliveryMethod} className="flex gap-4">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="standard" id="standard" />
                                        <Label htmlFor="standard" className="font-normal">Standard ({formatCurrency(3.99)})</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="express" id="express" />
                                        <Label htmlFor="express" className="font-normal">Express ({formatCurrency(7.99)})</Label>
                                    </div>
                                </RadioGroup>
                             </div>
                             <Separator />

                            {/* Promo Code */}
                             <div className="flex items-end gap-2">
                                <div className="flex-grow space-y-1">
                                     <Label htmlFor="promo-code">Promo Code</Label>
                                     <Input id="promo-code" placeholder="Enter code" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} />
                                </div>
                                 <Button variant="secondary" disabled={!promoCode}>Apply</Button>
                             </div>
                             <Separator />

                             {/* Cost Breakdown */}
                             <div className="space-y-1.5 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Delivery Fee</span>
                                    <span>{formatCurrency(deliveryFee)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Est. Taxes</span>
                                    <span>{formatCurrency(taxes)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span className="text-muted-foreground">Discount</span>
                                        <span>-{formatCurrency(discount)}</span>
                                    </div>
                                )}
                                 <Separator className="my-2"/>
                                 <div className="flex justify-between font-semibold text-base">
                                    <span>Total</span>
                                    <span>{formatCurrency(total)}</span>
                                 </div>
                             </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" size="lg" onClick={handlePlaceOrder} disabled={cartItems.length === 0 || !selectedAddressId || isLoadingProfile}>
                                <CreditCard className="mr-2 h-5 w-5" /> Proceed to Checkout
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
