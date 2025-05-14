"use client";

import type React from 'react';
import { useState, useEffect } from 'react';
import { formatDistanceToNow, parseISO, format } from 'date-fns';
// import { mockGuestServiceRequests } from '@/lib/mockData'; // Using data store
import type { GuestServiceRequest, GuestServiceStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConciergeBell, User, Hotel, Clock, Shirt, Car, Sparkles, Edit3, PlusCircle, ListFilter, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getGuestServiceRequests, updateServiceStatus } from '@/app/actions/servicesActions';
import { AddServiceModal } from '@/components/admin/AddServiceModal';

// Placeholder function - you'll need a server action for this
async function fetchGuestServiceRequests(): Promise<GuestServiceRequest[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  // return mockGuestServiceRequests; // Replace with actual data fetching
  return []; // Start with empty if no action is ready
}


export default function AdminServicesPage() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<GuestServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);

  useEffect(() => {
    async function loadRequests() {
      setIsLoading(true);
      const fetchedRequests = await getGuestServiceRequests();
      setRequests(fetchedRequests);
      setIsLoading(false);
    }
    loadRequests();
  }, []);

  const handleServiceAdded = (newService: GuestServiceRequest) => {
    setRequests(prev => [newService, ...prev]);
    toast({
      title: "Service Request Created",
      description: `New service request has been created for ${newService.guestName}`,
    });
  };

  const handleStatusChange = async (requestId: string, newStatus: GuestServiceStatus) => {
    const result = await updateServiceStatus(requestId, newStatus);
    
    if (result.success) {
      setRequests(prevRequests =>
        prevRequests.map(req =>
          req.id === requestId ? { ...req, status: newStatus } : req
        )
      );
      toast({
        title: "Service Status Updated",
        description: `Request status changed to ${newStatus}.`,
      });
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to update service status",
        variant: "destructive"
      });
    }
  };

  const getStatusBadgeVariant = (status: GuestServiceStatus) => {
    switch (status) {
      case 'Requested': return 'default';
      case 'In Progress': return 'outline';
      case 'Completed': return 'secondary';
      case 'Cancelled': return 'destructive';
      default: return 'default';
    }
  };

  const getServiceIcon = (serviceType: GuestServiceRequest['serviceType']) => {
    switch (serviceType) {
      case 'Laundry': return <Shirt className="h-4 w-4 text-blue-500" />;
      case 'Cab Booking': return <Car className="h-4 w-4 text-orange-500" />;
      case 'Spa Appointment': return <Sparkles className="h-4 w-4 text-pink-500" />;
      case 'Concierge': return <ConciergeBell className="h-4 w-4 text-purple-500" />;
      case 'Wake-up Call': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <ConciergeBell className="h-4 w-4" />;
    }
  };
  
  const filteredRequests = requests.filter(req => filterStatus === "all" || req.status === filterStatus);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ConciergeBell className="h-6 w-6 text-primary" />
              Guest Services Management
            </CardTitle>
            <CardDescription>Manage additional guest services like cab bookings, laundry, and special requests.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
             <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                    <ListFilter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Requested">Requested</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
            </Select>
            <Button onClick={() => setIsAddServiceModalOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" /> New Request
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">Loading guest services...</p>
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Requested At</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No guest service requests match the current filter.
                  </TableCell>
                </TableRow>
              )}
              {filteredRequests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium">{req.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 text-muted-foreground" /> {req.guestName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <Hotel className="h-3 w-3 inline-block mr-1" /> Room {req.roomId}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getServiceIcon(req.serviceType)}
                      {req.serviceType}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{req.details}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1" title={req.requestedAt ? format(parseISO(req.requestedAt), 'Pp') : 'N/A'}>
                        <Clock className="h-3 w-3 text-muted-foreground"/> 
                        {req.requestedAt ? formatDistanceToNow(parseISO(req.requestedAt), { addSuffix: true }) : 'N/A'}
                     </div>
                  </TableCell>
                  <TableCell className="text-center">
                     <Select 
                        defaultValue={req.status} 
                        onValueChange={(value: GuestServiceStatus) => handleStatusChange(req.id, value)}
                    >
                        <SelectTrigger className="w-[130px] h-8 text-xs capitalize bg-transparent border-0 shadow-none focus:ring-0 data-[state=open]:ring-1 data-[state=open]:ring-ring">
                             <Badge variant={getStatusBadgeVariant(req.status)} className="capitalize w-full justify-center px-1 py-0.5">
                                {req.status}
                             </Badge>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Requested">Requested</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" aria-label="Edit Request">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>

      <AddServiceModal
        isOpen={isAddServiceModalOpen}
        onOpenChange={setIsAddServiceModalOpen}
        onServiceAdded={handleServiceAdded}
      />
    </div>
  );
}
