import React from 'react';
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
} from "lucide-react";
import axios from "axios";
import { Link, useLocation, useNavigate } from 'react-router-dom';
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

const mainItems = [
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
    title: "AI Mock Interview",
    url: "/app/interview",
    icon: BrainCog,
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
  {
    title: "Study Library",
    url: "/app/library",
    icon: PlayCircle,
  },
  {
    title: "Placement Arena",
    url: "/app/arena",
    icon: Swords,
  },
  {
    title: "Resume Intelligence",
    url: "/app/resume",
    icon: FileText,
  },
  {
    title: "HR Prep Hub",
    url: "/app/hr-prep",
    icon: BookOpen,
  },
  {
    title: "Communication Lab",
    url: "/app/communication",
    icon: Mic,
  },
  {
    title: "Company Intelligence",
    url: "/app/company-intel",
    icon: Building,
  },
  {
    title: "AI Career Coach",
    url: "/app/coach",
    icon: Sparkles,
  },
  {
    title: "Job Recommendations",
    url: "/app/job",
    icon: Briefcase,
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
        <SidebarContent className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 px-5 py-5 mb-1 border-b border-zinc-800/60">
            <Link to="/app" className="flex items-center gap-2">
              <span className="font-bold text-white text-lg tracking-tight font-sans">
                get<span className="text-purple-400">Placed</span>
              </span>
            </Link>
          </div>

          {/* Main menu */}
          <SidebarGroup className="py-2">
            <SidebarGroupLabel className="px-5 py-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest font-mono">
              Platform Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-0.5 px-2">
                {mainItems.map((item) => {
                  const isActive =
                    item.url === "/app"
                      ? location.pathname === "/app"
                      : location.pathname === item.url || location.pathname.startsWith(item.url + "/");
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link
                          to={item.url}
                          className={`flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                            isActive
                              ? "bg-zinc-100 text-zinc-950 font-semibold shadow-sm"
                              : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
                          }`}
                        >
                          <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-zinc-950" : "text-zinc-400"}`} />
                          <span className="truncate">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* General menu */}
          <SidebarGroup className="mt-2 border-t border-zinc-800/60 pt-2">
            <SidebarGroupLabel className="px-5 py-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest font-mono">
              Account Management
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-0.5 px-2">
                {generalItems.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link
                          to={item.url}
                          className={`flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                            isActive
                              ? "bg-zinc-100 text-zinc-950 font-semibold shadow-sm"
                              : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
                          }`}
                        >
                          <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-zinc-950" : "text-zinc-400"}`} />
                          <span className="truncate">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Spacer */}
          <div className="flex-grow" />

          {/* Logout button */}
          <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/40">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer font-mono"
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

