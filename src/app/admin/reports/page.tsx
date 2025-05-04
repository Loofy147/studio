'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart2, Download, Calendar as CalendarIcon, DollarSign, ShoppingBag, Truck, Users, Store as StoreIcon, PackageCheck } from 'lucide-react'; // Added StoreIcon, PackageCheck
import { DateRangePicker } from '@/components/ui/date-range-picker'; // Assuming this component exists

export default function AdminReportsPage() {
  // Placeholder state for date range, report type etc.
  const [dateRange, setDateRange] = React.useState<[Date | null, Date | null]>([null, null]);
  const [reportType, setReportType] = React.useState<string>('sales_overview');

  const reportOptions = [
     { value: 'sales_overview', label: 'Sales Overview', icon: DollarSign },
     { value: 'store_performance', label: 'Store Performance', icon: StoreIcon },
     { value: 'popular_products', label: 'Popular Products', icon: ShoppingBag },
     { value: 'order_status', label: 'Order Status Breakdown', icon: PackageCheck },
     { value: 'user_activity', label: 'User Activity', icon: Users },
     { value: 'driver_earnings', label: 'Driver Earnings & Performance', icon: Truck },
  ];

  const selectedReport = reportOptions.find(r => r.value === reportType);

  return (
    <div className="space-y-8"> {/* Increased spacing */}
       <Card className="shadow-md border"> {/* Added shadow */}
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-[var(--admin-primary)]"> {/* Admin theme color */}
                    <BarChart2 className="h-6 w-6" /> Reports & Analytics
                </CardTitle>
                <CardDescription>Generate and view reports on platform performance.</CardDescription>
            </CardHeader>
             <CardContent className="space-y-4">
                 <div className="flex flex-col md:flex-row items-center gap-4">
                     {/* Report Type Selector */}
                     <Select value={reportType} onValueChange={setReportType}>
                        <SelectTrigger className="w-full md:w-[300px]"> {/* Wider trigger */}
                           {selectedReport?.icon && <selectedReport.icon className="h-4 w-4 mr-2 text-muted-foreground" />}
                            <SelectValue placeholder="Select Report Type" />
                        </SelectTrigger>
                        <SelectContent>
                            {reportOptions.map(option => (
                                 <SelectItem key={option.value} value={option.value}>
                                    <div className="flex items-center gap-2">
                                        <option.icon className="h-4 w-4 text-muted-foreground" />
                                        <span>{option.label}</span>
                                    </div>
                                 </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Date Range Picker (Placeholder) */}
                     <div className="w-full md:w-auto">
                        {/* Replace with actual DateRangePicker component */}
                        {/* <DateRangePicker range={dateRange} onDateChange={setDateRange} /> */}
                         {/* Placeholder button mimicking DateRangePicker */}
                         <Button variant="outline" className="w-full sm:w-auto justify-start text-left font-normal border"> {/* Added border */}
                            <CalendarIcon className="mr-2 h-4 w-4" />
                             {dateRange && dateRange[0] && dateRange[1]
                                ? `${format(dateRange[0], "LLL dd, y")} - ${format(dateRange[1], "LLL dd, y")}`
                                : <span>Select Date Range</span>}
                        </Button>
                    </div>

                     {/* Add other filters as needed (e.g., filter by Store for Store Performance) */}

                    <Button className="w-full md:w-auto ml-auto">
                        <Download className="mr-2 h-4 w-4" /> Download Report (CSV)
                    </Button>
                 </div>
             </CardContent>
        </Card>

      {/* Report Display Area (Placeholder) */}
      <Card className="shadow-md border"> {/* Added shadow */}
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            {/* Dynamically set title based on reportType */}
             {selectedReport?.label || 'Report Data'}
          </CardTitle>
          <CardDescription>
            Displaying data for the selected period and report type. (Actual report generation TBD)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Placeholder Content - Replace with actual charts/tables based on reportType */}
          <div className="min-h-[350px] bg-muted rounded-lg flex flex-col items-center justify-center text-muted-foreground p-8 text-center border border-dashed border-muted-foreground/30"> {/* Added border */}
              {selectedReport?.icon ? <selectedReport.icon className="h-16 w-16 opacity-20 mb-4" /> : <BarChart2 className="h-16 w-16 opacity-20 mb-4" />}
             <p className="text-lg font-medium">Report Data Placeholder</p>
             <p className="text-sm">Report generation and visualization components (charts, tables) will be added here based on the selected report type and date range.</p>
             <p className="text-xs mt-4">(Selected Type: <span className="capitalize font-semibold">{reportType.replace(/_/g, ' ')}</span>)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
