import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import gsap from "gsap";
import { Code2, Target, Activity, Layers, Sparkles } from "lucide-react";
import DsaRequirementComparison from "@/components/dsa/DsaRequirementComparison";
import LeetCodeSubmissionAnalysis from "@/components/leetcode/LeetCodeSubmissionAnalysis";
import SheetsHub from "@/components/sheets/SheetsHub";
import { getDsaMentorCopy } from "@/utils/dynamicCopy";

export default function DSAContent({ defaultTab = null }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { sheetId } = useParams();

  const tabFromUrl = searchParams.get("tab") || (sheetId ? "sheets" : defaultTab || "sheets");
  const [mainTab, setMainTab] = useState(tabFromUrl); // 'sheets' | 'comparison' | 'submissions'
  const containerRef = useRef(null);

  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== mainTab) {
      setMainTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll(".gsap-reveal"),
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power2.out" }
      );
    }
  }, [mainTab]);

  const handleTabSwitch = (newTab) => {
    setMainTab(newTab);
    setSearchParams({ tab: newTab }, { replace: true });
  };

  return (
    <main className="overflow-x-hidden w-full max-w-full min-h-screen bg-[#09090b] text-zinc-100 p-4 md:p-8 lg:p-10 font-sans selection:bg-zinc-800 selection:text-zinc-100">
      <div ref={containerRef} className="max-w-6xl mx-auto space-y-8">
        {/* Top Header */}
        <header className="gsap-reveal flex flex-col gap-4 border-b border-zinc-800/80 pb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-zinc-100 tracking-tight flex items-center gap-3">
                <Code2 className="w-6 h-6 text-zinc-300" />
                Curriculum Sheets & DSA Analytics
              </h1>
              <p className="text-xs text-zinc-400 mt-1">
                Structured interview sheets, company benchmark gap analysis, and problem-solving metrics.
              </p>
            </div>
          </div>

          {/* Surface Switcher Tabs Below Title */}
          <div className="inline-flex flex-wrap items-center bg-zinc-900 border border-zinc-800 p-1 rounded-lg self-start text-xs font-mono">
            <button
              type="button"
              onClick={() => handleTabSwitch("sheets")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md transition-all cursor-pointer ${
                mainTab === "sheets"
                  ? "bg-zinc-100 text-zinc-950 font-bold shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Study Plan (28)</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabSwitch("comparison")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md transition-all cursor-pointer ${
                mainTab === "comparison"
                  ? "bg-zinc-100 text-zinc-950 font-bold shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Target Benchmark</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabSwitch("submissions")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md transition-all cursor-pointer ${
                mainTab === "submissions"
                  ? "bg-zinc-100 text-zinc-950 font-bold shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Submissions</span>
            </button>
          </div>
        </header>

        {/* Main Tab 0: Study Plan & Placement Curricula (28 Lists) */}
        {mainTab === "sheets" && (
          <section className="gsap-reveal space-y-6">
            <SheetsHub
              initialSheetId={sheetId || searchParams.get("sheet")}
              initialSearch={searchParams.get("search") || ""}
            />
          </section>
        )}

        {/* Main Tab 1: DSA Readiness vs Target Company Benchmark */}
        {mainTab === "comparison" && (
          <section className="gsap-reveal space-y-6">
            <DsaRequirementComparison />
          </section>
        )}

        {/* Main Tab 3: Submission Activity & Consistency Analysis */}
        {mainTab === "submissions" && (
          <section className="gsap-reveal space-y-6">
            <LeetCodeSubmissionAnalysis />
          </section>
        )}
      </div>
    </main>
  );
}
