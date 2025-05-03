
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
import { Trash2 } from 'lucide-react';

const offerSchema = z.object({
  name: z.string().min(3, { message: "Offer name must be at least 3 characters." }),
  description: z.string().max(200, { message: "Description must not exceed 200 characters." }).min(10, { message: "Description must be at least 10 characters." }),
  price: z.coerce.number().min(0.01, { message: "Price must be greater than 0." }), // Use coerce for string input
  frequency: z.enum(['daily', 'weekly']),
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
  const [selectedItems, setSelectedItems] = useState<OfferSchemaType['items']>([]);

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
      items: [],
      isActive: true,
      imageUrl: "",
      storeId: storeId,
    },
  });

  // Sync selectedItems with form state
  useEffect(() => {
     form.setValue('items', selectedItems);
     // Trigger validation for items field when selectedItems change
     form.trigger('items');
  }, [selectedItems, form]);


  const handleAddItem = (productId: string) => {
    setSelectedItems(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        // Increase quantity if item already exists
        return prev.map(item => item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item);
      } else {
        // Add new item
        return [...prev, { productId, quantity: 1 }];
      }
    });
  };

  const handleRemoveItem = (productId: string) => {
     setSelectedItems(prev => prev.filter(item => item.productId !== productId));
  };

   const handleQuantityChange = (productId: string, change: number) => {
        setSelectedItems(prev => prev.map(item =>
            item.productId === productId
                ? { ...item, quantity: Math.max(1, item.quantity + change) } // Ensure quantity >= 1
                : item
        ));
    };

  async function onSubmit(values: OfferSchemaType) {
    setIsCreating(true);
    try {
      const newOffer = await createDailyOffer(values);
      onOfferCreated(newOffer);
      form.reset(); // Reset form after successful creation
      setSelectedItems([]); // Clear selected items
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {form.formState.errors.root && (
            <FormMessage>{form.formState.errors.root.message}</FormMessage>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Offer Name</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Daily Lunch Special, Weekly Veggie Box" {...field} />
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
                    <FormLabel>Frequency</FormLabel>
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe the offer for your customers..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

         {/* Product Selection */}
         <div className="space-y-4">
             <Label>Included Products</Label>
              {availableProducts.length > 0 ? (
                <div className="max-h-60 overflow-y-auto border rounded-md p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableProducts.map(product => {
                         const selectedItem = selectedItems.find(item => item.productId === product.id);
                        return (
                            <div key={product.id} className={`flex items-center justify-between p-3 rounded-md border ${selectedItem ? 'bg-primary/10 border-primary/30' : 'bg-background'}`}>
                                <div className="flex items-center gap-3">
                                     <Image
                                        src={product.imageUrl || `https://picsum.photos/seed/${product.id}/100/100`}
                                        alt={product.name}
                                        width={32}
                                        height={32}
                                        className="rounded-sm object-cover flex-shrink-0"
                                    />
                                    <div>
                                        <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                                        <p className="text-xs text-muted-foreground">{formatCurrency(product.price)}</p>
                                    </div>
                                </div>
                                {selectedItem ? (
                                    <div className="flex items-center gap-1.5">
                                        <Button type="button" variant="outline" size="icon" className="h-6 w-6" onClick={() => handleQuantityChange(product.id, -1)}> - </Button>
                                        <span className="text-sm font-medium w-4 text-center">{selectedItem.quantity}</span>
                                         <Button type="button" variant="outline" size="icon" className="h-6 w-6" onClick={() => handleQuantityChange(product.id, 1)}> + </Button>
                                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleRemoveItem(product.id)}>
                                            <Trash2 className="h-3.5 w-3.5"/>
                                        </Button>
                                    </div>
                                ) : (
                                     <Button type="button" variant="outline" size="sm" onClick={() => handleAddItem(product.id)}>Add</Button>
                                )}
                            </div>
                        );
                    })}
                </div>
               ) : (
                 <p className="text-sm text-muted-foreground italic">You need to add some products to your store first.</p>
               )}
              {/* Display form error for items array */}
              {form.formState.errors.items && (
                <p className="text-sm font-medium text-destructive">{form.formState.errors.items.message || form.formState.errors.items?.root?.message}</p>
              )}
         </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Offer Price</FormLabel>
                  <FormControl>
                     <Input type="number" step="0.01" placeholder="19.99" {...field} />
                  </FormControl>
                   <FormDescription>
                     Set the price for one delivery cycle ({field.value && totalItemsValue > 0 && field.value < totalItemsValue ?
                        <span className='text-green-600 font-medium'>Save {formatCurrency(totalItemsValue - field.value)}!</span> :
                        <span>Total value: {formatCurrency(totalItemsValue)}</span>
                     })
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
                        <Input placeholder="https://example.com/offer-image.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-background">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Activate Offer
                </FormLabel>
                <FormDescription>
                  Make this offer available for customers to subscribe to.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isCreating || !form.formState.isValid}>
          {isCreating ? "Creating Offer..." : /* initialData ? "Update Offer" : */ "Create Offer"}
        </Button>
      </form>
    </Form>
  );
}
