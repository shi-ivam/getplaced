import React from 'react';
import { ExternalLink, CheckCircle } from 'lucide-react';

export const AssignmentList = ({ assignments, onToggleComplete }) => {
  return (
    <div className="space-y-3">
      {assignments.map(assignment => (
        <div
          key={assignment.id}
          className="bg-[#121215] p-4 rounded-xl flex items-center justify-between border border-zinc-800/80 hover:border-zinc-700 transition-colors"
        >
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-zinc-100 font-semibold text-sm">{assignment.title}</h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${
                assignment.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                assignment.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}>
                {assignment.difficulty}
              </span>
            </div>
            <p className="text-zinc-400 text-xs mt-1 font-mono">Platform: {assignment.platform}</p>
          </div>
          <div className="flex items-center gap-3">
            <a 
              href={assignment.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-zinc-200 transition-colors p-1"
              title="Open assignment link"
            >
              <ExternalLink size={16} />
            </a>
            <button
              onClick={() => onToggleComplete(assignment.id)}
              className={`${
                assignment.completed ? 'text-emerald-400' : 'text-zinc-600 hover:text-zinc-300'
              } transition-colors p-1 cursor-pointer`}
              title={assignment.completed ? "Mark incomplete" : "Mark complete"}
            >
              <CheckCircle size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};