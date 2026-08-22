import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/app-sidebar";
import GlobalCoachSidekick from "@/components/coach/GlobalCoachSidekick";

export default function Layout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden relative">
        <AppSidebar className="fixed h-full" />
        
        {/* Main content */}
        <main className="flex-1 flex flex-col overflow-auto relative">
          <SidebarTrigger className="md:hidden" />
          
          {/* Full height content */}
          <div className="flex-1 flex flex-col min-h-0 h-full">
            <Outlet />
          </div>

          {/* Omnipresent Floating AI Coach Sidekick */}
          <GlobalCoachSidekick />
        </main>
      </div>
    </SidebarProvider>
  );
}