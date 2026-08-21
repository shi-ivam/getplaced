import express from "express"
import dotenv from "dotenv"
import userRoutes from "./routes/userRoutes.js"
import readinessRoutes from "./routes/readinessRoutes.js"
import levelGapRoutes from "./routes/levelGapRoutes.js"
import leetcodeRoutes from "./routes/leetcodeRoutes.js"
import githubRoutes from "./routes/githubRoutes.js"
import dsaRoutes from "./routes/dsaRoutes.js"
import academicRoutes from "./routes/academicRoutes.js"
import recommendationRoutes from "./routes/recommendationRoutes.js"
import progressRoutes from "./routes/progressRoutes.js"
import milestoneRoutes from "./routes/milestoneRoutes.js"
import roadmapRoutes from "./routes/roadmapRoutes.js"
import studyLibraryRoutes from "./routes/studyLibraryRoutes.js"
import arenaRoutes from "./routes/arenaRoutes.js"
import coachRoutes from "./routes/coachRoutes.js"
import vtopRoutes from "./routes/vtopRoutes.js"
import jobRoutes from "./routes/jobRoutes.js"
import { seedJobsIfNeeded } from "./services/jobService.js"

import cookieParser from "cookie-parser"
import cors from "cors"
dotenv.config()
const PORT = process.env.PORT || 3000
import axios from "axios"
import connectDB from "./config/db.js"

connectDB().then(() => {
  seedJobsIfNeeded()
})

const app = express()

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "https://dev-clash-flax.vercel.app",
  "https://dev-clash-hackathon.vercel.app",
]

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
        callback(null, true)
      } else {
        callback(null, true)
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
)

app.use(express.json())

app.use(cookieParser())

// Mount Core & Feature Routes
app.use("/api/users", userRoutes)
app.use("/api/readiness", readinessRoutes)
app.use("/api/gap-analysis", levelGapRoutes)
app.use("/api/leetcode", leetcodeRoutes)
app.use("/api/github", githubRoutes)
app.use("/api/dsa", dsaRoutes)

// Group C Feature Routes (#28 - #44)
app.use("/api/academics", academicRoutes)
app.use("/api/recommendations", recommendationRoutes)
app.use("/api/progress", progressRoutes)
app.use("/api/milestones", milestoneRoutes)
app.use("/api/roadmap", roadmapRoutes)
app.use("/api/study-library", studyLibraryRoutes)
app.use("/api/arena", arenaRoutes)
app.use("/api/coach", coachRoutes)
app.use("/api/vtop", vtopRoutes)
app.use("/api/jobs", jobRoutes)

const CURATED_TECH_JOBS = [
  {
    job_id: "gp-job-001",
    job_title: "Software Development Engineer - 1 (Backend)",
    employer_name: "Microsoft",
    employer_logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
    job_city: "Bengaluru",
    job_country: "India",
    job_employment_type: "FULLTIME",
    job_is_remote: false,
    job_apply_link: "https://careers.microsoft.com",
    job_description: "Build high-throughput distributed microservices on Azure, C#/.NET Core and distributed caching layers.",
    job_posted_at_datetime_utc: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    job_min_salary: 1800000,
    job_max_salary: 2800000,
    job_salary_currency: "INR",
    job_required_skills: ["C#", "Azure", "Distributed Systems", "Data Structures", "SQL"]
  },
  {
    job_id: "gp-job-002",
    job_title: "Software Engineer - Full Stack / React & Go",
    employer_name: "Google",
    employer_logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
    job_city: "Hyderabad",
    job_country: "India",
    job_employment_type: "FULLTIME",
    job_is_remote: false,
    job_apply_link: "https://careers.google.com",
    job_description: "Architect scalable frontend and backend pipelines supporting enterprise Cloud telemetry and AI infrastructure.",
    job_posted_at_datetime_utc: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    job_min_salary: 2200000,
    job_max_salary: 3500000,
    job_salary_currency: "INR",
    job_required_skills: ["Go", "TypeScript", "React", "gRPC", "Kubernetes"]
  },
  {
    job_id: "gp-job-003",
    job_title: "SDE Intern - Summer 2026",
    employer_name: "Amazon",
    employer_logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    job_city: "Bengaluru",
    job_country: "India",
    job_employment_type: "INTERN",
    job_is_remote: false,
    job_apply_link: "https://amazon.jobs",
    job_description: "Design and implement scalable AWS service components, distributed queues, and serverless workflows.",
    job_posted_at_datetime_utc: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    job_min_salary: 80000,
    job_max_salary: 110000,
    job_salary_currency: "INR/mo",
    job_required_skills: ["Java", "AWS", "Algorithms", "Object Oriented Design"]
  },
  {
    job_id: "gp-job-004",
    job_title: "Distributed Systems Engineer",
    employer_name: "Uber",
    employer_logo: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png",
    job_city: "Hyderabad",
    job_country: "India",
    job_employment_type: "FULLTIME",
    job_is_remote: true,
    job_apply_link: "https://www.uber.com/careers",
    job_description: "Develop low-latency dispatch and geospatial routing systems handling millions of concurrent requests.",
    job_posted_at_datetime_utc: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    job_min_salary: 2400000,
    job_max_salary: 3800000,
    job_salary_currency: "INR",
    job_required_skills: ["Go", "Kafka", "Geospatial Indexing", "Distributed Caching"]
  },
  {
    job_id: "gp-job-005",
    job_title: "Frontend Platform Engineer",
    employer_name: "Atlassian",
    employer_logo: "https://upload.wikimedia.org/wikipedia/commons/0/05/Atlassian-Logo.svg",
    job_city: "Bengaluru",
    job_country: "India",
    job_employment_type: "FULLTIME",
    job_is_remote: true,
    job_apply_link: "https://www.atlassian.com/company/careers",
    job_description: "Engineer modern collaborative editing engines, web performance instrumentation, and micro-frontend architectures.",
    job_posted_at_datetime_utc: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    job_min_salary: 2000000,
    job_max_salary: 3200000,
    job_salary_currency: "INR",
    job_required_skills: ["React", "TypeScript", "GraphQL", "Web Workers", "UI Performance"]
  },
  {
    job_id: "gp-job-006",
    job_title: "Backend Infrastructure Engineer",
    employer_name: "Stripe",
    employer_logo: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg",
    job_city: "Remote",
    job_country: "India",
    job_employment_type: "FULLTIME",
    job_is_remote: true,
    job_apply_link: "https://stripe.com/jobs",
    job_description: "Scale payment gateways, idempotent ledger architectures, and zero-downtime global database clusters.",
    job_posted_at_datetime_utc: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    job_min_salary: 2800000,
    job_max_salary: 4200000,
    job_salary_currency: "INR",
    job_required_skills: ["Ruby", "Java", "PostgreSQL", "Idempotency", "High Availability"]
  },
  {
    job_id: "gp-job-007",
    job_title: "Product Engineer - Core Banking",
    employer_name: "Razorpay",
    employer_logo: "https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg",
    job_city: "Bengaluru",
    job_country: "India",
    job_employment_type: "FULLTIME",
    job_is_remote: false,
    job_apply_link: "https://razorpay.com/jobs",
    job_description: "Build resilient financial routing, automated reconciliation engines, and developer-facing APIs.",
    job_posted_at_datetime_utc: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    job_min_salary: 1600000,
    job_max_salary: 2600000,
    job_salary_currency: "INR",
    job_required_skills: ["Node.js", "PHP", "MySQL", "Kafka", "Redis"]
  },
  {
    job_id: "gp-job-008",
    job_title: "Software Engineer - AI Platform",
    employer_name: "Meta",
    employer_logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg",
    job_city: "Bengaluru",
    job_country: "India",
    job_employment_type: "FULLTIME",
    job_is_remote: false,
    job_apply_link: "https://metacareers.com",
    job_description: "Scale inference infrastructure, PyTorch kernel optimizations, and real-time recommendation backends.",
    job_posted_at_datetime_utc: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    job_min_salary: 2600000,
    job_max_salary: 4500000,
    job_salary_currency: "INR",
    job_required_skills: ["C++", "Python", "PyTorch", "Distributed Systems"]
  }
];

const handleJobRecommendations = async (req, res) => {
  const query = req.query.query || "software engineer";
  const location = req.query.location || "India";
  const page = req.query.page || "1";
  const employmentType = req.query.employment_type;

  if (process.env.RAPIDAPI_KEY) {
    try {
      const url = "https://jsearch.p.rapidapi.com/search";
      const response = await axios.get(url, {
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
          "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
        },
        params: {
          query: `${query} in ${location}`,
          page,
          num_pages: "2",
          ...(employmentType ? { employment_types: employmentType } : {})
        },
        timeout: 4000
      });

      if (response.data?.data && response.data.data.length > 0) {
        return res.json({ jobs: response.data.data, source: "live_rapidapi" });
      }
    } catch (error) {
      console.warn("RapidAPI lookup failed or rate limited, serving curated placement opportunities:", error.message);
    }
  }

  // Curated Fallback Filter
  const qLower = query.toLowerCase();
  const filtered = CURATED_TECH_JOBS.filter((job) => {
    const matchesQuery =
      !query ||
      query === "software engineer" ||
      job.job_title.toLowerCase().includes(qLower) ||
      job.employer_name.toLowerCase().includes(qLower) ||
      job.job_required_skills?.some((s) => s.toLowerCase().includes(qLower));

    const matchesType =
      !employmentType ||
      job.job_employment_type.toLowerCase() === employmentType.toLowerCase();

    return matchesQuery && matchesType;
  });

  return res.json({ jobs: filtered.length > 0 ? filtered : CURATED_TECH_JOBS, source: "curated_vault" });
};

app.get("/job-recommendations", handleJobRecommendations);
app.get("/api/jobs/recommendations", handleJobRecommendations);

app.listen(PORT, () => {
  console.log("Server listening on port: " + PORT)
})
