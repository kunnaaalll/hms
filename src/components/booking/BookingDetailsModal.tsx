
"use client";

import type React from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import type { Room } from '@/lib/types';
import type { DatePickerFormData } from './DatePickerForm';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createBooking, type CreateBookingInput } from '@/app/actions/bookingActions';
import { Loader2, User, Mail, CalendarDays, Users, BedDouble, IndianRupee } from 'lucide-react';

const BookingDetailsSchema = z.object({
  guestName: z.string().min(2, { message: "Guest name must be at least 2 characters." }),
  guestEmail: z.string().email({ message: "Please enter a valid email address." }),
});

type BookingFormValues = z.infer<typeof BookingDetailsSchema>;

interface BookingDetailsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  room: Room | null;
  searchParams: DatePickerFormData | null;
}

export function BookingDetailsModal({ isOpen, onOpenChange, room, searchParams }: BookingDetailsModalProps) {
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<BookingFormValues>({
    resolver: zodResolver(BookingDetailsSchema),
  });

  if (!room || !searchParams) return null;

  const checkIn = searchParams.dateRange.from;
  const checkOut = searchParams.dateRange.to;
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24));
  const totalPrice = nights * room.pricePerNight;

  const onSubmit: SubmitHandler<BookingFormValues> = async (data) => {
    const bookingData: CreateBookingInput = {
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      checkInDate: format(checkIn, 'yyyy-MM-dd'), // Stored as string
      checkOutDate: format(checkOut, 'yyyy-MM-dd'), // Stored as string
      numberOfGuests: searchParams.numberOfGuests,
      roomId: room.id,
      roomType: room.type, // This is already RoomType string union
      totalPrice: totalPrice,
    };

    const result = await createBooking(bookingData);

    if (result.success) {
      toast({
        title: "Booking Successful!",
        description: `Your booking for ${room.name} has been confirmed. Booking ID: ${result.booking?.id}`,
      });
      reset();
      onOpenChange(false);
    } else {
      toast({
        title: "Booking Failed",
        description: result.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) reset();
    }}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Confirm Your Booking</DialogTitle>
          <DialogDescription>
            You are about to book the <span className="font-semibold text-primary">{room.name}</span>. Please provide your details.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 my-4 p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
                <BedDouble className="h-5 w-5 text-primary" /> 
                <div>
                    <p className="text-sm font-medium">{room.name}</p>
                    <p className="text-xs text-muted-foreground">{room.type.replace(/_/g, ' ')}</p>
                </div>
            </div>
             <div className="flex items-center gap-2">
                <IndianRupee className="h-5 w-5 text-primary" />
                <div>
                    <p className="text-sm font-medium">{totalPrice.toLocaleString('en-IN')} total</p>
                    <p className="text-xs text-muted-foreground">{room.pricePerNight.toLocaleString('en-IN')} / night</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" /> 
                <div>
                    <p className="text-sm font-medium">{format(checkIn, 'MMM dd, yyyy')} - {format(checkOut, 'MMM dd, yyyy')}</p>
                    <p className="text-xs text-muted-foreground">{nights} night(s)</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <div>
                    <p className="text-sm font-medium">{searchParams.numberOfGuests} Guest(s)</p>
                </div>
            </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="guestName">Full Name</Label>
            <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="guestName" {...register("guestName")} placeholder="e.g., John Doe" className="pl-10" />
            </div>
            {errors.guestName && <p className="text-sm text-destructive mt-1">{errors.guestName.message}</p>}
          </div>
          <div>
            <Label htmlFor="guestEmail">Email Address</Label>
             <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="guestEmail" type="email" {...register("guestEmail")} placeholder="e.g., john.doe@example.com" className="pl-10" />
            </div>
            {errors.guestEmail && <p className="text-sm text-destructive mt-1">{errors.guestEmail.message}</p>}
          </div>
          <DialogFooter className="pt-4">
            <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm & Book"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
