'use server';

import { revalidatePath } from 'next/cache';
import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import type { HousekeepingTask, HousekeepingTaskStatus, HousekeepingTaskType, RoomType } from '@/lib/types';

// Path to the JSON data file
const DATA_FILE_PATH = path.join(process.cwd(), 'src', 'lib', 'data.json');

// Helper to generate a new unique ID
const generateNewId = (prefix = ''): string => {
  return `${prefix}${Date.now().toString()}${Math.random().toString(36).substring(2, 7)}`;
};

// Define room types array
const roomTypesArray = ['STANDARD_TWIN', 'DELUXE_QUEEN', 'LUXURY_KING_SUITE', 'FAMILY_SUITE', 'EXECUTIVE_SUITE', 'PRESIDENTIAL_SUITE'] as const;

// Define task types and status
const taskTypesArray = ['Full Clean', 'Towel Change', 'Turndown Service', 'Maintenance Check'] as const;
const taskStatusArray = ['Pending', 'In Progress', 'Completed', 'Blocked'] as const;

// Define schema for housekeeping task
const TaskSchema = z.object({
  roomId: z.string().min(1, "Room ID is required"),
  roomType: z.enum(roomTypesArray),
  task: z.enum(taskTypesArray),
  status: z.enum(taskStatusArray).default('Pending'),
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateTaskInput = z.infer<typeof TaskSchema>;

// Function to get all housekeeping tasks
export async function getHousekeepingTasks(): Promise<HousekeepingTask[]> {
  try {
    // Read data from file
    const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const jsonData = JSON.parse(fileContent);
    
    // Return tasks
    return jsonData.housekeepingTasks || [];
  } catch (error) {
    console.error("Error fetching housekeeping tasks:", error);
    return [];
  }
}

// Function to create a new housekeeping task
export async function createHousekeepingTask(data: CreateTaskInput) {
  const validatedData = TaskSchema.safeParse(data);

  if (!validatedData.success) {
    console.error("Task validation errors:", validatedData.error.flatten().fieldErrors);
    return {
      success: false,
      errors: validatedData.error.flatten().fieldErrors,
      message: "Invalid task data. Please check all fields."
    };
  }

  try {
    // Read data from file
    const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const jsonData = JSON.parse(fileContent);
    
    // Create new task
    const newTask: HousekeepingTask = {
      ...validatedData.data,
      id: generateNewId('task_'),
      requestedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add to housekeeping tasks array
    jsonData.housekeepingTasks = [...(jsonData.housekeepingTasks || []), newTask];
    
    // Write updated data back to file
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(jsonData, null, 2), 'utf-8');
    
    // Revalidate paths
    revalidatePath('/admin/housekeeping');
    
    return {
      success: true,
      task: newTask,
      message: "Task created successfully!"
    };
  } catch (error) {
    console.error("Error creating housekeeping task:", error);
    return {
      success: false,
      message: "Failed to create task. Please try again later."
    };
  }
}

// Function to update task status
export async function updateTaskStatus(taskId: string, newStatus: HousekeepingTaskStatus) {
  try {
    // Read data from file
    const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const jsonData = JSON.parse(fileContent);
    
    // Find the task
    const taskIndex = jsonData.housekeepingTasks.findIndex(
      (task: HousekeepingTask) => task.id === taskId
    );
    
    if (taskIndex === -1) {
      return {
        success: false,
        message: `Task with ID ${taskId} not found`
      };
    }
    
    // Update the task status
    jsonData.housekeepingTasks[taskIndex].status = newStatus;
    jsonData.housekeepingTasks[taskIndex].updatedAt = new Date().toISOString();
    
    // If task is completed, set lastCleaned date
    if (newStatus === 'Completed') {
      jsonData.housekeepingTasks[taskIndex].lastCleaned = new Date().toISOString();
    }
    
    // Write updated data back to file
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(jsonData, null, 2), 'utf-8');
    
    // Revalidate paths
    revalidatePath('/admin/housekeeping');
    
    return {
      success: true,
      task: jsonData.housekeepingTasks[taskIndex],
      message: `Task status updated to ${newStatus}`
    };
  } catch (error) {
    console.error("Error updating task status:", error);
    return {
      success: false,
      message: "Failed to update task status"
    };
  }
}

// Function to delete a task
export async function deleteTask(taskId: string) {
  try {
    // Read data from file
    const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const jsonData = JSON.parse(fileContent);
    
    // Find the task
    const taskIndex = jsonData.housekeepingTasks.findIndex(
      (task: HousekeepingTask) => task.id === taskId
    );
    
    if (taskIndex === -1) {
      return {
        success: false,
        message: `Task with ID ${taskId} not found`
      };
    }
    
    // Remove the task
    jsonData.housekeepingTasks.splice(taskIndex, 1);
    
    // Write updated data back to file
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(jsonData, null, 2), 'utf-8');
    
    // Revalidate paths
    revalidatePath('/admin/housekeeping');
    
    return {
      success: true,
      message: "Task deleted successfully"
    };
  } catch (error) {
    console.error("Error deleting task:", error);
    return {
      success: false,
      message: "Failed to delete task"
    };
  }
} 