'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { addRoomToStore, getAllRooms } from '@/lib/jsonDataStore';
import type { Room, RoomType, RoomStatus } from '@/lib/types';
import fs from 'fs/promises';
import path from 'path';

// Path to the JSON data file
const DATA_FILE_PATH = path.join(process.cwd(), 'src', 'lib', 'data.json');

// Define string arrays for enum validation - internal to this file
const roomTypesList: [RoomType, ...RoomType[]] = ['STANDARD_TWIN', 'DELUXE_QUEEN', 'LUXURY_KING_SUITE', 'FAMILY_SUITE', 'EXECUTIVE_SUITE', 'PRESIDENTIAL_SUITE'];
const roomStatusesList: [RoomStatus, ...RoomStatus[]] = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'CLEANING'];

// Internal schema for server-side validation, not exported
const InternalAddRoomFormSchema = z.object({
  name: z.string().min(3, "Room name must be at least 3 characters."),
  type: z.enum(roomTypesList),
  pricePerNight: z.coerce.number().min(0, "Price must be a positive number."),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1."),
  amenities: z.string(), // Will be split in the action
  imageUrl: z.string().url("Invalid image URL.").or(z.literal("")).optional(),
  dataAiHint: z.string().optional(),
  availabilityScore: z.coerce.number().min(0).max(100, "Availability score must be between 0 and 100."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  status: z.enum(roomStatusesList),
});

// Exporting the type inferred from the internal schema
export type AddRoomInput = z.infer<typeof InternalAddRoomFormSchema>;

export async function addRoom(data: AddRoomInput) {
  const validatedData = InternalAddRoomFormSchema.safeParse(data);

  if (!validatedData.success) {
    console.error("Room validation errors:", validatedData.error.flatten().fieldErrors);
    return {
      success: false,
      errors: validatedData.error.flatten().fieldErrors,
      message: "Invalid room data. Please check all fields.",
    };
  }

  try {
    const { amenities: amenitiesString, imageUrl: originalImageUrl, ...restOfValidatedData } = validatedData.data;
    
    const amenitiesArray = amenitiesString
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    let finalImageUrl = originalImageUrl;
    // Handle empty string or undefined for imageUrl, and set a default placeholder
    if (!finalImageUrl || finalImageUrl.trim() === "") {
      finalImageUrl = `https://placehold.co/600x400.png`;
    }


    const roomDataForStore = {
      ...restOfValidatedData,
      amenities: amenitiesArray,
      imageUrl: finalImageUrl,
    };

    const newRoom = await addRoomToStore(roomDataForStore);
    revalidatePath('/admin/rooms');
    revalidatePath('/');
    return {
      success: true,
      room: newRoom,
      message: "Room added successfully!",
    };
  } catch (error) {
    console.error("Error adding room:", error);
    return {
      success: false,
      message: "Failed to add room. Please try again later or contact support.",
    };
  }
}

export async function getRooms(): Promise<Room[]> {
  try {
    const rooms = await getAllRooms();
    return rooms;
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return []; 
  }
}

// New action to edit a room
export async function editRoom(roomId: string, data: AddRoomInput) {
  const validatedData = InternalAddRoomFormSchema.safeParse(data);

  if (!validatedData.success) {
    console.error("Room validation errors:", validatedData.error.flatten().fieldErrors);
    return {
      success: false,
      errors: validatedData.error.flatten().fieldErrors,
      message: "Invalid room data. Please check all fields.",
    };
  }
  
  try {
    // Read data from file
    const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const jsonData = JSON.parse(fileContent);
    
    // Find the room in the data
    const roomIndex = jsonData.rooms.findIndex((room: Room) => room.id === roomId);
    
    if (roomIndex === -1) {
      return {
        success: false,
        message: `Room with ID ${roomId} not found`,
      };
    }
    
    const { amenities: amenitiesString, imageUrl: originalImageUrl, ...restOfValidatedData } = validatedData.data;
    
    const amenitiesArray = amenitiesString
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    let finalImageUrl = originalImageUrl;
    // Handle empty string or undefined for imageUrl
    if (!finalImageUrl || finalImageUrl.trim() === "") {
      finalImageUrl = `https://placehold.co/600x400.png`;
    }

    // Update the room data
    jsonData.rooms[roomIndex] = {
      ...jsonData.rooms[roomIndex],
      ...restOfValidatedData,
      amenities: amenitiesArray,
      imageUrl: finalImageUrl,
      updatedAt: new Date().toISOString(),
    };
    
    // Write the updated data back to the file
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(jsonData, null, 2), 'utf-8');
    
    // Revalidate the rooms page
    revalidatePath('/admin/rooms');
    revalidatePath('/');
    
    return {
      success: true,
      room: jsonData.rooms[roomIndex],
      message: "Room updated successfully!",
    };
  } catch (error) {
    console.error("Error editing room:", error);
    return {
      success: false,
      message: "Failed to update room. Please try again later or contact support.",
    };
  }
}

// New action to delete a room
export async function deleteRoom(roomId: string) {
  try {
    // Read data from file
    const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const jsonData = JSON.parse(fileContent);
    
    // Find the room in the data
    const roomIndex = jsonData.rooms.findIndex((room: Room) => room.id === roomId);
    
    if (roomIndex === -1) {
      return {
        success: false,
        message: `Room with ID ${roomId} not found`,
      };
    }
    
    // Remove the room
    jsonData.rooms.splice(roomIndex, 1);
    
    // Write the updated data back to the file
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(jsonData, null, 2), 'utf-8');
    
    // Revalidate the rooms page
    revalidatePath('/admin/rooms');
    revalidatePath('/');
    
    return {
      success: true,
      message: "Room deleted successfully!",
    };
  } catch (error) {
    console.error("Error deleting room:", error);
    return {
      success: false,
      message: "Failed to delete room. Please try again later or contact support.",
    };
  }
}
