
import Image from 'next/image';
import { BedDouble, Users, Wifi, DollarSign, Star, Zap, IndianRupee, Loader2 } from 'lucide-react';
import type { Room } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RoomCardProps {
  room: Room;
  onBook: (room: Room) => void; // Pass the whole room object
  isBookingTriggered?: boolean; // To show loader on this specific card when its book button is clicked
}

export function RoomCard({ room, onBook, isBookingTriggered }: RoomCardProps) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <Image
            src={room.imageUrl || `https://placehold.co/600x400.png?text=${encodeURIComponent(room.name)}`}
            alt={room.name}
            layout="fill"
            objectFit="cover"
            data-ai-hint={room['data-ai-hint'] as string || "hotel room"}
          />
        </div>
      </CardHeader>
      <CardContent className="p-6 flex-grow">
        <CardTitle className="text-xl mb-2">{room.name}</CardTitle>
        <CardDescription className="text-sm mb-4 h-12 overflow-hidden">{room.description}</CardDescription>
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
          <div className="flex items-center gap-2">
            <BedDouble className="h-4 w-4 text-primary" />
            <span>{room.type.replace(/_/g, ' ')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span>{room.capacity} Guests</span>
          </div>
          <div className="flex items-center gap-2">
            <IndianRupee className="h-4 w-4 text-primary" />
            <span>{room.pricePerNight.toLocaleString('en-IN')} / night</span>
          </div>
           <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span>Availability: {room.availabilityScore}%</span>
          </div>
        </div>

        <div className="space-x-2 mb-1">
          {room.amenities.slice(0,3).map((amenity) => (
            <Badge key={amenity} variant="secondary" className="font-normal">
              {amenity}
            </Badge>
          ))}
          {room.amenities.length > 3 && <Badge variant="outline">+{room.amenities.length-3} more</Badge>}
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button 
          className="w-full" 
          onClick={() => onBook(room)}
          disabled={isBookingTriggered}
        >
          {isBookingTriggered ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Book Now'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
