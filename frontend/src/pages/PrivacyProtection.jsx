import React from "react";
import { motion } from "framer-motion";
import { Lock, ShieldCheck, Key, EyeOff, Server } from "lucide-react";

const encryptedHashes = [
  "0x7F9a...3B4C", "0xE421...91F0", "0x89D2...04A1",
  "0x11B8...99E3", "0x33A0...77B2", "0x55C1...22D4"
];

const PrivacyProtection = () => {
  return (
    <section id="security" className="py-24 md:py-36 bg-[#05060d] text-white relative overflow-hidden">
      
      {/* Subtle Background Mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/20 via-[#05060d] to-[#05060d] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        
        <div className="rounded-3xl bg-gradient-to-b from-[#0c0e1b] to-[#070811] p-8 md:p-14 border border-white/10 shadow-2xl relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Text & Specs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono uppercase tracking-widest">
                <Lock className="w-3.5 h-3.5 text-emerald-400" /> Hardened Enterprise Security
              </div>
              
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Zero-Knowledge Privacy & Encryption Standard
              </h2>

              <p className="text-slate-300 text-base md:text-lg leading-relaxed">
                Your mock interview audio streams, candidate telemetry, and custom resume documents are encrypted in transit via TLS 1.3 and at rest with AES-256 GCM.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
                  <Key className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white mb-0.5">End-to-End Key Isolation</h4>
                    <p className="text-xs text-slate-400">Isolated candidate key pairs generated client-side.</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
                  <EyeOff className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white mb-0.5">No Unverified Data Training</h4>
                    <p className="text-xs text-slate-400">Your mock interview data is never stored for public AI model training.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Encrypted Hash Graphic */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-black/60 border border-white/10 relative">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <ShieldCheck className="w-8 h-8" />
              </div>

              <div className="w-full space-y-2 font-mono text-xs">
                {encryptedHashes.map((hash, i) => (
                  <div key={i} className="flex justify-between p-2.5 rounded-lg bg-slate-950/80 border border-white/5 text-slate-400">
                    <span className="text-emerald-400">PAYLOAD_HASH_{i+1}</span>
                    <span>{hash}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2 text-[11px] font-mono text-slate-400">
                <Server className="w-3.5 h-3.5 text-purple-400" />
                <span>STATUS: SOC-2 COMPLIANT ENCLAVE</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default PrivacyProtection;
