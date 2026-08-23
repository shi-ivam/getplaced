import React, { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle2, AlertCircle, Wrench, Sparkles } from "lucide-react";

export default function ToolExecutionAccordion({ toolCalls = [], executionSummary = [], modelUsed = "" }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!toolCalls || toolCalls.length === 0) return null;

  return (
    <div className="mb-3 rounded-2xl border border-[#E2DEEC] bg-[#F8F8F5] overflow-hidden text-xs shadow-xs">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between text-[#17103D] hover:bg-[#F2F0FA] transition-colors font-mono cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-[#EFEAFF] text-[#6E44FF] flex items-center justify-center border border-[#E2DEEC]">
            <Wrench className="w-3 h-3" />
          </div>
          <span className="text-[11px] font-bold text-[#6E44FF] bg-[#EFEAFF] border border-[#E2DEEC] px-2 py-0.5 rounded-md tracking-wide">
            {toolCalls.length} Tool {toolCalls.length === 1 ? "Action" : "Actions"} Executed
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[#6F6A80] font-sans font-medium text-xs">
          <span>{isOpen ? "Hide Details" : "View Details"}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-3 border-t border-[#E2DEEC] bg-white space-y-2.5 font-sans">
          {toolCalls.map((call, idx) => {
            const isError = call.status === "ERROR" || call.status === "FAILED" || Boolean(call.error);
            return (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[#F8F8F5] border border-[#E2DEEC] flex flex-col gap-1.5 text-[11px]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono text-[#17103D]">
                    <Wrench className="w-3.5 h-3.5 text-[#6E44FF]" />
                    <span className="font-bold text-[#17103D]">{call.name || `Tool #${idx + 1}`}</span>
                  </div>
                  <span
                    className={`flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold ${
                      isError
                        ? "text-[#C7382B] bg-[#FFE8E5] border-[#C7382B]/25"
                        : "text-[#0D7A68] bg-[#D8FAF4] border-[#0D7A68]/25"
                    }`}
                  >
                    {isError ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                    <span>{call.status || (isError ? "FAILED" : "SUCCESS")}</span>
                  </span>
                </div>

                {call.summary && (
                  <p className="text-[#17103D] text-xs leading-relaxed font-medium">
                    {call.summary}
                  </p>
                )}

                {call.error && (
                  <p className="text-[#C7382B] text-[11px] font-mono bg-[#FFE8E5] p-2 rounded-lg border border-[#C7382B]/20">
                    {String(call.error)}
                  </p>
                )}

                {call.args && (typeof call.args === "object" ? Object.keys(call.args).length > 0 : Boolean(call.args)) && (
                  <div className="text-[10px] font-mono text-[#FFD84D] bg-[#17103D] px-3 py-2 rounded-lg border border-[#24195A] overflow-x-auto break-all">
                    <span className="text-white/60">args:</span>{" "}
                    <span className="text-white">{typeof call.args === "object" ? JSON.stringify(call.args) : String(call.args)}</span>
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
