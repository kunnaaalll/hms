
import type { Room, BookingRequest, RestaurantOrder, HousekeepingTask, GuestServiceRequest, HotelSettings } from '@/lib/types';
// Removed direct Prisma enum imports as they cause issues on client-side for mock data values.
// String literals corresponding to enum values will be used instead.
// Type safety is still enforced by src/lib/types.ts which correctly uses Prisma enum types.

export const mockRooms: Room[] = [
  {
    id: '1',
    name: 'Deluxe Queen Serenity',
    type: 'DELUXE_QUEEN', // Was RoomType.DELUXE_QUEEN
    pricePerNight: 18000,
    capacity: 2,
    amenities: ['WiFi', 'Air Conditioning', 'HD TV', 'Rain Shower'],
    imageUrl: 'https://placehold.co/600x400.png',
    'data-ai-hint': "modern bedroom",
    availabilityScore: 75,
    description: 'A beautifully appointed room with a queen-size bed, perfect for couples or solo travelers seeking comfort and style.',
    status: 'AVAILABLE', // Was RoomStatus.AVAILABLE
  },
  {
    id: '2',
    name: 'Luxury King Panorama Suite',
    type: 'LUXURY_KING_SUITE', // Was RoomType.LUXURY_KING_SUITE
    pricePerNight: 32000,
    capacity: 3,
    amenities: ['WiFi', 'Air Conditioning', 'HD TV', 'Mini Bar', 'Jacuzzi Tub', 'City View'],
    imageUrl: 'https://placehold.co/600x400.png',
    'data-ai-hint': "luxury suite",
    availabilityScore: 45, 
    description: 'Experience ultimate luxury in our King Suite, featuring a spacious layout, premium amenities, and breathtaking panoramic views.',
    status: 'OCCUPIED', // Was RoomStatus.OCCUPIED
  },
  {
    id: '3',
    name: 'Standard Twin Comfort',
    type: 'STANDARD_TWIN', // Was RoomType.STANDARD_TWIN
    pricePerNight: 15000,
    capacity: 2,
    amenities: ['WiFi', 'Air Conditioning', 'Work Desk'],
    imageUrl: 'https://placehold.co/600x400.png',
    'data-ai-hint': "twin beds",
    availabilityScore: 90,
    description: 'Ideal for friends or colleagues, this room offers two comfortable twin beds and all essential amenities for a pleasant stay.',
    status: 'MAINTENANCE', // Was RoomStatus.MAINTENANCE
  },
  {
    id: '4',
    name: 'Family Garden Retreat',
    type: 'FAMILY_SUITE', // Was RoomType.FAMILY_SUITE
    pricePerNight: 28000,
    capacity: 4,
    amenities: ['WiFi', 'Air Conditioning', 'HD TV', 'Kitchenette', 'Balcony'],
    imageUrl: 'https://placehold.co/600x400.png',
    'data-ai-hint': "family room",
    availabilityScore: 60,
    description: 'Spacious and welcoming, our Family Suite provides ample space and comfort for families, with an added kitchenette and private balcony.',
    status: 'AVAILABLE', // Was RoomStatus.AVAILABLE
  },
];

export const mockBookingRequests: BookingRequest[] = [
  {
    id: 'B001',
    guestName: 'Alice Wonderland',
    guestEmail: 'alice@example.com',
    checkInDate: '2024-09-10',
    checkOutDate: '2024-09-12',
    numberOfGuests: 2,
    roomType: 'DELUXE_QUEEN', // Was RoomType.DELUXE_QUEEN
    roomId: '1',
    totalPrice: 36000,
    status: 'PENDING', // This was already a string literal, which is good
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), 
  },
  {
    id: 'B002',
    guestName: 'Bob The Builder',
    guestEmail: 'bob@example.com',
    checkInDate: '2024-09-15',
    checkOutDate: '2024-09-18',
    numberOfGuests: 1,
    roomType: 'LUXURY_KING_SUITE', // Was RoomType.LUXURY_KING_SUITE
    roomId: '2',
    totalPrice: 96000,
    status: 'PENDING',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), 
  },
  {
    id: 'B003',
    guestName: 'Charlie Chaplin',
    guestEmail: 'charlie@example.com',
    checkInDate: '2024-08-20',
    checkOutDate: '2024-08-22',
    numberOfGuests: 2,
    roomType: 'STANDARD_TWIN', // Was RoomType.STANDARD_TWIN
    roomId: '3',
    totalPrice: 30000,
    status: 'CONFIRMED',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
    {
    id: 'B004',
    guestName: 'Diana Prince',
    guestEmail: 'diana@example.com',
    checkInDate: '2024-10-01',
    checkOutDate: '2024-10-05',
    numberOfGuests: 4,
    roomType: 'FAMILY_SUITE', // Was RoomType.FAMILY_SUITE
    roomId: '4',
    totalPrice: 112000,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  },
];


export const mockRestaurantOrders: RestaurantOrder[] = [
  {
    id: 'ORD001',
    tableNumber: 'Table 5',
    items: [
      { name: 'Paneer Tikka', quantity: 1, price: 350 },
      { name: 'Garlic Naan', quantity: 2, price: 75 },
    ],
    totalPrice: 500,
    status: 'Preparing',
    orderTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(), 
  },
  {
    id: 'ORD002',
    tableNumber: 'Table 2',
    items: [
      { name: 'Chicken Biryani', quantity: 2, price: 450 },
      { name: 'Coke', quantity: 2, price: 60 },
    ],
    totalPrice: 1020,
    status: 'Served',
    orderTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), 
  },
   {
    id: 'ORD003',
    tableNumber: 'Room 101',
    items: [
      { name: 'Club Sandwich', quantity: 1, price: 300 },
      { name: 'Fresh Lime Soda', quantity: 1, price: 120 },
    ],
    totalPrice: 420,
    status: 'Pending',
    orderTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
];

export const mockHousekeepingTasks: HousekeepingTask[] = [
  {
    id: 'HK001',
    roomId: '101', 
    roomType: 'DELUXE_QUEEN', // Was RoomType.DELUXE_QUEEN
    task: 'Full Clean',
    status: 'Pending',
    assignedTo: 'Anita',
    requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    lastCleaned: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'HK002',
    roomId: '205',
    roomType: 'LUXURY_KING_SUITE', // Was RoomType.LUXURY_KING_SUITE
    task: 'Towel Change',
    status: 'In Progress',
    assignedTo: 'Ramesh',
    requestedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'HK003',
    roomId: '310',
    roomType: 'STANDARD_TWIN', // Was RoomType.STANDARD_TWIN
    task: 'Maintenance Check',
    notes: 'Shower drain clogged',
    status: 'Completed',
    assignedTo: 'Suresh',
    requestedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    lastCleaned: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockGuestServiceRequests: GuestServiceRequest[] = [
  {
    id: 'GSR001',
    guestName: 'Mr. Smith',
    roomId: '102', 
    serviceType: 'Laundry',
    details: '2 shirts, 1 trouser. Express service.',
    status: 'Requested',
    requestedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'GSR002',
    guestName: 'Ms. Jones',
    roomId: '401', 
    serviceType: 'Cab Booking',
    details: 'Airport drop-off tomorrow at 8 AM for 4 people.',
    status: 'In Progress',
    requestedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'GSR003',
    guestName: 'Dr. Banner',
    roomId: '2', 
    serviceType: 'Concierge',
    details: 'Reservations for 2 at "The Gourmet Place" tonight at 8 PM.',
    status: 'Completed',
    requestedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockHotelSettings: HotelSettings = {
  hotelName: "Lavender Luxury Hotel",
  contactEmail: "contact@lavenderluxury.com",
  contactPhone: "+91 98765 43210",
  address: "123 Lavender Lane, Paradise City, India",
  enableOnlineBookings: true,
  currencySymbol: "₹",
};
