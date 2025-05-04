'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BrainCircuit, Save, Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

// Mock function to get AI model configuration (replace with actual API call or service)
async function getAiModelConfig(): Promise<{ systemPrompt: string, modelName: string }> {
    console.log("Fetching AI model config...");
    await new Promise(resolve => setTimeout(resolve, 400));
    return {
        systemPrompt: "You are a helpful assistant for the SwiftDispatch marketplace. Your primary goal is to optimize delivery routes considering traffic and weather. You can use the 'getWeather' tool to fetch current weather conditions. Respond concisely and focus on providing the best route and estimated arrival time.",
        modelName: "gemini-1.5-flash-latest", // Example model name
    };
}

// Mock function to save AI model configuration
async function saveAiModelConfig(config: { systemPrompt: string, modelName: string }): Promise<boolean> {
    console.log("Saving AI model config:", config);
    await new Promise(resolve => setTimeout(resolve, 900));
    // Simulate potential save error
    // if (Math.random() > 0.8) throw new Error("Failed to save configuration to AI service.");
    return true; // Assume success
}

export default function AdminAiModelPage() {
    const [config, setConfig] = useState<{ systemPrompt: string, modelName: string } | null>(null);
    const [systemPrompt, setSystemPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const loadConfig = async () => {
            setIsLoading(true);
            try {
                const loadedConfig = await getAiModelConfig();
                setConfig(loadedConfig);
                setSystemPrompt(loadedConfig.systemPrompt);
            } catch (error) {
                console.error("Failed to load AI config:", error);
                toast({ title: "Error", description: "Could not load AI model configuration.", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        };
        loadConfig();
    }, [toast]);

    const handleSave = async () => {
        if (!config || !systemPrompt) return;
        setIsSaving(true);
        try {
            const success = await saveAiModelConfig({ ...config, systemPrompt });
            if (success) {
                setConfig(prev => prev ? { ...prev, systemPrompt } : null); // Update local state
                toast({ title: "Configuration Saved", description: "AI model system prompt updated successfully." });
            } else {
                throw new Error("Server indicated failure.");
            }
        } catch (error: any) {
            toast({ title: "Error Saving", description: error.message || "Could not save AI configuration.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-[var(--admin-primary)]">
                <BrainCircuit className="h-7 w-7" /> AI Model Management
            </h1>
            <p className="text-muted-foreground">
                Configure the behavior and parameters of the AI models used within the platform (e.g., route optimization).
            </p>

            <Card className="shadow-md border">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2"><Wand2 className="h-5 w-5"/>Route Optimization AI</CardTitle>
                    <CardDescription>Adjust the system prompt that guides the AI route optimization model.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                    {isLoading ? (
                        <div className="space-y-3">
                             <Skeleton className="h-5 w-24" /> {/* Model Name Label */}
                             <Skeleton className="h-6 w-48" /> {/* Model Name Value */}
                             <Skeleton className="h-5 w-32" /> {/* Prompt Label */}
                            <Skeleton className="h-48 w-full rounded-md" /> {/* Textarea Skeleton */}
                        </div>
                    ) : config ? (
                        <>
                             <div>
                                <Label className="text-xs font-semibold text-muted-foreground">Underlying Model</Label>
                                <p className="text-sm font-medium mt-1 font-mono bg-muted px-2 py-1 rounded-md inline-block">{config.modelName}</p>
                             </div>
                            <div>
                                <Label htmlFor="system-prompt">System Prompt</Label>
                                <Textarea
                                    id="system-prompt"
                                    value={systemPrompt}
                                    onChange={(e) => setSystemPrompt(e.target.value)}
                                    placeholder="Define the AI's role, capabilities, constraints, and desired output format..."
                                    className="min-h-[250px] font-mono text-sm mt-1 border rounded-md"
                                    disabled={isSaving}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    This prompt instructs the AI on how to behave. Mention available tools (like 'getWeather') and desired output structure.
                                </p>
                            </div>
                        </>
                    ) : (
                        <p className="text-destructive">Could not load AI configuration.</p>
                    )}
                </CardContent>
                 <CardFooter className="border-t pt-4 flex justify-end">
                    <Button onClick={handleSave} disabled={isSaving || isLoading || !config || systemPrompt === config?.systemPrompt}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Prompt
                    </Button>
                </CardFooter>
            </Card>

             {/* Placeholder for other AI model configurations */}
            {/* <Card>
                 <CardHeader>
                    <CardTitle>Product Recommendation AI</CardTitle>
                    <CardDescription>Configure the product recommendation engine. (Placeholder)</CardDescription>
                </CardHeader>
                 <CardContent>
                    <p className="text-muted-foreground italic">Recommendation AI settings will appear here.</p>
                 </CardContent>
            </Card> */}
        </div>
    );
}
