import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import gsap from "gsap";
import { BookOpen, Code, Code2, Sparkles, BarChart3, GraduationCap, Target, Activity, Layers } from "lucide-react";
import dsaTopics from "../data/dsaContent.js";
import { TopicCard } from "../components/dsa_content/TopicCard";
import { VideoPlayer } from "../components/dsa_content/VideoPlayer";
import { AssignmentList } from "../components/dsa_content/AssignmentList";
import DsaTopicAnalysis from "@/components/dsa/DsaTopicAnalysis";
import DsaRequirementComparison from "@/components/dsa/DsaRequirementComparison";
import LeetCodeSubmissionAnalysis from "@/components/leetcode/LeetCodeSubmissionAnalysis";
import SheetsHub from "@/components/sheets/SheetsHub";

export default function DSAContent({ defaultTab = null }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { sheetId } = useParams();

  const tabFromUrl = searchParams.get("tab") || (sheetId ? "sheets" : defaultTab || "sheets");
  const [mainTab, setMainTab] = useState(tabFromUrl); // 'sheets' | 'comparison' | 'analysis' | 'submissions' | 'curriculum'
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [activeTab, setActiveTab] = useState("lectures");
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
  }, [mainTab, selectedTopic]);

  const handleTabSwitch = (newTab) => {
    setMainTab(newTab);
    setSelectedTopic(null);
    setSearchParams({ tab: newTab }, { replace: true });
  };

  const handleLectureComplete = (lectureId) => {
    console.log(`Lecture ${lectureId} completed`);
  };

  const handleAssignmentToggle = (assignmentId) => {
    console.log(`Assignment ${assignmentId} toggled`);
  };

  return (
    <main className="overflow-x-hidden w-full max-w-full min-h-screen bg-[#09090b] text-zinc-100 p-4 md:p-8 lg:p-10 font-sans selection:bg-zinc-800 selection:text-zinc-100">
      <div ref={containerRef} className="max-w-6xl mx-auto space-y-8">
        {/* Top Header */}
        <header className="gsap-reveal flex flex-col gap-4 border-b border-zinc-800/80 pb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-zinc-100 tracking-tight flex items-center gap-3">
              <Code2 className="w-7 h-7 text-purple-400" />
              DSA Analytics & Placement Curricula
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              28 Striver master sheets & playlists, target benchmark gap analysis, topic proficiency, and Monaco IDE problem solver.
            </p>
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
              <span>Striver Sheets (28)</span>
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
              onClick={() => handleTabSwitch("analysis")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md transition-all cursor-pointer ${
                mainTab === "analysis"
                  ? "bg-zinc-100 text-zinc-950 font-bold shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Topic Analysis</span>
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

            <button
              type="button"
              onClick={() => handleTabSwitch("curriculum")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md transition-all cursor-pointer ${
                mainTab === "curriculum"
                  ? "bg-zinc-100 text-zinc-950 font-bold shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Video Modules</span>
            </button>
          </div>
        </header>

        {/* Main Tab 0: Striver & Placement Curricula Sheets (28 Lists) */}
        {mainTab === "sheets" && (
          <section className="gsap-reveal space-y-6">
            <SheetsHub initialSheetId={sheetId || searchParams.get("sheet")} />
          </section>
        )}

        {/* Main Tab 1: DSA Readiness vs Target Company Benchmark */}
        {mainTab === "comparison" && (
          <section className="gsap-reveal space-y-6">
            <DsaRequirementComparison />
          </section>
        )}

        {/* Main Tab 2: Topic Proficiency Analysis Engine */}
        {mainTab === "analysis" && (
          <section className="gsap-reveal space-y-6">
            <DsaTopicAnalysis />
          </section>
        )}

        {/* Main Tab 3: Submission Activity & Consistency Analysis */}
        {mainTab === "submissions" && (
          <section className="gsap-reveal space-y-6">
            <LeetCodeSubmissionAnalysis />
          </section>
        )}

        {/* Main Tab 4: Curriculum & Video Lectures */}
        {mainTab === "curriculum" && (
          <section className="gsap-reveal space-y-6">
            {selectedTopic ? (
              <div className="space-y-6">
                <button
                  type="button"
                  onClick={() => setSelectedTopic(null)}
                  className="text-xs text-zinc-400 hover:text-white inline-flex items-center gap-1.5 cursor-pointer font-mono"
                >
                  <span>← Back to Curriculum Modules</span>
                </button>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121215] border border-zinc-800 p-4 rounded-xl">
                  <div>
                    <h2 className="text-lg font-bold text-white">{selectedTopic.title}</h2>
                    <p className="text-xs text-zinc-400 font-mono mt-0.5">
                      {selectedTopic.lectures?.length || 0} Lectures · {selectedTopic.assignments?.length || 0} Assignment Problems
                    </p>
                  </div>

                  <div className="flex gap-2 font-mono">
                    <button
                      type="button"
                      onClick={() => setActiveTab("lectures")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        activeTab === "lectures"
                          ? "bg-zinc-100 text-zinc-950 font-bold"
                          : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Lectures</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("assignments")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        activeTab === "assignments"
                          ? "bg-zinc-100 text-zinc-950 font-bold"
                          : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
                      }`}
                    >
                      <Code className="w-3.5 h-3.5" />
                      <span>Assignments</span>
                    </button>
                  </div>
                </div>

                {activeTab === "lectures" ? (
                  <div className="grid gap-6">
                    {selectedTopic.lectures.map((lecture) => (
                      <VideoPlayer
                        key={lecture.id}
                        lecture={lecture}
                        onComplete={() => handleLectureComplete(lecture.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <AssignmentList
                    assignments={selectedTopic.assignments}
                    onToggleComplete={handleAssignmentToggle}
                  />
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-widest font-mono">
                    15 Core Curriculum Modules
                  </h3>
                  <span className="text-[11px] text-zinc-500 font-mono">Video Lessons & Curated Problem Sets</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dsaTopics.map((topic) => (
                    <TopicCard
                      key={topic.id}
                      topic={topic}
                      onClick={() => setSelectedTopic(topic)}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
