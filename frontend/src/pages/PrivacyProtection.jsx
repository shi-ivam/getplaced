import React from "react";
import { motion } from "framer-motion";
import { Lock, ShieldCheck, Key, EyeOff, Server } from "lucide-react";

const encryptedHashes = [
  "0x7F9a...3B4C", "0xE421...91F0", "0x89D2...04A1",
  "0x11B8...99E3", "0x33A0...77B2", "0x55C1...22D4"
];

const PrivacyProtection = () => {
  return (
    <section id="security" className="py-24 md:py-36 bg-[#1A312C] text-[#FFF4E1] relative overflow-hidden">
      
      {/* Subtle Background Mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#428475]/20 via-[#1A312C] to-[#1A312C] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        
        <div className="rounded-3xl bg-gradient-to-b from-[#1E3A34] to-[#12221e] p-8 md:p-14 border border-[#428475]/40 shadow-2xl relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Text & Specs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#428475]/25 border border-[#89D7B7]/30 text-[#89D7B7] text-xs font-mono uppercase tracking-widest">
                <Lock className="w-3.5 h-3.5 text-[#89D7B7]" /> Hardened Enterprise Security
              </div>
              
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#FFF4E1] leading-tight">
                Zero-Knowledge Privacy & Encryption Standard
              </h2>

              <p className="text-[#FFF4E1]/80 text-base md:text-lg leading-relaxed">
                Your mock interview audio streams, candidate telemetry, and custom resume documents are encrypted in transit via TLS 1.3 and at rest with AES-256 GCM.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-xl bg-[#1A312C]/80 border border-[#428475]/35 flex items-start gap-3">
                  <Key className="w-5 h-5 text-[#89D7B7] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-[#FFF4E1] mb-0.5">End-to-End Key Isolation</h4>
                    <p className="text-xs text-[#FFF4E1]/70">Isolated candidate key pairs generated client-side.</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#1A312C]/80 border border-[#428475]/35 flex items-start gap-3">
                  <EyeOff className="w-5 h-5 text-[#89D7B7] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-[#FFF4E1] mb-0.5">No Unverified Data Training</h4>
                    <p className="text-xs text-[#FFF4E1]/70">Your mock interview data is never stored for public AI model training.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Encrypted Hash Graphic */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-[#12221e]/90 border border-[#428475]/40 relative">
              <div className="w-16 h-16 rounded-full bg-[#89D7B7]/20 border border-[#89D7B7]/40 flex items-center justify-center text-[#89D7B7] mb-6 shadow-[0_0_30px_rgba(137,215,183,0.3)]">
                <ShieldCheck className="w-8 h-8" />
              </div>

              <div className="w-full space-y-2 font-mono text-xs">
                {encryptedHashes.map((hash, i) => (
                  <div key={i} className="flex justify-between p-2.5 rounded-lg bg-[#1A312C]/90 border border-[#428475]/25 text-[#FFF4E1]/70">
                    <span className="text-[#89D7B7]">PAYLOAD_HASH_{i+1}</span>
                    <span>{hash}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2 text-[11px] font-mono text-[#89D7B7]">
                <Server className="w-3.5 h-3.5 text-[#89D7B7]" />
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
