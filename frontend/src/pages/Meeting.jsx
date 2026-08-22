import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, Clock, CheckCircle2, Sparkles, BookOpen, Download, ExternalLink, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CaideBadge from "@/components/caide/CaideBadge";
import CaideCard from "@/components/caide/CaideCard";
import CaideButton from "@/components/caide/CaideButton";
import "./customCalendar.css";

const upcomingModules = [
  { time: "09:00 AM", title: "Graph Algorithms & Topological Sort", type: "DSA Prep", status: "Scheduled", route: "/app/dsa" },
  { time: "02:30 PM", title: "System Design: Distributed Rate Limiter", type: "Interview", status: "Upcoming", route: "/app/interview" },
  { time: "06:00 PM", title: "Behavioral STAR Method Review", type: "Behavioral", status: "Pending", route: "/app/hr-prep" }
];

const CrazyCalendar = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date());
  const [synced, setSynced] = useState(false);
  const [syncNotice, setSyncNotice] = useState("");

  const handleConnectSync = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//getPlaced Platform//Placement Roadmap Calendar//EN
BEGIN:VEVENT
SUMMARY:getPlaced Daily Placement Roadmap & AI Mock Interview
DESCRIPTION:Synchronized Placement Preparation Roadmap session.
DTSTART:${date.toISOString().replace(/-|:|\.\d+/g, "")}
DURATION:PT1H
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", `getPlaced-Schedule-${date.toISOString().split("T")[0]}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSynced(true);
    setSyncNotice("iCal schedule exported successfully.");
    setTimeout(() => setSyncNotice(""), 4000);
  };

  return (
    <section id="calendar" className="py-24 md:py-32 bg-[#CDE1FF] u-background-grid-dark-4 text-[#0D0431] relative overflow-hidden border-b-2 border-[#0D0431]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <CaideBadge theme="light-purple">
            Effortless Milestones
          </CaideBadge>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-heading font-black tracking-tight max-w-4xl text-[#0D0431] mt-4">
            Structured Preparation Calendar
          </h2>
          <p className="mt-4 text-[#0D0431]/80 text-base md:text-lg max-w-2xl font-sans">
            Never miss a practice round or contest deadline. Coordinate daily problem targets, mock interviews, and company application timelines in one place.
          </p>
        </div>

        {/* Content Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Calendar Bento Card (6 Cols) */}
          <div className="lg:col-span-6">
            <CaideCard
              theme="white"
              shadow="lg"
              className="p-6 md:p-8 flex flex-col items-center justify-between h-full"
            >
              <div className="w-full flex items-center justify-between pb-4 mb-4 border-b-2 border-[#0D0431]">
                <div className="flex items-center gap-2 font-heading font-bold text-sm text-[#0D0431]">
                  <CalendarIcon className="w-4 h-4 text-[#896EE2]" />
                  <span>Milestone Calendar</span>
                </div>
                <span className="font-mono text-xs font-bold text-[#0D0431] bg-[#FEDF6A] px-3 py-0.5 rounded-full border border-[#0D0431]">
                  SYNCED
                </span>
              </div>
              
              <div className="w-full flex justify-center py-2">
                <Calendar
                  onChange={(d) => setDate(d)}
                  value={date}
                  className="crazy-calendar border-2 border-[#0D0431] rounded-2xl p-4 shadow-[4px_4px_0_0_#0D0431]"
                  tileClassName="crazy-tile"
                />
              </div>

              <div className="mt-6 w-full flex flex-wrap items-center justify-between gap-3 pt-4 border-t-2 border-[#0D0431]">
                <div className="inline-flex items-center gap-2 bg-[#FEF9CF] px-4 py-2 rounded-xl border-2 border-[#0D0431] text-xs text-[#0D0431] font-mono shadow-[2px_2px_0_0_#0D0431]">
                  <span className="font-bold">Selected:</span>
                  <span className="font-semibold">{date.toDateString()}</span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/app/roadmap")}
                  className="btn_secondary_wrap is-small"
                >
                  <span>Full Roadmap</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </button>
              </div>
            </CaideCard>
          </div>

          {/* Daily Milestone Cards (6 Cols) */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between text-xs font-bold font-mono uppercase tracking-wider text-[#0D0431]">
              <span>DAILY ITINERARY</span>
              <span className="text-[#0D0431] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#896EE2]" /> 3 Tasks Scheduled
              </span>
            </div>

            <div className="space-y-3">
              {upcomingModules.map((item, idx) => (
                <CaideCard
                  key={idx}
                  theme="white"
                  shadow="sm"
                  hoverEffect={true}
                  onClick={() => navigate(item.route)}
                  className="p-5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#FEF9CF] border-2 border-[#0D0431] flex items-center justify-center text-[#0D0431] shadow-[2px_2px_0_0_#0D0431] shrink-0">
                      <BookOpen className="w-5 h-5 text-[#896EE2]" />
                    </div>
                    <div>
                      <div className="text-xs font-mono font-bold text-[#896EE2] mb-0.5">{item.time} • {item.type}</div>
                      <div className="font-heading font-bold text-[#0D0431] text-sm md:text-base">{item.title}</div>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[#0D0431] bg-[#D4FDF7] px-3 py-1 rounded-full border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0D0431]" />
                    <span>{item.status}</span>
                  </div>
                </CaideCard>
              ))}
            </div>

            <CaideCard
              theme="light-yellow"
              shadow="default"
              className="p-6 mt-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-heading font-bold text-sm text-[#0D0431]">
                    Calendar Sync & Export
                  </h4>
                  <p className="text-xs text-[#0D0431]/75 font-medium mt-0.5">
                    Export your custom interview schedule to Apple Calendar, Google Calendar, or Outlook.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleConnectSync}
                  className="btn_secondary_wrap is-small shrink-0"
                >
                  {synced ? <Check className="w-3.5 h-3.5 mr-1" /> : <Download className="w-3.5 h-3.5 mr-1" />}
                  <span>{synced ? "Exported (.ics)" : "Export (.ics)"}</span>
                </button>
              </div>
              {syncNotice && (
                <div className="mt-3 text-xs font-bold text-[#0D0431] bg-white p-2.5 rounded-lg border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431]">
                  {syncNotice}
                </div>
              )}
            </CaideCard>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CrazyCalendar;
