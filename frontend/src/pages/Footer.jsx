import React from "react";
import { ArrowRight, Zap, Github, Twitter, Linkedin, Mail } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { SUPPORT_EMAIL } from "@/config/api";

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="relative w-full bg-[#12221e] text-[#FFF4E1]/70 pt-20 pb-12 border-t border-[#428475]/30 overflow-hidden">
      
      {/* Background Accent Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[250px] bg-[#89D7B7]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        
        {/* Call to Action Banner */}
        <div className="mb-20 rounded-3xl bg-gradient-to-r from-[#1A312C] via-[#1E3A34] to-[#428475]/40 p-8 md:p-14 border border-[#89D7B7]/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="text-3xl md:text-5xl font-extrabold text-[#FFF4E1] tracking-tight mb-3">
              Start Your Placement Preparation
            </h3>
            <p className="text-[#FFF4E1]/80 text-sm md:text-base max-w-xl">
              Practice technical interviews, benchmark resumes against ATS criteria, and track preparation milestones.
            </p>
          </div>

          <button
            onClick={() => navigate("/register")}
            className="shrink-0 px-8 py-4 rounded-full bg-[#89D7B7] text-[#1A312C] font-bold text-sm uppercase tracking-wider hover:bg-[#a6e6ce] transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center gap-2 group cursor-pointer"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#1A312C]" />
          </button>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-16 border-b border-[#428475]/30">
          
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center">
              <span className="text-xl font-black text-[#FFF4E1] tracking-tight">get<span className="text-[#89D7B7]">Placed</span></span>
            </div>
            <p className="text-xs text-[#FFF4E1]/70 leading-relaxed">
              Technical interview simulations, resume ATS scoring, and structured preparation roadmaps.
            </p>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#89D7B7] font-bold mb-4">Platform</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><a href="#hero" className="hover:text-[#89D7B7] transition-colors">Interview Simulator</a></li>
              <li><a href="#features" className="hover:text-[#89D7B7] transition-colors">Feature Overview</a></li>
              <li><a href="#resume" className="hover:text-[#89D7B7] transition-colors">Resume Scoring</a></li>
              <li><a href="#calendar" className="hover:text-[#89D7B7] transition-colors">Preparation Roadmap</a></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#89D7B7] font-bold mb-4">Security & Architecture</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><a href="#security" className="hover:text-[#89D7B7] transition-colors">AES-256 Encryption</a></li>
              <li><a href="#security" className="hover:text-[#89D7B7] transition-colors">SOC-2 Controls</a></li>
              <li><Link to="/privacy" className="hover:text-[#89D7B7] transition-colors">Privacy Policy</Link></li>
              <li><a href="#hero" className="hover:text-[#89D7B7] transition-colors">System Telemetry</a></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#89D7B7] font-bold mb-4">Contact</h4>
            <div className="flex space-x-4 mb-4 text-[#FFF4E1]/80">
              <a href="https://github.com/getplaced" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-[#1A312C] border border-[#428475]/30 hover:border-[#89D7B7]/50 hover:text-[#89D7B7] transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="https://twitter.com/getplaced" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-[#1A312C] border border-[#428475]/30 hover:border-[#89D7B7]/50 hover:text-[#89D7B7] transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://linkedin.com/company/getplaced" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-[#1A312C] border border-[#428475]/30 hover:border-[#89D7B7]/50 hover:text-[#89D7B7] transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href={`mailto:${SUPPORT_EMAIL}`} className="p-2 rounded-lg bg-[#1A312C] border border-[#428475]/30 hover:border-[#89D7B7]/50 hover:text-[#89D7B7] transition-colors">
                <Mail className="w-4 h-4" />
              </a>
            </div>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[11px] text-[#89D7B7] font-mono hover:underline">
              {SUPPORT_EMAIL}
            </a>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#FFF4E1]/60 gap-4">
          <p>&copy; {new Date().getFullYear()} getPlaced Platform. All rights reserved.</p>
          <div className="flex space-x-6 text-[11px]">
            <Link to="/terms" className="hover:text-[#FFF4E1] transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-[#FFF4E1] transition-colors">Privacy Policy</Link>
            <Link to="/privacy" className="hover:text-[#FFF4E1] transition-colors">Cookie Settings</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}