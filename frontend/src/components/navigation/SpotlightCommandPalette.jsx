import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Code2,
  FileText,
  Briefcase,
  Layers,
  GraduationCap,
  Sparkles,
  Swords,
  Target,
  User,
  Compass,
  ArrowRight,
  FolderGit2,
  X,
} from "lucide-react";

const SEARCH_ITEMS = [
  { id: "dashboard", title: "Placement Dashboard", category: "Navigation", url: "/app", icon: Target, keywords: "overview metrics stats readiness" },
  { id: "roadmap", title: "Placement Roadmap", category: "Navigation", url: "/app/roadmap", icon: Target, keywords: "timeline milestones steps" },
  { id: "coach", title: "AI Career Coach", category: "AI Assistant", url: "/app/coach", icon: Sparkles, keywords: "assistant mentor chat advice" },
  { id: "coding", title: "Coding Workspace IDE", category: "Prepare", url: "/app/coding", icon: Code2, keywords: "leetcode problems editor python js cpp" },
  { id: "sheets", title: "DSA Curriculum Sheets", category: "Prepare", url: "/app/sheets", icon: Layers, keywords: "striver tuf blind75 neetcode" },
  { id: "resume", title: "AI Resume ATS Analyzer", category: "Prepare", url: "/app/resume", icon: FileText, keywords: "cv review score keywords formatting" },
  { id: "interview", title: "Mock Interview Simulator", category: "Prepare", url: "/app/interview", icon: Sparkles, keywords: "speech biometric answers questions" },
  { id: "hr-prep", title: "HR Behavioral Prep", category: "Prepare", url: "/app/hr-prep", icon: Sparkles, keywords: "behavioral leadership star method" },
  { id: "jobs", title: "Tech Jobs Market", category: "Applications", url: "/app/jobs", icon: Briefcase, keywords: "openings hiring ctc salary companies" },
  { id: "can-i-apply", title: "Can I Apply? Eligibility Check", category: "Applications", url: "/app/can-i-apply", icon: Compass, keywords: "criteria cutoff cgpa arrears backlogs" },
  { id: "role-fit", title: "Which Role Fits Me?", category: "Applications", url: "/app/role-fit", icon: Compass, keywords: "sde frontend backend ai data ml" },
  { id: "academics", title: "Academics Analytics", category: "Academics", url: "/app/academics", icon: GraduationCap, keywords: "cgpa sgpa target calculator credits" },
  { id: "vtop", title: "VTOP Academic Live Sync", category: "Academics", url: "/app/vtop", icon: GraduationCap, keywords: "vit attendance grades marks faculty" },
  { id: "profile", title: "Candidate Profile", category: "Account", url: "/app/profile", icon: User, keywords: "account settings target company role" },
];

export default function SpotlightCommandPalette({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredItems = query.trim()
    ? SEARCH_ITEMS.filter((item) => {
        const q = query.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.keywords.toLowerCase().includes(q)
        );
      })
    : SEARCH_ITEMS;

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
      } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
        e.preventDefault();
        navigate(filteredItems[selectedIndex].url);
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, navigate, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#17103D]/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-[0_20px_50px_rgba(23,16,61,0.18)] border border-[#E2DEEC] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#E2DEEC] bg-[#F8F8F5]/50 gap-3">
          <Search className="w-4 h-4 text-[#6F6A80] shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search platform, tools, problem sheets, or companies... (Esc to close)"
            autoFocus
            className="w-full bg-transparent text-sm font-medium text-[#17103D] placeholder-[#6F6A80]/60 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#6F6A80] hover:bg-[#E2DEEC]/50 hover:text-[#17103D] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-sm text-[#6F6A80]">
              No matching tools or pages found for "{query}".
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(item.url);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-sm transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#17103D] text-white shadow-sm"
                      : "text-[#17103D] hover:bg-[#F2F0FA]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-white/15 text-white"
                          : "bg-[#F2F0FA] text-[#17103D]"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="font-semibold truncate">{item.title}</div>
                      <div
                        className={`text-xs truncate ${
                          isSelected ? "text-white/70" : "text-[#6F6A80]"
                        }`}
                      >
                        {item.category}
                      </div>
                    </div>
                  </div>
                  <ArrowRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected
                        ? "text-white translate-x-0.5"
                        : "text-[#6F6A80]/40 opacity-0"
                    }`}
                  />
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-[#E2DEEC] bg-[#F8F8F5] flex items-center justify-between text-[11px] text-[#6F6A80] font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
          <span>GetPlaced Quick Search</span>
        </div>
      </div>
    </div>
  );
}
