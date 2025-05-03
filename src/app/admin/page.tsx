'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, LineChart, PieChart } from 'lucide-react'; // Example icons
import { Users, Store, Package, Truck, DollarSign, Activity, AlertCircle } from 'lucide-react'; // More relevant icons
// Import chart components if using a library like Recharts or Chart.js wrapper
// import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
// import { Bar, BarChart as RechartsBarChart, CartesianGrid, XAxis } from "recharts"

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
        revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
    } satisfies ChartConfig; // Assuming ChartConfig is defined if using shadcn charts

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
      <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>

      {/* KPI Cards Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <KpiCard title="Total Stores" value={kpiData.totalStores} icon={Store} change="+3 Today" />
        <KpiCard title="Total Products" value={kpiData.totalProducts} icon={Package} change="+15 Pending" changeColor="text-orange-500" />
        <KpiCard title="Total Users" value={kpiData.totalUsers} icon={Users} />
        <KpiCard title="Active Drivers" value={kpiData.activeDrivers} icon={Truck} />
        <KpiCard title="Total Revenue" value={`$${kpiData.totalRevenue.toLocaleString()}`} icon={DollarSign} change="+2.5% This Month" />
        {/* Add more cards for Orders, etc. */}
      </section>

      {/* Charts Section (Placeholder) */}
       <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <Card className="lg:col-span-2">
           <CardHeader>
             <CardTitle>Revenue Overview (Last 6 Months)</CardTitle>
             <CardDescription>Visualizing monthly revenue trends.</CardDescription>
           </CardHeader>
           <CardContent>
             {/* Placeholder for Chart - Integrate a charting library here */}
             <div className="h-[300px] w-full bg-muted rounded-md flex items-center justify-center text-muted-foreground">
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
         <Card>
           <CardHeader>
             <CardTitle>Platform Distribution</CardTitle>
              <CardDescription>Stores vs Users vs Drivers.</CardDescription>
           </CardHeader>
            <CardContent>
             {/* Placeholder for Chart - Integrate a charting library here */}
              <div className="h-[300px] w-full bg-muted rounded-md flex items-center justify-center text-muted-foreground">
               <PieChart className="h-12 w-12 opacity-30" />
               <span className="ml-2">Distribution Chart Placeholder</span>
             </div>
           </CardContent>
         </Card>
      </section>


      {/* Recent Activity & Alerts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-primary"/> Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {recentActivity.map((activity, index) => (
                <li key={index} className="flex items-center justify-between text-sm border-b pb-2 last:border-b-0">
                  <span>{activity.text}</span>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><AlertCircle className="h-5 w-5 text-destructive"/> System Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            {alerts.length > 0 ? (
              <ul className="space-y-3">
                {alerts.map((alert, index) => (
                  <li key={index} className={`flex items-center gap-2 text-sm p-2 rounded-md ${alert.level === 'high' ? 'bg-destructive/10 text-destructive' : 'bg-orange-500/10 text-orange-600'}`}>
                    <AlertCircle className="h-4 w-4 flex-shrink-0"/>
                    <span>{alert.text}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">No active alerts.</p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

// Reusable KPI Card Component
interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  change?: string;
  changeColor?: string;
}

function KpiCard({ title, value, icon: Icon, change, changeColor = "text-green-600" }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={`text-xs ${changeColor} mt-1`}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Define ChartConfig if using shadcn charts
type ChartConfig = {
  [key: string]: {
    label: string;
    color: string;
    icon?: React.ComponentType;
  };
};
```