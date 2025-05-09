'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
// Assume a service function getDrivers exists
import { Driver, getDrivers, DriverStatus } from '@/services/driver'; // Import or define Driver type and fetch function
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowUpDown, Search, Truck as TruckIcon, Eye, Edit, Ban, CheckCircle, XCircle, Filter, MapPin, Hourglass, Loader2 } from 'lucide-react'; // Added Hourglass, Loader2
import { format, isValid } from 'date-fns'; // Assuming drivers have a join date, added isValid
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from '@/lib/utils';

// Define BadgeProps type locally if needed
import { type VariantProps } from "class-variance-authority";
import { badgeVariants } from "@/components/ui/badge";
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

// Type for the driver with guaranteed joinedAt date for sorting/display
type DriverWithDate = Driver & { joinedAt: Date };

// Mock function to toggle driver status (replace with actual API call)
async function toggleDriverStatus(driverId: string, currentStatus: DriverStatus): Promise<DriverStatus> {
    console.log(`Toggling status for driver ${driverId} from ${currentStatus}`);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
    // Simplified toggle logic for mock
    if (currentStatus === 'active') return 'inactive';
    if (currentStatus === 'inactive') return 'active';
    // Pending status requires specific approval/rejection, cannot be simply toggled
    return 'pending'; // Return pending if it was pending
}

// Mock function to approve driver (replace with actual API call)
async function approveDriver(driverId: string): Promise<DriverStatus> {
    console.log(`Approving driver ${driverId}`);
    await new Promise(resolve => setTimeout(resolve, 400));
    return 'active';
}

// Mock function to reject driver (replace with actual API call)
async function rejectDriver(driverId: string): Promise<DriverStatus> {
    console.log(`Rejecting driver ${driverId}`);
    await new Promise(resolve => setTimeout(resolve, 400));
    return 'inactive'; // Rejected drivers become inactive
}


export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<DriverWithDate[]>([]); // Use DriverWithDate
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<DriverStatus | 'all'>('all'); // Use DriverStatus
  const [sortField, setSortField] = useState<keyof DriverWithDate | 'name' | 'vehicleType' | 'rating'>('name'); // Adjusted keys
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [updatingDriverId, setUpdatingDriverId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDriversData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const driverData = await getDrivers(); // Fetch drivers
        // Ensure join date exists and is valid
        const driversWithDate = driverData.map(d => ({
            ...d,
            joinedAt: d.joinedAt && isValid(new Date(d.joinedAt)) ? new Date(d.joinedAt) : new Date(Date.now() - Math.random() * 365 * 86400000) // Mock join date if missing/invalid
        })).filter((d): d is DriverWithDate => d.joinedAt instanceof Date); // Type guard
        setDrivers(driversWithDate);
      } catch (err: any) { // Explicitly type error
        console.error("Failed to fetch drivers:", err);
        setError(err.message || "Could not load driver data. Please try again later."); // Provide specific error message
      } finally {
        setIsLoading(false);
      }
    };
    fetchDriversData();
  }, []); // Empty dependency array is correct here

  const handleSort = (field: keyof DriverWithDate | 'name' | 'vehicleType' | 'rating') => { // Adjusted keys
    const newDirection = (sortField === field && sortDirection === 'asc') ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
  };

  const filteredAndSortedDrivers = useMemo(() => {
    let processedDrivers = drivers.filter(driver => {
      const matchesSearch = driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            driver.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            driver.vehicleType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (driver.phone && driver.phone.includes(searchTerm)) ||
                            (driver.email && driver.email.toLowerCase().includes(searchTerm.toLowerCase())); // Include email in search
      const matchesStatus = statusFilter === 'all' || driver.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    processedDrivers.sort((a, b) => {
       let valA: any = a[sortField as keyof DriverWithDate];
       let valB: any = b[sortField as keyof DriverWithDate];

       // Handle specific sort types
       if (sortField === 'rating') {
         valA = a.rating ?? 0;
         valB = b.rating ?? 0;
       } else if (sortField === 'joinedAt') { // Always Date type now
          valA = valA.getTime();
          valB = valB.getTime();
      } else if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return processedDrivers;
  }, [drivers, searchTerm, statusFilter, sortField, sortDirection]);

   const handleToggleStatus = async (driver: DriverWithDate) => {
        setUpdatingDriverId(driver.id);
        try {
            // For simplicity, mock toggles between active/inactive. Pending requires specific actions.
            if (driver.status === 'pending') {
                 toast({ title: "Action Required", description: "Approve or reject pending drivers manually using the dedicated actions.", variant: "default" });
                 setUpdatingDriverId(null);
                 return;
            }
            const newStatus = await toggleDriverStatus(driver.id, driver.status);
            setDrivers(prevDrivers => prevDrivers.map(d => d.id === driver.id ? { ...d, status: newStatus } : d));
             toast({
                title: `Driver ${newStatus === 'active' ? 'Enabled' : 'Disabled'}`,
                description: `${driver.name}'s account has been ${newStatus}.`,
             });
        } catch (err: any) { // Explicitly type error
            console.error("Failed to toggle driver status:", err);
            toast({
                title: "Update Failed",
                description: `Could not change the status for ${driver.name}. ${err.message || ''}`, // Add error message
                variant: "destructive",
            });
        } finally {
            setUpdatingDriverId(null);
        }
    };

  const handleApprove = async (driver: DriverWithDate) => {
        setUpdatingDriverId(driver.id);
        try {
            const newStatus = await approveDriver(driver.id);
             setDrivers(prevDrivers => prevDrivers.map(d => d.id === driver.id ? { ...d, status: newStatus } : d));
             toast({
                title: `Driver Approved`,
                description: `${driver.name}'s account has been approved and set to active.`,
             });
        } catch (err: any) { // Explicitly type error
             console.error("Failed to approve driver:", err);
            toast({
                title: "Approval Failed",
                description: `Could not approve ${driver.name}. ${err.message || ''}`, // Add error message
                variant: "destructive",
            });
        } finally {
            setUpdatingDriverId(null);
        }
  }

    const handleReject = async (driver: DriverWithDate) => {
        setUpdatingDriverId(driver.id);
        try {
            const newStatus = await rejectDriver(driver.id);
             setDrivers(prevDrivers => prevDrivers.map(d => d.id === driver.id ? { ...d, status: newStatus } : d));
             toast({
                title: `Driver Rejected`,
                description: `${driver.name}'s application has been rejected.`,
                variant: "destructive"
             });
        } catch (err: any) { // Explicitly type error
             console.error("Failed to reject driver:", err);
            toast({
                title: "Rejection Failed",
                description: `Could not reject ${driver.name}. ${err.message || ''}`, // Add error message
                variant: "destructive",
            });
        } finally {
            setUpdatingDriverId(null);
        }
    }


  const TableSkeleton = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[60px]"><Skeleton className="h-4 w-full bg-muted/50" /></TableHead>
          <TableHead className="w-[180px]"><Skeleton className="h-4 w-full bg-muted/50" /></TableHead>
          <TableHead className="hidden sm:table-cell"><Skeleton className="h-4 w-full bg-muted/50" /></TableHead>
          <TableHead className="hidden md:table-cell"><Skeleton className="h-4 w-full bg-muted/50" /></TableHead>
          <TableHead className="hidden lg:table-cell"><Skeleton className="h-4 w-full bg-muted/50" /></TableHead>
          <TableHead><Skeleton className="h-4 w-full bg-muted/50" /></TableHead>
          <TableHead className="hidden xl:table-cell"><Skeleton className="h-4 w-full bg-muted/50" /></TableHead> {/* Joined Date */}
          <TableHead className="text-right"><Skeleton className="h-4 w-full bg-muted/50" /></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton className="h-10 w-10 rounded-full bg-muted/50" /></TableCell>
            <TableCell><Skeleton className="h-4 w-3/4 bg-muted/50" /></TableCell>
            <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-full bg-muted/50" /></TableCell>
            <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-1/2 bg-muted/50" /></TableCell>
            <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-3/4 bg-muted/50" /></TableCell>
            <TableCell><Skeleton className="h-6 w-24 rounded-full bg-muted/50" /></TableCell> {/* Status Badge */}
            <TableCell className="hidden xl:table-cell"><Skeleton className="h-4 w-full bg-muted/50" /></TableCell> {/* Joined Date */}
            <TableCell className="text-right space-x-1">
                <Skeleton className="h-8 w-8 inline-block rounded-md bg-muted/50" />
                <Skeleton className="h-8 w-8 inline-block rounded-md bg-muted/50" />
                <Skeleton className="h-8 w-8 inline-block rounded-md bg-muted/50" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  // Status Badge Component
    const StatusBadge = ({ status }: { status: DriverStatus }) => {
        let variant: BadgeProps['variant'] = 'default';
        let className = '';
        let Icon = CheckCircle;

        switch (status) {
            case 'active':
                variant = 'secondary';
                className = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-700/50';
                Icon = CheckCircle;
                break;
            case 'inactive':
                variant = 'outline';
                 className = 'bg-gray-100 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400 border-gray-300 dark:border-gray-700';
                Icon = Ban;
                break;
            case 'pending':
                variant = 'outline';
                className = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700';
                Icon = Hourglass;
                break;
        }

        return (
            <Badge variant={variant} className={cn("capitalize text-xs px-2 py-0.5 rounded-full font-medium border flex items-center gap-1 w-fit", className)}>
                <Icon className="h-3 w-3" />
                <span>{status}</span>
            </Badge>
        );
    };


  return (
    <div className="space-y-6">
      <Card className="shadow-md border"> {/* Added shadow */}
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[var(--admin-primary)]"> {/* Use admin theme color */}
            <TruckIcon className="h-6 w-6" /> Driver Management
          </CardTitle>
          <CardDescription>View, filter, and manage all drivers on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
            <div className="relative flex-grow w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, ID, vehicle, phone, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
             <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as DriverStatus | 'all')}> {/* Corrected type */}
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending Approval</SelectItem>
              </SelectContent>
            </Select>
             {/* Optional: Add "Add New Driver" button here */}
             {/* <Button><PlusCircle className="mr-2 h-4 w-4"/> Add Driver</Button> */}
          </div>

          {/* Driver Table */}
          {error && (
            <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
           )}

          <div className="rounded-md border overflow-hidden shadow-sm"> {/* Added shadow */}
            {isLoading ? <TableSkeleton /> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Avatar</TableHead>
                     <TableHead onClick={() => handleSort('name')} className="cursor-pointer hover:bg-muted w-[180px]">
                      Name <ArrowUpDown className={`ml-1 h-3 w-3 inline ${sortField === 'name' ? 'opacity-100' : 'opacity-30'}`} />
                    </TableHead>
                     <TableHead className="hidden sm:table-cell">Phone</TableHead>
                    <TableHead onClick={() => handleSort('vehicleType')} className="cursor-pointer hover:bg-muted hidden md:table-cell">
                      Vehicle <ArrowUpDown className={`ml-1 h-3 w-3 inline ${sortField === 'vehicleType' ? 'opacity-100' : 'opacity-30'}`} />
                    </TableHead>
                     <TableHead onClick={() => handleSort('rating')} className="cursor-pointer hover:bg-muted hidden lg:table-cell">
                      Rating <ArrowUpDown className={`ml-1 h-3 w-3 inline ${sortField === 'rating' ? 'opacity-100' : 'opacity-30'}`} />
                    </TableHead>
                    <TableHead onClick={() => handleSort('status')} className="cursor-pointer hover:bg-muted"> {/* Sortable Status */}
                      Status <ArrowUpDown className={`ml-1 h-3 w-3 inline ${sortField === 'status' ? 'opacity-100' : 'opacity-30'}`} />
                    </TableHead>
                     <TableHead onClick={() => handleSort('joinedAt')} className="cursor-pointer hover:bg-muted hidden xl:table-cell">
                      Joined <ArrowUpDown className={`ml-1 h-3 w-3 inline ${sortField === 'joinedAt' ? 'opacity-100' : 'opacity-30'}`} />
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedDrivers.length > 0 ? (
                    filteredAndSortedDrivers.map((driver) => (
                      <TableRow key={driver.id} className={cn(driver.status === 'inactive' && 'opacity-60')}>
                         <TableCell>
                             <Avatar className="h-9 w-9">
                                {/* Use email for avatar generation if available */}
                                <AvatarImage src={driver.email ? `https://avatar.vercel.sh/${driver.email}?size=36` : undefined} alt={driver.name} />
                                <AvatarFallback>{driver.name.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                            </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">{driver.name}</TableCell>
                        <TableCell className="hidden sm:table-cell">{driver.phone || 'N/A'}</TableCell>
                        <TableCell className="capitalize hidden md:table-cell">{driver.vehicleType}</TableCell>
                        <TableCell className="hidden lg:table-cell">{driver.rating ? driver.rating.toFixed(1) : 'N/A'}</TableCell>
                         <TableCell>
                          <StatusBadge status={driver.status} />
                        </TableCell>
                         <TableCell className="hidden xl:table-cell">{format(driver.joinedAt, 'MMM d, yyyy')}</TableCell>
                        <TableCell className="text-right space-x-1">
                             {/* View Driver Details Button (Placeholder) */}
                             <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-secondary/80" title="View Driver Details (Not Implemented)">
                                    <Eye className="h-4 w-4 text-foreground/70" />
                            </Button>
                             {/* Edit Driver Button (Placeholder) */}
                             <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-secondary/80" title="Edit Driver (Not Implemented)">
                                    <Edit className="h-4 w-4 text-foreground/70" />
                             </Button>
                             {/* Actions based on status */}
                             {driver.status === 'pending' ? (
                                // Actions for pending status: Approve/Reject
                                <div className="inline-flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30" title="Approve Driver" onClick={() => handleApprove(driver)} disabled={updatingDriverId === driver.id}>
                                        {updatingDriverId === driver.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <CheckCircle className="h-4 w-4"/>}
                                    </Button>
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                             <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" title="Reject Driver" disabled={updatingDriverId === driver.id}>
                                                 {updatingDriverId === driver.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <XCircle className="h-4 w-4"/>}
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Reject Driver Application?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to reject the application for {driver.name}? This will set their status to inactive.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleReject(driver)}
                                                    className={buttonVariants({ variant: "destructive" })}
                                                    >
                                                    Yes, Reject Driver
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                             ) : (
                                // Action for active/inactive: Toggle Status
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                         <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            disabled={updatingDriverId === driver.id}
                                            title={driver.status === 'active' ? 'Disable Driver' : 'Enable Driver'}
                                        >
                                            {updatingDriverId === driver.id
                                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                                : driver.status === 'active'
                                                    ? <Ban className="h-4 w-4 text-red-600" />
                                                    : <CheckCircle className="h-4 w-4 text-green-600" />}
                                        </Button>
                                    </AlertDialogTrigger>
                                     <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                 Are you sure you want to {driver.status === 'active' ? 'disable' : 'enable'} the account for {driver.name}?
                                                 {driver.status === 'active' ? ' Disabling prevents them from logging in or receiving orders.' : ' Enabling allows them to log in and receive orders.'}
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => handleToggleStatus(driver)}
                                                className={buttonVariants({ variant: driver.status === 'active' ? "destructive" : "default" })}
                                                >
                                                Yes, {driver.status === 'active' ? 'Disable' : 'Enable'} Driver
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                             )}
                             {/* View Live Location Button (Placeholder) */}
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-secondary/80" title="View Live Location (Not Implemented)">
                                    <MapPin className="h-4 w-4 text-foreground/70" />
                            </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                        No drivers found matching your criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
          {/* Add Pagination if needed */}
        </CardContent>
      </Card>
    </div>
  );
}
