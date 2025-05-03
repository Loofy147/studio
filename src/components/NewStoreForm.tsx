
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
import {StoreCategory, createStore} from "@/services/store"; // Import createStore function

const storeSchema = z.object({
  name: z.string().min(2, {
    message: "Store name must be at least 2 characters.",
  }),
  description: z.string().max(160, {
    message: "Description must not exceed 160 characters.",
  }),
  category: z.enum(['electronics', 'clothing', 'groceries', 'books', 'home goods', 'toys', 'other']),
  imageUrl: z.string().url({
    message: "Please enter a valid URL.",
  }).optional(),
});

type StoreSchemaType = z.infer<typeof storeSchema>;

interface NewStoreFormProps {
  onStoreCreated: (storeName: string) => void;
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
    },
  });

  async function onSubmit(values: StoreSchemaType) {
    setIsCreating(true);
    try {
      // Call the createStore function
      const newStore = await createStore(values, userId);
      // Notify the parent component
      onStoreCreated(newStore.name);
      // Reset the form
      form.reset();
    } catch (error) {
      console.error("Error creating store:", error);
      // Handle error appropriately
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                What is your store called?
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
                  placeholder="A brief description of what your store offers."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Write a short description for your store.
              </FormDescription>
              <FormMessage/>
            </FormItem>
          )}
        />
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
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="groceries">Groceries</SelectItem>
                  <SelectItem value="books">Books</SelectItem>
                  <SelectItem value="home goods">Home Goods</SelectItem>
                  <SelectItem value="toys">Toys</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
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
                <Input placeholder="https://example.com/image.jpg" {...field} />
              </FormControl>
              <FormDescription>
                Provide a URL for an image that represents your store.
              </FormDescription>
              <FormMessage/>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isCreating}>
          {isCreating ? "Creating..." : "Create Store"}
        </Button>
      </form>
    </Form>
  );
}
