"use client";

import { useEffect, useState } from "react";
import GlitchText from "@/components/GlitchText";
import CollabCursors from "@/components/CollabCursors";

export default function Hero() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className="relative flex flex-col items-center w-full bg-[#0A0A0A] py-16 px-6 md:py-[100px] md:px-[120px] overflow-hidden">
      {/* Badge */}
      <div className="flex items-center justify-center gap-[8px] h-[32px] px-[12px] md:px-[16px] bg-[#1A1A1A] border-2 border-[#FF6B35]">
        <div className="w-[8px] h-[8px] bg-[#FF6B35] shrink-0" />
        <span className="font-ibm-mono text-[9px] md:text-[11px] font-bold text-[#FF6B35] tracking-[1px] md:tracking-[2px] whitespace-nowrap">
          [NEW] // VERSION 2.0 NOW LIVE
        </span>
      </div>

      <div className="h-8 md:h-[32px]" />

      {/* Headline */}
      <h1 className="font-grotesk text-[clamp(32px,10vw,96px)] font-bold text-[#F5F5F0] tracking-[-1px] leading-none text-center w-full max-w-[1100px]">
        <GlitchText text="AUTOMATE WITHOUT" speed={45} delay={100} />
        <br />
        <GlitchText text="LIMITS." speed={45} delay={400} />
      </h1>
      <h1 className="font-grotesk text-[clamp(32px,10vw,96px)] font-bold text-[#FF6B35] tracking-[-1px] leading-none text-center w-full max-w-[1100px]">
        <GlitchText text="LOGIC-PERFECT." speed={45} delay={700} />
      </h1>

      <div className="h-8 md:h-[32px]" />

      {/* Subheading */}
      <p className="font-ibm-mono text-[13px] md:text-[15px] text-[#888888] tracking-[1px] leading-[1.6] text-center w-full max-w-[800px]">
        THE INDUSTRIAL-GRADE WORKFLOW ENGINE FOR BUILDERS WHO DON&apos;T
        COMPROMISE.
        <br />
        FROM NODE 01 TO PRODUCTION EXECUTION.
      </p>

      <div className="h-10 md:h-[48px]" />

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-[16px] w-full sm:w-auto">
        <a href="/workflows" className="flex items-center justify-center w-full sm:w-[220px] h-[56px] bg-[#FF6B35] hover:bg-[#e6c200] transition-colors">
          <span className="font-grotesk text-[12px] font-bold text-[#0A0A0A] tracking-[2px]">
            START AUTOMATING
          </span>
        </a>
        <a href="https://github.com/Mansur00015/3X3CUT0R" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full sm:w-[200px] h-[56px] bg-[#0A0A0A] border-2 border-[#3D3D3D] hover:border-[#888888] transition-colors">
          <span className="font-ibm-mono text-[12px] text-[#888888] tracking-[2px]">
            VIEW GITHUB &gt;
          </span>
        </a>
      </div>

      <div className="h-6 md:h-[24px]" />

      <p className="font-ibm-mono text-[11px] text-[#555555] tracking-[2px] text-center">
        NO CREDIT CARD // FREE FOREVER PLAN // 10,000+ BUILDERS
      </p>

      <div className="h-12 md:h-[64px]" />

      {/* Animated Design Interface */}
      <div
        className="w-full max-w-[1100px] bg-[#0F0F0F] overflow-hidden"
        style={{ border: "2px solid #2D2D2D" }}
      >
        <DesignInterfaceSVG mounted={mounted} />
      </div>

      {/* Collab cursors on the full hero */}
      <CollabCursors />
    </section>
  );
}

/* ──────────────────────────────── SVG ──────────────────────────────── */

const layers = [
  { label: "FRAME / HERO", color: "#FF6B35", indent: 0, active: true },
  { label: "NAVBAR", color: "#888", indent: 12 },
  { label: "HEADLINE", color: "#4ADE80", indent: 12 },
  { label: "SUBTEXT", color: "#888", indent: 12 },
  { label: "CTA GROUP", color: "#FF6B35", indent: 12 },
  { label: "BTN / PRIMARY", color: "#FF6B35", indent: 24 },
  { label: "BTN / GHOST", color: "#888", indent: 24 },
  { label: "MEDIA BLOCK", color: "#60A5FA", indent: 12 },
  { label: "FOOTER", color: "#888", indent: 0 },
];

const inspectProps = [
  { key: "W", val: "1100px" },
  { key: "H", val: "580px" },
  { key: "X", val: "0" },
  { key: "Y", val: "0" },
  { key: "FILL", val: "#0F0F0F", swatch: "#0F0F0F" },
  { key: "BORDER", val: "#FF6B35", swatch: "#FF6B35" },
  { key: "RADIUS", val: "0px" },
  { key: "OPACITY", val: "100%" },
];

const tokens = [
  { name: "primary", hex: "#FF6B35" },
  { name: "accent", hex: "#FF6B35" },
  { name: "surface", hex: "#111111" },
  { name: "text", hex: "#F5F5F0" },
  { name: "muted", hex: "#555555" },
];

const codeLines = [
  { w: 80, color: "#4ADE80", x: 325 },
  { w: 140, color: "#60A5FA", x: 345 },
  { w: 100, color: "#888", x: 355 },
  { w: 120, color: "#FF6B35", x: 345 },
  { w: 90, color: "#888", x: 355 },
  { w: 160, color: "#4ADE80", x: 355 },
  { w: 80, color: "#888", x: 345 },
  { w: 110, color: "#60A5FA", x: 325 },
];

const handles: [number, number][] = [
  [280, 90], [570, 90], [860, 90],
  [280, 280], [860, 280],
  [280, 470], [570, 470], [860, 470],
];

const tickerItems = [
  "BUTTON", "INPUT", "CARD", "MODAL", "BADGE",
  "TOOLTIP", "TOGGLE", "SLIDER", "TABLE", "NAVBAR",
];

function DesignInterfaceSVG({ mounted }: { mounted: boolean }) {
  return (
    <>
      {/* Global CSS keyframes for SVG animations */}
      <style>{`
        @keyframes hero-blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes hero-scan { 0%{transform:translateY(-580px)} 100%{transform:translateY(580px)} }
        @keyframes hero-pulse { 0%,100%{opacity:0.3} 50%{opacity:1} }
        @keyframes hero-ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-700px)} }
        .hero-cursor { animation: hero-blink 1.1s step-end infinite; }
        .hero-scan { animation: hero-scan 4s linear infinite; }
        .hero-pulse { animation: hero-pulse 2s ease-in-out infinite; }
        .hero-ticker-track { animation: hero-ticker 14s linear infinite; }
      `}</style>

      <svg viewBox="0 0 1100 580" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", width: "100%", height: "auto" }}>
        <rect width="1100" height="580" fill="#0F0F0F" />

        {/* Scanline Effect */}
        <rect className="hero-scan" x="0" y="0" width="1100" height="6" fill="rgba(255,107,53,0.03)" />

        {/* Grid Dots */}
        <g fill="#1A1A1A">
          {Array.from({ length: 22 }, (_, c) =>
            Array.from({ length: 12 }, (_, r) => (
              <circle key={`d${c}-${r}`} cx={c * 50 + 25} cy={r * 50 + 25} r="1" />
            ))
          )}
        </g>

        {/* ================= LEFT PANEL (NODES) ================= */}
        <rect x="0" y="0" width="200" height="580" fill="#111111" />
        <line x1="200" y1="0" x2="200" y2="580" stroke="#2D2D2D" strokeWidth="1" />

        {/* Panel Header */}
        <rect x="0" y="0" width="200" height="36" fill="#161616" />
        <text x="12" y="23" fontFamily="monospace" fontSize="9" fill="#FF6B35" letterSpacing="2" fontWeight="700">NODES</text>
        <text x="176" y="23" fontFamily="monospace" fontSize="12" fill="#444">+</text>

        {/* Node List Items */}
        <g fontFamily="monospace" fontSize="9">
          {/* Trigger Node */}
          <rect x="0" y="44" width="200" height="32" fill="#1E1E1E" /><rect x="0" y="44" width="2" height="32" fill="#FF6B35" />
          <circle cx="20" cy="60" r="3" fill="#FF6B35" opacity="0.8" /><text x="32" y="64" fill="#F5F5F0">TRIGGER / WEBHOOK</text>

          {/* Action Nodes */}
          <circle cx="32" cy="92" r="3" fill="#60A5FA" opacity="0.8" /><text x="44" y="96" fill="#888">HTTP REQUEST</text>
          <circle cx="32" cy="124" r="3" fill="#4ADE80" opacity="0.8" /><text x="44" y="128" fill="#888">FILTER / IF</text>
          <circle cx="32" cy="156" r="3" fill="#FFD600" opacity="0.8" /><text x="44" y="160" fill="#F5F5F0">CODE / JS</text>
          <circle cx="32" cy="188" r="3" fill="#A78BFA" opacity="0.8" /><text x="44" y="192" fill="#888">DATABASE</text>
          <circle cx="32" cy="220" r="3" fill="#60A5FA" opacity="0.8" /><text x="44" y="224" fill="#888">EMAIL</text>
          <circle cx="32" cy="252" r="3" fill="#888" opacity="0.8" /><text x="44" y="256" fill="#555">NOTION</text>
          <circle cx="32" cy="284" r="3" fill="#888" opacity="0.8" /><text x="44" y="288" fill="#555">SLACK</text>
          <circle cx="32" cy="316" r="3" fill="#4ADE80" opacity="0.8" /><text x="44" y="320" fill="#888">DELAY</text>
          <circle cx="32" cy="348" r="3" fill="#FF6B35" opacity="0.8" /><text x="44" y="352" fill="#F5F5F0">MERGE</text>
        </g>

        {/* ================= RIGHT PANEL (PROPERTIES) ================= */}
        <rect x="899" y="0" width="201" height="580" fill="#111111" />
        <line x1="899" y1="0" x2="899" y2="580" stroke="#2D2D2D" strokeWidth="1" />
        <rect x="899" y="0" width="201" height="36" fill="#161616" />
        <text x="912" y="23" fontFamily="monospace" fontSize="9" fill="#FF6B35" letterSpacing="2" fontWeight="700">PROPERTIES</text>

        {/* Selected Node: CODE / JS */}
        <rect x="899" y="44" width="201" height="28" fill="#1A1A1A" />
        <text x="912" y="62" fontFamily="monospace" fontSize="9" fill="#F5F5F0">Selected: CODE / JS</text>

        {/* Property Rows */}
        <g fontFamily="monospace" fontSize="8">
          <text x="912" y="100" fill="#555">NAME</text>
          <rect x="970" y="91" width="110" height="12" fill="#1E1E1E" rx="1" />
          <text x="980" y="100" fill="#888">transform_data</text>

          <text x="912" y="126" fill="#555">LANGUAGE</text>
          <rect x="970" y="117" width="110" height="12" fill="#1E1E1E" rx="1" />
          <text x="980" y="126" fill="#4ADE80">JavaScript</text>

          <text x="912" y="152" fill="#555">INPUT</text>
          <rect x="970" y="143" width="110" height="12" fill="#1E1E1E" rx="1" />
          <text x="980" y="152" fill="#888">$input.data</text>

          <text x="912" y="178" fill="#555">OUTPUT</text>
          <rect x="970" y="169" width="110" height="12" fill="#1E1E1E" rx="1" />
          <text x="980" y="178" fill="#FF6B35">$output.data</text>
        </g>

        {/* Separator + VARS */}
        <line x1="899" y1="210" x2="1100" y2="210" stroke="#222" strokeWidth="1" />
        <text x="912" y="232" fontFamily="monospace" fontSize="9" fill="#FF6B35" letterSpacing="2" fontWeight="700">ENVIRONMENT</text>
        <g fontFamily="monospace" fontSize="8">
          <text x="912" y="258" fill="#555">NODE_ENV</text><text x="970" y="258" fill="#4ADE80">production</text>
          <text x="912" y="284" fill="#555">API_KEY</text><text x="970" y="284" fill="#FF6B35">••••••••••</text>
          <text x="912" y="310" fill="#555">EXEC_ID</text><text x="970" y="310" fill="#888">wf_3x3_001</text>
        </g>

        {/* ================= CENTER CANVAS (WORKFLOW) ================= */}
        {/* Toolbar */}
        <rect x="200" y="0" width="700" height="36" fill="#141414" />
        <line x1="200" y1="36" x2="900" y2="36" stroke="#2D2D2D" strokeWidth="1" />
        <g fontFamily="monospace">
          <rect x="218" y="9" width="18" height="18" rx="2" fill="#FF6B35" />
          <text x="223" y="22" fontSize="9" fill="#0A0A0A" fontWeight="700">V</text>
          <rect x="246" y="9" width="18" height="18" rx="2" fill="#1E1E1E" />
          <text x="251" y="22" fontSize="9" fill="#444">P</text>
          <rect x="274" y="9" width="18" height="18" rx="2" fill="#1E1E1E" />
          <text x="279" y="22" fontSize="9" fill="#444">C</text>
          <line x1="310" y1="11" x2="310" y2="25" stroke="#2D2D2D" strokeWidth="1" />
          <text x="326" y="23" fontSize="9" fill="#555" letterSpacing="1">WORKFLOW: EXECUTOR v1</text>
        </g>

        {/* Rulers */}
        <rect x="200" y="36" width="700" height="16" fill="#131313" />
        <g fontFamily="monospace" fontSize="6" fill="#333">
          <rect x="220" y="36" width="1" height="8" fill="#2A2A2A" /><text x="222" y="50">20</text>
          <rect x="260" y="36" width="1" height="4" fill="#2A2A2A" />
          <rect x="280" y="36" width="1" height="8" fill="#2A2A2A" /><text x="282" y="50">40</text>
          <rect x="320" y="36" width="1" height="4" fill="#2A2A2A" />
          <rect x="340" y="36" width="1" height="8" fill="#2A2A2A" /><text x="342" y="50">60</text>
        </g>

        {/* ================= WORKFLOW NODES & CONNECTIONS ================= */}
        {/* Connection Lines */}
        <g fill="none" stroke="#555555" strokeWidth="2" opacity="0.6">
          <path d="M 440 250 C 480 250, 480 150, 520 150" />
          <path d="M 440 250 C 480 250, 480 350, 520 350" />
          <path d="M 720 150 L 760 150" />
          <path d="M 720 350 L 760 350" />
        </g>

        {/* Animated flow dots */}
        <g fill="#FF6B35">
          <circle r="3"><animateMotion dur="3s" repeatCount="indefinite" path="M 440 250 C 480 250, 480 150, 520 150" /></circle>
          <circle r="3"><animateMotion dur="3.5s" repeatCount="indefinite" path="M 440 250 C 480 250, 480 350, 520 350" /></circle>
          <circle r="3"><animateMotion dur="2s" repeatCount="indefinite" path="M 720 150 L 760 150" /></circle>
          <circle r="3"><animateMotion dur="2.5s" repeatCount="indefinite" path="M 720 350 L 760 350" /></circle>
        </g>

        {/* Node: Trigger (Webhook) */}
        <g>
          <rect x="240" y="220" width="200" height="60" rx="6" fill="#1A1A1A" stroke="#FF6B35" strokeWidth="1.5" />
          <circle cx="260" cy="240" r="8" fill="#FF6B35" />
          <text x="262" y="244" fontFamily="monospace" fontSize="7" fill="#0A0A0A" fontWeight="700" textAnchor="middle">W</text>
          <text x="280" y="244" fontFamily="monospace" fontSize="9" fill="#F5F5F0">Webhook</text>
          <text x="260" y="266" fontFamily="monospace" fontSize="7" fill="#555">POST /api/v1/trigger</text>
          <rect x="435" y="245" width="10" height="10" rx="2" fill="#FF6B35" />
        </g>

        {/* Node: Filter / IF */}
        <g>
          <rect x="520" y="120" width="200" height="60" rx="6" fill="#1A1A1A" stroke="#4ADE80" strokeWidth="1.5" />
          <circle cx="540" cy="140" r="8" fill="#4ADE80" />
          <text x="542" y="144" fontFamily="monospace" fontSize="7" fill="#0A0A0A" fontWeight="700" textAnchor="middle">F</text>
          <text x="560" y="144" fontFamily="monospace" fontSize="9" fill="#F5F5F0">Filter</text>
          <text x="540" y="166" fontFamily="monospace" fontSize="7" fill="#555">data.status === "active"</text>
          <rect x="515" y="145" width="10" height="10" rx="2" fill="#4ADE80" />
          <rect x="715" y="145" width="10" height="10" rx="2" fill="#4ADE80" />
        </g>

        {/* Node: Code / JS */}
        <g>
          <rect x="520" y="320" width="200" height="60" rx="6" fill="#1A1A1A" stroke="#FFD600" strokeWidth="2" />
          <circle cx="540" cy="340" r="8" fill="#FFD600" />
          <text x="542" y="344" fontFamily="monospace" fontSize="7" fill="#0A0A0A" fontWeight="700" textAnchor="middle">{`{ }`}</text>
          <text x="560" y="344" fontFamily="monospace" fontSize="9" fill="#F5F5F0">Code / JS</text>
          <text x="540" y="366" fontFamily="monospace" fontSize="7" fill="#555">return {`{ modified: data }`}</text>
          <rect x="515" y="345" width="10" height="10" rx="2" fill="#FFD600" />
          <rect x="715" y="345" width="10" height="10" rx="2" fill="#FFD600" />
        </g>

        {/* Node: Email */}
        <g>
          <rect x="760" y="120" width="130" height="60" rx="6" fill="#1A1A1A" stroke="#60A5FA" strokeWidth="1.5" />
          <circle cx="780" cy="140" r="8" fill="#60A5FA" />
          <text x="782" y="144" fontFamily="monospace" fontSize="7" fill="#0A0A0A" fontWeight="700" textAnchor="middle">@</text>
          <text x="800" y="144" fontFamily="monospace" fontSize="9" fill="#F5F5F0">Send Email</text>
          <text x="780" y="166" fontFamily="monospace" fontSize="7" fill="#555">user@...com</text>
          <rect x="755" y="145" width="10" height="10" rx="2" fill="#60A5FA" />
        </g>

        {/* Node: Merge */}
        <g>
          <rect x="760" y="320" width="130" height="60" rx="6" fill="#1A1A1A" stroke="#A78BFA" strokeWidth="1.5" />
          <circle cx="780" cy="340" r="8" fill="#A78BFA" />
          <text x="782" y="344" fontFamily="monospace" fontSize="7" fill="#0A0A0A" fontWeight="700" textAnchor="middle">M</text>
          <text x="800" y="344" fontFamily="monospace" fontSize="9" fill="#F5F5F0">Database</text>
          <text x="780" y="366" fontFamily="monospace" fontSize="7" fill="#555">Notion Sync</text>
          <rect x="755" y="345" width="10" height="10" rx="2" fill="#A78BFA" />
        </g>

        {/* ================= BOTTOM STATUS BAR & TICKER ================= */}
        <line x1="200" y1="514" x2="900" y2="514" stroke="#2D2D2D" strokeWidth="1" />

        {/* Execution Ticker (Animated) */}
        <rect x="200" y="515" width="700" height="32" fill="#0F0F0F" />
        <clipPath id="tickerClip"><rect x="200" y="515" width="700" height="32" /></clipPath>
        <g clipPath="url(#tickerClip)">
          <g className="hero-ticker-track">
            <circle cx="220" cy="531" r="3" fill="#4ADE80" opacity="0.8" /><text x="230" y="535" fontFamily="monospace" fontSize="8" fill="#888">Webhook</text>
            <circle cx="290" cy="531" r="3" fill="#FF6B35" opacity="0.8" /><text x="300" y="535" fontFamily="monospace" fontSize="8" fill="#888">Filter</text>
            <circle cx="360" cy="531" r="3" fill="#4ADE80" opacity="0.8" /><text x="370" y="535" fontFamily="monospace" fontSize="8" fill="#888">Code</text>
            <circle cx="430" cy="531" r="3" fill="#60A5FA" opacity="0.8" /><text x="440" y="535" fontFamily="monospace" fontSize="8" fill="#888">Email</text>
            <circle cx="500" cy="531" r="3" fill="#FF6B35" opacity="0.8" /><text x="510" y="535" fontFamily="monospace" fontSize="8" fill="#888">Merge</text>
            <circle cx="570" cy="531" r="3" fill="#4ADE80" opacity="0.8" /><text x="580" y="535" fontFamily="monospace" fontSize="8" fill="#888">Webhook</text>
            <circle cx="640" cy="531" r="3" fill="#FF6B35" opacity="0.8" /><text x="650" y="535" fontFamily="monospace" fontSize="8" fill="#888">Filter</text>
            <circle cx="710" cy="531" r="3" fill="#4ADE80" opacity="0.8" /><text x="720" y="535" fontFamily="monospace" fontSize="8" fill="#888">Code</text>
            <circle cx="780" cy="531" r="3" fill="#60A5FA" opacity="0.8" /><text x="790" y="535" fontFamily="monospace" fontSize="8" fill="#888">Email</text>
          </g>
        </g>

        {/* Execution Status Bar */}
        <line x1="200" y1="547" x2="900" y2="547" stroke="#222" strokeWidth="1" />
        <rect x="200" y="548" width="700" height="32" fill="#0D0D0D" />

        <circle className="hero-pulse" cx="220" cy="564" r="4" fill="#4ADE80" />
        <text x="232" y="568" fontFamily="monospace" fontSize="8" fill="#555" letterSpacing="1">EXECUTING</text>

        <text x="330" y="568" fontFamily="monospace" fontSize="8" fill="#333">NODES: 5</text>
        <text x="430" y="568" fontFamily="monospace" fontSize="8" fill="#333">MEM: 24MB</text>
        <text x="530" y="568" fontFamily="monospace" fontSize="8" fill="#333">LAST RUN: 0.4s</text>
        <text x="660" y="568" fontFamily="monospace" fontSize="8" fill="#333">LOG: SUCCESS</text>

        {/* Corner Branding Accents */}
        <rect x="200" y="548" width="6" height="6" fill="#FF6B35" opacity="0.5" />
        <rect x="894" y="548" width="6" height="6" fill="#FF6B35" opacity="0.4" />
      </svg>
    </>
  );
}
