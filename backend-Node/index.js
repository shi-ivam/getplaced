import express from "express"
import dotenv from "dotenv"
import userRoutes from "./routes/userRoutes.js"
import readinessRoutes from "./routes/readinessRoutes.js"
import levelGapRoutes from "./routes/levelGapRoutes.js"
import leetcodeRoutes from "./routes/leetcodeRoutes.js"
import githubRoutes from "./routes/githubRoutes.js"
import dsaRoutes from "./routes/dsaRoutes.js"
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
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
)

app.use(express.json())

app.use(cookieParser())

app.use("/api/users", userRoutes)
app.use("/api/readiness", readinessRoutes)
app.use("/api/gap-analysis", levelGapRoutes)
app.use("/api/leetcode", leetcodeRoutes)
app.use("/api/github", githubRoutes)
app.use("/api/dsa", dsaRoutes)

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
