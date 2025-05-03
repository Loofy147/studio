'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
// Assume a service function getUserProfiles exists, similar to getStores/getProducts
import { getUserProfile, UserProfile } from '@/services/store'; // Using existing profile type for now
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowUpDown, Search, Users as UsersIcon, Eye, Edit, UserCog, Ban, UserCheck, XCircle } from 'lucide-react';
import { format } from 'date-fns'; // Assuming users have a join date
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

// Mock function to fetch all users (replace with actual API call)
async function getAllUserProfiles(): Promise<UserProfile[]> {
    console.log("Fetching all user profiles...");
    // Simulate fetching multiple profiles. In a real app, fetch from your user DB.
    // Using the existing getUserProfile logic just for demonstration structure.
    const userIds = ["user123", "user456", "user789", "user101", "user112"]; // Mock IDs
    const profiles: UserProfile[] = [];
    for (const id of userIds) {
        // Mock different user data
        const profile = await getUserProfile(id); // Reuse existing mock logic for now
        if (profile) {
             // Add mock roles and status
             const roles = ['customer', 'store_owner', 'driver'];
             const status = Math.random() > 0.1 ? 'active' : 'disabled';
             profiles.push({
                ...profile,
                role: profile.role || roles[Math.floor(Math.random() * roles.length)], // Assign random role if none exists
                status: profile.status || status, // Assign random status if none exists
                joinedAt: profile.joinedAt || new Date(Date.now() - Math.random() * 365 * 86400000) // Mock join date within last year
             });
        } else {
             // Create placeholder mock user if getUserProfile returns null for other IDs
             const roles = ['customer', 'store_owner', 'driver'];
             const status = Math.random() > 0.1 ? 'active' : 'disabled';
             profiles.push({
                id: id,
                name: `User ${id.slice(-3)}`,
                email: `user.${id.slice(-3)}@example.com`,
                loyaltyPoints: Math.floor(Math.random() * 500),
                role: roles[Math.floor(Math.random() * roles.length)],
                status: status,
                joinedAt: new Date(Date.now() - Math.random() * 365 * 86400000)
            });
        }
    }
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("User profiles fetched:", profiles.length);
            resolve(profiles);
        }, 400);
    });
}


// Mock function to toggle user status (replace with actual API call)
async function toggleUserStatus(userId: string, currentStatus: string): Promise<string> {
    console.log(`Toggling status for user ${userId} from ${currentStatus}`);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
    return currentStatus === 'active' ? 'disabled' : 'active'; // Return the new status
}


export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all');
  const [sortField, setSortField] = useState<keyof UserProfile | 'name' | 'email' | 'role' | 'joinedAt'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const userData = await getAllUserProfiles(); // Fetch all users
        setUsers(userData);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setError("Could not load user data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleSort = (field: keyof UserProfile | 'name' | 'email' | 'role' | 'joinedAt') => {
    const newDirection = (sortField === field && sortDirection === 'asc') ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
  };

  const uniqueRoles = useMemo(() => {
    const roles = new Set(users.map(u => u.role).filter(Boolean));
    return ['all', ...Array.from(roles).sort()];
  }, [users]);

  const filteredAndSortedUsers = useMemo(() => {
    let processedUsers = users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });

    processedUsers.sort((a, b) => {
      let valA: any = a[sortField as keyof UserProfile];
      let valB: any = b[sortField as keyof UserProfile];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      } else if (valA instanceof Date) {
          valA = valA.getTime();
          valB = valB.getTime();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return processedUsers;
  }, [users, searchTerm, roleFilter, statusFilter, sortField, sortDirection]);

   const handleToggleStatus = async (user: UserProfile) => {
        if (!user.status) return; // Should not happen with mock data logic
        setUpdatingUserId(user.id);
        try {
            const newStatus = await toggleUserStatus(user.id, user.status);
            setUsers(prevUsers => prevUsers.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
             toast({
                title: `User ${newStatus === 'active' ? 'Enabled' : 'Disabled'}`,
                description: `${user.name}'s account has been ${newStatus}.`,
             });
        } catch (err) {
            console.error("Failed to toggle user status:", err);
            toast({
                title: "Update Failed",
                description: `Could not change the status for ${user.name}.`,
                variant: "destructive",
            });
        } finally {
            setUpdatingUserId(null);
        }
    };


  const TableSkeleton = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[60px]"><Skeleton className="h-4 w-full" /></TableHead>
          <TableHead className="w-[180px]"><Skeleton className="h-4 w-full" /></TableHead>
          <TableHead><Skeleton className="h-4 w-full" /></TableHead>
          <TableHead className="hidden sm:table-cell"><Skeleton className="h-4 w-full" /></TableHead>
          <TableHead className="hidden md:table-cell"><Skeleton className="h-4 w-full" /></TableHead>
          <TableHead><Skeleton className="h-4 w-full" /></TableHead>
          <TableHead className="text-right"><Skeleton className="h-4 w-full" /></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
            <TableCell><Skeleton className="h-4 w-3/4" /></TableCell>
            <TableCell><Skeleton className="h-4 w-full" /></TableCell>
            <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-1/2" /></TableCell>
            <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-3/4" /></TableCell>
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="h-6 w-6" /> User Management
          </CardTitle>
          <CardDescription>View, filter, and manage all users on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
            <div className="relative flex-grow w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value)}>
              <SelectTrigger className="w-full md:w-[180px]">
                 <UserCog className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Filter by Role" />
              </SelectTrigger>
              <SelectContent>
                 {uniqueRoles.map(role => (
                    <SelectItem key={role} value={role} className="capitalize">
                        {role === "all" ? "All Roles" : role.replace('_', ' ')}
                    </SelectItem>
                ))}
              </SelectContent>
            </Select>
             <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | 'active' | 'disabled')}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
             {/* Optional: Add "Create New User" button here */}
          </div>

          {/* User Table */}
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
                     <TableHead onClick={() => handleSort('email')} className="cursor-pointer hover:bg-muted">
                      Email <ArrowUpDown className={`ml-1 h-3 w-3 inline ${sortField === 'email' ? 'opacity-100' : 'opacity-30'}`} />
                    </TableHead>
                     <TableHead onClick={() => handleSort('role')} className="cursor-pointer hover:bg-muted hidden sm:table-cell">
                      Role <ArrowUpDown className={`ml-1 h-3 w-3 inline ${sortField === 'role' ? 'opacity-100' : 'opacity-30'}`} />
                    </TableHead>
                    <TableHead onClick={() => handleSort('joinedAt')} className="cursor-pointer hover:bg-muted hidden md:table-cell">
                      Joined <ArrowUpDown className={`ml-1 h-3 w-3 inline ${sortField === 'joinedAt' ? 'opacity-100' : 'opacity-30'}`} />
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedUsers.length > 0 ? (
                    filteredAndSortedUsers.map((user) => (
                      <TableRow key={user.id} className={cn(user.status === 'disabled' && 'opacity-60')}>
                         <TableCell>
                             <Avatar className="h-9 w-9">
                                <AvatarImage src={`https://avatar.vercel.sh/${user.email}?size=36`} alt={user.name} />
                                <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                            </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell className="capitalize hidden sm:table-cell">{user.role?.replace('_', ' ')}</TableCell>
                        <TableCell className="hidden md:table-cell">{format(user.joinedAt!, 'MMM d, yyyy')}</TableCell>
                         <TableCell>
                          <Badge variant={user.status === 'active' ? 'secondary' : 'outline'} className={cn(user.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-700/50' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-700/50')}>
                            {user.status === 'active' ? 'Active' : 'Disabled'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                            {/* Link to view user profile/details page */}
                            {/* <Link href={`/admin/users/${user.id}`} legacyBehavior>
                                <Button variant="ghost" size="icon" className="h-8 w-8" title="View User Details">
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </Link> */}
                             <Button variant="ghost" size="icon" className="h-8 w-8" title="View User (Not Implemented)">
                                    <Eye className="h-4 w-4 opacity-50" />
                            </Button>
                            {/* Link to edit user page */}
                             {/* <Link href={`/admin/users/edit/${user.id}`} legacyBehavior>
                                <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit User">
                                    <Edit className="h-4 w-4" />
                                </Button>
                             </Link> */}
                             <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit User (Not Implemented)">
                                    <Edit className="h-4 w-4 opacity-50" />
                             </Button>
                             <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleToggleStatus(user)}
                                disabled={updatingUserId === user.id}
                                title={user.status === 'active' ? 'Disable User' : 'Enable User'}
                            >
                                {updatingUserId === user.id
                                    ? <Skeleton className="h-4 w-4 rounded-full" />
                                    : user.status === 'active'
                                        ? <Ban className="h-4 w-4 text-red-600" />
                                        : <UserCheck className="h-4 w-4 text-green-600" />}
                           </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        No users found matching your criteria.
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

// Extend UserProfile type for client-side state
declare module '@/services/store' {
    interface UserProfile {
        role?: string; // Add optional role
        status?: 'active' | 'disabled' | string; // Add optional status
        joinedAt?: Date; // Add optional join date
    }
}
```