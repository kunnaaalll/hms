'use server';

import { revalidatePath } from 'next/cache';
import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import type { RestaurantOrder, RestaurantOrderStatus } from '@/lib/types';

// Path to the JSON data file
const DATA_FILE_PATH = path.join(process.cwd(), 'src', 'lib', 'data.json');

// Helper to generate a new unique ID
const generateNewId = (prefix = ''): string => {
  return `${prefix}${Date.now().toString()}${Math.random().toString(36).substring(2, 7)}`;
};

// Define schema for order item
const OrderItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  price: z.number().min(0, "Price must be a positive number")
});

// Define schema for restaurant order
const RestaurantOrderSchema = z.object({
  tableNumber: z.string().min(1, "Table/Room number is required"),
  items: z.array(OrderItemSchema).min(1, "At least one item is required"),
  totalPrice: z.number().min(0, "Total price must be a positive number"),
  status: z.enum(['Pending', 'Preparing', 'Served', 'Paid']).default('Pending')
});

export type CreateRestaurantOrderInput = z.infer<typeof RestaurantOrderSchema>;

// Function to create a new restaurant order
export async function createRestaurantOrder(data: CreateRestaurantOrderInput) {
  const validatedData = RestaurantOrderSchema.safeParse(data);

  if (!validatedData.success) {
    console.error("Order validation errors:", validatedData.error.flatten().fieldErrors);
    return {
      success: false,
      errors: validatedData.error.flatten().fieldErrors,
      message: "Invalid order data. Please check all fields."
    };
  }

  try {
    // Read data from file
    const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const jsonData = JSON.parse(fileContent);
    
    // Create new order
    const newOrder: RestaurantOrder = {
      ...validatedData.data,
      id: generateNewId('order_'),
      orderTime: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add to restaurant orders array
    jsonData.restaurantOrders = [...(jsonData.restaurantOrders || []), newOrder];
    
    // Write updated data back to file
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(jsonData, null, 2), 'utf-8');
    
    // Revalidate paths
    revalidatePath('/admin/restaurant');
    
    return {
      success: true,
      order: newOrder,
      message: "Order created successfully!"
    };
  } catch (error) {
    console.error("Error creating order:", error);
    return {
      success: false,
      message: "Failed to create order. Please try again later."
    };
  }
}

// Function to get all restaurant orders
export async function getRestaurantOrders(): Promise<RestaurantOrder[]> {
  try {
    // Read data from file
    const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const jsonData = JSON.parse(fileContent);
    
    // Return restaurant orders
    return jsonData.restaurantOrders || [];
  } catch (error) {
    console.error("Error fetching restaurant orders:", error);
    return [];
  }
}

// Function to update restaurant order status
export async function updateOrderStatus(orderId: string, newStatus: RestaurantOrderStatus) {
  try {
    // Read data from file
    const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const jsonData = JSON.parse(fileContent);
    
    // Find the order
    const orderIndex = jsonData.restaurantOrders.findIndex(
      (order: RestaurantOrder) => order.id === orderId
    );
    
    if (orderIndex === -1) {
      return {
        success: false,
        message: `Order with ID ${orderId} not found`
      };
    }
    
    // Update the order status
    jsonData.restaurantOrders[orderIndex].status = newStatus;
    jsonData.restaurantOrders[orderIndex].updatedAt = new Date().toISOString();
    
    // Write updated data back to file
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(jsonData, null, 2), 'utf-8');
    
    // Revalidate paths
    revalidatePath('/admin/restaurant');
    
    return {
      success: true,
      order: jsonData.restaurantOrders[orderIndex],
      message: `Order status updated to ${newStatus}`
    };
  } catch (error) {
    console.error("Error updating order status:", error);
    return {
      success: false,
      message: "Failed to update order status"
    };
  }
}

// Function to delete a restaurant order
export async function deleteOrder(orderId: string) {
  try {
    // Read data from file
    const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const jsonData = JSON.parse(fileContent);
    
    // Find the order
    const orderIndex = jsonData.restaurantOrders.findIndex(
      (order: RestaurantOrder) => order.id === orderId
    );
    
    if (orderIndex === -1) {
      return {
        success: false,
        message: `Order with ID ${orderId} not found`
      };
    }
    
    // Remove the order
    jsonData.restaurantOrders.splice(orderIndex, 1);
    
    // Write updated data back to file
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(jsonData, null, 2), 'utf-8');
    
    // Revalidate paths
    revalidatePath('/admin/restaurant');
    
    return {
      success: true,
      message: "Order deleted successfully"
    };
  } catch (error) {
    console.error("Error deleting order:", error);
    return {
      success: false,
      message: "Failed to delete order"
    };
  }
} 