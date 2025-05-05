
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DollarSign, Calendar as CalendarIcon, Download, Filter, Truck, List, TrendingUp, XCircle } from 'lucide-react'; // Added TrendingUp
import { format } from 'date-fns';
import { DateRangePicker } from '@/components/ui/date-range-picker'; // Assuming this component exists or can be created
import { formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion'; // Import motion
import { type DateRange } from 'react-day-picker';
import { ChartTooltipContent, ChartTooltip, ChartContainer, ChartConfig } from '@/components/ui/chart'; // Import Chart components
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'; // Import Recharts components
import { EarningsSkeleton } from '@/components/Skeletons'; // Import skeleton

// Mock Earning Data Structure
interface EarningEntry {
    id: string;
    date: Date;
    tripCount: number;
    distanceKm: number;
    earnings: number;
    tips?: number;
}

interface DriverEarnings {
    totalEarnings: number;
    thisWeekEarnings: number;
    todayEarnings: number;
    recentEntries: EarningEntry[];
    earningsTrend: { date: string; earnings: number }[]; // For chart
}

// Mock function to get earnings (replace with actual API call)
async function getDriverEarnings(driverId: string, dateRange?: DateRange): Promise<DriverEarnings> {
    console.log(`Fetching earnings for driver ${driverId}`, dateRange);
    await new Promise(resolve => setTimeout(resolve, 600)); // Simulate delay

    // Generate more detailed mock entries
    const entries: EarningEntry[] = [];
    let total = 0;
    let weekTotal = 0;
    let todayTotal = 0;
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of current week (Sunday)

    const trendData: { date: string; earnings: number }[] = [];
    const daysToGenerate = 30; // Generate data for the last 30 days

    for (let i = 0; i < daysToGenerate; i++) {
        const date = new Date(todayStart);
        date.setDate(date.getDate() - i);

        if (dateRange && (date < (dateRange.from || date) || date > (dateRange.to || date))) {
             continue; // Skip if outside selected date range
        }


        const tripCount = Math.floor(Math.random() * 8) + 1; // 1-8 trips per day
        const distance = parseFloat((tripCount * (5 + Math.random() * 15)).toFixed(1)); // 5-20km per trip
        const baseEarnings = parseFloat((distance * 0.8 + tripCount * 2).toFixed(2)); // Example earning calculation
        const tips = parseFloat((baseEarnings * (Math.random() * 0.2)).toFixed(2)); // 0-20% tips
        const dailyTotal = baseEarnings + tips;

        entries.push({
            id: `earn-${date.toISOString().slice(0, 10)}`,
            date: date,
            tripCount: tripCount,
            distanceKm: distance,
            earnings: baseEarnings,
            tips: tips,
        });

        total += dailyTotal;
        if (date >= weekStart) {
            weekTotal += dailyTotal;
        }
        if (date.getTime() === todayStart.getTime()) {
            todayTotal += dailyTotal;
        }

        // Aggregate earnings per day for the chart (show last 7 days for example)
         if (i < 7) {
            trendData.push({ date: format(date, 'MMM d'), earnings: parseFloat(dailyTotal.toFixed(2)) });
         }
    }

     trendData.reverse(); // Ensure chronological order for the chart

    return {
        totalEarnings: parseFloat(total.toFixed(2)),
        thisWeekEarnings: parseFloat(weekTotal.toFixed(2)),
        todayEarnings: parseFloat(todayTotal.toFixed(2)),
        recentEntries: entries.sort((a, b) => b.date.getTime() - a.date.getTime()), // Sort newest first
        earningsTrend: trendData,
    };
}

const chartConfig = {
    earnings: {
        label: "Earnings",
        color: "hsl(var(--driver-primary))", // Use driver primary color
    },
} satisfies ChartConfig;


export default function DriverEarningsPage() {
    const driverId = 'driver-001'; // Replace with actual driver ID
    const [earningsData, setEarningsData] = useState<DriverEarnings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined); // State for date range picker

    useEffect(() => {
        const fetchEarnings = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await getDriverEarnings(driverId, dateRange);
                setEarningsData(data);
            } catch (err) {
                console.error("Failed to fetch earnings:", err);
                setError("Could not load earnings data. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchEarnings();
    }, [driverId, dateRange]); // Refetch when dateRange changes

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    };

    if (isLoading) {
        return <EarningsSkeleton />;
    }

    if (error) {
        return (
             <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
             </Alert>
        );
    }

    if (!earningsData) {
        return <p className="text-muted-foreground">Could not load earnings data.</p>;
    }


    return (
        <motion.div
            className="space-y-8"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
            <motion.h1 variants={cardVariants} className="text-3xl font-bold tracking-tight text-[var(--driver-foreground)] flex items-center gap-2">
                <DollarSign className="h-7 w-7 text-primary" /> Your Earnings
            </motion.h1>

            {/* KPI Cards */}
            <motion.section
                variants={cardVariants}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
                 <Card className="bg-[var(--driver-card)] text-[var(--driver-card-foreground)] border-[var(--driver-border)] shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Today's Earnings</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(earningsData.todayEarnings)}</div>
                    </CardContent>
                 </Card>
                <Card className="bg-[var(--driver-card)] text-[var(--driver-card-foreground)] border-[var(--driver-border)] shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">This Week's Earnings</CardTitle>
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(earningsData.thisWeekEarnings)}</div>
                    </CardContent>
                </Card>
                <Card className="bg-[var(--driver-card)] text-[var(--driver-card-foreground)] border-[var(--driver-border)] shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings (Selected Period)</CardTitle>
                        <List className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(earningsData.totalEarnings)}</div>
                         <p className="text-xs text-muted-foreground">
                           {dateRange?.from ? `${format(dateRange.from, 'LLL dd')} - ${dateRange.to ? format(dateRange.to, 'LLL dd, y') : 'Today'}` : 'All Time'}
                         </p>
                    </CardContent>
                </Card>
            </motion.section>

             {/* Filters */}
             <motion.div variants={cardVariants} className="flex flex-col md:flex-row items-center gap-4">
                <DateRangePicker date={dateRange} onDateChange={setDateRange} className="w-full md:w-auto"/>
                <Button variant="outline" className="w-full md:w-auto border-[var(--driver-border)]">
                    <Download className="mr-2 h-4 w-4" /> Export CSV
                </Button>
            </motion.div>

             {/* Earnings Trend Chart */}
             <motion.div variants={cardVariants}>
                 <Card className="bg-[var(--driver-card)] text-[var(--driver-card-foreground)] border-[var(--driver-border)] shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2"><TrendingUp className="text-primary"/>Earnings Trend (Last 7 Days)</CardTitle>
                         <CardDescription>Daily earnings overview.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                         <ChartContainer config={chartConfig} className="h-[250px] w-full">
                             <BarChart accessibilityLayer data={earningsData.earningsTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted-foreground/30"/>
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    tickFormatter={(value) => value} // Already formatted 'MMM d'
                                    className="text-xs"
                                />
                                 <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                     tickFormatter={(value) => `$${value}`}
                                     className="text-xs"
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent indicator="line" />}
                                />
                                <Bar dataKey="earnings" fill="var(--color-earnings)" radius={4} />
                             </BarChart>
                         </ChartContainer>
                    </CardContent>
                 </Card>
             </motion.div>


             {/* Earnings Breakdown Table */}
             <motion.div variants={cardVariants}>
                 <Card className="bg-[var(--driver-card)] text-[var(--driver-card-foreground)] border-[var(--driver-border)] shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2"><List className="text-primary"/>Earnings History</CardTitle>
                         <CardDescription>Detailed breakdown of your recent earnings.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border border-[var(--driver-border)] overflow-hidden">
                             <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-[var(--driver-border)]">
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-center hidden sm:table-cell">Trips</TableHead>
                                        <TableHead className="text-center hidden md:table-cell">Distance (km)</TableHead>
                                        <TableHead className="text-right">Base Earnings</TableHead>
                                        <TableHead className="text-right">Tips</TableHead>
                                        <TableHead className="text-right">Daily Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {earningsData.recentEntries.length > 0 ? (
                                        earningsData.recentEntries.map((entry) => (
                                            <TableRow key={entry.id} className="hover:bg-secondary/10">
                                                <TableCell className="font-medium">{format(entry.date, 'MMM d, yyyy')}</TableCell>
                                                <TableCell className="text-center hidden sm:table-cell">{entry.tripCount}</TableCell>
                                                <TableCell className="text-center hidden md:table-cell">{entry.distanceKm.toFixed(1)}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(entry.earnings)}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(entry.tips)}</TableCell>
                                                <TableCell className="text-right font-semibold text-primary">{formatCurrency(entry.earnings + (entry.tips || 0))}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                                No earnings found for the selected period.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                             </Table>
                        </div>
                    </CardContent>
                 </Card>
            </motion.div>

        </motion.div>
    );
}
