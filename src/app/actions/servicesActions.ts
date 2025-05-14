'use server';

import { revalidatePath } from 'next/cache';
import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import type { GuestServiceRequest, GuestServiceStatus, GuestServiceType } from '@/lib/types';

// Path to the JSON data file
const DATA_FILE_PATH = path.join(process.cwd(), 'src', 'lib', 'data.json');

// Helper to generate a new unique ID
const generateNewId = (prefix = ''): string => {
  return `${prefix}${Date.now().toString()}${Math.random().toString(36).substring(2, 7)}`;
};

// Define service types and status arrays
const serviceTypesArray = ['Laundry', 'Cab Booking', 'Spa Appointment', 'Concierge', 'Wake-up Call'] as const;
const serviceStatusArray = ['Requested', 'In Progress', 'Completed', 'Cancelled'] as const;

// Define schema for guest service request
const ServiceRequestSchema = z.object({
  guestName: z.string().min(2, "Guest name must be at least 2 characters"),
  roomId: z.string().min(1, "Room ID is required"),
  serviceType: z.enum(serviceTypesArray),
  details: z.string().min(5, "Service details are required"),
  status: z.enum(serviceStatusArray).default('Requested'),
});

export type CreateServiceRequestInput = z.infer<typeof ServiceRequestSchema>;

// Function to get all guest service requests
export async function getGuestServiceRequests(): Promise<GuestServiceRequest[]> {
  try {
    // Read data from file
    const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const jsonData = JSON.parse(fileContent);
    
    // Return service requests
    return jsonData.guestServiceRequests || [];
  } catch (error) {
    console.error("Error fetching guest service requests:", error);
    return [];
  }
}

// Function to create a new guest service request
export async function createGuestServiceRequest(data: CreateServiceRequestInput) {
  const validatedData = ServiceRequestSchema.safeParse(data);

  if (!validatedData.success) {
    console.error("Service request validation errors:", validatedData.error.flatten().fieldErrors);
    return {
      success: false,
      errors: validatedData.error.flatten().fieldErrors,
      message: "Invalid service request data. Please check all fields."
    };
  }

  try {
    // Read data from file
    const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const jsonData = JSON.parse(fileContent);
    
    // Create new service request
    const newServiceRequest: GuestServiceRequest = {
      ...validatedData.data,
      id: generateNewId('svc_'),
      requestedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add to guest service requests array
    jsonData.guestServiceRequests = [...(jsonData.guestServiceRequests || []), newServiceRequest];
    
    // Write updated data back to file
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(jsonData, null, 2), 'utf-8');
    
    // Revalidate paths
    revalidatePath('/admin/services');
    
    return {
      success: true,
      serviceRequest: newServiceRequest,
      message: "Service request created successfully!"
    };
  } catch (error) {
    console.error("Error creating guest service request:", error);
    return {
      success: false,
      message: "Failed to create service request. Please try again later."
    };
  }
}

// Function to update service request status
export async function updateServiceStatus(requestId: string, newStatus: GuestServiceStatus) {
  try {
    // Read data from file
    const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const jsonData = JSON.parse(fileContent);
    
    // Find the service request
    const requestIndex = jsonData.guestServiceRequests.findIndex(
      (request: GuestServiceRequest) => request.id === requestId
    );
    
    if (requestIndex === -1) {
      return {
        success: false,
        message: `Service request with ID ${requestId} not found`
      };
    }
    
    // Update the service request status
    jsonData.guestServiceRequests[requestIndex].status = newStatus;
    jsonData.guestServiceRequests[requestIndex].updatedAt = new Date().toISOString();
    
    // If status is completed, set completedAt
    if (newStatus === 'Completed') {
      jsonData.guestServiceRequests[requestIndex].completedAt = new Date().toISOString();
    }
    
    // Write updated data back to file
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(jsonData, null, 2), 'utf-8');
    
    // Revalidate paths
    revalidatePath('/admin/services');
    
    return {
      success: true,
      serviceRequest: jsonData.guestServiceRequests[requestIndex],
      message: `Service request status updated to ${newStatus}`
    };
  } catch (error) {
    console.error("Error updating service request status:", error);
    return {
      success: false,
      message: "Failed to update service request status"
    };
  }
}

// Function to delete a service request
export async function deleteServiceRequest(requestId: string) {
  try {
    // Read data from file
    const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const jsonData = JSON.parse(fileContent);
    
    // Find the service request
    const requestIndex = jsonData.guestServiceRequests.findIndex(
      (request: GuestServiceRequest) => request.id === requestId
    );
    
    if (requestIndex === -1) {
      return {
        success: false,
        message: `Service request with ID ${requestId} not found`
      };
    }
    
    // Remove the service request
    jsonData.guestServiceRequests.splice(requestIndex, 1);
    
    // Write updated data back to file
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(jsonData, null, 2), 'utf-8');
    
    // Revalidate paths
    revalidatePath('/admin/services');
    
    return {
      success: true,
      message: "Service request deleted successfully"
    };
  } catch (error) {
    console.error("Error deleting service request:", error);
    return {
      success: false,
      message: "Failed to delete service request"
    };
  }
} 