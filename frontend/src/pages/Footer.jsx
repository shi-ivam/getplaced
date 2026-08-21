import React from "react";
import { ArrowRight, Zap, Github, Twitter, Linkedin, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="relative w-full bg-[#030408] text-slate-400 pt-20 pb-12 border-t border-white/10 overflow-hidden">
      
      {/* Background Accent Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[250px] bg-purple-900/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        
        {/* Call to Action Banner */}
        <div className="mb-20 rounded-3xl bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-slate-900/50 p-8 md:p-14 border border-purple-500/20 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-3">
              Ready to Accelerate Your Placement?
            </h3>
            <p className="text-slate-300 text-sm md:text-base max-w-xl">
              Join thousands of developers using getPlaced AI to practice interview questions, analyze resumes, and crack top tier offers.
            </p>
          </div>

          <button
            onClick={() => navigate("/register")}
            className="shrink-0 px-8 py-4 rounded-full bg-white text-slate-950 font-bold text-sm uppercase tracking-wider hover:bg-slate-200 transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center gap-2 group"
          >
            <span>Start Practice Free</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-16 border-b border-white/10">
          
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-white">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">get<span className="text-purple-400">Placed</span></span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering candidates through AI biometric feedback, ATS resume analysis, and structured algorithmic mastery.
            </p>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-slate-200 font-bold mb-4">Platform</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><a href="#hero" className="hover:text-purple-300 transition-colors">AI Interview Simulator</a></li>
              <li><a href="#features" className="hover:text-purple-300 transition-colors">Bento Capabilities</a></li>
              <li><a href="#resume" className="hover:text-purple-300 transition-colors">ATS Resume Radar</a></li>
              <li><a href="#calendar" className="hover:text-purple-300 transition-colors">Roadmap Calendar</a></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-slate-200 font-bold mb-4">Security & Tech</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><a href="#security" className="hover:text-purple-300 transition-colors">AES-256 Encryption</a></li>
              <li><a href="#security" className="hover:text-purple-300 transition-colors">SOC-2 Compliance</a></li>
              <li><a href="#" className="hover:text-purple-300 transition-colors">Privacy Standard</a></li>
              <li><a href="#" className="hover:text-purple-300 transition-colors">System Telemetry</a></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-slate-200 font-bold mb-4">Connect</h4>
            <div className="flex space-x-4 mb-4 text-slate-300">
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
              </a>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">support@getplaced.ai</span>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>&copy; {new Date().getFullYear()} getPlaced Platform. All rights reserved.</p>
          <div className="flex space-x-6 text-[11px]">
            <a href="#" className="hover:text-slate-200 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-200 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-200 transition-colors">Cookie Settings</a>
          </div>
        </div>

      </div>
    </footer>
  );
}