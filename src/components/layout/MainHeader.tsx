import { Hotel, UserCog } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function MainHeader() {
  return (
    <header className="py-4 px-6 border-b sticky top-0 bg-background/95 backdrop-blur z-50">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
          <Hotel className="h-8 w-8" />
          <span>Lavender Luxury Hotel</span>
        </Link>
        <nav className="flex items-center gap-4">
          {/* Future navigation links can go here */}
          {/* <Link href="/about" className="text-sm font-medium hover:text-primary">About Us</Link> */}
          {/* <Link href="/contact" className="text-sm font-medium hover:text-primary">Contact</Link> */}
          <Link href="/admin/dashboard" passHref>
            <Button variant="outline">
              <UserCog className="mr-2 h-4 w-4" />
              Admin Login
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
