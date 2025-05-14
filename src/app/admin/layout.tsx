import type React from 'react';
import { Hotel, UserCircle } from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebarItems } from '@/components/admin/AdminSidebarItems';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarRail
} from "@/components/ui/sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}> {/* Sidebar open by default on desktop */}
      <Sidebar
        variant="sidebar" // Standard sidebar behavior
        collapsible="icon" // Collapses to icons
        className="border-r"
      >
        <SidebarHeader className="p-4 border-b">
          <div className="flex items-center gap-2 text-lg font-semibold text-primary group-data-[collapsible=icon]:justify-center">
            <Hotel className="h-7 w-7 shrink-0" />
            <span className="group-data-[collapsible=icon]:hidden">Lavender Luxury</span>
          </div>
          {/* User Info */}
          <div className="flex items-center gap-3 mt-6 mb-2 group-data-[collapsible=icon]:hidden">
            <UserCircle className="h-10 w-10 text-muted-foreground" />
            <div>
              <div className="font-semibold leading-tight">Admin User</div>
              <div className="text-xs text-muted-foreground">admin@lavenderluxury.com</div>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <AdminSidebarItems />
        </SidebarContent>
        <SidebarFooter className="p-4 border-t group-data-[collapsible=icon]:justify-center">
          <span className="text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
            &copy; {new Date().getFullYear()} Lavender Luxury
          </span>
        </SidebarFooter>
      </Sidebar>
      <SidebarRail />
      <SidebarInset>
        <AdminHeader />
        <main className="flex-1 p-6 bg-muted/30 min-h-[calc(100vh-4rem)]">
           {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
