import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import gsap from "gsap";
import { Code2, Target, Activity, Layers, Sparkles } from "lucide-react";
import DsaRequirementComparison from "@/components/dsa/DsaRequirementComparison";
import LeetCodeSubmissionAnalysis from "@/components/leetcode/LeetCodeSubmissionAnalysis";
import SheetsHub from "@/components/sheets/SheetsHub";

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

  const handleTabSwitch = (newTab) => {
    setMainTab(newTab);
    setSearchParams({ tab: newTab }, { replace: true });
  };

  return (
    <div ref={containerRef} className="space-y-6 pb-20">
      {/* Top Navigation & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2DEEC]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-[#17103D] tracking-tight flex items-center gap-2.5">
            <Code2 className="w-6 h-6 text-[#6E44FF]" />
            <span>DSA Curriculum & Analytics</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#6F6A80] mt-1">
            Structured interview sheets, company benchmark gaps, and real-time LeetCode analytics.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex items-center p-1 bg-white border border-[#E2DEEC] rounded-xl shadow-sm self-start text-xs font-semibold">
          <button
            type="button"
            onClick={() => handleTabSwitch("sheets")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              mainTab === "sheets"
                ? "bg-[#17103D] text-white shadow-sm"
                : "text-[#6F6A80] hover:text-[#17103D]"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Study Sheets (28)</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabSwitch("comparison")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              mainTab === "comparison"
                ? "bg-[#17103D] text-white shadow-sm"
                : "text-[#6F6A80] hover:text-[#17103D]"
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Company Benchmarks</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabSwitch("submissions")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              mainTab === "submissions"
                ? "bg-[#17103D] text-white shadow-sm"
                : "text-[#6F6A80] hover:text-[#17103D]"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Topic Submissions</span>
          </button>
        </div>
      </div>

      {/* Main Tab Panels */}
      {mainTab === "sheets" && (
        <SheetsHub initialSheetId={sheetId || null} />
      )}

      {mainTab === "comparison" && (
        <div className="bg-white border border-[#E2DEEC] rounded-2xl p-6 shadow-sm">
          <DsaRequirementComparison />
        </div>
      )}

      {mainTab === "submissions" && (
        <div className="bg-white border border-[#E2DEEC] rounded-2xl p-6 shadow-sm">
          <LeetCodeSubmissionAnalysis />
        </div>
      )}
    </div>
  );
}
