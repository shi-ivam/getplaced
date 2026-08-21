import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Target,
  Building2,
  Briefcase,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Compass,
  Layers,
} from "lucide-react";
import { NODE_API_URL } from "@/config/api";

export default function Dashboard() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${NODE_API_URL}/api/users/profile`, {
          withCredentials: true,
        });
        if (res.data) {
          setUserProfile(res.data);
        }
      } catch (err) {
        console.error("Could not fetch user profile for dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const hasTarget = Boolean(userProfile?.targetCompany || userProfile?.targetJobRole);
  const isFullTarget = Boolean(userProfile?.targetCompany && userProfile?.targetJobRole);

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-gray-200 p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800/80 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>👋 Welcome{userProfile?.name ? `, ${userProfile.name}` : ""}!</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Track your placement milestones, target progress, and interview readiness.
          </p>
        </div>
      </div>

      {/* Active Target Banner / Widget */}
      {hasTarget ? (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-950/60 via-[#161618] to-indigo-950/50 border border-purple-800/50 p-5 md:p-6 shadow-xl shadow-purple-950/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start md:items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0 shadow-inner">
                <Target className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
                    Active Career Target
                  </span>
                  {isFullTarget ? (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-medium">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Target Locked
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 font-medium">
                      Partially Configured
                    </span>
                  )}
                </div>

                <div className="text-lg md:text-xl font-bold text-white flex flex-wrap items-center gap-2">
                  {userProfile.targetCompany ? (
                    <span className="inline-flex items-center gap-1.5 text-white">
                      <Building2 className="w-4 h-4 text-purple-400" />
                      {userProfile.targetCompany}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm font-normal italic">No company selected</span>
                  )}

                  <span className="text-purple-400 font-normal">—</span>

                  {userProfile.targetJobRole ? (
                    <span className="inline-flex items-center gap-1.5 text-purple-200">
                      <Briefcase className="w-4 h-4 text-purple-400" />
                      {userProfile.targetJobRole}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm font-normal italic">No role selected</span>
                  )}
                </div>

                {userProfile.targetCompanyNormalized && userProfile.targetRoleNormalized && (
                  <p className="text-xs text-gray-400 font-mono pt-0.5">
                    Target Identifier: <span className="text-purple-300">{userProfile.targetCompanyNormalized}</span> / <span className="text-indigo-300">{userProfile.targetRoleNormalized}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 self-start md:self-auto">
              <Link
                to="/app/profile"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors shadow-md shadow-purple-950/40"
              >
                <span>Update Target</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#141414] border border-dashed border-gray-800 p-5 md:p-6 shadow-md">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-800/80 border border-gray-700 flex items-center justify-center text-gray-400 shrink-0">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white text-base">No Target Selected</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700 font-medium">
                    Not Set
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Choose a company and role to start placement preparation and unlock tailored readiness metrics.
                </p>
              </div>
            </div>

            <Link
              to="/app/profile"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors shadow-md shadow-purple-950/40"
            >
              <span>Choose Target</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Resume Score" value="82%" subtitle="ATS Benchmark" />
        <StatCard title="Interviews Given" value="5" subtitle="AI Mock Sessions" />
        <StatCard title="Past Interview Score" value="74%" subtitle="Avg Communication" />
        <StatCard title="Courses Completed" value="3" subtitle="Curriculum Progress" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* AI Interview */}
        <div className="bg-[#141414] border border-gray-800/80 p-6 rounded-xl shadow-md col-span-1 md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span>🤖 AI Mock Interview</span>
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
              Target Aligned
            </span>
          </div>
          <p className="text-sm text-gray-400">
            Practice realistic placement interviews tailored to your target company and role expectations.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <Link
              to="/app/interview"
              className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors inline-block"
            >
              Start Mock Interview
            </Link>
            <span className="text-xs text-gray-500">
              Last score: <strong className="text-purple-400">74%</strong>
            </span>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-[#141414] border border-gray-800/80 p-6 rounded-xl shadow-md space-y-3">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span>🗓️ Placement Deadlines</span>
          </h2>
          <p className="text-xs text-gray-400">
            Keep track of campus drive deadlines, online assessments, and interview slots.
          </p>
          <div className="p-3 bg-[#1c1c1c] rounded-lg border border-gray-800 text-xs text-gray-400">
            No upcoming assessment deadlines scheduled for this week.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Course Recommendations */}
        <div className="bg-[#141414] border border-gray-800/80 p-6 rounded-xl shadow-md col-span-1 md:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span>📚 Recommended Preparation Modules</span>
          </h2>
          <ul className="space-y-3">
            {[
              { title: "DSA Mastery (Dynamic Programming & Trees)", tag: "High Priority" },
              { title: "System Design & Scalable Architectures", tag: "Core" },
              { title: "Company-Specific Technical Assessment Prep", tag: "Target" },
              { title: "Behavioral & HR Mock Interview Bootcamp", tag: "Soft Skills" },
            ].map((course, i) => (
              <li
                key={i}
                className="flex items-center justify-between p-3 rounded-lg bg-[#1a1a1a] border border-gray-800/60 text-sm"
              >
                <div>
                  <span className="font-medium text-gray-200">{course.title}</span>
                  <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60">
                    {course.tag}
                  </span>
                </div>
                <button className="text-xs bg-purple-600/80 hover:bg-purple-600 text-white px-3 py-1.5 rounded-md transition-colors cursor-pointer">
                  Enroll
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Todo List */}
        <div className="bg-[#141414] border border-gray-800/80 p-6 rounded-xl shadow-md space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span>✅ Preparation Checklist</span>
          </h2>
          <ul className="space-y-2.5 text-xs text-gray-300">
            <li className="flex items-center gap-2.5 p-2 rounded bg-[#1a1a1a] border border-gray-800/60">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Complete Candidate Profile & Target</span>
            </li>
            <li className="flex items-center gap-2.5 p-2 rounded bg-[#1a1a1a] border border-gray-800/60">
              <span className="text-purple-400 font-bold">○</span>
              <span>Upload Resume for AI ATS Scoring</span>
            </li>
            <li className="flex items-center gap-2.5 p-2 rounded bg-[#1a1a1a] border border-gray-800/60">
              <span className="text-purple-400 font-bold">○</span>
              <span>Practice 2 Medium Company LeetCode Problems</span>
            </li>
            <li className="flex items-center gap-2.5 p-2 rounded bg-[#1a1a1a] border border-gray-800/60">
              <span className="text-purple-400 font-bold">○</span>
              <span>Attempt 1 Full Mock AI Interview</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle }) {
  return (
    <div className="bg-[#141414] border border-gray-800/80 p-5 rounded-xl shadow-md space-y-1">
      <h3 className="text-xs font-medium text-gray-400">{title}</h3>
      <p className="text-2xl font-bold text-white">{value}</p>
      {subtitle && <p className="text-[11px] text-purple-400">{subtitle}</p>}
    </div>
  );
}