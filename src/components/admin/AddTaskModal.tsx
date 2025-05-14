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
import { createHousekeepingTask, type CreateTaskInput } from '@/app/actions/housekeepingActions';
import { getRooms } from '@/app/actions/roomActions';
import type { HousekeepingTask, Room } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AddTaskModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onTaskAdded: (newTask: HousekeepingTask) => void;
}

// Define room types array
const roomTypesArray = ['STANDARD_TWIN', 'DELUXE_QUEEN', 'LUXURY_KING_SUITE', 'FAMILY_SUITE', 'EXECUTIVE_SUITE', 'PRESIDENTIAL_SUITE'] as const;

// Define task types and status
const taskTypesArray = ['Full Clean', 'Towel Change', 'Turndown Service', 'Maintenance Check'] as const;
const taskStatusArray = ['Pending', 'In Progress', 'Completed', 'Blocked'] as const;

// Define schema for task form
const TaskFormSchema = z.object({
  roomId: z.string().min(1, "Room ID is required"),
  roomType: z.enum(roomTypesArray),
  task: z.enum(taskTypesArray),
  status: z.enum(taskStatusArray).default('Pending'),
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
});

type TaskFormInput = z.infer<typeof TaskFormSchema>;

export function AddTaskModal({ isOpen, onOpenChange, onTaskAdded }: AddTaskModalProps) {
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
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue, watch } = useForm<TaskFormInput>({
    resolver: zodResolver(TaskFormSchema),
    defaultValues: {
      roomId: '',
      roomType: 'STANDARD_TWIN',
      task: 'Full Clean',
      status: 'Pending',
      assignedTo: '',
      notes: '',
    },
  });
  
  // Watch roomId to update roomType automatically
  const watchedRoomId = watch('roomId');
  
  // Update roomType based on selected room
  useEffect(() => {
    if (watchedRoomId) {
      const selectedRoom = rooms.find(room => room.id === watchedRoomId);
      if (selectedRoom) {
        setValue('roomType', selectedRoom.type);
      }
    }
  }, [watchedRoomId, rooms, setValue]);
  
  const onSubmit: SubmitHandler<TaskFormInput> = async (data) => {
    const result = await createHousekeepingTask(data);
    
    if (result.success && result.task) {
      toast({
        title: "Task Created!",
        description: `New housekeeping task has been successfully created.`,
      });
      onTaskAdded(result.task);
      reset();
      onOpenChange(false);
    } else {
      toast({
        title: "Failed to Create Task",
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
          <DialogTitle>Create New Housekeeping Task</DialogTitle>
          <DialogDescription>
            Assign a new housekeeping task to a room.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
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
            <Label htmlFor="task">Task Type</Label>
            <Select 
              onValueChange={(value) => setValue("task", value as any)} 
              defaultValue="Full Clean"
            >
              <SelectTrigger id="task" className="mt-1">
                <SelectValue placeholder="Select task type" />
              </SelectTrigger>
              <SelectContent>
                {taskTypesArray.map(taskType => (
                  <SelectItem key={taskType} value={taskType}>
                    {taskType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.task && (
              <p className="text-sm text-destructive mt-1">{errors.task.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="assignedTo">Assigned To (Optional)</Label>
            <Input 
              id="assignedTo" 
              {...register("assignedTo")} 
              placeholder="Employee name" 
              className="mt-1" 
            />
            {errors.assignedTo && (
              <p className="text-sm text-destructive mt-1">{errors.assignedTo.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea 
              id="notes" 
              {...register("notes")} 
              placeholder="Any special instructions or details" 
              className="mt-1" 
              rows={3}
            />
            {errors.notes && (
              <p className="text-sm text-destructive mt-1">{errors.notes.message}</p>
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
                  Creating Task...
                </>
              ) : (
                "Create Task"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 