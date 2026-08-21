import mongoose from "mongoose";
import CompanyRequirement, { normalizeIdentifier } from "../models/companyRequirementModel.js";

/**
 * Calculates the exact numerical gap between candidate current level and required level.
 * Formula: gap = currentLevel - requiredLevel
 * 
 * @param {number|null} currentLevel - Candidate level (0-10) or null if unanalyzed
 * @param {number} requiredLevel - Target required level (0-10)
 * @returns {number|null} Exact difference rounded to 1 decimal place, or null
 */
export const calculateGap = (currentLevel, requiredLevel) => {
  if (
    currentLevel === null ||
    currentLevel === undefined ||
    isNaN(Number(currentLevel))
  ) {
    return null;
  }
  const curr = Number(currentLevel);
  const req = Number(requiredLevel);
  return Math.round((curr - req) * 10) / 10;
};

/**
 * Returns structured status object based on calculated gap and data availability.
 * 
 * @param {number|null} gap - Numerical difference (currentLevel - requiredLevel)
 * @param {string} dataAvailability - 'available' | 'partial' | 'not_started' | 'insufficient_data'
 * @returns {Object} Status object with key, label, color, and description
 */
export const getStatusFromGap = (gap, dataAvailability = "available") => {
  if (
    dataAvailability === "not_started" ||
    dataAvailability === "insufficient_data" ||
    gap === null ||
    gap === undefined
  ) {
    return {
      key: "not_analyzed",
      label: "Not Analyzed",
      color: "gray",
      badgeClass: "bg-zinc-800/90 text-zinc-400 border-zinc-700/80",
      description: "Assessment pending. Complete this module to benchmark your level.",
    };
  }

  if (gap > 0) {
    return {
      key: "above",
      label: "Above Requirement",
      color: "emerald",
      badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      description: `Exceeds target requirement by +${Math.abs(gap).toFixed(1)} levels.`,
    };
  }

  if (gap === 0) {
    return {
      key: "meets",
      label: "Meets Requirement",
      color: "emerald",
      badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      description: "Fully aligns with active company hiring benchmark.",
    };
  }

  // gap < 0 (Needs Improvement)
  const isMajor = gap <= -2.5;
  return {
    key: "needs_improvement",
    label: "Needs Improvement",
    color: isMajor ? "rose" : "amber",
    badgeClass: isMajor
      ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
      : "bg-amber-500/10 text-amber-400 border-amber-500/20",
    description: `Improvement needed: ${Math.abs(gap).toFixed(1)} levels to reach target bar.`,
  };
};

/**
 * Company tier determination for required benchmark levels.
 */
export const getCompanyTier = (companyName) => {
  if (!companyName || typeof companyName !== "string") return "tier2";

  const normalized = companyName.toLowerCase().trim();

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
    "adobe",
    "salesforce",
    "de shaw",
    "tower research",
  ];

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
    "tech mahindra",
    "mindtree",
    "l&t",
  ];

  if (tier1.some((t) => normalized.includes(t))) return "tier1";
  if (tier3.some((t) => normalized.includes(t))) return "tier3";
  return "tier2";
};

/**
 * Returns role-aligned technology stack requirements tailored to target job role and company tier.
 */
const getRoleTechStack = (targetJobRole, tier = "tier2") => {
  const role = (targetJobRole || "").toLowerCase();
  const isTier1 = tier === "tier1";
  const isTier3 = tier === "tier3";

  const baseReq = (base) => {
    if (isTier1) return Math.min(10, base + 0.5);
    if (isTier3) return Math.max(5, base - 1.0);
    return base;
  };

  if (role.includes("frontend") || role.includes("ui") || role.includes("react")) {
    return [
      { name: "JavaScript (ES6+ & Async)", requiredLevel: baseReq(8.5), importance: "Required" },
      { name: "React.js & Hooks", requiredLevel: baseReq(8.5), importance: "Required" },
      { name: "TypeScript", requiredLevel: baseReq(8.0), importance: "Required" },
      { name: "HTML5, CSS3 & Tailwind CSS", requiredLevel: baseReq(8.0), importance: "Required" },
      { name: "State Management (Redux/Zustand)", requiredLevel: baseReq(7.5), importance: "Preferred" },
      { name: "Web Performance & Core Web Vitals", requiredLevel: baseReq(7.5), importance: "Preferred" },
      { name: "REST APIs & Fetch Integration", requiredLevel: baseReq(8.0), importance: "Required" },
      { name: "Git & Version Control", requiredLevel: baseReq(7.5), importance: "Required" },
    ];
  }

  if (role.includes("backend") || role.includes("server") || role.includes("node") || role.includes("java")) {
    return [
      { name: "Node.js & Express / Java Spring", requiredLevel: baseReq(8.5), importance: "Required" },
      { name: "SQL & Relational Databases (PostgreSQL/MySQL)", requiredLevel: baseReq(8.5), importance: "Required" },
      { name: "RESTful & GraphQL API Design", requiredLevel: baseReq(8.0), importance: "Required" },
      { name: "MongoDB & NoSQL Databases", requiredLevel: baseReq(7.5), importance: "Preferred" },
      { name: "Docker & Containerization", requiredLevel: baseReq(7.5), importance: "Preferred" },
      { name: "Authentication & Security (JWT, OAuth)", requiredLevel: baseReq(8.0), importance: "Required" },
      { name: "System Architecture & Caching (Redis)", requiredLevel: baseReq(7.5), importance: "Preferred" },
      { name: "Git & CI/CD Basics", requiredLevel: baseReq(7.5), importance: "Required" },
    ];
  }

  if (role.includes("data") || role.includes("machine learning") || role.includes("ml") || role.includes("ai")) {
    return [
      { name: "Python & Scientific Libraries (NumPy, Pandas)", requiredLevel: baseReq(8.5), importance: "Required" },
      { name: "SQL & Data Modeling", requiredLevel: baseReq(8.0), importance: "Required" },
      { name: "Scikit-Learn & Machine Learning Algorithms", requiredLevel: baseReq(8.0), importance: "Required" },
      { name: "Deep Learning (PyTorch / TensorFlow)", requiredLevel: baseReq(7.5), importance: "Preferred" },
      { name: "Data Visualization & EDA", requiredLevel: baseReq(7.5), importance: "Preferred" },
      { name: "Model Deployment & REST APIs", requiredLevel: baseReq(7.0), importance: "Preferred" },
      { name: "Git & Collaborative Code Review", requiredLevel: baseReq(7.5), importance: "Required" },
    ];
  }

  if (role.includes("devops") || role.includes("cloud") || role.includes("infrastructure")) {
    return [
      { name: "Linux Administration & Shell Scripting", requiredLevel: baseReq(8.5), importance: "Required" },
      { name: "Docker & Kubernetes Orchestration", requiredLevel: baseReq(8.5), importance: "Required" },
      { name: "CI/CD Pipelines (GitHub Actions / GitLab)", requiredLevel: baseReq(8.0), importance: "Required" },
      { name: "AWS / Azure / GCP Cloud Services", requiredLevel: baseReq(8.0), importance: "Required" },
      { name: "Infrastructure as Code (Terraform)", requiredLevel: baseReq(7.5), importance: "Preferred" },
      { name: "Monitoring & Observability (Prometheus/Grafana)", requiredLevel: baseReq(7.5), importance: "Preferred" },
      { name: "Git & GitOps", requiredLevel: baseReq(8.0), importance: "Required" },
    ];
  }

  // Default: General Software Development Engineer (SDE / Full Stack)
  return [
    { name: "JavaScript / TypeScript", requiredLevel: baseReq(8.0), importance: "Required" },
    { name: "React.js & Frontend Architecture", requiredLevel: baseReq(8.0), importance: "Required" },
    { name: "Node.js & Backend Services", requiredLevel: baseReq(8.0), importance: "Required" },
    { name: "SQL & Database Schema Design", requiredLevel: baseReq(8.0), importance: "Required" },
    { name: "Python / Java Fundamentals", requiredLevel: baseReq(7.5), importance: "Preferred" },
    { name: "REST APIs & Microservices Basics", requiredLevel: baseReq(8.0), importance: "Required" },
    { name: "Docker & Container Basics", requiredLevel: baseReq(7.0), importance: "Preferred" },
    { name: "Git & Version Control Workflow", requiredLevel: baseReq(7.5), importance: "Required" },
  ];
};

/**
 * Builds the comprehensive 9-category Level Comparison and Gap Analysis for a user.
 * 
 * @param {Object} user - User document
 * @param {Object|null} companyRequirement - Specific company requirements from DB (optional)
 * @returns {Object} Structured level comparison & gap analysis payload
 */
export const buildLevelComparison = (user, companyRequirement = null) => {
  const targetCompany = user?.targetCompany?.trim() || "General Industry Target";
  const targetJobRole = user?.targetJobRole?.trim() || "Software Development Engineer";
  const targetCompanyNormalized =
    user?.targetCompanyNormalized || normalizeIdentifier(targetCompany);
  const targetRoleNormalized =
    user?.targetRoleNormalized || normalizeIdentifier(targetJobRole);

  const tier = getCompanyTier(targetCompany);
  const isTier1 = tier === "tier1";
  const isTier3 = tier === "tier3";

  // Tier-based benchmark modifiers
  const tierReq = (base) => {
    if (isTier1) return Math.min(10, base + 0.5);
    if (isTier3) return Math.max(5, base - 1.0);
    return base;
  };

  // Extract candidate profile baseline data
  const hasCgpa =
    user?.cgpa !== null && user?.cgpa !== undefined && !isNaN(Number(user?.cgpa));
  const cgpaLevel = hasCgpa ? Math.min(10, Math.max(0, Number(user.cgpa))) : null;

  const has10th =
    user?.tenthPercentage !== null &&
    user?.tenthPercentage !== undefined &&
    !isNaN(Number(user?.tenthPercentage));
  const has12th =
    user?.twelfthPercentage !== null &&
    user?.twelfthPercentage !== undefined &&
    !isNaN(Number(user?.twelfthPercentage));
  
  let secondaryLevel = null;
  if (has10th && has12th) {
    secondaryLevel =
      Math.round(((Number(user.tenthPercentage) + Number(user.twelfthPercentage)) / 20) * 10) / 10;
  } else if (has12th) {
    secondaryLevel = Math.round((Number(user.twelfthPercentage) / 10) * 10) / 10;
  }

  // Check degree baseline
  let degreeFoundationLevel = null;
  const degreeStr = (user?.degree || "").toLowerCase();
  if (degreeStr) {
    if (degreeStr.includes("b.tech") || degreeStr.includes("b.e.") || degreeStr.includes("m.tech")) {
      degreeFoundationLevel = 8.0;
    } else if (degreeStr.includes("mca")) {
      degreeFoundationLevel = 7.6;
    } else if (degreeStr.includes("bca") || degreeStr.includes("b.sc")) {
      degreeFoundationLevel = 7.2;
    } else {
      degreeFoundationLevel = 7.0;
    }
  }

  // Module scores if candidate has assessed them
  const resumeLevel =
    user?.resumeScore !== undefined && user?.resumeScore !== null && !isNaN(Number(user.resumeScore))
      ? Math.round((Number(user.resumeScore) / 10) * 10) / 10
      : null;

  const dsaLevel =
    user?.dsaScore !== undefined && user?.dsaScore !== null && !isNaN(Number(user.dsaScore))
      ? Math.round((Number(user.dsaScore) / 10) * 10) / 10
      : null;

  const projectsLevel =
    user?.projectsScore !== undefined && user?.projectsScore !== null && !isNaN(Number(user.projectsScore))
      ? Math.round((Number(user.projectsScore) / 10) * 10) / 10
      : null;

  const communicationLevel =
    user?.communicationScore !== undefined &&
    user?.communicationScore !== null &&
    !isNaN(Number(user.communicationScore))
      ? Math.round((Number(user.communicationScore) / 10) * 10) / 10
      : null;

  const interviewLevel =
    user?.interviewScore !== undefined &&
    user?.interviewScore !== null &&
    !isNaN(Number(user.interviewScore))
      ? Math.round((Number(user.interviewScore) / 10) * 10) / 10
      : null;

  // Custom company requirement adjustments if DB entry exists
  let dsaReqBenchmark = tierReq(8.5);
  if (companyRequirement?.dsaExpectation?.level) {
    const dsaLev = companyRequirement.dsaExpectation.level;
    if (dsaLev === "Very Hard") dsaReqBenchmark = 9.5;
    else if (dsaLev === "Hard") dsaReqBenchmark = 9.0;
    else if (dsaLev === "Medium") dsaReqBenchmark = 8.0;
    else if (dsaLev === "Easy") dsaReqBenchmark = 7.0;
  }

  let academicsReqCutoff = tierReq(8.0);
  if (companyRequirement?.cgpaCutoff && companyRequirement.cgpaCutoff > 0) {
    academicsReqCutoff = Number(companyRequirement.cgpaCutoff);
  }

  // Build the 9 Categories Container
  const categoryDefinitions = [
    // -------------------------------------------------------------
    // 1. DSA (Data Structures & Algorithms)
    // -------------------------------------------------------------
    {
      id: "dsa",
      name: "DSA",
      fullName: "Data Structures & Algorithms",
      icon: "Code2",
      description: "Algorithmic mastery, complexity analysis, and coding interview problem solving.",
      items: [
        {
          id: "dsa-overall",
          name: "Overall DSA Readiness",
          requiredLevel: dsaReqBenchmark,
          currentLevel: dsaLevel,
          importance: "Required",
          evidence: dsaLevel !== null
            ? [`Evaluated algorithmic problem-solving score: ${dsaLevel}/10.`, `Covers core problem solving and time/space complexity analysis.`]
            : ["No DSA practice session or coding challenge recorded yet."],
          improvementSteps: [
            `Solve 50+ LeetCode Medium/Hard problems focused on ${targetCompany} interview patterns.`,
            "Practice writing clean code within 25-minute mock coding time limits.",
          ],
          actionLink: "/app/interview",
          actionLabel: "Practice DSA",
        },
        {
          id: "dsa-arrays-pointers",
          name: "Arrays, Hashing & Two Pointers",
          requiredLevel: tierReq(8.5),
          currentLevel: dsaLevel !== null ? Math.min(10, dsaLevel + 0.5) : null,
          importance: "Required",
          evidence: dsaLevel !== null
            ? ["Linear traversal, hash maps, prefix sums, and sliding window patterns."]
            : ["Unassessed array manipulation and frequency mapping."],
          improvementSteps: [
            "Master Two-Sum variations, 3Sum, Trapping Rain Water, and Subarray Sum Equals K.",
            "Solidify O(N) time and O(1) space optimizations.",
          ],
          actionLink: "/app/interview",
          actionLabel: "Solve Array Problems",
        },
        {
          id: "dsa-binary-search",
          name: "Binary Search & Sorting",
          requiredLevel: tierReq(8.0),
          currentLevel: dsaLevel !== null ? dsaLevel : null,
          importance: "Required",
          evidence: dsaLevel !== null
            ? ["Logarithmic search space reductions and monotonic predicates."]
            : ["Unassessed binary search on answer spaces."],
          improvementSteps: [
            "Practice binary search on rotated sorted arrays and search in 2D matrices.",
            "Master binary search on monotonic predicate functions (e.g. Koko Eating Bananas, Capacity to Ship Packages).",
          ],
          actionLink: "/app/interview",
          actionLabel: "Practice Binary Search",
        },
        {
          id: "dsa-trees-bst",
          name: "Trees & Binary Search Trees",
          requiredLevel: tierReq(8.5),
          currentLevel: dsaLevel !== null ? Math.max(0, dsaLevel - 0.3) : null,
          importance: "Required",
          evidence: dsaLevel !== null
            ? ["Tree traversals (inorder, preorder, postorder, level-order) and recursion."]
            : ["Unassessed binary tree reconstruction and BST properties."],
          improvementSteps: [
            "Implement Lowest Common Ancestor (LCA), Binary Tree Maximum Path Sum, and Serialize/Deserialize Binary Tree.",
            "Practice BFS level-order traversal and zig-zag variations.",
          ],
          actionLink: "/app/interview",
          actionLabel: "Practice Tree Problems",
        },
        {
          id: "dsa-graphs",
          name: "Graphs (BFS, DFS & Shortest Path)",
          requiredLevel: tierReq(8.5),
          currentLevel: dsaLevel !== null ? Math.max(0, dsaLevel - 0.6) : null,
          importance: "Required",
          evidence: dsaLevel !== null
            ? ["Adjacency lists, cycle detection, and connected components."]
            : ["Graph traversals and shortest-path algorithms not yet verified."],
          improvementSteps: [
            "Master Topological Sort (Kahn's algorithm) for Course Schedule problems.",
            "Implement Dijkstra's and Union-Find (Disjoint Set Union) for network latency and connected components.",
          ],
          actionLink: "/app/interview",
          actionLabel: "Practice Graph Problems",
        },
        {
          id: "dsa-dynamic-programming",
          name: "Dynamic Programming & Recursion",
          requiredLevel: tierReq(8.5),
          currentLevel: dsaLevel !== null ? Math.max(0, dsaLevel - 0.8) : null,
          importance: "Required",
          evidence: dsaLevel !== null
            ? ["Optimal substructure and overlapping subproblems."]
            : ["DP state transition modeling not yet benchmarked."],
          improvementSteps: [
            "Master 1D & 2D DP: 0/1 Knapsack, Longest Common Subsequence (LCS), Longest Increasing Subsequence (LIS), and Edit Distance.",
            "Practice state compression to optimize space complexity from O(N) to O(1).",
          ],
          actionLink: "/app/interview",
          actionLabel: "Practice DP",
        },
      ],
    },

    // -------------------------------------------------------------
    // 2. Technologies (Role-Aligned Tech Stack)
    // -------------------------------------------------------------
    {
      id: "technologies",
      name: "Technologies",
      fullName: "Technical Stack & Domain Skills",
      icon: "Layers",
      description: `Domain frameworks, programming languages, and tooling for ${targetJobRole}.`,
      items: (() => {
        const stackList = getRoleTechStack(targetJobRole, tier);
        return stackList.map((skill, idx) => {
          // If company requirement provides custom skill level, use it
          let reqLvl = skill.requiredLevel;
          let imp = skill.importance;
          if (companyRequirement?.technicalSkills?.length > 0) {
            const matched = companyRequirement.technicalSkills.find(
              (s) => s.name.toLowerCase() === skill.name.toLowerCase() ||
                     skill.name.toLowerCase().includes(s.name.toLowerCase())
            );
            if (matched) {
              reqLvl = matched.requiredLevel * 2; // 1-5 to 0-10
              imp = matched.importance || imp;
            }
          }

          // Candidate skill baseline: if degree foundation exists and user selected role
          let curLvl = null;
          let evidenceText = [`Assessment for ${skill.name} not yet recorded.`];
          let steps = [
            `Build hands-on production feature implementing ${skill.name}.`,
            `Review official documentation and core design paradigms for ${skill.name}.`,
          ];

          if (degreeFoundationLevel !== null && user?.targetJobRole) {
            // First 2 core stack items have baseline from profile, remaining pending
            if (idx === 0) {
              curLvl = degreeFoundationLevel;
              evidenceText = [
                `Foundational knowledge demonstrated via ${user.degree || "degree"} curriculum and web coursework.`,
              ];
            } else if (idx === 1 && degreeFoundationLevel >= 7.5) {
              curLvl = degreeFoundationLevel - 0.4;
              evidenceText = [
                `Framework application demonstrated in academic and personal projects.`,
              ];
            }
          }

          return {
            id: `tech-${normalizeIdentifier(skill.name)}`,
            name: skill.name,
            requiredLevel: Math.round(reqLvl * 10) / 10,
            currentLevel: curLvl,
            importance: imp,
            evidence: evidenceText,
            improvementSteps: steps,
            actionLink: "/app/profile",
            actionLabel: "Update Skills",
          };
        });
      })(),
    },

    // -------------------------------------------------------------
    // 3. Projects (Real-World Complexity & Engineering)
    // -------------------------------------------------------------
    {
      id: "projects",
      name: "Projects",
      fullName: "Engineering Projects & Portfolio",
      icon: "FolderGit2",
      description: "Full-stack project complexity, live deployment, architecture, and code quality.",
      items: [
        {
          id: "proj-complexity",
          name: "Project Complexity & Architecture",
          requiredLevel: tierReq(8.0),
          currentLevel: projectsLevel,
          importance: "Required",
          evidence: projectsLevel !== null
            ? [`Project portfolio evaluated at ${projectsLevel}/10 engineering complexity.`]
            : ["Project repository and architectural documentation not yet evaluated."],
          improvementSteps: [
            "Build full-stack applications with stateful auth, database schema migrations, and role-based access control.",
            "Document architecture diagrams, component trees, and data flow in project READMEs.",
          ],
          actionLink: "/app/resume",
          actionLabel: "Showcase Projects",
        },
        {
          id: "proj-live-deployment",
          name: "Live Deployment & Production Hosting",
          requiredLevel: tierReq(7.5),
          currentLevel: projectsLevel !== null ? Math.min(10, projectsLevel + 0.2) : null,
          importance: "Required",
          evidence: projectsLevel !== null
            ? ["Verified active live production URLs and responsive interfaces."]
            : ["Live production deployment URLs pending verification."],
          improvementSteps: [
            "Deploy frontend to Vercel/Cloudflare Pages with custom domain and HTTPS.",
            "Host backend API on Dockerized cloud instances with environment variable management.",
          ],
          actionLink: "/app/resume",
          actionLabel: "Add Live URL",
        },
        {
          id: "proj-code-hygiene",
          name: "Code Quality & Repository Hygiene",
          requiredLevel: tierReq(7.5),
          currentLevel: projectsLevel !== null ? projectsLevel : null,
          importance: "Preferred",
          evidence: projectsLevel !== null
            ? ["Clean commit history, modular folder structure, and linting rules."]
            : ["GitHub repository hygiene and modular separation pending review."],
          improvementSteps: [
            "Enforce ESLint/Prettier rules, clean commit messages, and feature branch PRs.",
            "Write modular services, clean error handlers, and unit tests using Vitest or Jest.",
          ],
          actionLink: "/app/resume",
          actionLabel: "Review Code Quality",
        },
      ],
    },

    // -------------------------------------------------------------
    // 4. Resume (ATS Benchmark & Optimization)
    // -------------------------------------------------------------
    {
      id: "resume",
      name: "Resume",
      fullName: "ATS Resume Strength & Benchmark",
      icon: "FileText",
      description: "ATS parse rate, target role keyword alignment, and quantifiable impact bullets.",
      items: [
        {
          id: "res-ats-score",
          name: "ATS Benchmark & Parse Score",
          requiredLevel: tierReq(8.5),
          currentLevel: resumeLevel,
          importance: "Required",
          evidence: resumeLevel !== null
            ? [`ATS parser score: ${resumeLevel * 10}% (${resumeLevel}/10).`, "Standard single-column layout with clean header hierarchy."]
            : ["No resume uploaded to the AI ATS Analyzer yet."],
          improvementSteps: [
            "Upload single-column, standard font PDF resume formatted for modern ATS scanners.",
            "Remove multi-column tables, graphics, or text boxes that break parsing.",
          ],
          actionLink: "/app/resume",
          actionLabel: "Upload Resume",
        },
        {
          id: "res-keyword-alignment",
          name: "Target Role Keyword Alignment",
          requiredLevel: tierReq(8.0),
          currentLevel: resumeLevel !== null ? Math.min(10, resumeLevel + 0.2) : null,
          importance: "Required",
          evidence: resumeLevel !== null
            ? [`Keywords matched against ${targetJobRole} specifications.`]
            : ["Keyword density for target role not yet analyzed."],
          improvementSteps: [
            `Integrate core industry keywords: ${targetJobRole}, REST APIs, SQL, System Architecture, CI/CD.`,
            "Align technical skills section with corporate job posting requirements.",
          ],
          actionLink: "/app/resume",
          actionLabel: "Analyze Keywords",
        },
        {
          id: "res-quantified-bullets",
          name: "Quantified Impact & Action Verbs",
          requiredLevel: tierReq(8.0),
          currentLevel: resumeLevel !== null ? Math.max(0, resumeLevel - 0.4) : null,
          importance: "Required",
          evidence: resumeLevel !== null
            ? ["Experience and project bullet structure analyzed for quantifiable metrics."]
            : ["Bullet point metrics and impact numbers pending evaluation."],
          improvementSteps: [
            "Use XYZ format: 'Accomplished [X], as measured by [Y], by doing [Z]'.",
            "Include concrete metrics (e.g. 'Reduced latency by 35%', 'Scaled to 10k users', 'Improved query performance by 40%').",
          ],
          actionLink: "/app/resume",
          actionLabel: "Optimize Bullets",
        },
      ],
    },

    // -------------------------------------------------------------
    // 5. Academics (Eligibility & Degree Rigor)
    // -------------------------------------------------------------
    {
      id: "academics",
      name: "Academics",
      fullName: "Academic Performance & Eligibility",
      icon: "GraduationCap",
      description: "Undergraduate CGPA, secondary board percentage, and company cutoff benchmarks.",
      items: [
        {
          id: "acad-cgpa",
          name: "Undergraduate CGPA",
          requiredLevel: academicsReqCutoff,
          currentLevel: cgpaLevel,
          importance: "Required",
          evidence: cgpaLevel !== null
            ? [`Candidate CGPA: ${cgpaLevel}/10 (Cutoff required for ${targetCompany}: ${academicsReqCutoff}/10).`]
            : ["CGPA not specified in candidate profile."],
          improvementSteps: [
            `Maintain academic performance above ${academicsReqCutoff} CGPA to clear initial eligibility filters.`,
            "Ensure no active backlogs prior to corporate placement drives.",
          ],
          actionLink: "/app/profile",
          actionLabel: "Update CGPA",
        },
        {
          id: "acad-secondary",
          name: "Secondary & Higher Secondary (10th/12th)",
          requiredLevel: tierReq(7.5),
          currentLevel: secondaryLevel,
          importance: "Required",
          evidence: secondaryLevel !== null
            ? [
                has10th ? `10th Grade: ${user.tenthPercentage}%` : "",
                has12th ? `12th Grade: ${user.twelfthPercentage}%` : "",
              ].filter(Boolean)
            : ["10th and 12th percentages not entered in profile."],
          improvementSteps: [
            "Verify official marksheets match profile records for background verification (BGV).",
            "Maintain aggregate percentage documentation for campus registration.",
          ],
          actionLink: "/app/profile",
          actionLabel: "Update Academics",
        },
        {
          id: "acad-curriculum",
          name: "Core CS Curriculum & Degree Foundation",
          requiredLevel: tierReq(7.5),
          currentLevel: degreeFoundationLevel,
          importance: "Preferred",
          evidence: degreeFoundationLevel !== null
            ? [`Degree enrolled: ${user.degree || "B.Tech"} at ${user.college || "University"}.`]
            : ["Degree information incomplete in candidate profile."],
          improvementSteps: [
            "Complete core coursework in Data Structures, DBMS, Operating Systems, and Computer Networks.",
            "Supplement academic theory with practical open-source project implementations.",
          ],
          actionLink: "/app/profile",
          actionLabel: "Complete Degree Details",
        },
      ],
    },

    // -------------------------------------------------------------
    // 6. Communication (Verbal & Articulation)
    // -------------------------------------------------------------
    {
      id: "communication",
      name: "Communication",
      fullName: "Verbal Clarity & Articulation",
      icon: "MessageSquare",
      description: "Clarity of expression, structured problem formulation, and fluency.",
      items: [
        {
          id: "comm-clarity",
          name: "Spoken Clarity & Technical Articulation",
          requiredLevel: tierReq(7.5),
          currentLevel: communicationLevel,
          importance: "Required",
          evidence: communicationLevel !== null
            ? [`Spoken clarity evaluated during AI mock interview session: ${communicationLevel}/10.`]
            : ["Spoken articulation not yet evaluated via AI mock interview."],
          improvementSteps: [
            "Practice speaking aloud while writing code ('think-out-loud' protocol).",
            "Explain technical trade-offs clearly without hesitation or filler words.",
          ],
          actionLink: "/app/interview",
          actionLabel: "Practice Speaking",
        },
        {
          id: "comm-star",
          name: "STAR Method Problem Delivery",
          requiredLevel: tierReq(7.5),
          currentLevel: communicationLevel !== null ? Math.max(0, communicationLevel - 0.2) : null,
          importance: "Required",
          evidence: communicationLevel !== null
            ? ["Structured formulation of Situation, Task, Action, Result."]
            : ["STAR method behavioral delivery not yet assessed."],
          improvementSteps: [
            "Frame every behavioral answer using: Situation (15%), Task (15%), Action (50%), and Result (20%).",
            "Prepare 5 concrete project stories highlighting challenges and resolutions.",
          ],
          actionLink: "/app/interview",
          actionLabel: "Practice STAR Method",
        },
      ],
    },

    // -------------------------------------------------------------
    // 7. HR Readiness (Behavioral & Culture Fit)
    // -------------------------------------------------------------
    {
      id: "hr-readiness",
      name: "HR Readiness",
      fullName: "HR & Behavioral Readiness",
      icon: "BrainCog",
      description: "Company values alignment, conflict resolution, situational judgment, and culture fit.",
      items: [
        {
          id: "hr-culture-fit",
          name: `${targetCompany} Values & Culture Fit`,
          requiredLevel: tierReq(8.0),
          currentLevel: interviewLevel !== null ? interviewLevel : null,
          importance: "Required",
          evidence: interviewLevel !== null
            ? [`Behavioral alignment benchmarked from mock HR evaluation: ${interviewLevel}/10.`]
            : [`Company research and culture alignment for ${targetCompany} not yet assessed.`],
          improvementSteps: [
            `Research ${targetCompany}'s core values (e.g. Amazon Leadership Principles, Microsoft Growth Mindset).`,
            "Align your personal narrative and career motivations with target company missions.",
          ],
          actionLink: "/app/interview",
          actionLabel: "Start HR Mock",
        },
        {
          id: "hr-conflict-resolution",
          name: "Team Conflict & Crisis Handling",
          requiredLevel: tierReq(7.5),
          currentLevel: interviewLevel !== null ? Math.min(10, interviewLevel + 0.3) : null,
          importance: "Required",
          evidence: interviewLevel !== null
            ? ["Interpersonal responses to team disagreements and tight deadlines evaluated."]
            : ["Situational crisis questions pending evaluation."],
          improvementSteps: [
            "Formulate answers demonstrating empathy, active listening, and objective data-driven resolution.",
            "Emphasize positive team outcomes and constructive post-mortem learnings.",
          ],
          actionLink: "/app/interview",
          actionLabel: "Practice Behavioral",
        },
      ],
    },

    // -------------------------------------------------------------
    // 8. Technical Interview (Core CS Fundamentals)
    // -------------------------------------------------------------
    {
      id: "technical-interview",
      name: "Technical Interview",
      fullName: "Core CS Fundamentals & System Design",
      icon: "Cpu",
      description: "DBMS, Operating Systems, Computer Networks, OOP, and System Architecture.",
      items: [
        {
          id: "tech-dbms",
          name: "Database Management Systems (DBMS & SQL)",
          requiredLevel: tierReq(8.0),
          currentLevel: degreeFoundationLevel !== null ? Math.min(10, degreeFoundationLevel + 0.2) : null,
          importance: "Required",
          evidence: degreeFoundationLevel !== null
            ? ["Coursework coverage in Relational Algebra, Normalization, ACID transactions, and Indexing."]
            : ["Database engineering principles not yet assessed."],
          improvementSteps: [
            "Master ACID properties, transaction isolation levels, B+ Tree indexing, and SQL Query optimization.",
            "Understand CAP theorem and SQL vs NoSQL architectural trade-offs.",
          ],
          actionLink: "/app/interview",
          actionLabel: "Practice DBMS",
        },
        {
          id: "tech-os",
          name: "Operating Systems & Concurrency",
          requiredLevel: tierReq(8.0),
          currentLevel: degreeFoundationLevel !== null ? degreeFoundationLevel : null,
          importance: "Required",
          evidence: degreeFoundationLevel !== null
            ? ["Process lifecycle, virtual memory, paging, and CPU scheduling algorithms."]
            : ["Operating Systems interview readiness not yet assessed."],
          improvementSteps: [
            "Master Threads vs Processes, Mutex vs Semaphore, Deadlock conditions, and Virtual Memory paging.",
            "Understand IPC mechanisms and race condition prevention.",
          ],
          actionLink: "/app/interview",
          actionLabel: "Practice OS Questions",
        },
        {
          id: "tech-networks",
          name: "Computer Networks & Protocols",
          requiredLevel: tierReq(7.5),
          currentLevel: degreeFoundationLevel !== null ? Math.max(0, degreeFoundationLevel - 0.4) : null,
          importance: "Required",
          evidence: degreeFoundationLevel !== null
            ? ["OSI 7-layer model, TCP/IP handshakes, and HTTP/HTTPS fundamentals."]
            : ["Networking protocols and socket programming pending evaluation."],
          improvementSteps: [
            "Master TCP 3-way handshake, TCP vs UDP, DNS resolution lifecycle, and HTTPS TLS handshakes.",
            "Understand REST architecture, WebSockets, and CORS policies.",
          ],
          actionLink: "/app/interview",
          actionLabel: "Practice Networks",
        },
        {
          id: "tech-system-design",
          name: "System Design & Architecture",
          requiredLevel: tierReq(8.0),
          currentLevel: interviewLevel,
          importance: isTier1 ? "Required" : "Preferred",
          evidence: interviewLevel !== null
            ? [`System design architecture score evaluated at ${interviewLevel}/10.`]
            : ["System scalability and high-level design not yet benchmarked."],
          improvementSteps: [
            "Design scalable URL Shorteners, Rate Limiters, and Notification Systems.",
            "Master Load Balancing, Consistent Hashing, Redis Caching, and Database Sharding.",
          ],
          actionLink: "/app/interview",
          actionLabel: "Practice System Design",
        },
      ],
    },

    // -------------------------------------------------------------
    // 9. Other Relevant Skills
    // -------------------------------------------------------------
    {
      id: "other-skills",
      name: "Other Relevant Skills",
      fullName: "Problem Solving & Professional Competencies",
      icon: "Sparkles",
      description: "Analytical problem solving, adaptability, continuous learning, and code reviews.",
      items: [
        {
          id: "other-problem-solving",
          name: "Analytical Thinking & Problem Solving",
          requiredLevel: tierReq(8.0),
          currentLevel: dsaLevel !== null ? dsaLevel : (degreeFoundationLevel || null),
          importance: "Required",
          evidence: (dsaLevel || degreeFoundationLevel) !== null
            ? ["Evaluated through structured technical reasoning and approach formulation."]
            : ["Analytical problem-solving baseline pending assessment."],
          improvementSteps: [
            "Break ambiguous business problems into discrete technical components.",
            "Identify edge cases (empty inputs, integer overflow, extreme bounds) systematically.",
          ],
          actionLink: "/app/interview",
          actionLabel: "Practice Problem Solving",
        },
        {
          id: "other-fast-learning",
          name: "Fast Learning & Adaptability",
          requiredLevel: tierReq(7.5),
          currentLevel: degreeFoundationLevel !== null ? 8.0 : null,
          importance: "Preferred",
          evidence: degreeFoundationLevel !== null
            ? ["Demonstrated progression through academic degree and software modules."]
            : ["Adaptability and fast-learning track record not yet documented."],
          improvementSteps: [
            "Build a proof-of-concept project with a brand new framework within a 48-hour sprint.",
            "Contribute to an open source GitHub repository with unfamiliar architecture.",
          ],
          actionLink: "/app/profile",
          actionLabel: "Update Learning Profile",
        },
      ],
    },
  ];

  // Process all categories and items: calculate gap and attach status
  const allItems = [];
  let totalItemsCount = 0;
  let analyzedItemsCount = 0;
  let meetsOrAboveCount = 0;
  let needsImprovementCount = 0;
  let notAnalyzedCount = 0;
  let sumCurrentLevel = 0;
  let sumRequiredLevel = 0;
  let sumGap = 0;

  const categories = categoryDefinitions.map((category) => {
    let catCurrentSum = 0;
    let catRequiredSum = 0;
    let catAnalyzedCount = 0;

    const processedItems = category.items.map((item) => {
      const dataAvailability =
        item.currentLevel !== null && item.currentLevel !== undefined
          ? "available"
          : "not_started";

      const gap = calculateGap(item.currentLevel, item.requiredLevel);
      const status = getStatusFromGap(gap, dataAvailability);

      totalItemsCount++;
      sumRequiredLevel += item.requiredLevel;

      if (dataAvailability === "available" && item.currentLevel !== null) {
        analyzedItemsCount++;
        sumCurrentLevel += item.currentLevel;
        sumGap += gap;
        catCurrentSum += item.currentLevel;
        catAnalyzedCount++;

        if (gap >= 0) {
          meetsOrAboveCount++;
        } else {
          needsImprovementCount++;
        }
      } else {
        notAnalyzedCount++;
      }

      catRequiredSum += item.requiredLevel;

      const processedItem = {
        id: item.id,
        name: item.name,
        category: category.name,
        categoryId: category.id,
        currentLevel: item.currentLevel !== null ? Math.round(item.currentLevel * 10) / 10 : null,
        requiredLevel: Math.round(item.requiredLevel * 10) / 10,
        gap,
        status: status.label,
        statusKey: status.key,
        statusColor: status.color,
        badgeClass: status.badgeClass,
        statusDescription: status.description,
        importance: item.importance || "Required",
        dataAvailability,
        evidence: item.evidence || [],
        improvementSteps: item.improvementSteps || [],
        actionLink: item.actionLink || "/app/profile",
        actionLabel: item.actionLabel || "Take Action",
      };

      allItems.push(processedItem);
      return processedItem;
    });

    // Category-level aggregate scores
    const catAvgCurrent =
      catAnalyzedCount > 0
        ? Math.round((catCurrentSum / catAnalyzedCount) * 10) / 10
        : null;
    const catAvgRequired =
      category.items.length > 0
        ? Math.round((catRequiredSum / category.items.length) * 10) / 10
        : 8.0;
    const catGap = calculateGap(catAvgCurrent, catAvgRequired);
    const catStatus = getStatusFromGap(
      catGap,
      catAnalyzedCount > 0 ? "available" : "not_started"
    );

    return {
      id: category.id,
      name: category.name,
      fullName: category.fullName,
      icon: category.icon,
      description: category.description,
      currentLevel: catAvgCurrent,
      requiredLevel: catAvgRequired,
      gap: catGap,
      status: catStatus.label,
      statusKey: catStatus.key,
      statusColor: catStatus.color,
      badgeClass: catStatus.badgeClass,
      itemsCount: category.items.length,
      analyzedCount: catAnalyzedCount,
      items: processedItems,
    };
  });

  const avgCurrent =
    analyzedItemsCount > 0
      ? Math.round((sumCurrentLevel / analyzedItemsCount) * 10) / 10
      : null;
  const avgRequired =
    totalItemsCount > 0
      ? Math.round((sumRequiredLevel / totalItemsCount) * 10) / 10
      : 8.0;
  const avgGap =
    analyzedItemsCount > 0
      ? Math.round((sumGap / analyzedItemsCount) * 10) / 10
      : null;

  const overallReadinessScore =
    avgCurrent !== null ? Math.round(avgCurrent * 10) : null;

  return {
    targetCompany,
    targetJobRole,
    targetCompanyNormalized,
    targetRoleNormalized,
    targetTier: tier,
    summary: {
      totalItems: totalItemsCount,
      analyzedItems: analyzedItemsCount,
      meetsOrAboveCount,
      needsImprovementCount,
      notAnalyzedCount,
      averageCurrentLevel: avgCurrent,
      averageRequiredLevel: avgRequired,
      averageGap: avgGap,
      overallReadinessScore,
      coveragePercent:
        totalItemsCount > 0
          ? Math.round((analyzedItemsCount / totalItemsCount) * 100)
          : 0,
    },
    categories,
    allItems,
  };
};
