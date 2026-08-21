import React, { useState } from "react";
import { BookOpen, Code, Code2, Sparkles, BarChart3, GraduationCap, Target, Activity } from "lucide-react";
import dsaTopics from "../data/dsaContent.js";
import { TopicCard } from "../components/dsa_content/TopicCard";
import { VideoPlayer } from "../components/dsa_content/VideoPlayer";
import { AssignmentList } from "../components/dsa_content/AssignmentList";
import DsaTopicAnalysis from "@/components/dsa/DsaTopicAnalysis";
import DsaRequirementComparison from "@/components/dsa/DsaRequirementComparison";
import LeetCodeSubmissionAnalysis from "@/components/leetcode/LeetCodeSubmissionAnalysis";

function DSAContent() {
  const [mainTab, setMainTab] = useState("comparison"); // 'comparison' | 'analysis' | 'submissions' | 'curriculum'
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [activeTab, setActiveTab] = useState("lectures");

  const handleLectureComplete = (lectureId) => {
    console.log(`Lecture ${lectureId} completed`);
  };

  const handleAssignmentToggle = (assignmentId) => {
    console.log(`Assignment ${assignmentId} toggled`);
  };

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-zinc-100 p-4 md:p-8 lg:p-10 space-y-8 max-w-6xl mx-auto font-sans">
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-100 tracking-tight flex items-center gap-3">
            <Code2 className="w-8 h-8 text-purple-500" />
            DSA Analytics & Learning Hub
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Target company benchmark gaps, topic-level proficiency analysis, and structured curriculum modules.
          </p>
        </div>

        {/* Surface Switcher Tabs */}
        <div className="inline-flex items-center bg-zinc-900 border border-zinc-800 p-1 rounded-lg self-start sm:self-auto text-xs font-mono">
          <button
            type="button"
            onClick={() => setMainTab("comparison")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md transition-all cursor-pointer ${
              mainTab === "comparison"
                ? "bg-purple-600 text-white font-medium shadow-sm shadow-purple-900/50"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Target Benchmark</span>
          </button>

          <button
            type="button"
            onClick={() => setMainTab("analysis")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md transition-all cursor-pointer ${
              mainTab === "analysis"
                ? "bg-purple-600 text-white font-medium shadow-sm shadow-purple-900/50"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Topic Analysis</span>
          </button>

          <button
            type="button"
            onClick={() => setMainTab("submissions")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md transition-all cursor-pointer ${
              mainTab === "submissions"
                ? "bg-purple-600 text-white font-medium shadow-sm shadow-purple-900/50"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Submission Activity</span>
          </button>

          <button
            type="button"
            onClick={() => setMainTab("curriculum")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md transition-all cursor-pointer ${
              mainTab === "curriculum"
                ? "bg-purple-600 text-white font-medium shadow-sm shadow-purple-900/50"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Curriculum Modules</span>
          </button>
        </div>
      </header>

      {/* Main Tab 1: DSA Readiness vs Target Company Benchmark */}
      {mainTab === "comparison" && (
        <section className="space-y-6">
          <DsaRequirementComparison />
        </section>
      )}

      {/* Main Tab 2: Topic Proficiency Analysis Engine */}
      {mainTab === "analysis" && (
        <section className="space-y-6">
          <DsaTopicAnalysis />
        </section>
      )}

      {/* Main Tab 3: Submission Activity & Consistency Analysis */}
      {mainTab === "submissions" && (
        <section className="space-y-6">
          <LeetCodeSubmissionAnalysis />
        </section>
      )}

      {/* Main Tab 2: Curriculum & Video Lectures */}
      {mainTab === "curriculum" && (
        <section className="space-y-6">
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

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("lectures")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      activeTab === "lectures"
                        ? "bg-purple-600 text-white font-medium"
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
                        ? "bg-purple-600 text-white font-medium"
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
                <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider font-mono">
                  15 Core Curriculum Modules
                </h3>
                <span className="text-xs text-zinc-500 font-mono">Video Lessons & Curated Problem Sets</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
  );
}

export default DSAContent;
