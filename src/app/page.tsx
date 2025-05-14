import { BookingInterface } from '@/components/booking/BookingInterface';
import { MainHeader } from '@/components/layout/MainHeader';
import { MainFooter } from '@/components/layout/MainFooter';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <MainHeader />
      <main className="flex-grow">
        <BookingInterface />
      </main>
      <MainFooter />
    </div>
  );
}
