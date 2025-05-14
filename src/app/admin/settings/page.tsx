
"use client";

import type React from 'react';
import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Save, Building, Mail, Phone, MapPin, IndianRupee, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// import { mockHotelSettings } from '@/lib/mockData'; // Using data store
import type { HotelSettings } from '@/lib/types';
import { getHotelSettings, updateHotelSettings } from '@/lib/jsonDataStore'; // Server actions for JSON


const settingsSchema = z.object({
  hotelName: z.string().min(3, "Hotel name must be at least 3 characters"),
  contactEmail: z.string().email("Invalid email address"),
  contactPhone: z.string().min(10, "Phone number seems too short"),
  address: z.string().min(10, "Address seems too short"),
  enableOnlineBookings: z.boolean(),
  currencySymbol: z.string().length(1, "Currency symbol should be a single character"),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, setValue, reset } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    // Default values will be set by useEffect
  });

  useEffect(() => {
    async function loadSettings() {
      setIsLoadingSettings(true);
      const currentSettings = await getHotelSettings();
      if (currentSettings) {
        reset(currentSettings); // Populate form with fetched settings
      } else {
        // Fallback if settings are null (e.g., data.json not fully initialized)
         reset({ 
            hotelName: "Lavender Luxury Hotel",
            contactEmail: "contact@example.com",
            contactPhone: "1234567890",
            address: "123 Default Street",
            enableOnlineBookings: true,
            currencySymbol: "₹"
         });
      }
      setIsLoadingSettings(false);
    }
    loadSettings();
  }, [reset]);


  const onSubmit: SubmitHandler<SettingsFormData> = async (data) => {
    const result = await updateHotelSettings(data);
    if (result) {
      reset(result); // Update form with newly saved data
      toast({
        title: "Settings Saved",
        description: "Your hotel settings have been successfully updated.",
      });
    } else {
       toast({
        title: "Failed to Save Settings",
        description: "An error occurred while saving settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoadingSettings) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-3 text-lg">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            Application Settings
          </CardTitle>
          <CardDescription>Configure general settings for the Lavender Stays application (stored in data.json).</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-8">
            <section className="space-y-4 p-6 border rounded-lg">
              <h3 className="text-lg font-semibold flex items-center gap-2"><Building className="h-5 w-5 text-muted-foreground" /> Hotel Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="hotelName">Hotel Name</Label>
                  <Input id="hotelName" {...register("hotelName")} className="mt-1" />
                  {errors.hotelName && <p className="text-sm text-destructive mt-1">{errors.hotelName.message}</p>}
                </div>
                 <div>
                  <Label htmlFor="currencySymbol">Currency Symbol</Label>
                   <div className="relative mt-1">
                    <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="currencySymbol" {...register("currencySymbol")} className="pl-10" maxLength={1} />
                  </div>
                  {errors.currencySymbol && <p className="text-sm text-destructive mt-1">{errors.currencySymbol.message}</p>}
                </div>
              </div>
              <div>
                  <Label htmlFor="address">Address</Label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea id="address" {...register("address")} className="pl-10" rows={3}/>
                  </div>
                  {errors.address && <p className="text-sm text-destructive mt-1">{errors.address.message}</p>}
              </div>
            </section>

            <section className="space-y-4 p-6 border rounded-lg">
              <h3 className="text-lg font-semibold flex items-center gap-2"><Mail className="h-5 w-5 text-muted-foreground" /> Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="contactEmail">Contact Email</Label>
                   <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="contactEmail" type="email" {...register("contactEmail")} className="pl-10" />
                  </div>
                  {errors.contactEmail && <p className="text-sm text-destructive mt-1">{errors.contactEmail.message}</p>}
                </div>
                <div>
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="contactPhone" type="tel" {...register("contactPhone")} className="pl-10" />
                  </div>
                  {errors.contactPhone && <p className="text-sm text-destructive mt-1">{errors.contactPhone.message}</p>}
                </div>
              </div>
            </section>
            
            <section className="space-y-4 p-6 border rounded-lg">
                <h3 className="text-lg font-semibold flex items-center gap-2"><Settings className="h-5 w-5 text-muted-foreground" /> Booking Settings</h3>
                <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="enableOnlineBookings" className="flex flex-col space-y-1">
                    <span>Enable Online Bookings</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                        Allow guests to book rooms directly through the website.
                    </span>
                    </Label>
                    <Switch
                        id="enableOnlineBookings"
                        checked={watch("enableOnlineBookings")}
                        onCheckedChange={(checked) => setValue("enableOnlineBookings", checked)}
                    />
                </div>
                 {errors.enableOnlineBookings && <p className="text-sm text-destructive mt-1">{errors.enableOnlineBookings.message}</p>}
            </section>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit" disabled={isSubmitting || isLoadingSettings}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isSubmitting ? "Saving..." : "Save Settings"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
