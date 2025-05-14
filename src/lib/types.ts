// Define string union types for enums previously imported from Prisma
export type RoomType = 
  | 'STANDARD_TWIN' 
  | 'DELUXE_QUEEN' 
  | 'LUXURY_KING_SUITE' 
  | 'FAMILY_SUITE' 
  | 'EXECUTIVE_SUITE' 
  | 'PRESIDENTIAL_SUITE';

export type RoomStatus = 
  | 'AVAILABLE' 
  | 'OCCUPIED' 
  | 'MAINTENANCE' 
  | 'CLEANING';

export type BookingStatus = 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'REJECTED' 
  | 'CANCELLED'
  | 'COMPLETED';

export type RestaurantOrderStatus = 'Pending' | 'Preparing' | 'Served' | 'Paid';
export type HousekeepingTaskType = 'Full Clean' | 'Towel Change' | 'Turndown Service' | 'Maintenance Check';
export type HousekeepingTaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Blocked';
export type GuestServiceType = 'Laundry' | 'Cab Booking' | 'Spa Appointment' | 'Concierge' | 'Wake-up Call';
export type GuestServiceStatus = 'Requested' | 'In Progress' | 'Completed' | 'Cancelled';
export type FoodCategory = 'Snacks' | 'Main Course' | 'Dessert';
export type FoodType = 'Vegetarian' | 'Non-Vegetarian';


export interface Room {
  id: string;
  name: string;
  type: RoomType;
  pricePerNight: number;
  capacity: number;
  amenities: string[];
  imageUrl: string;
  availabilityScore: number; // 0-100, lower is worse
  description: string;
  status?: RoomStatus;
  'data-ai-hint'?: string;
  createdAt?: string; // ISO Date string
  updatedAt?: string; // ISO Date string
}

export interface BookingRequest {
  id: string;
  guestName: string;
  guestEmail: string;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  numberOfGuests: number;
  roomType: RoomType;
  roomId: string;
  totalPrice: number;
  status: BookingStatus;
  createdAt?: string; // ISO Date string
  updatedAt?: string; // ISO Date string
}

// For AI suggestions (matches the flow input, but good to have for clarity)
export interface AISuggestionInputParams {
  selectedStartDate: string;
  selectedEndDate: string;
  numberOfGuests: number;
  currentPrice: number;
  availabilityScore: number;
}

export interface RestaurantOrder {
  id: string;
  tableNumber: string; // Could be table number or room number for room service
  items: { name: string; quantity: number; price: number }[];
  totalPrice: number;
  status: RestaurantOrderStatus;
  orderTime: string; // ISO Date string
  createdAt?: string; // ISO Date string
  updatedAt?: string; // ISO Date string
}

export interface HousekeepingTask {
  id: string;
  roomId: string;
  roomType: RoomType;
  task: HousekeepingTaskType;
  status: HousekeepingTaskStatus;
  assignedTo?: string;
  notes?: string;
  lastCleaned?: string; // ISO Date string
  requestedAt: string; // ISO Date string
  createdAt?: string; // ISO Date string
  updatedAt?: string; // ISO Date string
}

export interface GuestServiceRequest {
  id: string;
  guestName: string;
  roomId: string;
  serviceType: GuestServiceType;
  details: string;
  status: GuestServiceStatus;
  requestedAt: string; // ISO Date string
  completedAt?: string; // ISO Date string
  createdAt?: string; // ISO Date string
  updatedAt?: string; // ISO Date string
}

export interface HotelSettings {
  id?: string; // Typically 'singleton'
  hotelName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  enableOnlineBookings: boolean;
  currencySymbol: string;
  createdAt?: string; // ISO Date string
  updatedAt?: string; // ISO Date string
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: FoodCategory;
  foodType: FoodType;
  imageUrl?: string;
  popular?: boolean;
  createdAt?: string; // ISO Date string
  updatedAt?: string; // ISO Date string
}

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  foodType: FoodType;
}

// Form data types
export interface BookingFormDetails {
  guestName: string;
  guestEmail: string;
}

export interface AddRoomFormValues {
  name: string;
  type: RoomType;
  pricePerNight: number;
  capacity: number;
  amenities: string; // Comma-separated, to be parsed
  imageUrl: string;
  dataAiHint?: string;
  availabilityScore: number;
  description: string;
  status: RoomStatus;
}

// Structure for our data.json file
export interface AppData {
  rooms: Room[];
  bookingRequests: BookingRequest[];
  restaurantOrders: RestaurantOrder[];
  housekeepingTasks: HousekeepingTask[];
  guestServiceRequests: GuestServiceRequest[];
  menuItems: MenuItem[];
  hotelSettings: HotelSettings | null; // Allow null if not set
}
