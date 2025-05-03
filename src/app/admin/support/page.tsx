'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LifeBuoy, MessageSquare, Inbox, CheckCircle, Clock, ArrowRight, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";

// Mock data (replace with actual data fetching)
const mockTickets = [
  { id: 'TKT-001', subject: 'Issue with payment on order #10105', user: 'alex.ryder@example.com', status: 'Open', priority: 'High', createdAt: new Date(Date.now() - 3 * 3600000), lastUpdate: new Date(Date.now() - 30 * 60000) },
  { id: 'TKT-002', subject: 'Driver location not updating', user: 'user.456@example.com', status: 'In Progress', priority: 'Medium', createdAt: new Date(Date.now() - 24 * 3600000), lastUpdate: new Date(Date.now() - 2 * 3600000) },
  { id: 'TKT-003', subject: 'Cannot add product to GreenBasket Organics', user: 'store.owner@greenbasket.com', status: 'Closed', priority: 'Low', createdAt: new Date(Date.now() - 3 * 86400000), lastUpdate: new Date(Date.now() - 1 * 86400000) },
  { id: 'TKT-004', subject: 'Question about subscription cancellation', user: 'user.789@example.com', status: 'Open', priority: 'Medium', createdAt: new Date(Date.now() - 5 * 3600000), lastUpdate: new Date(Date.now() - 1 * 3600000) },
];

const mockFaqs = [
    { id: 'FAQ-001', question: 'How do I track my order?', answer: 'You can track your order in real-time from the "My Orders" page...' },
    { id: 'FAQ-002', question: 'How can I update my store information?', answer: 'Navigate to "Manage Your Stores", select your store, and click "Edit Store Details"...' },
    { id: 'FAQ-003', question: 'What are the requirements to become a driver?', answer: 'Drivers need a valid license, insurance, and a suitable vehicle...' },
];

type TicketStatus = 'Open' | 'In Progress' | 'Closed';
type TicketPriority = 'Low' | 'Medium' | 'High';

interface SupportTicket {
    id: string;
    subject: string;
    user: string; // email or user ID
    status: TicketStatus;
    priority: TicketPriority;
    createdAt: Date;
    lastUpdate: Date;
}

interface FAQ {
    id: string;
    question: string;
    answer: string;
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>(mockTickets);
  const [faqs, setFaqs] = useState<FAQ[]>(mockFaqs);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [isLoadingFaqs, setIsLoadingFaqs] = useState(false);
  const [filterStatus, setFilterStatus] = useState<TicketStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<TicketPriority | 'all'>('all');

  // TODO: Implement functions to fetch/update tickets and FAQs

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket =>
      (filterStatus === 'all' || ticket.status === filterStatus) &&
      (filterPriority === 'all' || ticket.priority === filterPriority)
    );
  }, [tickets, filterStatus, filterPriority]);


  const getStatusBadgeVariant = (status: TicketStatus): BadgeProps['variant'] => {
      switch (status) {
          case 'Open': return 'destructive';
          case 'In Progress': return 'secondary';
          case 'Closed': return 'outline';
          default: return 'default';
      }
  };

  const getPriorityBadgeVariant = (priority: TicketPriority): BadgeProps['variant'] => {
       switch (priority) {
          case 'High': return 'destructive';
          case 'Medium': return 'secondary';
          case 'Low': return 'outline';
          default: return 'default';
      }
  };


  const TableSkeleton = () => (
     <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">ID</TableHead>
          <TableHead>Subject</TableHead>
          <TableHead className="hidden md:table-cell">User</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="hidden sm:table-cell">Priority</TableHead>
           <TableHead className="hidden lg:table-cell">Last Update</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 3 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton className="h-4 w-full" /></TableCell>
            <TableCell><Skeleton className="h-4 w-full" /></TableCell>
            <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-full" /></TableCell>
             <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
            <TableCell className="hidden sm:table-cell"><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
             <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-full" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-8 w-8 inline-block" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
        <LifeBuoy className="h-7 w-7" /> Support Center
      </h1>

      {/* Support Tickets Section */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
             <CardTitle className="flex items-center gap-2"><Inbox className="h-5 w-5" /> Support Tickets</CardTitle>
             <CardDescription>Manage user-reported issues and requests.</CardDescription>
          </div>
           {/* Optional: Button to create a ticket manually? */}
           {/* <Button variant="outline" size="sm"><PlusCircle className="mr-2 h-4 w-4" /> New Ticket</Button> */}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
             {/* Filters */}
             <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as TicketStatus | 'all')}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={(value) => setFilterPriority(value as TicketPriority | 'all')}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by Priority" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
            </Select>
             {/* Optional Search Input */}
             {/* <Input placeholder="Search tickets..." className="flex-grow" /> */}
          </div>

           <div className="rounded-md border overflow-hidden">
                {isLoadingTickets ? <TableSkeleton /> : (
                    <Table>
                         <TableHeader>
                            <TableRow>
                            <TableHead className="w-[100px]">ID</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead className="hidden md:table-cell">User</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="hidden sm:table-cell">Priority</TableHead>
                            <TableHead className="hidden lg:table-cell">Last Update</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                         <TableBody>
                            {filteredTickets.length > 0 ? (
                                filteredTickets.map((ticket) => (
                                <TableRow key={ticket.id}>
                                    <TableCell className="font-mono text-xs">{ticket.id}</TableCell>
                                    <TableCell className="font-medium max-w-[300px] truncate">{ticket.subject}</TableCell>
                                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{ticket.user}</TableCell>
                                    <TableCell>
                                         <Badge variant={getStatusBadgeVariant(ticket.status)}>{ticket.status}</Badge>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">
                                        <Badge variant={getPriorityBadgeVariant(ticket.priority)}>{ticket.priority}</Badge>
                                    </TableCell>
                                     <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{format(ticket.lastUpdate, 'MMM d, yyyy HH:mm')}</TableCell>
                                    <TableCell className="text-right">
                                        {/* Link to view/reply to ticket */}
                                        <Button variant="ghost" size="icon" className="h-8 w-8" title="View Ticket (Not Implemented)">
                                            <ArrowRight className="h-4 w-4 opacity-50" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                        No tickets found matching your criteria.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>
        </CardContent>
      </Card>

      {/* FAQ Management Section */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
           <div>
                <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" /> FAQ Management</CardTitle>
                <CardDescription>Create and manage Frequently Asked Questions.</CardDescription>
           </div>
           <Button variant="outline" size="sm" disabled> {/* Disabled for now */}
             <PlusCircle className="mr-2 h-4 w-4" /> Add FAQ
           </Button>
        </CardHeader>
        <CardContent>
           {isLoadingFaqs ? (
             <Skeleton className="h-40 w-full rounded-md" />
           ) : (
             <div className="space-y-3">
                {faqs.length > 0 ? faqs.map((faq) => (
                    <Card key={faq.id} className="bg-muted/50">
                        <CardHeader className="flex flex-row justify-between items-start p-4">
                            <p className="font-semibold text-sm">{faq.question}</p>
                             <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7" title="Edit FAQ (Not Implemented)" disabled>
                                    <Edit className="h-3.5 w-3.5 opacity-50" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" title="Delete FAQ (Not Implemented)" disabled>
                                    <Trash2 className="h-3.5 w-3.5 opacity-50" />
                                </Button>
                            </div>
                        </CardHeader>
                         <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
                           <p>{faq.answer}</p>
                        </CardContent>
                    </Card>
                )) : (
                    <p className="text-sm text-muted-foreground italic text-center py-4">No FAQs have been added yet.</p>
                )}
             </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}

// Define BadgeProps type locally if needed
import { type VariantProps } from "class-variance-authority";
import { badgeVariants } from "@/components/ui/badge";
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}
```