import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, CheckCircle, Sparkles, BookOpen, Download, ExternalLink, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
    // Generate .ics event data for calendar export
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

  const handleTileSelect = (selectedDate) => {
    setDate(selectedDate);
  };

  return (
    <section id="calendar" className="py-20 md:py-32 bg-[#09090b] text-zinc-100 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-14 md:mb-18">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono uppercase tracking-wider mb-3">
            <CalendarIcon className="w-3.5 h-3.5 text-purple-400" /> Milestone Schedule
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight max-w-3xl text-white">
            Preparation Timeline & Milestones
          </h2>
          <p className="mt-3 text-zinc-400 text-sm md:text-base max-w-xl">
            Track daily problem sets, mock interviews, and milestones in a unified schedule.
          </p>
        </div>

        {/* Content Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Calendar Card (6 Cols) */}
          <motion.div 
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className="lg:col-span-6 rounded-2xl bg-zinc-900/50 p-6 md:p-7 border border-zinc-800 flex flex-col items-center justify-center"
          >
            <div className="flex items-center gap-2 text-zinc-300 mb-5 text-xs font-mono font-semibold uppercase tracking-wider">
              <CalendarIcon className="w-3.5 h-3.5 text-purple-400" /> Calendar
            </div>
            
            <div className="w-full flex justify-center">
              <Calendar
                onChange={handleTileSelect}
                value={date}
                className="crazy-calendar"
                tileClassName="crazy-tile"
              />
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
              <div className="inline-flex items-center gap-1.5 bg-zinc-950 px-3.5 py-1.5 rounded-lg border border-zinc-800 text-xs text-zinc-400 font-mono">
                <span>Selected:</span>
                <span className="font-semibold text-zinc-200">{date.toDateString()}</span>
              </div>
              <button
                onClick={() => navigate("/app/roadmap")}
                className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs text-zinc-200 font-medium flex items-center gap-1.5 transition cursor-pointer"
              >
                <span>Full Roadmap</span>
                <ExternalLink className="w-3 h-3 text-zinc-400" />
              </button>
            </div>
          </motion.div>

          {/* Daily Milestone Cards (6 Cols) */}
          <div className="lg:col-span-6 space-y-3">
            <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>SCHEDULED MODULES</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400" /> Active Session
              </span>
            </div>

            {upcomingModules.map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ x: 2 }}
                transition={{ duration: 0.15 }}
                onClick={() => navigate(item.route)}
                className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 flex items-center justify-between cursor-pointer group transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 group-hover:text-white transition-colors">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-mono text-zinc-400 mb-0.5">{item.time} · {item.type}</div>
                    <div className="font-semibold text-white text-xs md:text-sm group-hover:text-purple-300 transition-colors">{item.title}</div>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  <span>{item.status}</span>
                </div>
              </motion.div>
            ))}

            <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 mt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-300">
                <div>
                  <span className="font-semibold block text-white">Calendar Synchronization</span>
                  <span className="text-xs text-zinc-400">Export milestones to iCal, Google, or Outlook.</span>
                </div>
                <button
                  onClick={handleConnectSync}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-100 text-zinc-950 hover:bg-white font-semibold text-xs transition cursor-pointer shrink-0"
                >
                  {synced ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                  <span>{synced ? "Exported (.ics)" : "Export (.ics)"}</span>
                </button>
              </div>
              {syncNotice && (
                <div className="mt-3 text-xs text-emerald-400 font-mono bg-emerald-500/10 p-2 rounded border border-emerald-500/20">
                  {syncNotice}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CrazyCalendar;
