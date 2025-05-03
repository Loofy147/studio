
'use client';

import React, { useState, useEffect } from 'react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createDailyOffer, DailyOffer, Product } from "@/services/store"; // Import necessary types/functions
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from '@/lib/utils';
import { Label } from "@/components/ui/label";
import { Trash2, Minus, Plus } from 'lucide-react'; // Added icons
import Image from 'next/image'; // Import Image
import { Separator } from '@/components/ui/separator'; // Import Separator

const offerSchema = z.object({
  name: z.string().min(3, { message: "Offer name must be at least 3 characters." }).max(80, { message: "Offer name cannot exceed 80 characters." }),
  description: z.string().max(200, { message: "Description must not exceed 200 characters." }).min(10, { message: "Description must be at least 10 characters." }),
  price: z.coerce.number().min(0.01, { message: "Price must be greater than 0." }), // Use coerce for string input
  frequency: z.enum(['daily', 'weekly'], { required_error: "Please select frequency." }),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.coerce.number().min(1, { message: "Quantity must be at least 1." })
  })).min(1, { message: "Offer must include at least one product." }),
  isActive: z.boolean().default(true),
  imageUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')), // Allow empty string
  storeId: z.string(), // Store ID is required
});

type OfferSchemaType = z.infer<typeof offerSchema>;

interface DailyOfferFormProps {
  onOfferCreated: (offer: DailyOffer) => void;
  storeId: string;
  availableProducts: Product[];
  // Optional: Pass existing offer for editing
  // initialData?: DailyOffer;
}

export function DailyOfferForm({ onOfferCreated, storeId, availableProducts /*, initialData */ }: DailyOfferFormProps) {
  const [isCreating, setIsCreating] = useState(false);
  // Use form state directly for items instead of separate state
  // const [selectedItems, setSelectedItems] = useState<OfferSchemaType['items']>([]);

  const form = useForm<OfferSchemaType>({
    resolver: zodResolver(offerSchema),
    defaultValues: /* initialData ? {
        ...initialData,
        price: initialData.price ?? 0.01, // Ensure price is a number
        imageUrl: initialData.imageUrl ?? '',
    } : */ {
      name: "",
      description: "",
      price: 0.01,
      frequency: "daily",
      items: [], // Initialize items within form defaultValues
      isActive: true,
      imageUrl: "",
      storeId: storeId,
    },
  });

  // Watch the items field from the form state
  const selectedItems = form.watch('items');

  const handleAddItem = (productId: string) => {
     const currentItems = form.getValues('items');
     const existingIndex = currentItems.findIndex(item => item.productId === productId);

     if (existingIndex > -1) {
        // Increase quantity if item already exists
        currentItems[existingIndex].quantity += 1;
        form.setValue('items', [...currentItems], { shouldValidate: true }); // Update form state and trigger validation
     } else {
        // Add new item
        form.setValue('items', [...currentItems, { productId, quantity: 1 }], { shouldValidate: true });
     }
  };

  const handleRemoveItem = (productId: string) => {
     const currentItems = form.getValues('items');
     form.setValue('items', currentItems.filter(item => item.productId !== productId), { shouldValidate: true });
  };

   const handleQuantityChange = (productId: string, change: number) => {
       const currentItems = form.getValues('items');
       const itemIndex = currentItems.findIndex(item => item.productId === productId);
       if (itemIndex > -1) {
           currentItems[itemIndex].quantity = Math.max(1, currentItems[itemIndex].quantity + change); // Ensure quantity >= 1
           form.setValue('items', [...currentItems], { shouldValidate: true });
       }
    };

  async function onSubmit(values: OfferSchemaType) {
    setIsCreating(true);
    try {
        const offerPayload = {
            ...values,
            imageUrl: values.imageUrl || undefined, // Ensure empty string becomes undefined
        };
      const newOffer = await createDailyOffer(offerPayload);
      onOfferCreated(newOffer);
      form.reset(); // Reset form after successful creation
      // setSelectedItems([]); // No longer needed as form state handles items
    } catch (error) {
      console.error("Error creating offer:", error);
      // Display error toast or message to the user
      form.setError("root", { message: "Failed to create offer. Please try again." }); // Set root error
    } finally {
      setIsCreating(false);
    }
  }

   // Calculate total value of selected items
   const totalItemsValue = selectedItems.reduce((acc, currentItem) => {
        const product = availableProducts.find(p => p.id === currentItem.productId);
        return acc + (product ? product.price * currentItem.quantity : 0);
    }, 0);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {form.formState.errors.root && (
            <FormMessage>{form.formState.errors.root.message}</FormMessage>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Offer Name*</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Daily Lunch Special" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Frequency*</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select delivery frequency" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description*</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe the offer for your customers..." rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

         {/* Product Selection */}
         <div className="space-y-3">
             <Label>Included Products*</Label>
              {availableProducts.length > 0 ? (
                <div className="max-h-72 overflow-y-auto border rounded-md p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availableProducts.map(product => {
                         const selectedItem = selectedItems.find(item => item.productId === product.id);
                        return (
                            <div key={product.id} className={`flex items-center justify-between p-2 rounded-md border transition-colors ${selectedItem ? 'bg-primary/10 border-primary/30' : 'bg-background hover:bg-muted/50'}`}>
                                <div className="flex items-center gap-2 overflow-hidden">
                                     <Image
                                        src={product.imageUrl || `https://picsum.photos/seed/${product.id}/100/100`}
                                        alt={product.name}
                                        width={36}
                                        height={36}
                                        className="rounded-sm object-cover flex-shrink-0 bg-muted"
                                    />
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-medium truncate">{product.name}</p>
                                        <p className="text-xs text-muted-foreground">{formatCurrency(product.price)}</p>
                                    </div>
                                </div>
                                {selectedItem ? (
                                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                                        <Button type="button" variant="outline" size="icon" className="h-6 w-6" onClick={() => handleQuantityChange(product.id, -1)}> <Minus className="h-3 w-3"/> </Button>
                                        <span className="text-sm font-medium w-4 text-center">{selectedItem.quantity}</span>
                                         <Button type="button" variant="outline" size="icon" className="h-6 w-6" onClick={() => handleQuantityChange(product.id, 1)}> <Plus className="h-3 w-3"/> </Button>
                                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={() => handleRemoveItem(product.id)}>
                                            <Trash2 className="h-3.5 w-3.5"/>
                                        </Button>
                                    </div>
                                ) : (
                                     <Button type="button" variant="outline" size="sm" onClick={() => handleAddItem(product.id)} className="h-7 px-2 text-xs flex-shrink-0 ml-2">Add</Button>
                                )}
                            </div>
                        );
                    })}
                </div>
               ) : (
                 <p className="text-sm text-muted-foreground italic border p-4 rounded-md text-center">You need to add some products to your store first before creating offers.</p>
               )}
              {/* Display form error for items array */}
              {/* Bind the error message to the FormField */}
               <FormField
                    control={form.control}
                    name="items" // Target the items array for validation message
                    render={() => (
                        <FormMessage />
                    )}
                />
         </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Offer Price*</FormLabel>
                  <FormControl>
                     <Input type="number" step="0.01" placeholder="19.99" {...field} />
                  </FormControl>
                   <FormDescription>
                     Set the price per delivery cycle. (Base value: {formatCurrency(totalItemsValue)})
                      {field.value && totalItemsValue > 0 && field.value < totalItemsValue && (
                        <span className='text-green-600 font-medium ml-1'>Save {formatCurrency(totalItemsValue - field.value)}!</span>
                     )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

             <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Offer Image URL (Optional)</FormLabel>
                    <FormControl>
                        <Input type="url" placeholder="https://example.com/offer-image.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>

        <Separator />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-background">
               <div className="space-y-1 leading-none">
                 <FormLabel>
                  Activate Offer
                 </FormLabel>
                 <FormDescription>
                  Make this offer available for customers to subscribe to immediately.
                 </FormDescription>
               </div>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="ml-auto"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end">
            <Button type="submit" disabled={isCreating /* || !form.formState.isValid <- Enable if needed */}>
              {isCreating ? "Creating Offer..." : /* initialData ? "Update Offer" : */ "Create Offer"}
            </Button>
        </div>
      </form>
    </Form>
  );
}
