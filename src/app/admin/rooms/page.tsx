"use client";

import type React from 'react';
import { useState, useEffect } from 'react';
// import { format } from 'date-fns'; // Not used currently
import type { Room, RoomStatus as RoomStatusType } from '@/lib/types';
import { getRooms as fetchRoomsData, deleteRoom } from '@/app/actions/roomActions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BedDouble, IndianRupee, Users, Edit3, PlusCircle, Trash2, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { AddRoomModal } from '@/components/admin/AddRoomModal';
import { EditRoomModal } from '@/components/admin/EditRoomModal';


export default function AdminRoomsPage() {
  const { toast } = useToast();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [isEditRoomModalOpen, setIsEditRoomModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function loadRooms() {
      setIsLoading(true);
      const dataRooms = await fetchRoomsData();
      setRooms(dataRooms);
      setIsLoading(false);
    }
    loadRooms();
  }, []);

  const handleRoomAdded = (newRoom: Room) => {
    setRooms(prevRooms => [newRoom, ...prevRooms].sort((a, b) => a.name.localeCompare(b.name)));
    toast({
        title: "Room Added",
        description: `${newRoom.name} has been successfully added and is now visible.`,
    });
  };

  const handleRoomEdited = (updatedRoom: Room) => {
    setRooms(prevRooms => 
      prevRooms.map(room => room.id === updatedRoom.id ? updatedRoom : room)
    );
    toast({
      title: "Room Updated",
      description: `${updatedRoom.name} has been successfully updated.`,
    });
  };

  const handleEditRoom = (room: Room) => {
    setSelectedRoom(room);
    setIsEditRoomModalOpen(true);
  };

  const handleDeleteRoom = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      setSelectedRoom(room);
      setIsDeleteAlertOpen(true);
    }
  };

  const confirmDeleteRoom = async () => {
    if (selectedRoom) {
      setIsProcessing(true);
      
      const result = await deleteRoom(selectedRoom.id);
      
      if (result.success) {
        setRooms(prevRooms => prevRooms.filter(r => r.id !== selectedRoom.id));
        toast({
          title: "Room Deleted",
          description: `Room "${selectedRoom.name}" has been successfully removed.`,
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete room",
          variant: "destructive"
        });
      }
      
      setSelectedRoom(null);
      setIsProcessing(false);
    }
    setIsDeleteAlertOpen(false);
  };

  const getStatusBadgeVariant = (status?: RoomStatusType) => {
    switch (status) {
      case 'AVAILABLE': return 'secondary';
      case 'OCCUPIED': return 'default';
      case 'MAINTENANCE': return 'destructive';
      case 'CLEANING': return 'outline'; // Assuming 'CLEANING' is a valid status
      default: return 'outline';
    }
  };

  const formatEnumValue = (value: string | undefined) => {
    if (!value) return 'Unknown';
    return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BedDouble className="h-6 w-6 text-primary" />
              Room Management
            </CardTitle>
            <CardDescription>Manage hotel rooms, types, pricing, and availability using local JSON data.</CardDescription>
          </div>
          <Button onClick={() => setIsAddRoomModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Room
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">Loading rooms...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Price/Night (₹)</TableHead>
                  <TableHead className="text-center">Capacity</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.length === 0 && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No rooms found. Add a new room to get started.
                    </TableCell>
                  </TableRow>
                )}
                {rooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium">{room.name}</TableCell>
                    <TableCell>{formatEnumValue(room.type)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <IndianRupee className="h-3 w-3 text-muted-foreground"/>
                        {room.pricePerNight.toLocaleString('en-IN')}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                       <div className="flex items-center justify-center gap-1">
                          <Users className="h-3 w-3 text-muted-foreground"/>
                          {room.capacity}
                       </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getStatusBadgeVariant(room.status)} className="capitalize">
                        {formatEnumValue(room.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="mr-1" 
                        aria-label="Edit Room" 
                        onClick={() => handleEditRoom(room)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteRoom(room.id)} aria-label="Delete Room">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AddRoomModal 
        isOpen={isAddRoomModalOpen}
        onOpenChange={setIsAddRoomModalOpen}
        onRoomAdded={handleRoomAdded}
      />

      <EditRoomModal
        isOpen={isEditRoomModalOpen}
        onOpenChange={setIsEditRoomModalOpen}
        onRoomEdited={handleRoomEdited}
        room={selectedRoom}
      />

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the room
              "{selectedRoom?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedRoom(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteRoom} 
              className="bg-red-600 hover:bg-red-700"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Yes, delete room"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
