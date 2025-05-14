"use client";

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { createMenuItem, type CreateMenuItemInput, updateMenuItem } from '@/app/actions/menuActions';
import type { MenuItem } from '@/lib/types';
import { Loader2, Upload } from 'lucide-react';
import { useState, useEffect } from 'react';

interface AddMenuItemModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onMenuItemAdded: (newMenuItem: MenuItem) => void;
  menuItem?: MenuItem; // For edit mode
  onMenuItemEdited?: (updatedMenuItem: MenuItem) => void;
}

// Define schema for menu item form
const MenuItemFormSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  category: z.enum(['Snacks', 'Main Course', 'Dessert']),
  foodType: z.enum(['Vegetarian', 'Non-Vegetarian']),
  imageUrl: z.string().optional(),
  popular: z.boolean().default(false),
});

type MenuItemFormInput = z.infer<typeof MenuItemFormSchema>;

export function AddMenuItemModal({ isOpen, onOpenChange, onMenuItemAdded, menuItem, onMenuItemEdited }: AddMenuItemModalProps) {
  const { toast } = useToast();
  const [isImageUploading, setIsImageUploading] = useState(false);
  const isEditMode = !!menuItem;
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue, watch } = useForm<MenuItemFormInput>({
    resolver: zodResolver(MenuItemFormSchema),
    defaultValues: isEditMode ? {
      name: menuItem?.name || '',
      description: menuItem?.description || '',
      price: menuItem?.price || 0,
      category: menuItem?.category || 'Main Course',
      foodType: menuItem?.foodType || 'Vegetarian',
      imageUrl: menuItem?.imageUrl || '',
      popular: menuItem?.popular || false,
    } : {
      name: '',
      description: '',
      price: 0,
      category: 'Main Course',
      foodType: 'Vegetarian',
      imageUrl: '',
      popular: false,
    },
  });
  
  // If menuItem changes (edit mode), update form values
  useEffect(() => {
    if (isEditMode && menuItem) {
      setValue('name', menuItem.name);
      setValue('description', menuItem.description);
      setValue('price', menuItem.price);
      setValue('category', menuItem.category);
      setValue('foodType', menuItem.foodType);
      setValue('imageUrl', menuItem.imageUrl || '');
      setValue('popular', menuItem.popular || false);
    } else {
      reset();
    }
  }, [isEditMode, menuItem, setValue, reset]);
  
  // For image preview
  const watchedImageUrl = watch('imageUrl');
  
  // Simulate image upload functionality 
  // In a real app, you would handle actual file uploads to a storage service
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Start upload process
    setIsImageUploading(true);
    
    try {
      // Simulate delay for upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, using a fake URL - in a real app, you'd upload to a storage service
      // and get back the URL of the uploaded image
      const fakeImageUrl = URL.createObjectURL(file);
      setValue('imageUrl', fakeImageUrl);
      
      toast({
        title: "Image uploaded",
        description: "Image has been uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsImageUploading(false);
    }
  };
  
  const onSubmit: SubmitHandler<MenuItemFormInput> = async (data) => {
    if (isEditMode && menuItem) {
      // Edit mode: update menu item
      const result = await updateMenuItem(menuItem.id, data);
      if (result.success && result.menuItem) {
        toast({
          title: "Menu Item Updated!",
          description: `Menu item "${data.name}" has been updated.`,
        });
        onMenuItemEdited && onMenuItemEdited(result.menuItem);
        reset();
        onOpenChange(false);
      } else {
        toast({
          title: "Failed to Update Menu Item",
          description: result.message || "An error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      // Add mode: create menu item
      const result = await createMenuItem(data);
      if (result.success && result.menuItem) {
        toast({
          title: "Menu Item Created!",
          description: `New menu item "${data.name}" has been successfully created.`,
        });
        onMenuItemAdded(result.menuItem);
        reset();
        onOpenChange(false);
      } else {
        toast({
          title: "Failed to Create Menu Item",
          description: result.message || "An error occurred. Please check the details and try again.",
          variant: "destructive",
        });
      }
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) reset();
    }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Menu Item' : 'Add New Menu Item'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the details of the menu item.' : 'Create a new food item to be added to the restaurant menu.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Item Name</Label>
              <Input 
                id="name" 
                {...register("name")} 
                placeholder="e.g., Paneer Tikka" 
                className="mt-1" 
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="price">Price (₹)</Label>
              <Input 
                id="price" 
                {...register("price")} 
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g., 299.99" 
                className="mt-1" 
              />
              {errors.price && (
                <p className="text-sm text-destructive mt-1">{errors.price.message}</p>
              )}
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              {...register("description")} 
              placeholder="Describe the dish, ingredients, and taste" 
              className="mt-1" 
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select 
                onValueChange={(value) => setValue("category", value as any)} 
                defaultValue="Main Course"
              >
                <SelectTrigger id="category" className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Snacks">Snacks</SelectItem>
                  <SelectItem value="Main Course">Main Course</SelectItem>
                  <SelectItem value="Dessert">Dessert</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-destructive mt-1">{errors.category.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="foodType">Food Type</Label>
              <Select 
                onValueChange={(value) => setValue("foodType", value as any)} 
                defaultValue="Vegetarian"
              >
                <SelectTrigger id="foodType" className="mt-1">
                  <SelectValue placeholder="Select food type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="Non-Vegetarian">Non-Vegetarian</SelectItem>
                </SelectContent>
              </Select>
              {errors.foodType && (
                <p className="text-sm text-destructive mt-1">{errors.foodType.message}</p>
              )}
            </div>
          </div>
          
          <div>
            <Label htmlFor="imageUpload">Food Image</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center mt-1">
              <div>
                <div className="flex items-center gap-2">
                  <Input 
                    id="imageUpload" 
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isImageUploading}
                    className="mt-1" 
                  />
                  {isImageUploading && <Loader2 className="h-5 w-5 animate-spin" />}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload an image of the food item (JPG, PNG)
                </p>
              </div>
              
              <div>
                {watchedImageUrl ? (
                  <div className="mt-2 relative aspect-video rounded-md overflow-hidden border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={watchedImageUrl} 
                      alt="Image preview" 
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="mt-2 relative aspect-video rounded-md overflow-hidden border border-dashed flex items-center justify-center bg-muted">
                    <div className="text-center text-muted-foreground p-4">
                      <Upload className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No image uploaded</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mt-4">
            <Checkbox 
              id="popular" 
              checked={watch('popular')}
              onCheckedChange={(checked) => setValue('popular', checked === true)}
            />
            <Label htmlFor="popular" className="cursor-pointer">Mark as Popular Item</Label>
          </div>
          
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              type="submit" 
              disabled={isSubmitting || isImageUploading}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? 'Updating Menu Item...' : 'Creating Menu Item...'}
                </>
              ) : (
                "Create Menu Item"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 