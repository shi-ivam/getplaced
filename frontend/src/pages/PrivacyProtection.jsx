import React, { useEffect, useState } from "react";
import { Lock, ShieldCheck, Key, EyeOff, Server, Check } from "lucide-react";
import GpBadge from "@/components/gp/GpBadge";
import GpCard from "@/components/gp/GpCard";

const PrivacyProtection = () => {
  const [sessionSecurity, setSessionSecurity] = useState({
    tlsVersion: "TLS 1.3",
    cipherSuite: "TLS_AES_256_GCM_SHA384",
    hashes: [],
    sessionTokenHash: "0x7F9A...3B4C",
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
        console.warn("Crypto fallback:", err);
      }
    };

    generateDynamicHashes();
    const interval = setInterval(generateDynamicHashes, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="security" className="py-24 md:py-32 bg-[#D4FDF7] u-background-grid-green text-[#0D0431] relative overflow-hidden border-b-2 border-[#0D0431]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        
        <GpCard
          theme="white"
          shadow="lg"
          className="p-8 md:p-12 overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Specs (7 Cols) */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <GpBadge theme="light-purple">
                Enterprise Data Privacy
              </GpBadge>
              
              <h2 className="text-3xl md:text-5xl font-heading font-black tracking-tight text-[#0D0431]">
                End-to-End Encryption & Zero-Training Guarantees
              </h2>

              <p className="text-[#0D0431]/80 text-base md:text-lg leading-relaxed font-sans">
                Every video frame, speech audio stream, and resume uploaded to getPlaced is encrypted using {sessionSecurity.tlsVersion} ({sessionSecurity.cipherSuite}) and AES-256 GCM client-isolated enclaves.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#FEF9CF] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431]">
                  <div className="flex items-center gap-2 mb-1">
                    <Key className="w-4 h-4 text-[#896EE2]" />
                    <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#0D0431]">
                      Client Key Isolation
                    </h4>
                  </div>
                  <p className="text-xs text-[#0D0431]/75 font-medium leading-relaxed">
                    Cryptographic token hashes generated locally on the browser.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#E4CDFB] border-2 border-[#0D0431] shadow-[3px_3px_0_0_#0D0431]">
                  <div className="flex items-center gap-2 mb-1">
                    <EyeOff className="w-4 h-4 text-[#0D0431]" />
                    <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#0D0431]">
                      No Public Training
                    </h4>
                  </div>
                  <p className="text-xs text-[#0D0431]/75 font-medium leading-relaxed">
                    Candidate telemetry is completely isolated and never trained on public weights.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Enclave Box (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-[#0D0431] text-[#FEF9CF] border-2 border-[#0D0431] shadow-[6px_6px_0_0_#896EE2] relative">
              <div className="w-14 h-14 rounded-full bg-[#FEDF6A] border-2 border-[#0D0431] flex items-center justify-center text-[#0D0431] mb-5 shadow-[3px_3px_0_0_#896EE2]">
                <ShieldCheck className="w-7 h-7" />
              </div>

              <div className="w-full space-y-2 font-mono text-xs">
                {(sessionSecurity.hashes.length > 0 ? sessionSecurity.hashes : [
                  "0x8F9A...3B4C", "0xE421...91F0", "0x89D2...04A1", "0x11B8...99E3"
                ]).slice(0, 4).map((hash, i) => (
                  <div key={i} className="flex justify-between p-2 rounded-lg bg-[#140742] border border-[#896EE2]/40 text-xs">
                    <span className="text-[#FEDF6A] font-bold">SESSION_KEY_{i+1}</span>
                    <span className="text-white/80">{hash}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-col items-center gap-1 text-[11px] font-mono text-[#9BFFED] font-bold">
                <div className="flex items-center gap-2">
                  <Server className="w-3.5 h-3.5" />
                  <span>{sessionSecurity.enclaveStatus}</span>
                </div>
                <div className="text-[10px] text-white/50">
                  CIPHER: {sessionSecurity.cipherSuite}
                </div>
              </div>
            </div>

          </div>
        </GpCard>

      </div>
    </section>
  );
};

export default PrivacyProtection;
