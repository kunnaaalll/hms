'use server';

import { revalidatePath } from 'next/cache';
import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import type { MenuItem, FoodCategory, FoodType } from '@/lib/types';

// Path to the JSON data file
const DATA_FILE_PATH = path.join(process.cwd(), 'src', 'lib', 'data.json');

// Helper to generate a new unique ID
const generateNewId = (prefix = ''): string => {
  return `${prefix}${Date.now().toString()}${Math.random().toString(36).substring(2, 7)}`;
};

// Define schema for menu item
const MenuItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().min(0, "Price must be a positive number"),
  category: z.enum(['Snacks', 'Main Course', 'Dessert']),
  foodType: z.enum(['Vegetarian', 'Non-Vegetarian']),
  imageUrl: z.string().optional(),
  popular: z.boolean().default(false),
});

export type CreateMenuItemInput = z.infer<typeof MenuItemSchema>;

// Function to create a new menu item
export async function createMenuItem(data: CreateMenuItemInput) {
  const validatedData = MenuItemSchema.safeParse(data);

  if (!validatedData.success) {
    console.error("Menu item validation errors:", validatedData.error.flatten().fieldErrors);
    return {
      success: false,
      errors: validatedData.error.flatten().fieldErrors,
      message: "Invalid menu item data. Please check all fields."
    };
  }

  try {
    // Read data from file
    const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const jsonData = JSON.parse(fileContent);
    
    // Create new menu item
    const newMenuItem: MenuItem = {
      ...validatedData.data,
      id: generateNewId('menu_'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add to menu items array
    jsonData.menuItems = [...(jsonData.menuItems || []), newMenuItem];
    
    // Write updated data back to file
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(jsonData, null, 2), 'utf-8');
    
    // Revalidate paths
    revalidatePath('/admin/restaurant');
    
    return {
      success: true,
      menuItem: newMenuItem,
      message: "Menu item created successfully!"
    };
  } catch (error) {
    console.error("Error creating menu item:", error);
    return {
      success: false,
      message: "Failed to create menu item. Please try again later."
    };
  }
}

// Function to get all menu items
export async function getMenuItems(): Promise<MenuItem[]> {
  try {
    // Read data from file
    const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const jsonData = JSON.parse(fileContent);
    
    // Return menu items
    return jsonData.menuItems || [];
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return [];
  }
}

// Function to get menu items by category
export async function getMenuItemsByCategory(category: FoodCategory): Promise<MenuItem[]> {
  try {
    // Read data from file
    const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const jsonData = JSON.parse(fileContent);
    
    // Filter menu items by category
    return (jsonData.menuItems || []).filter((item: MenuItem) => item.category === category);
  } catch (error) {
    console.error(`Error fetching menu items for category ${category}:`, error);
    return [];
  }
}

// Function to get menu items by food type
export async function getMenuItemsByFoodType(foodType: FoodType): Promise<MenuItem[]> {
  try {
    // Read data from file
    const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const jsonData = JSON.parse(fileContent);
    
    // Filter menu items by food type
    return (jsonData.menuItems || []).filter((item: MenuItem) => item.foodType === foodType);
  } catch (error) {
    console.error(`Error fetching menu items for food type ${foodType}:`, error);
    return [];
  }
}

// Function to update a menu item
export async function updateMenuItem(id: string, data: Partial<CreateMenuItemInput>) {
  try {
    // Read data from file
    const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const jsonData = JSON.parse(fileContent);
    
    // Find the menu item
    const menuItemIndex = jsonData.menuItems.findIndex(
      (item: MenuItem) => item.id === id
    );
    
    if (menuItemIndex === -1) {
      return {
        success: false,
        message: `Menu item with ID ${id} not found`
      };
    }
    
    // Update the menu item
    jsonData.menuItems[menuItemIndex] = {
      ...jsonData.menuItems[menuItemIndex],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    // Write updated data back to file
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(jsonData, null, 2), 'utf-8');
    
    // Revalidate paths
    revalidatePath('/admin/restaurant');
    
    return {
      success: true,
      menuItem: jsonData.menuItems[menuItemIndex],
      message: "Menu item updated successfully"
    };
  } catch (error) {
    console.error("Error updating menu item:", error);
    return {
      success: false,
      message: "Failed to update menu item"
    };
  }
}

// Function to delete a menu item
export async function deleteMenuItem(id: string) {
  try {
    // Read data from file
    const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const jsonData = JSON.parse(fileContent);
    
    // Find the menu item
    const menuItemIndex = jsonData.menuItems.findIndex(
      (item: MenuItem) => item.id === id
    );
    
    if (menuItemIndex === -1) {
      return {
        success: false,
        message: `Menu item with ID ${id} not found`
      };
    }
    
    // Remove the menu item
    jsonData.menuItems.splice(menuItemIndex, 1);
    
    // Write updated data back to file
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(jsonData, null, 2), 'utf-8');
    
    // Revalidate paths
    revalidatePath('/admin/restaurant');
    
    return {
      success: true,
      message: "Menu item deleted successfully"
    };
  } catch (error) {
    console.error("Error deleting menu item:", error);
    return {
      success: false,
      message: "Failed to delete menu item"
    };
  }
} 