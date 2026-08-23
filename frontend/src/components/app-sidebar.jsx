import React, { useState, useEffect } from "react";
import {
  Home,
  User,
  Briefcase,
  FileText,
  Code2,
  Terminal,
  GraduationCap,
  Target,
  Sparkles,
  Layers,
  FolderGit2,
  Compass,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Building2,
  HelpCircle,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
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

const NAV_SECTIONS = [
  {
    label: "Main",
    items: [
      { title: "Overview", url: "/app", icon: Home },
      { title: "Career Roadmap", url: "/app/roadmap", icon: Target },
      { title: "Career Coach", url: "/app/coach", icon: Sparkles, badge: "AI" },
    ],
  },
  {
    label: "Prepare",
    items: [
      { title: "Coding IDE", url: "/app/coding", icon: Terminal },
      { title: "Study Sheets", url: "/app/sheets", icon: Layers, badge: "28" },
      { title: "Dev Projects", url: "/app/development", icon: FolderGit2 },
      { title: "Resume ATS", url: "/app/resume", icon: FileText },
      { title: "Interview Prep", url: "/app/interview", icon: Sparkles },
    ],
  },
  {
    label: "Applications",
    items: [
      { title: "Jobs Market", url: "/app/jobs", icon: Briefcase },
      { title: "Role Fit AI", url: "/app/role-fit", icon: Compass },
      { title: "Can I Apply?", url: "/app/can-i-apply", icon: ShieldCheck },
    ],
  },
  {
    label: "Academics",
    items: [
      { title: "Academics", url: "/app/academics", icon: GraduationCap },
      { title: "VTOP Sync", url: "/app/vtop", icon: GraduationCap, badge: "Live" },
    ],
  },
  {
    label: "Account",
    items: [
      { title: "Candidate Profile", url: "/app/profile", icon: User },
    ],
  },
];

export default function AppSidebar({ className = "" }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Candidate");
  const [targetCompany, setTargetCompany] = useState("");

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
        if (res.data?.targetCompany) setTargetCompany(res.data.targetCompany);
      })
      .catch(() => {});
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await axios.post(`${NODE_API_URL}/api/users/logout`, {}, { withCredentials: true });
      localStorage.removeItem("getplaced_token");
      localStorage.removeItem("getplaced_user");
      navigate("/login");
    } catch (err) {
      console.warn("Logout note:", err);
      localStorage.removeItem("getplaced_token");
      localStorage.removeItem("getplaced_user");
      navigate("/login");
    }
  };

  const isCurrentActive = (url) => {
    if (url === "/app") {
      return location.pathname === "/app";
    }
    return location.pathname.startsWith(url);
  };

  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "GP";

  return (
    <Sidebar
      className={`border-r border-[#E2DEEC] bg-[#FFFFFF] text-[#17103D] w-[235px] shrink-0 ${className}`}
    >
      <SidebarContent className="flex flex-col justify-between h-full bg-white px-3 py-3.5">
        <div className="space-y-4">
          {/* 1. Platform Brand Header */}
          <Link
            to="/app"
            className="flex items-center gap-2.5 px-2 py-1 group transition-all"
          >
            <div className="w-8 h-8 rounded-xl bg-[#17103D] flex items-center justify-center text-[#FFD84D] font-black text-sm shadow-sm group-hover:bg-[#24195A] transition-colors">
              GP
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-black text-base tracking-tight text-[#17103D] leading-none">
                GetPlaced
              </span>
              <span className="text-[10px] text-[#6F6A80] font-medium tracking-wide">
                Career Operating System
              </span>
            </div>
          </Link>

          {/* 2. CANDIDATE PROFILE AT THE TOP */}
          <Link
            to="/app/profile"
            className="flex items-center gap-2.5 p-2 rounded-2xl bg-[#F8F8F5] hover:bg-[#F2F0FA] border border-[#E2DEEC] transition-all group shadow-sm"
          >
            <div className="w-8 h-8 rounded-full bg-[#17103D] text-[#FFD84D] flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-[#17103D] truncate group-hover:text-[#6E44FF] transition-colors">
                {userName}
              </div>
              <div className="text-[10px] text-[#6F6A80] truncate flex items-center gap-1">
                <span>{targetCompany ? `${targetCompany} Target` : "Candidate Profile"}</span>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-[#6F6A80]/70 group-hover:text-[#17103D] group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>

          {/* 3. Systematic Navigation Groups */}
          <div className="space-y-4 pt-1">
            {NAV_SECTIONS.map((section) => (
              <SidebarGroup key={section.label} className="p-0 space-y-1">
                <SidebarGroupLabel className="px-2 text-[10px] font-semibold uppercase tracking-wider text-[#6F6A80]/80 h-auto py-0.5">
                  {section.label}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-0.5">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const active = isCurrentActive(item.url);

                      return (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                            asChild
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                              active
                                ? "bg-[#17103D] text-white font-semibold shadow-sm"
                                : "text-[#17103D]/80 hover:text-[#17103D] hover:bg-[#F2F0FA]"
                            }`}
                          >
                            <Link to={item.url} className="flex items-center gap-2.5">
                              <Icon
                                className={`w-4 h-4 shrink-0 ${
                                  active ? "text-[#FFD84D]" : "text-[#6F6A80]"
                                }`}
                              />
                              <span className="truncate">{item.title}</span>
                              {item.badge && (
                                <span
                                  className={`ml-auto text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                                    active
                                      ? "bg-white/20 text-white"
                                      : "bg-[#EFEAFF] text-[#6E44FF]"
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
            ))}
          </div>
        </div>

        {/* Footer Logout Action */}
        <div className="pt-3 border-t border-[#E2DEEC] px-1">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium text-[#6F6A80] hover:text-[#C7382B] hover:bg-[#FFE8E5]/50 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
