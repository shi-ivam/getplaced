/**
 * Readiness Scoring Canonical Weights and Status Definitions
 * Configuration for getPlaced Placement Readiness Engine
 */

export const READINESS_WEIGHTS = {
  dsa: 0.25,          // 25% Data Structures & Algorithms
  skills: 0.20,       // 20% Technical Skills & CS Fundamentals
  projects: 0.15,     // 15% Practical Projects & Engineering Portfolio
  resume: 0.15,       // 15% ATS Resume Strength
  academics: 0.10,    // 10% Academic Performance & Cutoffs
  communication: 0.075, // 7.5% Communication & Articulation
  interview: 0.075,   // 7.5% Technical & Behavioral Mock Interview
};

export const STATUS_LEVELS = [
  {
    min: 90,
    max: 100,
    key: "highly_ready",
    label: "Highly Ready",
    color: "emerald",
    badgeClass: "bg-emerald-950 text-emerald-300 border-emerald-800",
    description: "Exceptional alignment with tier-1 company hiring bar.",
  },
  {
    min: 75,
    max: 89.99,
    key: "interview_ready",
    label: "Interview Ready",
    color: "blue",
    badgeClass: "bg-blue-950 text-blue-300 border-blue-800",
    description: "Solid foundation; competitive for placement drives and technical screens.",
  },
  {
    min: 60,
    max: 74.99,
    key: "developing",
    label: "Developing",
    color: "amber",
    badgeClass: "bg-amber-950 text-amber-300 border-amber-800",
    description: "Good initial progress; targeted practice needed in key gap areas.",
  },
  {
    min: 40,
    max: 59.99,
    key: "needs_major_improvement",
    label: "Needs Major Improvement",
    color: "orange",
    badgeClass: "bg-orange-950 text-orange-300 border-orange-800",
    description: "Significant gaps in core competencies compared to company requirements.",
  },
  {
    min: 0,
    max: 39.99,
    key: "not_ready",
    label: "Not Ready",
    color: "rose",
    badgeClass: "bg-rose-950 text-rose-300 border-rose-800",
    description: "Baseline data insufficient or major preparation milestones missing.",
  },
];

export const DIMENSION_METADATA = {
  dsa: {
    id: "dsa",
    name: "DSA",
    fullName: "Data Structures & Algorithms",
    weight: 0.25,
    weightPercent: 25,
    description: "Algorithmic problem-solving, time & space complexity, LeetCode patterns",
    actionLink: "/app/interview",
    actionLabel: "Practice DSA",
    defaultRequiredScore: 85,
  },
  skills: {
    id: "skills",
    name: "Skills",
    fullName: "Technical Skills & Stack",
    weight: 0.20,
    weightPercent: 20,
    description: "CS fundamentals, languages, frameworks, and job role domain competencies",
    actionLink: "/app/profile",
    actionLabel: "Update Skills",
    defaultRequiredScore: 80,
  },
  projects: {
    id: "projects",
    name: "Projects",
    fullName: "Real-World Projects & GitHub",
    weight: 0.15,
    weightPercent: 15,
    description: "Practical engineering experience, full-stack complexity, clean code on GitHub",
    actionLink: "/app/profile",
    actionLabel: "Connect GitHub",
    defaultRequiredScore: 75,
  },
  resume: {
    id: "resume",
    name: "Resume",
    fullName: "ATS Resume Strength",
    weight: 0.15,
    weightPercent: 15,
    description: "ATS parse rate, role keyword matching, impact quantification, formatting",
    actionLink: "/app/resume",
    actionLabel: "Analyze Resume",
    defaultRequiredScore: 85,
  },
  academics: {
    id: "academics",
    name: "Academics",
    fullName: "Academic Performance & Eligibility",
    weight: 0.10,
    weightPercent: 10,
    description: "Undergraduate CGPA, degree rigor, and corporate eligibility cutoffs",
    actionLink: "/app/profile",
    actionLabel: "Update Academics",
    defaultRequiredScore: 75,
  },
  communication: {
    id: "communication",
    name: "Communication",
    fullName: "Verbal & Presentation Skills",
    weight: 0.075,
    weightPercent: 7.5,
    description: "Clarity of explanation, structured thinking, behavioral STAR responses",
    actionLink: "/app/interview",
    actionLabel: "Practice Speaking",
    defaultRequiredScore: 75,
  },
  interview: {
    id: "interview",
    name: "Interview",
    fullName: "Mock Technical Interviews",
    weight: 0.075,
    weightPercent: 7.5,
    description: "Live coding simulation, system design articulation, behavioral readiness",
    actionLink: "/app/interview",
    actionLabel: "Mock Interview",
    defaultRequiredScore: 80,
  },
};

/**
 * Returns status level object for a given score (0-100)
 */
export const getStatusFromScore = (score) => {
  if (score === null || score === undefined || isNaN(score)) {
    return {
      key: "not_analyzed",
      label: "Not Analyzed",
      color: "gray",
      badgeClass: "bg-gray-800 text-gray-400 border-gray-700",
      description: "Data has not been provided or evaluated yet.",
    };
  }

  const numericScore = Number(score);
  for (const level of STATUS_LEVELS) {
    if (numericScore >= level.min) {
      return level;
    }
  }

  return STATUS_LEVELS[STATUS_LEVELS.length - 1];
};

/**
 * Returns default benchmark target score based on company tier
 */
export const getCompanyTargetBenchmark = (companyName) => {
  if (!companyName || typeof companyName !== "string") {
    return 85;
  }

  const normalized = companyName.toLowerCase().trim();

  // Tier 1 MAANG & Top Product Companies (Target: 90)
  const tier1 = [
    "google",
    "microsoft",
    "amazon",
    "apple",
    "meta",
    "netflix",
    "uber",
    "stripe",
    "atlassian",
    "nvidia",
    "linkedin",
  ];

  // Tier 2 Product & High-Growth Unicorns (Target: 85)
  const tier2 = [
    "oracle",
    "adobe",
    "salesforce",
    "cisco",
    "goldman sachs",
    "jpmorgan chase",
    "morgan stanley",
    "flipkart",
    "swiggy",
    "zomato",
    "razorpay",
    "paytm",
    "intuit",
    "paypal",
    "walmart",
  ];

  // Enterprise & IT Services (Target: 75)
  const tier3 = [
    "tcs",
    "infosys",
    "wipro",
    "accenture",
    "cognizant",
    "capgemini",
    "hcltech",
    "ibm",
    "deloitte",
  ];

  if (tier1.some((t) => normalized.includes(t))) return 90;
  if (tier2.some((t) => normalized.includes(t))) return 85;
  if (tier3.some((t) => normalized.includes(t))) return 75;

  return 85;
};
