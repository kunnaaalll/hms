"use client";

import type React from 'react';
import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import type { RestaurantOrder, MenuItem } from '@/lib/types';
import { getRestaurantOrders, deleteOrder, updateOrderStatus } from '@/app/actions/restaurantActions';
import { getMenuItems, deleteMenuItem } from '@/app/actions/menuActions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Utensils, IndianRupee, ListOrdered, Clock, Edit3, PlusCircle, Trash2, Eye, Loader2, Pizza, Salad, ChefHat, Coffee } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddOrderModal } from '@/components/admin/AddOrderModal';
import { AddMenuItemModal } from '@/components/admin/AddMenuItemModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminRestaurantPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"orders" | "menu">("orders");
  
  // Orders state
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<RestaurantOrder | null>(null);
  const [orderActionType, setOrderActionType] = useState<'view' | 'edit' | 'delete' | null>(null);
  const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false);
  const [isOrderProcessing, setIsOrderProcessing] = useState(false);
  
  // Menu items state
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isMenuLoading, setIsMenuLoading] = useState(true);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [menuItemActionType, setMenuItemActionType] = useState<'view' | 'edit' | 'delete' | null>(null);
  const [isAddMenuItemModalOpen, setIsAddMenuItemModalOpen] = useState(false);
  const [isMenuItemProcessing, setIsMenuItemProcessing] = useState(false);
  const [menuFilter, setMenuFilter] = useState<"all" | "Vegetarian" | "Non-Vegetarian" | "Snacks" | "Main Course" | "Dessert">("all");
  const [editMenuItem, setEditMenuItem] = useState<MenuItem | null>(null);
  const [isEditMenuItemModalOpen, setIsEditMenuItemModalOpen] = useState(false);

  // Load orders
  useEffect(() => {
    async function loadOrders() {
      setIsOrdersLoading(true);
      const fetchedOrders = await getRestaurantOrders();
      setOrders(fetchedOrders);
      setIsOrdersLoading(false);
    }
    loadOrders();
  }, []);
  
  // Load menu items
  useEffect(() => {
    async function loadMenuItems() {
      setIsMenuLoading(true);
      const fetchedMenuItems = await getMenuItems();
      setMenuItems(fetchedMenuItems);
      setIsMenuLoading(false);
    }
    loadMenuItems();
  }, []);

  // Order management functions
  const handleOrderAction = (orderId: string, type: 'view' | 'edit' | 'delete') => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setOrderActionType(type);
      if (type === 'delete') {
        // Delete confirmation is handled by AlertDialogTrigger
      } else {
        // For view/edit, you might open a modal here
        toast({ title: `${type.charAt(0).toUpperCase() + type.slice(1)} Order`, description: `Order ID: ${order.id}` });
      }
    }
  };

  const confirmDeleteOrder = async () => {
    if (selectedOrder) {
      setIsOrderProcessing(true);
      
      const result = await deleteOrder(selectedOrder.id);
      
      if (result.success) {
        setOrders(prevOrders => prevOrders.filter(o => o.id !== selectedOrder.id));
        toast({
          title: "Order Deleted",
          description: `Order ID "${selectedOrder.id}" has been deleted.`,
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete order",
          variant: "destructive"
        });
      }
      
      setSelectedOrder(null);
      setOrderActionType(null);
      setIsOrderProcessing(false);
    }
  };

  const handleOrderAdded = (newOrder: RestaurantOrder) => {
    setOrders(prev => [newOrder, ...prev]);
    toast({
      title: "Order Created",
      description: `New order for ${newOrder.tableNumber} has been created.`,
    });
  };

  const getStatusBadgeVariant = (status: RestaurantOrder['status']) => {
    switch (status) {
      case 'Pending': return 'default';
      case 'Preparing': return 'outline'; 
      case 'Served': return 'secondary';
      case 'Paid': return 'default';
      default: return 'default';
    }
  };
  
  // Menu item management functions
  const handleMenuItemAction = (itemId: string, type: 'view' | 'edit' | 'delete') => {
    const menuItem = menuItems.find(item => item.id === itemId);
    if (menuItem) {
      setSelectedMenuItem(menuItem);
      setMenuItemActionType(type);
      if (type === 'delete') {
        // Delete confirmation is handled by AlertDialogTrigger
      } else if (type === 'edit') {
        setEditMenuItem(menuItem);
        setIsEditMenuItemModalOpen(true);
      } else {
        toast({ title: `${type.charAt(0).toUpperCase() + type.slice(1)} Menu Item`, description: `Item: ${menuItem.name}` });
      }
    }
  };
  
  const confirmDeleteMenuItem = async () => {
    if (selectedMenuItem) {
      setIsMenuItemProcessing(true);
      
      const result = await deleteMenuItem(selectedMenuItem.id);
      
      if (result.success) {
        setMenuItems(prevItems => prevItems.filter(item => item.id !== selectedMenuItem.id));
        toast({
          title: "Menu Item Deleted",
          description: `"${selectedMenuItem.name}" has been deleted from the menu.`,
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete menu item",
          variant: "destructive"
        });
      }
      
      setSelectedMenuItem(null);
      setMenuItemActionType(null);
      setIsMenuItemProcessing(false);
    }
  };
  
  const handleMenuItemAdded = (newMenuItem: MenuItem) => {
    setMenuItems(prev => [newMenuItem, ...prev]);
    toast({
      title: "Menu Item Created",
      description: `"${newMenuItem.name}" has been added to the menu.`,
    });
  };
  
  const handleMenuItemEdited = (updatedMenuItem: MenuItem) => {
    setMenuItems(prev => prev.map(item => item.id === updatedMenuItem.id ? updatedMenuItem : item));
    toast({
      title: "Menu Item Updated",
      description: `"${updatedMenuItem.name}" has been updated.`,
    });
    setEditMenuItem(null);
    setIsEditMenuItemModalOpen(false);
  };
  
  // Filter menu items based on selected filter
  const filteredMenuItems = menuItems.filter(item => {
    if (menuFilter === "all") return true;
    if (menuFilter === "Vegetarian" || menuFilter === "Non-Vegetarian") {
      return item.foodType === menuFilter;
    }
    return item.category === menuFilter;
  });
  
  // Get icon for food category
  const getFoodCategoryIcon = (category: MenuItem['category']) => {
    switch (category) {
      case 'Snacks': return <Coffee className="h-4 w-4 text-amber-500" />;
      case 'Main Course': return <ChefHat className="h-4 w-4 text-blue-500" />;
      case 'Dessert': return <Pizza className="h-4 w-4 text-pink-500" />;
      default: return <Utensils className="h-4 w-4" />;
    }
  };
  
  // Get icon for food type
  const getFoodTypeIcon = (foodType: MenuItem['foodType']) => {
    return foodType === 'Vegetarian' 
      ? <Salad className="h-4 w-4 text-green-500" />
      : <Utensils className="h-4 w-4 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="orders" onValueChange={(value) => setActiveTab(value as "orders" | "menu")}>
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="menu">Food Menu</TabsTrigger>
        </TabsList>
        
        {/* Orders Tab Content */}
        <TabsContent value="orders">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-6 w-6 text-primary" />
                  Restaurant Order Management
                </CardTitle>
                <CardDescription>Oversee restaurant orders, menu items, and table reservations.</CardDescription>
              </div>
              <Button onClick={() => setIsAddOrderModalOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" /> New Order
              </Button>
            </CardHeader>
            <CardContent>
              {isOrdersLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="ml-2">Loading restaurant orders...</p>
                </div>
              ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Table/Room</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right">Total (₹)</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No orders found.
                      </TableCell>
                    </TableRow>
                  )}
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.tableNumber}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <ListOrdered className="h-3 w-3 text-muted-foreground"/>
                          {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                        </div>
                        <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                            {order.items.map(i => i.name).join(', ')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <IndianRupee className="h-3 w-3 text-muted-foreground"/>
                          {order.totalPrice.toLocaleString('en-IN')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground"/>
                          {format(parseISO(order.orderTime), 'p')}
                        </div>
                         <div className="text-xs text-muted-foreground">{format(parseISO(order.orderTime), 'MMM dd')}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={getStatusBadgeVariant(order.status)} className="capitalize">
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                         <AlertDialog>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Edit3 className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => handleOrderAction(order.id, 'view')}>
                                <Eye className="mr-2 h-4 w-4" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => handleOrderAction(order.id, 'edit')}>
                                <Edit3 className="mr-2 h-4 w-4" /> Modify Order
                              </DropdownMenuItem>
                               <AlertDialogTrigger asChild>
                                <DropdownMenuItem 
                                    className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/50"
                                    onSelect={() => handleOrderAction(order.id, 'delete')}>
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete Order
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                            </DropdownMenuContent>
                          </DropdownMenu>
                           {orderActionType === 'delete' && selectedOrder?.id === order.id && (
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete order ID {selectedOrder?.id}.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => {setSelectedOrder(null); setOrderActionType(null);}}>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={confirmDeleteOrder}
                                      className="bg-red-600 hover:bg-red-700"
                                      disabled={isOrderProcessing}
                                    >
                                      {isOrderProcessing ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Deleting...
                                        </>
                                      ) : (
                                        "Confirm Deletion"
                                      )}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                           )}
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Menu Tab Content */}
        <TabsContent value="menu">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="h-6 w-6 text-primary" />
                  Food Menu Management
                </CardTitle>
                <CardDescription>Manage your restaurant's menu items, categories, and prices.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Select 
                  onValueChange={(value) => setMenuFilter(value as any)} 
                  defaultValue="all"
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter menu items" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Items</SelectItem>
                    <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                    <SelectItem value="Non-Vegetarian">Non-Vegetarian</SelectItem>
                    <SelectItem value="Snacks">Snacks</SelectItem>
                    <SelectItem value="Main Course">Main Course</SelectItem>
                    <SelectItem value="Dessert">Dessert</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => setIsAddMenuItemModalOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Menu Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isMenuLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="ml-2">Loading food menu items...</p>
                </div>
              ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Price (₹)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMenuItems.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No menu items found. Add some items to get started!
                      </TableCell>
                    </TableRow>
                  )}
                  {filteredMenuItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {item.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img 
                              src={item.imageUrl} 
                              alt={item.name} 
                              className="h-10 w-10 rounded-md object-cover" 
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                              <Utensils className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{item.name}</div>
                            {item.popular && <Badge variant="outline" className="mt-0.5">Popular</Badge>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getFoodCategoryIcon(item.category)}
                          {item.category}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getFoodTypeIcon(item.foodType)}
                          <span className={item.foodType === 'Vegetarian' ? 'text-green-600' : 'text-red-600'}>
                            {item.foodType}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={item.description}>
                        {item.description}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        <div className="flex items-center justify-end gap-1">
                          <IndianRupee className="h-3 w-3 text-muted-foreground"/>
                          {item.price.toLocaleString('en-IN')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Edit3 className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => handleMenuItemAction(item.id, 'view')}>
                                <Eye className="mr-2 h-4 w-4" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => handleMenuItemAction(item.id, 'edit')}>
                                <Edit3 className="mr-2 h-4 w-4" /> Edit Item
                              </DropdownMenuItem>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem 
                                  className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/50"
                                  onSelect={() => handleMenuItemAction(item.id, 'delete')}>
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete Item
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          {menuItemActionType === 'delete' && selectedMenuItem?.id === item.id && (
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete "{selectedMenuItem?.name}" from the menu.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => {setSelectedMenuItem(null); setMenuItemActionType(null);}}>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={confirmDeleteMenuItem}
                                  className="bg-red-600 hover:bg-red-700"
                                  disabled={isMenuItemProcessing}
                                >
                                  {isMenuItemProcessing ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Deleting...
                                    </>
                                  ) : (
                                    "Confirm Deletion"
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          )}
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <AddOrderModal
        isOpen={isAddOrderModalOpen}
        onOpenChange={setIsAddOrderModalOpen}
        onOrderAdded={handleOrderAdded}
      />
      
      <AddMenuItemModal
        isOpen={isAddMenuItemModalOpen}
        onOpenChange={setIsAddMenuItemModalOpen}
        onMenuItemAdded={handleMenuItemAdded}
      />
      <AddMenuItemModal
        isOpen={isEditMenuItemModalOpen}
        onOpenChange={(open) => {
          setIsEditMenuItemModalOpen(open);
          if (!open) setEditMenuItem(null);
        }}
        menuItem={editMenuItem || undefined}
        onMenuItemEdited={handleMenuItemEdited}
        onMenuItemAdded={() => {}}
      />
    </div>
  );
}
