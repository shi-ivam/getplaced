import React, { useState, useRef, useEffect } from "react";
import { FiMenu, FiX, FiArrowUpRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (navRef.current) {
      gsap.fromTo(
        navRef.current,
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );
    }
  }, []);

  return (
    <header className="fixed top-6 left-0 right-0 z-50 px-4 md:px-8 max-w-7xl mx-auto pointer-events-none">
      <nav
        ref={navRef}
        className="pointer-events-auto backdrop-blur-2xl bg-zinc-950/85 border border-zinc-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.85)] rounded-full px-6 py-3.5 flex items-center justify-between transition-all duration-300"
      >
        {/* Brand Logo */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center cursor-pointer group select-none"
        >
          <span className="text-xl font-bold tracking-tight text-zinc-100 font-sans">
            get<span className="text-purple-400">Placed</span>
          </span>
        </div>

        {/* Desktop Links */}
        <ul className="hidden lg:flex items-center space-x-8 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          {[
            { label: "AI Interviewer", path: "#hero" },
            { label: "Capabilities", path: "#features" },
            { label: "ATS Analyzer", path: "#resume" },
            { label: "Study Plan", path: "#calendar" },
            { label: "Security", path: "#security" },
          ].map((link) => (
            <li key={link.label}>
              <a
                href={link.path}
                className="hover:text-zinc-100 transition-colors duration-200 py-1 relative group text-zinc-400 hover:text-purple-300 font-mono text-[11px]"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center space-x-3">
          <button
            onClick={() => navigate("/login")}
            className="text-xs font-semibold uppercase tracking-wider text-zinc-300 hover:text-white px-4 py-2 rounded-full transition-all duration-200 hover:bg-zinc-800/80 cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate("/register")}
            className="group relative inline-flex items-center justify-center px-5 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-950 bg-zinc-100 rounded-full overflow-hidden shadow-lg hover:bg-white hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            <span>Start Practice</span>
            <FiArrowUpRight className="ml-1 w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden text-zinc-200 p-2 focus:outline-none cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Navigation"
        >
          {isOpen ? <FiX className="w-5 h-5 text-purple-400" /> : <FiMenu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="pointer-events-auto mt-3 backdrop-blur-2xl bg-zinc-950/95 border border-zinc-800/90 rounded-3xl p-6 shadow-2xl flex flex-col space-y-4 lg:hidden animate-in fade-in slide-in-from-top-4 duration-300">
          {[
            { label: "AI Interviewer", path: "#hero" },
            { label: "Capabilities", path: "#features" },
            { label: "ATS Analyzer", path: "#resume" },
            { label: "Study Plan", path: "#calendar" },
            { label: "Security", path: "#security" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.path}
              onClick={() => setIsOpen(false)}
              className="text-zinc-300 hover:text-white font-medium text-sm py-2 px-3 rounded-lg hover:bg-zinc-800/60 transition duration-200 font-mono text-xs"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-4 border-t border-zinc-800 flex flex-col space-y-3">
            <button
              onClick={() => {
                navigate("/login");
                setIsOpen(false);
              }}
              className="w-full text-center py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-300 hover:text-white border border-zinc-800 rounded-full hover:bg-zinc-900 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                navigate("/register");
                setIsOpen(false);
              }}
              className="w-full text-center py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-950 bg-zinc-100 hover:bg-white rounded-full shadow-lg transition-colors"
            >
              Start Free Practice
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

