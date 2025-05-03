'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
// Assume a service function getDrivers exists
import { Driver, getDrivers } from '@/services/driver'; // Import or define Driver type and fetch function
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowUpDown, Search, Truck as TruckIcon, Eye, Edit, Ban, CheckCircle, XCircle, Filter, MapPin } from 'lucide-react';
import { format } from 'date-fns'; // Assuming drivers have a join date
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

// Mock function to toggle driver status (replace with actual API call)
async function toggleDriverStatus(driverId: string, currentStatus: 'active' | 'inactive' | 'pending'): Promise<'active' | 'inactive'> {
    console.log(`Toggling status for driver ${driverId} from ${currentStatus}`);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
    // Simplified toggle logic for mock
    return currentStatus === 'active' ? 'inactive' : 'active';
}

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');
  const [sortField, setSortField] = useState<keyof Driver | 'name' | 'vehicleType' | 'rating' | 'joinedAt'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [updatingDriverId, setUpdatingDriverId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDriversData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const driverData = await getDrivers(); // Fetch drivers
        // Add mock join date if needed
        const driversWithDate = driverData.map(d => ({
            ...d,
            joinedAt: d.joinedAt ?? new Date(Date.now() - Math.random() * 365 * 86400000) // Mock join date
        })) as (Driver & { joinedAt: Date })[];
        setDrivers(driversWithDate);
      } catch (err) {
        console.error("Failed to fetch drivers:", err);
        setError("Could not load driver data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDriversData();
  }, []);

  const handleSort = (field: keyof Driver | 'name' | 'vehicleType' | 'rating' | 'joinedAt') => {
    const newDirection = (sortField === field && sortDirection === 'asc') ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
  };

  const filteredAndSortedDrivers = useMemo(() => {
    let processedDrivers = drivers.filter(driver => {
      const matchesSearch = driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            driver.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            driver.vehicleType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (driver.phone && driver.phone.includes(searchTerm));
      const matchesStatus = statusFilter === 'all' || driver.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    processedDrivers.sort((a, b) => {
      let valA: any = a[sortField as keyof Driver];
      let valB: any = b[sortField as keyof Driver];

       // Handle specific sort types
       if (sortField === 'rating') {
         valA = a.rating ?? 0;
         valB = b.rating ?? 0;
      } else if (sortField === 'joinedAt' && valA instanceof Date && valB instanceof Date) {
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

   const handleToggleStatus = async (driver: Driver) => {
        setUpdatingDriverId(driver.id);
        try {
            // For simplicity, mock toggles between active/inactive. Pending requires specific actions.
            if (driver.status === 'pending') {
                 toast({ title: "Action Required", description: "Approve or reject pending drivers manually.", variant: "default" });
                 setUpdatingDriverId(null);
                 return;
            }
            const newStatus = await toggleDriverStatus(driver.id, driver.status);
            setDrivers(prevDrivers => prevDrivers.map(d => d.id === driver.id ? { ...d, status: newStatus } : d));
             toast({
                title: `Driver ${newStatus === 'active' ? 'Enabled' : 'Disabled'}`,
                description: `${driver.name}'s account has been ${newStatus}.`,
             });
        } catch (err) {
            console.error("Failed to toggle driver status:", err);
            toast({
                title: "Update Failed",
                description: `Could not change the status for ${driver.name}.`,
                variant: "destructive",
            });
        } finally {
            setUpdatingDriverId(null);
        }
    };

  // Add Approve/Reject functions for 'pending' status if needed

  const TableSkeleton = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[60px]"><Skeleton className="h-4 w-full" /></TableHead>
          <TableHead className="w-[180px]"><Skeleton className="h-4 w-full" /></TableHead>
          <TableHead className="hidden sm:table-cell"><Skeleton className="h-4 w-full" /></TableHead>
          <TableHead className="hidden md:table-cell"><Skeleton className="h-4 w-full" /></TableHead>
          <TableHead className="hidden lg:table-cell"><Skeleton className="h-4 w-full" /></TableHead>
          <TableHead><Skeleton className="h-4 w-full" /></TableHead>
          <TableHead className="text-right"><Skeleton className="h-4 w-full" /></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
            <TableCell><Skeleton className="h-4 w-3/4" /></TableCell>
            <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-full" /></TableCell>
            <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-1/2" /></TableCell>
            <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-3/4" /></TableCell>
             <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
            <TableCell className="text-right space-x-1">
                <Skeleton className="h-8 w-8 inline-block" />
                <Skeleton className="h-8 w-8 inline-block" />
                <Skeleton className="h-8 w-8 inline-block" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  // Status Badge Component
    const StatusBadge = ({ status }: { status: Driver['status'] }) => {
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
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
                placeholder="Search by name, ID, vehicle, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
             <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | 'active' | 'inactive' | 'pending')}>
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
          </div>

          {/* Driver Table */}
          {error && (
            <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
           )}

          <div className="rounded-md border overflow-hidden">
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
                    <TableHead>Status</TableHead>
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
                                {/* Placeholder avatar - replace with actual image if available */}
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
                             <Button variant="ghost" size="icon" className="h-8 w-8" title="View Driver Details (Not Implemented)">
                                    <Eye className="h-4 w-4 opacity-50" />
                            </Button>
                             <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit Driver (Not Implemented)">
                                    <Edit className="h-4 w-4 opacity-50" />
                             </Button>
                             {driver.status !== 'pending' ? (
                                 <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleToggleStatus(driver)}
                                    disabled={updatingDriverId === driver.id}
                                    title={driver.status === 'active' ? 'Disable Driver' : 'Enable Driver'}
                                >
                                    {updatingDriverId === driver.id
                                        ? <Skeleton className="h-4 w-4 rounded-full" />
                                        : driver.status === 'active'
                                            ? <Ban className="h-4 w-4 text-red-600" />
                                            : <CheckCircle className="h-4 w-4 text-green-600" />}
                                </Button>
                             ) : (
                                // Actions for pending status
                                <div className="inline-flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:bg-green-100" title="Approve Driver (Not Implemented)">
                                        <CheckCircle className="h-4 w-4"/>
                                    </Button>
                                     <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" title="Reject Driver (Not Implemented)">
                                        <XCircle className="h-4 w-4"/>
                                    </Button>
                                </div>
                             )}
                              <Button variant="ghost" size="icon" className="h-8 w-8" title="View Live Location (Not Implemented)">
                                    <MapPin className="h-4 w-4 opacity-50" />
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

// Extend Driver type for client-side state if needed
declare module '@/services/driver' {
    interface Driver {
        joinedAt?: Date; // Add optional join date
    }
}
```