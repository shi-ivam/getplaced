import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  AlertCircle,
  Loader2,
  Sparkles,
  UserPlus,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { NODE_API_URL } from "@/config/api";
import GpBadge from "@/components/gp/GpBadge";

export function RegisterForm({ className = "", ...rest }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        `${NODE_API_URL}/api/users/`,
        {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        },
        { withCredentials: true }
      );

      if (res.data?.token) {
        localStorage.setItem("getplaced_token", res.data.token);
      }
      if (res.data?._id) {
        localStorage.setItem("getplaced_user", JSON.stringify(res.data));
      }

      navigate("/app");
    } catch (err) {
      console.error("Registration error:", err);
      if (!err.response) {
        setError("Network connection failed. Please check your internet and try again.");
      } else if (err.response.status === 400 && err.response.data?.message?.includes("already exists")) {
        setError("An account already exists with this email address. Please sign in instead.");
      } else {
        setError(
          err.response?.data?.message || "Registration failed. Please verify your details and try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`} {...rest}>
      <div className="bg-white border border-[#E2DEEC] rounded-2xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(23,16,61,0.06)] space-y-6 text-[#17103D]">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <GpBadge theme="mint" size="sm">
              <UserPlus className="w-3.5 h-3.5 mr-1" />
              Free Registration
            </GpBadge>
            <Link to="/" className="text-xs text-[#6F6A80] hover:text-[#17103D] font-medium">
              Back to Home &rarr;
            </Link>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-[#17103D] tracking-tight">
              Create Candidate Account
            </h1>
            <p className="text-xs sm:text-sm text-[#6F6A80] mt-1">
              Generate your verified readiness matrix and begin placement preparation.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-[#FFE8E5] border border-[#FFC5B7] text-[#C7382B] text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-xs font-semibold text-[#6F6A80]">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Abhishek Sharma"
              required
              disabled={loading}
              className="w-full bg-[#F8F8F5] border border-[#E2DEEC] rounded-xl px-3.5 py-2.5 text-sm text-[#17103D] placeholder-[#6F6A80]/50 focus:outline-none focus:border-[#6E44FF] focus:ring-2 focus:ring-[#6E44FF]/10 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-xs font-semibold text-[#6F6A80]">
              University / Personal Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="candidate@university.edu"
              required
              disabled={loading}
              className="w-full bg-[#F8F8F5] border border-[#E2DEEC] rounded-xl px-3.5 py-2.5 text-sm text-[#17103D] placeholder-[#6F6A80]/50 focus:outline-none focus:border-[#6E44FF] focus:ring-2 focus:ring-[#6E44FF]/10 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-xs font-semibold text-[#6F6A80]">
              Password (min. 6 characters)
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                minLength={6}
                disabled={loading}
                className="w-full bg-[#F8F8F5] border border-[#E2DEEC] rounded-xl px-3.5 py-2.5 text-sm text-[#17103D] placeholder-[#6F6A80]/50 focus:outline-none focus:border-[#6E44FF] focus:ring-2 focus:ring-[#6E44FF]/10 transition-all pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F6A80] hover:text-[#17103D] transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[#17103D] hover:bg-[#24195A] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#FFD84D]" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Free Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          <div className="pt-4 border-t border-[#E2DEEC] text-center text-xs text-[#6F6A80]">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-[#6E44FF] hover:underline">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
