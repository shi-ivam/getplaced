import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import gsap from "gsap";
import {
  User,
  GraduationCap,
  Briefcase,
  Building2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Target,
  ShieldCheck,
  MapPin,
  Save,
  ArrowRight,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import SearchableCombobox from "@/components/ui/SearchableCombobox";
import LeetCodeConnectCard from "@/components/leetcode/LeetCodeConnectCard";
import GitHubConnectCard from "@/components/github/GitHubConnectCard";
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
  "Machine Learning Engineer",
  "AI/ML Engineer",
  "DevOps Engineer",
  "Cloud Engineer",
  "Mobile App Developer",
  "Cybersecurity Analyst",
  "Product Manager",
  "QA / Automation Test Engineer",
  "Systems Engineer",
  "Site Reliability Engineer (SRE)",
  "Blockchain Developer",
];

const POPULAR_ROLES_QUICK = [
  "Software Development Engineer",
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "Data Scientist",
  "DevOps Engineer",
];

const COMPANY_SUGGESTIONS = [
  "Microsoft",
  "Google",
  "Amazon",
  "Apple",
  "Meta",
  "Netflix",
  "TCS",
  "Infosys",
  "Accenture",
  "Wipro",
  "Oracle",
  "Uber",
  "Adobe",
  "Salesforce",
  "Cisco",
  "IBM",
  "Goldman Sachs",
  "JPMorgan Chase",
  "Nvidia",
  "Qualcomm",
  "Intel",
  "Flipkart",
  "Swiggy",
  "Zomato",
  "Razorpay",
  "Paytm",
  "Atlassian",
  "Stripe",
  "LinkedIn",
  "Spotify",
  "Intuit",
  "Morgan Stanley",
  "PayPal",
  "Walmart",
  "Capgemini",
  "Cognizant",
  "HCLTech",
  "Deloitte",
];

const POPULAR_COMPANIES_QUICK = [
  "Microsoft",
  "Google",
  "Amazon",
  "Meta",
  "TCS",
  "Infosys",
  "Accenture",
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

const normalizeIdentifier = (str) => {
  if (!str || typeof str !== "string") return "";
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export default function Profile() {
  const containerRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [targetConfirmation, setTargetConfirmation] = useState("");
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
          targetJobRole: data.targetJobRole || "",
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

  // Subtle GSAP entrance animation
  useEffect(() => {
    if (loading || !containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".profile-card-anim",
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.08, ease: "power2.out" }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [loading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleCustomFieldChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Profile completion calculation
  const completion = useMemo(() => {
    const effectiveDegree = formData.degree === "Other" ? formData.customDegree : formData.degree;

    const requiredChecks = [
      Boolean(formData.name?.trim()),
      Boolean(formData.college?.trim()),
      Boolean(effectiveDegree?.trim()),
      Boolean(formData.graduationYear),
      Boolean(formData.cgpa !== "" && !isNaN(Number(formData.cgpa))),
      Boolean(formData.targetJobRole?.trim()),
      Boolean(formData.targetCompany?.trim()),
    ];

    const completed = requiredChecks.filter(Boolean).length;
    return Math.round((completed / requiredChecks.length) * 100);
  }, [formData]);

  // Initials for avatar
  const initials = useMemo(() => {
    if (!formData.name?.trim()) return "GP";
    const parts = formData.name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return formData.name.slice(0, 2).toUpperCase();
  }, [formData.name]);

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

    if (!formData.targetJobRole?.trim()) {
      newErrors.targetJobRole = "Target job role is required";
    }

    if (!formData.targetCompany?.trim()) {
      newErrors.targetCompany = "Target company is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSuccessMessage("");
    setTargetConfirmation("");
    setErrorMessage("");

    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSaving(true);
    try {
      const effectiveDegree =
        formData.degree === "Other" ? formData.customDegree.trim() : formData.degree.trim();
      const targetCompanyTrimmed = formData.targetCompany.trim();
      const targetJobRoleTrimmed = formData.targetJobRole.trim();

      const payload = {
        name: formData.name.trim(),
        college: formData.college.trim(),
        degree: effectiveDegree,
        graduationYear: Number(formData.graduationYear),
        cgpa: Number(formData.cgpa),
        tenthPercentage: formData.tenthPercentage !== "" ? Number(formData.tenthPercentage) : null,
        twelfthPercentage:
          formData.twelfthPercentage !== "" ? Number(formData.twelfthPercentage) : null,
        targetJobRole: targetJobRoleTrimmed,
        targetCompany: targetCompanyTrimmed,
        locationPreference: formData.locationPreference.trim(),
      };

      const response = await axios.put(`${NODE_API_URL}/api/users/profile`, payload, {
        withCredentials: true,
      });

      if (response.data) {
        setSuccessMessage("Candidate profile updated successfully.");
        if (targetCompanyTrimmed && targetJobRoleTrimmed) {
          setTargetConfirmation(
            `Target calibrated for ${targetCompanyTrimmed} • ${targetJobRoleTrimmed}`
          );
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      setErrorMessage(
        err.response?.data?.message || "Failed to update profile. Please check parameters and try again."
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05060d] text-zinc-300 p-6 md:p-10 space-y-6 max-w-6xl mx-auto font-sans">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 bg-zinc-900" />
            <Skeleton className="h-4 w-72 bg-zinc-900/60" />
          </div>
          <Skeleton className="h-10 w-32 bg-zinc-900 rounded-lg" />
        </div>
        <Skeleton className="h-36 w-full bg-zinc-900/50 rounded-xl border border-zinc-800" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-80 bg-zinc-900/40 rounded-xl border border-zinc-800" />
          <Skeleton className="h-80 bg-zinc-900/40 rounded-xl border border-zinc-800" />
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#05060d] text-zinc-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="profile-card-anim flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
              Candidate Profile
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-zinc-900 text-zinc-300 border border-zinc-800">
              {completion}% Complete
            </span>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-white hover:bg-zinc-200 text-zinc-950 font-medium px-4 py-2 rounded-lg text-xs shadow-none flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-950" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </Button>
        </div>

        {/* Alerts */}
        {successMessage && (
          <div className="profile-card-anim flex items-center gap-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-lg text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="flex-1 flex flex-wrap items-center justify-between gap-2">
              <span>{successMessage}</span>
              {targetConfirmation && (
                <span className="text-xs font-mono text-emerald-400/90 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                  {targetConfirmation}
                </span>
              )}
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="profile-card-anim flex items-center gap-3 bg-rose-950/40 border border-rose-500/30 text-rose-300 px-4 py-3 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Overview Bar */}
        <div className="profile-card-anim bg-[#0d0e15] border border-zinc-800 rounded-xl p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white font-mono font-bold text-base shrink-0">
                {initials}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-white text-base">
                    {formData.name || "Candidate Name"}
                  </span>
                  {formData.targetCompany && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-300">
                      {formData.targetCompany} {formData.targetJobRole ? `• ${formData.targetJobRole}` : ""}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono flex-wrap">
                  <span>{formData.email || "No email"}</span>
                  {formData.college && (
                    <>
                      <span className="text-zinc-600">/</span>
                      <span>{formData.college}</span>
                    </>
                  )}
                  {formData.degree && (
                    <>
                      <span className="text-zinc-600">/</span>
                      <span>
                        {formData.degree === "Other" ? formData.customDegree : formData.degree}
                        {formData.graduationYear ? ` '${formData.graduationYear.slice(-2)}` : ""}
                      </span>
                    </>
                  )}
                  {formData.locationPreference && (
                    <>
                      <span className="text-zinc-600">/</span>
                      <span>{formData.locationPreference}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="md:w-52 space-y-1.5 shrink-0 bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-lg">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400">Completeness</span>
                <span className="font-semibold text-white">{completion}%</span>
              </div>
              <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden border border-zinc-800">
                <div
                  className="bg-zinc-200 h-full rounded-full transition-all duration-300"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Profile Settings Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Details */}
            <div className="profile-card-anim bg-[#0d0e15] border border-zinc-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3">
                <User className="w-4 h-4 text-zinc-400" />
                <h2 className="text-sm font-semibold text-white">Personal Details</h2>
              </div>

              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-zinc-300 text-xs font-medium">
                    Full Name <span className="text-rose-400">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Abhishek Kumar"
                    className={`bg-[#14141c] border-zinc-800 text-white placeholder:text-zinc-600 focus:border-zinc-500 text-sm h-9 rounded-lg ${
                      errors.name ? "border-rose-500 focus:border-rose-500" : ""
                    }`}
                  />
                  {errors.name && <p className="text-rose-400 text-xs">{errors.name}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-zinc-300 text-xs font-medium flex items-center justify-between">
                    <span>Email Address</span>
                    <span className="text-[10px] font-mono text-zinc-500">Read-only</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="bg-[#0f1017] border-zinc-900 text-zinc-500 cursor-not-allowed text-sm h-9 rounded-lg font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Placement Targets */}
            <div className="profile-card-anim bg-[#0d0e15] border border-zinc-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3">
                <Briefcase className="w-4 h-4 text-zinc-400" />
                <h2 className="text-sm font-semibold text-white">Placement Targets</h2>
              </div>

              <div className="space-y-3.5">
                <SearchableCombobox
                  id="targetCompany"
                  name="targetCompany"
                  label="Target Company"
                  required
                  icon={Building2}
                  value={formData.targetCompany}
                  onChange={(val) => handleCustomFieldChange("targetCompany", val)}
                  options={COMPANY_SUGGESTIONS}
                  quickSuggestions={POPULAR_COMPANIES_QUICK}
                  placeholder="e.g. Google, Microsoft, Amazon..."
                  error={errors.targetCompany}
                  customPromptPrefix="Target"
                />

                <SearchableCombobox
                  id="targetJobRole"
                  name="targetJobRole"
                  label="Target Job Role"
                  required
                  icon={Briefcase}
                  value={formData.targetJobRole}
                  onChange={(val) => handleCustomFieldChange("targetJobRole", val)}
                  options={JOB_ROLE_OPTIONS}
                  quickSuggestions={POPULAR_ROLES_QUICK}
                  placeholder="e.g. Software Development Engineer..."
                  error={errors.targetJobRole}
                  customPromptPrefix="Target"
                />

                <div className="space-y-1.5">
                  <Label htmlFor="locationPreference" className="text-zinc-300 text-xs font-medium flex items-center justify-between">
                    <span>Preferred Location</span>
                    <span className="text-[10px] font-mono text-zinc-500">Optional</span>
                  </Label>
                  <Input
                    id="locationPreference"
                    name="locationPreference"
                    value={formData.locationPreference}
                    onChange={handleChange}
                    placeholder="e.g. Bangalore, Remote"
                    className="bg-[#14141c] border-zinc-800 text-white placeholder:text-zinc-600 focus:border-zinc-500 text-sm h-9 rounded-lg"
                  />

                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    <span className="text-[10px] text-zinc-500 font-mono mr-1">Quick picks:</span>
                    {LOCATION_SUGGESTIONS.map((loc) => {
                      const isSelected = formData.locationPreference === loc;
                      return (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => handleCustomFieldChange("locationPreference", loc)}
                          className={`text-[11px] px-2 py-0.5 rounded font-mono transition-all cursor-pointer ${
                            isSelected
                              ? "bg-zinc-200 text-zinc-950 font-medium"
                              : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800"
                          }`}
                        >
                          {loc}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Records */}
          <div className="profile-card-anim bg-[#0d0e15] border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-zinc-400" />
                <h2 className="text-sm font-semibold text-white">Academic Credentials</h2>
              </div>

              <Link
                to="/app/academics"
                className="text-xs text-zinc-400 hover:text-white font-mono flex items-center gap-1 transition-colors"
              >
                <span>Academics</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
                <Label htmlFor="college" className="text-zinc-300 text-xs font-medium">
                  University / College <span className="text-rose-400">*</span>
                </Label>
                <Input
                  id="college"
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  placeholder="e.g. VIT Chennai, IIT Delhi, NIT Trichy"
                  className={`bg-[#14141c] border-zinc-800 text-white placeholder:text-zinc-600 focus:border-zinc-500 text-sm h-9 rounded-lg ${
                    errors.college ? "border-rose-500 focus:border-rose-500" : ""
                  }`}
                />
                {errors.college && <p className="text-rose-400 text-xs">{errors.college}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="degree" className="text-zinc-300 text-xs font-medium">
                  Degree <span className="text-rose-400">*</span>
                </Label>
                <select
                  id="degree"
                  name="degree"
                  value={formData.degree}
                  onChange={handleChange}
                  className={`w-full h-9 px-3 rounded-lg bg-[#14141c] border border-zinc-800 text-white text-sm focus:outline-none focus:border-zinc-500 ${
                    errors.degree ? "border-rose-500" : ""
                  }`}
                >
                  <option value="" disabled>Select degree</option>
                  {DEGREE_OPTIONS.map((deg) => (
                    <option key={deg} value={deg} className="bg-[#14141c] text-white">
                      {deg}
                    </option>
                  ))}
                </select>
                {formData.degree === "Other" && (
                  <Input
                    name="customDegree"
                    value={formData.customDegree}
                    onChange={handleChange}
                    placeholder="Specify degree..."
                    className="mt-1.5 bg-[#14141c] border-zinc-800 text-white placeholder:text-zinc-600 focus:border-zinc-500 text-sm h-9 rounded-lg"
                  />
                )}
                {errors.degree && <p className="text-rose-400 text-xs">{errors.degree}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="graduationYear" className="text-zinc-300 text-xs font-medium">
                  Passing Year <span className="text-rose-400">*</span>
                </Label>
                <select
                  id="graduationYear"
                  name="graduationYear"
                  value={formData.graduationYear}
                  onChange={handleChange}
                  className={`w-full h-9 px-3 rounded-lg bg-[#14141c] border border-zinc-800 text-white text-sm focus:outline-none focus:border-zinc-500 ${
                    errors.graduationYear ? "border-rose-500" : ""
                  }`}
                >
                  <option value="" disabled>Select year</option>
                  {GRADUATION_YEARS.map((yr) => (
                    <option key={yr} value={yr} className="bg-[#14141c] text-white">
                      {yr}
                    </option>
                  ))}
                </select>
                {errors.graduationYear && (
                  <p className="text-rose-400 text-xs">{errors.graduationYear}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cgpa" className="text-zinc-300 text-xs font-medium">
                  CGPA (0 - 10) <span className="text-rose-400">*</span>
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
                  placeholder="e.g. 8.75"
                  className={`bg-[#14141c] border-zinc-800 text-white placeholder:text-zinc-600 focus:border-zinc-500 text-sm h-9 rounded-lg font-mono ${
                    errors.cgpa ? "border-rose-500 focus:border-rose-500" : ""
                  }`}
                />
                {errors.cgpa && <p className="text-rose-400 text-xs">{errors.cgpa}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tenthPercentage" className="text-zinc-300 text-xs font-medium flex items-center justify-between">
                  <span>10th Grade (%)</span>
                  <span className="text-[10px] font-mono text-zinc-500">Optional</span>
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
                  placeholder="e.g. 92.5"
                  className={`bg-[#14141c] border-zinc-800 text-white placeholder:text-zinc-600 focus:border-zinc-500 text-sm h-9 rounded-lg font-mono ${
                    errors.tenthPercentage ? "border-rose-500 focus:border-rose-500" : ""
                  }`}
                />
                {errors.tenthPercentage && (
                  <p className="text-rose-400 text-xs">{errors.tenthPercentage}</p>
                )}
              </div>

              <div className="space-y-1.5 sm:col-span-2 lg:col-span-2">
                <Label htmlFor="twelfthPercentage" className="text-zinc-300 text-xs font-medium flex items-center justify-between">
                  <span>12th / Diploma (%)</span>
                  <span className="text-[10px] font-mono text-zinc-500">Optional</span>
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
                  placeholder="e.g. 89.2"
                  className={`bg-[#14141c] border-zinc-800 text-white placeholder:text-zinc-600 focus:border-zinc-500 text-sm h-9 rounded-lg font-mono ${
                    errors.twelfthPercentage ? "border-rose-500 focus:border-rose-500" : ""
                  }`}
                />
                {errors.twelfthPercentage && (
                  <p className="text-rose-400 text-xs">{errors.twelfthPercentage}</p>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Save Action */}
          <div className="profile-card-anim flex items-center justify-end pt-1">
            <Button
              type="submit"
              disabled={saving}
              className="bg-white hover:bg-zinc-200 text-zinc-950 font-medium px-5 py-2 rounded-lg text-xs shadow-none flex items-center gap-2 transition-all cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-950" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Profile</span>
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Developer Integrations */}
        <div className="profile-card-anim space-y-4 pt-4 border-t border-zinc-800">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-zinc-400" />
            <h2 className="text-sm font-semibold text-white">Developer Integrations</h2>
          </div>

          <div className="space-y-4">
            <LeetCodeConnectCard />
            <GitHubConnectCard />
          </div>
        </div>
      </div>
    </div>
  );
}




