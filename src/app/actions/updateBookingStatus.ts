'use server';

import { revalidatePath } from 'next/cache';
import fs from 'fs/promises';
import path from 'path';
import type { BookingRequest, BookingStatus } from '@/lib/types';

// Path to the JSON data file
const DATA_FILE_PATH = path.join(process.cwd(), 'src', 'lib', 'data.json');

export async function updateBookingStatus(bookingId: string, newStatus: BookingStatus) {
  try {
    // Read data from file
    const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const data = JSON.parse(fileContent);
    
    // Find and update the booking
    const bookingIndex = data.bookingRequests.findIndex((booking: BookingRequest) => booking.id === bookingId);
    
    if (bookingIndex === -1) {
      return {
        success: false,
        message: `Booking with ID ${bookingId} not found`,
      };
    }
    
    // Update the booking status
    data.bookingRequests[bookingIndex].status = newStatus;
    data.bookingRequests[bookingIndex].updatedAt = new Date().toISOString();
    
    // Write updated data back to file
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    
    // Revalidate the bookings page
    revalidatePath('/admin/bookings');
    
    return {
      success: true,
      booking: data.bookingRequests[bookingIndex],
      message: `Booking status updated to ${newStatus}`,
    };
  } catch (error) {
    console.error('Error updating booking status:', error);
    return {
      success: false,
      message: 'Failed to update booking status',
    };
  }
} 