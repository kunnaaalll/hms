"use client";

import { useState, useEffect } from 'react';
import { getMenuItems } from '@/app/actions/menuActions';
import type { MenuItem, CartItem } from '@/lib/types';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  ChefHat, 
  Coffee, 
  Pizza, 
  ShoppingCart, 
  Trash2, 
  Utensils, 
  Plus, 
  Minus,
  IndianRupee,
  Loader2,
  Salad,
  CircleDot
} from 'lucide-react';

export default function ClientRestaurantPage() {
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<"all" | "Snacks" | "Main Course" | "Dessert">("all");
  const [activeType, setActiveType] = useState<"all" | "Vegetarian" | "Non-Vegetarian">("all");
  
  useEffect(() => {
    async function loadMenuItems() {
      setIsLoading(true);
      const fetchedMenuItems = await getMenuItems();
      setMenuItems(fetchedMenuItems);
      setIsLoading(false);
    }
    loadMenuItems();
  }, []);
  
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
    
    toast({
      title: "Added to cart",
      description: `${menuItem.name} has been added to your cart.`,
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
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart.",
    });
  };
  
  // Calculate cart total
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Filter menu items based on selected category and type
  const filteredMenuItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesType = activeType === "all" || item.foodType === activeType;
    return matchesCategory && matchesType;
  });
  
  // Group menu items by category for display
  const snacks = filteredMenuItems.filter(item => item.category === "Snacks");
  const mainCourse = filteredMenuItems.filter(item => item.category === "Main Course");
  const dessert = filteredMenuItems.filter(item => item.category === "Dessert");
  
  // Get food type icon
  const getFoodTypeIcon = (foodType: MenuItem['foodType']) => {
    return foodType === 'Vegetarian' 
      ? <div className="flex items-center text-green-600"><CircleDot className="h-4 w-4 mr-1" /> Veg</div>
      : <div className="flex items-center text-red-600"><CircleDot className="h-4 w-4 mr-1" /> Non-Veg</div>;
  };
  
  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <ChefHat className="mr-2 h-8 w-8 text-primary" />
            Restaurant Menu
          </h1>
          <p className="text-muted-foreground mt-1">
            Explore our delicious selection of authentic Indian cuisine
          </p>
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button className="mt-4 md:mt-0" size="lg">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Cart ({cart.reduce((total, item) => total + item.quantity, 0)})
              {cartTotal > 0 && <span className="ml-2">₹{cartTotal.toLocaleString('en-IN')}</span>}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Your Order</SheetTitle>
              <SheetDescription>
                Review your cart before placing the order
              </SheetDescription>
            </SheetHeader>
            
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[50vh]">
                <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">Your cart is empty</p>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Add some delicious items to get started
                </p>
              </div>
            ) : (
              <>
                <ScrollArea className="h-[60vh] my-4">
                  {cart.map((item) => (
                    <div key={item.menuItemId} className="flex justify-between items-center py-4">
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          {item.foodType === 'Vegetarian' 
                            ? <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Veg</Badge>
                            : <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">Non-Veg</Badge>
                          }
                          <div className="text-sm text-muted-foreground">₹{item.price} x {item.quantity}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => removeFromCart(item.menuItemId)}
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
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
                
                <Separator />
                
                <div className="flex justify-between items-center py-4">
                  <div className="font-medium">Total</div>
                  <div className="font-bold text-xl">₹{cartTotal.toLocaleString('en-IN')}</div>
                </div>
                
                <SheetFooter className="flex gap-2 flex-row sm:justify-between">
                  <Button 
                    variant="outline" 
                    onClick={clearCart}
                    className="flex-1"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear Cart
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => {
                      toast({
                        title: "Order Placed",
                        description: `Your order has been placed successfully!`,
                      });
                      setCart([]);
                    }}
                  >
                    Place Order
                  </Button>
                </SheetFooter>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
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
                Main Course
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
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Food Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={activeType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveType("all")}
              >
                <Utensils className="mr-1 h-4 w-4" />
                All
              </Button>
              <Button 
                variant={activeType === "Vegetarian" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveType("Vegetarian")}
                className={activeType === "Vegetarian" ? "" : "text-green-600 border-green-200"}
              >
                <Salad className="mr-1 h-4 w-4" />
                Vegetarian
              </Button>
              <Button 
                variant={activeType === "Non-Vegetarian" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveType("Non-Vegetarian")}
                className={activeType === "Non-Vegetarian" ? "" : "text-red-600 border-red-200"}
              >
                <Utensils className="mr-1 h-4 w-4" />
                Non-Vegetarian
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Loading menu items...</p>
        </div>
      ) : (
        <div className="space-y-12">
          {(activeCategory === "all" || activeCategory === "Snacks") && snacks.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Coffee className="mr-2 h-6 w-6 text-amber-500" />
                Snacks
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {snacks.map((item) => (
                  <MenuItemCard 
                    key={item.id} 
                    item={item} 
                    onAddToCart={addToCart}
                    getFoodTypeIcon={getFoodTypeIcon}
                  />
                ))}
              </div>
            </div>
          )}
          
          {(activeCategory === "all" || activeCategory === "Main Course") && mainCourse.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <ChefHat className="mr-2 h-6 w-6 text-blue-500" />
                Main Course
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mainCourse.map((item) => (
                  <MenuItemCard 
                    key={item.id} 
                    item={item} 
                    onAddToCart={addToCart}
                    getFoodTypeIcon={getFoodTypeIcon}
                  />
                ))}
              </div>
            </div>
          )}
          
          {(activeCategory === "all" || activeCategory === "Dessert") && dessert.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Pizza className="mr-2 h-6 w-6 text-pink-500" />
                Dessert
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dessert.map((item) => (
                  <MenuItemCard 
                    key={item.id} 
                    item={item} 
                    onAddToCart={addToCart}
                    getFoodTypeIcon={getFoodTypeIcon}
                  />
                ))}
              </div>
            </div>
          )}
          
          {filteredMenuItems.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64">
              <Utensils className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">No menu items found</p>
              <p className="text-sm text-muted-foreground text-center mt-2">
                Try changing your category or food type filters
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
  getFoodTypeIcon: (foodType: MenuItem['foodType']) => React.ReactNode;
}

function MenuItemCard({ item, onAddToCart, getFoodTypeIcon }: MenuItemCardProps) {
  return (
    <Card className="overflow-hidden">
      {item.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img 
          src={item.imageUrl} 
          alt={item.name} 
          className="w-full h-48 object-cover" 
        />
      )}
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{item.name}</CardTitle>
            <div className="mt-1">{getFoodTypeIcon(item.foodType)}</div>
          </div>
          {item.popular && (
            <Badge variant="secondary">Popular</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm mb-4">{item.description}</p>
        <div className="text-lg font-bold flex items-center">
          <IndianRupee className="h-4 w-4 mr-1" />
          {item.price.toLocaleString('en-IN')}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={() => onAddToCart(item)}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
} 