import React from 'react';
import { ChevronRight, BookOpen, Code } from 'lucide-react';

export const TopicCard = ({ topic, onClick }) => {
  const completedLectures = topic.lectures.filter(l => l.completed).length;
  const completedAssignments = topic.assignments.filter(a => a.completed).length;
  
  return (
    <div 
      onClick={onClick}
      className="group bg-white rounded-2xl p-5 cursor-pointer border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] hover:shadow-[6px_6px_0_0_#0D0431] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all space-y-3"
    >
      <div className="flex justify-between items-start gap-3">
        <h3 className="font-heading font-black text-base text-[#0D0431] group-hover:text-[#896EE2] transition-colors leading-snug">
          {topic.title}
        </h3>
        <div className="w-7 h-7 rounded-lg bg-[#FEDF6A] border-2 border-[#0D0431] flex items-center justify-center text-[#0D0431] shadow-[2px_2px_0_0_#0D0431] shrink-0 group-hover:scale-105 transition-transform">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
      <p className="text-[#0D0431]/75 text-xs leading-relaxed font-sans font-medium">{topic.description}</p>
      <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono font-bold text-[#0D0431] border-t-2 border-[#0D0431]/15">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#E4CDFB] border-2 border-[#0D0431] text-[11px] font-mono font-bold shadow-[2px_2px_0_0_#0D0431]">
          <BookOpen className="w-3.5 h-3.5 text-[#0D0431]" />
          <span>{completedLectures}/{topic.lectures.length} lectures</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#D4FDF7] border-2 border-[#0D0431] text-[11px] font-mono font-bold shadow-[2px_2px_0_0_#0D0431]">
          <Code className="w-3.5 h-3.5 text-[#0D0431]" />
          <span>{completedAssignments}/{topic.assignments.length} assignments</span>
        </div>
      </div>
    </div>
  );
};