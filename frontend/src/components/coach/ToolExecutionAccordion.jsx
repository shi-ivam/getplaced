import React, { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle2, AlertCircle, Wrench, Sparkles } from "lucide-react";

export default function ToolExecutionAccordion({ toolCalls = [], executionSummary = [], modelUsed = "" }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!toolCalls || toolCalls.length === 0) return null;

  return (
    <div className="mb-3 rounded-xl border border-zinc-800 bg-zinc-950/60 overflow-hidden text-xs">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2 flex items-center justify-between text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 transition-colors font-mono cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-zinc-900 text-zinc-400 flex items-center justify-center border border-zinc-800">
            <Wrench className="w-2.5 h-2.5" />
          </div>
          <span className="text-[10px] font-semibold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded tracking-wide">
            {toolCalls.length} Tool {toolCalls.length === 1 ? "Action" : "Actions"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-500">
          <span className="text-[10px]">{isOpen ? "Hide Details" : "View Details"}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-3 border-t border-zinc-800 bg-zinc-950/90 space-y-2 font-sans">
          {toolCalls.map((call, idx) => {
            const isError = call.status === "ERROR" || call.status === "FAILED" || Boolean(call.error);
            return (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex flex-col gap-1.5 text-[11px]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-mono text-zinc-200">
                    <Wrench className="w-3 h-3 text-zinc-400" />
                    <span className="font-semibold text-zinc-300">{call.name || `Tool #${idx + 1}`}</span>
                  </div>
                  <span
                    className={`flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                      isError
                        ? "text-rose-400 bg-rose-500/10 border-rose-500/20"
                        : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                    }`}
                  >
                    {isError ? <AlertCircle className="w-2.5 h-2.5" /> : <CheckCircle2 className="w-2.5 h-2.5" />}
                    <span>{call.status || (isError ? "FAILED" : "SUCCESS")}</span>
                  </span>
                </div>

                {call.summary && (
                  <p className="text-zinc-300 text-[11px] leading-relaxed">
                    {call.summary}
                  </p>
                )}

                {call.error && (
                  <p className="text-rose-400 text-[10px] font-mono bg-rose-950/30 p-1.5 rounded border border-rose-900/40">
                    {String(call.error)}
                  </p>
                )}

                {call.args && (typeof call.args === "object" ? Object.keys(call.args).length > 0 : Boolean(call.args)) && (
                  <div className="text-[10px] font-mono text-zinc-400 bg-zinc-950 px-2.5 py-1.5 rounded-lg border border-zinc-800 overflow-x-auto break-all">
                    <span className="text-zinc-500">args:</span>{" "}
                    <span>{typeof call.args === "object" ? JSON.stringify(call.args) : String(call.args)}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
