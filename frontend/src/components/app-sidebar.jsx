import React, { useState, useEffect } from "react";
import {
  Home,
  User,
  Briefcase,
  FileText,
  BrainCog,
  Code2,
  Terminal,
  Settings,
  LogOut,
  Building,
  Mic,
  BookOpen,
  GraduationCap,
  TrendingUp,
  Award,
  Target,
  PlayCircle,
  Swords,
  Sparkles,
  Database,
  ChevronDown,
} from "lucide-react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { NODE_API_URL } from "@/config/api";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const coreItems = [
  {
    title: "Dashboard",
    url: "/app",
    icon: Home,
  },
  {
    title: "Placement Roadmap",
    url: "/app/roadmap",
    icon: Target,
  },
  {
    title: "AI Career Coach",
    url: "/app/coach",
    icon: Sparkles,
    badge: "AI",
  },
];

const navigationGroups = [
  {
    id: "coding",
    title: "Coding & DSA Arena",
    icon: Terminal,
    items: [
      {
        title: "Coding Arena",
        url: "/app/coding",
        icon: Terminal,
      },
      {
        title: "DSA Analysis",
        url: "/app/dsa",
        icon: Code2,
      },
      {
        title: "Placement Arena",
        url: "/app/arena",
        icon: Swords,
      },
      {
        title: "Study Library",
        url: "/app/library",
        icon: PlayCircle,
      },
    ],
  },
  {
    id: "interview",
    title: "Interview & Soft Skills",
    icon: BrainCog,
    items: [
      {
        title: "AI Mock Interview",
        url: "/app/interview",
        icon: BrainCog,
        badge: "AI",
      },
      {
        title: "Communication Lab",
        url: "/app/communication",
        icon: Mic,
      },
      {
        title: "HR Prep Hub",
        url: "/app/hr-prep",
        icon: BookOpen,
      },
      {
        title: "Resume Intelligence",
        url: "/app/resume",
        icon: FileText,
      },
    ],
  },
  {
    id: "academics",
    title: "Academics & Performance",
    icon: GraduationCap,
    items: [
      {
        title: "VTOP Sync & Marksheet",
        url: "/app/vtop",
        icon: Database,
        badge: "Sync",
      },
      {
        title: "Academics & Eligibility",
        url: "/app/academics",
        icon: GraduationCap,
      },
      {
        title: "Progress & Velocity",
        url: "/app/progress",
        icon: TrendingUp,
      },
      {
        title: "Milestones & Badges",
        url: "/app/milestones",
        icon: Award,
      },
    ],
  },
  {
    id: "career",
    title: "Jobs & Company Intel",
    icon: Briefcase,
    items: [
      {
        title: "Company Intelligence",
        url: "/app/company-intel",
        icon: Building,
      },
      {
        title: "Job Recommendations",
        url: "/app/job",
        icon: Briefcase,
      },
    ],
  },
];

const generalItems = [
  {
    title: "Profile",
    url: "/app/profile",
    icon: User,
  },
  {
    title: "Settings",
    url: "/app/profile",
    icon: Settings,
  },
];

export default function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Collapsible dropdown groups state
  const [openGroups, setOpenGroups] = useState({
    coding: true,
    interview: false,
    academics: false,
    career: false,
  });

  // Automatically open the dropdown group that contains the current active route
  useEffect(() => {
    navigationGroups.forEach((group) => {
      const hasActive = group.items.some((item) =>
        location.pathname === item.url || location.pathname.startsWith(item.url + "/")
      );
      if (hasActive) {
        setOpenGroups((prev) => ({ ...prev, [group.id]: true }));
      }
    });
  }, [location.pathname]);

  const toggleGroup = (groupId) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${NODE_API_URL}/api/users/logout`, {}, { withCredentials: true });
    } catch (err) {
      console.warn("Logout request failed:", err);
    } finally {
      navigate("/login");
    }
  };

  return (
    <div className="relative h-full select-none">
      <Sidebar className="bg-[#09090b] text-zinc-300 border-r border-zinc-800/80 h-full flex flex-col">
        <SidebarContent className="flex flex-col h-full overflow-hidden">
          {/* Logo */}
          <div className="flex items-center gap-2 px-5 py-5 mb-1 border-b border-zinc-800/60 shrink-0">
            <Link to="/app" className="flex items-center gap-2">
              <span className="font-bold text-white text-lg tracking-tight font-sans">
                get<span className="text-purple-400">Placed</span>
              </span>
            </Link>
          </div>

          {/* Scrollable Navigation Body */}
          <div className="flex-1 overflow-y-auto space-y-4 px-2 py-2">
            {/* Core Direct Links (Dashboard, Roadmap, Coach) */}
            <SidebarGroup className="p-0">
              <SidebarGroupLabel className="px-3 py-1.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest font-mono">
                Core Overview
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-0.5">
                  {coreItems.map((item) => {
                    const isActive =
                      item.url === "/app"
                        ? location.pathname === "/app"
                        : location.pathname === item.url || location.pathname.startsWith(item.url + "/");
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <Link
                            to={item.url}
                            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                              isActive
                                ? "bg-zinc-100 text-zinc-950 font-semibold shadow-sm"
                                : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <item.icon
                                className={`w-4 h-4 shrink-0 ${
                                  isActive ? "text-zinc-950" : "text-zinc-400"
                                }`}
                              />
                              <span className="truncate">{item.title}</span>
                            </div>
                            {item.badge && (
                              <span
                                className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
                                  isActive
                                    ? "bg-purple-600 text-white"
                                    : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Categorized Dropdown Groups */}
            <SidebarGroup className="p-0 space-y-2">
              <SidebarGroupLabel className="px-3 py-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest font-mono">
                Platform Modules
              </SidebarGroupLabel>

              <div className="space-y-1.5">
                {navigationGroups.map((group) => {
                  const isOpen = openGroups[group.id];
                  const hasActiveChild = group.items.some((item) =>
                    location.pathname === item.url || location.pathname.startsWith(item.url + "/")
                  );

                  return (
                    <div
                      key={group.id}
                      className="rounded-xl border border-white/[0.04] bg-zinc-950/40 overflow-hidden"
                    >
                      {/* Dropdown Header Trigger */}
                      <button
                        type="button"
                        onClick={() => toggleGroup(group.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                          hasActiveChild && !isOpen
                            ? "text-blue-400 bg-blue-500/10"
                            : "text-zinc-300 hover:text-white hover:bg-zinc-900/60"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <group.icon
                            className={`w-4 h-4 shrink-0 ${
                              hasActiveChild ? "text-blue-400" : "text-zinc-400"
                            }`}
                          />
                          <span className="truncate tracking-tight">{group.title}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-500">
                          {hasActiveChild && !isOpen && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                          )}
                          <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform duration-200 ${
                              isOpen ? "rotate-180 text-zinc-300" : "rotate-0 text-zinc-500"
                            }`}
                          />
                        </div>
                      </button>

                      {/* Dropdown Sub-Items */}
                      {isOpen && (
                        <div className="border-t border-white/[0.04] bg-zinc-900/20 px-2 py-1.5 space-y-0.5">
                          {group.items.map((subItem) => {
                            const isSubActive =
                              location.pathname === subItem.url ||
                              location.pathname.startsWith(subItem.url + "/");

                            return (
                              <Link
                                key={subItem.title}
                                to={subItem.url}
                                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                                  isSubActive
                                    ? "bg-zinc-100 text-zinc-950 font-semibold shadow-sm"
                                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80"
                                }`}
                              >
                                <div className="flex items-center gap-2.5 truncate">
                                  <subItem.icon
                                    className={`w-3.5 h-3.5 shrink-0 ${
                                      isSubActive ? "text-zinc-950" : "text-zinc-500"
                                    }`}
                                  />
                                  <span className="truncate">{subItem.title}</span>
                                </div>
                                {subItem.badge && (
                                  <span
                                    className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
                                      isSubActive
                                        ? "bg-purple-600 text-white"
                                        : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                    }`}
                                  >
                                    {subItem.badge}
                                  </span>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </SidebarGroup>

            {/* General Settings Menu */}
            <SidebarGroup className="pt-2 border-t border-zinc-800/60 p-0">
              <SidebarGroupLabel className="px-3 py-1.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest font-mono">
                Account Management
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-0.5">
                  {generalItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <Link
                            to={item.url}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                              isActive
                                ? "bg-zinc-100 text-zinc-950 font-semibold shadow-sm"
                                : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80"
                            }`}
                          >
                            <item.icon
                              className={`w-4 h-4 shrink-0 ${
                                isActive ? "text-zinc-950" : "text-zinc-400"
                              }`}
                            />
                            <span className="truncate">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>

          {/* Logout Footer */}
          <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/60 shrink-0">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer font-mono"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </SidebarContent>
      </Sidebar>
    </div>
  );
}

