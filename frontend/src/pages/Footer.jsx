import React, { useState } from "react";
import { ArrowRight, Github, Linkedin, Mail, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { SUPPORT_EMAIL } from "@/config/api";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setEmail("");
    }
  };

  return (
    <footer className="w-full bg-[#17103D] text-white pt-16 pb-12 border-t border-[#24195A]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-left">
          {/* Brand & Mission */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FFD84D] text-[#17103D] flex items-center justify-center font-heading font-black text-sm">
                GP
              </div>
              <span className="text-xl font-heading font-black text-white tracking-tight">
                Get<span className="text-[#FFD84D]">Placed</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-white/70 leading-relaxed max-w-sm">
              The modern career operating system for engineering students. Master DSA, polish resumes, simulate interviews, and monitor academic readiness.
            </p>

            {/* Newsletter */}
            <form onSubmit={handleSubscribe} className="pt-2 max-w-sm flex gap-2">
              <input
                type="email"
                placeholder="Enter email for placement updates..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-white/50 focus:outline-none focus:border-[#FFD84D]"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#FFD84D] hover:bg-[#FEDF6A] text-[#17103D] text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                {subscribed ? "Subscribed!" : "Subscribe"}
              </button>
            </form>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2 space-y-2 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-white/90 text-[11px]">
              Platform
            </h4>
            <ul className="space-y-1.5 text-white/70">
              <li><Link to="/app" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link to="/app/coding" className="hover:text-white transition-colors">Coding Workspace</Link></li>
              <li><Link to="/app/sheets" className="hover:text-white transition-colors">DSA Sheets (28)</Link></li>
              <li><Link to="/app/resume" className="hover:text-white transition-colors">Resume ATS</Link></li>
              <li><Link to="/app/interview" className="hover:text-white transition-colors">Mock Interviews</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-2 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-white/90 text-[11px]">
              Intelligence
            </h4>
            <ul className="space-y-1.5 text-white/70">
              <li><Link to="/app/jobs" className="hover:text-white transition-colors">Jobs Market</Link></li>
              <li><Link to="/app/role-fit" className="hover:text-white transition-colors">Role Fit AI</Link></li>
              <li><Link to="/app/can-i-apply" className="hover:text-white transition-colors">Can I Apply?</Link></li>
              <li><Link to="/app/academics" className="hover:text-white transition-colors">Academics</Link></li>
              <li><Link to="/app/vtop" className="hover:text-white transition-colors">VTOP Sync</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-2 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-white/90 text-[11px]">
              Policies & Support
            </h4>
            <ul className="space-y-1.5 text-white/70">
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-white transition-colors">Contact Support</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <span>&copy; {new Date().getFullYear()} GetPlaced Career Operating System. All rights reserved.</span>
          <span>Encrypted candidate intelligence enclave.</span>
        </div>
      </div>
    </footer>
  );
}
