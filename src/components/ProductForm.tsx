
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

const productSchema = z.object({
  name: z.string().min(2, {
    message: "Product name must be at least 2 characters.",
  }),
  description: z.string().max(500, { // Increased max length
    message: "Description must not exceed 500 characters.",
  }).min(5, { message: "Description must be at least 5 characters." }),
  price: z.coerce.number().min(0.01, { // Use coerce for string input from number field
    message: "Price must be greater than 0.",
  }),
  imageUrl: z.string().url({
    message: "Please enter a valid URL.",
  }).optional().or(z.literal('')), // Allow empty string or valid URL
  category: z.string().min(1, { message: "Category is required." }), // Make category required
  storeId: z.string(),
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
    } : */ {
      name: "",
      description: "",
      price: 0.01,
      category: "",
      imageUrl: "",
      storeId: storeId,
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
      const newProduct = await createProduct(values);
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
  const showSize = ['clothing', 'coffee shops'].includes(storeCategory); // Example categories needing size

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6"> {/* Reduced spacing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., Organic Fuji Apples, Classic Crew Neck T-Shirt" {...field} />
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
                    <FormLabel>Price (USD)</FormLabel>
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
                <FormLabel>Product Category</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., Fruits, T-Shirts, Laptops, Main Course" {...field} />
                </FormControl>
                <FormDescription>
                    A specific category for this product (e.g., 'Shirts', 'Vegetables', 'Laptops').
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
              <FormLabel>Description</FormLabel>
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
        {showIngredients && (
             <FormField
                control={form.control}
                name="ingredients"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Ingredients (Optional)</FormLabel>
                    <FormControl>
                         {/* Improve this input later - maybe tags input */}
                        <Input placeholder="Comma-separated list, e.g., Flour, Water, Salt" {...field} onChange={e => field.onChange(e.target.value.split(',').map(s => s.trim()))} value={field.value?.join(', ')} />
                    </FormControl>
                     <FormDescription>
                        List the main ingredients if applicable.
                    </FormDescription>
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
                     <FormDescription>
                        Enter the size if applicable (e.g., S, M, L, 12oz).
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
            />
        )}


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
                Link to an image of your product. Leave blank if none.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting || !form.formState.isValid}>
          {isSubmitting ? "Saving..." : /* initialData ? "Update Product" : */ "Create Product"}
        </Button>
      </form>
    </Form>
  );
}
