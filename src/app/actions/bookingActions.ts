
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createBookingInStore } from '@/lib/jsonDataStore';
import type { RoomType, BookingStatus } from '@/lib/types'; // Using our string union types

// Define string arrays for enum validation
const roomTypesList: [RoomType, ...RoomType[]] = ['STANDARD_TWIN', 'DELUXE_QUEEN', 'LUXURY_KING_SUITE', 'FAMILY_SUITE', 'EXECUTIVE_SUITE', 'PRESIDENTIAL_SUITE'];
// const bookingStatusesList: [BookingStatus, ...BookingStatus[]] = ['PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'COMPLETED'];


const BookingFormSchema = z.object({
  guestName: z.string().min(2, { message: "Guest name must be at least 2 characters." }),
  guestEmail: z.string().email({ message: "Invalid email address." }),
  checkInDate: z.string().transform((str) => str), // Keep as string, will be stored as string
  checkOutDate: z.string().transform((str) => str), // Keep as string
  numberOfGuests: z.number().min(1),
  roomId: z.string(),
  roomType: z.enum(roomTypesList),
  totalPrice: z.number(),
});

export type CreateBookingInput = z.infer<typeof BookingFormSchema>;

export async function createBooking(data: CreateBookingInput) {
  const validatedData = BookingFormSchema.safeParse(data);

  if (!validatedData.success) {
    console.error("Validation errors:", validatedData.error.flatten().fieldErrors);
    return {
      success: false,
      errors: validatedData.error.flatten().fieldErrors,
      message: "Invalid data provided. Please check the fields and try again.",
    };
  }

  try {
    // Prepare data for the store (without id, createdAt, updatedAt)
    const bookingDataForStore = {
      ...validatedData.data,
      status: 'PENDING' as BookingStatus, // Default status
    };

    const newBooking = await createBookingInStore(bookingDataForStore);
    revalidatePath('/'); 
    revalidatePath('/admin/bookings'); 
    return {
      success: true,
      booking: newBooking,
      message: "Booking request submitted successfully!",
    };
  } catch (error) {
    console.error("Error creating booking:", error);
    return {
      success: false,
      message: "Failed to create booking. Please try again later or contact support.",
    };
  }
}
