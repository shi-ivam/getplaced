import React, { useState, useEffect } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import axios from "axios";
import { NODE_API_URL } from "@/config/api";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/app-sidebar";
import GlobalCoachSidekick from "@/components/coach/GlobalCoachSidekick";
import SpotlightCommandPalette from "@/components/navigation/SpotlightCommandPalette";
import { Search, Sparkles, User, Bell } from "lucide-react";

export default function Layout() {
  const location = useLocation();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [userName, setUserName] = useState("Candidate");

  // Load candidate info for header avatar
  useEffect(() => {
    try {
      const stored = localStorage.getItem("getplaced_user");
      if (stored) {
        const u = JSON.parse(stored);
        if (u.name) setUserName(u.name);
      }
    } catch (e) {
      console.warn("Could not read stored user:", e);
    }

    axios
      .get(`${NODE_API_URL}/api/users/profile`, { withCredentials: true })
      .then((res) => {
        if (res.data?.name) setUserName(res.data.name);
      })
      .catch(() => {});
  }, [location.pathname]);

  const initials = userName
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "GP";

  // Keyboard shortcut Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const getBreadcrumbTitle = () => {
    const segments = location.pathname.split("/").filter(Boolean);
    if (segments.length <= 1) return "Overview";
    const last = segments[segments.length - 1];
    return last
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden relative bg-[#F8F8F5] font-sans text-[#17103D]">
        {/* Sidebar */}
        <AppSidebar className="fixed h-full z-30" />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden relative bg-[#F8F8F5] min-w-0">
          {/* Top Universal App Header */}
          <header className="h-14 px-4 sm:px-6 bg-white border-b border-[#E2DEEC] flex items-center justify-between shadow-[0_1px_3px_rgba(23,16,61,0.02)] shrink-0 z-20">
            {/* Left: Sidebar trigger + Page Title Breadcrumb */}
            <div className="flex items-center gap-3">
              <SidebarTrigger className="p-1.5 rounded-lg border border-[#E2DEEC] bg-[#F8F8F5] text-[#17103D] hover:bg-[#EFEAFF] transition-colors cursor-pointer" />
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-sm sm:text-base text-[#17103D]">
                  {getBreadcrumbTitle()}
                </span>
              </div>
            </div>

            {/* Right: Quick Search + AI Status + Profile */}
            <div className="flex items-center gap-3">
              {/* Spotlight Search Shortcut Button */}
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#E2DEEC] bg-[#F8F8F5] hover:bg-white text-xs text-[#6F6A80] hover:text-[#17103D] hover:border-[#C8C3D8] transition-all cursor-pointer shadow-sm"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search tools...</span>
                <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-[#E2DEEC] font-mono text-[#6F6A80]">
                  ⌘K
                </kbd>
              </button>



              {/* Avatar Link */}
              <Link
                to="/app/profile"
                className="w-8 h-8 rounded-full bg-[#17103D] text-[#FFD84D] flex items-center justify-center font-bold text-xs hover:scale-105 transition-transform shadow-sm"
                title="View Profile Settings"
              >
                {initials}
              </Link>
            </div>
          </header>

          {/* Workspace full bleed vs standard page layout */}
          {location.pathname.startsWith("/app/coding/") || location.pathname.startsWith("/app/problems/") ? (
            <div className="flex-1 flex flex-col min-h-0 h-full w-full overflow-hidden p-0">
              <Outlet />
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0 h-full overflow-y-auto">
              <div className="w-full max-w-[1400px] mx-auto p-4 sm:p-6 md:p-8 flex-1 min-w-0">
                <Outlet />
              </div>
            </div>
          )}

          {/* Spotlight Command Palette (Cmd + K) */}
          <SpotlightCommandPalette
            isOpen={commandPaletteOpen}
            onClose={() => setCommandPaletteOpen(false)}
          />

          {/* Omnipresent Integrated AI Coach Sidekick */}
          <GlobalCoachSidekick />
        </main>
      </div>
    </SidebarProvider>
  );
}
