"use client";

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { createGuestServiceRequest, type CreateServiceRequestInput } from '@/app/actions/servicesActions';
import { getRooms } from '@/app/actions/roomActions';
import type { GuestServiceRequest, Room } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AddServiceModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onServiceAdded: (newService: GuestServiceRequest) => void;
}

// Define service types array
const serviceTypesArray = ['Laundry', 'Cab Booking', 'Spa Appointment', 'Concierge', 'Wake-up Call'] as const;

// Define schema for service form
const ServiceFormSchema = z.object({
  guestName: z.string().min(2, "Guest name must be at least 2 characters"),
  roomId: z.string().min(1, "Room ID is required"),
  serviceType: z.enum(serviceTypesArray),
  details: z.string().min(5, "Service details are required"),
});

type ServiceFormInput = z.infer<typeof ServiceFormSchema>;

export function AddServiceModal({ isOpen, onOpenChange, onServiceAdded }: AddServiceModalProps) {
  const { toast } = useToast();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  
  // Fetch rooms for select input
  useEffect(() => {
    async function loadRooms() {
      setIsLoadingRooms(true);
      const fetchedRooms = await getRooms();
      setRooms(fetchedRooms);
      setIsLoadingRooms(false);
    }
    
    if (isOpen) {
      loadRooms();
    }
  }, [isOpen]);
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue } = useForm<ServiceFormInput>({
    resolver: zodResolver(ServiceFormSchema),
    defaultValues: {
      guestName: '',
      roomId: '',
      serviceType: 'Laundry',
      details: '',
    },
  });
  
  const onSubmit: SubmitHandler<ServiceFormInput> = async (data) => {
    // Add status field to match the CreateServiceRequestInput type
    const serviceData: CreateServiceRequestInput = {
      ...data,
      status: 'Requested'
    };
    
    const result = await createGuestServiceRequest(serviceData);
    
    if (result.success && result.serviceRequest) {
      toast({
        title: "Service Request Created!",
        description: `New guest service request has been successfully created.`,
      });
      onServiceAdded(result.serviceRequest);
      reset();
      onOpenChange(false);
    } else {
      toast({
        title: "Failed to Create Service Request",
        description: result.message || "An error occurred. Please check the details and try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) reset();
    }}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Guest Service Request</DialogTitle>
          <DialogDescription>
            Register a new service request for a guest.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div>
            <Label htmlFor="guestName">Guest Name</Label>
            <Input 
              id="guestName" 
              {...register("guestName")} 
              placeholder="Full name of the guest" 
              className="mt-1" 
            />
            {errors.guestName && (
              <p className="text-sm text-destructive mt-1">{errors.guestName.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="roomId">Room</Label>
            <Select 
              onValueChange={(value) => setValue("roomId", value)} 
              defaultValue=""
            >
              <SelectTrigger id="roomId" className="mt-1">
                <SelectValue placeholder="Select a room" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingRooms ? (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading rooms...
                  </div>
                ) : rooms.length === 0 ? (
                  <div className="p-2 text-center text-muted-foreground">No rooms found</div>
                ) : (
                  rooms.map(room => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name} ({room.type.replace(/_/g, ' ')})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.roomId && (
              <p className="text-sm text-destructive mt-1">{errors.roomId.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="serviceType">Service Type</Label>
            <Select 
              onValueChange={(value) => setValue("serviceType", value as any)} 
              defaultValue="Laundry"
            >
              <SelectTrigger id="serviceType" className="mt-1">
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                {serviceTypesArray.map(serviceType => (
                  <SelectItem key={serviceType} value={serviceType}>
                    {serviceType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.serviceType && (
              <p className="text-sm text-destructive mt-1">{errors.serviceType.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="details">Service Details</Label>
            <Textarea 
              id="details" 
              {...register("details")} 
              placeholder="Describe the service request in detail" 
              className="mt-1" 
              rows={3}
            />
            {errors.details && (
              <p className="text-sm text-destructive mt-1">{errors.details.message}</p>
            )}
          </div>
          
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Service Request...
                </>
              ) : (
                "Create Service Request"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 