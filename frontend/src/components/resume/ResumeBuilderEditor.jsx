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
  X
} from "lucide-react";
import axios from "axios";
import { PY_API_URL } from "@/config/api";

export default function ResumeBuilderEditor({
  builderData,
  setBuilderData,
  onEvaluateATS,
  targetRole = "Software Engineer",
  jobDescription = ""
}) {
  const [improvingBulletKey, setImprovingBulletKey] = useState(null);
  const [bulletImprovementModal, setBulletImprovementModal] = useState(null);
  const [isImprovingSection, setIsImprovingSection] = useState(false);

  const handleAIImproveBullet = async (bulletText, expIndex, bulletIndex) => {
    const key = `${expIndex}-${bulletIndex}`;
    setImprovingBulletKey(key);
    try {
      const res = await axios.post(`${PY_API_URL}/api/resume/improve-bullet`, {
        bullet: bulletText,
        target_role: targetRole,
        keywords: ["Architecture", "Scalability", "Optimization", "Latency"]
      });
      setBulletImprovementModal({
        expIndex,
        bulletIndex,
        original: bulletText,
        data: res.data
      });
    } catch (e) {
      console.warn("AI bullet improver failed, using local XYZ formula generator:", e);
      // Fallback XYZ enhancement
      setBulletImprovementModal({
        expIndex,
        bulletIndex,
        original: bulletText,
        data: {
          improved_xyz: `Engineered scalable architecture for ${bulletText.replace(/^worked on /i, "")}, improving throughput by 35% and reducing response latency by 42%.`,
          alternative_versions: [
            `Spearheaded development of ${bulletText.replace(/^worked on /i, "")}, boosting system efficiency by 28% and ensuring 99.9% uptime.`,
            `Architected high-concurrency microservice handling 15k+ daily requests with automated Redis caching.`
          ]
        }
      });
    } finally {
      setImprovingBulletKey(null);
    }
  };

  const applyImprovedBullet = (newBullet) => {
    if (!bulletImprovementModal) return;
    const { expIndex, bulletIndex } = bulletImprovementModal;
    const updated = { ...builderData };
    updated.experience[expIndex].bullets[bulletIndex] = newBullet;
    setBuilderData(updated);
    setBulletImprovementModal(null);
  };

  const handleAISummaryOptimize = async () => {
    setIsImprovingSection(true);
    try {
      const res = await axios.post(`${PY_API_URL}/api/resume/optimize-section`, {
        section_type: "Professional Summary",
        content: builderData.summary,
        target_role: targetRole,
        job_description: jobDescription
      });
      if (res.data?.optimized_content) {
        setBuilderData({ ...builderData, summary: res.data.optimized_content });
      }
    } catch (e) {
      console.warn("AI summary polish fallback:", e);
      setBuilderData({
        ...builderData,
        summary: `Results-driven ${targetRole} with proven expertise designing distributed systems, low-latency microservices, and modern web applications. Adept at cloud infrastructure, automated CI/CD pipelines, and high-throughput data architectures.`
      });
    } finally {
      setIsImprovingSection(false);
    }
  };

  const handleExportBuilderJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(builderData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Resume_${builderData.personalInfo.fullName.replace(/\s+/g, "_")}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleSendToATS = () => {
    let compiled = `${builderData.personalInfo.fullName}\n${builderData.personalInfo.email} | ${builderData.personalInfo.phone} | ${builderData.personalInfo.location}\nLinkedIn: ${builderData.personalInfo.linkedin} | GitHub: ${builderData.personalInfo.github}\n\nSUMMARY:\n${builderData.summary}\n\nEXPERIENCE:\n`;
    builderData.experience.forEach((exp) => {
      compiled += `${exp.role} at ${exp.company} (${exp.startDate} - ${exp.endDate})\n`;
      exp.bullets.forEach((b) => (compiled += `• ${b}\n`));
    });
    compiled += "\nPROJECTS:\n";
    builderData.projects.forEach((proj) => {
      compiled += `${proj.name} [${proj.techStack}]\n`;
      proj.bullets.forEach((b) => (compiled += `• ${b}\n`));
    });
    compiled += "\nSKILLS:\n";
    compiled += `Languages: ${builderData.skills?.languages?.join(", ") || ""}\n`;
    compiled += `Frameworks: ${builderData.skills?.frameworks?.join(", ") || ""}\n`;
    compiled += `Tools & Databases: ${builderData.skills?.toolsDatabases?.join(", ") || ""}\n`;
    onEvaluateATS(compiled);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 sm:p-7 backdrop-blur-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white font-mono flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-neutral-400" />
              Resume Builder & Section Editor
            </h2>
            <p className="text-xs text-neutral-400">
              Structured resume editor with XYZ metric bullet enhancements and ATS synchronization.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleExportBuilderJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-neutral-200 border border-white/[0.08] rounded-xl text-xs font-medium transition"
            >
              <Download className="w-3.5 h-3.5" />
              Export JSON
            </button>
            <button
              onClick={handleSendToATS}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-black font-semibold rounded-xl text-xs shadow-sm hover:bg-neutral-200 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Evaluate ATS Score
            </button>
          </div>
        </div>

        {/* 1. Personal Information */}
        <div className="space-y-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block">
            Personal Information
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={builderData.personalInfo.fullName}
              onChange={(e) =>
                setBuilderData({
                  ...builderData,
                  personalInfo: { ...builderData.personalInfo, fullName: e.target.value }
                })
              }
              placeholder="Full Name"
              className="px-3.5 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-white/30"
            />
            <input
              type="email"
              value={builderData.personalInfo.email}
              onChange={(e) =>
                setBuilderData({
                  ...builderData,
                  personalInfo: { ...builderData.personalInfo, email: e.target.value }
                })
              }
              placeholder="Email Address"
              className="px-3.5 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-white/30"
            />
            <input
              type="text"
              value={builderData.personalInfo.linkedin}
              onChange={(e) =>
                setBuilderData({
                  ...builderData,
                  personalInfo: { ...builderData.personalInfo, linkedin: e.target.value }
                })
              }
              placeholder="LinkedIn Profile URL"
              className="px-3.5 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-white/30"
            />
          </div>
        </div>

        {/* 2. Professional Summary */}
        <div className="space-y-2 pt-2 border-t border-white/[0.06]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              Professional Summary
            </span>
            <button
              onClick={handleAISummaryOptimize}
              disabled={isImprovingSection}
              className="flex items-center gap-1 text-[11px] text-neutral-300 hover:text-white bg-white/[0.05] border border-white/[0.08] px-2.5 py-1 rounded-lg transition font-mono"
            >
              <Sparkles className="w-3 h-3 text-emerald-400" />
              {isImprovingSection ? "Optimizing..." : "Polish Summary"}
            </button>
          </div>
          <textarea
            rows={3}
            value={builderData.summary}
            onChange={(e) => setBuilderData({ ...builderData, summary: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-neutral-200 focus:outline-none focus:border-white/30 resize-none font-sans leading-relaxed"
          />
        </div>

        {/* 3. Work Experience */}
        <div className="space-y-4 pt-2 border-t border-white/[0.06]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              Work Experience & Bullets
            </span>
            <button
              onClick={() => {
                const newExp = {
                  id: `exp-${Date.now()}`,
                  role: "Software Engineer",
                  company: "Tech Enterprise",
                  location: "Remote",
                  startDate: "2024",
                  endDate: "Present",
                  bullets: ["Engineered scalable backend service improving response time by 25%."]
                };
                setBuilderData({ ...builderData, experience: [...builderData.experience, newExp] });
              }}
              className="flex items-center gap-1 text-[11px] text-neutral-300 hover:text-white bg-white/[0.05] px-2.5 py-1 rounded-lg border border-white/[0.08] transition"
            >
              <Plus className="w-3 h-3" />
              Add Role
            </button>
          </div>

          <div className="space-y-4">
            {builderData.experience.map((exp, expIdx) => (
              <div
                key={exp.id || expIdx}
                className="bg-black/30 border border-white/[0.06] p-4 rounded-xl space-y-3.5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={exp.role}
                    onChange={(e) => {
                      const updated = { ...builderData };
                      updated.experience[expIdx].role = e.target.value;
                      setBuilderData(updated);
                    }}
                    placeholder="Role / Title"
                    className="px-3 py-1.5 bg-black/40 border border-white/[0.08] rounded-lg text-xs font-medium text-white focus:outline-none focus:border-white/30"
                  />
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => {
                      const updated = { ...builderData };
                      updated.experience[expIdx].company = e.target.value;
                      setBuilderData(updated);
                    }}
                    placeholder="Company / Organization"
                    className="px-3 py-1.5 bg-black/40 border border-white/[0.08] rounded-lg text-xs font-medium text-neutral-300 focus:outline-none focus:border-white/30"
                  />
                </div>

                {/* Bullets List */}
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                    Impact Bullet Points (XYZ Framework):
                  </span>
                  {exp.bullets.map((bullet, bIdx) => (
                    <div key={bIdx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={bullet}
                        onChange={(e) => {
                          const updated = { ...builderData };
                          updated.experience[expIdx].bullets[bIdx] = e.target.value;
                          setBuilderData(updated);
                        }}
                        className="flex-1 px-3 py-1.5 bg-black/40 border border-white/[0.08] rounded-lg text-xs text-neutral-200 focus:outline-none focus:border-white/30"
                      />
                      <button
                        onClick={() => handleAIImproveBullet(bullet, expIdx, bIdx)}
                        disabled={improvingBulletKey === `${expIdx}-${bIdx}`}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-neutral-200 rounded-lg text-[11px] font-medium shrink-0 transition font-mono"
                      >
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        {improvingBulletKey === `${expIdx}-${bIdx}` ? "..." : "Enhance Bullet"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bullet Improvement Modal */}
      {bulletImprovementModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b0d14] border border-white/[0.12] rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white font-mono flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Select Bullet Improvement (XYZ Formula)
              </h3>
              <button
                onClick={() => setBulletImprovementModal(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 block">
                Recommended Formulation:
              </span>
              <div
                onClick={() => applyImprovedBullet(bulletImprovementModal.data.improved_xyz)}
                className="p-3.5 bg-emerald-500/[0.06] border border-emerald-500/30 hover:border-emerald-400 rounded-xl cursor-pointer transition text-xs text-emerald-200 font-medium"
              >
                {bulletImprovementModal.data.improved_xyz}
              </div>

              {bulletImprovementModal.data.alternative_versions?.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block">
                    Alternative Options:
                  </span>
                  {bulletImprovementModal.data.alternative_versions.map((alt, idx) => (
                    <div
                      key={idx}
                      onClick={() => applyImprovedBullet(alt)}
                      className="p-3 bg-black/40 border border-white/[0.08] hover:border-white/30 rounded-xl cursor-pointer transition text-xs text-neutral-300"
                    >
                      {alt}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setBulletImprovementModal(null)}
                className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-neutral-300 rounded-xl text-xs transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
