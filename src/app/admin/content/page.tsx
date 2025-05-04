'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; // For editing content
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText as FileTextIcon, Save, Loader2 } from 'lucide-react'; // Added Loader2 for saving state
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

// Mock function to get content (replace with actual API call)
async function getPageContent(pageKey: string): Promise<string> {
    console.log(`Fetching content for: ${pageKey}`);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
    // Mock content
    const contentMap: Record<string, string> = {
        'about_us': '## About SwiftDispatch Marketplace\n\nWelcome to SwiftDispatch, your central hub for discovering local stores and getting products delivered quickly and reliably.\n\n### Our Mission\nTo connect local businesses with their communities through a seamless online marketplace and efficient delivery network.\n\n### Our Values\n* Reliability\n* Community Focus\n* Speed & Efficiency\n* Customer Satisfaction',
        'terms_of_service': '# Terms of Service\n\nPlease read these terms and conditions carefully before using the SwiftDispatch platform.\n\n**1. Acceptance of Terms**\nBy accessing or using SwiftDispatch, you agree to be bound by these Terms.\n\n**2. Service Description**\nSwiftDispatch provides an online marketplace connecting users with local stores and delivery drivers...\n\n**Last Updated:** June 15, 2024',
        'privacy_policy': '# Privacy Policy\n\nYour privacy is important to us. This Privacy Policy explains how SwiftDispatch collects, uses, and protects your personal information.\n\n**1. Information We Collect**\nWe collect information you provide directly, such as name, email, address, and payment details...\n\n**2. How We Use Information**\nTo process orders, facilitate deliveries, improve our services, and communicate with you...\n\n**Last Updated:** June 15, 2024',
        'faq': '## Frequently Asked Questions\n\n**Q: How does ordering work?**\nA: Simply browse stores by category or search, add items to your cart, select a delivery address and payment method, and place your order!\n\n**Q: What are the delivery fees?**\nA: Delivery fees vary based on distance from the store and the selected delivery speed (standard/express).\n\n**Q: How can I track my order?**\nA: You can track your order in real-time from the "My Orders" section in your profile.\n\n**Q: How do I become a driver?**\nA: Visit the "Become a Driver" page and submit an application. You\'ll need a valid license, insurance, and a suitable vehicle.'
    };
    return contentMap[pageKey] || `# Content for ${pageKey}\n\nStart adding content here using Markdown.`;
}

// Mock function to save content (replace with actual API call)
async function savePageContent(pageKey: string, content: string): Promise<boolean> {
    console.log(`Saving content for: ${pageKey}`);
    console.log("Content:", content);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate save delay
    // Simulate potential save failure
    // return Math.random() > 0.1;
    return true; // Assume success for now
}


export default function AdminContentPage() {
  const [selectedPage, setSelectedPage] = useState<string>('about_us');
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const { toast } = useToast();

  React.useEffect(() => {
    const loadContent = async () => {
      if (!selectedPage) return;
      setIsLoading(true);
      setContent(''); // Clear previous content
      try {
        const pageContent = await getPageContent(selectedPage);
        setContent(pageContent);
      } catch (error) {
        console.error("Failed to load content:", error);
         toast({
            title: "Error Loading Content",
            description: `Could not load content for ${selectedPage}.`,
            variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadContent();
  }, [selectedPage, toast]);

  const handleSave = async () => {
      if (!selectedPage || !content) return;
      setIsSaving(true);
      try {
         const success = await savePageContent(selectedPage, content);
         if (success) {
            toast({
                title: "Content Saved",
                description: `Content for '${selectedPage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}' has been updated successfully.`, // Format title
            });
         } else {
             throw new Error("Failed to save content on the server.");
         }
      } catch (error) {
          console.error("Failed to save content:", error);
          toast({
            title: "Error Saving Content",
            description: `Could not save content for ${selectedPage}. Please try again.`,
            variant: "destructive",
        });
      } finally {
          setIsSaving(false);
      }
  }

  const pageOptions = [
    { value: 'about_us', label: 'About Us' },
    { value: 'terms_of_service', label: 'Terms of Service' },
    { value: 'privacy_policy', label: 'Privacy Policy' },
    { value: 'faq', label: 'FAQ' },
    // Add more static pages as needed
  ];

  return (
    <div className="space-y-6">
       <Card className="shadow-md border"> {/* Added shadow */}
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"> {/* Responsive layout */}
                <div>
                    <CardTitle className="flex items-center gap-2 text-xl text-[var(--admin-primary)]"> {/* Use admin theme color */}
                        <FileTextIcon className="h-5 w-5" /> Content Management
                    </CardTitle>
                    <CardDescription>Manage static content pages like About Us, Terms, Privacy Policy, and FAQs.</CardDescription>
                </div>
                <Button onClick={handleSave} disabled={isSaving || isLoading || !content}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Content
                </Button>
            </CardHeader>
             <CardContent className="space-y-6 pt-4"> {/* Add padding top */}
                 {/* Page Selector */}
                 <div className="w-full md:w-[350px]"> {/* Slightly wider */}
                     <Label htmlFor="page-select" className="text-sm font-medium mb-1 block">Select Page to Edit</Label>
                     <Select value={selectedPage} onValueChange={setSelectedPage} disabled={isLoading || isSaving}>
                        <SelectTrigger id="page-select">
                            <SelectValue placeholder="Select a page..." />
                        </SelectTrigger>
                        <SelectContent>
                            {pageOptions.map(page => (
                                <SelectItem key={page.value} value={page.value}>{page.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                 </div>

                {/* Content Editor */}
                 <div>
                    <Label htmlFor="content-editor" className="text-sm font-medium mb-2 block">Edit Content (Markdown Supported)</Label>
                    {isLoading ? (
                        <Skeleton className="h-[400px] w-full rounded-md border" />
                    ) : (
                         <Textarea
                            id="content-editor"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={`Enter Markdown content for ${pageOptions.find(p=>p.value===selectedPage)?.label}...`}
                            className="min-h-[400px] font-mono text-sm border rounded-md focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-ring" // Monospace font, border, focus style
                            disabled={isSaving}
                        />
                    )}
                 </div>
                  {/* Save button again at the bottom for convenience */}
                  <div className="flex justify-end pt-4">
                       <Button onClick={handleSave} disabled={isSaving || isLoading || !content}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Content
                        </Button>
                  </div>
             </CardContent>
        </Card>
    </div>
  );
}
