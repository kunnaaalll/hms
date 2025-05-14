
"use client";

import type React from 'react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { suggestAlternativeDates, type SuggestAlternativeDatesOutput } from '@/ai/flows/suggest-alternative-dates';
import type { Room, AISuggestionInputParams } from '@/lib/types';
// import { mockRooms } from '@/lib/mockData'; // Using getRooms action now
import { DatePickerForm, type DatePickerFormData } from './DatePickerForm';
import { RoomCard } from './RoomCard';
import { AlternativeDateSuggestion } from './AlternativeDateSuggestion';
import { BookingDetailsModal } from './BookingDetailsModal';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Hotel, Info } from 'lucide-react';
import { getRooms } from '@/app/actions/roomActions'; // To fetch rooms from data store

export function BookingInterface() {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useState<DatePickerFormData | null>(null);
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  
  const [aiSuggestion, setAiSuggestion] = useState<SuggestAlternativeDatesOutput | null>(null);
  const [isLoadingAiSuggestion, setIsLoadingAiSuggestion] = useState(false);
  const [currentRoomForAISuggestion, setCurrentRoomForAISuggestion] = useState<{price: number, availability: number} | null>(null);

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Room | null>(null);
  const [isProcessingBookingForRoomId, setIsProcessingBookingForRoomId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInitialRooms() {
      setIsLoadingRooms(true);
      const roomsFromDataStore = await getRooms();
      setAllRooms(roomsFromDataStore); 
      setIsLoadingRooms(false);
    }
    fetchInitialRooms();
  }, []);

  const handleSearch = async (data: DatePickerFormData) => {
    setIsLoadingRooms(true);
    setAiSuggestion(null);
    setAvailableRooms([]);
    setCurrentRoomForAISuggestion(null);
    setSelectedRoomForBooking(null);
    setSearchParams(data);

    // Simulate filtering based on allRooms. In a real DB scenario, this would be a query.
    // For JSON, we filter the already loaded 'allRooms'.
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate slight delay

    const filteredRooms = allRooms.filter(room => 
        room.capacity >= data.numberOfGuests && room.status === 'AVAILABLE'
    );
    setAvailableRooms(filteredRooms);
    setIsLoadingRooms(false);

    if (filteredRooms.length === 0) {
      toast({
        title: "No Rooms Found",
        description: "Unfortunately, no rooms match your criteria for the selected dates or guest count. Try different dates or fewer guests.",
        variant: "destructive",
      });
    }
  };
  
  const fetchAiSuggestionsAndProceedToBook = async (room: Room) => {
    if (!searchParams) return;

    setIsProcessingBookingForRoomId(room.id);
    setIsLoadingAiSuggestion(true);
    setAiSuggestion(null); 
    setCurrentRoomForAISuggestion({ price: room.pricePerNight, availability: room.availabilityScore });

    const input: AISuggestionInputParams = {
      selectedStartDate: format(searchParams.dateRange.from, 'yyyy-MM-dd'),
      selectedEndDate: format(searchParams.dateRange.to, 'yyyy-MM-dd'),
      numberOfGuests: searchParams.numberOfGuests,
      currentPrice: room.pricePerNight,
      availabilityScore: room.availabilityScore,
    };

    let suggestion: SuggestAlternativeDatesOutput | null = null;
    try {
      suggestion = await suggestAlternativeDates(input);
      setAiSuggestion(suggestion);
    } catch (error) {
      console.error("Error fetching AI suggestions:", error);
      toast({
        title: "Suggestion Error",
        description: "Could not fetch alternative date suggestions at this time.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAiSuggestion(false);
      if (!suggestion || !suggestion.shouldSuggestAlternatives) {
        setSelectedRoomForBooking(room);
        setIsBookingModalOpen(true);
      }
       if (suggestion && suggestion.shouldSuggestAlternatives) {
         toast({
            title: "Alternative Dates Suggested!",
            description: "We found some alternative dates you might like better.",
        });
      } else if (suggestion && !suggestion.shouldSuggestAlternatives) {
         toast({
            title: "Dates Look Good!",
            description: suggestion.reason || "Your selected dates seem optimal for price and availability.",
        });
      }
      // Loader on card is turned off when modal opens or AI suggestion is displayed
    }
  };

  const handleBookRoomTrigger = (room: Room) => {
    if (room.availabilityScore < 60 ) { // Example condition to trigger AI
         fetchAiSuggestionsAndProceedToBook(room);
    } else {
        setAiSuggestion({
            shouldSuggestAlternatives: false,
            reason: "These dates and room offer good value and availability!"
        });
        setCurrentRoomForAISuggestion({ price: room.pricePerNight, availability: room.availabilityScore});
        setSelectedRoomForBooking(room);
        setIsBookingModalOpen(true);
        // No need to setIsProcessingBookingForRoomId(null) here, modal will handle it.
    }
  };
  
  const handleAcceptSuggestion = (startDateStr: string, endDateStr: string) => {
    const newFromDate = new Date(startDateStr);
    const newToDate = new Date(endDateStr);

    if (searchParams) {
        const newSearchParams = {
            ...searchParams,
            dateRange: { from: newFromDate, to: newToDate }
        };
        handleSearch(newSearchParams); 
    }

    toast({
      title: "Dates Updated!",
      description: `Searching for rooms from ${startDateStr} to ${endDateStr}.`,
    });
    setAiSuggestion(null);
    setIsProcessingBookingForRoomId(null);
  };

  const handleBookingModalOpenChange = (open: boolean) => {
    setIsBookingModalOpen(open);
    if (!open) {
      setSelectedRoomForBooking(null);
      setIsProcessingBookingForRoomId(null);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <section className="mb-12">
        <div className="relative h-96 w-full rounded-xl overflow-hidden shadow-2xl mb-8">
          <Image
            src="https://placehold.co/1200x600.png"
            alt="Luxurious hotel facade"
            layout="fill"
            objectFit="cover"
            priority
            data-ai-hint="hotel exterior luxury"
          />
          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-center p-4">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-md">
              Lavender Luxury Hotel
            </h1>
            <p className="mt-4 text-lg text-gray-200 max-w-2xl mx-auto drop-shadow-sm">
              Discover unparalleled comfort and elegance. Your exquisite escape awaits.
            </p>
          </div>
        </div>
        <p className="mt-4 text-lg text-foreground/80 max-w-3xl mx-auto text-center">
          Select your desired dates and number of guests below to find the perfect room for your stay at Lavender Luxury Hotel. We offer a range of beautifully appointed rooms and suites to ensure a memorable experience.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 lg:sticky lg:top-24"> 
          <DatePickerForm onSubmit={handleSearch} isLoading={isLoadingRooms || isLoadingAiSuggestion} />
          {isLoadingAiSuggestion && !isProcessingBookingForRoomId && (
            <Alert className="mt-6 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
              <AlertTitle className="text-blue-700 dark:text-blue-300">Checking AI Suggestions...</AlertTitle>
              <AlertDescription className="text-blue-600 dark:text-blue-400">
                Our smart assistant is looking for better date options.
              </AlertDescription>
            </Alert>
          )}
          {aiSuggestion && (
            <div className="mt-6">
              <AlternativeDateSuggestion 
                suggestion={aiSuggestion} 
                onAcceptSuggestion={handleAcceptSuggestion}
                currentPrice={currentRoomForAISuggestion?.price}
                currentAvailability={currentRoomForAISuggestion?.availability}
              />
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {isLoadingRooms && availableRooms.length === 0 && (
            <div className="flex justify-center items-center min-h-[400px]">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          )}

          {!isLoadingRooms && searchParams && availableRooms.length === 0 && (
            <Alert variant="destructive" className="min-h-[200px] flex flex-col justify-center items-center text-center">
              <Hotel className="h-12 w-12 mb-4" />
              <AlertTitle className="text-2xl">No Rooms Available</AlertTitle>
              <AlertDescription className="max-w-md">
                We couldn&apos;t find any rooms for your selected dates and guest count. 
                Please try adjusting your search.
              </AlertDescription>
            </Alert>
          )}
          
          {!isLoadingRooms && availableRooms.length > 0 && (
            <section>
              <h2 className="text-3xl font-semibold mb-6 text-center lg:text-left">Available Rooms</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {availableRooms.map((room) => (
                  <RoomCard 
                    key={room.id} 
                    room={room} 
                    onBook={handleBookRoomTrigger}
                    isBookingTriggered={isProcessingBookingForRoomId === room.id}
                  />
                ))}
              </div>
            </section>
          )}
          
          {!isLoadingRooms && !searchParams && allRooms.length === 0 && (
             <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Loading hotel rooms...</p>
            </div>
          )}

          {!isLoadingRooms && !searchParams && allRooms.length > 0 && (
             <div className="min-h-[400px] flex flex-col justify-center items-center text-center p-8 border-2 border-dashed rounded-xl bg-muted/30">
                <Info className="h-16 w-16 text-primary mb-6" />
                <h2 className="text-2xl font-semibold mb-3">Welcome!</h2>
                <p className="text-muted-foreground max-w-md">
                    Please select your check-in and check-out dates, and the number of guests to find available rooms at Lavender Luxury Hotel.
                </p>
            </div>
          )}
        </div>
      </div>
      {selectedRoomForBooking && searchParams && (
        <BookingDetailsModal
            isOpen={isBookingModalOpen}
            onOpenChange={handleBookingModalOpenChange}
            room={selectedRoomForBooking}
            searchParams={searchParams}
        />
      )}
    </div>
  );
}
