import React, { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getCtaHref } from "@/utils/authUtils";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { label: "Features", path: "/#features", isAnchor: true },
    { label: "DSA Sheets", cta: "sheets", path: "/app/sheets" },
    { label: "ATS Resume", cta: "resume", path: "/app/resume" },
    { label: "Mock Interviews", cta: "interview", path: "/app/interview" },
    { label: "FAQs", path: "/#faqs", isAnchor: true },
  ];

  return (
    <header className="fixed top-3 left-0 right-0 z-50 px-4 sm:px-6 max-w-6xl mx-auto">
      <nav className="bg-white/90 backdrop-blur-md text-[#17103D] border border-[#E2DEEC] rounded-2xl px-5 py-2.5 flex items-center justify-between shadow-[0_4px_20px_rgba(23,16,61,0.05)] transition-all">
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 group select-none no-underline"
        >
          <div className="w-8 h-8 rounded-xl bg-[#17103D] text-[#FFD84D] flex items-center justify-center font-heading font-black text-sm shadow-sm group-hover:bg-[#24195A] transition-colors">
            GP
          </div>
          <span className="text-lg font-heading font-black tracking-tight text-[#17103D]">
            Get<span className="text-[#6E44FF]">Placed</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center space-x-6 text-xs font-semibold text-[#6F6A80]">
          {navLinks.map((link) => (
            link.isAnchor ? (
              <a
                key={link.label}
                href={link.path}
                className="text-[#6F6A80] hover:text-[#17103D] transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                to={getCtaHref(link.cta, "login", link.path)}
                className="text-[#6F6A80] hover:text-[#17103D] transition-colors"
              >
                {link.label}
              </Link>
            )
          ))}
        </div>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center space-x-3">
          <Link
            to="/login"
            className="text-xs font-bold text-[#17103D] hover:text-[#6E44FF] px-3 py-1.5 transition-colors"
          >
            Log in
          </Link>
          <Link
            to={getCtaHref("general", "register")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#17103D] hover:bg-[#24195A] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <span>Start Free</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden text-[#17103D] p-1.5 rounded-lg border border-[#E2DEEC] bg-[#F8F8F5] focus:outline-none cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Navigation"
        >
          {isOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="mt-2 bg-white text-[#17103D] border border-[#E2DEEC] rounded-2xl p-5 shadow-xl flex flex-col space-y-3 lg:hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {navLinks.map((link) => (
            link.isAnchor ? (
              <a
                key={link.label}
                href={link.path}
                onClick={() => setIsOpen(false)}
                className="font-semibold text-xs py-1.5 text-[#17103D] hover:text-[#6E44FF]"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                to={getCtaHref(link.cta, "login", link.path)}
                onClick={() => setIsOpen(false)}
                className="font-semibold text-xs py-1.5 text-[#17103D] hover:text-[#6E44FF]"
              >
                {link.label}
              </Link>
            )
          ))}
          <div className="pt-3 border-t border-[#E2DEEC] flex flex-col space-y-2">
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="w-full text-center py-2 text-xs font-bold text-[#17103D]"
            >
              Sign In
            </Link>
            <Link
              to={getCtaHref("general", "register")}
              onClick={() => setIsOpen(false)}
              className="w-full text-center py-2 text-xs font-bold bg-[#17103D] text-white rounded-xl shadow-sm"
            >
              Start Free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
