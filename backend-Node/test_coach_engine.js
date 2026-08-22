import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import User from "./models/userModel.js";
import { runGeminiCoachTurn } from "./services/geminiCoachEngine.js";

dotenv.config();

async function testCoachEngine() {
  console.log("--- STARTING AI CAREER COACH ENGINE TEST ---");
  await connectDB();

  let testUser = await User.findOne({ email: "testuser@getplaced.com" });
  if (!testUser) {
    testUser = await User.create({
      name: "Shivam Sharma",
      email: "testuser@getplaced.com",
      password: "password123",
      targetCompany: "Google",
      targetJobRole: "Software Development Engineer",
      cgpa: 8.85,
      graduationYear: 2026,
      college: "VIT Chennai",
      degree: "B.Tech",
      branch: "Computer Science",
      resumeScore: 84,
    });
    console.log("Created test candidate user:", testUser.email);
  }

  console.log(`Testing query: "What is my placement readiness for Google and what 2 DSA problems should I solve today?"`);
  const turn1 = await runGeminiCoachTurn({
    userMessage: "What is my placement readiness for Google and what 2 DSA problems should I solve today?",
    userId: testUser._id,
    user: testUser,
  });

  console.log("\n=== MODEL USED ===");
  console.log(turn1.modelUsed);

  console.log("\n=== TOOLS EXECUTED ===");
  console.log(JSON.stringify(turn1.toolCallsExecuted, null, 2));

  console.log("\n=== ACTION CARDS EXTRACTED ===");
  console.log(JSON.stringify(turn1.actionCards, null, 2));

  console.log("\n=== SUGGESTED CHIPS ===");
  console.log(turn1.suggestedChips);

  console.log("\n=== COACH FINAL MARKDOWN REPLY ===");
  console.log(turn1.replyText);

  console.log("\n--- TEST COMPLETE ---");
  process.exit(0);
}

testCoachEngine().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
