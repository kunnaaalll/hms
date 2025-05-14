import { NextResponse } from 'next/server';
import { getAllBookingRequests } from '@/lib/jsonDataStore';

export async function GET() {
  try {
    const bookings = await getAllBookingRequests();
    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
} 