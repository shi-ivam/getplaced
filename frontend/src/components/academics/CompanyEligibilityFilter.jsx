import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Building2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Search,
  Filter,
  Briefcase,
  GraduationCap,
  Info,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { NODE_API_URL } from "@/config/api";
import GpCard from "@/components/gp/GpCard";
import GpBadge from "@/components/gp/GpBadge";

import { COMPANY_BENCHMARK_PROFILES } from "@/services/canIApplyService";

const STATUS_CONFIG = {
  Eligible: {
    theme: "lime",
    icon: CheckCircle2,
    badgeText: "Eligible",
  },
  Borderline: {
    theme: "yellow",
    icon: AlertCircle,
    badgeText: "Borderline Gap",
  },
  Ineligible: {
    theme: "coral",
    icon: XCircle,
    badgeText: "Ineligible",
  },
};

function evaluateLocalEligibility(profile, filterTier = "All") {
  const userCgpa = Number(profile?.currentCgpa) || 0;
  const user10th = Number(profile?.tenthPercentage) || 0;
  const user12th = Number(profile?.twelfthPercentage) || 0;
  const userBacklogs = Number(profile?.activeBacklogs) || 0;
  const userHistoryBacklogs = Number(profile?.historyOfBacklogs) || 0;
  const userBranch = profile?.branch || "Computer Science & Engineering";

  let entries = Object.values(COMPANY_BENCHMARK_PROFILES);
  if (filterTier && filterTier !== "All") {
    entries = entries.filter((c) => c.tier.toLowerCase().includes(filterTier.toLowerCase()));
  }

  const results = entries.map((b) => {
    const cgpaPass = userCgpa >= b.minCgpa;
    const tenthPass = user10th >= b.minTenthPct;
    const twelfthPass = user12th >= b.minTwelfthPct;
    const backlogPass = userBacklogs <= b.maxActiveBacklogs;
    const historyBacklogPass = userHistoryBacklogs <= b.maxHistoryBacklogs;

    const branchPass =
      !b.allowedBranches ||
      b.allowedBranches.includes("All Branches") ||
      b.allowedBranches.includes("All Engineering Branches") ||
      b.allowedBranches.some((br) => userBranch.toLowerCase().includes(br.toLowerCase()));

    const isFullyEligible = cgpaPass && tenthPass && twelfthPass && backlogPass && historyBacklogPass && branchPass;
    const isBorderline = !isFullyEligible && userCgpa >= b.minCgpa - 0.4 && backlogPass;

    const gaps = [];
    if (!cgpaPass) gaps.push(`CGPA ${userCgpa} < Min ${b.minCgpa} (Gap: -${(b.minCgpa - userCgpa).toFixed(2)})`);
    if (!tenthPass) gaps.push(`10th ${user10th}% < Min ${b.minTenthPct}%`);
    if (!twelfthPass) gaps.push(`12th ${user12th}% < Min ${b.minTwelfthPct}%`);
    if (!backlogPass) gaps.push(`${userBacklogs} Active Backlogs > Allowed ${b.maxActiveBacklogs}`);
    if (!branchPass) gaps.push(`Branch ${userBranch} not in eligible list`);

    let status = "Ineligible";
    if (isFullyEligible) status = "Eligible";
    else if (isBorderline) status = "Borderline";

    return {
      company: b.name,
      tier: b.tier,
      avgPackageLpa: b.avgPackageLpa,
      status,
      isEligible: isFullyEligible,
      isBorderline,
      criteria: {
        minCgpa: b.minCgpa,
        preferredCgpa: b.preferredCgpa,
        minTenthPct: b.minTenthPct,
        minTwelfthPct: b.minTwelfthPct,
        maxActiveBacklogs: b.maxActiveBacklogs,
        allowedBranches: b.allowedBranches,
      },
      userValues: {
        cgpa: userCgpa,
        tenth: user10th,
        twelfth: user12th,
        activeBacklogs: userBacklogs,
        branch: userBranch,
      },
      passFlags: {
        cgpa: cgpaPass,
        tenth: tenthPass,
        twelfth: twelfthPass,
        backlogs: backlogPass,
        branch: branchPass,
      },
      gaps,
      notes: `Standard criteria for ${b.name}. Strict cutoff enforced by campus recruitment team.`,
    };
  });

  const eligibleCount = results.filter((r) => r.status === "Eligible").length;
  const borderlineCount = results.filter((r) => r.status === "Borderline").length;
  const ineligibleCount = results.filter((r) => r.status === "Ineligible").length;

  return {
    totalEvaluated: results.length,
    eligibleCount,
    borderlineCount,
    ineligibleCount,
    eligibilityRatePct: results.length > 0 ? Math.round((eligibleCount / results.length) * 100) : 0,
    companies: results,
  };
}

export default function CompanyEligibilityFilter({
  academicData,
  currentCgpa,
  tenthPercentage,
  twelfthPercentage,
  activeBacklogs,
}) {
  const [companiesData, setCompaniesData] = useState(null);
  const [filterTier, setFilterTier] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEligibility = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${NODE_API_URL}/api/academics/eligibility?tier=${filterTier}`,
          { withCredentials: true }
        );
        if (res.data && res.data.companies) {
          setCompaniesData(res.data);
        } else {
          const fallback = evaluateLocalEligibility(
            {
              currentCgpa: currentCgpa ?? academicData?.currentCgpa,
              tenthPercentage: tenthPercentage ?? academicData?.tenthPercentage,
              twelfthPercentage: twelfthPercentage ?? academicData?.twelfthPercentage,
              activeBacklogs: activeBacklogs ?? academicData?.activeBacklogs,
              branch: academicData?.branch,
            },
            filterTier
          );
          setCompaniesData(fallback);
        }
      } catch (err) {
        console.warn("Could not fetch company eligibility, using fallback data:", err.message);
        const fallback = evaluateLocalEligibility(
          {
            currentCgpa: currentCgpa ?? academicData?.currentCgpa,
            tenthPercentage: tenthPercentage ?? academicData?.tenthPercentage,
            twelfthPercentage: twelfthPercentage ?? academicData?.twelfthPercentage,
            activeBacklogs: activeBacklogs ?? academicData?.activeBacklogs,
            branch: academicData?.branch,
          },
          filterTier
        );
        setCompaniesData(fallback);
      } finally {
        setLoading(false);
      }
    };

    fetchEligibility();
  }, [filterTier, academicData, currentCgpa, tenthPercentage, twelfthPercentage, activeBacklogs]);

  const companies = companiesData?.companies || [];

  const filteredCompanies = companies.filter((c) => {
    const matchesSearch =
      c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tier.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <GpCard
      theme="white"
      shadow="default"
      className="p-6 md:p-8 space-y-6"
    >
      {/* ── Header & Stats ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#0D0431]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#CDE1FF] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] flex items-center justify-center text-[#0D0431] shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <GpBadge theme="blue" size="sm">
                Drive Screening Matrix
              </GpBadge>
            </div>
            <h3 className="text-xl sm:text-2xl font-heading font-black text-[#0D0431] tracking-tight mt-0.5">
              Company Academic Eligibility Screening
            </h3>
            <p className="text-xs text-[#0D0431]/75 font-sans mt-0.5">
              Live matching against academic cutoff criteria for 35+ top recruiters
            </p>
          </div>
        </div>

        {companiesData && (
          <div className="self-start sm:self-auto">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E4FFDA] border-2 border-[#0D0431] text-xs font-mono font-black text-[#0D0431] shadow-[2px_2px_0_0_#0D0431]">
              <ShieldCheck className="w-4 h-4 text-[#0D0431]" />
              {companiesData.eligibleCount} / {companiesData.totalEvaluated} Cleared ({companiesData.eligibilityRatePct}%)
            </span>
          </div>
        )}
      </div>

      {/* ── Filter and Search Bar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#0D0431]/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Filter company name or tier (Google, Microsoft, FinTech, TCS)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border-2 border-[#0D0431] rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-[#0D0431] placeholder-[#0D0431]/40 shadow-[3px_3px_0_0_#0D0431] focus:outline-none focus:bg-[#FEF9CF] focus:shadow-[4px_4px_0_0_#0D0431] transition-all"
          />
        </div>

        {/* Tier Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {["All", "Tier 1 Product", "FinTech", "Unicorn", "IT Services"].map((tier) => (
            <button
              key={tier}
              type="button"
              onClick={() => setFilterTier(tier)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] cursor-pointer ${
                filterTier === tier
                  ? "bg-[#0D0431] text-white"
                  : "bg-white text-[#0D0431] hover:bg-[#FEDF6A] hover:-translate-y-0.5"
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* ── Company Cards Grid ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white border-2 border-[#0D0431] rounded-2xl shadow-[3px_3px_0_0_#0D0431] space-y-3">
          <div className="w-8 h-8 border-4 border-[#0D0431] border-t-[#896EE2] rounded-full animate-spin" />
          <p className="text-xs font-bold text-[#0D0431]">
            Evaluating academic criteria against company benchmarks...
          </p>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-[#F8F8F5] border-2 border-dashed border-[#0D0431]/20 rounded-2xl text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-[#0D0431]/40" />
          <h4 className="text-sm font-heading font-black text-[#0D0431]">No Companies Found</h4>
          <p className="text-xs text-[#0D0431]/60 font-sans max-w-sm">
            No company criteria match your search &quot;{searchQuery}&quot; in the &quot;{filterTier}&quot; tier. Try adjusting your search query or selecting &quot;All&quot;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompanies.map((item) => {
            const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.Ineligible;
            const IconComp = cfg.icon;

            return (
              <div
                key={item.company}
                className="group bg-white border-2 border-[#0D0431] rounded-2xl p-5 shadow-[3px_3px_0_0_#0D0431] hover:shadow-[5px_5px_0_0_#0D0431] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top: Name & Status */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h4 className="text-base font-heading font-black text-[#0D0431] tracking-tight group-hover:text-[#896EE2] transition-colors">
                        {item.company}
                      </h4>
                      <span className="text-xs text-[#0D0431]/75 font-mono font-bold">
                        {item.tier} · {item.avgPackageLpa} LPA CTC
                      </span>
                    </div>

                    <GpBadge theme={cfg.theme} size="sm">
                      <IconComp className="w-3.5 h-3.5 mr-1" />
                      {cfg.badgeText}
                    </GpBadge>
                  </div>

                  {/* Criteria Grid */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t-2 border-[#0D0431]/10 text-xs font-mono font-bold">
                    <div className="p-2.5 rounded-xl bg-[#FEF9CF] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431]">
                      <span className="text-[10px] text-[#0D0431]/70 uppercase block mb-0.5 font-sans">
                        Min CGPA
                      </span>
                      <span
                        className={`font-black ${
                          item.passFlags.cgpa ? "text-[#0D0431]" : "text-[#F85B52]"
                        }`}
                      >
                        {item.criteria.minCgpa} (You: {item.userValues.cgpa})
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#FEF9CF] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431]">
                      <span className="text-[10px] text-[#0D0431]/70 uppercase block mb-0.5 font-sans">
                        10th / 12th Cutoff
                      </span>
                      <span
                        className={`font-black ${
                          item.passFlags.tenth && item.passFlags.twelfth
                            ? "text-[#0D0431]"
                            : "text-[#F85B52]"
                        }`}
                      >
                        {item.criteria.minTenthPct}% / {item.criteria.minTwelfthPct}%
                      </span>
                    </div>
                  </div>

                  {/* Gaps or Notes */}
                  {item.gaps.length > 0 ? (
                    <div className="mt-3 p-3 rounded-xl bg-[#FFC5B7] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] text-xs text-[#0D0431]">
                      <span className="font-heading font-black block mb-1">
                        Criteria Deficit:
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-[11px] font-bold">
                        {item.gaps.map((g, idx) => (
                          <li key={idx}>{g}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="mt-3 p-2.5 rounded-xl bg-[#E4FFDA] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] text-xs text-[#0D0431] font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#0D0431] shrink-0" />
                      <span>Meets all academic criteria</span>
                    </div>
                  )}
                </div>

                {/* Footer Note */}
                <p className="text-[11px] text-[#0D0431]/70 font-medium mt-4 pt-3 border-t-2 border-[#0D0431]/10 line-clamp-2 leading-relaxed font-sans">
                  {item.notes}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </GpCard>
  );
}
