
'use client';

import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// Updated: Replaced Motorcycle with Moped
import { Truck as TruckIcon, User, Mail, Phone, Car, Moped, Bike, Info } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const driverApplicationSchema = z.object({
  name: z.string().min(2, { message: "Full name must be at least 2 characters." }).max(100),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  vehicleType: z.enum(['car', 'motorcycle', 'bicycle', 'van', 'scooter', 'other'], {
    required_error: "You need to select a vehicle type.",
  }),
  otherVehicleType: z.string().optional(),
  // Add other necessary fields like:
  // address: z.string().min(5, { message: "Address is required." }),
  // city: z.string().min(2, { message: "City is required." }),
  // state: z.string().min(2, { message: "State is required." }),
  // zipCode: z.string().min(5, { message: "Zip code is required." }),
  // licenseNumber: z.string().optional(), // Required based on vehicle type
  // insuranceInfo: z.string().optional(), // Required based on vehicle type
}).refine((data) => {
  // Require 'otherVehicleType' if 'other' is selected
  if (data.vehicleType === 'other' && !data.otherVehicleType) {
    return false;
  }
  return true;
}, {
  message: "Please specify your vehicle type.",
  path: ["otherVehicleType"], // Point error to this field
});

type DriverApplicationFormValues = z.infer<typeof driverApplicationSchema>;

// Mock submit function (replace with actual API call)
async function submitDriverApplication(data: DriverApplicationFormValues): Promise<{ success: boolean; message: string }> {
  console.log("Submitting driver application:", data);
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
  // Simulate success/failure
  if (Math.random() > 0.1) {
    return { success: true, message: "Application submitted successfully! We'll review it and get back to you soon." };
  } else {
    return { success: false, message: "Failed to submit application. Please try again later." };
  }
}


export default function DriverApplyPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{ success: boolean; message: string } | null>(null);

  const form = useForm<DriverApplicationFormValues>({
    resolver: zodResolver(driverApplicationSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      vehicleType: undefined,
      otherVehicleType: "",
    },
    mode: "onChange", // Validate on change for better UX
  });

  const vehicleType = form.watch("vehicleType"); // Watch for changes in vehicle type

  async function onSubmit(data: DriverApplicationFormValues) {
    setIsSubmitting(true);
    setSubmissionResult(null);
    const result = await submitDriverApplication(data);
    setSubmissionResult(result);
    if (result.success) {
      toast({
        title: "Application Submitted!",
        description: result.message,
      });
      form.reset(); // Reset form on success
    } else {
      toast({
        title: "Submission Failed",
        description: result.message,
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  }

   const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };
   const resultVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, type: 'spring' } },
  };

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
       <motion.div initial="hidden" animate="visible" variants={formVariants}>
            <Card className="shadow-xl border-primary/20">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-teal-500 text-primary-foreground p-6 rounded-t-lg">
                    <div className="flex items-center gap-3">
                        <TruckIcon className="h-8 w-8" />
                        <CardTitle className="text-3xl font-bold">Become a SwiftDispatch Driver</CardTitle>
                    </div>
                    <CardDescription className="text-blue-100 mt-1">
                        Join our delivery team! Complete the form below to get started.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    {submissionResult ? (
                         <motion.div
                            key="result"
                            initial="hidden"
                            animate="visible"
                            variants={resultVariants}
                            className="text-center py-8"
                         >
                            <Alert variant={submissionResult.success ? "default" : "destructive"} className="mb-6">
                                <Info className="h-4 w-4" />
                                <AlertTitle>{submissionResult.success ? "Success!" : "Oops!"}</AlertTitle>
                                <AlertDescription>{submissionResult.message}</AlertDescription>
                            </Alert>
                            {submissionResult.success ? (
                                <Link href="/" passHref>
                                    <Button variant="outline">Back to Homepage</Button>
                                </Link>
                            ) : (
                                <Button onClick={() => setSubmissionResult(null)}>Try Again</Button>
                            )}
                         </motion.div>
                    ) : (
                        <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                             {/* Personal Information */}
                            <div className="space-y-4 border p-4 rounded-md bg-background">
                                <h3 className="text-lg font-semibold flex items-center gap-2 text-primary"><User className="h-5 w-5"/>Personal Information</h3>
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Email Address</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="you@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Phone Number</FormLabel>
                                        <FormControl>
                                            <Input type="tel" placeholder="(555) 123-4567" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Vehicle Information */}
                            <div className="space-y-4 border p-4 rounded-md bg-background">
                                <h3 className="text-lg font-semibold flex items-center gap-2 text-primary"><Car className="h-5 w-5"/>Vehicle Information</h3>
                                <FormField
                                    control={form.control}
                                    name="vehicleType"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Primary Vehicle Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select your main delivery vehicle" />
                                            </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="car"><div className="flex items-center gap-2"><Car className="h-4 w-4 text-muted-foreground"/>Car</div></SelectItem>
                                                {/* Updated: Replaced Motorcycle with Moped */}
                                                <SelectItem value="motorcycle"><div className="flex items-center gap-2"><Moped className="h-4 w-4 text-muted-foreground"/>Motorcycle</div></SelectItem>
                                                <SelectItem value="bicycle"><div className="flex items-center gap-2"><Bike className="h-4 w-4 text-muted-foreground"/>Bicycle</div></SelectItem>
                                                <SelectItem value="scooter">Scooter</SelectItem>
                                                <SelectItem value="van">Van/Truck</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {vehicleType === 'other' && (
                                    <FormField
                                        control={form.control}
                                        name="otherVehicleType"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Please Specify Vehicle Type</FormLabel>
                                            <FormControl>
                                            <Input placeholder="e.g., Electric Cargo Bike" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                )}
                                {/* Add fields for license, insurance based on vehicle type */}
                            </div>

                            {/* Submission Button */}
                            <Button type="submit" disabled={isSubmitting} className="w-full py-3 text-lg font-semibold">
                                {isSubmitting ? "Submitting Application..." : "Submit Application"}
                            </Button>
                        </form>
                        </Form>
                    )}
                </CardContent>
            </Card>
       </motion.div>
    </div>
  );
}
