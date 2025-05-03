
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
import { createPromotion, Promotion, Product, PromotionScope, DiscountType } from "@/services/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

const promotionSchema = z.object({
  name: z.string().min(3, { message: "Promotion name must be at least 3 characters." }).max(80, { message: "Promotion name cannot exceed 80 characters." }),
  description: z.string().max(200, { message: "Description must not exceed 200 characters." }).optional().or(z.literal('')),
  discountType: z.enum(['percentage', 'fixed_amount'], { required_error: "Please select discount type." }),
  discountValue: z.coerce.number().min(0.01, { message: "Discount value must be greater than 0." }),
  scope: z.enum(['all_products', 'specific_products', 'specific_categories'], { required_error: "Please select promotion scope." }),
  applicableIds: z.array(z.string()).optional(), // Array of product IDs or category names
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  promoCode: z.string().max(20, { message: "Promo code cannot exceed 20 characters." }).optional().or(z.literal('')),
  isActive: z.boolean().default(true),
  storeId: z.string().min(1, { message: "Store ID is required." }),
}).refine(data => {
    // Require applicableIds if scope is specific
    if ((data.scope === 'specific_products' || data.scope === 'specific_categories') && (!data.applicableIds || data.applicableIds.length === 0)) {
        return false;
    }
    return true;
}, {
    message: "Please select at least one product or category for specific scopes.",
    path: ["applicableIds"], // Attach error to applicableIds field
}).refine(data => {
    // Ensure endDate is after startDate if both are provided
    if (data.startDate && data.endDate && data.endDate <= data.startDate) {
        return false;
    }
    return true;
}, {
    message: "End date must be after start date.",
    path: ["endDate"],
});


type PromotionSchemaType = z.infer<typeof promotionSchema>;

interface PromotionFormProps {
  onPromotionCreated: (promotion: Promotion) => void;
  storeId: string;
  availableProducts: Product[];
  availableCategories: string[]; // Pass available categories from parent
  // Optional: Pass existing promotion for editing
  // initialData?: Promotion;
}

export function PromotionForm({ onPromotionCreated, storeId, availableProducts, availableCategories /*, initialData */ }: PromotionFormProps) {
  const [isCreating, setIsCreating] = useState(false);
  // State to manage selected products/categories for the UI multiselect
  const [selectedSpecificItems, setSelectedSpecificItems] = useState<string[]>([]);

  const form = useForm<PromotionSchemaType>({
    resolver: zodResolver(promotionSchema),
    defaultValues: /* initialData ? {
        ...initialData,
        discountValue: initialData.discountValue ?? 0.01,
        applicableIds: initialData.applicableIds ?? [],
        startDate: initialData.startDate ? new Date(initialData.startDate) : undefined,
        endDate: initialData.endDate ? new Date(initialData.endDate) : undefined,
        promoCode: initialData.promoCode ?? '',
    } : */ {
      name: "",
      description: "",
      discountType: "percentage",
      discountValue: 10,
      scope: "all_products",
      applicableIds: [],
      startDate: undefined,
      endDate: undefined,
      promoCode: "",
      isActive: true,
      storeId: storeId,
    },
  });

  const currentScope = form.watch('scope');

   // Update form's applicableIds when selectedSpecificItems changes
   useEffect(() => {
        form.setValue('applicableIds', selectedSpecificItems, { shouldValidate: true });
    }, [selectedSpecificItems, form]);

    // Reset selected items when scope changes
    useEffect(() => {
        setSelectedSpecificItems([]);
        form.setValue('applicableIds', [], { shouldValidate: false }); // Reset form value too
    }, [currentScope, form]);


  async function onSubmit(values: PromotionSchemaType) {
    setIsCreating(true);
    try {
        const promotionPayload = {
            ...values,
            description: values.description || undefined,
            promoCode: values.promoCode || undefined,
            applicableIds: (values.scope === 'specific_products' || values.scope === 'specific_categories') ? values.applicableIds : undefined,
        };
      const newPromotion = await createPromotion(promotionPayload);
      onPromotionCreated(newPromotion);
      form.reset();
      setSelectedSpecificItems([]); // Reset local state
    } catch (error) {
      console.error("Error creating promotion:", error);
      form.setError("root", { message: "Failed to create promotion. Please try again." });
    } finally {
      setIsCreating(false);
    }
  }

  const handleItemSelection = (itemId: string, isSelected: boolean) => {
        setSelectedSpecificItems(prev =>
            isSelected ? [...prev, itemId] : prev.filter(id => id !== itemId)
        );
    };

   const itemsToShow = currentScope === 'specific_products' ? availableProducts : currentScope === 'specific_categories' ? availableCategories : [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
         {form.formState.errors.root && (
            <FormMessage>{form.formState.errors.root.message}</FormMessage>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Promotion Name*</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Summer Sale, Weekend Discount" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Short description of the promotion..." rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
                control={form.control}
                name="discountType"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Discount Type*</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select discount type" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed_amount">Fixed Amount ($)</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="discountValue"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Discount Value*</FormLabel>
                    <FormControl>
                        <Input type="number" step={form.getValues('discountType') === 'percentage' ? '1' : '0.01'} placeholder={form.getValues('discountType') === 'percentage' ? '15' : '5.00'} {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>

        <FormField
            control={form.control}
            name="scope"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Promotion Scope*</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select what the promotion applies to" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    <SelectItem value="all_products">All Products</SelectItem>
                    <SelectItem value="specific_products">Specific Products</SelectItem>
                    <SelectItem value="specific_categories">Specific Categories</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
        />

        {/* Conditional Multi-Select for Specific Products/Categories */}
         {(currentScope === 'specific_products' || currentScope === 'specific_categories') && (
             <div className="space-y-2">
                <Label>Select {currentScope === 'specific_products' ? 'Products' : 'Categories'}*</Label>
                 <ScrollArea className="h-48 w-full rounded-md border p-3">
                     <div className="space-y-2">
                         {itemsToShow.length > 0 ? itemsToShow.map((item) => {
                             const itemId = typeof item === 'string' ? item : item.id;
                             const itemName = typeof item === 'string' ? item : item.name;
                             const isChecked = selectedSpecificItems.includes(itemId);
                             return (
                                 <div key={itemId} className="flex items-center space-x-2 p-1.5 rounded hover:bg-muted/50">
                                     <Checkbox
                                         id={`item-${itemId}`}
                                         checked={isChecked}
                                         onCheckedChange={(checked) => handleItemSelection(itemId, !!checked)}
                                     />
                                     <label
                                         htmlFor={`item-${itemId}`}
                                         className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                                     >
                                         {itemName} {typeof item !== 'string' && `(${formatCurrency(item.price)})`}
                                     </label>
                                 </div>
                            );
                         }) : (
                            <p className="text-sm text-muted-foreground p-2 text-center">No {currentScope === 'specific_products' ? 'products' : 'categories'} available to select.</p>
                         )}
                     </div>
                 </ScrollArea>
                  {/* Display form error for applicableIds array */}
                   <FormField
                        control={form.control}
                        name="applicableIds"
                        render={() => (
                            <FormMessage />
                        )}
                    />
             </div>
         )}


        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Start Date (Optional)</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                            )}
                            >
                            {field.value ? (
                                format(field.value, "PPP")
                            ) : (
                                <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                                date < new Date(new Date().setHours(0, 0, 0, 0)) // Disable past dates
                            }
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
             />
            <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>End Date (Optional)</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                            )}
                            >
                            {field.value ? (
                                format(field.value, "PPP")
                            ) : (
                                <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                             disabled={(date) =>
                                date < (form.getValues('startDate') || new Date(new Date().setHours(0, 0, 0, 0))) // Disable dates before start date or today
                            }
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
             />
        </div>

        <FormField
          control={form.control}
          name="promoCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Promo Code (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., SUMMER20, SAVE10" {...field} />
              </FormControl>
               <FormDescription>
                If provided, customers must enter this code to get the discount.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-background">
               <div className="space-y-1 leading-none">
                 <FormLabel>
                  Activate Promotion
                 </FormLabel>
                 <FormDescription>
                  Make this promotion live for customers immediately.
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
            <Button type="submit" disabled={isCreating /* || !form.formState.isValid <- Add validation check if needed */}>
              {isCreating ? "Creating Promotion..." : /* initialData ? "Update Promotion" : */ "Create Promotion"}
            </Button>
        </div>
      </form>
    </Form>
  );
}
