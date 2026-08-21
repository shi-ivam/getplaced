import React, { useState } from "react";
import { FiMenu, FiX, FiArrowUpRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="fixed top-6 left-0 right-0 z-50 px-4 md:px-8 max-w-7xl mx-auto pointer-events-none">
      <nav className="pointer-events-auto backdrop-blur-xl bg-[#090b14]/85 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] rounded-full px-6 py-3.5 flex items-center justify-between transition-all duration-300">
        {/* Brand Logo */}
        <div 
          onClick={() => navigate("/")} 
          className="flex items-center cursor-pointer group"
        >
          <span className="text-xl font-black tracking-tight text-white font-sans">
            get<span className="text-purple-400">Placed</span>
          </span>
        </div>

        {/* Desktop Links */}
        <ul className="hidden lg:flex items-center space-x-8 text-sm font-medium text-slate-300">
          {[
            { label: "AI Interviewer", path: "#hero" },
            { label: "Bento Capabilities", path: "#features" },
            { label: "ATS Analyzer", path: "#resume" },
            { label: "Study Plan", path: "#calendar" },
            { label: "Security", path: "#security" }
          ].map((link) => (
            <li key={link.label}>
              <a
                href={link.path}
                className="hover:text-white transition-colors duration-200 py-1 relative group text-xs tracking-wider uppercase font-semibold text-slate-400 hover:text-purple-300"
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
            className="text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-white px-4 py-2 rounded-full transition duration-200 hover:bg-white/5"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate("/register")}
            className="group relative inline-flex items-center justify-center px-5 py-2 text-xs font-bold uppercase tracking-wider text-slate-950 bg-white rounded-full overflow-hidden shadow-lg hover:bg-slate-200 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
          >
            <span>Start Practice</span>
            <FiArrowUpRight className="ml-1 w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden text-white p-2 focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Navigation"
        >
          {isOpen ? <FiX className="w-6 h-6 text-purple-400" /> : <FiMenu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="pointer-events-auto mt-3 backdrop-blur-2xl bg-[#090b14]/95 border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col space-y-4 lg:hidden animate-in fade-in slide-in-from-top-4 duration-300">
          {[
            { label: "AI Interviewer", path: "#hero" },
            { label: "Bento Capabilities", path: "#features" },
            { label: "ATS Analyzer", path: "#resume" },
            { label: "Study Plan", path: "#calendar" },
            { label: "Security", path: "#security" }
          ].map((link) => (
            <a
              key={link.label}
              href={link.path}
              onClick={() => setIsOpen(false)}
              className="text-slate-300 hover:text-white font-medium text-sm py-2 px-3 rounded-lg hover:bg-white/5 transition duration-200"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-4 border-t border-white/10 flex flex-col space-y-3">
            <button
              onClick={() => { navigate("/login"); setIsOpen(false); }}
              className="w-full text-center py-2.5 text-sm font-semibold text-slate-300 hover:text-white border border-white/10 rounded-full"
            >
              Sign In
            </button>
            <button
              onClick={() => { navigate("/register"); setIsOpen(false); }}
              className="w-full text-center py-2.5 text-sm font-bold text-slate-950 bg-white rounded-full shadow-lg"
            >
              Start Free Practice
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
