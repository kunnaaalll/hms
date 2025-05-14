"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpenCheck, BedDouble, Utensils, House, ConciergeBell, Settings } from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { cn } from '@/lib/utils';

const adminNavItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/bookings', label: 'Bookings', icon: BookOpenCheck },
  { href: '/admin/rooms', label: 'Room Management', icon: BedDouble },
  { href: '/admin/restaurant', label: 'Restaurant Orders', icon: Utensils },
  { href: '/admin/housekeeping', label: 'Housekeeping', icon: House },
  { href: '/admin/services', label: 'Guest Services', icon: ConciergeBell },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminSidebarItems() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {adminNavItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} passHref legacyBehavior>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href))}
              tooltip={item.label}
              className={cn(
                (pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href))) && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
            >
              <a>
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </a>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
