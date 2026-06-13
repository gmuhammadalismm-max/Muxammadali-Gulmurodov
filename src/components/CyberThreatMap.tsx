/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, ShieldAlert, Cpu, RefreshCw, Terminal, Activity, Globe } from "lucide-react";
import { ThreatEvent } from "../types";

const INITIAL_FEEDS: ThreatEvent[] = [
  { id: "1", time: "06:42:15", source: "Hong Kong (IP: 142.12.98.x)", target: "Tashkent Core (IP: 95.205.11.x)", attackType: "Brute Force Protection Shield", severity: "medium", direction: "Inbound" },
  { id: "2", time: "06:43:02", source: "Frankfurt (IP: 82.16.205.x)", target: "SEO API Server (IP: 185.105.4.x)", attackType: "Botnet Header Scanning Intercepted", severity: "low", direction: "Inbound" },
  { id: "3", time: "06:44:21", source: "Silicon Valley (IP: 104.28.3.x)", target: "AI Agent Node 4 (IP: 45.1.18.x)", attackType: "API Rate-Limit Spike (DDoS Bypass Blocked)", severity: "high", direction: "Inbound" },
  { id: "4", time: "06:45:10", source: "Tashkent Core (IP: 95.205.11.x)", target: "Unknown External PhishHost", attackType: "PhishDetector Auto Alert Sandbox", severity: "high", direction: "Outbound" },
];

const ATTACK_TYPES = [
  "DDoS Attack Vectors Mitigation",
  "Phishing Domain Extraction Blocking",
  "Unauthorized SQLi Interception",
  "XSS Attack Heuristic Defense",
  "Secure JWT Forgery Detection",
  "C2 Backdoor Callback Filtered",
  "SMTP Malware Spam Hook Quarantined",
];

const CITIES = [
  { name: "Tashkent", x: 190, y: 120, pulse: true },
  { name: "Samarkand", x: 155, y: 150 },
  { name: "Andijan", x: 230, y: 100 },
  { name: "Yevropa Node", x: 80, y: 70 },
  { name: "AQSH Markazi", x: 30, y: 90 },
  { name: "Osiyo Hub", x: 270, y: 140 },
];

export default function CyberThreatMap() {
  const [feeds, setFeeds] = useState<ThreatEvent[]>(INITIAL_FEEDS);
  const [activeScan, setActiveScan] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [stats, setStats] = useState({ intercepted: 14280, activeFirewalls: 18, shieldPower: 99.8 });
  const terminalContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll terminal logs within the terminal feed box
  useEffect(() => {
    if (terminalContainerRef.current) {
      terminalContainerRef.current.scrollTo({
        top: terminalContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [feeds, scanLogs]);

  // Listen to manual threat triggers from Admin Panel
  useEffect(() => {
    const handleAdminThreat = (e: Event) => {
      const customEvent = e as CustomEvent<ThreatEvent>;
      if (customEvent.detail) {
        setFeeds((prev) => [customEvent.detail, ...prev.slice(0, 15)]);
        setStats((prev) => ({
          ...prev,
          intercepted: prev.intercepted + 1,
          shieldPower: parseFloat((99.1 + Math.random() * 0.4).toFixed(2))
        }));
      }
    };
    window.addEventListener("gmuhammadali-threat", handleAdminThreat);
    return () => window.removeEventListener("gmuhammadali-threat", handleAdminThreat);
  }, []);

  // Periodic threat generator feed mimicking real cyber threat activity
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(" ")[0];
      const sourceIP = `${Math.floor(Math.random() * 210) + 10}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.x`;
      const targetIP = `95.205.${Math.floor(Math.random() * 50) + 10}.${Math.floor(Math.random() * 254)}`;
      const randomCities = ["London", "Seoul", "Warsaw", "Tokyo", "Singapore", "New York", "Berlin"];
      const randomTarget = ["Tashkent Backup Node", "AI Marketing Engine API", "Personal Auth Node", "PhishDetector DB"];
      
      const newThreat: ThreatEvent = {
        id: Math.random().toString(),
        time: timeStr,
        source: `${randomCities[Math.floor(Math.random() * randomCities.length)]} (IP: ${sourceIP})`,
        target: `${randomTarget[Math.floor(Math.random() * randomTarget.length)]} (IP: ${targetIP})`,
        attackType: ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)],
        severity: Math.random() > 0.7 ? "high" : Math.random() > 0.4 ? "medium" : "low",
        direction: Math.random() > 0.85 ? "Outbound" : "Inbound",
      };

      setFeeds((prev) => [newThreat, ...prev.slice(0, 15)]);
      
      // Update stats slightly
      setStats((prev) => ({
        intercepted: prev.intercepted + (Math.random() > 0.4 ? 1 : 0),
        activeFirewalls: Math.random() > 0.95 ? prev.activeFirewalls + (Math.random() > 0.5 ? 1 : -1) : prev.activeFirewalls,
        shieldPower: parseFloat((99.5 + Math.random() * 0.4).toFixed(2)),
      }));
    }, 3800);

    return () => clearInterval(timer);
  }, []);

  const triggerDiagnosticScan = () => {
    if (activeScan) return;
    setActiveScan(true);
    setScanProgress(0);
    setScanLogs([
      "⚡ Kiber-audit IDS (Intrusion Detection System) ishga tushirildi...",
      "🔍 Barcha portlar holatini tekshirish: 80, 443, 3000, 8080...",
      "🛡️ SSL/TLS sertifikat shifrlanish ko'rsatkichlari: ECDHE-RSA-AES256-GCM-SHA384... MUKAMMAL.",
      "🟢 PhishDetector integratsiya bazasini tekshirish... 224,912 marta analiz qilingan.",
    ]);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setActiveScan(false);
            setStats(p => ({ ...p, shieldPower: 100 }));
          }, 1000);
          return 100;
        }
        
        const nextProgress = prev + 10;
        
        // Add random log steps based on progress
        if (nextProgress === 20) {
          setScanLogs(l => [...l, "🕵️‍♂️ Doimiy sinov hujumlari simulyatsiyasi boshlandi (SQL Hacking vectors)..."]);
        } else if (nextProgress === 50) {
          setScanLogs(l => [...l, "🧠 AI tahdid tahlilchisi (Gemini Security Layer) fon rejimida ulandi."]);
        } else if (nextProgress === 70) {
          setScanLogs(l => [...l, "🛡️ Tashkent Core routerlarida xavf darajasi: 0.01% (Zararsiz)"]);
        } else if (nextProgress === 90) {
          setScanLogs(l => [...l, "✅ Tizim xavfsizlik konfiguratsiyasi optimal holatda! Hech qanday sizib chiqish aniqlanmadi."]);
        }
        
        return nextProgress;
      });
    }, 350);
  };

  return (
    <div id="threat-map-section" className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-950/80 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md shadow-2xl shadow-nyanza/5">
      
      {/* Visual Live Cyber-Grid Map on Left */}
      <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-6">
        <div>
          <div className="flex items-center space-x-2 text-nyanza font-mono text-xs tracking-wider uppercase mb-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-nyanza opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-nyanza"></span>
            </span>
            <span>Real vaqtdagi tahdidlar tahlili</span>
          </div>
          <h3 className="text-xl font-semibold text-slate-100 font-display tracking-tight">
            🌍 Live Cyber Threat Map
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            Muxammadali tomonidan sozlangan simulyativ monitoring tizimi va virtual xavfsizlik boshqaruv paneli.
          </p>
        </div>

        {/* Dynamic Map Visualizer */}
        <div className="relative w-full h-64 md:h-80 bg-slate-950 rounded-xl border border-slate-900 overflow-hidden flex items-center justify-center">
          
          {/* Cyberpunk Radar Lines Backdrop */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(3, 86, 197, 0.15)_0%,transparent_70%)] animate-pulse" />
          <div className="absolute inset-x-0 top-0 h-px bg-slate-900 border-dashed border-b" />
          <div className="absolute inset-y-0 left-0 w-px bg-slate-900 border-dashed border-r" />
          <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-800/40" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-800/40" />
          
          {/* Scanning radar sweep animation */}
          <div className="absolute w-full h-full border border-slate-900 rounded-full scale-[0.6] opacity-30" />
          <div className="absolute w-full h-full border border-slate-900 rounded-full scale-[0.3] opacity-50" />
          <div className="absolute left-1/2 top-1/2 w-48 h-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-nyanza/10" />
          <div className="absolute left-1/2 top-1/2 w-80 h-80 -translate-x-1/2 -translate-y-1/2 rounded-full border border-nyanza/5" />
          
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <Globe className="w-64 h-64 text-nyanza animate-[spin_40s_linear_infinite]" />
          </div>

          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 200">
            {/* Connection Vector Lines */}
            {feeds.slice(0, 3).map((f, i) => {
              const targetNode = CITIES[0]; // Always targets Tashkent core
              const sourceNode = CITIES[(i + 1) % CITIES.length];
              const isHigh = f.severity === "high";
              return (
                <g key={f.id}>
                  <motion.path
                    d={`M ${sourceNode.x} ${sourceNode.y} Q ${(sourceNode.x + targetNode.x)/2} ${(sourceNode.y + targetNode.y)/2 - 20}, ${targetNode.x} ${targetNode.y}`}
                    fill="none"
                    stroke={isHigh ? "#ef4444" : "#06b6d4"}
                    strokeWidth="1.2"
                    strokeDasharray="4 3"
                    initial={{ strokeDashoffset: 40 }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                  />
                  {/* Glowing core attacking light projectile */}
                  <motion.circle
                    r="3"
                    fill={isHigh ? "#ef4444" : "#22d3ee"}
                    initial={{ offset: 0 }}
                    animate={{ x: [sourceNode.x, targetNode.x], y: [sourceNode.y, targetNode.y] }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut", delay: i * 0.4 }}
                  />
                </g>
              );
            })}

            {/* Static & Pulse Nodes */}
            {CITIES.map((c, i) => (
              <g key={c.name} id={`map-node-${i}`}>
                {c.pulse && (
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r="8"
                    fill="#10b981"
                    className="opacity-30 animate-ping"
                  />
                )}
                <circle
                  cx={c.x}
                  cy={c.y}
                  r="4"
                  fill={c.pulse ? "#10b981" : "#475569"}
                  className="shadow-md"
                />
                <text
                  x={c.x + 6}
                  y={c.y + 3}
                  fill={c.pulse ? "#10b981" : "#94a3b8"}
                  fontSize="7"
                  fontFamily="monospace"
                  className="font-bold pointer-events-none select-none"
                >
                  {c.name}
                </text>
              </g>
            ))}
          </svg>

          {/* Quick Stats Overlaid */}
          <div className="absolute bottom-2 left-3 flex space-x-4 bg-slate-950/90 border border-slate-900 px-3 py-1.5 rounded-md backdrop-blur-sm">
            <div className="text-center">
              <span className="text-[9px] text-slate-500 block uppercase font-mono">Qo'lga Olingan</span>
              <span className="text-xs font-semibold text-nyanza font-mono">{stats.intercepted.toLocaleString()}</span>
            </div>
            <div className="w-px bg-slate-900" />
            <div className="text-center">
              <span className="text-[9px] text-slate-500 block uppercase font-mono">Xavfsizlik darajasi</span>
              <span className="text-xs font-semibold text-nyanza font-mono">{stats.shieldPower}%</span>
            </div>
          </div>
          
          {/* Active sweeping analyzer visualizer overlay */}
          {activeScan && (
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[1px] flex flex-col justify-center items-center px-4">
              <div className="w-full max-w-xs space-y-3">
                <div className="flex justify-between items-center text-xs font-mono text-nyanza">
                  <span className="flex items-center gap-1.5 animate-pulse">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    KIBER-SCAN...
                  </span>
                  <span>{scanProgress}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                  <motion.div
                    className="bg-gradient-to-r from-nyanza to-slate-green h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${scanProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-mono text-center truncate">
                  {scanLogs[scanLogs.length - 1] || "Sozlamalarni tekshirish..."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Defence Launch Action */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-mono">
            <ShieldCheck className="w-4 h-4 text-nyanza" />
            <span>IDS Firewall holati:</span>
            <span className="text-nyanza font-bold uppercase animate-pulse">Aktiv</span>
          </div>
          <button
            onClick={triggerDiagnosticScan}
            disabled={activeScan}
            id="defend-scan-btn"
            className="flex items-center space-x-2 font-mono text-xs px-4 py-2 border rounded-full bg-nyanza/10 border-nyanza hover:bg-nyanza hover:text-slate-950 text-nyanza hover:shadow-lg hover:shadow-nyanza/20 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Cpu className={`w-3.5 h-3.5 ${activeScan ? 'animate-spin' : ''}`} />
            <span>XAVFSIZLIK TIZIMINI SCAN QILISH</span>
          </button>
        </div>
      </div>

      {/* Cyber Real-Time Terminal Log Stream on Right */}
      <div id="threat-log-terminal" className="lg:col-span-5 flex flex-col h-full bg-slate-950 rounded-xl border border-slate-900 p-4 font-mono select-text text-xs justify-between min-h-[350px]">
        
        {/* Terminal Header */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-900 text-slate-500 mb-2">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            <span className="text-[10px] uppercase font-semibold text-slate-400 pl-1">IDS_IPS_SHELL: active</span>
          </div>
          <Terminal className="w-3.5 h-3.5 text-slate-600" />
        </div>

        {/* Logs Feed Scroller */}
        <div ref={terminalContainerRef} className="flex-1 overflow-y-auto max-h-[260px] space-y-3 scrollbar-thin scrollbar-thumb-slate-900 pr-1 text-[11px] leading-relaxed">
          
          <div className="text-slate-500 text-[10px] border-b border-slate-950 pb-1 mb-1">
            [SYSINFO] Connection established to Tashkent main API node (Status: Secure)
          </div>

          <AnimatePresence initial={false}>
            {feeds.map((f) => {
              const isHigh = f.severity === "high";
              const isMed = f.severity === "medium";
              const sevColor = isHigh ? "text-rose-500" : isMed ? "text-amber-500" : "text-sky-400";
              const sevLabel = isHigh ? "ALERT" : isMed ? "WARN" : "INFO";

              return (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-l-2 pl-2 border-slate-800 hover:bg-slate-900/40 py-1 rounded-r transition-colors"
                >
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>[{f.time}]</span>
                    <span className={`font-bold ${sevColor}`}>[{sevLabel}]</span>
                  </div>
                  <div className="text-slate-300 mt-0.5">
                    <span className="text-slate-500">{f.direction === "Inbound" ? "📥" : "📤"} Manba:</span> {f.source}
                  </div>
                  <div className="text-slate-300">
                    <span className="text-slate-500">🛡️ Natija:</span> <span className="text-nyanza">{f.attackType}</span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Interactive Diagnostic Scan Logs Stream */}
        {scanLogs.length > 0 && (
          <div className="mt-2 pt-2 border-t border-slate-900 bg-slate-900/20 rounded p-1.5 space-y-1 text-[10px] text-nyanza max-h-[80px] overflow-y-auto">
            {scanLogs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-1">
                <span>&gt;</span>
                <span className="text-slate-300">{log}</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
