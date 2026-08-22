import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, Clock, CheckCircle, Sparkles, BookOpen } from "lucide-react";
import "./customCalendar.css";

const upcomingModules = [
  { time: "09:00 AM", title: "Graph Algorithms & Topological Sort", type: "DSA Prep", status: "Scheduled" },
  { time: "02:30 PM", title: "System Design: Distributed Rate Limiter", type: "AI Mock", status: "Upcoming" },
  { time: "06:00 PM", title: "Behavioral STAR Method Review", type: "AI Telemetry", status: "Pending" }
];

const CrazyCalendar = () => {
  const [date, setDate] = useState(new Date());

  return (
    <section id="calendar" className="py-24 md:py-36 bg-[#1A312C] text-[#FFF4E1] relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#428475]/15 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#428475]/25 border border-[#89D7B7]/30 text-[#89D7B7] text-xs font-mono uppercase tracking-widest mb-4">
            <CalendarIcon className="w-3.5 h-3.5 text-[#89D7B7]" /> Automated Schedule
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl text-[#FFF4E1]">
            Structured Placement Preparation Roadmap
          </h2>
          <p className="mt-4 text-[#FFF4E1]/75 text-base md:text-lg max-w-2xl">
            Synchronize mock interview milestones, daily DSA challenges, and resume reviews in one unified calendar.
          </p>
        </div>

        {/* Content Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Calendar Card (6 Cols) */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
            className="lg:col-span-6 rounded-3xl bg-gradient-to-b from-[#1E3A34] to-[#12221e] p-6 md:p-8 border border-[#428475]/40 shadow-2xl flex flex-col items-center justify-center"
          >
            <div className="flex items-center gap-2 text-[#89D7B7] mb-6 text-sm font-semibold uppercase tracking-wider">
              <CalendarIcon className="w-4 h-4 text-[#89D7B7]" /> Select Milestone Date
            </div>
            
            <div className="w-full flex justify-center">
              <Calendar
                onChange={setDate}
                value={date}
                className="crazy-calendar"
                tileClassName="crazy-tile"
              />
            </div>

            <div className="mt-6 inline-flex items-center gap-2 bg-[#428475]/30 px-5 py-2 rounded-full border border-[#89D7B7]/40 text-xs text-[#89D7B7] font-mono">
              <span>Active Target:</span>
              <span className="font-bold text-[#FFF4E1]">{date.toDateString()}</span>
            </div>
          </motion.div>

          {/* Daily Milestone Cards (6 Cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="text-xs font-mono text-[#FFF4E1]/65 uppercase tracking-widest mb-2 flex items-center justify-between">
              <span>DAILY PREPARATION TIMELINE</span>
              <span className="text-[#89D7B7] font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#89D7B7]" /> AI Synced
              </span>
            </div>

            {upcomingModules.map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ x: 6 }}
                transition={{ duration: 0.2 }}
                className="p-5 rounded-2xl bg-[#152824] border border-[#428475]/35 hover:border-[#89D7B7]/50 shadow-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#428475]/25 border border-[#428475]/40 flex items-center justify-center text-[#89D7B7]">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-mono text-[#89D7B7] mb-0.5">{item.time} &bull; {item.type}</div>
                    <div className="font-bold text-[#FFF4E1] text-sm md:text-base">{item.title}</div>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#89D7B7] font-mono bg-[#89D7B7]/15 px-3 py-1 rounded-full border border-[#89D7B7]/30">
                  <CheckCircle className="w-3.5 h-3.5 text-[#89D7B7]" />
                  <span>{item.status}</span>
                </div>
              </motion.div>
            ))}

            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#1A312C] to-[#428475]/40 border border-[#89D7B7]/30 mt-4">
              <div className="flex items-center justify-between text-xs text-[#FFF4E1]/90 font-medium">
                <span>Integrated Google & Outlook Calendar Sync</span>
                <button className="text-xs text-[#89D7B7] hover:text-[#FFF4E1] font-semibold underline underline-offset-4 cursor-pointer">
                  Connect Sync
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CrazyCalendar;
