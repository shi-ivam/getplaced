import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { AlertCircle, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
import { NODE_API_URL } from "@/config/api";
import { getCtaFeature } from "@/config/ctaFeatures";

export function RegisterForm({ className = "", ...rest }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const ctaParam = searchParams.get("cta") || searchParams.get("feature");

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
      setError("Password must be at least 6 characters.");
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

      // Determine redirect path
      let destination = "/app";
      if (redirectParam) {
        destination = redirectParam;
      } else if (ctaParam) {
        const feature = getCtaFeature(ctaParam);
        destination = feature?.targetPath || "/app";
      }

      navigate(destination);
    } catch (err) {
      console.error("Registration error:", err);
      if (!err.response) {
        setError("Network connection failed. Please try again.");
      } else if (err.response.status === 400 && err.response.data?.message?.includes("already exists")) {
        setError("An account already exists with this email.");
      } else {
        setError(err.response?.data?.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 w-full ${className}`} {...rest}>
      {/* Error Alert */}
      {error && (
        <div className="p-3.5 rounded-lg bg-[#FDEBEC] border border-[#F5C2C4] text-[#9F2F2D] text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="name" className="block text-sm font-medium text-[#111111]">
          Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Abhishek Sharma"
          required
          disabled={loading}
          className="w-full bg-white border border-[#EAEAEA] rounded-lg px-3.5 py-2.5 text-sm text-[#111111] placeholder-[#787774]/50 focus:outline-none focus:border-[#111111] transition-colors"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-medium text-[#111111]">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@university.edu"
          required
          disabled={loading}
          className="w-full bg-white border border-[#EAEAEA] rounded-lg px-3.5 py-2.5 text-sm text-[#111111] placeholder-[#787774]/50 focus:outline-none focus:border-[#111111] transition-colors"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-medium text-[#111111]">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 6 characters"
            required
            minLength={6}
            disabled={loading}
            className="w-full bg-white border border-[#EAEAEA] rounded-lg px-3.5 py-2.5 text-sm text-[#111111] placeholder-[#787774]/50 focus:outline-none focus:border-[#111111] transition-colors pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#787774] hover:text-[#111111] transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-[#111111] hover:bg-[#333333] active:scale-[0.99] text-white text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
