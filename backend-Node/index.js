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
import arenaRoutes from "./routes/arenaRoutes.js"
import coachRoutes from "./routes/coachRoutes.js"
import vtopRoutes from "./routes/vtopRoutes.js"
import jobRoutes from "./routes/jobRoutes.js"
import Job from "./models/jobModel.js"
import { seedJobsIfNeeded } from "./services/jobService.js"

import cookieParser from "cookie-parser"
import cors from "cors"
import { protect } from "./middlewares/authMiddleware.js"
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
app.use("/api/arena", arenaRoutes)
app.use("/api/coach", coachRoutes)
app.use("/api/vtop", vtopRoutes)
app.use("/api/jobs", jobRoutes)

app.get("/api/resume/latest", protect, (req, res) => {
  res.json({
    success: true,
    name: req.user.name,
    email: req.user.email,
    targetRole: req.user.targetJobRole || "Software Engineer Candidate",
    resumeScore: req.user.resumeScore ?? null,
    resumeText: req.user.resumeText || "",
    resumeAnalysis: req.user.resumeAnalysis || null,
    updatedAt: req.user.updatedAt,
  })
})


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
      console.warn("RapidAPI lookup failed or rate limited, falling back to MongoDB Job queries:", error.message);
    }
  }

  try {
    const filterQuery = { isExpired: false };
    if (query && query !== "software engineer") {
      const qLower = query.toLowerCase();
      const regex = new RegExp(qLower, "i");
      filterQuery.$or = [
        { title: regex },
        { company: regex },
        { skills: regex },
        { description: regex }
      ];
    }
    if (employmentType) {
      filterQuery.employmentType = new RegExp(employmentType, "i");
    }

    const dbJobs = await Job.find(filterQuery).lean();
    return res.json({ jobs: dbJobs, source: "mongodb" });
  } catch (error) {
    console.error("MongoDB Job recommendation lookup error:", error.message);
    return res.status(500).json({ error: "Failed to fetch job recommendations", jobs: [], source: "error" });
  }
};

app.get("/job-recommendations", handleJobRecommendations);

// Error Handler Middleware (ensures JSON errors for registration and auth)
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

app.listen(PORT, () => {
  console.log("Server listening on port: " + PORT)
})
