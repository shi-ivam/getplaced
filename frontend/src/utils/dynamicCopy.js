/**
 * dynamicCopy.js
 * Centralized human-centered dynamic copy helper system for GetPlaced.
 * Generates level-aware, confident, mentor-like UI copy without generic AI clichés.
 */

// 1. Placement Readiness Tiers (0-100 Benchmark)
export const READINESS_TIERS = {
  NOT_READY: {
    key: "not_ready",
    min: 0,
    max: 39.9,
    label: "Foundation Phase",
    heading: "Let's build your foundation",
    subheading: "Start by closing your biggest gaps and mastering the core fundamentals.",
    mentorTip: "Focus on high-yield basics first before moving into advanced company mock rounds.",
    ctaText: "Build My Foundation",
    ctaLink: "/app/roadmap",
    badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    dotClass: "bg-rose-400",
    scoreColor: "text-rose-400",
    progressBarColor: "bg-rose-500",
  },
  BUILDING: {
    key: "building",
    min: 40,
    max: 59.9,
    label: "Building Momentum",
    heading: "You're building momentum",
    subheading: "Your foundation is taking shape. Keep consistency high and focus on your top 2 gaps.",
    mentorTip: "You're past the hardest starting hurdle. Closing mid-level gaps will accelerate your score rapidly.",
    ctaText: "Close My Biggest Gaps",
    ctaLink: "/app/coding",
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    dotClass: "bg-amber-400",
    scoreColor: "text-amber-400",
    progressBarColor: "bg-amber-400",
  },
  GETTING_READY: {
    key: "getting_ready",
    min: 60,
    max: 74.9,
    label: "Getting Close",
    heading: "You're getting close",
    subheading: "Now it's about closing the final gaps and sharpening your interview delivery.",
    mentorTip: "Focus on company-specific patterns and polish your resume bullets with quantified impact.",
    ctaText: "Push Toward Interview Ready",
    ctaLink: "/app/dsa",
    badgeClass: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    dotClass: "bg-sky-400",
    scoreColor: "text-sky-400",
    progressBarColor: "bg-sky-400",
  },
  INTERVIEW_READY: {
    key: "interview_ready",
    min: 75,
    max: 89.9,
    label: "Interview Ready",
    heading: "You're ready to start interviewing",
    subheading: "Your profile is looking strong across core pillars. Start taking mock rounds and applying.",
    mentorTip: "Simulate high-pressure live coding and behavioral questions to maintain sharpness.",
    ctaText: "Prepare For Interviews",
    ctaLink: "/app/mock-interview",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    dotClass: "bg-emerald-400",
    scoreColor: "text-emerald-400",
    progressBarColor: "bg-emerald-400",
  },
  COMPANY_READY: {
    key: "company_ready",
    min: 90,
    max: 100,
    label: "Company Ready",
    heading: "You're ready to compete",
    subheading: "You're in strong shape for your target role. Focus on high-match job openings and referrals.",
    mentorTip: "You exceed benchmark standards across technical and behavioral dimensions.",
    ctaText: "Find Matching Jobs",
    ctaLink: "/app/job",
    badgeClass: "bg-emerald-500/10 text-emerald-300 border-emerald-400/30",
    dotClass: "bg-emerald-300",
    scoreColor: "text-emerald-300",
    progressBarColor: "bg-emerald-300",
  },
  UNASSESSED: {
    key: "unassessed",
    min: null,
    max: null,
    label: "Pending Assessment",
    heading: "Let's benchmark your profile",
    subheading: "Connect your accounts and take the initial audit to calibrate your placement bar.",
    mentorTip: "Run a full audit to see exactly where you stand against target tech companies.",
    ctaText: "Audit Readiness",
    ctaLink: "/app/profile",
    badgeClass: "bg-zinc-800/80 text-zinc-400 border-zinc-700/60",
    dotClass: "bg-zinc-500",
    scoreColor: "text-zinc-500",
    progressBarColor: "bg-zinc-700",
  },
};

// 2. Standardized Status Labels & Human Action Phrases
export const STATUS_PHRASES = {
  ABOVE: {
    key: "above",
    label: "Above Target",
    humanPhrase: "You're ahead here",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    dotClass: "bg-emerald-400",
    textColor: "text-emerald-400",
    type: "positive",
  },
  READY: {
    key: "ready",
    label: "Ready",
    humanPhrase: "You're covered",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    dotClass: "bg-emerald-400",
    textColor: "text-emerald-400",
    type: "positive",
  },
  SMALL_GAP: {
    key: "small_gap",
    label: "Small Gap",
    humanPhrase: "Needs a little work",
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    dotClass: "bg-amber-400",
    textColor: "text-amber-400",
    type: "warning",
  },
  MEDIUM_GAP: {
    key: "medium_gap",
    label: "Medium Gap",
    humanPhrase: "Needs attention",
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    dotClass: "bg-amber-400",
    textColor: "text-amber-400",
    type: "warning",
  },
  LARGE_GAP: {
    key: "large_gap",
    label: "Large Gap",
    humanPhrase: "This is a priority",
    badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    dotClass: "bg-rose-400",
    textColor: "text-rose-400",
    type: "priority",
  },
  UNASSESSED: {
    key: "unassessed",
    label: "Not Analyzed",
    humanPhrase: "Needs evaluation",
    badgeClass: "bg-zinc-800/80 text-zinc-400 border-zinc-700/60",
    dotClass: "bg-zinc-500",
    textColor: "text-zinc-500",
    type: "neutral",
  },
};

/**
 * Get the readiness tier metadata based on a numerical score (0-100).
 */
export function getReadinessTier(score) {
  if (score === null || score === undefined || isNaN(Number(score))) {
    return READINESS_TIERS.UNASSESSED;
  }
  const numericScore = Number(score);
  if (numericScore < 40) return READINESS_TIERS.NOT_READY;
  if (numericScore < 60) return READINESS_TIERS.BUILDING;
  if (numericScore < 75) return READINESS_TIERS.GETTING_READY;
  if (numericScore < 90) return READINESS_TIERS.INTERVIEW_READY;
  return READINESS_TIERS.COMPANY_READY;
}

/**
 * Get level-based CTA text and primary link.
 */
export function getReadinessCTA(score) {
  const tier = getReadinessTier(score);
  return {
    ctaText: tier.ctaText,
    ctaLink: tier.ctaLink,
    tierLabel: tier.label,
  };
}

/**
 * Contextual Hero Headline & Subheading Generator.
 * Personalizes greetings, tier-based headings, target company/role alignments,
 * top gap warnings, and recent momentum without AI buzzwords.
 */
export function getHeroHeadline({
  readinessScore = null,
  targetCompany = "",
  targetRole = "",
  biggestGap = "",
  strongestSkill = "",
  recentProgress = null,
  userName = "",
} = {}) {
  const tier = getReadinessTier(readinessScore);
  const company = targetCompany?.trim() || "";
  const role = targetRole?.trim() || "Software Engineer";
  const firstName = userName ? userName.trim().split(" ")[0] : "";

  let title = tier.heading;
  let subtitle = tier.subheading;
  let mentorNote = tier.mentorTip;

  if (tier.key === "not_ready") {
    if (company) {
      subtitle = `We'll help you reach the bar for ${role} at ${company}. Start with core essentials and close foundational gaps.`;
    } else {
      subtitle = `Start by establishing your fundamentals across coding, projects, and interview preparation.`;
    }
    if (biggestGap) {
      mentorNote = `Your biggest opportunity right now is in ${biggestGap}. Tackling this first will give you the fastest jump in readiness.`;
    }
  } else if (tier.key === "building") {
    if (company) {
      subtitle = `You are steadily closing the requirements for ${role} at ${company}. Prioritize high-impact topics to cross into the 60+ tier.`;
    } else {
      subtitle = `Your foundation is solidifying. Consistency on your highest-weight gap will unlock rapid score gains.`;
    }
    if (biggestGap) {
      mentorNote = `Focus on ${biggestGap} this week — closing this single area moves you significantly closer to interview-ready.`;
    }
  } else if (tier.key === "getting_ready") {
    if (company) {
      subtitle = `You're within reach of the ${company} benchmark for ${role}. Now it's about closing final blindspots.`;
    } else {
      subtitle = `You're close to interview benchmark levels. Sharpen your project depth and practice timed questions.`;
    }
    if (strongestSkill) {
      mentorNote = `Your ${strongestSkill} is looking solid. Shore up ${biggestGap || "behavioral delivery"} to lock in interview readiness.`;
    }
  } else if (tier.key === "interview_ready") {
    if (company) {
      subtitle = `Your profile meets the target bar for ${company} (${role}). Polish your mock execution and start scheduling drives.`;
    } else {
      subtitle = `Your profile is strong across technical and behavioral pillars. Maintain sharpness with timed mocks.`;
    }
    if (strongestSkill) {
      mentorNote = `Strong ${strongestSkill} gives you an edge. Focus on crisp STAR communication during technical walk-throughs.`;
    }
  } else if (tier.key === "company_ready") {
    if (company) {
      subtitle = `You're in peak shape for ${role} positions at ${company}. Shift focus to active applications and high-match openings.`;
    } else {
      subtitle = `You meet and exceed benchmark requirements. High-conviction job matching and live interviews are your next step.`;
    }
    mentorNote = `Top percentile readiness across all pillars. Keep your problem-solving rhythm warm while interviewing.`;
  } else {
    // Unassessed
    if (company) {
      subtitle = `Calibrate your profile against ${company} (${role}) benchmarks to uncover your precise placement gaps.`;
    } else {
      subtitle = `Benchmark your skills across DSA, projects, ATS resume, and mock interviews.`;
    }
  }

  // Personalize title if user's name is available
  if (firstName) {
    if (tier.key === "not_ready") {
      title = `Let's build your foundation, ${firstName}`;
    } else if (tier.key === "building") {
      title = `You're building momentum, ${firstName}`;
    } else if (tier.key === "getting_ready") {
      title = `You're getting close, ${firstName}`;
    } else if (tier.key === "interview_ready") {
      title = `You're ready to start interviewing, ${firstName}`;
    } else if (tier.key === "company_ready") {
      title = `You're ready to compete, ${firstName}`;
    } else {
      title = `Welcome back, ${firstName}`;
    }
  }

  // Add progress momentum if recentProgress is positive
  if (recentProgress && Number(recentProgress) > 0) {
    mentorNote = `+${recentProgress} pts gained recently. ${mentorNote}`;
  }

  return {
    greeting: firstName ? `Welcome back, ${firstName}` : "Candidate Hub",
    title,
    subtitle,
    mentorNote,
    tierKey: tier.key,
    tierLabel: tier.label,
    badgeClass: tier.badgeClass,
    dotClass: tier.dotClass,
    scoreColor: tier.scoreColor,
    progressBarColor: tier.progressBarColor,
    ctaText: tier.ctaText,
    ctaLink: tier.ctaLink,
    targetSummary: company ? `${company} • ${role}` : role,
  };
}

/**
 * Standardize Gap & Status calculation on a 0-10 or 0-100 scale.
 * Categorizes gap into: ABOVE TARGET, READY, SMALL GAP, MEDIUM GAP, LARGE GAP, UNASSESSED.
 */
export function getGapStatusInfo(statusKey, gap = null, currentLevel = null, requiredLevel = null) {
  // If statusKey is explicitly provided
  if (statusKey === "above") return STATUS_PHRASES.ABOVE;
  if (statusKey === "meets") return STATUS_PHRASES.READY;
  if (statusKey === "not_analyzed" || statusKey === "unassessed") return STATUS_PHRASES.UNASSESSED;

  // If gap is provided numerically
  if (gap !== null && gap !== undefined && !isNaN(Number(gap))) {
    const numGap = Number(gap);
    if (numGap > 0.3) return STATUS_PHRASES.ABOVE;
    if (numGap >= 0) return STATUS_PHRASES.READY;
    if (numGap >= -1.5) return STATUS_PHRASES.SMALL_GAP;
    if (numGap >= -3.0) return STATUS_PHRASES.MEDIUM_GAP;
    return STATUS_PHRASES.LARGE_GAP;
  }

  // If currentLevel and requiredLevel are provided
  if (currentLevel !== null && requiredLevel !== null && currentLevel !== undefined && requiredLevel !== undefined) {
    const diff = Number(currentLevel) - Number(requiredLevel);
    if (diff > 0.3) return STATUS_PHRASES.ABOVE;
    if (diff >= 0) return STATUS_PHRASES.READY;
    if (diff >= -1.5) return STATUS_PHRASES.SMALL_GAP;
    if (diff >= -3.0) return STATUS_PHRASES.MEDIUM_GAP;
    return STATUS_PHRASES.LARGE_GAP;
  }

  if (statusKey === "needs_improvement") return STATUS_PHRASES.MEDIUM_GAP;
  return STATUS_PHRASES.UNASSESSED;
}

/**
 * Format Level Comparison into standardized YOU vs TARGET vs TO CLOSE strings.
 * e.g., "YOU 6.0/10", "TARGET 8.0/10", "TO CLOSE 2.0 levels"
 */
export function formatLevelComparison(currentLevel, requiredLevel, customGap = null) {
  const cur = currentLevel !== null && currentLevel !== undefined ? Number(currentLevel) : null;
  const req = requiredLevel !== null && requiredLevel !== undefined ? Number(requiredLevel) : null;
  const gap = customGap !== null && customGap !== undefined
    ? Number(customGap)
    : cur !== null && req !== null
    ? cur - req
    : null;

  const youText = cur !== null ? `YOU ${cur.toFixed(1)}/10` : "YOU —/10";
  const targetText = req !== null ? `TARGET ${req.toFixed(1)}/10` : "TARGET —/10";

  let toCloseText = "TO CLOSE —";
  let deltaLabel = "Pending";
  let isMet = false;

  if (gap !== null) {
    if (gap > 0.05) {
      toCloseText = `AHEAD +${gap.toFixed(1)} levels`;
      deltaLabel = `Ahead by ${gap.toFixed(1)} levels`;
      isMet = true;
    } else if (gap >= 0) {
      toCloseText = "ON TARGET (0.0)";
      deltaLabel = "Target Met";
      isMet = true;
    } else {
      const needed = Math.abs(gap);
      toCloseText = `TO CLOSE ${needed.toFixed(1)} level${needed === 1 ? "" : "s"}`;
      deltaLabel = `Gap of ${needed.toFixed(1)} levels`;
      isMet = false;
    }
  }

  const statusInfo = getGapStatusInfo(null, gap, cur, req);

  return {
    youText,
    targetText,
    toCloseText,
    deltaLabel,
    gapNumeric: gap,
    isMet,
    statusLabel: statusInfo.label,
    humanPhrase: statusInfo.humanPhrase,
    badgeClass: statusInfo.badgeClass,
    dotClass: statusInfo.dotClass,
    textColor: statusInfo.textColor,
  };
}

/**
 * Dynamic copy helper for "What Should I Do Next" / Daily Action Center.
 */
export function getWhatToDoNextCopy({
  readinessScore = null,
  streakDays = 0,
  tasksCompleted = 0,
  totalTasks = 3,
  targetCompany = "",
} = {}) {
  const tier = getReadinessTier(readinessScore);
  const company = targetCompany?.trim();

  let title = "Here's what I'd work on next";
  let subtitle = "High-impact daily actions prioritized to close your biggest target gaps.";

  if (tier.key === "not_ready") {
    title = "Here's how to build your foundation today";
    subtitle = "Complete these essential tasks to establish your core benchmark score.";
  } else if (tier.key === "building") {
    title = "Here's what I'd work on next";
    subtitle = company
      ? `Focused sprints to bridge your high-weight gaps for ${company}.`
      : "High-yield daily actions to keep your momentum building.";
  } else if (tier.key === "getting_ready") {
    title = "Here's what will get you interview ready";
    subtitle = "Targeted problem sets and portfolio polish to cross the interview bar.";
  } else if (tier.key === "interview_ready" || tier.key === "company_ready") {
    title = "Here's how to stay sharp today";
    subtitle = "High-leverage practice and application tasks to convert opportunities.";
  }

  const streakNote = streakDays > 0
    ? `${streakDays} day streak • Great consistency`
    : "Start your daily streak today";

  const progressSummary = `${tasksCompleted} of ${totalTasks} prioritized actions completed`;

  return {
    title,
    subtitle,
    streakNote,
    progressSummary,
    badgeText: "Mentor Prioritized",
  };
}

/**
 * DSA & Problem-Solving Contextual Copy.
 */
export function getDsaMentorCopy({
  currentScore = null,
  targetScore = 75,
  solvedCount = 0,
  targetCompany = "",
  weakTopic = "",
} = {}) {
  const score = currentScore !== null ? Number(currentScore) : null;
  const company = targetCompany?.trim() || "Target Tech";

  let heading = "DSA Problem-Solving Bar";
  let subtitle = `Calibrated algorithmic benchmarks for ${company} engineering interviews.`;
  let mentorTip = "Consistent pattern recognition beats memorizing individual problem solutions.";

  if (score === null) {
    heading = "Calibrate Your Problem-Solving Foundation";
    subtitle = `Connect your LeetCode profile or complete curated study sheets to evaluate your ${company} readiness.`;
    mentorTip = "Start with Arrays, Two Pointers, and Hash Maps before tackling complex graphs and DP.";
  } else if (score < 50) {
    heading = "Building Core DSA Patterns";
    subtitle = `You've solved ${solvedCount} problems. Focus on mastering fundamental patterns to clear initial coding rounds.`;
    mentorTip = weakTopic
      ? `Priority area: Spend 45 minutes on ${weakTopic} problem sets to boost your score.`
      : "Focus on medium-difficulty Tree and String questions to build pattern speed.";
  } else if (score < 75) {
    heading = "Closing the Algorithm Gap";
    subtitle = `Current score: ${score}% vs ${targetScore}% required for ${company}.`;
    mentorTip = weakTopic
      ? `Targeting ${weakTopic} and Dynamic Programming will close your remaining ${targetScore - score}% delta.`
      : "Practice timed 30-minute solves without looking at hints to simulate live pressure.";
  } else {
    heading = "Interview-Ready Problem Solving";
    subtitle = `Your ${score}% score meets ${company}'s standard (${targetScore}% target).`;
    mentorTip = "Focus on explaining time/space trade-offs clearly while typing your clean solution.";
  }

  return {
    heading,
    subtitle,
    mentorTip,
  };
}

/**
 * Projects & Development Contextual Copy.
 */
export function getDevMentorCopy({
  projectScore = null,
  targetScore = 70,
  repoCount = 0,
  targetCompany = "",
  topFramework = "",
} = {}) {
  const score = projectScore !== null ? Number(projectScore) : null;
  const company = targetCompany?.trim() || "Tech";

  let heading = "Engineering Projects & Code Depth";
  let subtitle = `Evaluated against production architecture expectations for ${company}.`;
  let mentorTip = "Showcase deployed live URLs, CI/CD pipelines, and measurable performance wins.";

  if (score === null || repoCount === 0) {
    heading = "Showcase Your Engineering Work";
    subtitle = "Connect GitHub or import repositories to evaluate project architecture and technology depth.";
    mentorTip = "Recruiters favor 2 deep, fully deployed full-stack projects over 10 trivial tutorials.";
  } else if (score < 55) {
    heading = "Upgrading Project Architecture";
    subtitle = `${repoCount} repositories analyzed (${score}% score). Time to elevate backend & cloud depth.`;
    mentorTip = "Add Docker containerization, automated GitHub Actions, and write a stellar README with architecture diagrams.";
  } else if (score < 75) {
    heading = "Solid Development Foundation";
    subtitle = `Your projects (${score}%) are approaching ${company}'s ${targetScore}% benchmark.`;
    mentorTip = "Quantify real throughput, latency metrics, or user load in your repository descriptions.";
  } else {
    heading = "Production-Grade Project Portfolio";
    subtitle = `Your repositories (${score}%) comfortably exceed benchmark requirements.`;
    mentorTip = "Be ready to deep-dive into database schema choices and system trade-offs during interviews.";
  }

  return {
    heading,
    subtitle,
    mentorTip,
  };
}

/**
 * Resume ATS & Content Contextual Copy.
 */
export function getResumeMentorCopy({
  atsScore = null,
  targetRole = "Software Engineer",
  matchedCount = 0,
  missingCount = 0,
  xyzCount = 0,
  targetCompany = "",
} = {}) {
  const score = atsScore !== null ? Number(atsScore) : null;
  const company = targetCompany?.trim() || "";

  let heading = "Resume ATS & Recruiter Impact";
  let subtitle = `Calibrated against Google XYZ metrics and screening filters for ${targetRole}.`;
  let mentorTip = "Every bullet should quantify impact: Accomplished [X], measured by [Y], by doing [Z].";

  if (score === null) {
    heading = "Audit Your Resume Against ATS Screens";
    subtitle = "Upload your resume PDF to measure keyword match, Google XYZ metrics, and role relevance.";
    mentorTip = "Recruiters spend an average of 6 seconds skimming your top project and experience bullets.";
  } else if (score < 60) {
    heading = "Resume Needs Key Optimizations";
    subtitle = `Current ATS score: ${score}/100. ${missingCount > 0 ? `${missingCount} key technical terms missing.` : "Bullets need quantified metrics."}`;
    mentorTip = "Replace generic task descriptions with action verbs and specific performance percentages.";
  } else if (score < 80) {
    heading = "Competitive Resume Profile";
    subtitle = `ATS Score: ${score}/100 with ${xyzCount} quantified impact bullets verified.`;
    mentorTip = company
      ? `Inject ${company}-specific tech keywords into your skills section to cross the 85+ threshold.`
      : "Refine your top 3 project bullets with explicit scale and architecture decisions.";
  } else {
    heading = "Top Tier Recruiter-Ready Resume";
    subtitle = `ATS Score: ${score}/100 (${matchedCount} matching keywords, strong Google XYZ framing).`;
    mentorTip = "Your resume will easily clear automated screeners. Ensure you can explain every metric in live rounds.";
  }

  return {
    heading,
    subtitle,
    mentorTip,
  };
}

/**
 * Mock Interview & HR Prep Contextual Copy.
 */
export function getInterviewMentorCopy({
  communicationScore = null,
  companyName = "",
  interviewType = "HR",
  targetRole = "Software Engineer",
} = {}) {
  const company = companyName?.trim() || "Top Tech";

  let heading = `${company} ${interviewType} Interview Practice`;
  let subtitle = `Simulate live interview rounds with instant feedback on structure, conciseness, and delivery.`;
  let mentorTip = "Use the STAR framework (Situation, Task, Action, Result) with 70% focus on your direct Action.";

  if (interviewType === "HR" || interviewType === "Behavioral") {
    heading = `${company} Behavioral & Culture Practice`;
    subtitle = `Calibrated against ${company}'s leadership principles and core engineering values.`;
    mentorTip = "Be concrete. Share specific conflict resolution and ownership examples from past projects.";
  } else if (interviewType === "Technical" || interviewType === "System Design") {
    heading = `${company} Technical & System Design Round`;
    subtitle = `Practice articulating trade-offs, scalability bottlenecks, and data flow clearly.`;
    mentorTip = "Always ask clarifying questions before jumping into architecture or algorithmic implementations.";
  }

  return {
    heading,
    subtitle,
    mentorTip,
  };
}

/**
 * Progress Tracker & Velocity Contextual Copy.
 */
export function getProgressTrackerMentorCopy({
  overallScore = null,
  velocity = "+4 pts/week",
  targetCompany = "",
} = {}) {
  const tier = getReadinessTier(overallScore);
  const company = targetCompany?.trim();

  let heading = "Placement Velocity & Trajectory";
  let subtitle = "Multi-dimensional growth telemetry, practice velocity, and readiness forecasting.";
  let velocityInsight = `Maintaining your current pace of ${velocity} keeps your target timeline on track.`;

  if (tier.key === "not_ready") {
    heading = "Foundation Velocity & Growth";
    subtitle = "Track daily habits and score acceleration as you complete fundamental milestones.";
    velocityInsight = "Daily consistency in this phase yields the steepest score improvements.";
  } else if (tier.key === "building") {
    heading = "Acceleration & Gap Closure Rate";
    subtitle = company
      ? `Measuring weekly progress toward ${company} interview thresholds.`
      : "Measuring weekly velocity and gap closure across all 7 dimensions.";
    velocityInsight = "Focusing on your single largest gap will maximize points gained per study hour.";
  } else if (tier.key === "getting_ready") {
    heading = "Interview Readiness Trajectory";
    subtitle = "Refining final competencies and forecasting your benchmark pass probability.";
    velocityInsight = "Transitioning to timed mock interviews now will yield high returns.";
  } else if (tier.key === "interview_ready" || tier.key === "company_ready") {
    heading = "Peak Preparation Telemetry";
    subtitle = "Maintaining consistent problem-solving velocity and mock interview readiness.";
    velocityInsight = "You are in competitive shape. Focus on application volume and mock freshness.";
  }

  return {
    heading,
    subtitle,
    velocityInsight,
  };
}
