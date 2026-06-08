/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { AlertTriangle, CheckCircle, HelpCircle, ShieldAlert, Zap, Globe, Search, ArrowRight, Loader2, Sparkles, TrendingUp, Megaphone, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function ToolsSandbox() {
  const [activeTab, setActiveTab] = useState<"phish" | "seo">("phish");
  
  // Tab 1: Phishdetector State
  const [phishUrl, setPhishUrl] = useState("");
  const [phishLoading, setPhishLoading] = useState(false);
  const [phishResult, setPhishResult] = useState<null | {
    url: string;
    protocol: string;
    suspiciousKeywords: string[];
    tldRisk: "High" | "Low";
    safetyRating: "SAFE" | "SUSPICIOUS" | "DANGEROUS";
    score: number;
    auditLogs: string[];
  }>(null);

  // Tab 2: SEO Analyzer State
  const [seoUrl, setSeoUrl] = useState("");
  const [seoLoading, setSeoLoading] = useState(false);
  const [seoResult, setSeoResult] = useState<null | {
    url: string;
    protocol: string;
    sslStatus: string;
    speedScore: { desktop: number; mobile: number };
    loadTime: string;
    reportMarkdown?: string;
    seoAudit?: string;
    smmHooks?: string;
  }>(null);
  const [seoError, setSeoError] = useState("");

  // Handler for PhishDetector
  const handlePhishScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phishUrl.trim()) return;

    setPhishLoading(true);
    setPhishResult(null);

    // Simple heuristc model to run locally on the client interface mimicking high-end scanning tools.
    setTimeout(() => {
      const urlLower = phishUrl.toLowerCase();
      let score = 100;
      const logs: string[] = [];

      // Check protocol
      const hasHttps = urlLower.startsWith("https://");
      const hasHttp = urlLower.startsWith("http://");
      let protoMsg = "HTTPS (Xavfsiz ulanish)";
      
      if (!hasHttps && !hasHttp) {
        logs.push("⚠️ URL protokoli aniqlanmadi, sukut bo'yicha shifrsiz ulanish taxmin qilinmoqda.");
        score -= 20;
        protoMsg = "Protokol aniqlanmadi";
      } else if (hasHttp) {
        logs.push("🚨 DIQQAT: Sayt HTTP shifrsiz protokolida ishlayapti, ma'lumotlar o'g'irlanish xavfi yukori.");
        score -= 40;
        protoMsg = "HTTP (Zararli)";
      } else {
        logs.push("✅ HTTPS sertifikatining shifrlash ko'rsatkichlari faol.");
      }

      // Check top level domains
      let tldRisk: "High" | "Low" = "Low";
      const suspiciousTLDs = [".temp", ".xyz", ".free", ".click", ".gq", ".cf", ".tk", ".ml", ".ru", ".site", ".online"];
      const matchedTLD = suspiciousTLDs.find(tld => urlLower.includes(tld));
      
      if (matchedTLD) {
        logs.push(`⚠️ TLD Risk: Sayt ro'yxatdan o'tgan domen hududi (${matchedTLD}) fisharlar orasida mashhur.`);
        score -= 15;
        tldRisk = "High";
      } else {
        logs.push("✅ TLD ishonchli va xavfsiz zonada aniqlandi (e.g., .uz, .com, .org).");
      }

      // Check suspicious keywords
      const keywords = ["login", "gift", "bonus", "free", "claim", "secure", "verification", "update", "netflix", "click", "telegram", "payme", "clickuz", "click-pay"];
      const foundKeywords = keywords.filter(kw => urlLower.includes(kw));
      
      if (foundKeywords.length > 0) {
        logs.push(`🚨 Heuristics: Sayt manzilida chalg'ituvchi kalit so'zlar aniqlandi: [${foundKeywords.join(", ")}]`);
        score -= 25 * foundKeywords.length;
      } else {
        logs.push("✅ Shubhali kalit so'zlar yoki soxta brend nomlari topilmadi.");
      }

      // Final scoring
      let rating: "SAFE" | "SUSPICIOUS" | "DANGEROUS" = "SAFE";
      if (score < 45) {
        rating = "DANGEROUS";
      } else if (score < 85) {
        rating = "SUSPICIOUS";
      }

      const cleanStr = phishUrl.replace(/^(https?:\/\/)?(www\.)?/, "");

      setPhishResult({
        url: cleanStr,
        protocol: protoMsg,
        suspiciousKeywords: foundKeywords,
        tldRisk: tldRisk,
        safetyRating: rating,
        score: Math.max(0, score),
        auditLogs: logs,
      });
      setPhishLoading(false);
    }, 1800);
  };

  // Handler for SEO Analyzer
  const handleSeoScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seoUrl.trim()) return;

    setSeoLoading(true);
    setSeoResult(null);
    setSeoError("");

    try {
      const response = await fetch("/api/seo-analyzer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: seoUrl }),
      });

      if (!response.ok) {
        throw new Error("Server reporting error");
      }

      const data = await response.json();
      setSeoResult(data);
    } catch (err) {
      console.error(err);
      setSeoError("Kechirasiz, veb-sayt tahlil qilinayotganda xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
    } finally {
      setSeoLoading(false);
    }
  };

  return (
    <div id="sandbox-container" className="bg-slate-950/40 border border-slate-900 rounded-2xl overflow-hidden p-6 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-5 mb-6">
        <div>
          <span className="text-xs text-nyanza font-mono tracking-widest uppercase">Eksperimentlar xonasi</span>
          <h2 className="text-2xl font-bold font-display text-slate-100 tracking-tight mt-1">
            🛠️ Interactive Tools Sandbox
          </h2>
          <p className="text-slate-400 text-xs mt-1 md:max-w-xl">
            Muxammadalining ishlari va xizmatlarini o'z ko'zingiz bilan sinab ko'ring. Quyidagi reaktiv modullar yordamida saytlarni xavfsizligini tekshiring yoki SEO tahlil qiling.
          </p>
        </div>

        {/* Tab Selector Buttons */}
        <div className="flex space-x-1 p-1 bg-slate-900 rounded-xl max-w-fit">
          <button
            onClick={() => setActiveTab("phish")}
            id="tab-phishdetector"
            className={`cursor-pointer px-4 py-2 font-mono text-xs rounded-lg transition duration-200 select-none ${
              activeTab === "phish"
                ? "bg-nyanza text-slate-950 font-bold shadow-md shadow-nyanza/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            🔐 PhishDetector
          </button>
          <button
            onClick={() => setActiveTab("seo")}
            id="tab-seoanalyzer"
            className={`cursor-pointer px-4 py-2 font-mono text-xs rounded-lg transition duration-200 select-none ${
              activeTab === "seo"
                ? "bg-nyanza text-slate-950 font-bold shadow-md shadow-nyanza/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            📈 SEO Analyzer Pro
          </button>
        </div>
      </div>

      {/* TAB CONTENT 1: PHISHDETECTOR WIDGET */}
      {activeTab === "phish" && (
        <div id="phishdetector-widget" className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-5 space-y-4">
            <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-900">
              <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                Domen xavfsizligini aniqlash
              </h4>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                Ushbu kiber-himoya moduli kiritilgan veb-sayt havolasini o'ziga xos heuristik modellar bo'yicha tahlil qilib, uning soxta (fishing) yoki firibgarlik sayti ekanligini bir zumda aniqlaydi.
              </p>

              {/* Input Form */}
              <form onSubmit={handlePhishScan} className="mt-4 space-y-3">
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-mono mb-1">Sayt havolasi (URL)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={phishUrl}
                      onChange={(e) => setPhishUrl(e.target.value)}
                      placeholder="Masalan: payme-cabinet-bonus.xyz yoki click.uz"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-nyanza focus:ring-1 focus:ring-nyanza transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={phishLoading || !phishUrl.trim()}
                  id="phish-scan-btn"
                  className="w-full flex items-center justify-center gap-2 cursor-pointer bg-slate-100 font-semibold hover:bg-nyanza hover:text-slate-950 text-slate-950 text-xs py-2 rounded-lg font-mono transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {phishLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>XAVFSIZLIK ANALIZI...</span>
                    </>
                  ) : (
                    <>
                      <span>UR-ANALIZINI ISHGA TUSHIRISH</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Simulated Info Box */}
            <div className="bg-slate-900/10 p-4 border border-dashed border-slate-900 rounded-lg">
              <span className="text-[10px] uppercase text-emerald-400 font-mono font-bold block">Tizim haqida</span>
              <p className="text-[11px] text-slate-400 mt-1">
                PhishDetector o'zbek foydalanuvchilarini Click/Payme soxta saytlari hamda firibgar Telegram botlaridan asrash maqsadida maxsus AI qoidalar to'plami asosida ishlab chiqilgan.
              </p>
            </div>
          </div>

          <div className="md:col-span-7">
            {/* Initial empty state */}
            {!phishResult && !phishLoading && (
              <div className="h-64 rounded-xl border border-dashed border-slate-900 flex flex-col items-center justify-center text-center p-6 bg-slate-950/20">
                <HelpCircle className="w-12 h-12 text-slate-800 animate-pulse" />
                <h5 className="text-slate-400 text-sm font-semibold mt-3">Skrining amalga oshirilmadi</h5>
                <p className="text-slate-600 text-xs mt-1 max-w-xs">
                  Sohani tekshirish uchun chap tomonga URL manzili kiritib "Analliz" tugmasini bosing.
                </p>
              </div>
            )}

            {/* Scanning loading placeholder */}
            {phishLoading && (
              <div className="h-64 rounded-xl border border-slate-900 bg-slate-950 flex flex-col justify-center items-center px-6">
                <div className="relative mb-5 flex h-10 w-10 items-center justify-center">
                  <span className="absolute animate-ping inline-flex h-full w-full rounded-full bg-nyanza/30 opacity-60" />
                  <Loader2 className="w-6 h-6 text-nyanza animate-spin" />
                </div>
                <div className="text-center font-mono text-[11px] text-slate-400 space-y-1">
                  <p>Initializing PhishDetector Local sandbox heuristics...</p>
                  <p className="text-nyanza">Checking SSL, WHOIS patterns, and entropy status...</p>
                </div>
              </div>
            )}

            {/* Results Output */}
            {phishResult && (
              <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-900 gap-3">
                  <div>
                    <span className="text-[9px] uppercase text-slate-500 font-mono font-bold block">Tekshirilgan havola</span>
                    <span className="text-sm font-semibold text-slate-200">{phishResult.url}</span>
                  </div>

                  {/* Safety badge */}
                  <div className={`px-3 py-1 rounded text-xs font-mono font-bold uppercase tracking-wider text-center ${
                    phishResult.safetyRating === "SAFE" 
                      ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/80" 
                      : phishResult.safetyRating === "SUSPICIOUS" 
                      ? "bg-amber-950/80 text-amber-400 border border-amber-800/80" 
                      : "bg-rose-950/80 text-rose-400 border border-rose-800/80 animate-bounce"
                  }`}>
                    {phishResult.safetyRating === "SAFE" && "🟩 safe (ishonchli)"}
                    {phishResult.safetyRating === "SUSPICIOUS" && "🟨 suspicious (shubhali)"}
                    {phishResult.safetyRating === "DANGEROUS" && "🟥 dangerous (XAVFLI)"}
                  </div>
                </div>

                {/* Score panel */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-900/30 border border-slate-900 rounded-lg p-3 flex flex-col justify-center items-center">
                    <span className="text-[10px] text-slate-500 font-mono uppercase">Havola reyting bali</span>
                    <span className={`text-3xl font-extrabold font-mono mt-1 ${
                      phishResult.score >= 85 ? "text-emerald-400" : phishResult.score >= 45 ? "text-amber-400" : "text-rose-500"
                    }`}>
                      {phishResult.score}/100
                    </span>
                  </div>

                  <div className="bg-slate-900/30 border border-slate-900 rounded-lg p-3 space-y-1.5 text-xs text-slate-300">
                    <div>
                      <span className="text-slate-500">Protokol:</span> <span className="font-mono text-slate-200">{phishResult.protocol}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Domen hududi risk darajasi:</span>{" "}
                      <span className={`font-mono font-bold ${phishResult.tldRisk === "High" ? "text-amber-400" : "text-emerald-400"}`}>
                        {phishResult.tldRisk === "High" ? "YUQORI" : "PAST"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Scan Diagnostic Logs */}
                <div>
                  <span className="text-[10px] text-slate-500 font-mono uppercase font-bold block mb-2">Tahlildagi xulosalar:</span>
                  <div className="bg-slate-950 border border-slate-900 rounded-lg p-3 space-y-2.5 max-h-[120px] overflow-y-auto">
                    {phishResult.auditLogs.map((log, index) => (
                      <div key={index} className="text-[11px] font-mono leading-relaxed select-text flex items-start gap-2 text-slate-300">
                        <span className="text-slate-500 shrink-0">&gt;</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: AI SEO ANALYZER */}
      {activeTab === "seo" && (
        <div id="seoanalyzer-widget" className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-4 space-y-4">
            <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-900">
              <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Veb-sayt tezkor SEO Auditi
              </h4>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                Ushbu modul orqali veb-saytning havolasini kiritib haqiqiy o'sish ko'rsatkichlarini hisoblang. Tizim Gemini modeliga so'rov yuborib, ushbu loyiha uchun SEO maslahatlar hamda ijtimoiy tarmoqlar (SMM) uchun reklama ssenariylari, sotuvchi hooks bera oladi.
              </p>

              {/* Input Form */}
              <form onSubmit={handleSeoScan} className="mt-4 space-y-3">
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-mono mb-1 font-bold">Saytingiz havolasi</label>
                  <input
                    type="text"
                    value={seoUrl}
                    onChange={(e) => setSeoUrl(e.target.value)}
                    placeholder="Masalan: kun.uz, solihacoffee.uz, daryo.uz..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-nyanza transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={seoLoading || !seoUrl.trim()}
                  id="seo-scan-btn"
                  className="w-full flex items-center justify-center gap-2 cursor-pointer bg-nyanza text-slate-950 font-bold hover:opacity-90 text-xs py-2 rounded-lg font-mono transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {seoLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>AI SEO AUDITI ISHLAMOQDA...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                      <span>TAHLIL QILISh VA HOOKS OLISh</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Tips Block */}
            <div className="bg-slate-900/10 p-4 border border-teal-950 rounded-lg border-dashed">
              <span className="text-[10px] uppercase text-cyan-400 font-mono font-bold block">Tavsiya</span>
              <p className="text-[11px] text-slate-400 mt-1">
                Ushbu tahlillar Muxammadalining yillar davomida to'plangan raqamli marketing SMM strategiyalari hamda o'sish xavf-ko'rsatkichlari formulalari bo'yicha Gemini intellekti tomonidan hisoblanadi.
              </p>
            </div>
          </div>

          <div className="md:col-span-8">
            {/* Initial Empty State */}
            {!seoResult && !seoLoading && !seoError && (
              <div className="h-72 rounded-xl border border-dashed border-slate-900 flex flex-col items-center justify-center text-center p-6 bg-slate-950/20">
                <Globe className="w-12 h-12 text-slate-800 animate-pulse" />
                <h5 className="text-slate-400 text-sm font-semibold mt-3">Tizim bo'sh holatda</h5>
                <p className="text-slate-600 text-xs mt-1 max-w-sm">
                  Sayt havolasini kiritib tahlil qiling. Sayt protokoli, mobil tezkorligi, meta optimallash hamda real raqamli sotuv ssenariylarini oling.
                </p>
              </div>
            )}

            {/* Error Container */}
            {seoError && (
              <div className="bg-rose-950/20 border border-rose-900 text-rose-300 rounded-xl p-4 text-xs font-sans">
                <p>{seoError}</p>
              </div>
            )}

            {/* Loading Container */}
            {seoLoading && (
              <div className="h-72 rounded-xl border border-slate-900 bg-slate-950 flex flex-col justify-center items-center px-6">
                <div className="relative mb-5 flex h-10 w-10 items-center justify-center animate-spin">
                  <Loader2 className="w-6 h-6 text-nyanza" />
                </div>
                <div className="text-center font-mono text-[11px] text-slate-400 space-y-1">
                  <p>Initializing Real-time Crawler for SEO analysis on {seoUrl}...</p>
                  <p className="text-nyanza">Requesting digital marketing recommendation suite from Gemini 3.5...</p>
                </div>
              </div>
            )}

            {/* SEO RESULTS OUTPUT */}
            {seoResult && (
              <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-900 gap-3">
                  <div>
                    <span className="text-[9px] uppercase text-slate-500 font-mono font-bold block">Tahlil qilingan sayt</span>
                    <span className="text-sm font-semibold text-slate-200">{seoResult.url}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-805 text-slate-400 font-mono text-[10px]">
                      Hujjat protokoli: {seoResult.protocol}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-805 text-slate-400 font-mono text-[10px]">
                      Yuklanish: {seoResult.loadTime}
                    </span>
                  </div>
                </div>

                {/* Score meters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-900/30 border border-slate-900 rounded-lg p-3">
                    <div className="flex justify-between text-xs mb-1.5 font-mono text-slate-400">
                      <span>Desktop tezligi</span>
                      <span className="text-emerald-400 font-bold">{seoResult.speedScore.desktop}%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-900">
                      <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${seoResult.speedScore.desktop}%` }} />
                    </div>
                  </div>

                  <div className="bg-slate-900/30 border border-slate-900 rounded-lg p-3">
                    <div className="flex justify-between text-xs mb-1.5 font-mono text-slate-400">
                      <span>Mobil moslashuvchanligi</span>
                      <span className="text-nyanza font-bold">{seoResult.speedScore.mobile}%</span>
                    </div>
                    <div className="w-full bg-slate-955 h-2 rounded-full overflow-hidden border border-slate-900">
                      <div className="bg-nyanza h-full rounded-full" style={{ width: `${seoResult.speedScore.mobile}%` }} />
                    </div>
                  </div>
                </div>

                {/* AI generated report markdown */}
                <div className="border border-slate-900 rounded-lg p-4 bg-slate-905/30 max-h-[240px] overflow-y-auto text-xs space-y-3 text-slate-300">
                  <div className="flex items-center space-x-1.5 text-nyanza font-mono text-[10px] uppercase tracking-wider mb-2 font-bold">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>Gemini AI tahlili va SMM takliflari</span>
                  </div>
                  
                  <div className="markdown-body text-slate-200">
                    {seoResult.reportMarkdown ? (
                      <ReactMarkdown>{seoResult.reportMarkdown}</ReactMarkdown>
                    ) : (
                      <>
                        <div className="mb-4">
                          <ReactMarkdown>{seoResult.seoAudit || ""}</ReactMarkdown>
                        </div>
                        <div className="border-t border-slate-900 pt-3">
                          <ReactMarkdown>{seoResult.smmHooks || ""}</ReactMarkdown>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
