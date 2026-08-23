import React, { useState } from "react";
import {
  Edit3,
  Download,
  Sparkles,
  Plus,
  Trash2,
  Zap,
  Check,
  ChevronRight,
  RefreshCw,
  X,
} from "lucide-react";
import axios from "axios";
import { PY_API_URL } from "@/config/api";
import GpBadge from "@/components/gp/GpBadge";
import GpCard from "@/components/gp/GpCard";
import GpButton from "@/components/gp/GpButton";

export const DEFAULT_BUILDER_DATA = {
  personalInfo: {
    fullName: "Alex Rivera",
    email: "alex.rivera@example.com",
    phone: "+1 555-0199",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/alexrivera",
    github: "github.com/alexrivera",
  },
  summary:
    "Results-driven Software Engineer with 2+ years designing resilient web platforms and microservices. Adept at cloud infrastructure, automated CI/CD pipelines, and high-throughput data architectures.",
  experience: [
    {
      id: "exp-1",
      role: "Software Engineer",
      company: "Tech Enterprise",
      location: "Remote",
      startDate: "2023",
      endDate: "Present",
      bullets: [
        "Engineered 8 RESTful microservices with Node.js & Redis, reducing P99 latency by 42% at 10k RPM peak.",
        "Spearheaded modular frontend architecture using React 19 and Tailwind CSS, increasing user onboarding conversion by 28%.",
      ],
    },
  ],
  projects: [
    {
      id: "proj-1",
      name: "Distributed Task Scheduler",
      techStack: "Go, Redis, Docker",
      bullets: [
        "Architected high-concurrency microservice handling 15k+ daily requests with automated Redis caching.",
      ],
    },
  ],
  skills: {
    languages: ["TypeScript", "JavaScript", "Python", "SQL"],
    frameworks: ["React", "Node.js", "Express", "FastAPI"],
    toolsDatabases: ["PostgreSQL", "Redis", "Docker", "Git"],
  },
};

export const getSafeBuilderData = (data) => {
  if (!data) return DEFAULT_BUILDER_DATA;
  return {
    personalInfo: {
      fullName: data.personalInfo?.fullName ?? DEFAULT_BUILDER_DATA.personalInfo.fullName,
      email: data.personalInfo?.email ?? DEFAULT_BUILDER_DATA.personalInfo.email,
      phone: data.personalInfo?.phone ?? DEFAULT_BUILDER_DATA.personalInfo.phone,
      location: data.personalInfo?.location ?? DEFAULT_BUILDER_DATA.personalInfo.location,
      linkedin: data.personalInfo?.linkedin ?? DEFAULT_BUILDER_DATA.personalInfo.linkedin,
      github: data.personalInfo?.github ?? DEFAULT_BUILDER_DATA.personalInfo.github,
    },
    summary: data.summary ?? DEFAULT_BUILDER_DATA.summary,
    experience: Array.isArray(data.experience) ? data.experience : DEFAULT_BUILDER_DATA.experience,
    projects: Array.isArray(data.projects) ? data.projects : DEFAULT_BUILDER_DATA.projects,
    skills: {
      languages: Array.isArray(data.skills?.languages)
        ? data.skills.languages
        : DEFAULT_BUILDER_DATA.skills.languages,
      frameworks: Array.isArray(data.skills?.frameworks)
        ? data.skills.frameworks
        : DEFAULT_BUILDER_DATA.skills.frameworks,
      toolsDatabases: Array.isArray(data.skills?.toolsDatabases)
        ? data.skills.toolsDatabases
        : DEFAULT_BUILDER_DATA.skills.toolsDatabases,
    },
  };
};

export default function ResumeBuilderEditor({
  builderData,
  setBuilderData,
  onEvaluateATS,
  targetRole = "Software Engineer",
  jobDescription = "",
}) {
  const [improvingBulletKey, setImprovingBulletKey] = useState(null);
  const [bulletImprovementModal, setBulletImprovementModal] = useState(null);
  const [isImprovingSection, setIsImprovingSection] = useState(false);

  const activeData = getSafeBuilderData(builderData);

  const updateData = (nextData) => {
    if (typeof setBuilderData === "function") {
      setBuilderData(nextData);
    }
  };

  const handleAIImproveBullet = async (bulletText, expIndex, bulletIndex) => {
    const key = `${expIndex}-${bulletIndex}`;
    setImprovingBulletKey(key);
    try {
      const res = await axios.post(`${PY_API_URL}/api/resume/improve-bullet`, {
        bullet: bulletText,
        target_role: targetRole,
        keywords: ["Architecture", "Scalability", "Optimization", "Latency"],
      });
      setBulletImprovementModal({
        expIndex,
        bulletIndex,
        original: bulletText,
        data: res.data,
      });
    } catch (e) {
      console.warn("AI bullet improver failed, using local XYZ formula generator:", e);
      // Fallback XYZ enhancement
      setBulletImprovementModal({
        expIndex,
        bulletIndex,
        original: bulletText,
        data: {
          improved_xyz: `Engineered scalable architecture for ${bulletText.replace(
            /^worked on /i,
            ""
          )}, improving throughput by 35% and reducing response latency by 42%.`,
          alternative_versions: [
            `Spearheaded development of ${bulletText.replace(
              /^worked on /i,
              ""
            )}, boosting system efficiency by 28% and ensuring 99.9% uptime.`,
            `Architected high-concurrency microservice handling 15k+ daily requests with automated Redis caching.`,
          ],
        },
      });
    } finally {
      setImprovingBulletKey(null);
    }
  };

  const applyImprovedBullet = (newBullet) => {
    if (!bulletImprovementModal) return;
    const { expIndex, bulletIndex } = bulletImprovementModal;
    const updatedExp = (activeData.experience || []).map((exp, idx) => {
      if (idx === expIndex) {
        const nextBullets = [...(exp.bullets || [])];
        nextBullets[bulletIndex] = newBullet;
        return { ...exp, bullets: nextBullets };
      }
      return exp;
    });
    updateData({ ...activeData, experience: updatedExp });
    setBulletImprovementModal(null);
  };

  const handleAISummaryOptimize = async () => {
    setIsImprovingSection(true);
    try {
      const res = await axios.post(`${PY_API_URL}/api/resume/optimize-section`, {
        section_type: "Professional Summary",
        content: activeData.summary,
        target_role: targetRole,
        job_description: jobDescription,
      });
      if (res.data?.optimized_content) {
        updateData({ ...activeData, summary: res.data.optimized_content });
      }
    } catch (e) {
      console.warn("AI summary polish fallback:", e);
      updateData({
        ...activeData,
        summary: `Results-driven ${targetRole} with proven expertise designing distributed systems, low-latency microservices, and modern web applications. Adept at cloud infrastructure, automated CI/CD pipelines, and high-throughput data architectures.`,
      });
    } finally {
      setIsImprovingSection(false);
    }
  };

  const handleExportBuilderJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    const safeName = (activeData.personalInfo?.fullName || "Resume").replace(/\s+/g, "_");
    downloadAnchor.setAttribute("download", `Resume_${safeName}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleSendToATS = () => {
    const pInfo = activeData.personalInfo || {};
    let compiled = `${pInfo.fullName || ""}\n${pInfo.email || ""} | ${pInfo.phone || ""} | ${
      pInfo.location || ""
    }\nLinkedIn: ${pInfo.linkedin || ""} | GitHub: ${pInfo.github || ""}\n\nSUMMARY:\n${
      activeData.summary || ""
    }\n\nEXPERIENCE:\n`;
    (activeData.experience || []).forEach((exp) => {
      compiled += `${exp.role || ""} at ${exp.company || ""} (${exp.startDate || ""} - ${
        exp.endDate || ""
      })\n`;
      (exp.bullets || []).forEach((b) => (compiled += `• ${b}\n`));
    });
    compiled += "\nPROJECTS:\n";
    (activeData.projects || []).forEach((proj) => {
      compiled += `${proj.name || ""} [${proj.techStack || ""}]\n`;
      (proj.bullets || []).forEach((b) => (compiled += `• ${b}\n`));
    });
    compiled += "\nSKILLS:\n";
    compiled += `Languages: ${activeData.skills?.languages?.join(", ") || ""}\n`;
    compiled += `Frameworks: ${activeData.skills?.frameworks?.join(", ") || ""}\n`;
    compiled += `Tools & Databases: ${activeData.skills?.toolsDatabases?.join(", ") || ""}\n`;
    onEvaluateATS?.(compiled);
  };

  return (
    <div className="space-y-6">
      {/* Header Deck */}
      <GpCard theme="white" shadow="lg" rounded="3xl" className="p-6 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#0D0431] pb-5">
          <div className="space-y-1">
            <h2 className="text-sm font-heading font-bold uppercase tracking-wider text-[#0D0431] flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-[#896EE2]" />
              Resume Builder & Section Editor
            </h2>
            <p className="text-xs text-[#0D0431]/70 font-sans font-medium">
              Structured resume editor with XYZ metric bullet enhancements and ATS synchronization.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleExportBuilderJSON}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#FEF9CF] text-[#0D0431] border-2 border-[#0D0431] rounded-2xl text-xs font-heading font-bold shadow-[2px_2px_0_0_#0D0431] transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
            <GpButton onClick={handleSendToATS} variant="stacked-yellow" size="sm">
              Evaluate ATS Score
            </GpButton>
          </div>
        </div>

        {/* 1. Personal Information */}
        <div className="space-y-3">
          <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-[#0D0431]/70 block">
            Personal Information
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={activeData.personalInfo.fullName}
              onChange={(e) =>
                updateData({
                  ...activeData,
                  personalInfo: { ...activeData.personalInfo, fullName: e.target.value },
                })
              }
              placeholder="Full Name"
              className="px-4 py-2.5 bg-white border-2 border-[#0D0431] rounded-xl text-xs font-sans font-medium text-[#0D0431] placeholder-[#0D0431]/40 shadow-[2px_2px_0_0_#0D0431] focus:bg-[#FEF9CF] focus:outline-none"
            />
            <input
              type="email"
              value={activeData.personalInfo.email}
              onChange={(e) =>
                updateData({
                  ...activeData,
                  personalInfo: { ...activeData.personalInfo, email: e.target.value },
                })
              }
              placeholder="Email Address"
              className="px-4 py-2.5 bg-white border-2 border-[#0D0431] rounded-xl text-xs font-sans font-medium text-[#0D0431] placeholder-[#0D0431]/40 shadow-[2px_2px_0_0_#0D0431] focus:bg-[#FEF9CF] focus:outline-none"
            />
            <input
              type="text"
              value={activeData.personalInfo.linkedin}
              onChange={(e) =>
                updateData({
                  ...activeData,
                  personalInfo: { ...activeData.personalInfo, linkedin: e.target.value },
                })
              }
              placeholder="LinkedIn Profile URL"
              className="px-4 py-2.5 bg-white border-2 border-[#0D0431] rounded-xl text-xs font-sans font-medium text-[#0D0431] placeholder-[#0D0431]/40 shadow-[2px_2px_0_0_#0D0431] focus:bg-[#FEF9CF] focus:outline-none"
            />
          </div>
        </div>

        {/* 2. Professional Summary */}
        <div className="space-y-2.5 pt-3 border-t-2 border-[#0D0431]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-[#0D0431]/70">
              Professional Summary
            </span>
            <button
              type="button"
              onClick={handleAISummaryOptimize}
              disabled={isImprovingSection}
              className="flex items-center gap-1.5 text-xs text-[#0D0431] font-heading font-bold bg-[#E4CDFB] hover:bg-[#FEDF6A] border-2 border-[#0D0431] px-3 py-1.5 rounded-xl shadow-[2px_2px_0_0_#0D0431] transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#896EE2]" />
              <span>{isImprovingSection ? "Optimizing..." : "Polish Summary"}</span>
            </button>
          </div>
          <textarea
            rows={3}
            value={activeData.summary}
            onChange={(e) => updateData({ ...activeData, summary: e.target.value })}
            className="w-full px-4 py-3 bg-white border-2 border-[#0D0431] rounded-2xl text-xs text-[#0D0431] font-sans font-medium focus:bg-[#FEF9CF] focus:outline-none resize-none leading-relaxed shadow-[2px_2px_0_0_#0D0431]"
          />
        </div>

        {/* 3. Work Experience */}
        <div className="space-y-4 pt-3 border-t-2 border-[#0D0431]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-[#0D0431]/70">
              Work Experience & Bullets
            </span>
            <button
              type="button"
              onClick={() => {
                const newExp = {
                  id: `exp-${Date.now()}`,
                  role: "Software Engineer",
                  company: "Tech Enterprise",
                  location: "Remote",
                  startDate: "2024",
                  endDate: "Present",
                  bullets: ["Engineered scalable backend service improving response time by 25%."],
                };
                updateData({
                  ...activeData,
                  experience: [...(activeData.experience || []), newExp],
                });
              }}
              className="flex items-center gap-1.5 text-xs text-[#0D0431] font-heading font-bold bg-white hover:bg-[#FEDF6A] px-3.5 py-1.5 rounded-xl border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Role</span>
            </button>
          </div>

          <div className="space-y-4">
            {(activeData.experience || []).map((exp, expIdx) => (
              <div
                key={exp.id || expIdx}
                className="bg-[#FEF9CF] border-2 border-[#0D0431] p-5 rounded-2xl space-y-4 shadow-[3px_3px_0_0_#0D0431]"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={exp.role}
                    onChange={(e) => {
                      const updatedExp = (activeData.experience || []).map((item, idx) =>
                        idx === expIdx ? { ...item, role: e.target.value } : item
                      );
                      updateData({ ...activeData, experience: updatedExp });
                    }}
                    placeholder="Role / Title"
                    className="px-3.5 py-2 bg-white border-2 border-[#0D0431] rounded-xl text-xs font-heading font-bold text-[#0D0431] focus:bg-[#FEF9CF] focus:outline-none shadow-[2px_2px_0_0_#0D0431]"
                  />
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => {
                      const updatedExp = (activeData.experience || []).map((item, idx) =>
                        idx === expIdx ? { ...item, company: e.target.value } : item
                      );
                      updateData({ ...activeData, experience: updatedExp });
                    }}
                    placeholder="Company / Organization"
                    className="px-3.5 py-2 bg-white border-2 border-[#0D0431] rounded-xl text-xs font-heading font-bold text-[#0D0431] focus:bg-[#FEF9CF] focus:outline-none shadow-[2px_2px_0_0_#0D0431]"
                  />
                </div>

                {/* Bullets List */}
                <div className="space-y-2.5 pt-1">
                  <span className="text-[10px] font-heading font-bold text-[#0D0431]/70 uppercase tracking-wider block">
                    Impact Bullet Points (XYZ Framework):
                  </span>
                  {(exp.bullets || []).map((bullet, bIdx) => (
                    <div key={bIdx} className="flex items-center gap-2.5">
                      <input
                        type="text"
                        value={bullet}
                        onChange={(e) => {
                          const updatedExp = (activeData.experience || []).map((item, idx) => {
                            if (idx === expIdx) {
                              const nextBullets = [...(item.bullets || [])];
                              nextBullets[bIdx] = e.target.value;
                              return { ...item, bullets: nextBullets };
                            }
                            return item;
                          });
                          updateData({ ...activeData, experience: updatedExp });
                        }}
                        className="flex-1 px-3.5 py-2 bg-white border-2 border-[#0D0431] rounded-xl text-xs text-[#0D0431] font-sans font-medium focus:bg-[#FEF9CF] focus:outline-none shadow-[2px_2px_0_0_#0D0431]"
                      />
                      <button
                        type="button"
                        onClick={() => handleAIImproveBullet(bullet, expIdx, bIdx)}
                        disabled={improvingBulletKey === `${expIdx}-${bIdx}`}
                        className="flex items-center gap-1.5 px-3 py-2 bg-[#FEDF6A] hover:bg-[#FFE995] active:translate-x-0.5 active:translate-y-0.5 border-2 border-[#0D0431] text-[#0D0431] rounded-xl text-xs font-heading font-bold shrink-0 transition-all shadow-[2px_2px_0_0_#0D0431] cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#896EE2]" />
                        <span>{improvingBulletKey === `${expIdx}-${bIdx}` ? "..." : "Enhance"}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </GpCard>

      {/* Bullet Improvement Modal */}
      {bulletImprovementModal && (
        <div className="fixed inset-0 bg-[#0D0431]/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border-2 border-[#0D0431] rounded-3xl max-w-xl w-full shadow-[8px_8px_0_0_#0D0431] overflow-hidden text-[#0D0431] animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-[#FEF9CF] border-b-2 border-[#0D0431] flex items-center justify-between">
              <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-[#0D0431] flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#FEDF6A]" />
                Select Bullet Improvement (XYZ Formula)
              </h3>
              <button
                type="button"
                onClick={() => setBulletImprovementModal(null)}
                className="p-1.5 rounded-full border-2 border-[#0D0431] bg-white hover:bg-[#FFC5B7] text-[#0D0431] transition-all shadow-[2px_2px_0_0_#0D0431] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-[#0D0431] block">
                Recommended Formulation:
              </span>
              <div
                onClick={() => applyImprovedBullet(bulletImprovementModal.data.improved_xyz)}
                className="p-4 bg-[#D4FDF7] hover:bg-[#9BFFED] border-2 border-[#0D0431] rounded-2xl cursor-pointer transition text-xs text-[#0D0431] font-heading font-bold shadow-[3px_3px_0_0_#0D0431]"
              >
                {bulletImprovementModal.data.improved_xyz}
              </div>

              {bulletImprovementModal.data.alternative_versions?.length > 0 && (
                <div className="space-y-2.5 pt-2">
                  <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-[#0D0431]/70 block">
                    Alternative Options:
                  </span>
                  {bulletImprovementModal.data.alternative_versions.map((alt, idx) => (
                    <div
                      key={idx}
                      onClick={() => applyImprovedBullet(alt)}
                      className="p-3.5 bg-white hover:bg-[#FEF9CF] border-2 border-[#0D0431] rounded-2xl cursor-pointer transition text-xs text-[#0D0431] font-sans font-medium shadow-[2px_2px_0_0_#0D0431]"
                    >
                      {alt}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end pt-3 border-t-2 border-[#0D0431]">
                <button
                  type="button"
                  onClick={() => setBulletImprovementModal(null)}
                  className="px-4 py-2 bg-white hover:bg-[#FEF9CF] border-2 border-[#0D0431] text-[#0D0431] rounded-xl text-xs font-heading font-bold shadow-[2px_2px_0_0_#0D0431] transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
