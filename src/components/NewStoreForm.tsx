
'use client';

import React, {useState} from 'react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";
import {StoreCategory, createStore, Store} from "@/services/store"; // Import createStore function and Store type

// Expanded categories
const storeCategories: StoreCategory[] = [
  'electronics', 'clothing', 'groceries', 'books', 'home goods', 'toys', 'restaurants', 'coffee shops', 'other'
];

const storeSchema = z.object({
  name: z.string().min(2, {
    message: "Store name must be at least 2 characters.",
  }).max(50, { message: "Store name cannot exceed 50 characters."}),
  description: z.string().min(10, { message: "Description must be at least 10 characters."}).max(160, {
    message: "Description must not exceed 160 characters.",
  }),
  category: z.enum(storeCategories, { required_error: "Please select a store category."}),
  imageUrl: z.string().url({
    message: "Please enter a valid URL.",
  }).optional().or(z.literal('')), // Allow empty string
  address: z.string().optional(),
  openingHours: z.string().optional(),
});

type StoreSchemaType = z.infer<typeof storeSchema>;

interface NewStoreFormProps {
  onStoreCreated: (store: Store) => void; // Pass the full store object
  userId: string; // Assuming you have a way to identify the user
}

export function NewStoreForm({onStoreCreated, userId}: NewStoreFormProps) {
  const [isCreating, setIsCreating] = useState(false);

  const form = useForm<StoreSchemaType>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "other",
      imageUrl: "",
      address: "",
      openingHours: "",
    },
  });

  async function onSubmit(values: StoreSchemaType) {
    setIsCreating(true);
    try {
      // Call the createStore function
      // Explicitly pass undefined for optional fields if they are empty strings
      const storePayload = {
          ...values,
          imageUrl: values.imageUrl || undefined,
          address: values.address || undefined,
          openingHours: values.openingHours || undefined,
      };
      const newStore = await createStore(storePayload, userId);
      // Notify the parent component
      onStoreCreated(newStore);
      // Reset the form
      form.reset();
    } catch (error) {
      console.error("Error creating store:", error);
      // Handle error appropriately - maybe set a form error
      form.setError("root", { message: "Failed to create store. Please try again." });
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {form.formState.errors.root && (
            <FormMessage>{form.formState.errors.root.message}</FormMessage>
        )}
        <FormField
          control={form.control}
          name="name"
          render={({field}) => (
            <FormItem>
              <FormLabel>Store Name</FormLabel>
              <FormControl>
                <Input placeholder="My Awesome Store" {...field} />
              </FormControl>
              <FormDescription>
                What is your store called? (Max 50 characters)
              </FormDescription>
              <FormMessage/>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({field}) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A brief description of what your store offers. (Max 160 characters)"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="category"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category"/>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {storeCategories.map(cat => (
                          <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    What type of store is this?
                  </FormDescription>
                  <FormMessage/>
                </FormItem>
              )}
            />
            <FormField
                control={form.control}
                name="imageUrl"
                render={({field}) => (
                    <FormItem>
                    <FormLabel>Image URL (Optional)</FormLabel>
                    <FormControl>
                        <Input type="url" placeholder="https://..." {...field} />
                    </FormControl>
                    <FormDescription>
                        Link to an image representing your store (logo or banner).
                    </FormDescription>
                    <FormMessage/>
                    </FormItem>
                )}
            />
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <FormField
                control={form.control}
                name="address"
                render={({field}) => (
                    <FormItem>
                    <FormLabel>Address (Optional)</FormLabel>
                    <FormControl>
                        <Input placeholder="123 Main St, Anytown" {...field} />
                    </FormControl>
                    <FormDescription>
                        Store's physical address, if applicable.
                    </FormDescription>
                    <FormMessage/>
                    </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="openingHours"
                render={({field}) => (
                    <FormItem>
                    <FormLabel>Opening Hours (Optional)</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Mon-Fri: 9 AM - 6 PM, Sat: 10 AM - 4 PM" {...field} />
                    </FormControl>
                    <FormDescription>
                        Your store's operating hours.
                    </FormDescription>
                    <FormMessage/>
                    </FormItem>
                )}
            />
        </div>
        <Button type="submit" disabled={isCreating}>
          {isCreating ? "Creating..." : "Create Store"}
        </Button>
      </form>
    </Form>
  );
}
