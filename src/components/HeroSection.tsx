
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface HeroSectionProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
}

export function HeroSection({ searchTerm, onSearchChange }: HeroSectionProps) {
    return (
        <section className="text-center py-16 md:py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/5 rounded-xl shadow-lg border border-primary/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full opacity-30 -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-secondary/10 rounded-full opacity-30 translate-x-1/3 translate-y-1/3 blur-3xl"></div>

            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="h1 text-primary mb-4 relative z-10"
            >
                Welcome to SwiftDispatch!
            </motion.h1>
            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="lead max-w-2xl mx-auto relative z-10"
            >
                Discover local gems, find unique products, and get everything delivered swiftly to your door.
            </motion.p>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-8 relative w-full max-w-xl mx-auto z-10"
            >
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search stores, products, or categories..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-12 pr-4 py-3 text-base shadow-xl rounded-full border-primary/30 focus:ring-2 focus:ring-primary/50 focus:border-primary h-12"
                />
            </motion.div>
        </section>
    );
}
