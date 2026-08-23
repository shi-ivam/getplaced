import React from "react";
import { ArrowRight, Github, Twitter, Linkedin, Mail } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { SUPPORT_EMAIL } from "@/config/api";

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="relative w-full bg-[#09090b] text-zinc-400 pt-16 pb-10 border-t border-zinc-800/80 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10">
        
        {/* Call to Action Banner */}
        <div className="mb-16 rounded-2xl bg-zinc-900/60 p-6 md:p-10 border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-2">
              Start Placement Preparation
            </h3>
            <p className="text-zinc-400 text-sm max-w-lg">
              Practice technical interviews, benchmark resumes against ATS criteria, and track preparation milestones.
            </p>
          </div>

          <button
            onClick={() => navigate("/register")}
            className="shrink-0 px-6 py-3 rounded-lg bg-zinc-100 text-zinc-950 font-semibold text-xs uppercase tracking-wider hover:bg-white transition-all flex items-center gap-2 group cursor-pointer"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform text-zinc-950" />
          </button>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-zinc-800">
          
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="text-base font-bold text-white tracking-tight font-sans">
                get<span className="text-purple-400">Placed</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Technical interview simulations, resume ATS scoring, and structured preparation roadmaps.
            </p>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold mb-3">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#hero" className="hover:text-white transition-colors">Interview Simulator</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Feature Overview</a></li>
              <li><a href="#resume" className="hover:text-white transition-colors">Resume Scoring</a></li>
              <li><a href="#calendar" className="hover:text-white transition-colors">Preparation Schedule</a></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold mb-3">Security</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#security" className="hover:text-white transition-colors">AES-256 Encryption</a></li>
              <li><a href="#security" className="hover:text-white transition-colors">SOC-2 Protocols</a></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><a href="#hero" className="hover:text-white transition-colors">System Telemetry</a></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold mb-3">Contact</h4>
            <div className="flex space-x-2.5 mb-3 text-zinc-400">
              <a href="https://github.com/getplaced" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:text-white transition-colors">
                <Github className="w-3.5 h-3.5" />
              </a>
              <a href="https://twitter.com/getplaced" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:text-white transition-colors">
                <Twitter className="w-3.5 h-3.5" />
              </a>
              <a href="https://linkedin.com/company/getplaced" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:text-white transition-colors">
                <Linkedin className="w-3.5 h-3.5" />
              </a>
              <a href={`mailto:${SUPPORT_EMAIL}`} className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:text-white transition-colors">
                <Mail className="w-3.5 h-3.5" />
              </a>
            </div>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-xs text-zinc-400 font-mono hover:text-white transition-colors">
              {SUPPORT_EMAIL}
            </a>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-3">
          <p>&copy; {new Date().getFullYear()} getPlaced. All rights reserved.</p>
          <div className="flex space-x-5 text-xs">
            <Link to="/terms" className="hover:text-zinc-300 transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-zinc-300 transition-colors">Privacy</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}