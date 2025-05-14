"use client";

import type React from 'react';
import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
// import { mockBookingRequests } from '@/lib/mockData'; // Using DB/JSON store now
import type { BookingRequest } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, MoreHorizontal, CalendarClock, User, Hotel, IndianRupee, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { updateBookingStatus } from "@/app/actions/updateBookingStatus";

// Placeholder for a server action to get bookings
async function fetchBookingRequests(): Promise<BookingRequest[]> {
  // In a real app, this would call your jsonDataStore.getAllBookingRequests()
  // For now, returning an empty array or a static list if jsonDataStore isn't fully wired up for this page yet.
  // This is just to get the page rendering without mockData.ts directly.
  // You'll need to implement a server action similar to getRooms.
  try {
    const response = await fetch('/api/bookings'); // Example: if you create an API route
    if (!response.ok) throw new Error('Failed to fetch bookings');
    return await response.json();
  } catch (error) {
    console.error("Using mock bookings due to fetch error:", error)
    // Fallback to a limited mock or empty:
    return [
        {
            id: 'B001-json',
            guestName: 'Alice (from JSON)',
            guestEmail: 'alice.json@example.com',
            checkInDate: '2024-10-10',
            checkOutDate: '2024-10-12',
            numberOfGuests: 2,
            roomType: 'DELUXE_QUEEN',
            roomId: '1',
            totalPrice: 36000,
            status: 'PENDING',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
    ];
  }
}


export default function AdminBookingsPage() {
  const { toast } = useToast();
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<BookingRequest | null>(null);
  const [actionType, setActionType] = useState<'accept' | 'reject' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function loadBookings() {
      setIsLoading(true);
      // const bookings = await getAllBookingRequests(); // TODO: Create this server action
      // For now, using placeholder fetch
      const bookings = await fetchBookingRequests();
      setBookingRequests(bookings);
      setIsLoading(false);
    }
    loadBookings();
  }, []);


  const handleAction = (bookingId: string, type: 'accept' | 'reject') => {
    const booking = bookingRequests.find(b => b.id === bookingId);
    if (booking) {
      setSelectedBooking(booking);
      setActionType(type);
    }
  };
  
  const confirmAction = async () => {
    if (!selectedBooking || !actionType) return;

    setIsProcessing(true);
    
    // Use the server action to update booking status
    const newStatus = actionType === 'accept' ? 'CONFIRMED' : 'REJECTED';
    const result = await updateBookingStatus(selectedBooking.id, newStatus);
    
    if (result.success) {
      // Update local state
      setBookingRequests(prev =>
        prev.map(b =>
          b.id === selectedBooking.id ? { ...b, status: newStatus } : b
        )
      );
      
      toast({
        title: `Booking ${actionType === 'accept' ? 'Accepted' : 'Rejected'}`,
        description: `Booking for ${selectedBooking.guestName} has been ${actionType === 'accept' ? 'confirmed' : 'rejected'}.`,
      });
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to update booking status",
        variant: "destructive"
      });
    }
    
    setSelectedBooking(null);
    setActionType(null);
    setIsProcessing(false);
  };

  const getStatusBadgeVariant = (status: BookingRequest['status']) => {
    switch (status) {
      case 'PENDING': return 'default'; 
      case 'CONFIRMED': return 'secondary'; 
      case 'REJECTED': return 'destructive';
      case 'CANCELLED': return 'outline';
      case 'COMPLETED': return 'default'; // Or another variant like 'success'
      default: return 'default';
    }
  };


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Booking Requests</CardTitle>
          <CardDescription>View and manage incoming booking requests for Lavender Luxury Hotel.</CardDescription>
        </CardHeader>
        <CardContent>
        {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">Loading booking requests...</p>
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Room</TableHead>
                <TableHead className="text-right">Total (₹)</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookingRequests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No pending booking requests.
                  </TableCell>
                </TableRow>
              )}
              {bookingRequests.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div className="font-medium">{booking.guestName}</div>
                    <div className="text-xs text-muted-foreground">{booking.guestEmail}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <CalendarClock className="h-3 w-3 text-muted-foreground"/>
                       {format(parseISO(booking.checkInDate), 'MMM dd, yyyy')} - {format(parseISO(booking.checkOutDate), 'MMM dd, yyyy')}
                    </div>
                    <div className="text-xs text-muted-foreground">{booking.numberOfGuests} Guest(s)</div>
                  </TableCell>
                  <TableCell>
                     <div className="flex items-center gap-1">
                        <Hotel className="h-3 w-3 text-muted-foreground"/>
                        {booking.roomType.replace(/_/g, ' ')}
                     </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                        <IndianRupee className="h-3 w-3 text-muted-foreground"/>
                        {booking.totalPrice.toLocaleString('en-IN')}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getStatusBadgeVariant(booking.status)} className="capitalize">
                      {booking.status.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {booking.status === 'PENDING' ? (
                       <AlertDialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={() => handleAction(booking.id, 'accept')}>
                                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> Accept
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={() => handleAction(booking.id, 'reject')}>
                                <XCircle className="mr-2 h-4 w-4 text-red-500" /> Reject
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              You are about to {actionType} the booking for {selectedBooking?.guestName} for room type {selectedBooking?.roomType.replace(/_/g, ' ')} from {selectedBooking ? format(parseISO(selectedBooking.checkInDate), 'MMM dd, yyyy') : ''} to {selectedBooking ? format(parseISO(selectedBooking.checkOutDate), 'MMM dd, yyyy') : ''}. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => {setSelectedBooking(null); setActionType(null);}}>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={confirmAction}
                              disabled={isProcessing}
                              className={actionType === 'accept' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                            >
                              {isProcessing ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                <>Confirm {actionType === 'accept' ? 'Acceptance' : 'Rejection'}</>
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Processed</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
