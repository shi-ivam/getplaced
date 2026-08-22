import { Outlet, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/app-sidebar";

export default function Layout() {
  const location = useLocation();
  const isCoachOrOnboarding =
    location.pathname === "/app/coach" ||
    location.pathname.startsWith("/app/coach/") ||
    location.pathname.includes("/onboarding");

  if (isCoachOrOnboarding) {
    return (
      <main className="w-full min-h-screen overflow-auto bg-[#07080b]">
        <Outlet />
      </main>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden">
        <AppSidebar className="fixed h-full" />
        
        {/* Main content */}
        <main className="flex-1 flex flex-col overflow-auto">
          <SidebarTrigger className="md:hidden" />
          
          {/* Full height content */}
          <div className="flex-1">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}