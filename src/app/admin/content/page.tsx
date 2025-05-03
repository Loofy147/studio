'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; // For editing content
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText as FileTextIcon, Save, Loader2 } from 'lucide-react'; // Added Loader2 for saving state
import { useToast } from "@/hooks/use-toast";

// Mock function to get content (replace with actual API call)
async function getPageContent(pageKey: string): Promise<string> {
    console.log(`Fetching content for: ${pageKey}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    // Mock content
    const contentMap: Record<string, string> = {
        'about_us': '## About SwiftDispatch Marketplace\n\nWe connect local stores with customers, offering fast and reliable delivery.\n\n* Our Mission\n* Our Values',
        'terms_of_service': '# Terms of Service\n\nPlease read these terms carefully...\n\n**Last Updated:** January 1, 2024',
        'privacy_policy': '# Privacy Policy\n\nYour privacy is important to us...\n\nWe collect information to...',
        'faq': '## Frequently Asked Questions\n\n**Q: How does ordering work?**\nA: Simply browse stores, add items to your cart, and checkout!\n\n**Q: What are the delivery fees?**\nA: Delivery fees vary based on distance and store.'
    };
    return contentMap[pageKey] || `Content for ${pageKey} not found.`;
}

// Mock function to save content (replace with actual API call)
async function savePageContent(pageKey: string, content: string): Promise<boolean> {
    console.log(`Saving content for: ${pageKey}`);
    console.log("Content:", content);
    await new Promise(resolve => setTimeout(resolve, 700));
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
                description: `Content for '${selectedPage.replace('_', ' ')}' has been updated.`,
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
       <Card>
            <CardHeader className="flex flex-row justify-between items-center">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <FileTextIcon className="h-6 w-6" /> Content Management
                    </CardTitle>
                    <CardDescription>Manage static content pages for the application.</CardDescription>
                </div>
                <Button onClick={handleSave} disabled={isSaving || isLoading || !content}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Content
                </Button>
            </CardHeader>
             <CardContent className="space-y-4">
                 {/* Page Selector */}
                 <div className="w-full md:w-[300px]">
                     <Select value={selectedPage} onValueChange={setSelectedPage}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a page to edit" />
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
                    <label htmlFor="content-editor" className="text-sm font-medium mb-2 block">Edit Content (Markdown Supported)</label>
                    {isLoading ? (
                        <Skeleton className="h-[400px] w-full rounded-md" />
                    ) : (
                         <Textarea
                            id="content-editor"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={`Enter content for ${selectedPage.replace('_', ' ')}...`}
                            className="min-h-[400px] font-mono text-sm" // Use monospace for markdown
                            disabled={isSaving}
                        />
                    )}
                 </div>
             </CardContent>
        </Card>
    </div>
  );
}
```