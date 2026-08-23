import React from 'react';
import { ExternalLink, CheckCircle } from 'lucide-react';

export const AssignmentList = ({ assignments, onToggleComplete }) => {
  return (
    <div className="space-y-3">
      {assignments.map(assignment => {
        const diffLower = (assignment.difficulty || '').toLowerCase();
        const diffBadgeStyle =
          diffLower === 'easy'
            ? 'bg-[#D3F8C6] text-[#0D0431] border-2 border-[#0D0431]'
            : diffLower === 'medium'
            ? 'bg-[#FEDF6A] text-[#0D0431] border-2 border-[#0D0431]'
            : 'bg-[#FFC5B7] text-[#0D0431] border-2 border-[#0D0431]';

        return (
          <div
            key={assignment.id}
            className="group bg-white p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] hover:shadow-[6px_6px_0_0_#0D0431] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
          >
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="font-heading font-black text-sm text-[#0D0431] group-hover:text-[#896EE2] transition-colors">
                  {assignment.title}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold shadow-[1px_1px_0_0_#0D0431] ${diffBadgeStyle}`}>
                  {assignment.difficulty}
                </span>
              </div>
              <p className="text-[#0D0431]/70 text-xs mt-1 font-mono font-semibold">
                Platform: <span className="text-[#0D0431] font-bold">{assignment.platform}</span>
              </p>
            </div>
            <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
              <a 
                href={assignment.link}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-white hover:bg-[#CDE1FF] text-[#0D0431] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] hover:scale-105 active:scale-95 transition-all"
                title="Open assignment link"
              >
                <ExternalLink size={15} />
              </a>
              <button
                type="button"
                onClick={() => onToggleComplete(assignment.id)}
                className={`p-2 rounded-xl border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                  assignment.completed ? 'bg-[#D3F8C6] text-[#0D0431]' : 'bg-white text-[#0D0431]/40 hover:text-[#0D0431]'
                }`}
                title={assignment.completed ? "Mark incomplete" : "Mark complete"}
              >
                <CheckCircle size={15} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};