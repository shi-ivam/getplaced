import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/userModel.js";
import { normalizeIdentifier } from "../models/companyRequirementModel.js";

dotenv.config();

const seedTestUser = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("MONGO_URI is missing in .env");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    const testEmail = "test@example.com";
    const testPassword = "password123";

    // Check if user already exists
    let user = await User.findOne({ email: testEmail });

    if (user) {
      console.log(`Found existing test user: ${testEmail}. Updating dummy data...`);
      user.name = "Demo Candidate";
      user.password = testPassword; // will be rehashed by pre-save hook
      user.college = "VIT Chennai";
      user.degree = "B.Tech";
      user.graduationYear = 2026;
      user.cgpa = 8.8;
      user.tenthPercentage = 92.5;
      user.twelfthPercentage = 89.0;
      user.targetCompany = "Microsoft";
      user.targetCompanyNormalized = normalizeIdentifier("Microsoft");
      user.targetJobRole = "Software Development Engineer";
      user.targetRoleNormalized = normalizeIdentifier("Software Development Engineer");
      user.locationPreference = "Bangalore";
      await user.save();
    } else {
      console.log(`Creating new test user: ${testEmail}...`);
      user = await User.create({
        name: "Demo Candidate",
        email: testEmail,
        password: testPassword,
        college: "VIT Chennai",
        degree: "B.Tech",
        graduationYear: 2026,
        cgpa: 8.8,
        tenthPercentage: 92.5,
        twelfthPercentage: 89.0,
        targetCompany: "Microsoft",
        targetCompanyNormalized: normalizeIdentifier("Microsoft"),
        targetJobRole: "Software Development Engineer",
        targetRoleNormalized: normalizeIdentifier("Software Development Engineer"),
        locationPreference: "Bangalore",
      });
    }

    console.log("\n==========================================");
    console.log("TEST USER SEEDED SUCCESSFULLY!");
    console.log("==========================================");
    console.log(`Email:      ${testEmail}`);
    console.log(`Password:   ${testPassword}`);
    console.log(`Name:       ${user.name}`);
    console.log(`Target:     ${user.targetCompany} · ${user.targetJobRole}`);
    console.log(`College:    ${user.college} (${user.degree}, ${user.graduationYear})`);
    console.log(`CGPA:       ${user.cgpa}`);
    console.log("==========================================\n");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding test user:", error);
    process.exit(1);
  }
};

seedTestUser();
