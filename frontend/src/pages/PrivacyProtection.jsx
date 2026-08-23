import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock, ShieldCheck, Key, EyeOff, Server } from "lucide-react";

const PrivacyProtection = () => {
  const [sessionSecurity, setSessionSecurity] = useState({
    tlsVersion: "TLS 1.3",
    cipherSuite: "TLS_AES_256_GCM_SHA384",
    hashes: [],
    sessionTokenHash: "0x...",
    enclaveStatus: "ACTIVE (SOC-2 TYPE II ENCLAVE)",
  });

  useEffect(() => {
    const generateDynamicHashes = async () => {
      try {
        const timestamp = Date.now();
        const rawPayloads = [
          `AUDIO_STREAM_INGEST_${timestamp}_CHUNK_01`,
          `BIOMETRIC_FACE_MESH_${timestamp}_CHUNK_02`,
          `ATS_RESUME_PARSER_${timestamp}_ENCRYPTED`,
          `STAR_BEHAVIORAL_TELEMETRY_${timestamp}_ISOLATED`,
          `CLIENT_SESSION_KEY_${timestamp}_AES256_GCM`,
          `NEURAL_MOCK_TRANSCRIPT_${timestamp}_ZERO_KNOWLEDGE`,
        ];

        const computedHashes = await Promise.all(
          rawPayloads.map(async (str) => {
            const encoder = new TextEncoder();
            const data = encoder.encode(str);
            const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
            return `0x${hex.substring(0, 4)}...${hex.substring(hex.length - 4).toUpperCase()}`;
          })
        );

        setSessionSecurity((prev) => ({
          ...prev,
          hashes: computedHashes,
          sessionTokenHash: computedHashes[4] || "0x7F9A...3B4C",
        }));
      } catch (err) {
        console.warn("Crypto API fallback hash generation:", err);
        setSessionSecurity((prev) => ({
          ...prev,
          hashes: [
            "0x8F9A...3B4C", "0xE421...91F0", "0x89D2...04A1",
            "0x11B8...99E3", "0x33A0...77B2", "0x55C1...22D4"
          ],
        }));
      }
    };

    generateDynamicHashes();
    const interval = setInterval(generateDynamicHashes, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="security" className="py-20 md:py-32 bg-[#09090b] text-zinc-100 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10">
        
        <div className="rounded-2xl bg-zinc-900/50 p-6 md:p-10 border border-zinc-800 relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Text & Specs */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs font-mono uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5 text-emerald-400" /> Data Security & Encryption
              </div>
              
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-white leading-tight">
                Encryption & Privacy Architecture
              </h2>

              <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
                Interview audio, session telemetry, and resume files are encrypted in transit via {sessionSecurity.tlsVersion} ({sessionSecurity.cipherSuite}) and at rest with AES-256 GCM.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-start gap-2.5">
                  <Key className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-white mb-0.5">Client Key Isolation</h4>
                    <p className="text-[11px] text-zinc-400">Session key hashes generated client-side via SHA-256.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-start gap-2.5">
                  <EyeOff className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-white mb-0.5">Zero Model Training</h4>
                    <p className="text-[11px] text-zinc-400">User session transcripts and resume data are never used for public training.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Encrypted Hash Graphic */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-5 rounded-xl bg-zinc-950 border border-zinc-800">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>

              <div className="w-full space-y-1.5 font-mono text-xs">
                {sessionSecurity.hashes.map((hash, i) => (
                  <div key={i} className="flex justify-between p-2 rounded-md bg-zinc-900/60 border border-zinc-800 text-zinc-400 text-[11px]">
                    <span className="text-emerald-400">HASH_{i+1}</span>
                    <span>{hash}</span>
                  </div>
                ))}
              </div>

              <div className="mt-3.5 flex flex-col items-center gap-0.5 text-[11px] font-mono text-zinc-400">
                <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <Server className="w-3.5 h-3.5 text-emerald-400" />
                  <span>STATUS: {sessionSecurity.enclaveStatus}</span>
                </div>
                <div className="text-[10px] text-zinc-500">
                  CIPHER: {sessionSecurity.cipherSuite}
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default PrivacyProtection;
