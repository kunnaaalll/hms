
'use server';
import fs from 'fs/promises';
import path from 'path';
import type { AppData, Room, BookingRequest, HotelSettings, RoomType, RoomStatus } from './types'; // Ensure correct types
import { mockRooms, mockBookingRequests, mockHotelSettings } from './mockData'; // For initial data structure

// Path to the JSON data file
const DATA_FILE_PATH = path.join(process.cwd(), 'src', 'lib', 'data.json');

// Helper to generate a new unique ID (simple timestamp-based for now)
const generateNewId = (prefix = ''): string => {
  return `${prefix}${Date.now().toString()}${Math.random().toString(36).substring(2, 7)}`;
};

// Read data from the JSON file
async function readData(): Promise<AppData> {
  try {
    const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    if (!fileContent) {
        console.warn('data.json is empty. Initializing with default structure.');
        return getInitialDataStructure();
    }
    return JSON.parse(fileContent) as AppData;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, so create it with initial data
      console.log('data.json not found. Creating with initial data from mockData.ts');
      const initialData = getInitialDataStructure();
      await writeData(initialData);
      return initialData;
    }
    console.error('Error reading data.json:', error);
    // Fallback to a default structure in case of other read errors, to prevent app crash
    // but this might hide underlying issues.
    return getInitialDataStructure();
  }
}

// Write data to the JSON file
async function writeData(data: AppData): Promise<void> {
  try {
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing to data.json:', error);
    throw new Error('Failed to save data.'); // Re-throw to indicate failure
  }
}

// Provides the initial structure for data.json
function getInitialDataStructure(): AppData {
  return {
    rooms: mockRooms.map(r => ({...r, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()})),
    bookingRequests: mockBookingRequests.map(br => ({...br, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()})),
    restaurantOrders: [],
    housekeepingTasks: [],
    guestServiceRequests: [],
    hotelSettings: mockHotelSettings ? {...mockHotelSettings, id: 'singleton', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()} : null,
  };
}


// --- Room Operations ---
export async function getAllRooms(): Promise<Room[]> {
  const data = await readData();
  return data.rooms || [];
}

export async function addRoomToStore(newRoomData: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>): Promise<Room> {
  const data = await readData();
  const newRoom: Room = {
    ...newRoomData,
    id: generateNewId('room_'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  data.rooms = [...(data.rooms || []), newRoom];
  await writeData(data);
  return newRoom;
}

// --- Booking Operations ---
export async function createBookingInStore(newBookingData: Omit<BookingRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<BookingRequest> {
  const data = await readData();
  const newBooking: BookingRequest = {
    ...newBookingData,
    id: generateNewId('bk_'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  data.bookingRequests = [...(data.bookingRequests || []), newBooking];
  await writeData(data);
  return newBooking;
}

export async function getAllBookingRequests(): Promise<BookingRequest[]> {
  const data = await readData();
  return data.bookingRequests || [];
}

// --- Hotel Settings Operations ---
export async function getHotelSettings(): Promise<HotelSettings | null> {
  const data = await readData();
  if (data.hotelSettings && data.hotelSettings.id === 'singleton') {
    return data.hotelSettings;
  }
  // If not found, initialize and return
  if (mockHotelSettings) {
    const initialSettings = {...mockHotelSettings, id: 'singleton', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    data.hotelSettings = initialSettings;
    await writeData(data);
    return initialSettings;
  }
  return null;
}

export async function updateHotelSettings(updatedSettingsData: Omit<HotelSettings, 'id' | 'createdAt' | 'updatedAt'>): Promise<HotelSettings | null> {
  const data = await readData();
  const updatedSettings: HotelSettings = {
    ...updatedSettingsData,
    id: 'singleton', // Ensure ID remains singleton
    createdAt: data.hotelSettings?.createdAt || new Date().toISOString(), // Preserve original createdAt
    updatedAt: new Date().toISOString(),
  };
  data.hotelSettings = updatedSettings;
  await writeData(data);
  return updatedSettings;
}

// Initialize data file if it doesn't exist on server start (for development)
// This is a bit of a workaround. In a real app, you'd have a more robust migration/init strategy.
if (process.env.NODE_ENV === 'development') {
    fs.access(DATA_FILE_PATH, fs.constants.F_OK)
    .catch(async () => {
        console.log('Development: data.json not found on startup. Initializing...');
        await writeData(getInitialDataStructure());
        console.log('Development: data.json initialized.');
    });
}
