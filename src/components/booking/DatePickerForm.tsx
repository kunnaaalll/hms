"use client";

import type * as React from 'react';
import { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format, addDays } from 'date-fns';
import { CalendarIcon, UsersIcon, Search } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const FormSchema = z.object({
  dateRange: z.object({
    from: z.date({ required_error: "Check-in date is required." }),
    to: z.date({ required_error: "Check-out date is required." }),
  }).refine(data => data.from < data.to, {
    message: "Check-out date must be after check-in date.",
    path: ["to"],
  }),
  numberOfGuests: z.coerce.number().min(1, "At least 1 guest is required.").max(10, "Maximum 10 guests allowed."),
});

export type DatePickerFormData = z.infer<typeof FormSchema>;

interface DatePickerFormProps {
  onSubmit: (data: DatePickerFormData) => void;
  isLoading: boolean;
}

export function DatePickerForm({ onSubmit, isLoading }: DatePickerFormProps) {
  const form = useForm<DatePickerFormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      dateRange: {
        from: new Date(),
        to: addDays(new Date(), 3),
      },
      numberOfGuests: 1,
    },
  });
  
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 sm:p-8 rounded-xl shadow-lg">
        <FormField
          control={form.control}
          name="dateRange"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Select Dates</FormLabel>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value.from ? (
                        field.value.to ? (
                          <>
                            {format(field.value.from, "LLL dd, y")} -{" "}
                            {format(field.value.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(field.value.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={field.value.from}
                    selected={{ from: field.value.from, to: field.value.to }}
                    onSelect={(range) => {
                      if (range) field.onChange(range);
                      // Close popover after selecting a range
                      if (range.from && range.to) {
                         setIsCalendarOpen(false);
                      }
                    }}
                    numberOfMonths={2}
                    disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} // Disable past dates
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="numberOfGuests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Guests</FormLabel>
              <FormControl>
                <div className="relative">
                  <UsersIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input type="number" placeholder="e.g., 2" {...field} className="pl-10" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2"></div>
          ) : (
            <Search className="mr-2 h-4 w-4" />
          )}
          {isLoading ? "Searching..." : "Find Rooms"}
        </Button>
      </form>
    </Form>
  );
}
