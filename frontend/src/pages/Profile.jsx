import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  User,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { NODE_API_URL } from "@/config/api";

const DEGREE_OPTIONS = [
  "B.Tech",
  "B.E.",
  "BCA",
  "MCA",
  "B.Sc.",
  "M.Tech",
  "M.E.",
  "MBA",
  "Other",
];

const JOB_ROLE_OPTIONS = [
  "Software Development Engineer",
  "Software Engineer",
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "Data Scientist",
  "Data Analyst",
  "DevOps Engineer",
  "Cloud Engineer",
  "AI/ML Engineer",
  "Mobile App Developer",
  "Cybersecurity Analyst",
  "Other",
];

const COMPANY_SUGGESTIONS = [
  "Microsoft",
  "Google",
  "Amazon",
  "Apple",
  "Meta",
  "TCS",
  "Infosys",
  "Accenture",
  "Wipro",
  "Oracle",
];

const LOCATION_SUGGESTIONS = [
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Mumbai",
  "Delhi NCR",
  "Remote",
  "Any Location",
];

const CURRENT_YEAR = new Date().getFullYear();
const GRADUATION_YEARS = Array.from({ length: 15 }, (_, i) => CURRENT_YEAR - 5 + i);

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState({});

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    college: "",
    degree: "",
    customDegree: "",
    graduationYear: "",
    cgpa: "",
    tenthPercentage: "",
    twelfthPercentage: "",
    targetJobRole: "",
    customJobRole: "",
    targetCompany: "",
    locationPreference: "",
  });

  // Fetch initial profile
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setErrorMessage("");
      try {
        const response = await axios.get(`${NODE_API_URL}/api/users/profile`, {
          withCredentials: true,
        });

        const data = response.data || {};
        
        // Handle custom degree
        const degreeIsStandard = DEGREE_OPTIONS.filter((d) => d !== "Other").includes(data.degree);
        const degreeValue = data.degree
          ? degreeIsStandard
            ? data.degree
            : "Other"
          : "";
        const customDegreeVal = data.degree && !degreeIsStandard ? data.degree : "";

        // Handle custom job role
        const roleIsStandard = JOB_ROLE_OPTIONS.filter((r) => r !== "Other").includes(data.targetJobRole);
        const roleValue = data.targetJobRole
          ? roleIsStandard
            ? data.targetJobRole
            : "Other"
          : "";
        const customRoleVal = data.targetJobRole && !roleIsStandard ? data.targetJobRole : "";

        setFormData({
          name: data.name || "",
          email: data.email || "",
          college: data.college || "",
          degree: degreeValue,
          customDegree: customDegreeVal,
          graduationYear: data.graduationYear ? String(data.graduationYear) : "",
          cgpa: data.cgpa !== null && data.cgpa !== undefined ? String(data.cgpa) : "",
          tenthPercentage:
            data.tenthPercentage !== null && data.tenthPercentage !== undefined
              ? String(data.tenthPercentage)
              : "",
          twelfthPercentage:
            data.twelfthPercentage !== null && data.twelfthPercentage !== undefined
              ? String(data.twelfthPercentage)
              : "",
          targetJobRole: roleValue,
          customJobRole: customRoleVal,
          targetCompany: data.targetCompany || "",
          locationPreference: data.locationPreference || "",
        });
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setErrorMessage(
          err.response?.data?.message || "Failed to load profile. Please make sure you are logged in."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear inline error on change
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Profile completion calculation based on required foundational attributes
  const completion = useMemo(() => {
    const effectiveDegree = formData.degree === "Other" ? formData.customDegree : formData.degree;
    const effectiveJobRole = formData.targetJobRole === "Other" ? formData.customJobRole : formData.targetJobRole;

    const requiredChecks = [
      Boolean(formData.name?.trim()),
      Boolean(formData.college?.trim()),
      Boolean(effectiveDegree?.trim()),
      Boolean(formData.graduationYear),
      Boolean(formData.cgpa !== "" && !isNaN(Number(formData.cgpa))),
      Boolean(effectiveJobRole?.trim()),
      Boolean(formData.targetCompany?.trim()),
    ];

    const completed = requiredChecks.filter(Boolean).length;
    return Math.round((completed / requiredChecks.length) * 100);
  }, [formData]);

  // Validation function
  const validate = () => {
    const newErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.college?.trim()) {
      newErrors.college = "College name is required";
    }

    const effectiveDegree = formData.degree === "Other" ? formData.customDegree : formData.degree;
    if (!effectiveDegree?.trim()) {
      newErrors.degree = "Degree is required";
    }

    if (!formData.graduationYear) {
      newErrors.graduationYear = "Graduation year is required";
    }

    if (formData.cgpa === "" || formData.cgpa === null || formData.cgpa === undefined) {
      newErrors.cgpa = "CGPA is required";
    } else {
      const cgpaNum = Number(formData.cgpa);
      if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10) {
        newErrors.cgpa = "CGPA must be between 0 and 10";
      }
    }

    if (formData.tenthPercentage !== "" && formData.tenthPercentage !== null) {
      const tenthNum = Number(formData.tenthPercentage);
      if (isNaN(tenthNum) || tenthNum < 0 || tenthNum > 100) {
        newErrors.tenthPercentage = "10th percentage must be between 0 and 100";
      }
    }

    if (formData.twelfthPercentage !== "" && formData.twelfthPercentage !== null) {
      const twelfthNum = Number(formData.twelfthPercentage);
      if (isNaN(twelfthNum) || twelfthNum < 0 || twelfthNum > 100) {
        newErrors.twelfthPercentage = "12th percentage must be between 0 and 100";
      }
    }

    const effectiveJobRole = formData.targetJobRole === "Other" ? formData.customJobRole : formData.targetJobRole;
    if (!effectiveJobRole?.trim()) {
      newErrors.targetJobRole = "Target job role is required";
    }

    if (!formData.targetCompany?.trim()) {
      newErrors.targetCompany = "Target company is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSaving(true);
    try {
      const effectiveDegree = formData.degree === "Other" ? formData.customDegree.trim() : formData.degree.trim();
      const effectiveJobRole = formData.targetJobRole === "Other" ? formData.customJobRole.trim() : formData.targetJobRole.trim();

      const payload = {
        name: formData.name.trim(),
        college: formData.college.trim(),
        degree: effectiveDegree,
        graduationYear: Number(formData.graduationYear),
        cgpa: Number(formData.cgpa),
        tenthPercentage: formData.tenthPercentage !== "" ? Number(formData.tenthPercentage) : null,
        twelfthPercentage: formData.twelfthPercentage !== "" ? Number(formData.twelfthPercentage) : null,
        targetJobRole: effectiveJobRole,
        targetCompany: formData.targetCompany.trim(),
        locationPreference: formData.locationPreference.trim(),
      };

      const response = await axios.put(`${NODE_API_URL}/api/users/profile`, payload, {
        withCredentials: true,
      });

      if (response.data) {
        setSuccessMessage("Your profile has been successfully saved!");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      setErrorMessage(
        err.response?.data?.message || "Failed to update profile. Please try again."
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] text-gray-200 p-6 md:p-10 space-y-6 max-w-5xl mx-auto">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 bg-gray-800" />
          <Skeleton className="h-4 w-96 bg-gray-800/60" />
        </div>
        <Skeleton className="h-28 w-full bg-gray-800/40 rounded-xl" />
        <div className="grid gap-6">
          <Skeleton className="h-44 w-full bg-gray-800/30 rounded-xl" />
          <Skeleton className="h-64 w-full bg-gray-800/30 rounded-xl" />
          <Skeleton className="h-56 w-full bg-gray-800/30 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-gray-200 p-4 md:p-8 lg:p-10 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800/80 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <User className="w-8 h-8 text-purple-500" />
            My Profile
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Build your baseline placement profile for personalized skill-gap & readiness analysis.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="flex items-center gap-3 bg-emerald-950/60 border border-emerald-600/50 text-emerald-300 px-4 py-3 rounded-xl shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-3 bg-rose-950/60 border border-rose-600/50 text-rose-300 px-4 py-3 rounded-xl shadow-lg">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span className="text-sm font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Profile Completion Indicator Card */}
      <Card className="bg-[#141414] border-gray-800/80 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="font-semibold text-white text-base">Profile Completion</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-purple-950 text-purple-300 border border-purple-800">
                  {completion}%
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {completion === 100
                  ? "🎉 Your profile is complete and ready for placement-readiness analysis!"
                  : "Complete your profile to get more accurate placement-readiness analysis and customized recommendations."}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full md:w-64 space-y-1.5">
              <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-600 to-indigo-500 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${completion}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-gray-500">
                <span>Baseline</span>
                <span>{completion}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 1. Personal Information */}
        <Card className="bg-[#141414] border-gray-800/80">
          <CardHeader className="pb-4 border-b border-gray-800/60">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-purple-400" />
              <CardTitle className="text-lg text-white">Personal Information</CardTitle>
            </div>
            <CardDescription className="text-gray-400 text-xs">
              Basic details associated with your getPlaced account
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300 text-sm font-medium">
                Full Name <span className="text-red-400">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Abhishek Kumar Singh"
                className={`bg-[#1c1c1c] border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500 ${
                  errors.name ? "border-red-500 focus:border-red-500" : ""
                }`}
              />
              {errors.name && <p className="text-red-400 text-xs">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300 text-sm font-medium flex items-center justify-between">
                <span>Email Address</span>
                <span className="text-[11px] text-gray-500 font-normal">(Account email)</span>
              </Label>
              <Input
                id="email"
                name="email"
                value={formData.email}
                disabled
                className="bg-[#181818] border-gray-800 text-gray-400 cursor-not-allowed"
              />
            </div>
          </CardContent>
        </Card>

        {/* 2. Academic Information */}
        <Card className="bg-[#141414] border-gray-800/80">
          <CardHeader className="pb-4 border-b border-gray-800/60">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-purple-400" />
              <CardTitle className="text-lg text-white">Academic Information</CardTitle>
            </div>
            <CardDescription className="text-gray-400 text-xs">
              Your college, degree, and academic score benchmarks
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* College */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="college" className="text-gray-300 text-sm font-medium">
                  College / University <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="college"
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  placeholder="e.g. VIT Chennai, IIT Bombay, Anna University"
                  className={`bg-[#1c1c1c] border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500 ${
                    errors.college ? "border-red-500 focus:border-red-500" : ""
                  }`}
                />
                {errors.college && <p className="text-red-400 text-xs">{errors.college}</p>}
              </div>

              {/* Degree */}
              <div className="space-y-2">
                <Label htmlFor="degree" className="text-gray-300 text-sm font-medium">
                  Degree <span className="text-red-400">*</span>
                </Label>
                <select
                  id="degree"
                  name="degree"
                  value={formData.degree}
                  onChange={handleChange}
                  className={`w-full h-10 px-3 rounded-md bg-[#1c1c1c] border border-gray-700 text-white text-sm focus:outline-none focus:border-purple-500 ${
                    errors.degree ? "border-red-500" : ""
                  }`}
                >
                  <option value="" disabled>Select your degree</option>
                  {DEGREE_OPTIONS.map((deg) => (
                    <option key={deg} value={deg} className="bg-[#1c1c1c] text-white">
                      {deg}
                    </option>
                  ))}
                </select>
                {formData.degree === "Other" && (
                  <Input
                    name="customDegree"
                    value={formData.customDegree}
                    onChange={handleChange}
                    placeholder="Enter degree name (e.g. B.Tech AI & DS)"
                    className="mt-2 bg-[#1c1c1c] border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500"
                  />
                )}
                {errors.degree && <p className="text-red-400 text-xs">{errors.degree}</p>}
              </div>

              {/* Graduation Year */}
              <div className="space-y-2">
                <Label htmlFor="graduationYear" className="text-gray-300 text-sm font-medium">
                  Graduation Year <span className="text-red-400">*</span>
                </Label>
                <select
                  id="graduationYear"
                  name="graduationYear"
                  value={formData.graduationYear}
                  onChange={handleChange}
                  className={`w-full h-10 px-3 rounded-md bg-[#1c1c1c] border border-gray-700 text-white text-sm focus:outline-none focus:border-purple-500 ${
                    errors.graduationYear ? "border-red-500" : ""
                  }`}
                >
                  <option value="" disabled>Select graduation year</option>
                  {GRADUATION_YEARS.map((yr) => (
                    <option key={yr} value={yr} className="bg-[#1c1c1c] text-white">
                      {yr}
                    </option>
                  ))}
                </select>
                {errors.graduationYear && (
                  <p className="text-red-400 text-xs">{errors.graduationYear}</p>
                )}
              </div>

              {/* CGPA */}
              <div className="space-y-2">
                <Label htmlFor="cgpa" className="text-gray-300 text-sm font-medium">
                  CGPA (out of 10) <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="cgpa"
                  name="cgpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={formData.cgpa}
                  onChange={handleChange}
                  placeholder="e.g. 8.45"
                  className={`bg-[#1c1c1c] border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500 ${
                    errors.cgpa ? "border-red-500 focus:border-red-500" : ""
                  }`}
                />
                {errors.cgpa && <p className="text-red-400 text-xs">{errors.cgpa}</p>}
              </div>

              {/* 10th Percentage (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="tenthPercentage" className="text-gray-300 text-sm font-medium flex items-center justify-between">
                  <span>10th Percentage (%)</span>
                  <span className="text-[11px] text-gray-500 font-normal">Optional</span>
                </Label>
                <Input
                  id="tenthPercentage"
                  name="tenthPercentage"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.tenthPercentage}
                  onChange={handleChange}
                  placeholder="e.g. 92.4"
                  className={`bg-[#1c1c1c] border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500 ${
                    errors.tenthPercentage ? "border-red-500 focus:border-red-500" : ""
                  }`}
                />
                {errors.tenthPercentage && (
                  <p className="text-red-400 text-xs">{errors.tenthPercentage}</p>
                )}
              </div>

              {/* 12th Percentage (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="twelfthPercentage" className="text-gray-300 text-sm font-medium flex items-center justify-between">
                  <span>12th / Diploma Percentage (%)</span>
                  <span className="text-[11px] text-gray-500 font-normal">Optional</span>
                </Label>
                <Input
                  id="twelfthPercentage"
                  name="twelfthPercentage"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.twelfthPercentage}
                  onChange={handleChange}
                  placeholder="e.g. 88.5"
                  className={`bg-[#1c1c1c] border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500 ${
                    errors.twelfthPercentage ? "border-red-500 focus:border-red-500" : ""
                  }`}
                />
                {errors.twelfthPercentage && (
                  <p className="text-red-400 text-xs">{errors.twelfthPercentage}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Career Target */}
        <Card className="bg-[#141414] border-gray-800/80">
          <CardHeader className="pb-4 border-b border-gray-800/60">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-purple-400" />
              <CardTitle className="text-lg text-white">Career Target</CardTitle>
            </div>
            <CardDescription className="text-gray-400 text-xs">
              Roles and companies you are targeting for placement preparation
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Target Job Role */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="targetJobRole" className="text-gray-300 text-sm font-medium">
                  Target Job Role <span className="text-red-400">*</span>
                </Label>
                <select
                  id="targetJobRole"
                  name="targetJobRole"
                  value={formData.targetJobRole}
                  onChange={handleChange}
                  className={`w-full h-10 px-3 rounded-md bg-[#1c1c1c] border border-gray-700 text-white text-sm focus:outline-none focus:border-purple-500 ${
                    errors.targetJobRole ? "border-red-500" : ""
                  }`}
                >
                  <option value="" disabled>Select target role</option>
                  {JOB_ROLE_OPTIONS.map((role) => (
                    <option key={role} value={role} className="bg-[#1c1c1c] text-white">
                      {role}
                    </option>
                  ))}
                </select>
                {formData.targetJobRole === "Other" && (
                  <Input
                    name="customJobRole"
                    value={formData.customJobRole}
                    onChange={handleChange}
                    placeholder="Enter custom role title (e.g. Embedded Systems Engineer)"
                    className="mt-2 bg-[#1c1c1c] border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500"
                  />
                )}
                {errors.targetJobRole && (
                  <p className="text-red-400 text-xs">{errors.targetJobRole}</p>
                )}
              </div>

              {/* Target Company */}
              <div className="space-y-2">
                <Label htmlFor="targetCompany" className="text-gray-300 text-sm font-medium">
                  Target Company <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="targetCompany"
                  name="targetCompany"
                  value={formData.targetCompany}
                  onChange={handleChange}
                  placeholder="e.g. Microsoft, Google, TCS"
                  className={`bg-[#1c1c1c] border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500 ${
                    errors.targetCompany ? "border-red-500 focus:border-red-500" : ""
                  }`}
                />
                {/* Company Quick-Picks */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {COMPANY_SUGGESTIONS.slice(0, 5).map((comp) => (
                    <button
                      key={comp}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, targetCompany: comp }));
                        if (errors.targetCompany) {
                          setErrors((prev) => {
                            const next = { ...prev };
                            delete next.targetCompany;
                            return next;
                          });
                        }
                      }}
                      className="text-[11px] px-2 py-0.5 rounded bg-gray-800/80 hover:bg-purple-900/50 hover:text-purple-300 text-gray-400 border border-gray-700/60 transition-colors"
                    >
                      {comp}
                    </button>
                  ))}
                </div>
                {errors.targetCompany && (
                  <p className="text-red-400 text-xs">{errors.targetCompany}</p>
                )}
              </div>

              {/* Location Preference */}
              <div className="space-y-2">
                <Label htmlFor="locationPreference" className="text-gray-300 text-sm font-medium flex items-center justify-between">
                  <span>Location Preference</span>
                  <span className="text-[11px] text-gray-500 font-normal">Optional</span>
                </Label>
                <Input
                  id="locationPreference"
                  name="locationPreference"
                  value={formData.locationPreference}
                  onChange={handleChange}
                  placeholder="e.g. Bangalore, Chennai, Remote"
                  className="bg-[#1c1c1c] border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500"
                />
                {/* Location Quick-Picks */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {LOCATION_SUGGESTIONS.slice(0, 5).map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, locationPreference: loc }))}
                      className="text-[11px] px-2 py-0.5 rounded bg-gray-800/80 hover:bg-purple-900/50 hover:text-purple-300 text-gray-400 border border-gray-700/60 transition-colors"
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-800/80">
          <Button
            type="submit"
            disabled={saving}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-8 py-2.5 rounded-lg shadow-lg shadow-purple-950/50 flex items-center gap-2 transition-all cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving Profile...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Save Profile
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
