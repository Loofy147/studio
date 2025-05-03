
'use client';

import React, { useState } from 'react';
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
import { createProduct, StoreCategory, Product } from "@/services/store"; // Import Product type
import { useToast } from "@/hooks/use-toast"; // Import toast
import { Separator } from '@/components/ui/separator'; // Import Separator

const productSchema = z.object({
  name: z.string().min(2, {
    message: "Product name must be at least 2 characters.",
  }).max(80, { message: "Product name cannot exceed 80 characters." }),
  description: z.string().max(500, { // Increased max length
    message: "Description must not exceed 500 characters.",
  }).min(5, { message: "Description must be at least 5 characters." }),
  price: z.coerce.number().min(0.01, { // Use coerce for string input from number field
    message: "Price must be greater than 0.",
  }),
  imageUrl: z.string().url({
    message: "Please enter a valid URL.",
  }).optional().or(z.literal('')), // Allow empty string or valid URL
  category: z.string().min(1, { message: "Category is required." }).max(50, {message: "Category cannot exceed 50 characters."}), // Make category required
  storeId: z.string().min(1, { message: "Store ID is required." }), // Ensure storeId is part of the schema and required
  // Add optional fields based on Product interface
  ingredients: z.array(z.string()).optional(),
  size: z.string().optional(),
});

type ProductSchemaType = z.infer<typeof productSchema>;

interface ProductFormProps {
  onProductCreated: (product: Product) => void; // Pass the full product object
  storeId: string;
  storeCategory: StoreCategory;
   // Optional: Pass existing product for editing
  // initialData?: Product;
}

export function ProductForm({ onProductCreated, storeId, storeCategory /*, initialData */ }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<ProductSchemaType>({
    resolver: zodResolver(productSchema),
    defaultValues: /* initialData ? {
        ...initialData,
        price: initialData.price ?? 0.01, // Ensure price is a number
        imageUrl: initialData.imageUrl ?? '', // Handle optional image URL
        category: initialData.category ?? '', // Ensure category is a string
        storeId: storeId, // Ensure storeId is always set
    } : */ {
      name: "",
      description: "",
      price: 0.01,
      category: "",
      imageUrl: "",
      storeId: storeId, // Set storeId from props
      ingredients: [],
      size: "",
    },
  });

  async function onSubmit(values: ProductSchemaType) {
    setIsSubmitting(true);
    try {
      // Here you would differentiate between create and update based on initialData
      // const apiCall = initialData ? updateProduct(initialData.id, values) : createProduct(values);
      // For now, we only implement create
       const productPayload = {
            ...values,
            imageUrl: values.imageUrl || undefined, // Ensure empty string becomes undefined
            ingredients: values.ingredients && values.ingredients.length > 0 ? values.ingredients : undefined,
            size: values.size || undefined,
        };
      const newProduct = await createProduct(productPayload);
      onProductCreated(newProduct);
      form.reset(); // Reset form after successful creation/update
    } catch (error) {
      console.error("Error saving product:", error);
       toast({
         title: "Error Saving Product",
         description: "Could not save the product. Please check the details and try again.",
         variant: "destructive",
       });
       // Optionally set form error: form.setError("root", { message: "..." });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Determine if specific fields should be shown based on store category
  const showIngredients = ['restaurants', 'groceries', 'coffee shops'].includes(storeCategory);
  const showSize = ['clothing', 'coffee shops', 'shoes'].includes(storeCategory); // Example categories needing size (add 'shoes' if needed)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6"> {/* Reduced spacing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Increased gap */}
            <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Product Name*</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., Organic Fuji Apples, Crew Neck T-Shirt" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
             <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Price (USD)*</FormLabel>
                    <FormControl>
                        <Input type="number" step="0.01" placeholder="9.99" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>

        <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Product Category*</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., Fruits, T-Shirts, Laptops, Main Course" {...field} />
                </FormControl>
                <FormDescription>
                    A specific category for this product (e.g., 'Shirts', 'Vegetables'). This helps customers filter items.
                </FormDescription>
                <FormMessage />
                </FormItem>
            )}
        />


        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description*</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detailed description of the product, including features, materials, etc."
                  rows={4} // Slightly taller textarea
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Conditional Fields */}
        {(showIngredients || showSize) && <Separator className="my-6" />}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {showIngredients && (
                <FormField
                    control={form.control}
                    name="ingredients"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Ingredients (Optional)</FormLabel>
                        <FormControl>
                            {/* Improve this input later - maybe tags input */}
                            <Input placeholder="Comma-separated, e.g., Flour, Water, Salt" {...field} onChange={e => field.onChange(e.target.value.split(',').map(s => s.trim()).filter(s => s))} value={Array.isArray(field.value) ? field.value.join(', ') : ''} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            )}

            {showSize && (
                <FormField
                    control={form.control}
                    name="size"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Size (Optional)</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., M, L, 12oz, Large" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            )}
        </div>


        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL (Optional)</FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://example.com/product-image.jpg" {...field} />
              </FormControl>
              <FormDescription>
                Link to an image of your product.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting /* || !form.formState.isValid <- Enable if needed */}>
              {isSubmitting ? "Saving..." : /* initialData ? "Update Product" : */ "Create Product"}
            </Button>
        </div>
      </form>
    </Form>
  );
}
