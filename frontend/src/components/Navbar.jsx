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
        className="pointer-events-auto backdrop-blur-2xl bg-[#1A312C]/90 border border-[#428475]/40 shadow-[0_20px_50px_rgba(10,20,18,0.85)] rounded-full px-6 py-3.5 flex items-center justify-between transition-all duration-300"
      >
        {/* Brand Logo */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center cursor-pointer group select-none"
        >
          <span className="text-xl font-bold tracking-tight text-[#FFF4E1] font-sans">
            get<span className="text-[#89D7B7]">Placed</span>
          </span>
        </div>

        {/* Desktop Links */}
        <ul className="hidden lg:flex items-center space-x-8 text-xs font-semibold uppercase tracking-wider text-[#FFF4E1]/70">
          {[
            { label: "Interviews", path: "#hero" },
            { label: "Features", path: "#features" },
            { label: "Resume", path: "#resume" },
            { label: "Roadmap", path: "#calendar" },
            { label: "Security", path: "#security" },
          ].map((link) => (
            <li key={link.label}>
              <a
                href={link.path}
                className="hover:text-[#89D7B7] transition-colors duration-200 py-1 relative group text-[#FFF4E1]/70 font-mono text-[11px]"
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
            className="text-xs font-semibold uppercase tracking-wider text-[#FFF4E1]/85 hover:text-[#FFF4E1] px-4 py-2 rounded-full transition-all duration-200 hover:bg-[#428475]/25 border border-transparent hover:border-[#428475]/40 cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate("/register")}
            className="group relative inline-flex items-center justify-center px-5 py-2 text-xs font-semibold uppercase tracking-wider text-[#1A312C] bg-[#89D7B7] rounded-full overflow-hidden shadow-[0_4px_20px_rgba(137,215,183,0.3)] hover:bg-[#a6e6ce] hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 cursor-pointer font-bold"
          >
            <span>Get Started</span>
            <FiArrowUpRight className="ml-1 w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-[#1A312C]" />
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden text-[#FFF4E1] p-2 focus:outline-none cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Navigation"
        >
          {isOpen ? <FiX className="w-5 h-5 text-[#89D7B7]" /> : <FiMenu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="pointer-events-auto mt-3 backdrop-blur-2xl bg-[#1A312C]/95 border border-[#428475]/40 rounded-3xl p-6 shadow-2xl flex flex-col space-y-4 lg:hidden animate-in fade-in slide-in-from-top-4 duration-300">
          {[
            { label: "Interviews", path: "#hero" },
            { label: "Features", path: "#features" },
            { label: "Resume", path: "#resume" },
            { label: "Roadmap", path: "#calendar" },
            { label: "Security", path: "#security" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.path}
              onClick={() => setIsOpen(false)}
              className="text-[#FFF4E1]/80 hover:text-[#89D7B7] font-medium text-sm py-2 px-3 rounded-lg hover:bg-[#428475]/20 transition duration-200 font-mono text-xs"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-4 border-t border-[#428475]/30 flex flex-col space-y-3">
            <button
              onClick={() => {
                navigate("/login");
                setIsOpen(false);
              }}
              className="w-full text-center py-2.5 text-xs font-semibold uppercase tracking-wider text-[#FFF4E1] hover:text-[#89D7B7] border border-[#428475]/40 rounded-full hover:bg-[#428475]/20 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                navigate("/register");
                setIsOpen(false);
              }}
              className="w-full text-center py-2.5 text-xs font-semibold uppercase tracking-wider text-[#1A312C] bg-[#89D7B7] hover:bg-[#a6e6ce] rounded-full shadow-lg transition-colors font-bold"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

