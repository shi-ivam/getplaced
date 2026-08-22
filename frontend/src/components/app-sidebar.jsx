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
  FolderGit2,
  GitFork,
  Globe,
  Layers,
  ShieldCheck,
  Compass,
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
    title: "Overview",
    url: "/app",
    icon: Home,
  },
  {
    title: "Roadmap",
    url: "/app/roadmap",
    icon: Target,
  },
  {
    title: "Career Coach",
    url: "/app/coach",
    icon: Sparkles,
    badge: "AI",
  },
];

const navigationGroups = [
  {
    id: "coding",
    title: "Coding & Problems",
    icon: Terminal,
    items: [
      {
        title: "Workspace",
        url: "/app/coding",
        icon: Terminal,
      },
      {
        title: "Study Sheets",
        url: "/app/sheets",
        icon: Layers,
        badge: "28 Lists",
      },
      {
        title: "DSA Analytics",
        url: "/app/dsa",
        icon: Code2,
      },
      {
        title: "Contest Arena",
        url: "/app/arena",
        icon: Swords,
      },
    ],
  },
  {
    id: "development",
    title: "Projects & Code",
    icon: FolderGit2,
    items: [
      {
        title: "Workspace",
        url: "/app/development",
        icon: FolderGit2,
      },
      {
        title: "Repositories",
        url: "/app/development?tab=projects",
        icon: GitFork,
      },
      {
        title: "Deployments",
        url: "/app/development?tab=deployment",
        icon: Globe,
      },
    ],
  },
  {
    id: "interview",
    title: "Interview Prep",
    icon: BrainCog,
    items: [
      {
        title: "Mock Interview",
        url: "/app/interview",
        icon: BrainCog,
        badge: "AI",
      },
      {
        title: "HR & Behavioral",
        url: "/app/hr-prep",
        icon: BookOpen,
      },
      {
        title: "Company Intel",
        url: "/app/company-intel",
        icon: Building,
      },
      {
        title: "Resume ATS",
        url: "/app/resume",
        icon: FileText,
      },
    ],
  },
  {
    id: "academics",
    title: "Academic Progress",
    icon: GraduationCap,
    items: [
      {
        title: "VTOP Sync",
        url: "/app/vtop",
        icon: Database,
        badge: "Sync",
      },
      {
        title: "Eligibility",
        url: "/app/academics",
        icon: GraduationCap,
      },
      {
        title: "Progress Tracker",
        url: "/app/progress",
        icon: TrendingUp,
      },
      {
        title: "Milestones",
        url: "/app/milestones",
        icon: Award,
      },
    ],
  },
  {
    id: "career",
    title: "Jobs & Applications",
    icon: Briefcase,
    items: [
      {
        title: "Role Fit Assessment",
        url: "/app/role-fit",
        icon: Compass,
        badge: "Fit",
      },
      {
        title: "Job Listings",
        url: "/app/job",
        icon: Briefcase,
      },
      {
        title: "Application Eligibility",
        url: "/app/can-i-apply",
        icon: ShieldCheck,
        badge: "Check",
      },
      {
        title: "Company Dossiers",
        url: "/app/company-intel",
        icon: Building,
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
    coding: false,
    development: false,
    interview: false,
    academics: false,
    career: false,
  });

  // Automatically open the dropdown group that contains the current active route
  useEffect(() => {
    navigationGroups.forEach((group) => {
      const hasActive = group.items.some((item) => {
        const itemUrl = item.url.split("?")[0];
        return location.pathname === itemUrl || location.pathname.startsWith(itemUrl + "/");
      });
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
            {/* Core Overview */}
            <SidebarGroup className="p-0">
              <SidebarGroupLabel className="px-3 py-1.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest font-mono">
                Overview
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
                Navigation
              </SidebarGroupLabel>

              <div className="space-y-1.5">
                {navigationGroups.map((group) => {
                  const isOpen = openGroups[group.id];
                  const hasActiveChild = group.items.some((item) => {
                    const itemUrl = item.url.split("?")[0];
                    return (
                      location.pathname === itemUrl || location.pathname.startsWith(itemUrl + "/")
                    );
                  });

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
                            ? "text-purple-400 bg-purple-500/10"
                            : "text-zinc-300 hover:text-white hover:bg-zinc-900/60"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <group.icon
                            className={`w-4 h-4 shrink-0 ${
                              hasActiveChild ? "text-purple-400" : "text-zinc-400"
                            }`}
                          />
                          <span className="truncate tracking-tight">{group.title}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-500">
                          {hasActiveChild && !isOpen && (
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
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
                            const subItemPath = subItem.url.split("?")[0];
                            const isSubActive =
                              location.pathname === subItemPath ||
                              location.pathname.startsWith(subItemPath + "/");

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
                Account
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
          <div className="p-3 border-t border-zinc-800/80 bg-zinc-900/40 shrink-0">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer font-mono"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </SidebarContent>
      </Sidebar>
    </div>
  );
}
