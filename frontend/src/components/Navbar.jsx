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
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
      );
    }
  }, []);

  return (
    <header className="fixed top-5 left-0 right-0 z-50 px-4 md:px-8 max-w-6xl mx-auto pointer-events-none">
      <nav
        ref={navRef}
        className="pointer-events-auto backdrop-blur-xl bg-zinc-950/80 border border-zinc-800/80 shadow-2xl rounded-xl px-5 py-3 flex items-center justify-between transition-all duration-300"
      >
        {/* Brand Logo */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center cursor-pointer group select-none"
        >
          <span className="text-base font-bold tracking-tight text-white font-sans">
            get<span className="text-purple-400">Placed</span>
          </span>
        </div>

        {/* Desktop Links */}
        <ul className="hidden lg:flex items-center space-x-7 text-xs font-medium text-zinc-400">
          {[
            { label: "Interviews", path: "#hero" },
            { label: "Features", path: "#features" },
            { label: "Resume", path: "#resume" },
            { label: "Schedule", path: "#calendar" },
            { label: "Security", path: "#security" },
          ].map((link) => (
            <li key={link.label}>
              <a
                href={link.path}
                className="hover:text-white transition-colors duration-150 py-1 text-xs"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center space-x-2.5">
          <button
            onClick={() => navigate("/login")}
            className="text-xs font-medium text-zinc-300 hover:text-white px-3.5 py-1.5 rounded-lg transition-colors hover:bg-zinc-900 cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate("/register")}
            className="inline-flex items-center justify-center px-4 py-1.5 text-xs font-semibold text-zinc-950 bg-zinc-100 hover:bg-white rounded-lg transition-all cursor-pointer"
          >
            <span>Get Started</span>
            <FiArrowUpRight className="ml-1 w-3.5 h-3.5 text-zinc-950" />
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden text-zinc-300 hover:text-white p-1.5 focus:outline-none cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Navigation"
        >
          {isOpen ? <FiX className="w-5 h-5 text-zinc-200" /> : <FiMenu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="pointer-events-auto mt-2 backdrop-blur-2xl bg-zinc-950/95 border border-zinc-800 rounded-xl p-5 shadow-2xl flex flex-col space-y-3 lg:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {[
            { label: "Interviews", path: "#hero" },
            { label: "Features", path: "#features" },
            { label: "Resume", path: "#resume" },
            { label: "Schedule", path: "#calendar" },
            { label: "Security", path: "#security" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.path}
              onClick={() => setIsOpen(false)}
              className="text-zinc-300 hover:text-white text-xs py-1.5 px-2 rounded-lg hover:bg-zinc-900 transition duration-150"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 border-t border-zinc-800 flex flex-col space-y-2">
            <button
              onClick={() => {
                navigate("/login");
                setIsOpen(false);
              }}
              className="w-full text-center py-2 text-xs font-medium text-zinc-300 hover:text-white border border-zinc-800 rounded-lg hover:bg-zinc-900 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                navigate("/register");
                setIsOpen(false);
              }}
              className="w-full text-center py-2 text-xs font-semibold text-zinc-950 bg-zinc-100 hover:bg-white rounded-lg shadow transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

