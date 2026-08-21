import React from 'react';
import {
  Calendar,
  Home,
  User,
  Briefcase,
  FileText,
  BrainCog,
  Code2,
  Terminal,
  Settings,
  HelpCircle,
  LogOut,
  GraduationCap,
  TrendingUp,
  Award,
  Target,
  PlayCircle,
  Swords,
  Sparkles,
} from "lucide-react";

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
    title: "Resume Analyzer",
    url: "/app/resume",
    icon: FileText,
  },
  {
    title: "AI Career Coach",
    url: "/app/coach",
    icon: Sparkles,
  },
  {
    title: "Job Recommendation",
    url: "/app/job",
    icon: Briefcase,
  },
];

import { Link, useLocation } from 'react-router-dom';

const generalItems = [
  {
    title: "Profile",
    url: "/app/profile",
    icon: User,
  },
  {
    title: "Setting",
    url: "#",
    icon: Settings,
  },
];

export default function AppSidebar() {
  const location = useLocation();
  return (
    <div className="relative h-full">
      <Sidebar className="bg-[#121212] text-gray-300 border-r border-gray-800 h-full flex flex-col">
        <SidebarContent className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 px-4 py-4 mb-2">
            <span className="font-bold text-white text-lg tracking-tight bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              getPlaced
            </span>
          </div>
          
          {/* Main menu */}
          <SidebarGroup>
            <SidebarGroupLabel className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                    <Link
                         to={item.url}
                         className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
                           location.pathname === item.url || (item.url !== "/app" && location.pathname.startsWith(item.url))
                             ? "bg-purple-600 text-white font-medium shadow-sm" 
                             : "hover:bg-gray-800 hover:text-white text-gray-300"
                         } transition-all`}
                       >
                        <item.icon className="w-4 h-4" />
                        <span className="text-xs font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          
          {/* General menu */}
          <SidebarGroup className="mt-2">
            <SidebarGroupLabel className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Account
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {generalItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      {item.url.startsWith("/") ? (
                        <Link
                          to={item.url}
                          className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
                            location.pathname === item.url
                              ? "bg-purple-600 text-white"
                              : "hover:bg-gray-800 hover:text-white"
                          } transition-all`}
                        >
                          <item.icon className="w-4 h-4 text-gray-400" />
                          <span className="text-xs">{item.title}</span>
                        </Link>
                      ) : (
                        <a
                          href={item.url}
                          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 hover:text-white transition-all"
                        >
                          <item.icon className="w-4 h-4 text-gray-400" />
                          <span className="text-xs">{item.title}</span>
                        </a>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          
          {/* Dotted pattern background */}
          <div className="relative flex-grow overflow-hidden">
            <div className="absolute inset-0 opacity-40" 
                 style={{
                   backgroundImage: 'radial-gradient(circle, #444 1px, transparent 1px)',
                   backgroundSize: '12px 12px'
                 }} />
          </div>
          
          {/* Logout button */}
          <div className="mt-auto mb-4 px-4">
            <a
              href="#"
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-xs">Log Out</span>
            </a>
          </div>
        </SidebarContent>
      </Sidebar>
    </div>
  );
}
