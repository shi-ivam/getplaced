import React from 'react';
import { ChevronRight, BookOpen, Code } from 'lucide-react';

export const TopicCard = ({ topic, onClick }) => {
  const completedLectures = topic.lectures.filter(l => l.completed).length;
  const completedAssignments = topic.assignments.filter(a => a.completed).length;
  
  return (
    <div 
      onClick={onClick}
      className="bg-[#121215] rounded-xl p-5 cursor-pointer hover:bg-[#16161a] transition-all border border-zinc-800/80 hover:border-zinc-700 space-y-3"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-base font-semibold text-zinc-100">{topic.title}</h3>
        <ChevronRight className="w-4 h-4 text-zinc-500" />
      </div>
      <p className="text-zinc-400 text-xs leading-relaxed">{topic.description}</p>
      <div className="flex items-center gap-4 pt-1 text-xs font-mono text-zinc-400 border-t border-zinc-800/60">
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
          <span>{completedLectures}/{topic.lectures.length} lectures</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Code className="w-3.5 h-3.5 text-zinc-500" />
          <span>{completedAssignments}/{topic.assignments.length} assignments</span>
        </div>
      </div>
    </div>
  );
};