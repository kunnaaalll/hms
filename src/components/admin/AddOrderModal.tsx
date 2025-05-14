"use client";

import { useState, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { createRestaurantOrder, type CreateRestaurantOrderInput } from '@/app/actions/restaurantActions';
import { getMenuItems } from '@/app/actions/menuActions';
import type { RestaurantOrder, MenuItem, CartItem } from '@/lib/types';
import { Loader2, PlusCircle, MinusCircle, ShoppingCart, Trash2, ChefHat, Coffee, Pizza, Utensils, Salad, CircleDot, Search, IndianRupee, Check, Plus, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface AddOrderModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onOrderAdded: (newOrder: RestaurantOrder) => void;
}

// Define schema for order
const AddOrderFormSchema = z.object({
  tableNumber: z.string().min(1, "Table/Room number is required"),
});

type AddOrderFormInput = z.infer<typeof AddOrderFormSchema>;

export function AddOrderModal({ isOpen, onOpenChange, onOrderAdded }: AddOrderModalProps) {
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isMenuLoading, setIsMenuLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<"all" | "Snacks" | "Main Course" | "Dessert">("all");
  const [activeFoodType, setActiveFoodType] = useState<"all" | "Vegetarian" | "Non-Vegetarian">("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<AddOrderFormInput>({
    resolver: zodResolver(AddOrderFormSchema),
    defaultValues: {
      tableNumber: '',
    },
  });
  
  // Load menu items when the modal opens
  useEffect(() => {
    if (isOpen) {
      loadMenuItems();
    }
  }, [isOpen]);
  
  const loadMenuItems = async () => {
    setIsMenuLoading(true);
    const fetchedMenuItems = await getMenuItems();
    setMenuItems(fetchedMenuItems);
    setIsMenuLoading(false);
  };
  
  // Add item to cart
  const addToCart = (menuItem: MenuItem) => {
    setCart(prevCart => {
      // Check if the item already exists in the cart
      const existingItemIndex = prevCart.findIndex(item => item.menuItemId === menuItem.id);
      
      if (existingItemIndex >= 0) {
        // Item exists, update quantity
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += 1;
        return updatedCart;
      } else {
        // Item doesn't exist, add new item
        return [...prevCart, {
          menuItemId: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1,
          foodType: menuItem.foodType
        }];
      }
    });
  };
  
  // Remove item from cart
  const removeFromCart = (menuItemId: string) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.menuItemId === menuItemId);
      
      if (existingItemIndex >= 0) {
        const updatedCart = [...prevCart];
        
        // If quantity is 1, remove the item
        if (updatedCart[existingItemIndex].quantity === 1) {
          return updatedCart.filter(item => item.menuItemId !== menuItemId);
        } 
        
        // Otherwise, decrease quantity
        updatedCart[existingItemIndex].quantity -= 1;
        return updatedCart;
      }
      
      return prevCart;
    });
  };
  
  // Clear cart
  const clearCart = () => {
    setCart([]);
  };
  
  // Calculate cart total
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Filter menu items based on selected category, type, and search query
  const filteredMenuItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesType = activeFoodType === "all" || item.foodType === activeFoodType;
    const matchesSearch = searchQuery === "" || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesType && matchesSearch;
  });
  
  // Group menu items by category for display
  const snacks = filteredMenuItems.filter(item => item.category === "Snacks");
  const mainCourse = filteredMenuItems.filter(item => item.category === "Main Course");
  const desserts = filteredMenuItems.filter(item => item.category === "Dessert");
  
  // Get food type icon
  const getFoodTypeIcon = (foodType: MenuItem['foodType']) => {
    return foodType === 'Vegetarian' 
      ? <div className="flex items-center text-green-600"><CircleDot className="h-4 w-4 mr-1" /> Veg</div>
      : <div className="flex items-center text-red-600"><CircleDot className="h-4 w-4 mr-1" /> Non-Veg</div>;
  };
  
  const onSubmit: SubmitHandler<AddOrderFormInput> = async (data) => {
    if (cart.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to the cart before creating an order.",
        variant: "destructive",
      });
      return;
    }
    
    // Prepare the order data
    const orderItems = cart.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price
    }));
    
    // Create the order
    const orderData: CreateRestaurantOrderInput = {
      tableNumber: data.tableNumber,
      items: orderItems,
      totalPrice: cartTotal,
      status: 'Pending'
    };
    
    const result = await createRestaurantOrder(orderData);
    
    if (result.success && result.order) {
      toast({
        title: "Order Created!",
        description: `New order for ${data.tableNumber} has been successfully created.`,
      });
      onOrderAdded(result.order);
      reset();
      setCart([]);
      onOpenChange(false);
    } else {
      toast({
        title: "Failed to Create Order",
        description: result.message || "An error occurred. Please check the details and try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) {
        reset();
        setCart([]);
      }
    }}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Create New Order</DialogTitle>
          <DialogDescription>
            Browse menu items, add them to your cart, and create a new order.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="menu" className="w-full">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="menu">Browse Menu</TabsTrigger>
              <TabsTrigger value="cart">
                Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)}) 
                {cartTotal > 0 && <span className="ml-2">- ₹{cartTotal.toLocaleString('en-IN')}</span>}
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Browse Menu Tab */}
          <TabsContent value="menu" className="mt-0 px-6 focus-visible:outline-none focus-visible:ring-0 border-0">
            <div className="py-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search menu items..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Button
                  variant={activeCategory === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory("all")}
                >
                  <Utensils className="mr-1 h-4 w-4" />
                  All
                </Button>
                <Button
                  variant={activeCategory === "Snacks" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory("Snacks")}
                >
                  <Coffee className="mr-1 h-4 w-4" />
                  Snacks
                </Button>
                <Button
                  variant={activeCategory === "Main Course" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory("Main Course")}
                >
                  <ChefHat className="mr-1 h-4 w-4" />
                  Main
                </Button>
                <Button
                  variant={activeCategory === "Dessert" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory("Dessert")}
                >
                  <Pizza className="mr-1 h-4 w-4" />
                  Dessert
                </Button>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant={activeFoodType === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFoodType("all")}
                >
                  All Types
                </Button>
                <Button
                  variant={activeFoodType === "Vegetarian" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFoodType("Vegetarian")}
                  className={activeFoodType === "Vegetarian" ? "" : "text-green-600 border-green-200"}
                >
                  <Salad className="mr-1 h-4 w-4" />
                  Veg
                </Button>
                <Button
                  variant={activeFoodType === "Non-Vegetarian" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFoodType("Non-Vegetarian")}
                  className={activeFoodType === "Non-Vegetarian" ? "" : "text-red-600 border-red-200"}
                >
                  <Utensils className="mr-1 h-4 w-4" />
                  Non-Veg
                </Button>
              </div>
              
              {isMenuLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="ml-2">Loading menu items...</p>
                </div>
              ) : (
                <ScrollArea className="h-[50vh]">
                  <div className="space-y-6">
                    {filteredMenuItems.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-48">
                        <Utensils className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No menu items found.</p>
                        <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters.</p>
                      </div>
                    )}
                    
                    {(activeCategory === "all" || activeCategory === "Snacks") && snacks.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium mb-2 flex items-center">
                          <Coffee className="mr-2 h-5 w-5 text-amber-500" />
                          Snacks
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {snacks.map((item) => (
                            <MenuItemRow
                              key={item.id}
                              item={item}
                              inCart={cart.some(cartItem => cartItem.menuItemId === item.id)}
                              onAddToCart={() => addToCart(item)}
                              getFoodTypeIcon={getFoodTypeIcon}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {(activeCategory === "all" || activeCategory === "Main Course") && mainCourse.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium mb-2 flex items-center">
                          <ChefHat className="mr-2 h-5 w-5 text-blue-500" />
                          Main Course
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {mainCourse.map((item) => (
                            <MenuItemRow
                              key={item.id}
                              item={item}
                              inCart={cart.some(cartItem => cartItem.menuItemId === item.id)}
                              onAddToCart={() => addToCart(item)}
                              getFoodTypeIcon={getFoodTypeIcon}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {(activeCategory === "all" || activeCategory === "Dessert") && desserts.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium mb-2 flex items-center">
                          <Pizza className="mr-2 h-5 w-5 text-pink-500" />
                          Dessert
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {desserts.map((item) => (
                            <MenuItemRow
                              key={item.id}
                              item={item}
                              inCart={cart.some(cartItem => cartItem.menuItemId === item.id)}
                              onAddToCart={() => addToCart(item)}
                              getFoodTypeIcon={getFoodTypeIcon}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}
            </div>
          </TabsContent>
          
          {/* Cart Tab */}
          <TabsContent value="cart" className="mt-0 pt-4 px-6 focus-visible:outline-none focus-visible:ring-0 border-0">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <Label htmlFor="tableNumber">Table/Room Number</Label>
                <Input 
                  id="tableNumber" 
                  {...register("tableNumber")} 
                  placeholder="e.g., Table 5 or Room 101" 
                  className="mt-1"
                />
                {errors.tableNumber && (
                  <p className="text-sm text-destructive mt-1">{errors.tableNumber.message}</p>
                )}
              </div>
              
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Order Summary
                    </div>
                    {cart.length > 0 && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={clearCart}
                        type="button"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Clear All
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Your cart is empty.</p>
                      <p className="text-sm text-muted-foreground mt-1">Add items from the menu to create an order.</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[40vh]">
                      <div className="space-y-4">
                        {cart.map((item) => (
                          <div key={item.menuItemId} className="flex items-center justify-between py-2">
                            <div className="flex-1">
                              <p className="font-medium">{item.name}</p>
                              <div className="flex items-center mt-1">
                                {item.foodType === 'Vegetarian' 
                                  ? <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Veg</Badge>
                                  : <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">Non-Veg</Badge>
                                }
                                <span className="text-sm text-muted-foreground ml-2">
                                  ₹{item.price.toLocaleString('en-IN')} × {item.quantity}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={() => removeFromCart(item.menuItemId)}
                                type="button"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={() => {
                                  const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
                                  if (menuItem) addToCart(menuItem);
                                }}
                                type="button"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="ml-4 w-24 text-right font-semibold">
                              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
                {cart.length > 0 && (
                  <>
                    <Separator />
                    <CardFooter className="flex justify-between pt-4">
                      <div className="text-lg font-semibold">Total</div>
                      <div className="text-lg font-bold">₹{cartTotal.toLocaleString('en-IN')}</div>
                    </CardFooter>
                  </>
                )}
              </Card>
              
              <DialogFooter className="pt-6">
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || cart.length === 0}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Order...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Create Order
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

interface MenuItemRowProps {
  item: MenuItem;
  inCart: boolean;
  onAddToCart: () => void;
  getFoodTypeIcon: (foodType: MenuItem['foodType']) => React.ReactNode;
}

function MenuItemRow({ item, inCart, onAddToCart, getFoodTypeIcon }: MenuItemRowProps) {
  return (
    <div className="flex items-center justify-between p-2 rounded-md border hover:bg-accent/20">
      <div className="flex items-center gap-3">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={item.imageUrl} 
            alt={item.name} 
            className="h-12 w-12 rounded-md object-cover" 
          />
        ) : (
          <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center">
            <Utensils className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        <div>
          <h4 className="font-medium text-sm flex items-center gap-2">
            {item.name}
            {item.popular && <Badge variant="secondary" className="text-xs">Popular</Badge>}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            {getFoodTypeIcon(item.foodType)}
            <span className="text-muted-foreground text-xs">₹{item.price.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
      
      <Button
        size="sm"
        variant={inCart ? "outline" : "default"}
        onClick={onAddToCart}
        className={inCart ? "border-green-500 text-green-600" : ""}
      >
        {inCart ? (
          <>
            <Check className="mr-1 h-4 w-4" /> Added
          </>
        ) : (
          <>
            <Plus className="mr-1 h-4 w-4" /> Add
          </>
        )}
      </Button>
    </div>
  );
} 