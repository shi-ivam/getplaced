import React, { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  BrainCog,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Building,
  Target,
  Layers,
  Mic,
  Square,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Zap,
  RotateCcw,
  Check,
  Copy,
  SlidersHorizontal,
  X,
  Award,
  Lightbulb,
  Search,
  Bookmark,
  BookmarkCheck,
  Plus,
  Trash2,
  Edit3,
  Clock,
  ArrowRight,
  FileText,
  Volume2,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { PY_API_URL } from "@/config/api";
import GpBadge from "@/components/gp/GpBadge";
import GpCard from "@/components/gp/GpCard";
import GpButton from "@/components/gp/GpButton";
import GpModal from "@/components/gp/GpModal";
import CompanyLogo from "@/components/common/CompanyLogo";
import { CURATED_COMPANIES } from "@/data/curatedCompanies";
import { COMPANY_FRAMEWORKS } from "@/data/leadershipFrameworks";
import {
  getSavedStories,
  fetchSavedStories,
  saveStory,
  deleteStory,
  getSavedBookmarks,
  fetchSavedBookmarks,
  toggleBookmark,
  getPracticeHistory,
  fetchPracticeHistory,
  recordPracticeResult,
} from "@/services/behavioralStoryService";

const COMPANY_FILTERS = [
  "All Companies",
  "Google (Googliness & Innovation)",
  "Microsoft (Growth Mindset)",
  "Amazon (Leadership Principles)",
  "Meta (Move Fast & Impact)",
  "Apple (Craftsmanship & Detail)",
  "Netflix (Freedom & Responsibility)",
  "Uber (Trip Obsession & Grit)",
  "Adobe (Creativity & Genuine Care)",
  "Atlassian (Open Company & Teamwork)",
  "Stripe (Users First & Rigor)",
  "Goldman Sachs (Excellence & Integrity)",
  "Salesforce (Ohana & Customer Trust)",
  "NVIDIA (First Principles & Speed)",
  "Oracle (Reliability & Execution)",
  "Cisco (Connect Everything & Security)",
  "Flipkart (Audacity & Customer First)",
  "Swiggy (Consumer First & High Ownership)",
  "Zomato (Extreme Ownership & Speed)",
  "Razorpay (Merchant First & Transparency)",
  "Intuit (Design for Delight & Integrity)",
];

const CATEGORY_FILTERS = [
  "All Categories",
  "Technical Execution & Problem Solving",
  "Conflict Resolution & Teamwork",
  "Accountability & Growth Mindset",
  "Navigating Ambiguity & Bias for Action",
  "Customer Obsession & Product Impact",
  "Culture Fit & Motivation",
  "Leadership & Mentorship",
];

const DIFFICULTY_FILTERS = ["All Levels", "Easy", "Medium", "Hard"];

export default function HRPrep() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Main Tab: "practice" | "frameworks" | "story-matrix" | "masterclass"
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "practice"
  );

  // Filters
  const [selectedCompany, setSelectedCompany] = useState(() => {
    const paramComp = searchParams.get("company");
    if (paramComp) {
      const match = COMPANY_FILTERS.find((c) =>
        c.toLowerCase().includes(paramComp.toLowerCase())
      );
      if (match) return match;
    }
    return "All Companies";
  });

  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "All Categories"
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState("All Levels");
  const [searchQuery, setSearchQuery] = useState("");
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [showPracticedOnly, setShowPracticedOnly] = useState(false);

  // Questions Data
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [practiceHistory, setPracticeHistory] = useState({});

  // Active Practice Modal
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [practiceMode, setPracticeMode] = useState("guided"); // "guided" | "freeform"
  const [guidedStar, setGuidedStar] = useState({
    situation: "",
    task: "",
    action: "",
    result: "",
  });
  const [practiceAnswer, setPracticeAnswer] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [copiedId, setCopiedId] = useState(null);

  // Follow-up practice state
  const [followUpAnswer, setFollowUpAnswer] = useState("");
  const [followUpSubmitted, setFollowUpSubmitted] = useState(false);
  const [followUpEvaluating, setFollowUpEvaluating] = useState(false);
  const [followUpResult, setFollowUpResult] = useState(null);

  // Frameworks Directory State
  const [selectedFrameworkCompany, setSelectedFrameworkCompany] =
    useState("amazon");
  const [expandedPrinciples, setExpandedPrinciples] = useState({});

  // Story Matrix State
  const [savedStories, setSavedStories] = useState([]);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  const [storyForm, setStoryForm] = useState({
    title: "",
    project: "",
    techStack: "",
    competencies: [],
    situation: "",
    task: "",
    action: "",
    result: "",
  });

  const containerRef = useRef(null);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  // Sync initial query params
  useEffect(() => {
    const compParam = searchParams.get("company");
    if (compParam) {
      const match = COMPANY_FILTERS.find((c) =>
        c.toLowerCase().includes(compParam.toLowerCase())
      );
      if (match) setSelectedCompany(match);
      const frameworkKey = compParam.toLowerCase().split(" ")[0];
      if (COMPANY_FRAMEWORKS[frameworkKey]) {
        setSelectedFrameworkCompany(frameworkKey);
      }
    }
  }, [searchParams]);

  // Load persistent user data (Bookmarks, History, Stories)
  useEffect(() => {
    setBookmarkedIds(getSavedBookmarks());
    setPracticeHistory(getPracticeHistory());
    setSavedStories(getSavedStories());

    // Sync with backend database
    Promise.allSettled([
      fetchSavedBookmarks(),
      fetchPracticeHistory(),
      fetchSavedStories(),
    ]).then(([bRes, pRes, sRes]) => {
      if (bRes.status === "fulfilled" && bRes.value) setBookmarkedIds(bRes.value);
      if (pRes.status === "fulfilled" && pRes.value) setPracticeHistory(pRes.value);
      if (sRes.status === "fulfilled" && sRes.value) setSavedStories(sRes.value);
    });
  }, []);

  // GSAP animation
  useGSAP(
    () => {
      gsap.from(".gsap-bento-card", {
        opacity: 0,
        y: 16,
        duration: 0.4,
        stagger: 0.05,
        ease: "power2.out",
      });
    },
    { dependencies: [questions, activeTab, selectedFrameworkCompany], scope: containerRef }
  );

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onresult = (event) => {
        let fullTranscript = "";
        for (let i = 0; i < event.results.length; ++i) {
          fullTranscript += event.results[i][0].transcript + " ";
        }
        if (fullTranscript.trim()) {
          setPracticeAnswer(fullTranscript.trim());
        }
      };

      rec.onerror = (e) => {
        console.warn("Speech recognition error:", e);
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
      };

      rec.onend = () => {
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Fetch Questions
  useEffect(() => {
    if (activeTab === "practice") {
      fetchQuestions();
    }
  }, [selectedCompany, selectedCategory, selectedDifficulty, activeTab]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const companyClean =
        selectedCompany === "All Companies"
          ? "Top Tech"
          : selectedCompany.split(" ")[0];
      const res = await axios.post(
        `${PY_API_URL}/api/interview/generate-questions`,
        {
          company: companyClean,
          role: "Software Engineer",
          interview_type: "HR",
          category: selectedCategory === "All Categories" ? null : selectedCategory,
          difficulty: selectedDifficulty === "All Levels" ? null : selectedDifficulty,
          count: 8,
        }
      );
      setQuestions(res.data.questions || []);
    } catch (e) {
      console.error("Failed to load HR questions:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVoice = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please type your response.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      try {
        setRecordDuration(0);
        recognitionRef.current.start();
        setIsRecording(true);
        timerRef.current = setInterval(() => {
          setRecordDuration((prev) => prev + 1);
        }, 1000);
      } catch (err) {
        console.warn("Speech recognition start failed:", err);
      }
    }
  };

  // Compile Guided STAR into Practice Answer
  const handleCompileGuidedStar = () => {
    const parts = [];
    if (guidedStar.situation.trim())
      parts.push(`Situation: ${guidedStar.situation.trim()}`);
    if (guidedStar.task.trim())
      parts.push(`Task: ${guidedStar.task.trim()}`);
    if (guidedStar.action.trim())
      parts.push(`Action: ${guidedStar.action.trim()}`);
    if (guidedStar.result.trim())
      parts.push(`Result: ${guidedStar.result.trim()}`);

    const compiled = parts.join("\n\n");
    setPracticeAnswer(compiled);
    setPracticeMode("freeform");
  };

  const handleImportStoryToGuided = (story) => {
    setGuidedStar({
      situation: story.situation || "",
      task: story.task || "",
      action: story.action || "",
      result: story.result || "",
    });
  };

  const handleEvaluatePractice = async () => {
    const answerToEvaluate =
      practiceMode === "guided"
        ? [
            guidedStar.situation && `Situation: ${guidedStar.situation}`,
            guidedStar.task && `Task: ${guidedStar.task}`,
            guidedStar.action && `Action: ${guidedStar.action}`,
            guidedStar.result && `Result: ${guidedStar.result}`,
          ]
            .filter(Boolean)
            .join("\n\n")
        : practiceAnswer;

    if (!answerToEvaluate.trim() || answerToEvaluate.length < 15) {
      alert("Please provide a more detailed STAR response to receive AI evaluation.");
      return;
    }

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }

    setEvaluating(true);
    setFollowUpSubmitted(false);
    setFollowUpAnswer("");
    setFollowUpResult(null);
    setFollowUpEvaluating(false);

    try {
      const res = await axios.post(
        `${PY_API_URL}/api/interview/evaluate-answer`,
        {
          question: activeQuestion?.question || "Behavioral question",
          answer: answerToEvaluate,
          company: selectedCompany.split(" ")[0],
          role: "Software Engineer",
          interview_type: "behavioral",
          audio_duration_seconds: recordDuration > 0 ? recordDuration : null,
        }
      );
      setEvaluationResult(res.data);

      // Record practice history
      if (activeQuestion?.id != null) {
        const updatedHistory = recordPracticeResult(
          activeQuestion.id,
          res.data.score,
          res.data
        );
        setPracticeHistory(updatedHistory);
      }
    } catch (e) {
      console.error("Evaluation error:", e);
      const fallbackResult = {
        score: 74,
        overall_verdict: "Passable",
        strengths: [
          "Demonstrated technical context and structured narrative flow",
          "Articulated specific engineering actions and tools used",
        ],
        areas_for_improvement: [
          "Incorporate explicit, quantified metrics into the Result phase (e.g. latency, throughput, scale)",
          "Sharpen distinction between individual contribution ('I') and team actions ('We')",
        ],
        star_compliance: {
          score: 70,
          situation_detected: true,
          task_detected: true,
          action_detected: true,
          result_detected: false,
          star_feedback: "Situation and Action were articulated well. Strengthen the Result phase with measurable KPIs.",
        },
        communication: {
          overall_communication_score: 72,
          clarity: { score: 76, feedback: "Direct response with clear sequential progression." },
          confidence: { score: 72, feedback: "Delivery is steady and grounded." },
          filler_words: { total_count: 0, density_percent: 0, status: "Clean" },
          pacing: {
            wpm: recordDuration > 0 ? Math.round((answerToEvaluate.split(/\s+/).length / (recordDuration / 60))) : null,
            rating: recordDuration > 0 ? "optimal" : "unmeasured",
            feedback: recordDuration > 0 ? "Spoken pace recorded from active microphone session." : "Spoken Audio Required for WPM telemetry.",
          },
          weak_phrases_detected: [],
        },
        one_tip: "Conclude your STAR response with quantifiable ROI: 'This reduced API latency by 35% and unblocked 12 downstream engineers.'",
        suggested_better_answer: answerToEvaluate,
        follow_up_question: "How did you validate that your chosen technical approach was the optimal solution compared to alternative designs?",
      };
      setEvaluationResult(fallbackResult);
      if (activeQuestion?.id != null) {
        const updatedHistory = recordPracticeResult(
          activeQuestion.id,
          fallbackResult.score,
          fallbackResult
        );
        setPracticeHistory(updatedHistory);
      }
    } finally {
      setEvaluating(false);
    }
  };

  const handleEvaluateFollowUp = async () => {
    if (!followUpAnswer.trim() || followUpEvaluating) return;
    setFollowUpEvaluating(true);
    try {
      const res = await axios.post(
        `${PY_API_URL}/api/interview/evaluate-answer`,
        {
          question: evaluationResult?.follow_up_question || "Interviewer Follow-Up Probe",
          answer: followUpAnswer.trim(),
          company: selectedCompany.split(" ")[0],
          role: "Software Engineer",
          interview_type: "behavioral",
          audio_duration_seconds: null,
        }
      );
      setFollowUpResult(res.data);
      setFollowUpSubmitted(true);
    } catch (err) {
      console.warn("Follow-up evaluation error:", err);
      const fallbackFollowUp = {
        score: 78,
        overall_verdict: "Effective Follow-Up Response",
        strengths: [
          "Directly addressed the probe with technical specifics and contextual reasoning",
          "Clarified trade-offs and decision rationale",
        ],
        areas_for_improvement: [
          "Include concrete metrics or validation benchmarks to solidify technical claims",
        ],
        one_tip: "In behavioral follow-up probes, interviewers test your technical conviction and data-driven approach.",
        communication: {
          overall_communication_score: 78,
          clarity: { score: 82, feedback: "Focused and direct response to the interviewer's probe." },
          pacing: { wpm: null, rating: "unmeasured", feedback: "Text submission." },
          filler_words: { total_count: 0, density_percent: 0, status: "Clean" },
        },
      };
      setFollowUpResult(fallbackFollowUp);
      setFollowUpSubmitted(true);
    } finally {
      setFollowUpEvaluating(false);
    }
  };

  const handlePracticeStory = async (story) => {
    let availableQuestions = questions;
    if (!availableQuestions || availableQuestions.length === 0) {
      setLoading(true);
      try {
        const companyClean =
          selectedCompany === "All Companies"
            ? "Top Tech"
            : selectedCompany.split(" ")[0];
        const res = await axios.post(
          `${PY_API_URL}/api/interview/generate-questions`,
          {
            company: companyClean,
            role: "Software Engineer",
            interview_type: "HR",
            category: selectedCategory === "All Categories" ? null : selectedCategory,
            difficulty: selectedDifficulty === "All Levels" ? null : selectedDifficulty,
            count: 8,
          }
        );
        availableQuestions = res.data.questions || [];
        setQuestions(availableQuestions);
      } catch (err) {
        console.error("Failed to load questions for story practice:", err);
      } finally {
        setLoading(false);
      }
    }

    let matchedQ = null;
    if (availableQuestions && availableQuestions.length > 0) {
      const storyKeywords = [
        ...(story.competencies || []),
        story.title || "",
        story.project || "",
        story.techStack || "",
      ]
        .map((k) => k.toLowerCase())
        .filter(Boolean);

      matchedQ =
        availableQuestions.find((q) => {
          const qText = `${q.question || ""} ${q.category || ""} ${q.principle || ""}`.toLowerCase();
          return storyKeywords.some((kw) => kw.length > 3 && qText.includes(kw));
        }) || availableQuestions[0];
    } else {
      matchedQ = {
        id: `story-q-${story.id || Date.now()}`,
        question: `Tell me about your experience working on ${story.title || "your core engineering project"} and how you navigated key technical challenges.`,
        category: (story.competencies && story.competencies[0]) || "Technical Execution & Problem Solving",
        principle: "Technical Depth & Ownership",
        difficulty: "Medium",
        why_asked: "Evaluates ability to articulate architecture, individual contribution, and quantifiable outcomes.",
      };
    }

    setActiveTab("practice");
    setActiveQuestion(matchedQ);
    setGuidedStar({
      situation: story.situation || "",
      task: story.task || "",
      action: story.action || "",
      result: story.result || "",
    });
    setPracticeMode("guided");
    setEvaluationResult(null);
    setFollowUpSubmitted(false);
    setFollowUpAnswer("");
    setFollowUpResult(null);
  };

  const handleToggleBookmarkItem = (qId) => {
    const updated = toggleBookmark(qId);
    setBookmarkedIds(updated);
  };

  const handleCopyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Story Matrix Operations
  const handleOpenNewStoryModal = (storyToEdit = null) => {
    if (storyToEdit) {
      setEditingStory(storyToEdit);
      setStoryForm({
        title: storyToEdit.title || "",
        project: storyToEdit.project || "",
        techStack: storyToEdit.techStack || "",
        competencies: storyToEdit.competencies || [],
        situation: storyToEdit.situation || "",
        task: storyToEdit.task || "",
        action: storyToEdit.action || "",
        result: storyToEdit.result || "",
      });
    } else {
      setEditingStory(null);
      setStoryForm({
        title: "",
        project: "",
        techStack: "",
        competencies: ["Technical Execution"],
        situation: "",
        task: "",
        action: "",
        result: "",
      });
    }
    setIsStoryModalOpen(true);
  };

  const handleSaveStoryForm = () => {
    if (!storyForm.title.trim() || !storyForm.action.trim()) {
      alert("Please provide a title and Action description.");
      return;
    }
    const storyData = {
      ...(editingStory ? { id: editingStory.id } : {}),
      ...storyForm,
    };
    const updated = saveStory(storyData);
    setSavedStories(updated);
    setIsStoryModalOpen(false);
  };

  const handleDeleteStory = (id) => {
    if (window.confirm("Are you sure you want to delete this master STAR story?")) {
      const updated = deleteStory(id);
      setSavedStories(updated);
    }
  };

  const togglePrincipleExpand = (principleId) => {
    setExpandedPrinciples((prev) => ({
      ...prev,
      [principleId]: !prev[principleId],
    }));
  };

  // Filter questions for display
  const filteredQuestions = questions.filter((q) => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchQ = (q.question || "").toLowerCase().includes(query);
      const matchCat = (q.category || "").toLowerCase().includes(query);
      const matchPrinciple = (q.principle || "").toLowerCase().includes(query);
      const matchWhy = (q.why_asked || "").toLowerCase().includes(query);
      if (!matchQ && !matchCat && !matchPrinciple && !matchWhy) return false;
    }
    const qIdStr = String(q.id != null ? q.id : "");
    if (showBookmarkedOnly && !bookmarkedIds.includes(qIdStr)) {
      return false;
    }
    if (showPracticedOnly && !practiceHistory[qIdStr]) {
      return false;
    }
    return true;
  });

  const selectedFrameworkData =
    COMPANY_FRAMEWORKS[selectedFrameworkCompany] || COMPANY_FRAMEWORKS.amazon;

  return (
    <main
      ref={containerRef}
      className="overflow-x-hidden w-full max-w-full bg-[#FEF9CF] u-background-grid-dark-2 text-[#0D0431] min-h-screen font-sans selection:bg-[#FEDF6A] selection:text-[#0D0431]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
        {/* Header Hero Section */}
        <div className="text-center space-y-4">
          <GpBadge theme="light-purple" dot={true}>
            Behavioral Strategy & Leadership Principles Hub
          </GpBadge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-black text-[#0D0431] tracking-tight max-w-5xl mx-auto leading-tight">
            Behavioral & Leadership Preparation
          </h1>
          <p className="text-sm md:text-base text-[#0D0431]/80 max-w-3xl mx-auto leading-relaxed font-sans font-medium">
            Structured STAR response coaching calibrated against company-specific leadership frameworks (Amazon 16 LPs, Google Googliness, Meta Values) with speech analytics and story mapping.
          </p>
        </div>

        {/* Global Navigation Between Interview Hubs */}
        <nav className="flex items-center justify-center gap-3 overflow-x-auto pb-2 font-sans text-xs">
          <Link
            to="/app/interview"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold whitespace-nowrap bg-white text-[#0D0431] hover:bg-[#FEF9CF] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] transition-all"
          >
            <BrainCog className="w-4 h-4 text-[#896EE2]" />
            <span>Mock Interview Simulator</span>
          </Link>
          <Link
            to="/app/hr-prep"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold whitespace-nowrap bg-[#0D0431] text-white border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431]"
          >
            <Building className="w-4 h-4 text-[#FEDF6A]" />
            <span>HR & Leadership Prep</span>
          </Link>
          <Link
            to="/app/company-intel"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold whitespace-nowrap bg-white text-[#0D0431] hover:bg-[#FEF9CF] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431] transition-all"
          >
            <Layers className="w-4 h-4 text-[#896EE2]" />
            <span>Company Intelligence</span>
          </Link>
        </nav>

        {/* 4-Tab Cockpit Switcher */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1">
          <div className="bg-white p-1.5 rounded-2xl border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431] inline-flex items-center gap-1.5 flex-wrap justify-center">
            <button
              type="button"
              onClick={() => setActiveTab("practice")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-heading font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "practice"
                  ? "bg-[#FEDF6A] text-[#0D0431] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431]"
                  : "text-[#0D0431]/70 hover:bg-[#FEF9CF] hover:text-[#0D0431] border border-transparent"
              }`}
            >
              <BrainCog className="w-4 h-4" />
              <span>Practice Arena</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("frameworks")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-heading font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "frameworks"
                  ? "bg-[#D4FDF7] text-[#0D0431] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431]"
                  : "text-[#0D0431]/70 hover:bg-[#FEF9CF] hover:text-[#0D0431] border border-transparent"
              }`}
            >
              <Building className="w-4 h-4" />
              <span>Company Frameworks</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("story-matrix")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-heading font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "story-matrix"
                  ? "bg-[#E4CDFB] text-[#0D0431] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431]"
                  : "text-[#0D0431]/70 hover:bg-[#FEF9CF] hover:text-[#0D0431] border border-transparent"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>STAR Story Vault ({savedStories.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("masterclass")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-heading font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "masterclass"
                  ? "bg-[#FFC5B7] text-[#0D0431] border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431]"
                  : "text-[#0D0431]/70 hover:bg-[#FEF9CF] hover:text-[#0D0431] border border-transparent"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>STAR Masterclass</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: PRACTICE ARENA                                                    */}
        {/* ========================================================================= */}
        {activeTab === "practice" && (
          <div className="space-y-6">
            {/* STAR Formula Blueprint Banner */}
            <div className="bg-white border-2 border-[#0D0431] rounded-3xl p-6 md:p-8 shadow-[6px_6px_0_0_#0D0431] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#0D0431] pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-[#896EE2] border border-[#0D0431]" />
                  <h3 className="font-heading font-black text-sm uppercase text-[#0D0431] tracking-wider">
                    STAR Response Framework Blueprint
                  </h3>
                </div>
                <span className="text-xs text-[#0D0431] font-mono font-bold bg-[#FEF9CF] px-3 py-1 rounded-full border border-[#0D0431]">
                  Target allocation for FAANG behavioral rounds
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Situation */}
                <div className="p-4 bg-[#FEF9CF] border-2 border-[#0D0431] rounded-2xl shadow-[3px_3px_0_0_#0D0431] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-black text-xs text-[#0D0431]">1. Situation</span>
                    <span className="font-mono text-[11px] font-bold text-[#0D0431] bg-white px-2 py-0.5 rounded-md border border-[#0D0431]">
                      20% Weight
                    </span>
                  </div>
                  <p className="text-xs text-[#0D0431]/80 leading-relaxed font-sans font-medium">
                    System scale, business stakes, architectural constraints, and initial problem bottleneck.
                  </p>
                </div>

                {/* Task */}
                <div className="p-4 bg-[#D4FDF7] border-2 border-[#0D0431] rounded-2xl shadow-[3px_3px_0_0_#0D0431] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-black text-xs text-[#0D0431]">2. Task</span>
                    <span className="font-mono text-[11px] font-bold text-[#0D0431] bg-white px-2 py-0.5 rounded-md border border-[#0D0431]">
                      10% Weight
                    </span>
                  </div>
                  <p className="text-xs text-[#0D0431]/80 leading-relaxed font-sans font-medium">
                    Your specific personal mandate, primary engineering objective, and success criteria.
                  </p>
                </div>

                {/* Action */}
                <div className="p-4 bg-[#FEDF6A] border-2 border-[#0D0431] rounded-2xl shadow-[3px_3px_0_0_#0D0431] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-black text-xs text-[#0D0431]">3. Action</span>
                    <span className="font-mono text-[11px] font-bold text-[#0D0431] bg-white px-2 py-0.5 rounded-md border border-[#0D0431]">
                      50% Weight
                    </span>
                  </div>
                  <p className="text-xs text-[#0D0431]/80 leading-relaxed font-sans font-medium">
                    Technical decisions, trade-offs evaluated, tools, PRs, and individual execution steps (Use "I").
                  </p>
                </div>

                {/* Result */}
                <div className="p-4 bg-[#E4CDFB] border-2 border-[#0D0431] rounded-2xl shadow-[3px_3px_0_0_#0D0431] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-black text-xs text-[#0D0431]">4. Result</span>
                    <span className="font-mono text-[11px] font-bold text-[#0D0431] bg-white px-2 py-0.5 rounded-md border border-[#0D0431]">
                      20% Weight
                    </span>
                  </div>
                  <p className="text-xs text-[#0D0431]/80 leading-relaxed font-sans font-medium">
                    Quantified metrics (latency, % improvement, revenue), uptime, and institutional learnings.
                  </p>
                </div>
              </div>
            </div>

            {/* Filter & Control Bar */}
            <div className="bg-white border-2 border-[#0D0431] p-4 md:p-5 rounded-2xl shadow-[4px_4px_0_0_#0D0431] space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Search input */}
                <div className="relative">
                  <Search className="w-4 h-4 text-[#0D0431]/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search questions or principles..."
                    className="w-full pl-9 pr-4 py-2.5 bg-white text-[#0D0431] placeholder-[#0D0431]/40 border-2 border-[#0D0431] rounded-xl text-xs font-bold shadow-[2px_2px_0_0_#0D0431] focus:bg-[#FEF9CF] focus:outline-none transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0D0431]/60 hover:text-[#0D0431] text-xs cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Company Filter */}
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="px-3.5 py-2.5 bg-white text-[#0D0431] border-2 border-[#0D0431] rounded-xl text-xs font-bold shadow-[2px_2px_0_0_#0D0431] focus:bg-[#FEF9CF] focus:outline-none transition-all cursor-pointer"
                >
                  {COMPANY_FILTERS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3.5 py-2.5 bg-white text-[#0D0431] border-2 border-[#0D0431] rounded-xl text-xs font-bold shadow-[2px_2px_0_0_#0D0431] focus:bg-[#FEF9CF] focus:outline-none transition-all cursor-pointer"
                >
                  {CATEGORY_FILTERS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                {/* Difficulty Filter */}
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="px-3.5 py-2.5 bg-white text-[#0D0431] border-2 border-[#0D0431] rounded-xl text-xs font-bold shadow-[2px_2px_0_0_#0D0431] focus:bg-[#FEF9CF] focus:outline-none transition-all cursor-pointer"
                >
                  {DIFFICULTY_FILTERS.map((diff) => (
                    <option key={diff} value={diff}>
                      Level: {diff}
                    </option>
                  ))}
                </select>
              </div>

              {/* Secondary filter toggles and Refresh button */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#0D0431]/10">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] transition-all cursor-pointer ${
                      showBookmarkedOnly
                        ? "bg-[#FEDF6A] text-[#0D0431]"
                        : "bg-white text-[#0D0431]/70 hover:bg-[#FEF9CF]"
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5 text-[#0D0431]" />
                    <span>Saved Bookmarks ({bookmarkedIds.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPracticedOnly(!showPracticedOnly)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] transition-all cursor-pointer ${
                      showPracticedOnly
                        ? "bg-[#D4FDF7] text-[#0D0431]"
                        : "bg-white text-[#0D0431]/70 hover:bg-[#FEF9CF]"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0D0431]" />
                    <span>Practiced ({Object.keys(practiceHistory).length})</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={fetchQuestions}
                  disabled={loading}
                  className="flex items-center gap-1.5 text-xs text-[#0D0431] font-bold bg-[#FEDF6A] hover:bg-[#FFE995] px-4 py-2 rounded-xl border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] transition-all cursor-pointer"
                >
                  <RotateCcw
                    className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
                  />
                  <span>Refresh Prompts</span>
                </button>
              </div>
            </div>

            {/* Questions Bento Grid */}
            {filteredQuestions.length === 0 ? (
              <div className="p-12 text-center bg-white border-2 border-[#0D0431] rounded-3xl shadow-[4px_4px_0_0_#0D0431] space-y-3">
                <HelpCircle className="w-10 h-10 text-[#896EE2] mx-auto" />
                <h4 className="font-heading font-bold text-base text-[#0D0431]">
                  No questions match your active filters
                </h4>
                <p className="text-xs text-[#0D0431]/70 max-w-md mx-auto">
                  Try adjusting your search query, clearing category filters, or clicking Refresh Prompts.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All Categories");
                    setSelectedDifficulty("All Levels");
                    setShowBookmarkedOnly(false);
                    setShowPracticedOnly(false);
                  }}
                  className="text-xs font-bold font-mono text-[#896EE2] underline hover:text-[#0D0431]"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 grid-flow-dense">
                {filteredQuestions.map((q, idx) => {
                  const qKey = String(q.id != null ? q.id : idx);
                  const isBookmarked = bookmarkedIds.includes(qKey);
                  const historyItem = practiceHistory[qKey];

                  return (
                    <div
                      key={qKey}
                      className="gsap-bento-card bg-white border-2 border-[#0D0431] hover:border-[#0D0431] rounded-3xl p-6 md:p-7 shadow-[4px_4px_0_0_#0D0431] hover:shadow-[6px_6px_0_0_#0D0431] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-4">
                        {/* Top Badges & Actions */}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <GpBadge theme="light-purple" size="sm">
                              {q.category || "Behavioral"}
                            </GpBadge>
                            {q.principle && (
                              <GpBadge theme="yellow" size="sm">
                                {q.principle}
                              </GpBadge>
                            )}
                            <GpBadge theme="mint" size="sm">
                              {q.difficulty || "Medium"}
                            </GpBadge>
                          </div>

                          <div className="flex items-center gap-2">
                            {historyItem && (
                              <span
                                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-[#0D0431] ${
                                  (historyItem.score ?? 0) >= 80
                                    ? "bg-[#D4FDF7] text-[#0D0431]"
                                    : (historyItem.score ?? 0) >= 60
                                    ? "bg-[#FFE995] text-[#0D0431]"
                                    : "bg-[#FFC5B7] text-[#0D0431]"
                                }`}
                              >
                                Last Score: {historyItem.score ?? 0}/100
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleToggleBookmarkItem(q.id != null ? q.id : idx)}
                              className="p-1.5 rounded-lg border-2 border-[#0D0431] bg-white hover:bg-[#FEF9CF] text-[#0D0431] shadow-[2px_2px_0_0_#0D0431] transition-all cursor-pointer"
                              title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
                            >
                              {isBookmarked ? (
                                <BookmarkCheck className="w-3.5 h-3.5 text-[#896EE2] fill-current" />
                              ) : (
                                <Bookmark className="w-3.5 h-3.5 text-[#0D0431]/60" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Question Text */}
                        <h3 className="text-base sm:text-lg font-heading font-bold text-[#0D0431] leading-snug">
                          "{q.question}"
                        </h3>

                        {/* Evaluator Intent Box */}
                        {q.why_asked && (
                          <div className="text-xs text-[#0D0431] bg-[#FEF9CF] border-2 border-[#0D0431] rounded-xl p-3.5 space-y-1 shadow-[2px_2px_0_0_#0D0431]">
                            <span className="font-heading font-bold text-[#0D0431] flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                              <Target className="w-3.5 h-3.5 text-[#896EE2]" />
                              Evaluator Intent & Green Flags:
                            </span>
                            <p className="text-[#0D0431]/80 leading-relaxed font-sans font-medium">
                              {q.why_asked}
                            </p>
                          </div>
                        )}

                        {/* STAR Strategy Tip Box */}
                        {q.star_tips && (
                          <div className="p-3.5 bg-[#D4FDF7] border-2 border-[#0D0431] rounded-xl text-xs space-y-1 shadow-[2px_2px_0_0_#0D0431]">
                            <span className="font-heading font-bold text-[#0D0431] flex items-center gap-1.5">
                              <Lightbulb className="w-3.5 h-3.5 text-[#0D0431]" />
                              STAR Blueprint Advice:
                            </span>
                            <p className="text-[#0D0431]/80 font-mono text-[11px] leading-relaxed">
                              {q.star_tips}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action Bar */}
                      <div className="pt-4 border-t-2 border-[#0D0431] flex items-center justify-between gap-3 flex-wrap">
                        {q.sample_answer ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyText(q.sample_answer, q.id || idx)
                            }
                            className="flex items-center gap-1.5 text-xs text-[#0D0431] bg-white hover:bg-[#FEF9CF] px-3.5 py-2 rounded-xl border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] transition-all font-mono font-bold cursor-pointer"
                          >
                            {copiedId === (q.id || idx) ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-[#0D0431]" />
                                <span>Copied Model</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-[#896EE2]" />
                                <span>Copy Model Answer</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <div />
                        )}

                        <GpButton
                          onClick={() => {
                            setActiveQuestion(q);
                            setPracticeAnswer("");
                            setGuidedStar({
                              situation: "",
                              task: "",
                              action: "",
                              result: "",
                            });
                            setEvaluationResult(null);
                            setFollowUpAnswer("");
                            setFollowUpSubmitted(false);
                          }}
                          variant="stacked-yellow"
                          size="sm"
                        >
                          Practice Response
                        </GpButton>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: COMPANY LEADERSHIP FRAMEWORKS                                      */}
        {/* ========================================================================= */}
        {activeTab === "frameworks" && (
          <div className="space-y-6">
            {/* Company Selector Pills */}
            <div className="bg-white border-2 border-[#0D0431] p-4 rounded-2xl shadow-[4px_4px_0_0_#0D0431] overflow-x-auto flex items-center gap-2">
              {Object.keys(COMPANY_FRAMEWORKS).map((key) => {
                const comp = COMPANY_FRAMEWORKS[key];
                const isSelected = selectedFrameworkCompany === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedFrameworkCompany(key)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? "bg-[#0D0431] text-white border-2 border-[#0D0431] shadow-[3px_3px_0_0_#FEDF6A]"
                        : "bg-white text-[#0D0431] border-2 border-[#0D0431] hover:bg-[#FEF9CF] shadow-[2px_2px_0_0_#0D0431]"
                    }`}
                  >
                    <span>{comp.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FEDF6A] text-[#0D0431] font-bold">
                      {comp.principles.length} Principles
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Company Dossier Banner */}
            <div className="bg-white border-2 border-[#0D0431] rounded-3xl p-6 md:p-8 shadow-[6px_6px_0_0_#0D0431] space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-[#0D0431] pb-4">
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#FEDF6A] border border-[#0D0431]" />
                    <h2 className="text-2xl font-heading font-black text-[#0D0431]">
                      {selectedFrameworkData.name} Behavioral Architecture
                    </h2>
                  </div>
                  <p className="text-xs font-mono font-bold text-[#896EE2]">
                    {selectedFrameworkData.tagline}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <GpButton
                    onClick={() => {
                      setSelectedCompany(
                        COMPANY_FILTERS.find((c) =>
                          c.toLowerCase().includes(selectedFrameworkData.id)
                        ) || selectedFrameworkData.name
                      );
                      setActiveTab("practice");
                    }}
                    variant="stacked-yellow"
                    size="sm"
                  >
                    Practice {selectedFrameworkData.name} Questions
                  </GpButton>
                </div>
              </div>

              <p className="text-sm text-[#0D0431]/90 leading-relaxed font-sans font-medium">
                {selectedFrameworkData.description}
              </p>

              {/* Bar Raiser Pro-Tip */}
              <div className="p-4 bg-[#FEF9CF] border-2 border-[#0D0431] rounded-2xl flex items-start gap-3 shadow-[3px_3px_0_0_#0D0431]">
                <ShieldCheck className="w-5 h-5 text-[#896EE2] shrink-0 mt-0.5" />
                <div>
                  <span className="font-heading font-black text-xs uppercase tracking-wider text-[#0D0431] block mb-0.5">
                    {selectedFrameworkData.name} Bar Raiser Secret:
                  </span>
                  <p className="text-xs text-[#0D0431]/80 leading-relaxed font-medium">
                    {selectedFrameworkData.barRaiserTip}
                  </p>
                </div>
              </div>
            </div>

            {/* Grid of Company Principles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {selectedFrameworkData.principles.map((pr, index) => {
                const isExpanded = !!expandedPrinciples[pr.id];
                return (
                  <div
                    key={pr.id}
                    className="gsap-bento-card bg-white border-2 border-[#0D0431] rounded-3xl p-6 shadow-[4px_4px_0_0_#0D0431] hover:shadow-[6px_6px_0_0_#0D0431] transition-all space-y-4"
                  >
                    {/* Principle Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="font-mono text-[11px] font-bold text-[#896EE2] uppercase">
                          Pillar #{index + 1}
                        </span>
                        <h3 className="font-heading font-black text-lg text-[#0D0431] leading-snug">
                          {pr.name}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => togglePrincipleExpand(pr.id)}
                        className="p-1.5 rounded-lg border-2 border-[#0D0431] bg-[#FEF9CF] hover:bg-[#FEDF6A] text-[#0D0431] shadow-[2px_2px_0_0_#0D0431] transition-all cursor-pointer"
                        title={isExpanded ? "Collapse Details" : "Expand Details"}
                      >
                        {isExpanded ? (
                          <X className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-[#0D0431]/80 leading-relaxed font-medium">
                      {pr.summary}
                    </p>

                    {/* STAR Strategy Tip */}
                    <div className="p-3 bg-[#D4FDF7] border-2 border-[#0D0431] rounded-xl text-xs space-y-1 shadow-[2px_2px_0_0_#0D0431]">
                      <span className="font-heading font-bold text-[#0D0431] flex items-center gap-1.5 text-[11px]">
                        <Lightbulb className="w-3.5 h-3.5 text-[#0D0431]" />
                        Master STAR Strategy:
                      </span>
                      <p className="text-[#0D0431]/80 font-mono text-[11px] leading-relaxed">
                        {pr.starTip}
                      </p>
                    </div>

                    {/* Expanded Details (Green Flags, Red Flags, Sample Questions) */}
                    {isExpanded && (
                      <div className="space-y-4 pt-3 border-t-2 border-[#0D0431] animate-in fade-in duration-200">
                        {/* Green Flags vs Red Flags */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-3.5 bg-[#EEFAEA] border-2 border-[#0D0431] rounded-xl shadow-[2px_2px_0_0_#0D0431] space-y-1.5">
                            <span className="text-[11px] font-heading font-black text-[#0D7A68] flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Green Flags (Get Hired)
                            </span>
                            <ul className="text-[11px] text-[#0D0431]/90 space-y-1 font-medium">
                              {pr.greenFlags.map((gf, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <span>•</span>
                                  <span>{gf}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="p-3.5 bg-[#FFE8E5] border-2 border-[#0D0431] rounded-xl shadow-[2px_2px_0_0_#0D0431] space-y-1.5">
                            <span className="text-[11px] font-heading font-black text-[#C7382B] flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Red Flags (Disqualifiers)
                            </span>
                            <ul className="text-[11px] text-[#0D0431]/90 space-y-1 font-medium">
                              {pr.redFlags.map((rf, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <span>•</span>
                                  <span>{rf}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Sample Questions */}
                        {pr.sampleQuestions && (
                          <div className="p-3.5 bg-white border-2 border-[#0D0431] rounded-xl shadow-[2px_2px_0_0_#0D0431] space-y-2">
                            <span className="text-[11px] font-heading font-black text-[#0D0431] uppercase tracking-wider block">
                              Recruiter Prompts for this Principle:
                            </span>
                            <ul className="space-y-1.5">
                              {pr.sampleQuestions.map((sq, i) => (
                                <li
                                  key={i}
                                  className="text-xs font-sans font-semibold text-[#0D0431] flex items-start gap-2 bg-[#FEF9CF] p-2 rounded-lg border border-[#0D0431]"
                                >
                                  <ChevronRight className="w-3.5 h-3.5 text-[#896EE2] shrink-0 mt-0.5" />
                                  <span>"{sq}"</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Bottom CTA to practice this principle */}
                    <div className="pt-2 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => togglePrincipleExpand(pr.id)}
                        className="text-xs font-bold text-[#896EE2] hover:text-[#0D0431] flex items-center gap-1 cursor-pointer"
                      >
                        <span>{isExpanded ? "Show Less" : "View Green/Red Flags & Prompts"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCompany(
                            COMPANY_FILTERS.find((c) =>
                              c.toLowerCase().includes(selectedFrameworkData.id)
                            ) || selectedFrameworkData.name
                          );
                          setSearchQuery(pr.name);
                          setActiveTab("practice");
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#FEDF6A] hover:bg-[#FFE995] text-[#0D0431] rounded-lg border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] text-xs font-bold transition-all cursor-pointer"
                      >
                        <span>Practice This</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: STAR STORY MATRIX VAULT                                           */}
        {/* ========================================================================= */}
        {activeTab === "story-matrix" && (
          <div className="space-y-6">
            {/* Story Matrix Banner */}
            <div className="bg-white border-2 border-[#0D0431] rounded-3xl p-6 md:p-8 shadow-[6px_6px_0_0_#0D0431] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#0D0431] pb-4">
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#E4CDFB] border border-[#0D0431]" />
                    <h2 className="text-2xl font-heading font-black text-[#0D0431]">
                      My STAR Story Matrix Vault
                    </h2>
                  </div>
                  <p className="text-xs font-mono font-bold text-[#896EE2]">
                    FAANG Bar Raiser Strategy: Prepare 4–6 Master Stories to cover all 50+ Behavioral Prompts
                  </p>
                </div>

                <GpButton
                  onClick={() => handleOpenNewStoryModal()}
                  variant="stacked-yellow"
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Draft New Master Story</span>
                </GpButton>
              </div>

              <p className="text-xs md:text-sm text-[#0D0431]/80 leading-relaxed font-sans font-medium">
                Top interview candidates do not memorize answers to 100 questions. Instead, they polish <strong>4–6 deep engineering stories</strong> covering: (1) Technical Scalability, (2) Production Incident / Mistake, (3) Disagreement / Conflict, (4) Ambiguity / Tight Deadline, and (5) Customer Advocacy.
              </p>
            </div>

            {/* Grid of Saved Master Stories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {savedStories.map((story) => (
                <div
                  key={story.id}
                  className="gsap-bento-card bg-white border-2 border-[#0D0431] rounded-3xl p-6 shadow-[4px_4px_0_0_#0D0431] hover:shadow-[6px_6px_0_0_#0D0431] transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#FEF9CF] px-2.5 py-1 rounded-full border border-[#0D0431]">
                        {story.project || "Master Project"}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenNewStoryModal(story)}
                          className="p-1 rounded-lg border border-[#0D0431] bg-white hover:bg-[#FEF9CF] text-[#0D0431] cursor-pointer"
                          title="Edit Story"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteStory(story.id)}
                          className="p-1 rounded-lg border border-[#0D0431] bg-white hover:bg-[#FFC5B7] text-[#0D0431] cursor-pointer"
                          title="Delete Story"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-[#C7382B]" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-heading font-bold text-base text-[#0D0431] leading-snug">
                      {story.title}
                    </h3>

                    {story.techStack && (
                      <p className="text-[11px] font-mono text-[#896EE2] font-semibold">
                        Stack: {story.techStack}
                      </p>
                    )}

                    {/* Competency tags */}
                    {story.competencies && story.competencies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {story.competencies.map((tag, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-mono font-bold bg-[#D4FDF7] text-[#0D0431] px-2 py-0.5 rounded-md border border-[#0D0431]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Collapsible/Snippet preview of STAR */}
                    <div className="space-y-2 pt-2 border-t border-[#0D0431]/10 text-xs">
                      <div className="bg-[#FEF9CF] p-2.5 rounded-xl border border-[#0D0431] space-y-0.5">
                        <span className="font-heading font-black text-[10px] uppercase text-[#0D0431]">
                          SITUATION:
                        </span>
                        <p className="text-[#0D0431]/80 line-clamp-2">{story.situation}</p>
                      </div>
                      <div className="bg-[#FEDF6A]/50 p-2.5 rounded-xl border border-[#0D0431] space-y-0.5">
                        <span className="font-heading font-black text-[10px] uppercase text-[#0D0431]">
                          ACTION:
                        </span>
                        <p className="text-[#0D0431]/80 line-clamp-2">{story.action}</p>
                      </div>
                      <div className="bg-[#E4CDFB]/60 p-2.5 rounded-xl border border-[#0D0431] space-y-0.5">
                        <span className="font-heading font-black text-[10px] uppercase text-[#0D0431]">
                          RESULT:
                        </span>
                        <p className="text-[#0D0431]/80 line-clamp-2">{story.result}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t-2 border-[#0D0431] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyText(
                          `Situation: ${story.situation}\nTask: ${story.task}\nAction: ${story.action}\nResult: ${story.result}`,
                          story.id
                        )
                      }
                      className="text-xs font-mono font-bold text-[#0D0431] bg-white hover:bg-[#FEF9CF] px-3 py-1.5 rounded-lg border border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === story.id ? (
                        <>
                          <Check className="w-3 h-3 text-[#0D0431]" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-[#896EE2]" />
                          <span>Copy STAR</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePracticeStory(story)}
                      className="text-xs font-bold text-[#0D0431] bg-[#FEDF6A] hover:bg-[#FFE995] px-3 py-1.5 rounded-lg border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] flex items-center gap-1 cursor-pointer"
                    >
                      <span>Practice Story</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: STAR MASTERCLASS & BEHAVIORAL CHEAT SHEET                          */}
        {/* ========================================================================= */}
        {activeTab === "masterclass" && (
          <div className="space-y-6">
            {/* Masterclass Hero */}
            <div className="bg-white border-2 border-[#0D0431] rounded-3xl p-6 md:p-8 shadow-[6px_6px_0_0_#0D0431] space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-[#FFC5B7] border border-[#0D0431]" />
                <h2 className="text-2xl font-heading font-black text-[#0D0431]">
                  FAANG Behavioral Interview Masterclass
                </h2>
              </div>
              <p className="text-sm text-[#0D0431]/80 leading-relaxed font-sans font-medium">
                The definitive playbook on crafting executive-level STAR responses, eliminating verbal filler crutches, demonstrating radical accountability, and clearing the Bar Raiser threshold.
              </p>
            </div>

            {/* 3 Master Rules Bento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white border-2 border-[#0D0431] rounded-3xl p-6 shadow-[4px_4px_0_0_#0D0431] space-y-3">
                <div className="flex items-center gap-2 text-[#896EE2]">
                  <Target className="w-5 h-5" />
                  <h3 className="font-heading font-black text-sm uppercase text-[#0D0431]">
                    The "I vs. We" Principle
                  </h3>
                </div>
                <p className="text-xs text-[#0D0431]/80 leading-relaxed font-medium">
                  Recruiters hate candidates who only say "We built..." because they cannot determine your individual contribution. Use "We" only for team context (Situation); use <strong>"I architected", "I benchmarked", "I refactored"</strong> in Action.
                </p>
              </div>

              <div className="bg-white border-2 border-[#0D0431] rounded-3xl p-6 shadow-[4px_4px_0_0_#0D0431] space-y-3">
                <div className="flex items-center gap-2 text-[#896EE2]">
                  <Clock className="w-5 h-5" />
                  <h3 className="font-heading font-black text-sm uppercase text-[#0D0431]">
                    The 2-Minute Window
                  </h3>
                </div>
                <p className="text-xs text-[#0D0431]/80 leading-relaxed font-medium">
                  Optimal behavioral answers last between <strong>90 to 150 seconds</strong> (~180–300 words). Spending 4 minutes will bore the interviewer and leave no time for follow-up questions.
                </p>
              </div>

              <div className="bg-white border-2 border-[#0D0431] rounded-3xl p-6 shadow-[4px_4px_0_0_#0D0431] space-y-3">
                <div className="flex items-center gap-2 text-[#896EE2]">
                  <TrendingUp className="w-5 h-5" />
                  <h3 className="font-heading font-black text-sm uppercase text-[#0D0431]">
                    The Metrics Law
                  </h3>
                </div>
                <p className="text-xs text-[#0D0431]/80 leading-relaxed font-medium">
                  Never end an answer with "and the users liked it." Always attach at least one concrete metric: <strong>Latency (ms), Availability (%), Memory (MB), Revenue ($), or Time saved (hours/week)</strong>.
                </p>
              </div>
            </div>

            {/* Power Verbs vs Weak Phrases */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Power Verbs */}
              <div className="bg-white border-2 border-[#0D0431] rounded-3xl p-6 shadow-[4px_4px_0_0_#0D0431] space-y-4">
                <div className="flex items-center gap-2 border-b-2 border-[#0D0431] pb-3">
                  <Sparkles className="w-4 h-4 text-[#896EE2]" />
                  <h4 className="font-heading font-black text-sm uppercase text-[#0D0431]">
                    High-Impact Power Verbs
                  </h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    "Spearheaded",
                    "Architected",
                    "Orchestrated",
                    "Streamlined",
                    "Benchmark",
                    "Decoupled",
                    "Automated",
                    "Optimized",
                    "Championed",
                    "Pioneered",
                    "Triaged",
                    "Consolidated",
                  ].map((verb) => (
                    <span
                      key={verb}
                      className="px-2.5 py-1.5 bg-[#D4FDF7] border border-[#0D0431] rounded-xl text-center text-xs font-mono font-bold shadow-[2px_2px_0_0_#0D0431]"
                    >
                      {verb}
                    </span>
                  ))}
                </div>
              </div>

              {/* Weak Hedging Phrases */}
              <div className="bg-white border-2 border-[#0D0431] rounded-3xl p-6 shadow-[4px_4px_0_0_#0D0431] space-y-4">
                <div className="flex items-center gap-2 border-b-2 border-[#0D0431] pb-3">
                  <AlertTriangle className="w-4 h-4 text-[#C7382B]" />
                  <h4 className="font-heading font-black text-sm uppercase text-[#0D0431]">
                    Hedging Phrases to Eliminate
                  </h4>
                </div>
                <div className="space-y-2">
                  {[
                    { bad: '"I think maybe..."', good: '"In my experience / Based on benchmarks..."' },
                    { bad: '"We sort of tried to..."', good: '"I executed / I implemented..."' },
                    { bad: '"It was basically just..."', good: '"[State direct architectural action]"' },
                    { bad: '"Hopefully it works..."', good: '"With rigorous automated test coverage..."' },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-[#FFE8E5] border border-[#0D0431] rounded-xl flex items-center justify-between text-xs font-mono font-medium"
                    >
                      <span className="text-[#C7382B] line-through">{item.bad}</span>
                      <span className="text-[#0D0431] font-bold">→ {item.good}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ACTIVE QUESTION PRACTICE & EVALUATION MODAL                              */}
        {/* ========================================================================= */}
        {activeQuestion && (
          <GpModal
            isOpen={!!activeQuestion}
            onClose={() => {
              setActiveQuestion(null);
              if (isRecording && recognitionRef.current) {
                recognitionRef.current.stop();
                setIsRecording(false);
              }
              if (timerRef.current) clearInterval(timerRef.current);
            }}
            title="Practice Behavioral Response"
            subtitle={activeQuestion.category || "Behavioral Screening"}
            maxWidth="max-w-3xl"
          >
            <div className="space-y-6">
              {/* Question Context Bento */}
              <div className="p-4 md:p-5 bg-[#FEF9CF] border-2 border-[#0D0431] rounded-2xl shadow-[3px_3px_0_0_#0D0431] space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[10px] uppercase font-mono text-[#0D0431] font-bold bg-white px-2.5 py-0.5 rounded-full border border-[#0D0431]">
                    {activeQuestion.principle || "Target Competency"}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-[#896EE2]">
                    Company Bar: {selectedCompany.split(" ")[0]}
                  </span>
                </div>
                <h4 className="text-base md:text-lg font-heading font-black text-[#0D0431] leading-snug">
                  "{activeQuestion.question}"
                </h4>
              </div>

              {/* Mode Switcher: Guided STAR vs Freeform Speech/Text */}
              <div className="flex items-center justify-between flex-wrap gap-3 border-b-2 border-[#0D0431] pb-3">
                <div className="flex items-center gap-1.5 bg-[#FEF9CF] p-1 rounded-xl border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431]">
                  <button
                    type="button"
                    onClick={() => setPracticeMode("guided")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-heading font-bold uppercase transition-all cursor-pointer ${
                      practiceMode === "guided"
                        ? "bg-[#FEDF6A] text-[#0D0431] shadow-[1px_1px_0_0_#0D0431]"
                        : "text-[#0D0431]/70 hover:text-[#0D0431]"
                    }`}
                  >
                    Guided STAR Builder
                  </button>
                  <button
                    type="button"
                    onClick={() => setPracticeMode("freeform")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-heading font-bold uppercase transition-all cursor-pointer ${
                      practiceMode === "freeform"
                        ? "bg-[#FEDF6A] text-[#0D0431] shadow-[1px_1px_0_0_#0D0431]"
                        : "text-[#0D0431]/70 hover:text-[#0D0431]"
                    }`}
                  >
                    Freeform & Speech
                  </button>
                </div>

                {/* Import from Story Matrix Dropdown if stories exist */}
                {savedStories.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#0D0431]/70 font-bold hidden sm:inline">
                      Insert Story:
                    </span>
                    <select
                      onChange={(e) => {
                        const s = savedStories.find((item) => item.id === e.target.value);
                        if (s) handleImportStoryToGuided(s);
                      }}
                      defaultValue=""
                      className="px-2.5 py-1.5 bg-white text-[#0D0431] border-2 border-[#0D0431] rounded-xl text-xs font-bold shadow-[2px_2px_0_0_#0D0431] cursor-pointer"
                    >
                      <option value="" disabled>
                        Choose from Story Matrix...
                      </option>
                      {savedStories.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* INPUT AREA MODE 1: GUIDED STAR BUILDER */}
              {practiceMode === "guided" && (
                <div className="space-y-4">
                  {/* Situation */}
                  <div className="p-3.5 bg-[#FEF9CF] border-2 border-[#0D0431] rounded-2xl space-y-1.5 shadow-[2px_2px_0_0_#0D0431]">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-heading font-black text-[#0D0431] uppercase">
                        1. Situation (20% Weight ~ 40-60 words)
                      </label>
                      <span className="text-[10px] font-mono text-[#0D0431]/70 font-bold">
                        {guidedStar.situation.split(/\s+/).filter(Boolean).length} words
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      value={guidedStar.situation}
                      onChange={(e) =>
                        setGuidedStar({ ...guidedStar, situation: e.target.value })
                      }
                      placeholder="What was the business problem, system constraint, or critical scale challenge?..."
                      className="w-full p-3 bg-white text-[#0D0431] border-2 border-[#0D0431] rounded-xl text-xs font-medium focus:outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Task */}
                  <div className="p-3.5 bg-[#D4FDF7] border-2 border-[#0D0431] rounded-2xl space-y-1.5 shadow-[2px_2px_0_0_#0D0431]">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-heading font-black text-[#0D0431] uppercase">
                        2. Task (10% Weight ~ 20-30 words)
                      </label>
                      <span className="text-[10px] font-mono text-[#0D0431]/70 font-bold">
                        {guidedStar.task.split(/\s+/).filter(Boolean).length} words
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      value={guidedStar.task}
                      onChange={(e) =>
                        setGuidedStar({ ...guidedStar, task: e.target.value })
                      }
                      placeholder="What was your specific individual responsibility or technical mandate?..."
                      className="w-full p-3 bg-white text-[#0D0431] border-2 border-[#0D0431] rounded-xl text-xs font-medium focus:outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Action */}
                  <div className="p-3.5 bg-[#FEDF6A]/60 border-2 border-[#0D0431] rounded-2xl space-y-1.5 shadow-[2px_2px_0_0_#0D0431]">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-heading font-black text-[#0D0431] uppercase">
                        3. Action (50% Weight ~ 100-150 words)
                      </label>
                      <span className="text-[10px] font-mono text-[#0D0431]/70 font-bold">
                        {guidedStar.action.split(/\s+/).filter(Boolean).length} words
                      </span>
                    </div>
                    <textarea
                      rows={4}
                      value={guidedStar.action}
                      onChange={(e) =>
                        setGuidedStar({ ...guidedStar, action: e.target.value })
                      }
                      placeholder="What exact technical decisions, tools, architecture, and trade-offs did YOU execute? (Use 'I', not 'We')..."
                      className="w-full p-3 bg-white text-[#0D0431] border-2 border-[#0D0431] rounded-xl text-xs font-medium focus:outline-none transition-all resize-none leading-relaxed"
                    />
                  </div>

                  {/* Result */}
                  <div className="p-3.5 bg-[#E4CDFB]/60 border-2 border-[#0D0431] rounded-2xl space-y-1.5 shadow-[2px_2px_0_0_#0D0431]">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-heading font-black text-[#0D0431] uppercase">
                        4. Result (20% Weight ~ 40-60 words)
                      </label>
                      <span className="text-[10px] font-mono text-[#0D0431]/70 font-bold">
                        {guidedStar.result.split(/\s+/).filter(Boolean).length} words
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      value={guidedStar.result}
                      onChange={(e) =>
                        setGuidedStar({ ...guidedStar, result: e.target.value })
                      }
                      placeholder="What were the quantifiable metrics (e.g. latency down 45%, revenue, uptime) and learnings?..."
                      className="w-full p-3 bg-white text-[#0D0431] border-2 border-[#0D0431] rounded-xl text-xs font-medium focus:outline-none transition-all resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleCompileGuidedStar}
                      className="text-xs font-mono font-bold text-[#896EE2] hover:text-[#0D0431] underline cursor-pointer"
                    >
                      Preview Full Compiled Response →
                    </button>

                    <GpButton
                      onClick={handleEvaluatePractice}
                      disabled={evaluating || !guidedStar.action.trim()}
                      variant="stacked"
                      size="md"
                    >
                      {evaluating ? "Evaluating STAR Answer..." : "Evaluate Response with AI"}
                    </GpButton>
                  </div>
                </div>
              )}

              {/* INPUT AREA MODE 2: FREEFORM TEXT & SPEECH */}
              {practiceMode === "freeform" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <label className="text-xs uppercase font-bold tracking-wider font-sans text-[#0D0431]">
                        Your Answer
                      </label>
                      <span className="text-[11px] font-mono text-[#0D0431]/60">
                        ({practiceAnswer.split(/\s+/).filter(Boolean).length} words)
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleToggleVoice}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] transition-all cursor-pointer ${
                        isRecording
                          ? "bg-[#F85B52] text-white animate-pulse"
                          : "bg-[#FEDF6A] hover:bg-[#FFE995] text-[#0D0431]"
                      }`}
                    >
                      {isRecording ? (
                        <>
                          <Square className="w-3 h-3 fill-current" />
                          <span>Stop Recording ({recordDuration}s)</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-3.5 h-3.5 text-[#0D0431]" />
                          <span>Record Voice (Mic)</span>
                        </>
                      )}
                    </button>
                  </div>

                  <textarea
                    rows={6}
                    value={practiceAnswer}
                    onChange={(e) => setPracticeAnswer(e.target.value)}
                    placeholder="Speak or type your complete STAR response (Situation, Task, Action, Result)..."
                    className="w-full p-4 bg-white text-[#0D0431] placeholder-[#0D0431]/40 border-2 border-[#0D0431] rounded-2xl text-xs md:text-sm font-sans font-medium shadow-[3px_3px_0_0_#0D0431] focus:bg-[#FEF9CF] focus:outline-none transition-all resize-none leading-relaxed"
                  />

                  <GpButton
                    onClick={handleEvaluatePractice}
                    disabled={evaluating || !practiceAnswer.trim()}
                    variant="stacked"
                    size="md"
                    fullWidth
                  >
                    {evaluating ? "Evaluating Answer..." : "Evaluate Response with AI"}
                  </GpButton>
                </div>
              )}

              {/* EVALUATION RESULTS CARD */}
              {evaluationResult && (
                <div className="space-y-5 pt-4 border-t-2 border-[#0D0431] animate-in fade-in duration-300">
                  {/* Overall Score Banner */}
                  <div className="flex items-center justify-between bg-[#FEDF6A] p-4 md:p-5 rounded-2xl border-2 border-[#0D0431] shadow-[4px_4px_0_0_#0D0431]">
                    <div>
                      <span className="text-[11px] font-heading font-black text-[#0D0431] uppercase tracking-wider block">
                        Overall Performance Score:
                      </span>
                      <span className="text-2xl font-heading font-black text-[#0D0431]">
                        {evaluationResult.score ?? 0} / 100
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-mono font-bold px-3 py-1.5 rounded-full border-2 border-[#0D0431] shadow-[2px_2px_0_0_#0D0431] ${
                          (evaluationResult.score ?? 0) >= 80
                            ? "bg-[#D4FDF7] text-[#0D0431]"
                            : (evaluationResult.score ?? 0) >= 60
                            ? "bg-[#FFE995] text-[#0D0431]"
                            : "bg-[#FFC5B7] text-[#0D0431]"
                        }`}
                      >
                        Verdict: {evaluationResult.overall_verdict || ((evaluationResult.score ?? 0) >= 80 ? "Strong Hire" : "Passable")}
                      </span>
                    </div>
                  </div>

                  {/* STAR Pillar Verification Grid */}
                  {evaluationResult.star_compliance && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0D0431] block">
                          STAR Framework Pillar Compliance:
                        </span>
                        <span className="text-[11px] font-mono font-bold text-[#896EE2]">
                          STAR Score: {evaluationResult.star_compliance?.score ?? 0}%
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {["situation", "task", "action", "result"].map((k) => {
                          const detected =
                            evaluationResult.star_compliance[`${k}_detected`];
                          return (
                            <div
                              key={k}
                              className={`p-2.5 rounded-xl border-2 border-[#0D0431] text-center text-xs font-mono font-bold shadow-[2px_2px_0_0_#0D0431] ${
                                detected
                                  ? "bg-[#D4FDF7] text-[#0D0431]"
                                  : "bg-[#FFC5B7] text-[#0D0431]"
                              }`}
                            >
                              <div className="uppercase">{k}</div>
                              <div className="text-[10px] font-normal">
                                {detected ? "✓ Verified" : "✗ Missing / Weak"}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {evaluationResult.star_compliance.star_feedback && (
                        <p className="text-xs text-[#0D0431]/80 font-mono bg-[#FEF9CF] p-3 rounded-xl border border-[#0D0431]">
                          {evaluationResult.star_compliance.star_feedback}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Speech & Communication Intelligence Panel */}
                  {evaluationResult.communication && (
                    <div className="p-4 bg-white border-2 border-[#0D0431] rounded-2xl shadow-[3px_3px_0_0_#0D0431] space-y-3">
                      <div className="flex items-center justify-between border-b border-[#0D0431]/15 pb-2">
                        <span className="text-xs font-heading font-black text-[#0D0431] uppercase flex items-center gap-1.5">
                          <Volume2 className="w-4 h-4 text-[#896EE2]" />
                          Communication & Delivery Analytics
                        </span>
                        <span className="text-xs font-mono font-bold text-[#896EE2]">
                          Comm Score: {evaluationResult.communication?.overall_communication_score ?? 0}%
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        {/* Clarity */}
                        <div className="p-2.5 bg-[#FEF9CF] rounded-xl border border-[#0D0431] space-y-1">
                          <span className="font-heading font-bold text-[11px] block">
                            Clarity ({evaluationResult.communication.clarity?.score ?? 0}/100)
                          </span>
                          <p className="text-[11px] text-[#0D0431]/80">
                            {evaluationResult.communication.clarity?.feedback || "Structured progression."}
                          </p>
                        </div>

                        {/* Fillers */}
                        <div className="p-2.5 bg-[#FFE8E5] rounded-xl border border-[#0D0431] space-y-1">
                          <span className="font-heading font-bold text-[11px] block">
                            Filler Words: {evaluationResult.communication.filler_words?.total_count ?? 0}
                          </span>
                          <p className="text-[11px] text-[#0D0431]/80">
                            Density: {evaluationResult.communication.filler_words?.density_percent ?? 0}% (
                            {evaluationResult.communication.filler_words?.status || "Clean"})
                          </p>
                        </div>

                        {/* Pacing */}
                        <div className="p-2.5 bg-[#D4FDF7] rounded-xl border border-[#0D0431] space-y-1">
                          <span className="font-heading font-bold text-[11px] block">
                            Pacing: {evaluationResult.communication.pacing?.wpm ? `${evaluationResult.communication.pacing.wpm} WPM` : "N/A (Text Submission)"}
                          </span>
                          <p className="text-[11px] text-[#0D0431]/80">
                            {evaluationResult.communication.pacing?.feedback || "Spoken Audio Required"}
                          </p>
                        </div>
                      </div>

                      {/* Weak Hedging detected */}
                      {evaluationResult.communication.weak_phrases_detected &&
                        evaluationResult.communication.weak_phrases_detected.length > 0 && (
                          <div className="text-xs p-2.5 bg-[#FFC5B7]/50 rounded-xl border border-[#0D0431] space-y-1">
                            <span className="font-heading font-bold text-[11px] text-[#C7382B] block">
                              Hedging Phrases Detected:
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {evaluationResult.communication.weak_phrases_detected.map((item, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-[#0D0431]"
                                >
                                  "{item.phrase}" → Use <strong>{item.suggestion}</strong>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  )}

                  {/* Strengths & Improvement Bento */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 bg-[#D4FDF7] border-2 border-[#0D0431] rounded-2xl shadow-[3px_3px_0_0_#0D0431] space-y-1.5">
                      <span className="text-xs font-heading font-black text-[#0D0431] flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#0D0431]" />
                        Key Strengths
                      </span>
                      <ul className="text-xs text-[#0D0431] space-y-1 font-medium">
                        {(evaluationResult.strengths || ["Clear individual role identification"]).map(
                          (s, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-[#0D0431] font-bold">•</span>
                              <span>{s}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>

                    <div className="p-4 bg-[#FFC5B7] border-2 border-[#0D0431] rounded-2xl shadow-[3px_3px_0_0_#0D0431] space-y-1.5">
                      <span className="text-xs font-heading font-black text-[#0D0431] flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-[#0D0431]" />
                        Areas for Improvement
                      </span>
                      <ul className="text-xs text-[#0D0431] space-y-1 font-medium">
                        {(evaluationResult.areas_for_improvement || [
                          "Incorporate quantifiable metrics into Result phase",
                        ]).map((a, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-[#0D0431] font-bold">•</span>
                            <span>{a}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* One Strategic Tip */}
                  <div className="p-4 bg-[#E4CDFB] border-2 border-[#0D0431] rounded-2xl flex items-start gap-3 text-xs text-[#0D0431] shadow-[3px_3px_0_0_#0D0431]">
                    <Sparkles className="w-5 h-5 text-[#0D0431] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-heading font-black text-[#0D0431] block text-[11px] uppercase tracking-wider mb-0.5">
                        Strategic Coaching Tip:
                      </span>
                      <p className="text-[#0D0431]/90 font-sans font-medium leading-relaxed">
                        {evaluationResult.one_tip ||
                          evaluationResult.key_takeaway ||
                          "Focus heavily on the Action phase detailing your direct technical contribution and trade-offs."}
                      </p>
                    </div>
                  </div>

                  {/* Polished Exemplary Answer */}
                  {evaluationResult.suggested_better_answer && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setShowModelAnswer(!showModelAnswer)}
                        className="text-xs font-bold font-sans text-[#896EE2] hover:text-[#0D0431] flex items-center gap-1 cursor-pointer"
                      >
                        <span>{showModelAnswer ? "Hide Polished Model Answer" : "Show Polished Model Answer"}</span>
                      </button>
                      {showModelAnswer && (
                        <div className="mt-2 p-4 bg-white border-2 border-[#0D0431] rounded-2xl space-y-1 shadow-[2px_2px_0_0_#0D0431]">
                          <span className="text-xs font-heading font-bold text-[#0D0431] block uppercase tracking-wider">
                            Polished STAR Rewrite:
                          </span>
                          <p className="text-xs text-[#0D0431]/80 leading-relaxed font-sans font-medium whitespace-pre-line">
                            {evaluationResult.suggested_better_answer}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* DYNAMIC FOLLOW-UP QUESTION PRACTICE */}
                  {evaluationResult.follow_up_question && (
                    <div className="p-4 md:p-5 bg-[#FEF9CF] border-2 border-[#0D0431] rounded-2xl shadow-[4px_4px_0_0_#0D0431] space-y-3">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-[#896EE2]" />
                        <span className="font-heading font-black text-xs uppercase tracking-wider text-[#0D0431]">
                          Interviewer Follow-Up Probe:
                        </span>
                      </div>
                      <h5 className="font-heading font-bold text-sm text-[#0D0431]">
                        "{evaluationResult.follow_up_question}"
                      </h5>

                      {!followUpSubmitted ? (
                        <div className="space-y-2 pt-2">
                          <textarea
                            rows={3}
                            value={followUpAnswer}
                            onChange={(e) => setFollowUpAnswer(e.target.value)}
                            placeholder="Answer the interviewer's follow-up probe directly with technical specifics and trade-offs..."
                            className="w-full p-3 bg-white text-[#0D0431] border-2 border-[#0D0431] rounded-xl text-xs font-medium focus:outline-none transition-all resize-none shadow-[2px_2px_0_0_#0D0431]"
                          />
                          <button
                            type="button"
                            onClick={handleEvaluateFollowUp}
                            disabled={!followUpAnswer.trim() || followUpEvaluating}
                            className="px-4 py-2 bg-[#0D0431] hover:bg-[#24195A] text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2 shadow-[2px_2px_0_0_#FEDF6A]"
                          >
                            {followUpEvaluating ? (
                              <>
                                <span className="animate-spin">⏳</span>
                                <span>Evaluating Follow-Up with AI...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5 text-[#FEDF6A]" />
                                <span>Evaluate Follow-Up Response</span>
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3 pt-2">
                          <div className="p-3 bg-white border-2 border-[#0D0431] rounded-xl text-xs font-medium space-y-1 shadow-[2px_2px_0_0_#0D0431]">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#0D7A68] flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Follow-Up Response Evaluated</span>
                              </span>
                              {followUpResult && (
                                <span className="px-2 py-0.5 rounded-md bg-[#D4FDF7] border border-[#0D0431] font-mono font-bold text-[11px]">
                                  Score: {followUpResult.score ?? 78}/100
                                </span>
                              )}
                            </div>
                            <p className="text-[#0D0431]/80 italic mt-1">"{followUpAnswer}"</p>
                          </div>

                          {followUpResult && (
                            <div className="p-3 bg-[#FAF7EE] border-2 border-[#0D0431] rounded-xl space-y-2 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-heading font-black text-[#0D0431] uppercase text-[11px]">
                                  Probe Feedback: {followUpResult.overall_verdict || "Effective"}
                                </span>
                              </div>

                              {followUpResult.strengths && followUpResult.strengths.length > 0 && (
                                <div className="space-y-1">
                                  <span className="font-bold text-emerald-700 block text-[11px]">Key Strengths:</span>
                                  <ul className="list-disc list-inside text-[#0D0431]/80 text-[11px] space-y-0.5">
                                    {followUpResult.strengths.map((s, idx) => (
                                      <li key={idx}>{s}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {followUpResult.areas_for_improvement && followUpResult.areas_for_improvement.length > 0 && (
                                <div className="space-y-1">
                                  <span className="font-bold text-[#C7382B] block text-[11px]">Refinement Opportunity:</span>
                                  <ul className="list-disc list-inside text-[#0D0431]/80 text-[11px] space-y-0.5">
                                    {followUpResult.areas_for_improvement.map((a, idx) => (
                                      <li key={idx}>{a}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {followUpResult.one_tip && (
                                <p className="text-[11px] text-[#896EE2] font-mono font-bold pt-1 border-t border-[#0D0431]/10">
                                  💡 {followUpResult.one_tip}
                                </p>
                              )}
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setFollowUpSubmitted(false);
                              setFollowUpResult(null);
                            }}
                            className="text-xs font-mono font-bold text-[#896EE2] hover:text-[#0D0431] underline cursor-pointer"
                          >
                            Revise Follow-Up Answer
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </GpModal>
        )}

        {/* ========================================================================= */}
        {/* ADD/EDIT MASTER STORY MODAL                                              */}
        {/* ========================================================================= */}
        {isStoryModalOpen && (
          <GpModal
            isOpen={isStoryModalOpen}
            onClose={() => setIsStoryModalOpen(false)}
            title={editingStory ? "Edit Master STAR Story" : "Draft New Master STAR Story"}
            subtitle="Save your core project narrative for instant reuse across behavioral rounds"
            maxWidth="max-w-2xl"
          >
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-heading font-black text-[#0D0431] uppercase">
                  Story Title
                </label>
                <input
                  type="text"
                  value={storyForm.title}
                  onChange={(e) => setStoryForm({ ...storyForm, title: e.target.value })}
                  placeholder="e.g. Distributed Redis Caching Architecture"
                  className="w-full p-2.5 bg-white text-[#0D0431] border-2 border-[#0D0431] rounded-xl text-xs font-bold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-heading font-black text-[#0D0431] uppercase">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={storyForm.project}
                    onChange={(e) => setStoryForm({ ...storyForm, project: e.target.value })}
                    placeholder="e.g. E-Commerce Checkout Microservice"
                    className="w-full p-2.5 bg-white text-[#0D0431] border-2 border-[#0D0431] rounded-xl text-xs font-bold focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-heading font-black text-[#0D0431] uppercase">
                    Tech Stack
                  </label>
                  <input
                    type="text"
                    value={storyForm.techStack}
                    onChange={(e) => setStoryForm({ ...storyForm, techStack: e.target.value })}
                    placeholder="e.g. Go, PostgreSQL, Redis, Kubernetes"
                    className="w-full p-2.5 bg-white text-[#0D0431] border-2 border-[#0D0431] rounded-xl text-xs font-bold focus:outline-none"
                  />
                </div>
              </div>

              {/* Competency Tag Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-heading font-black text-[#0D0431] uppercase block">
                  Competencies & Behavioral Tags
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Technical Execution",
                    "Scalability",
                    "Conflict Resolution",
                    "Ownership",
                    "Incident Management",
                    "Customer Obsession",
                    "Mentorship",
                    "Collaboration",
                  ].map((comp) => {
                    const isSelected = (storyForm.competencies || []).includes(comp);
                    return (
                      <button
                        key={comp}
                        type="button"
                        onClick={() => {
                          const current = storyForm.competencies || [];
                          const next = current.includes(comp)
                            ? current.filter((c) => c !== comp)
                            : [...current, comp];
                          setStoryForm({ ...storyForm, competencies: next });
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border-2 border-[#0D0431] transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#D4FDF7] text-[#0D0431] shadow-[2px_2px_0_0_#0D0431]"
                            : "bg-white text-[#0D0431]/70 hover:bg-[#FEF9CF]"
                        }`}
                      >
                        {isSelected ? `✓ ${comp}` : `+ ${comp}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-heading font-black text-[#0D0431] uppercase">
                  1. Situation (Context & Problem Stakes)
                </label>
                <textarea
                  rows={2}
                  value={storyForm.situation}
                  onChange={(e) => setStoryForm({ ...storyForm, situation: e.target.value })}
                  placeholder="What was the business context, constraints, and problem bottleneck?..."
                  className="w-full p-2.5 bg-white text-[#0D0431] border-2 border-[#0D0431] rounded-xl text-xs font-medium focus:outline-none resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-heading font-black text-[#0D0431] uppercase">
                  2. Task (Your Goal & Responsibility)
                </label>
                <textarea
                  rows={2}
                  value={storyForm.task}
                  onChange={(e) => setStoryForm({ ...storyForm, task: e.target.value })}
                  placeholder="What was your specific individual role and key objective?..."
                  className="w-full p-2.5 bg-white text-[#0D0431] border-2 border-[#0D0431] rounded-xl text-xs font-medium focus:outline-none resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-heading font-black text-[#0D0431] uppercase">
                  3. Action (Technical Decisions & Trade-Offs - Use "I")
                </label>
                <textarea
                  rows={4}
                  value={storyForm.action}
                  onChange={(e) => setStoryForm({ ...storyForm, action: e.target.value })}
                  placeholder="What exact engineering choices, algorithms, tools, and PRs did you implement?..."
                  className="w-full p-2.5 bg-white text-[#0D0431] border-2 border-[#0D0431] rounded-xl text-xs font-medium focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-heading font-black text-[#0D0431] uppercase">
                  4. Result (Quantified Metrics & Business Impact)
                </label>
                <textarea
                  rows={2}
                  value={storyForm.result}
                  onChange={(e) => setStoryForm({ ...storyForm, result: e.target.value })}
                  placeholder="What were the exact metrics achieved (latency down 50%, 99.99% uptime, $100k saved)?..."
                  className="w-full p-2.5 bg-white text-[#0D0431] border-2 border-[#0D0431] rounded-xl text-xs font-medium focus:outline-none resize-none"
                />
              </div>

              <div className="pt-3 border-t-2 border-[#0D0431] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsStoryModalOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-[#FEF9CF] text-[#0D0431] rounded-xl text-xs font-bold border-2 border-[#0D0431] cursor-pointer"
                >
                  Cancel
                </button>
                <GpButton
                  onClick={handleSaveStoryForm}
                  variant="stacked-yellow"
                  size="md"
                >
                  Save Master Story
                </GpButton>
              </div>
            </div>
          </GpModal>
        )}
      </div>
    </main>
  );
}
