import mongoose from "mongoose";
import Job from "../models/jobModel.js";
import User from "../models/userModel.js";
import { SEED_JOBS } from "../data/jobSeedData.js";
import { normalizeIdentifier } from "../models/companyRequirementModel.js";

/**
 * Ensures seed jobs are loaded into MongoDB on startup or when collection is empty.
 */
export const seedJobsIfNeeded = async () => {
  if (mongoose.connection?.readyState !== 1) {
    return { success: false, message: "Database not connected" };
  }

  try {
    const existingCount = await Job.countDocuments();
    if (existingCount === 0) {
      console.log("No jobs found in database. Initializing 24 seed listings...");
      await Job.insertMany(SEED_JOBS);
      console.log("Successfully seeded 24 demo tech job opportunities.");
      return { success: true, count: SEED_JOBS.length, seeded: true };
    }
    return { success: true, count: existingCount, seeded: false };
  } catch (error) {
    console.error("Error checking/seeding jobs:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Calculates a personalized match score & gap analysis between a candidate profile and a job listing.
 *
 * @param {Object} job - Job document or plain object
 * @param {Object|null} user - Candidate user profile or null
 * @param {number} userReadiness - Placement readiness score (0-100)
 * @returns {Object} Match analytics and personalization package
 */
export const calculateJobMatch = (job, user = null, userReadiness = null) => {
  const targetCompany = user?.targetCompany?.trim() || "";
  const targetJobRole = user?.targetJobRole?.trim() || "";
  const locationPref = user?.locationPreference?.trim() || "";

  // Derive known candidate skills from target role / profile baseline
  const defaultSkills = ["Java", "Python", "SQL", "Git", "Data Structures", "Algorithms", "React", "REST APIs"];
  const candidateSkills = (user?.skills && user.skills.length > 0)
    ? user.skills.map((s) => (typeof s === "string" ? s.toLowerCase() : s.name?.toLowerCase()))
    : defaultSkills.map((s) => s.toLowerCase());

  const jobSkills = (job.skills || []).map((s) => s.trim());
  const matchedSkills = [];
  const missingSkills = [];

  jobSkills.forEach((skill) => {
    const sLower = skill.toLowerCase();
    const isMatched = candidateSkills.some(
      (cs) => cs === sLower || cs.includes(sLower) || sLower.includes(cs)
    );
    if (isMatched) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  // 1. Skills Match Score (35%)
  const totalSkillsCount = Math.max(jobSkills.length, 1);
  const skillsScore = Math.min(
    100,
    Math.max(45, Math.round((matchedSkills.length / totalSkillsCount) * 100))
  );

  // 2. Role Relevance Score (25%)
  let roleScore = 70;
  if (targetJobRole) {
    const targetLower = targetJobRole.toLowerCase();
    const titleLower = (job.title || "").toLowerCase();
    const categoryLower = (job.roleCategory || "").toLowerCase();

    if (titleLower.includes(targetLower) || targetLower.includes(titleLower)) {
      roleScore = 95;
    } else if (
      categoryLower.includes(targetLower) ||
      targetLower.includes(categoryLower) ||
      (targetLower.includes("engineer") && titleLower.includes("engineer"))
    ) {
      roleScore = 88;
    } else if (
      (targetLower.includes("backend") && (titleLower.includes("backend") || categoryLower === "backend")) ||
      (targetLower.includes("frontend") && (titleLower.includes("frontend") || categoryLower === "frontend")) ||
      (targetLower.includes("full stack") && (titleLower.includes("full stack") || categoryLower === "full stack")) ||
      (targetLower.includes("intern") && (titleLower.includes("intern") || job.employmentType === "Internship"))
    ) {
      roleScore = 92;
    } else {
      roleScore = 65;
    }
  }

  // 3. Experience Match Score (15%)
  let experienceScore = 85;
  const userGradYear = user?.graduationYear || 2026;
  const isStudentOrRecent = userGradYear >= 2024;
  if (isStudentOrRecent) {
    if (job.experienceLevel === "Internship" || job.experienceLevel === "Entry Level" || job.minExperienceYears === 0) {
      experienceScore = 98;
    } else if (job.minExperienceYears <= 2) {
      experienceScore = 82;
    } else {
      experienceScore = 60;
    }
  }

  // 4. Target Company Match Score (15%)
  let companyScore = 75;
  if (targetCompany) {
    const targetCompNorm = normalizeIdentifier(targetCompany);
    const jobCompNorm = job.companyNormalized || normalizeIdentifier(job.company || "");
    if (targetCompNorm === jobCompNorm || jobCompNorm.includes(targetCompNorm)) {
      companyScore = 100;
    }
  }

  // 5. Location Match Score (10%)
  let locationScore = 80;
  if (job.workMode === "Remote") {
    locationScore = 100;
  } else if (locationPref) {
    const locPrefLower = locationPref.toLowerCase();
    const cityLower = (job.city || job.location || "").toLowerCase();
    if (cityLower.includes(locPrefLower) || locPrefLower.includes(cityLower)) {
      locationScore = 100;
    }
  } else {
    locationScore = 85;
  }

  // Overall Weighted Match Score
  const rawMatchScore = Math.round(
    skillsScore * 0.35 +
    roleScore * 0.25 +
    experienceScore * 0.15 +
    companyScore * 0.15 +
    locationScore * 0.10
  );
  const matchScore = Math.min(98, Math.max(42, rawMatchScore));

  // Determine fit category
  let fitStatus = "Explore";
  let fitBadgeClass = "bg-zinc-800 text-zinc-300 border-zinc-700";
  if (matchScore >= 80) {
    fitStatus = "Best Fit";
    fitBadgeClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  } else if (matchScore >= 65) {
    fitStatus = "Stretch Opportunity";
    fitBadgeClass = "bg-amber-500/10 text-amber-400 border-amber-500/20";
  }

  // Generate personalized "Why This Job?" evidence
  const whyThisJob = [];
  if (targetJobRole && roleScore >= 85) {
    whyThisJob.push(`Directly matches your target career objective: "${targetJobRole}"`);
  }
  if (companyScore === 100) {
    whyThisJob.push(`Matches your active target employer: ${job.company}`);
  }
  if (matchedSkills.length > 0) {
    whyThisJob.push(`Strong overlap in core skills: ${matchedSkills.slice(0, 3).join(", ")}`);
  }
  if (experienceScore >= 90) {
    whyThisJob.push(`Calibrated for your graduation & entry-level readiness timeline`);
  }
  if (job.workMode === "Remote" || locationScore === 100) {
    whyThisJob.push(`Aligns with your location preference (${job.workMode} / ${job.city || "Remote"})`);
  }
  if (whyThisJob.length === 0) {
    whyThisJob.push("High-growth engineering role matching your technical foundation");
    whyThisJob.push(`Requires proficiency in ${jobSkills.slice(0, 2).join(" & ")}`);
  }

  // Structured Job Preparation Plan
  const preparationPlan = [
    {
      phase: "Week 1",
      focus: "Core DSA & Problem Solving",
      tasks: [
        "Solve 10 Medium-level problems on Trees, Graphs, and Dynamic Programming",
        "Review Object-Oriented Design patterns & Time-Space complexity fundamentals"
      ]
    },
    {
      phase: "Week 2",
      focus: "System Architecture & APIs",
      tasks: [
        "Review RESTful API design, database indexing, and caching with Redis",
        "Study microservices patterns and concurrency principles"
      ]
    },
    {
      phase: "Week 3",
      focus: missingSkills.length > 0 ? `Target Gap Resolution (${missingSkills.slice(0, 2).join(", ")})` : "Domain Deep Dive",
      tasks: missingSkills.length > 0
        ? missingSkills.slice(0, 3).map((s) => `Complete accelerated module on ${s} and build a practical sample`)
        : ["Deep dive into high-throughput backend scaling and production observability"]
    },
    {
      phase: "Week 4",
      focus: "Mock Interviews & Resume Alignment",
      tasks: [
        "Conduct 2 AI Mock Interviews tailored for this exact job description",
        "Tailor resume keywords to align with company requirements & ATS standards"
      ]
    }
  ];

  return {
    matchScore,
    fitStatus,
    fitBadgeClass,
    breakdown: {
      skills: skillsScore,
      roleRelevance: roleScore,
      experience: experienceScore,
      company: companyScore,
      location: locationScore,
    },
    matchedSkills,
    missingSkills,
    whyThisJob,
    readinessComparison: {
      readinessScore: userReadiness,
      matchScore,
      summaryNote: userReadiness !== null && userReadiness !== undefined
        ? `You match this role's requirements at ${matchScore}%. Your current placement readiness is ${userReadiness}%.`
        : `You match this role's requirements at ${matchScore}%. Placement readiness unassessed.`,
    },
    preparationPlan,
  };
};

/**
 * Queries and enriches jobs with client filters, search, and user match calculation.
 */
export const queryJobs = async (queryParams, user = null, userReadiness = null) => {
  // Ensure seed data exists
  await seedJobsIfNeeded();

  const {
    search = "",
    role = "ALL",
    location = "ALL",
    workMode = "ALL",
    experience = "ALL",
    employmentType = "ALL",
    minSalary = 0,
    sort = "recommended",
    category = "all",
    page = 1,
    limit = 50,
  } = queryParams;

  const filterQuery = { isExpired: false };

  // Role Category filter
  if (role && role !== "ALL") {
    if (role === "Internship") {
      filterQuery.$or = [{ employmentType: "Internship" }, { roleCategory: "Internship" }];
    } else {
      filterQuery.roleCategory = role;
    }
  }

  // Work Mode filter
  if (workMode && workMode !== "ALL") {
    filterQuery.workMode = workMode;
  }

  // Employment Type filter
  if (employmentType && employmentType !== "ALL") {
    filterQuery.employmentType = employmentType;
  }

  // Experience Level filter
  if (experience && experience !== "ALL") {
    filterQuery.experienceLevel = experience;
  }

  // Location filter
  if (location && location !== "ALL") {
    if (location === "Remote") {
      filterQuery.$or = [{ workMode: "Remote" }, { city: "Remote" }];
    } else {
      filterQuery.city = new RegExp(location, "i");
    }
  }

  // Min Salary filter
  const parsedMinSalary = Number(minSalary);
  if (!isNaN(parsedMinSalary) && parsedMinSalary > 0) {
    filterQuery.maxSalary = { $gte: parsedMinSalary };
  }

  // Text/Keyword Search across multiple fields
  if (search && search.trim()) {
    const q = search.trim();
    const regex = new RegExp(q, "i");
    filterQuery.$or = [
      { title: regex },
      { company: regex },
      { skills: regex },
      { city: regex },
      { description: regex },
      { tags: regex },
    ];
  }

  // Fetch candidate jobs from MongoDB (or memory fallback)
  let rawJobs = [];
  try {
    if (mongoose.connection?.readyState === 1) {
      rawJobs = await Job.find(filterQuery).lean();
    } else {
      rawJobs = [...SEED_JOBS];
    }
  } catch (err) {
    console.warn("Falling back to seed jobs array:", err.message);
    rawJobs = [...SEED_JOBS];
  }

  const savedJobIds = new Set((user?.savedJobs || []).map((id) => String(id)));

  // Enrich each job with match analytics & saved state
  let enrichedJobs = rawJobs.map((job) => {
    const matchAnalysis = calculateJobMatch(job, user, userReadiness);
    const isSaved = savedJobIds.has(String(job.jobId)) || savedJobIds.has(String(job._id));
    return {
      ...job,
      isSaved,
      matchScore: matchAnalysis.matchScore,
      fitStatus: matchAnalysis.fitStatus,
      fitBadgeClass: matchAnalysis.fitBadgeClass,
      matchBreakdown: matchAnalysis.breakdown,
      matchedSkills: matchAnalysis.matchedSkills,
      missingSkills: matchAnalysis.missingSkills,
      whyThisJob: matchAnalysis.whyThisJob,
      readinessComparison: matchAnalysis.readinessComparison,
      preparationPlan: matchAnalysis.preparationPlan,
    };
  });

  // Apply Category Tab filters
  if (category === "recommended") {
    enrichedJobs = enrichedJobs.filter((j) => j.matchScore >= 70);
  } else if (category === "best_fit") {
    enrichedJobs = enrichedJobs.filter((j) => j.matchScore >= 80);
  } else if (category === "stretch") {
    enrichedJobs = enrichedJobs.filter((j) => j.matchScore >= 60 && j.matchScore < 80);
  } else if (category === "internships") {
    enrichedJobs = enrichedJobs.filter(
      (j) => j.employmentType === "Internship" || j.experienceLevel === "Internship"
    );
  } else if (category === "remote") {
    enrichedJobs = enrichedJobs.filter(
      (j) => j.workMode === "Remote" || (j.city || "").toLowerCase() === "remote"
    );
  } else if (category === "saved") {
    enrichedJobs = enrichedJobs.filter((j) => j.isSaved);
  }

  // Apply Sorting
  if (sort === "match" || sort === "recommended") {
    enrichedJobs.sort((a, b) => b.matchScore - a.matchScore || new Date(b.postedDate) - new Date(a.postedDate));
  } else if (sort === "newest") {
    enrichedJobs.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
  } else if (sort === "salary") {
    enrichedJobs.sort((a, b) => (b.maxSalary || 0) - (a.maxSalary || 0));
  } else if (sort === "company") {
    enrichedJobs.sort((a, b) => (a.company || "").localeCompare(b.company || ""));
  } else if (sort === "experience") {
    enrichedJobs.sort((a, b) => (a.minExperienceYears || 0) - (b.minExperienceYears || 0));
  }

  // Target Company Jobs Section (e.g. if user is targeting Microsoft, Google, etc.)
  const targetCompany = user?.targetCompany?.trim() || "";
  let targetCompanyJobs = [];
  if (targetCompany) {
    const targetCompNorm = normalizeIdentifier(targetCompany);
    targetCompanyJobs = enrichedJobs.filter((j) => {
      const jobNorm = j.companyNormalized || normalizeIdentifier(j.company || "");
      return jobNorm === targetCompNorm || jobNorm.includes(targetCompNorm);
    });
  }

  // Top Recommended Jobs (Top 3-6)
  const recommendedJobs = [...enrichedJobs]
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 6);

  // Pagination
  const total = enrichedJobs.length;
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 50;
  const startIndex = (pageNum - 1) * limitNum;
  const paginatedJobs = enrichedJobs.slice(startIndex, startIndex + limitNum);

  return {
    success: true,
    total,
    count: paginatedJobs.length,
    page: pageNum,
    jobs: paginatedJobs,
    recommendedJobs,
    targetCompanyJobs,
    meta: {
      targetCompany: user?.targetCompany || "",
      targetRole: user?.targetJobRole || "",
      savedCount: savedJobIds.size,
      userReadiness,
    },
  };
};

/**
 * Retrieves a single detailed job by MongoDB ID or custom jobId.
 */
export const getJobDetails = async (id, user = null, userReadiness = null) => {
  await seedJobsIfNeeded();

  let job = null;
  if (mongoose.connection?.readyState === 1) {
    if (mongoose.Types.ObjectId.isValid(id)) {
      job = await Job.findById(id).lean();
    }
    if (!job) {
      job = await Job.findOne({ jobId: id }).lean();
    }
  }

  if (!job) {
    job = SEED_JOBS.find((j) => j.jobId === id || String(j._id) === id);
  }

  if (!job) {
    return null;
  }

  const savedJobIds = new Set((user?.savedJobs || []).map((sId) => String(sId)));
  const isSaved = savedJobIds.has(String(job.jobId)) || savedJobIds.has(String(job._id));
  const matchAnalysis = calculateJobMatch(job, user, userReadiness);

  return {
    ...job,
    isSaved,
    matchScore: matchAnalysis.matchScore,
    fitStatus: matchAnalysis.fitStatus,
    fitBadgeClass: matchAnalysis.fitBadgeClass,
    matchBreakdown: matchAnalysis.breakdown,
    matchedSkills: matchAnalysis.matchedSkills,
    missingSkills: matchAnalysis.missingSkills,
    whyThisJob: matchAnalysis.whyThisJob,
    readinessComparison: matchAnalysis.readinessComparison,
    preparationPlan: matchAnalysis.preparationPlan,
  };
};

/**
 * Toggles a job in the user's saved jobs list.
 */
export const toggleUserSavedJob = async (userId, jobId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (!user.savedJobs) {
    user.savedJobs = [];
  }

  const targetId = String(jobId).trim();
  const index = user.savedJobs.indexOf(targetId);
  let isSaved = false;

  if (index > -1) {
    user.savedJobs.splice(index, 1);
    isSaved = false;
  } else {
    user.savedJobs.push(targetId);
    isSaved = true;
  }

  await user.save();

  return {
    success: true,
    isSaved,
    savedJobIds: user.savedJobs,
    savedCount: user.savedJobs.length,
  };
};
