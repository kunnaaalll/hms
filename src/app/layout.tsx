import type {Metadata} from 'next';
import { GeistSans } from 'geist/font/sans';
// import { GeistMono } from 'geist/font/mono'; // Temporarily removed
import './globals.css';
import { Providers } from '@/components/Providers';

const geistSans = GeistSans;
// const geistMono = GeistMono; // Temporarily removed

export const metadata: Metadata = {
  title: 'Lavender Stays - Luxury Hotel Management',
  description: 'Modern hotel management and booking platform.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} font-sans antialiased`}> {/* Removed geistMono.variable */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
