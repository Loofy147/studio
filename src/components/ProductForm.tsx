
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
import {Textarea} from "@/components/ui/textarea";
import {createProduct, StoreCategory} from "@/services/store"; // Import createProduct function
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const productSchema = z.object({
  name: z.string().min(2, {
    message: "Product name must be at least 2 characters.",
  }),
  description: z.string().max(160, {
    message: "Description must not exceed 160 characters.",
  }),
  price: z.number().min(0.01, {
    message: "Price must be greater than 0.",
  }),
  imageUrl: z.string().url({
    message: "Please enter a valid URL.",
  }).optional(),
  category: z.string(),
  storeId: z.string()
});

type ProductSchemaType = z.infer<typeof productSchema>;

interface ProductFormProps {
  onProductCreated: (productName: string) => void;
  storeId: string;
  storeCategory: StoreCategory;
}

export function ProductForm({onProductCreated, storeId, storeCategory}: ProductFormProps) {
  const [isCreating, setIsCreating] = useState(false);

  const form = useForm<ProductSchemaType>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0.01,
      category: "",
      storeId: storeId
    },
  });

  async function onSubmit(values: ProductSchemaType) {
    setIsCreating(true);
    try {
      // Call the createProduct function
      const newProduct = await createProduct(values);
      // Notify the parent component
      onProductCreated(newProduct.name);
      // Reset the form
      form.reset();
    } catch (error) {
      console.error("Error creating product:", error);
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
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="My Awesome Product" {...field} />
              </FormControl>
              <FormDescription>
                What is your product called?
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
                  placeholder="A brief description of what your product offers."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Write a short description for your product.
              </FormDescription>
              <FormMessage/>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({field}) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="9.99" {...field} />
              </FormControl>
              <FormDescription>
                What is the price of your product?
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
              <FormControl>
                 <Input placeholder="Category" {...field} />
              </FormControl>
              <FormDescription>
                What category does your product belong to?
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
                Provide a URL for an image that represents your product.
              </FormDescription>
              <FormMessage/>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isCreating}>
          {isCreating ? "Creating..." : "Create Product"}
        </Button>
      </form>
    </Form>
  );
}
