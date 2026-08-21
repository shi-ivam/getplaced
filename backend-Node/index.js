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

import cookieParser from "cookie-parser"
import cors from "cors"
dotenv.config()
const PORT = process.env.PORT || 3000
import axios from "axios"
import connectDB from "./config/db.js"

connectDB()

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

app.get("/job-recommendations", async (req, res) => {
  const url = "https://jsearch.p.rapidapi.com/search";
  const queryParams = {
    query: "developer in India",
    page: "1",
    num_pages: "2",
  };

  const headers = {
    "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
    "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
  };

  try {
    const response = await axios.get(url, {
      headers,
      params: queryParams,
    });

    const jobs = response.data.data || [];
    res.json({ jobs });
  } catch (error) {
    console.error("Error fetching jobs:", error.message);
    res.status(500).json({ error: "Failed to fetch job recommendations" });
  }
});

app.listen(PORT, () => {
  console.log("Server listening on port: " + PORT)
})
