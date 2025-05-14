
"use client";

import type React from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod'; // Import Zod
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
import { addRoom, type AddRoomInput } from '@/app/actions/roomActions'; // Import only addRoom and AddRoomInput type
import type { Room, RoomType, RoomStatus } from '@/lib/types';
import { Loader2, BedDouble, IndianRupee, Users, Percent, Image as ImageIcon, Type, Info, CheckSquare } from 'lucide-react';

interface AddRoomModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onRoomAdded: (newRoom: Room) => void;
}

// Define roomTypesArray and roomStatusesArray for the Select components and Zod schema
const roomTypesArray: [RoomType, ...RoomType[]] = ['STANDARD_TWIN', 'DELUXE_QUEEN', 'LUXURY_KING_SUITE', 'FAMILY_SUITE', 'EXECUTIVE_SUITE', 'PRESIDENTIAL_SUITE'];
const roomStatusesArray: [RoomStatus, ...RoomStatus[]] = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'CLEANING'];

// Define AddRoomFormSchema directly in this file for client-side validation
const AddRoomFormSchema = z.object({
  name: z.string().min(3, "Room name must be at least 3 characters."),
  type: z.enum(roomTypesArray),
  pricePerNight: z.coerce.number().min(0, "Price must be a positive number."),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1."),
  amenities: z.string(), // Will be comma-separated string, parsed in action
  imageUrl: z.string().url("Invalid image URL.").or(z.literal("")).optional(),
  dataAiHint: z.string().optional(),
  availabilityScore: z.coerce.number().min(0).max(100, "Availability score must be between 0 and 100."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  status: z.enum(roomStatusesArray),
});


const formatEnumValue = (value: string) => {
  if (!value) return '';
  return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export function AddRoomModal({ isOpen, onOpenChange, onRoomAdded }: AddRoomModalProps) {
  const { toast } = useToast();
  const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset, setValue } = useForm<AddRoomInput>({
    resolver: zodResolver(AddRoomFormSchema), // Use the schema defined in this file
    defaultValues: {
      name: '',
      type: 'STANDARD_TWIN' as RoomType,
      pricePerNight: 10000,
      capacity: 2,
      amenities: 'WiFi, Air Conditioning',
      imageUrl: '',
      dataAiHint: '',
      availabilityScore: 75,
      description: '',
      status: 'AVAILABLE' as RoomStatus,
    },
  });

  const onSubmit: SubmitHandler<AddRoomInput> = async (data) => {
    const result = await addRoom(data);

    if (result.success && result.room) {
      toast({
        title: "Room Added!",
        description: `${result.room.name} has been successfully added.`,
      });
      onRoomAdded(result.room);
      reset();
      onOpenChange(false);
    } else {
      toast({
        title: "Failed to Add Room",
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Room</DialogTitle>
          <DialogDescription>
            Fill in the details for the new room. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Room Name</Label>
              <div className="relative mt-1">
                <BedDouble className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="name" {...register("name")} placeholder="e.g., Deluxe Queen Ocean View" className="pl-10" />
              </div>
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="type">Room Type</Label>
               <Select 
                  onValueChange={(value) => setValue("type", value as RoomType)} 
                  defaultValue={'STANDARD_TWIN' as RoomType} // Default value for the select
                >
                <SelectTrigger id="type" className="mt-1">
                    <Type className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <SelectValue placeholder="Select room type" className="pl-6" />
                </SelectTrigger>
                <SelectContent>
                  {roomTypesArray.map(typeVal => (
                    <SelectItem key={typeVal} value={typeVal}>{formatEnumValue(typeVal)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && <p className="text-sm text-destructive mt-1">{errors.type.message}</p>}
            </div>

            <div>
              <Label htmlFor="pricePerNight">Price per Night (₹)</Label>
              <div className="relative mt-1">
                <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="pricePerNight" type="number" {...register("pricePerNight")} placeholder="e.g., 15000" className="pl-10" />
              </div>
              {errors.pricePerNight && <p className="text-sm text-destructive mt-1">{errors.pricePerNight.message}</p>}
            </div>

            <div>
              <Label htmlFor="capacity">Capacity (Guests)</Label>
              <div className="relative mt-1">
                <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="capacity" type="number" {...register("capacity")} placeholder="e.g., 2" className="pl-10" />
              </div>
              {errors.capacity && <p className="text-sm text-destructive mt-1">{errors.capacity.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
             <div className="relative mt-1">
                <Info className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea id="description" {...register("description")} placeholder="Brief description of the room..." className="pl-10" rows={3}/>
            </div>
            {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
          </div>

          <div>
            <Label htmlFor="amenities">Amenities (comma-separated)</Label>
            <Input id="amenities" {...register("amenities")} placeholder="e.g., WiFi, Air Conditioning, TV" className="mt-1" />
            {errors.amenities && <p className="text-sm text-destructive mt-1">{errors.amenities.message}</p>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <div className="relative mt-1">
                    <ImageIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="imageUrl" {...register("imageUrl")} placeholder="https://placehold.co/600x400.png" className="pl-10" />
                </div>
                {errors.imageUrl && <p className="text-sm text-destructive mt-1">{errors.imageUrl.message}</p>}
            </div>
            <div>
              <Label htmlFor="dataAiHint">Image AI Hint (Optional)</Label>
              <Input id="dataAiHint" {...register("dataAiHint")} placeholder="e.g., modern bedroom" className="mt-1" />
              {errors.dataAiHint && <p className="text-sm text-destructive mt-1">{errors.dataAiHint.message}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="availabilityScore">Availability Score (%)</Label>
              <div className="relative mt-1">
                <Percent className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="availabilityScore" type="number" {...register("availabilityScore")} placeholder="0-100" className="pl-10" />
              </div>
              {errors.availabilityScore && <p className="text-sm text-destructive mt-1">{errors.availabilityScore.message}</p>}
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                  onValueChange={(value) => setValue("status", value as RoomStatus)} 
                  defaultValue={'AVAILABLE' as RoomStatus} // Default value for the select
                >
                <SelectTrigger id="status" className="mt-1">
                  <CheckSquare className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <SelectValue placeholder="Select status" className="pl-6"/>
                </SelectTrigger>
                <SelectContent>
                  {roomStatusesArray.map(statusVal => (
                    <SelectItem key={statusVal} value={statusVal}>{formatEnumValue(statusVal)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && <p className="text-sm text-destructive mt-1">{errors.status.message}</p>}
            </div>
          </div>

          <DialogFooter className="pt-6">
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Room...
                </>
              ) : (
                "Save Room"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

