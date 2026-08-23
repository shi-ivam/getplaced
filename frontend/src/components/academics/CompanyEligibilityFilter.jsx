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
} from "lucide-react";
import { NODE_API_URL } from "@/config/api";

const STATUS_CONFIG = {
  Eligible: {
    bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    icon: CheckCircle2,
    badgeText: "Eligible",
  },
  Borderline: {
    bg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    icon: AlertCircle,
    badgeText: "Borderline Gap",
  },
  Ineligible: {
    bg: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    icon: XCircle,
    badgeText: "Ineligible",
  },
};

export default function CompanyEligibilityFilter({ academicData }) {
  const [companiesData, setCompaniesData] = useState(null);
  const [filterTier, setFilterTier] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEligibility = async () => {
      try {
        const res = await axios.get(
          `${NODE_API_URL}/api/academics/eligibility?tier=${filterTier}`,
          { withCredentials: true }
        );
        if (res.data) {
          setCompaniesData(res.data);
        }
      } catch (err) {
        console.warn("Could not fetch company eligibility, using fallback data:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEligibility();
  }, [filterTier, academicData]);

  const companies = companiesData?.companies || [];

  const filteredCompanies = companies.filter((c) => {
    const matchesSearch =
      c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tier.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="rounded-3xl bg-zinc-900/60 border border-white/10 p-6 md:p-8 backdrop-blur-md shadow-2xl relative overflow-hidden space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Company Eligibility Screening
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Live matching against academic cutoff criteria for 35+ top recruiters
            </p>
          </div>
        </div>

        {companiesData && (
          <div className="self-start sm:self-auto">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono font-semibold text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              {companiesData.eligibleCount} / {companiesData.totalEvaluated} Companies Cleared ({companiesData.eligibilityRatePct}%)
            </span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter company name or tier (Google, Microsoft, FinTech, TCS)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-400 transition-colors"
          />
        </div>

        {/* Tier Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {["All", "Tier 1 Product", "FinTech", "Unicorn", "IT Services"].map((tier) => (
            <button
              key={tier}
              type="button"
              onClick={() => setFilterTier(tier)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                filterTier === tier
                  ? "bg-white text-zinc-950 font-semibold shadow-md"
                  : "bg-zinc-950/80 text-zinc-400 hover:text-white border border-white/10"
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Company List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCompanies.map((item) => {
          const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.Ineligible;
          const IconComp = cfg.icon;

          return (
            <div
              key={item.company}
              className="group bg-zinc-950/80 border border-white/10 hover:border-white/20 rounded-2xl p-5 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Top: Name & Status */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h4 className="text-base font-bold text-white tracking-tight group-hover:text-purple-300 transition-colors">
                      {item.company}
                    </h4>
                    <span className="text-xs text-zinc-400 font-mono">
                      {item.tier} · {item.avgPackageLpa} LPA CTC
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-mono font-bold px-2.5 py-1 rounded-full border shrink-0 ${cfg.bg}`}
                  >
                    <IconComp className="w-3.5 h-3.5" />
                    {cfg.badgeText}
                  </span>
                </div>

                {/* Criteria Grid */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/5 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-white/5">
                    <span className="text-[10px] text-zinc-500 uppercase block mb-0.5">Min CGPA</span>
                    <span
                      className={`font-semibold ${
                        item.passFlags.cgpa ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {item.criteria.minCgpa} (User: {item.userValues.cgpa})
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-white/5">
                    <span className="text-[10px] text-zinc-500 uppercase block mb-0.5">10th / 12th Cutoff</span>
                    <span
                      className={`font-semibold ${
                        item.passFlags.tenth && item.passFlags.twelfth
                          ? "text-emerald-400"
                          : "text-rose-400"
                      }`}
                    >
                      {item.criteria.minTenthPct}% / {item.criteria.minTwelfthPct}%
                    </span>
                  </div>
                </div>

                {/* Gaps or Notes */}
                {item.gaps.length > 0 ? (
                  <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                    <span className="font-semibold block mb-1">Eligibility Criteria Deficit:</span>
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-rose-200">
                      {item.gaps.map((g, idx) => (
                        <li key={idx}>{g}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Meets all academic criteria</span>
                  </div>
                )}
              </div>

              {/* Footer Note */}
              <p className="text-[11px] text-zinc-500 mt-4 pt-3 border-t border-white/5 line-clamp-2 leading-relaxed">
                {item.notes}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
