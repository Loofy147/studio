'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, LineChart, PieChart, Users, Store, Package, Truck, DollarSign, Activity, AlertCircle } from 'lucide-react'; // Added relevant icons
// Import chart components if using a library like Recharts or Chart.js wrapper
// import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart" // Assuming ChartConfig type exists if using shadcn charts
// import { Bar, BarChart as RechartsBarChart, CartesianGrid, XAxis } from "recharts"
import { cn } from '@/lib/utils'; // Import cn utility

// Mock data for demonstration
const kpiData = {
  totalStores: 125,
  newStoresToday: 3,
  totalProducts: 1850,
  pendingProducts: 15,
  totalUsers: 5432,
  activeDrivers: 88,
  totalOrders: 10250,
  pendingOrders: 45,
  totalRevenue: 150678.50,
};

const recentActivity = [
    { type: 'new_store', text: 'GreenBasket Organics applied.', time: '1 hr ago' },
    { type: 'new_order', text: 'Order #10112 placed for $45.50.', time: '2 hrs ago' },
    { type: 'user_report', text: 'User reported issue with store "ElectroMart".', time: '3 hrs ago' },
    { type: 'driver_online', text: 'Driver John D. went online.', time: '4 hrs ago' },
];

const alerts = [
    { type: 'error', text: 'Payment processing failed for order #10105.', level: 'high' },
    { type: 'warning', text: 'Low inventory for "Premium Laptop" at ElectroMart.', level: 'medium' },
];


export default function AdminDashboardPage() {

  // Mock chart data (replace with actual data fetching and charting library)
    const chartConfig = {
        revenue: { label: "Revenue", color: "hsl(var(--admin-primary))" }, // Use admin primary color
    } // satisfies ChartConfig; // Assuming ChartConfig is defined if using shadcn charts

    const chartData = [
        { month: "January", revenue: 18600 },
        { month: "February", revenue: 30500 },
        { month: "March", revenue: 23700 },
        { month: "April", revenue: 73000 },
        { month: "May", revenue: 50900 },
        { month: "June", revenue: 114900 }, // Sample data
    ];


  return (
    <div className="space-y-8">
      {/* Use admin foreground color */}
      <h1 className="text-3xl font-bold tracking-tight text-[var(--admin-foreground)]">Dashboard Overview</h1>

      {/* KPI Cards Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Apply admin card styles indirectly via globals.css */}
        <KpiCard title="Total Stores" value={kpiData.totalStores} icon={Store} change="+3 Today" changeColor="text-green-600 dark:text-green-400" />
        <KpiCard title="Total Products" value={kpiData.totalProducts} icon={Package} change="+15 Pending" changeColor="text-orange-500 dark:text-orange-400" />
        <KpiCard title="Total Users" value={kpiData.totalUsers} icon={Users} />
        <KpiCard title="Active Drivers" value={kpiData.activeDrivers} icon={Truck} />
        <KpiCard title="Total Revenue" value={`$${kpiData.totalRevenue.toLocaleString()}`} icon={DollarSign} change="+2.5% This Month" changeColor="text-green-600 dark:text-green-400" />
      </section>

      {/* Charts Section (Placeholder) */}
       <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Apply admin card styles */}
         <Card className="lg:col-span-2 bg-card text-card-foreground border-border">
           <CardHeader>
             {/* Use Admin Primary for title */}
             <CardTitle className="text-xl font-semibold text-[var(--admin-primary)]">Revenue Overview (Last 6 Months)</CardTitle>
             <CardDescription>Visualizing monthly revenue trends.</CardDescription>
           </CardHeader>
           <CardContent>
             {/* Placeholder for Chart - Integrate a charting library here */}
             <div className="h-[300px] w-full bg-muted rounded-lg flex items-center justify-center text-muted-foreground border border-dashed border-muted-foreground/30"> {/* Added border */}
               <BarChart className="h-12 w-12 opacity-30" />
               <span className="ml-2">Revenue Chart Placeholder</span>
               {/*
               <ChartContainer config={chartConfig} className="h-full w-full">
                 <RechartsBarChart accessibilityLayer data={chartData}>
                   <CartesianGrid vertical={false} />
                   <XAxis
                     dataKey="month"
                     tickLine={false}
                     tickMargin={10}
                     axisLine={false}
                     // tickFormatter={(value) => value.slice(0, 3)} // Use if needed
                   />
                   <ChartTooltip content={<ChartTooltipContent />} />
                   <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                 </RechartsBarChart>
               </ChartContainer>
               */}
             </div>
           </CardContent>
         </Card>
          {/* Apply admin card styles */}
         <Card className="bg-card text-card-foreground border-border">
           <CardHeader>
              {/* Use Admin Primary for title */}
             <CardTitle className="text-xl font-semibold text-[var(--admin-primary)]">Platform Distribution</CardTitle>
              <CardDescription>Stores vs Users vs Drivers.</CardDescription>
           </CardHeader>
            <CardContent>
             {/* Placeholder for Chart - Integrate a charting library here */}
              <div className="h-[300px] w-full bg-muted rounded-lg flex items-center justify-center text-muted-foreground border border-dashed border-muted-foreground/30"> {/* Added border */}
               <PieChart className="h-12 w-12 opacity-30" />
               <span className="ml-2">Distribution Chart Placeholder</span>
             </div>
           </CardContent>
         </Card>
      </section>


      {/* Recent Activity & Alerts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Apply admin card styles */}
        <Card className="bg-card text-card-foreground border-border">
          <CardHeader>
             {/* Use admin primary color */}
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-[var(--admin-primary)]"><Activity className="h-5 w-5"/> Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {recentActivity.map((activity, index) => (
                <li key={index} className="flex items-center justify-between text-sm border-b border-border pb-2 last:border-b-0 hover:bg-accent/50 -mx-2 px-2 py-1 rounded-md transition-colors"> {/* Hover effect */}
                  <span>{activity.text}</span>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Apply admin card styles */}
        <Card className="bg-card text-card-foreground border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-destructive"><AlertCircle className="h-5 w-5"/> System Alerts</CardTitle> {/* Used destructive color */}
          </CardHeader>
          <CardContent>
            {alerts.length > 0 ? (
              <ul className="space-y-3">
                {alerts.map((alert, index) => (
                  <li key={index} className={cn(
                      "flex items-center gap-2 text-sm p-3 rounded-md border", // Base styles
                      alert.level === 'high' ? 'bg-destructive/10 text-destructive border-destructive/30' : 'bg-orange-500/10 text-orange-600 border-orange-500/30 dark:text-orange-400' // Level-specific styles
                      )}>
                    <AlertCircle className="h-4 w-4 flex-shrink-0"/>
                    <span>{alert.text}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic text-center py-4">No active alerts.</p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

// Reusable KPI Card Component - Inherits styles from context
interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  change?: string;
  changeColor?: string; // Changed to optional
}

function KpiCard({ title, value, icon: Icon, change, changeColor }: KpiCardProps) {
  return (
    <Card className="bg-card text-card-foreground border-border shadow-sm hover:shadow-md transition-shadow duration-200"> {/* Added shadow */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
         {/* Use Admin Primary for icon color */}
        <Icon className="h-5 w-5 text-[var(--admin-primary)] opacity-80" /> {/* Adjusted icon size and color */}
      </CardHeader>
      <CardContent>
        {/* Bolder value */}
        <div className="text-2xl font-bold text-foreground/90">{value}</div>
        {change && (
          // Use provided color or default to muted-foreground
          <p className={cn("text-xs mt-1", changeColor ? changeColor : "text-muted-foreground")}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Define ChartConfig if using shadcn charts - placeholder
type ChartConfig = {
  [key: string]: {
    label: string;
    color: string;
    icon?: React.ComponentType;
  };
};
