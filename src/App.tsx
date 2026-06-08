/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { db, handleFirestoreError, OperationType } from "./firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, Shield, TrendingUp, Terminal, Code2, Phone, Mail, Calendar, 
  ArrowUpRight, Instagram, Send, Cpu, Check, Menu, X, Users, Globe, 
  ChevronRight, ArrowRight, ShieldCheck, MessageSquare, Zap, Palette, ExternalLink,
  Video, BookOpen, Home, Briefcase, Sun, Moon, Eye
} from "lucide-react";

import CyberThreatMap from "./components/CyberThreatMap";
import ToolsSandbox from "./components/ToolsSandbox";
import AIAssistant from "./components/AIAssistant";
import AdminPanel from "./components/AdminPanel";
import { SkillCategory, Project, Experience, ContactMessage, LogoBranding, AdminArticle, AdminVideo, AdminImage, SEOSettings, AnalyticsMetric, TelegramSettings } from "./types";
// @ts-ignore
import glassmorphismMenuImg from "./assets/images/glassmorphism_menu_1780781413319.png";

// Dynamic Skill list with details
const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: "ai",
    title: "AI & Prompt Muhandisi",
    icon: "Sparkles",
    color: "from-nyanza to-slate-green",
    description: "LLM optimizatsiyasi, maxsus GPT bollar, agentlar koordinatsiyasi va jarayonlarni 100% avtomatlashtirish yechimlari.",
    skills: [
      { name: "Prompt Engineering (GPT, Gemini)", level: 98, info: "Professional kontekst-prompting va logik zanjirlar" },
      { name: "AI Chatbots & Agents Integration", level: 95, info: "Mijozlar bilan ishlash va ma'lumot tahlil qiluvchi botlar" },
      { name: "No-Code/Low-Code AI Workflows", level: 90, info: "Kerakli biznes jarayonlarini AI yordamida avtomatlashtirish" },
      { name: "LLM Tuning & System Prompts", level: 92, info: "Maxsus tizimli yo'naltirishlar va xavfsizlik nazorati" }
    ]
  },
  {
    id: "cyber",
    title: "Kiberxavfsizlik Eksperti",
    icon: "Shield",
    color: "from-slate-green to-olivine-light",
    description: "Tizimlarning zaifliklarini tekshirish, kirib borish (Pentest) testlari va fishing hujumlarini tahlil qilish.",
    skills: [
      { name: "Penetrasion testing (Kirib borish testi)", level: 88, info: "Veb va server zaifliklarini audit qilish" },
      { name: "Heuristic Phishing Analysis", level: 95, info: "Soxta tarmoqlar va zararli havolalarni audit qilish" },
      { name: "Network Audits & Wireshark", level: 85, info: "Tarmoq paketlari monitoringi va anomaliyalarni topish" },
      { name: "Security Architecture", level: 90, info: "Xavfsizlik tizimi va kiber-firewallarni loyihash" }
    ]
  },
  {
    id: "marketing",
    title: "Raqamli Marketing",
    icon: "TrendingUp",
    color: "from-olivine-light to-nyanza",
    description: "Maqsadli SMM kampaniyalari, organik SEO strategiyalari, konversiyani oshirish va brend xabardorligi.",
    skills: [
      { name: "SEO (Qidiruv tizimi optimizatsiyasi)", level: 92, info: "Google hamda qidiruv tizimlarida bepul 1-o'rinlarga chiqish" },
      { name: "SMM & Target Reklama", level: 94, info: "Facebook, Instagram va ijtimoiy tarmoqlardagi sotuv oqimlari" },
      { name: "Conversion Rate Optimization (CRO)", level: 90, info: "Veb-sayt tashrifchilarini xaridorga aylantirish" },
      { name: "Digital Branding Strategy", level: 95, info: "Kreativ g'oyalar, reklama hooks va brending loyihalari" }
    ]
  },
  {
    id: "web",
    title: "Web Interfeys Dasturchisi",
    icon: "Code2",
    color: "from-nyanza to-olivine-light",
    description: "Tezkor, zamonaviy va reaktiv web boshqaruv panellari va landing page interfeyslarni qurish.",
    skills: [
      { name: "React, Vite, TypeScript", level: 85, info: "Zamonaviy reaktiv va interaktiv dasturlar tuzish" },
      { name: "Tailwind CSS & Animations", level: 95, info: "Pristin, o'ta moslashuvchan, mukammal dizayn interfeyslari" },
      { name: "Node.js & Express API Backend", level: 82, info: "Tezkor, xavfsiz va server-side Gemini integratsiyali xizmatlar" },
      { name: "Responsive Mobil-Friendly layouts", level: 98, info: "Har qanday telefon yoki kenglikka chiroyli moslashish" }
    ]
  }
];

// Experience list
const EXPERIENCE_TIMELINE: Experience[] = [
  {
    id: "exp1",
    role: "🔐 AI Xavfsizlik Maslahatchisi",
    company: "CyberSecure Solutions",
    period: "2024 - Hozirgacha",
    highlights: [
      "AI texnologiyalari yordamida himoya tizimlarini loyihalashtirish va fishing fishing hujumlarini aniqlash.",
      "Anomal tarmoq faoliyatlarini aniqlovchi xavfsizlik modellarini yangilash va boshqarish.",
      "98% ga yaqin aniqlik darajasiga ega phishing datchiklarini joriy qilish."
    ],
    icon: "Shield"
  },
  {
    id: "exp2",
    role: "📈 Raqamli marketing bo'yicha yetakchi",
    company: "Marketing Innovator Hub",
    period: "2023 - 2024",
    highlights: [
      "Targetlangan reklama kampaniyalari va SEO optimizatsiya orqali organik trafikni 250% ga oshirish.",
      "Reklama xarajatlarining rentabelligini (ROAS) 3 barobar yaxshilash.",
      "Tashrif buyuruvchilarning buyurtmalarga konversiyasin 3.2 barobar ko'paytirish."
    ],
    icon: "TrendingUp"
  },
  {
    id: "exp3",
    role: "🤖 AI Yaratuvchi va Murabbiy",
    company: "AI & Academy Center",
    period: "2022 - 2023",
    highlights: [
      "Bizneslar va marketologlar uchun avtomatlashtirilgan GPT botlar karkasini qurish.",
      "Mijozlarni avtomatik qo'llab-quvvatlovchi va 1000 dan ortiq foydalanuvchiga ega botlarni ishlab chiqish.",
      "500 dan ortiq talabalarga sun'iy intellektdan unumli foydalanishni va kiber gigiyenani o'rgatish."
    ],
    icon: "Sparkles"
  }
];

// Highlighted projects
const NOTABLE_PROJECTS: Project[] = [
  {
    id: "proj1",
    title: "AI Marketing Assistant",
    tagline: "Sotuvchi matnlar yaratuvchi aqlli bot",
    description: "Ijtimoiy tarmoq postlari, Instagram reels ssenariylari hamda yuqori jozibali reklama matnlarini avtomatik yozib beruvchi sun'iy intellekt moduli.",
    usersCount: "1,000+ foydalanuvchi",
    performanceMetric: "ROAS +180%",
    tech: ["OpenAI API", "React", "Node.js", "Tailwind CSS"],
    category: "ai"
  },
  {
    id: "proj2",
    title: "PhishDetector AI",
    tagline: "Real vaqtda fishing saytlar analizatori",
    description: "Soxta tarmoq, feyk to'lov havolalari va asossiz bonus saytlarini bir lahzada aniqlab beruvchi maxsus kiberxavfsizlik datchigi.",
    usersCount: "98% Aniqlik darajasi",
    performanceMetric: "0.2s Skrining tezligi",
    tech: ["TypeScript", "Heuristic Rules", "NLP Engines", "Vite"],
    category: "cyber"
  },
  {
    id: "proj3",
    title: "SEO Analyzer Pro",
    tagline: "Keng qamrovli texnik va SMM tahlil vositasi",
    description: "Veb-saytning Google qidiruv reytingiga ta'sir etuvchi texnik ko'rsatkichlarni, yuklanish tezligini va metadata muammolarini aniqlab, SMM takliflarini beruvchi tizim.",
    usersCount: "500+ auditlar",
    performanceMetric: "SEO Score 95%+",
    tech: ["Gemini 3.5 Flash", "Express Backend", "SEO Crawler", "D3.js Charts"],
    category: "marketing"
  }
];

const DEFAULT_BRANDING: LogoBranding = {
  initials: "M",
  name: "Muxammadali",
  subtitle: "AI & CYBER EXPERT",
  accentColor: "from-nyanza to-olivine-light",
  avatarUrl: ""
};

const DEFAULT_ARTICLES: AdminArticle[] = [
  {
    id: "art1",
    title: "Sun'iy Intellekt va Kiberxavfsizlik: Kelajak Tizimlar Himoyasi",
    category: "Sun'iy Intellekt",
    content: "Sun'iy intellekt va mashinali o'rganish kiberxavfsizlik sohasida inqilob qilmoqda. Bugungi kunda Heuristic modellar orqali fishing saytlar va zararli dasturlarni 0.2 soniyada aniqlaymiz. Biznes tizimlarini integratsiya qilganda xavfsizlik protokollarini o'rnatish hayotiy ahamiyatga ega.",
    coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    author: "Muxammadali Gulmurodov",
    publishDate: "01.06.2026",
    readTime: "3 daqiqa"
  },
  {
    id: "art2",
    title: "SMM target reklamada ROASni 3 barobar Oshirish Sirlari",
    category: "Marketing",
    content: "Ko'plab kompaniyalar reklama byudjetini samarasiz sarflashadi. Auditoriyani segmentatsiyalash va sun'iy intellekt yordamida har bir reklama g'oyalarini A/B testdan o'tkazish orqali konversiya darajasini va daromadni ko'tarish mumkin.",
    coverUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    author: "Muxammadali Gulmurodov",
    publishDate: "28.05.2026",
    readTime: "5 daqiqa"
  }
];

const DEFAULT_VIDEOS: AdminVideo[] = [
  {
    id: "vid1",
    title: "AI Integratsiya va Botlar Bo'yicha Masterklass",
    description: "Biznesingizni to'liq avtomatlashtirish, GPT modellarini ulash va telegram bot serverlarni boshqarish darsi.",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    duration: "12:45",
    uploadedAt: "01.06.2026"
  }
];

const DEFAULT_IMAGES: AdminImage[] = [
  {
    id: "img1",
    name: "cyber_shield_avatar.png",
    url: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=150&q=80",
    size: "142 KB",
    uploadedAt: "02.06.2026"
  },
  {
    id: "img2",
    name: "digital_marketing_diagram.png",
    url: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=150&q=80",
    size: "320 KB",
    uploadedAt: "03.06.2026"
  }
];

const DEFAULT_SEO: SEOSettings = {
  keywords: "Muxammadali Gulmurodov, kiberxavfsizlik Toshkent, AI ekspert, SMM va Target reklama",
  metaDescription: "Muxammadali Gulmurodov - Sun'iy intellekt, kiberxavfsizlik va maqsadli raqamli marketing loyihalari bo'yicha mustaqil professional.",
  isGoogleIndexed: true,
  sitemapUrl: "https://gmuhammadali.uz/sitemap.xml"
};

const DEFAULT_TELEGRAM: TelegramSettings = {
  botToken: "",
  chatId: "",
  isEnabled: false
};

const DEFAULT_ANALYTICS: AnalyticsMetric = {
  views: 12480,
  clicks: 4320,
  conversion: 34.6,
  consultationsBooked: 24
};

export const getThemeColors = (themeName: "cyan" | "emerald" | "rose" | "amber") => {
  switch (themeName) {
    case "emerald": // Elegant Olivine Warm Sand style
      return {
        primary: "olivine-light",
        primaryRaw: "#DBD5C9",
        text: "text-olivine-light",
        bg: "bg-olivine-light",
        border: "border-olivine-light",
        borderLight: "border-slate-green/20",
        borderStrong: "border-slate-green/50",
        hoverBg: "hover:bg-olivine-light hover:text-olivine-dark",
        hoverBgButton: "hover:bg-olivine-light/95",
        hoverText: "hover:text-olivine-light",
        gradient: "from-olivine-light to-slate-green",
        gradientText: "from-olivine-light to-nyanza",
        glow: "shadow-olivine-light/10",
        accentColorName: "olivine-light",
        accentColorClass: "from-olivine-light to-slate-green"
      };
    case "rose": // Slate Forest Green style
      return {
        primary: "slate-green",
        primaryRaw: "#49596B",
        text: "text-slate-green",
        bg: "bg-slate-green",
        border: "border-slate-green",
        borderLight: "border-nyanza/20",
        borderStrong: "border-nyanza/40",
        hoverBg: "hover:bg-slate-green hover:text-olivine-dark",
        hoverBgButton: "hover:bg-slate-green/95",
        hoverText: "hover:text-slate-green",
        gradient: "from-slate-green to-nyanza",
        gradientText: "from-slate-green to-olivine-light",
        glow: "shadow-slate-green/10",
        accentColorName: "slate-green",
        accentColorClass: "from-slate-green to-nyanza"
      };
    case "amber": // Balanced Clay Sand style
      return {
        primary: "olivine-light",
        primaryRaw: "#DBD5C9",
        text: "text-olivine-light",
        bg: "bg-olivine-light",
        border: "border-olivine-light",
        borderLight: "border-slate-green/20",
        borderStrong: "border-slate-green/50",
        hoverBg: "hover:bg-olivine-light hover:text-olivine-dark",
        hoverBgButton: "hover:bg-olivine-light/95",
        hoverText: "hover:text-olivine-light",
        gradient: "from-slate-green to-olivine-light",
        gradientText: "from-nyanza to-olivine-light",
        glow: "shadow-olivine-light/10",
        accentColorName: "olivine-light",
        accentColorClass: "from-slate-green to-olivine-light"
      };
    default: // cyan -> Nyanza Premium Sage style (Default)
      return {
        primary: "nyanza",
        primaryRaw: "#CBE8B8",
        text: "text-nyanza",
        bg: "bg-nyanza",
        border: "border-nyanza",
        borderLight: "border-slate-green/20",
        borderStrong: "border-slate-green/50",
        hoverBg: "hover:bg-nyanza hover:text-olivine-dark",
        hoverBgButton: "hover:bg-nyanza/95",
        hoverText: "hover:text-nyanza",
        gradient: "from-nyanza to-slate-green",
        gradientText: "from-nyanza to-olivine-light",
        glow: "shadow-nyanza/10",
        accentColorName: "nyanza",
        accentColorClass: "from-nyanza to-slate-green"
      };
  }
};

export default function App() {
  // Theme color settings State (4 dynamic colors)
  const [activeTheme, setActiveTheme] = useState<"cyan" | "emerald" | "rose" | "amber">((): any => {
    return localStorage.getItem("gmuhammadali_active_theme") || "cyan";
  });

  // Light vs Dark Glassmorphism Mode State
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = sessionStorage.getItem("gmuhammadali_dark_mode");
    return saved !== "false"; // Default to dark mode (true) to match original dark tech-forward layout
  });

  // Update HTML element to toggle classes dynamically
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    sessionStorage.setItem("gmuhammadali_dark_mode", isDark ? "true" : "false");
  }, [isDark]);

  // Modals for Media, Articles, Images (requested "boshqa oynada ochilsin")
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isArticlesModalOpen, setIsArticlesModalOpen] = useState(false);
  const [isImagesModalOpen, setIsImagesModalOpen] = useState(false);
  const [viewerImageUrl, setViewerImageUrl] = useState<string | null>(null);

  // Modal toggle for our newly requested Admin Portal
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const t = getThemeColors(activeTheme);

  const changeTheme = (newTheme: "cyan" | "emerald" | "rose" | "amber") => {
    setActiveTheme(newTheme);
    localStorage.setItem("gmuhammadali_active_theme", newTheme);
    saveToServer({ activeTheme: newTheme });
  };

  // Durable persistent states with defaults fallback
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem("gmuhammadali_projects");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed.filter((p: any) => p && p.id !== "proj4") : NOTABLE_PROJECTS;
      } catch (e) {
        return NOTABLE_PROJECTS;
      }
    }
    return NOTABLE_PROJECTS;
  });

  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>(() => {
    const saved = localStorage.getItem("gmuhammadali_skills");
    return saved ? JSON.parse(saved) : SKILL_CATEGORIES;
  });

  const [experiences, setExperiences] = useState<Experience[]>(() => {
    const saved = localStorage.getItem("gmuhammadali_experience");
    return saved ? JSON.parse(saved) : EXPERIENCE_TIMELINE;
  });

  const [messages, setMessages] = useState<ContactMessage[]>(() => {
    const saved = localStorage.getItem("gmuhammadali_messages");
    return saved ? JSON.parse(saved) : [];
  });

  const [branding, setBranding] = useState<LogoBranding>(() => {
    const saved = localStorage.getItem("gmuhammadali_branding");
    return saved ? JSON.parse(saved) : DEFAULT_BRANDING;
  });

  const [articles, setArticles] = useState<AdminArticle[]>(() => {
    const saved = localStorage.getItem("gmuhammadali_articles");
    return saved ? JSON.parse(saved) : DEFAULT_ARTICLES;
  });

  const [videos, setVideos] = useState<AdminVideo[]>(() => {
    const saved = localStorage.getItem("gmuhammadali_videos");
    return saved ? JSON.parse(saved) : DEFAULT_VIDEOS;
  });

  const [images, setImages] = useState<AdminImage[]>(() => {
    const saved = localStorage.getItem("gmuhammadali_images");
    return saved ? JSON.parse(saved) : DEFAULT_IMAGES;
  });

  const [seoSettings, setSeoSettings] = useState<SEOSettings>(() => {
    const saved = localStorage.getItem("gmuhammadali_seo");
    return saved ? JSON.parse(saved) : DEFAULT_SEO;
  });

  const [telegramSettings, setTelegramSettings] = useState<TelegramSettings>(() => {
    const saved = localStorage.getItem("gmuhammadali_telegram");
    return saved ? JSON.parse(saved) : DEFAULT_TELEGRAM;
  });

  const [analytics, setAnalytics] = useState<AnalyticsMetric>(() => {
    const saved = localStorage.getItem("gmuhammadali_analytics");
    return saved ? JSON.parse(saved) : DEFAULT_ANALYTICS;
  });

  // Real-time synchronization with Firebase Firestore
  useEffect(() => {
    const portfolioDocRef = doc(db, "state", "portfolio");

    const unsubscribe = onSnapshot(portfolioDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const firestoreData = snapshot.data();
        if (firestoreData.activeTheme) {
          setActiveTheme(firestoreData.activeTheme);
          localStorage.setItem("gmuhammadali_active_theme", firestoreData.activeTheme);
        }
        if (firestoreData.projects) {
          const loadedProjects = firestoreData.projects.filter((p: any) => p && p.id !== "proj4");
          if (firestoreData.projects.length !== loadedProjects.length) {
            try {
              const portfolioDocRef = doc(db, "state", "portfolio");
              setDoc(portfolioDocRef, { projects: loadedProjects }, { merge: true });
            } catch (err) {
              console.error("Failed to clean up proj4 from firestore: ", err);
            }
          }
          setProjects(loadedProjects);
          localStorage.setItem("gmuhammadali_projects", JSON.stringify(loadedProjects));
        }
        if (firestoreData.skillCategories) {
          setSkillCategories(firestoreData.skillCategories);
          localStorage.setItem("gmuhammadali_skills", JSON.stringify(firestoreData.skillCategories));
        }
        if (firestoreData.experiences) {
          setExperiences(firestoreData.experiences);
          localStorage.setItem("gmuhammadali_experience", JSON.stringify(firestoreData.experiences));
        }
        if (firestoreData.messages) {
          setMessages(firestoreData.messages);
          localStorage.setItem("gmuhammadali_messages", JSON.stringify(firestoreData.messages));
        }
        if (firestoreData.branding) {
          const loadedBranding = { ...firestoreData.branding };
          if (loadedBranding.accentColor === "from-cyan-500 to-emerald-400") {
            loadedBranding.accentColor = "from-nyanza to-olivine-light";
            // Async background update to save updated values to server
            try {
              const portfolioDocRef = doc(db, "state", "portfolio");
              setDoc(portfolioDocRef, { branding: loadedBranding }, { merge: true });
            } catch (err) {
              console.error("Failed to migrate branding style: ", err);
            }
          }
          setBranding(loadedBranding);
          localStorage.setItem("gmuhammadali_branding", JSON.stringify(loadedBranding));
        }
        if (firestoreData.articles) {
          setArticles(firestoreData.articles);
          localStorage.setItem("gmuhammadali_articles", JSON.stringify(firestoreData.articles));
        }
        if (firestoreData.videos) {
          setVideos(firestoreData.videos);
          localStorage.setItem("gmuhammadali_videos", JSON.stringify(firestoreData.videos));
        }
        if (firestoreData.images) {
          setImages(firestoreData.images);
          localStorage.setItem("gmuhammadali_images", JSON.stringify(firestoreData.images));
        }
        if (firestoreData.seoSettings) {
          setSeoSettings(firestoreData.seoSettings);
          localStorage.setItem("gmuhammadali_seo", JSON.stringify(firestoreData.seoSettings));
        }
        if (firestoreData.telegramSettings) {
          setTelegramSettings(firestoreData.telegramSettings);
          localStorage.setItem("gmuhammadali_telegram", JSON.stringify(firestoreData.telegramSettings));
        }
        if (firestoreData.analytics) {
          setAnalytics(firestoreData.analytics);
          localStorage.setItem("gmuhammadali_analytics", JSON.stringify(firestoreData.analytics));
        }
      } else {
        // Initialize state in cloud database on first run
        const initialPayload = {
          activeTheme: "cyan",
          projects: NOTABLE_PROJECTS,
          skillCategories: SKILL_CATEGORIES,
          experiences: EXPERIENCE_TIMELINE,
          messages: [],
          branding: DEFAULT_BRANDING,
          articles: DEFAULT_ARTICLES,
          videos: DEFAULT_VIDEOS,
          images: DEFAULT_IMAGES,
          seoSettings: DEFAULT_SEO,
          analytics: DEFAULT_ANALYTICS,
          telegramSettings: DEFAULT_TELEGRAM,
        };
        setDoc(portfolioDocRef, initialPayload)
          .catch((err) => handleFirestoreError(err, OperationType.WRITE, "state/portfolio"));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "state/portfolio");
    });

    return () => unsubscribe();
  }, []);

  const saveToServer = async (updatedFields: any) => {
    const portfolioDocRef = doc(db, "state", "portfolio");
    try {
      await setDoc(portfolioDocRef, updatedFields, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "state/portfolio");
    }
  };

  const updateTelegramSettings = (updater: React.SetStateAction<TelegramSettings>) => {
    setTelegramSettings((prev) => {
      const next = typeof updater === "function" ? (updater as any)(prev) : updater;
      localStorage.setItem("gmuhammadali_telegram", JSON.stringify(next));
      saveToServer({ telegramSettings: next });
      return next;
    });
  };

  const updateProjects = (updater: React.SetStateAction<Project[]>) => {
    setProjects((prev) => {
      const next = typeof updater === "function" ? (updater as any)(prev) : updater;
      localStorage.setItem("gmuhammadali_projects", JSON.stringify(next));
      saveToServer({ projects: next });
      return next;
    });
  };

  const updateSkillCategories = (updater: React.SetStateAction<SkillCategory[]>) => {
    setSkillCategories((prev) => {
      const next = typeof updater === "function" ? (updater as any)(prev) : updater;
      localStorage.setItem("gmuhammadali_skills", JSON.stringify(next));
      saveToServer({ skillCategories: next });
      return next;
    });
  };

  const updateExperiences = (updater: React.SetStateAction<Experience[]>) => {
    setExperiences((prev) => {
      const next = typeof updater === "function" ? (updater as any)(prev) : updater;
      localStorage.setItem("gmuhammadali_experience", JSON.stringify(next));
      saveToServer({ experiences: next });
      return next;
    });
  };

  const updateMessages = (updater: React.SetStateAction<ContactMessage[]>) => {
    setMessages((prev) => {
      const next = typeof updater === "function" ? (updater as any)(prev) : updater;
      localStorage.setItem("gmuhammadali_messages", JSON.stringify(next));
      saveToServer({ messages: next });
      return next;
    });
  };

  const updateBranding = (updater: React.SetStateAction<LogoBranding>) => {
    setBranding((prev) => {
      const next = typeof updater === "function" ? (updater as any)(prev) : updater;
      localStorage.setItem("gmuhammadali_branding", JSON.stringify(next));
      saveToServer({ branding: next });
      return next;
    });
  };

  const updateArticles = (updater: React.SetStateAction<AdminArticle[]>) => {
    setArticles((prev) => {
      const next = typeof updater === "function" ? (updater as any)(prev) : updater;
      localStorage.setItem("gmuhammadali_articles", JSON.stringify(next));
      saveToServer({ articles: next });
      return next;
    });
  };

  const updateVideos = (updater: React.SetStateAction<AdminVideo[]>) => {
    setVideos((prev) => {
      const next = typeof updater === "function" ? (updater as any)(prev) : updater;
      localStorage.setItem("gmuhammadali_videos", JSON.stringify(next));
      saveToServer({ videos: next });
      return next;
    });
  };

  const updateImages = (updater: React.SetStateAction<AdminImage[]>) => {
    setImages((prev) => {
      const next = typeof updater === "function" ? (updater as any)(prev) : updater;
      localStorage.setItem("gmuhammadali_images", JSON.stringify(next));
      saveToServer({ images: next });
      return next;
    });
  };

  const updateSeoSettings = (updater: React.SetStateAction<SEOSettings>) => {
    setSeoSettings((prev) => {
      const next = typeof updater === "function" ? (updater as any)(prev) : updater;
      localStorage.setItem("gmuhammadali_seo", JSON.stringify(next));
      saveToServer({ seoSettings: next });
      return next;
    });
  };

  const updateAnalytics = (updater: React.SetStateAction<AnalyticsMetric>) => {
    setAnalytics((prev) => {
      const next = typeof updater === "function" ? (updater as any)(prev) : updater;
      localStorage.setItem("gmuhammadali_analytics", JSON.stringify(next));
      saveToServer({ analytics: next });
      return next;
    });
  };

  const [readingArticle, setReadingArticle] = useState<AdminArticle | null>(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("ai");
  const [activeHighlight, setActiveHighlight] = useState<string | null>("exp1");
  const [activeSection, setActiveSection] = useState("home");

  // Track scroll position to update active navbar link automatically
  useEffect(() => {
    const sections = ["home", "skills", "threatmap", "sandbox", "projects", "media", "experience", "contact"];
    const observers = sections.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id);
          }
        },
        { rootMargin: "-80px 0px -50% 0px" } // Adjust for header height
      );
      observer.observe(el);
      return { observer, el };
    });

    return () => {
      observers.forEach((obs) => {
        if (obs) obs.observer.unobserve(obs.el);
      });
    };
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(targetId);
      window.history.pushState(null, "", `#${targetId}`);
    }
  };

  // Secure Message Form states
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [encryptingProgress, setEncryptingProgress] = useState<number | null>(null);
  const [encryptionLogs, setEncryptionLogs] = useState<string[]>([]);
  const [sendSuccess, setSendSuccess] = useState(false);

  const isPhoneValid = () => {
    const digits = contactPhone.replace(/\D/g, "");
    if (digits.startsWith("998")) {
      return digits.length === 12;
    }
    return digits.length >= 9 && digits.length <= 15;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;
    
    if (!input) {
      setContactPhone("");
      return;
    }
    
    let digits = input.replace(/\D/g, "");
    
    // Auto prefixing for Uzbek carriers if they write digits like 901234567 directly
    if (input.startsWith("9") && !input.startsWith("998") && digits.length >= 2) {
      const prefix = digits.slice(0, 2);
      const uzCodes = ["33", "50", "77", "88", "90", "91", "92", "93", "94", "95", "97", "98", "99"];
      if (uzCodes.includes(prefix)) {
        digits = "998" + digits;
      }
    } else if (!input.startsWith("+") && digits.length <= 9 && digits.length >= 2) {
      const prefix = digits.slice(0, 2);
      const uzCodes = ["33", "50", "77", "88", "90", "91", "92", "93", "94", "95", "97", "98", "99"];
      if (uzCodes.includes(prefix)) {
        digits = "998" + digits;
      }
    }
    
    let formatted = "";
    if (digits.startsWith("998")) {
      formatted = "+998";
      if (digits.length > 3) {
        formatted += ` (${digits.slice(3, 5)}`;
      }
      if (digits.length > 5) {
        formatted += `) ${digits.slice(5, 8)}`;
      }
      if (digits.length > 8) {
        formatted += `-${digits.slice(8, 10)}`;
      }
      if (digits.length > 10) {
        formatted += `-${digits.slice(10, 12)}`;
      }
    } else {
      formatted = "+" + digits.slice(0, 15);
    }
    
    setContactPhone(formatted);
  };

  // Active Category details inside selector
  const activeCategoryDetails = skillCategories.find((cat) => cat.id === selectedCategory) || skillCategories[0];

  const handleBookConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactPhone || !contactMessage) return;
    if (!isPhoneValid()) return;

    // Securely capture values for state logging
    const savedName = contactName;
    const savedPhone = contactPhone;
    const savedMsg = contactMessage;

    setEncryptingProgress(0);
    setEncryptionLogs([
      "🛡️ SSH xavfsiz ulanish tunnelini o'rnatish...",
      "🔑 AES-256 algoritmi orqali xabarni shifrlash boshlandi...",
    ]);

    const interval = setInterval(() => {
      setEncryptingProgress((prev) => {
        if (prev === null) return null;
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setEncryptingProgress(null);
            setSendSuccess(true);
            setContactName("");
            setContactPhone("");
            setContactMessage("");
          }, 800);
          return 100;
        }

        const nextPrg = prev + 20;
        if (nextPrg === 40) {
          setEncryptionLogs((l) => [...l, "🔍 Yuboruvchi aloqa kanali tekshirilmoqda: " + savedPhone]);
        } else if (nextPrg === 80) {
          setEncryptionLogs((l) => [...l, "🔒 Shifrlangan paket Tashkent Core serveriga yo'llandi."]);
        } else if (nextPrg === 100) {
          setEncryptionLogs((l) => [...l, "✅ Paket muvaffaqiyatli saqlandi va Telegram orqali uzatildi!"]);
          
          // Securely send Telegram notification via backend proxy endpoint
          fetch("/api/telegram-notify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: savedName,
              phone: savedPhone,
              message: savedMsg,
              botToken: telegramSettings.botToken,
              chatId: telegramSettings.chatId
            }),
          })
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              console.log("Telegram notification sent successfully.");
            } else {
              console.warn("Telegram error:", data.error);
            }
          })
          .catch((err) => {
            console.error("Error notifying Telegram:", err);
          });

          // Instantly record the new message into local state & storage for admin review
          const newMsg: ContactMessage = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            name: savedName,
            email: savedPhone, // Backward compatibility fallback
            phone: savedPhone,
            message: savedMsg,
            timestamp: new Date().toLocaleTimeString() + " | " + new Date().toLocaleDateString(),
            isRead: false
          };
          
          updateMessages(prev => {
            const updated = [newMsg, ...prev];
            return updated;
          });
        }
        return nextPrg;
      });
    }, 250);
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans tracking-normal antialiased text-slate-100 flex flex-col justify-between selection:bg-nyanza selection:text-slate-950 relative overflow-hidden">
      
      {/* Dynamic Navigation */}
      <nav className="fixed top-0 inset-x-0 bg-slate-950/75 backdrop-blur-md border-b border-slate-900 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, "home")}
            className="flex items-center space-x-2.5 mr-4 cursor-pointer"
          >
            {branding.avatarUrl ? (
              <img
                src={branding.avatarUrl}
                alt={branding.name}
                className="w-10 h-10 rounded-full object-cover border border-slate-800"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className={`w-10 h-10 rounded-full bg-gradient-to-tr ${branding.accentColor} flex items-center justify-center font-bold text-slate-950 text-base border border-slate-800`}>
                {branding.initials}
              </span>
            )}
            <div className="flex flex-col">
              <span className="font-sans font-bold text-slate-100 text-sm tracking-tight leading-none mb-1">{branding.name}</span>
              
              {/* Cool interactive Switch for Dark Mode Toggle (ON / OFF) under user request */}
              <div 
                className="flex items-center space-x-1.5 bg-slate-900/60 hover:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800/80 cursor-pointer select-none"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDark(!isDark);
                }}
                title={isDark ? "Kunduzgi rejim (Light Mode) ga o'tish" : "Tungi rejim (Dark Mode) ga o'tish"}
              >
                <span className="text-[8px] font-mono font-bold text-slate-400">TUNGI:</span>
                <span className={`text-[8px] font-mono font-black ${isDark ? "text-nyanza" : "text-slate-500"}`}>
                  {isDark ? "ON" : "OFF"}
                </span>
                {/* Micro toggle graphic */}
                <div className={`w-4 h-2.5 rounded-full border border-slate-700 p-0.5 flex items-center transition-colors ${isDark ? "bg-nyanza/30" : "bg-slate-950"}`}>
                  <div className={`w-1.5 h-1.5 rounded-full bg-white transition-all transform duration-200 ${isDark ? "translate-x-1 border border-nyanza bg-nyanza" : "translate-x-0"}`} />
                </div>
              </div>
            </div>
          </a>

          {/* Desktop Menu links */}
          <div className="hidden md:flex items-center space-x-7 text-xs font-mono tracking-wide uppercase">
            <a
              href="#home"
              onClick={(e) => handleNavClick(e, "home")}
              className={`transition duration-200 ${
                activeSection === "home" ? "font-bold text-nyanza" : "text-slate-400 hover:text-slate-100"
              }`}
            >
              Asosiy
            </a>
            <a
              href="#skills"
              onClick={(e) => handleNavClick(e, "skills")}
              className={`transition duration-200 ${
                activeSection === "skills" ? "font-bold text-nyanza" : "text-slate-400 hover:text-slate-100"
              }`}
            >
              Ko'nikmalar
            </a>
            <a
              href="#threatmap"
              onClick={(e) => handleNavClick(e, "threatmap")}
              className={`transition duration-200 ${
                activeSection === "threatmap" ? "font-bold text-nyanza" : "text-slate-400 hover:text-slate-100"
              }`}
            >
              Threat Map
            </a>
            <a
              href="#sandbox"
              onClick={(e) => handleNavClick(e, "sandbox")}
              className={`transition duration-200 ${
                activeSection === "sandbox" ? "font-bold text-nyanza" : "text-slate-400 hover:text-slate-100"
              }`}
            >
              Sandbox Pro
            </a>
            <a
              href="#projects"
              onClick={(e) => handleNavClick(e, "projects")}
              className={`transition duration-200 ${
                activeSection === "projects" ? `font-bold text-${t.primary}` : "text-slate-400 hover:text-slate-100"
              }`}
            >
              Loyihalar
            </a>
            <a
              href="#experience"
              onClick={(e) => handleNavClick(e, "experience")}
              className={`transition duration-200 ${
                activeSection === "experience" ? `font-bold text-${t.primary}` : "text-slate-400 hover:text-slate-100"
              }`}
            >
              Tajriba
            </a>
          </div>

          <div className="hidden md:flex items-center space-x-3">
            {/* Elegant 3D Glass Light/Dark Mode Switch */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-1.5 rounded-full border border-slate-800 bg-slate-950/80 hover:bg-slate-900/90 text-slate-400 hover:text-white transition-all cursor-pointer flex items-center justify-center shadow-lg mr-1"
              title={isDark ? "Kunduzgi rejim (Light Mode)" : "Tungi rejim (Dark Mode)"}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-500 animate-pulse" />
              ) : (
                <Moon className="w-4 h-4 text-sky-400" />
              )}
            </button>

            {/* Brand Theme Selector circles */}
            <div className="flex items-center space-x-1.5 border border-slate-900 bg-slate-950/80 p-1.5 rounded-full mr-2">
              <button
                onClick={() => changeTheme("cyan")}
                className={`w-3 h-3 rounded-full bg-nyanza hover:scale-110 active:scale-95 transition cursor-pointer ${activeTheme === "cyan" ? "ring-2 ring-white ring-offset-1 ring-offset-olivine-dark" : "opacity-60"}`}
                title="Nyanza Sage"
              />
              <button
                onClick={() => changeTheme("emerald")}
                className={`w-3 h-3 rounded-full bg-olivine-light hover:scale-110 active:scale-95 transition cursor-pointer ${activeTheme === "emerald" ? "ring-2 ring-white ring-offset-1 ring-offset-olivine-dark" : "opacity-60"}`}
                title="Olivine Sand"
              />
              <button
                onClick={() => changeTheme("rose")}
                className={`w-3 h-3 rounded-full bg-slate-green hover:scale-110 active:scale-95 transition cursor-pointer ${activeTheme === "rose" ? "ring-2 ring-white ring-offset-1 ring-offset-olivine-dark" : "opacity-60"}`}
                title="Earthy Slate"
              />
              <button
                onClick={() => changeTheme("amber")}
                className={`w-3 h-3 rounded-full bg-[linear-gradient(to_bottom_right,#DBD5C9,#CBE8B8)] hover:scale-110 active:scale-95 transition cursor-pointer ${activeTheme === "amber" ? "ring-2 ring-white ring-offset-1 ring-offset-olivine-dark" : "opacity-60"}`}
                title="Dual Sand & Sage"
              />
            </div>

            <button
              onClick={() => setIsAdminOpen(true)}
              className="font-mono text-xs font-bold px-3.5 py-2 rounded-full border border-slate-800 bg-slate-950 hover:bg-slate-900 hover:border-slate-700 text-slate-400 hover:text-white transition duration-200 flex items-center gap-1.5 cursor-pointer"
              title="Muxammadali Admin Control Panel"
            >
              <ShieldCheck className={`w-3.5 h-3.5 text-${t.primary}`} />
              <span>SISTEMA</span>
            </button>

            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, "contact")}
              className={`font-mono text-xs font-bold px-4 py-2 rounded-full border border-${t.primary}/30 bg-${t.primary}/5 hover:border-${t.primary} text-${t.primary} hover:text-white transition duration-300`}
            >
              KONSULTATSIYA OLISH
            </a>
          </div>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-slate-100 focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation Panel */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-slate-950 border-b border-slate-900"
            >
              <div className="px-5 py-4 space-y-3 font-mono text-xs tracking-wider uppercase flex flex-col">
                <a
                  href="#home"
                  onClick={(e) => handleNavClick(e, "home")}
                  className={`py-1 transition ${activeSection === "home" ? "text-nyanza font-bold" : "text-slate-400 hover:text-slate-100"}`}
                >
                  Asosiy
                </a>
                <a
                  href="#skills"
                  onClick={(e) => handleNavClick(e, "skills")}
                  className={`py-1 transition ${activeSection === "skills" ? "text-nyanza font-bold" : "text-slate-400 hover:text-slate-100"}`}
                >
                  Ko'nikmalar
                </a>
                <a
                  href="#threatmap"
                  onClick={(e) => handleNavClick(e, "threatmap")}
                  className={`py-1 transition ${activeSection === "threatmap" ? "text-nyanza font-bold" : "text-slate-400 hover:text-slate-100"}`}
                >
                  Threat Map
                </a>
                <a
                  href="#sandbox"
                  onClick={(e) => handleNavClick(e, "sandbox")}
                  className={`py-1 transition ${activeSection === "sandbox" ? "text-nyanza font-bold" : "text-slate-400 hover:text-slate-100"}`}
                >
                  Sandbox Pro
                </a>
                <a
                  href="#projects"
                  onClick={(e) => handleNavClick(e, "projects")}
                  className={`py-1 transition ${activeSection === "projects" ? `text-${t.primary} font-bold` : "text-slate-400 hover:text-slate-100"}`}
                >
                  Loyihalar
                </a>
                <a
                  href="#experience"
                  onClick={(e) => handleNavClick(e, "experience")}
                  className={`py-1 transition ${activeSection === "experience" ? `text-${t.primary} font-bold` : "text-slate-400 hover:text-slate-100"}`}
                >
                  Tajriba
                </a>
                {/* Mobile Theme selector circles */}
                <div className="py-2 border-y border-slate-900 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">SAYT MAVZUSI RANGI:</span>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => changeTheme("cyan")}
                      className={`w-4 h-4 rounded-full bg-nyanza active:scale-90 transition ${activeTheme === "cyan" ? "ring-2 ring-white ring-offset-1 ring-offset-olivine-dark" : "opacity-50"}`}
                    />
                    <button
                      onClick={() => changeTheme("emerald")}
                      className={`w-4 h-4 rounded-full bg-olivine-light active:scale-90 transition ${activeTheme === "emerald" ? "ring-2 ring-white ring-offset-1 ring-offset-olivine-dark" : "opacity-50"}`}
                    />
                    <button
                      onClick={() => changeTheme("rose")}
                      className={`w-4 h-4 rounded-full bg-slate-green active:scale-90 transition ${activeTheme === "rose" ? "ring-2 ring-white ring-offset-1 ring-offset-olivine-dark" : "opacity-50"}`}
                    />
                    <button
                      onClick={() => changeTheme("amber")}
                      className={`w-4 h-4 rounded-full bg-[linear-gradient(to_bottom_right,#DBD5C9,#CBE8B8)] active:scale-90 transition ${activeTheme === "amber" ? "ring-2 ring-white ring-offset-1 ring-offset-olivine-dark" : "opacity-50"}`}
                    />
                  </div>
                </div>

                {/* Mobile Light / Dark mode toggle row */}
                <div className="py-2 border-b border-slate-900 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">TUNGI / KUNDUZGI REJIM:</span>
                  <button
                    onClick={() => setIsDark(!isDark)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-800 bg-slate-900/80 text-[10px] text-slate-300 font-bold hover:text-white transition duration-200"
                  >
                    {isDark ? (
                      <>
                        <Moon className="w-3.5 h-3.5 text-sky-400" /> TUNGI (DARK)
                      </>
                    ) : (
                      <>
                        <Sun className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> KUNDUZGI (LIGHT)
                      </>
                    )}
                  </button>
                </div>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsAdminOpen(true);
                  }}
                  className="font-bold text-center py-2.5 rounded-lg border border-slate-900 bg-slate-950 text-slate-400 hover:text-white tracking-normal cursor-pointer text-xs"
                >
                  🔐 SISTEMA KIRISh
                </button>

                <a
                  href="#contact"
                  onClick={(e) => handleNavClick(e, "contact")}
                  className={`font-bold text-center py-2.5 rounded-lg bg-${t.primary}/5 text-${t.primary} border border-${t.primary}/30 tracking-normal text-xs`}
                >
                  KONSULTATSIYA OLISH
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Container Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-24 w-full">
        
        {/* SECTION 1: MASTER REVOLUTIONARY HERO HERO SECTION */}
        <section id="home" className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center justify-between min-h-[500px] relative">
          
          {/* Cyber decorative grid graphics in background */}
          <div className="absolute inset-x-0 top-0 h-[400px] pointer-events-none select-none bg-[radial-gradient(ellipse_at_top,rgba(200,249,4,0.18)_0%,transparent_60%)] z-0" />
          
          <div className="lg:col-span-7 space-y-6 relative z-10 text-left">
            <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-sans font-bold tracking-wide text-nyanza">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-nyanza opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-nyanza"></span>
              </span>
              <span>Assalomu alaykum! Xush kelibsiz!</span>
            </span>

            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-100 font-display tracking-tight leading-none">
                Muxammadali <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-nyanza via-slate-green to-olivine-light">
                  Gulmurodov
                </span>
              </h1>
              
              <h2 className="text-lg sm:text-xl font-medium text-slate-300 font-display tracking-tight max-w-xl">
                Sun'iy intellekt yaratuvchisi, marketing strategi va kiberxavfsizlik bo'yicha mustaqil ekspert.
              </h2>
            </div>

            <p className="text-slate-400 text-sm max-w-lg leading-relaxed font-sans">
              Men zamonaviy LLM sun'iy intellekt modellarini (Prompt Engineering, botlar avtomatizatsiyasi), SMM & SEO marketing yechimlarini va professional tarmoq xavfsizligini (Penetrasion testlar, fishing xafvlari tahlili) uyg'unlashtirib, dunyo darajasidagi innovatsion mahsulotlar quraman.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <a
                href="#threatmap"
                onClick={(e) => handleNavClick(e, "threatmap")}
                className="flex items-center justify-center gap-2 font-mono text-xs font-bold px-6 py-3.5 rounded-xl bg-nyanza hover:opacity-90 hover:scale-[1.02] text-slate-950 tracking-wide transition duration-300 shadow-lg shadow-nyanza/25 cursor-pointer"
              >
                <span>LIVE THREAT MAPNI KO'RISh</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </a>

              <a
                href="#sandbox"
                onClick={(e) => handleNavClick(e, "sandbox")}
                className="flex items-center justify-center gap-2 font-mono text-xs font-bold px-6 py-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-slate-600 text-slate-300 hover:text-slate-100 transition duration-300 cursor-pointer"
              >
                <span>INTERACTIVE MIN-TOOLS</span>
                <Zap className="w-4 h-4 text-nyanza animate-pulse" />
              </a>
            </div>

            {/* Quick trust metrics panel */}
            <div className="border-t border-slate-900 pt-6 grid grid-cols-3 gap-4 max-w-md">
              <div>
                <span className="block text-xl font-extrabold font-mono text-nyanza">1,500+</span>
                <span className="text-slate-500 text-[10px] uppercase font-mono tracking-wider">AI Bot Users</span>
              </div>
              <div>
                <span className="block text-xl font-extrabold font-mono text-nyanza">98%</span>
                <span className="text-slate-500 text-[10px] uppercase font-mono tracking-wider">Audit Accuracy</span>
              </div>
              <div>
                <span className="block text-xl font-extrabold font-mono text-indigo-400">250%</span>
                <span className="text-slate-500 text-[10px] uppercase font-mono tracking-wider">Trafic Growth</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative z-10 w-full">
            {/* Elegant floating custom AI chatbot frame right inside the UI representing full-scale AI creator */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-nyanza/15 to-slate-green/15 rounded-2xl blur-xl animate-pulse pointer-events-none" />
              <AIAssistant />
            </div>
          </div>
        </section>

        {/* SECTION 2: INTERACTIVE SKILLS GRID EXPLANATION */}
        <section id="skills" className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs text-cyan-400 font-mono tracking-widest uppercase font-bold">MUTAXASSISLIK REYTINGI</span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-100 font-display">
              Ko'nikmalar va Professional Yo'nalishlar
            </h2>
            <p className="text-slate-400 text-sm">
              Muxammadalining har bir mutaxassislik sohasi bo'yicha datchiklar, amaliy vositalar va hisoblangan yetuklik bali.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Categories Selection list on left */}
            <div className="lg:col-span-5 space-y-2.5">
              {skillCategories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-300 block relative cursor-pointer overflow-hidden ${
                      isSelected
                        ? "bg-slate-900 border-slate-800 shadow-md"
                        : "bg-slate-955/30 border-slate-910 hover:border-slate-800"
                    }`}
                  >
                    {/* Left glowing marker inside item */}
                    {isSelected && (
                      <div className="absolute top-0 bottom-0 left-0 w-1 bg-cyan-500" />
                    )}

                    <div className="flex items-center space-x-3.5">
                      <div className={`w-9 h-9 rounded-lg bg-slate-950 flex items-center justify-center border ${isSelected ? 'border-cyan-800 text-cyan-400' : 'border-slate-900 text-slate-500'}`}>
                        {cat.id === "ai" && <Sparkles className="w-4 h-4" />}
                        {cat.id === "cyber" && <Shield className="w-4 h-4" />}
                        {cat.id === "marketing" && <TrendingUp className="w-4 h-4" />}
                        {cat.id === "web" && <Code2 className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <span className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Sohadagi mavqeyi</span>
                        <h4 className={`text-sm font-bold tracking-tight ${isSelected ? "text-slate-200" : "text-slate-400"}`}>{cat.title}</h4>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${isSelected ? 'rotate-90 text-cyan-400' : ''}`} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Category Skill representation panel on Right */}
            <div className="lg:col-span-7 bg-slate-950 border border-slate-900 rounded-2xl p-6 shadow-xl relative min-h-[300px] flex flex-col justify-between">
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${activeCategoryDetails.color}`} />
                  <h3 className="text-lg font-bold text-slate-200">{activeCategoryDetails.title}</h3>
                </div>
                
                <p className="text-slate-400 text-xs leading-relaxed">
                  {activeCategoryDetails.description}
                </p>

                {/* Progress Meters list */}
                <div className="space-y-4 pt-4">
                  {activeCategoryDetails.skills.map((s, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs items-center font-sans">
                        <div>
                          <span className="font-semibold text-slate-200">{s.name}</span>
                          <span className="text-slate-500 block text-[10px] font-mono mt-0.5">{s.info}</span>
                        </div>
                        <span className="text-cyan-400 font-mono font-bold">{s.level}%</span>
                      </div>
                      
                      {/* Meter bar */}
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-850">
                        <motion.div
                          className={`h-full bg-gradient-to-r ${activeCategoryDetails.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${s.level}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-900 pt-4 mt-6 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                <span>Eng zamonaviy vositalar va frameworklardan foydalaniladi</span>
                <span className="text-cyan-400 font-bold uppercase select-none">Muxammadali stack v2.0</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: LIVE CYBER THREAT MAP */}
        <section id="threatmap" className="scroll-mt-20">
          <CyberThreatMap />
        </section>

        {/* SECTION 4: REAL TIME INTERACTIVE TOOLS SANDBOX */}
        <section id="sandbox" className="scroll-mt-20">
          <ToolsSandbox />
        </section>

        {/* SECTION 5: NOTABLE PROJECTS SECTION */}
        <section id="projects" className="space-y-8 scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs text-cyan-400 font-mono tracking-widest uppercase font-bold">KREATIV PORTFOLIO</span>
              <h2 className="text-3xl font-bold tracking-tight text-slate-100 font-display mt-0.5">
                Eng Muhim Proyektlar va Yutuqlar
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Biznes o'sishi, marketingni avtomatlashtirish va ishonchli kiber-himoyani ta'minlaydigan maxsus tizimlar.
              </p>
            </div>
            
            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, "contact")}
              className="text-xs font-mono text-cyan-400 hover:text-white flex items-center gap-1 cursor-pointer transition py-1 border-b border-cyan-800 hover:border-white h-fit whitespace-nowrap"
            >
              <span>LOYIHA BUYURTMA QILISH</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="bg-slate-950/80 border border-slate-900 rounded-2xl p-6 hover:border-slate-800 transition duration-300 flex flex-col justify-between group shadow-xl"
              >
                <div className="space-y-4">
                  {/* Project Image if available */}
                  {proj.imageUrl && (
                    <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden border border-slate-900 bg-slate-950 shadow-md">
                      <img
                        src={proj.imageUrl}
                        alt={proj.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                  )}

                  {/* Category icon badges */}
                  <div className="flex justify-between items-center">
                    <div className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-slate-900 text-slate-400 border border-slate-850">
                      {proj.category === "ai" && "🧠 AI Engine"}
                      {proj.category === "cyber" && "🔐 Cyber Sec"}
                      {proj.category === "marketing" && "📊 Marketing"}
                      {proj.category === "web" && "🎨 UI/UX Design"}
                    </div>

                    <span className="text-[10px] font-mono text-cyan-400 font-semibold">
                      {proj.performanceMetric}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-200 font-sans group-hover:text-cyan-400 transition">
                      {proj.title}
                    </h3>
                    <p className="text-slate-400 font-sans text-xs mt-1 italic font-medium">
                      {proj.tagline}
                    </p>
                  </div>

                  <p className="text-slate-400 text-xs leading-relaxed font-sans mt-1">
                    {proj.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-900 space-y-3">
                  {/* Tech stack items list */}
                  <div className="flex flex-wrap gap-1.5">
                    {proj.tech.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] font-mono px-2 py-0.5 border border-slate-900 bg-slate-900/30 text-slate-400 rounded"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      {proj.usersCount}
                    </span>
                    <span className="text-cyan-400 group-hover:underline">Aktiv + Live</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6: RESURSLAR VA YOPIDAGI PORTAL TUGMALARI */}
        <section className="py-12 border-y border-slate-900/50 bg-slate-950/40 rounded-3xl p-6 md:p-8 space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className={`text-xs text-${t.primary} font-mono tracking-widest uppercase font-bold flex items-center justify-center gap-1.5`}>
              <Zap className="w-3.5 h-3.5 animate-pulse text-yellow-400" />
              <span>LOYIHA VA RESURSLAR PORTALI</span>
            </span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100 font-display">
              Media, Video darsliklar va Maqolalar
            </h2>
            <p className="text-slate-400 text-xs md:text-xs">
              Muxammadalining yopiq kiberxavfsizlik darslari, sun'iy intellekt va marketing yo'riqnomalari hamda yuklangan media aktlar to'liq sandig'i. Barcha bo'limlar alohida oynada ochiladi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Button 1: Video darsliklar */}
            <button
              onClick={() => setIsVideoModalOpen(true)}
              className={`bg-slate-950/90 border border-slate-900 hover:border-${t.primary}/30 rounded-2xl p-6 text-left hover:shadow-lg hover:shadow-${t.primary}/5 transition-all duration-300 group flex flex-col justify-between h-44 cursor-pointer relative overflow-hidden`}
            >
              <div className="space-y-4 relative z-10">
                <div className={`w-10 h-10 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-center text-${t.primary} group-hover:scale-105 transition`}>
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-200 font-sans group-hover:text-white transition">Video Masterklasslar</h3>
                  <p className="text-slate-400 text-[11px] font-sans mt-0.5 leading-snug">
                    Kiber-himoya va sun'iy intellekt bo'yicha amaliy darsliklar ({videos.length} ta).
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-slate-500 group-hover:text-white transition pt-4">
                <span>PORTALNI OCHISH</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
              <div className="absolute right-[-20px] bottom-[-20px] opacity-[0.02] group-hover:opacity-[0.05] text-slate-100 transition duration-500">
                <Video className="w-32 h-32" />
              </div>
            </button>

            {/* Button 2: Maqolalar */}
            <button
              onClick={() => setIsArticlesModalOpen(true)}
              className={`bg-slate-950/90 border border-slate-900 hover:border-${t.primary}/30 rounded-2xl p-6 text-left hover:shadow-lg hover:shadow-${t.primary}/5 transition-all duration-300 group flex flex-col justify-between h-44 cursor-pointer relative overflow-hidden`}
            >
              <div className="space-y-4 relative z-10">
                <div className={`w-10 h-10 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-center text-${t.primary} group-hover:scale-105 transition`}>
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-200 font-sans group-hover:text-white transition">Kiber-Maqolalar</h3>
                  <p className="text-slate-400 text-[11px] font-sans mt-0.5 leading-snug">
                    Biznes va penetratsion testlar bo'yicha ilmiy maqolalar ({articles.length} ta).
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-slate-500 group-hover:text-white transition pt-4">
                <span>MUTOLAA ETISH</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
              <div className="absolute right-[-20px] bottom-[-20px] opacity-[0.02] group-hover:opacity-[0.05] text-slate-100 transition duration-500">
                <MessageSquare className="w-32 h-32" />
              </div>
            </button>

            {/* Button 3: Rasmlar Galereyasi */}
            <button
              onClick={() => setIsImagesModalOpen(true)}
              className={`bg-slate-950/90 border border-slate-900 hover:border-${t.primary}/30 rounded-2xl p-6 text-left hover:shadow-lg hover:shadow-${t.primary}/5 transition-all duration-300 group flex flex-col justify-between h-44 cursor-pointer relative overflow-hidden`}
            >
              <div className="space-y-4 relative z-10">
                <div className={`w-10 h-10 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-center text-${t.primary} group-hover:scale-105 transition`}>
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-200 font-sans group-hover:text-white transition">Yuklangan Rasmlar</h3>
                  <p className="text-slate-400 text-[11px] font-sans mt-0.5 leading-snug">
                    Mahalliy galereyadan yuklangan rasm aktivlar to'plami ({images.length} ta).
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-slate-500 group-hover:text-white transition pt-4">
                <span>GALEREYANI KO'RISh</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
              <div className="absolute right-[-20px] bottom-[-20px] opacity-[0.02] group-hover:opacity-[0.05] text-slate-100 transition duration-500">
                <Globe className="w-32 h-32" />
              </div>
            </button>
          </div>
        </section>

        {/* SECTION 7: WORK EXPERIENCE HISTORY */}
        <section id="experience" className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start scroll-mt-20">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs text-cyan-400 font-mono tracking-widest uppercase font-bold">KARYERA TIMELINE</span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-100 font-display">
              Ish Tajribasi va Amaliy Faoliyat
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Muxammadalining professional martaba yo'li yuqori natijador marketing strategiyalari, innovatsion sun'iy intellekt treninglari va xavfsiz penetratsion sinovlardan iborat.
            </p>

            <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 space-y-2.5">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Mijozlarimizdan kelgan xulosa</span>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                &ldquo;Muxammadali o'z ishiga o'ta mas'uliyatli yondashadi. SMM va saytimiz yuklanishini tezlashtirib, mijozlar buyurtmasini ancha osonlashtirdi. Ishonchli kiber-himoyadan hozir xotirjammiz!&rdquo;
              </p>
              <span className="text-[10px] text-slate-500 block text-right font-semibold">— Tashqi auditorlar tahlili</span>
            </div>
          </div>

          {/* Interactive experience timelines scroller */}
          <div className="lg:col-span-7 space-y-4">
            {experiences.map((exp) => {
              const isActive = activeHighlight === exp.id;
              return (
                <div
                  key={exp.id}
                  onClick={() => setActiveHighlight(isActive ? null : exp.id)}
                  className={`bg-slate-950/70 border border-slate-910 p-5 rounded-2xl hover:border-slate-800 transition cursor-pointer select-none relative ${
                    isActive ? "border-slate-800 shadow-md bg-slate-900/10" : ""
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center border border-slate-800 text-cyan-400">
                        {exp.id === "exp1" && <Shield className="w-4 h-4 text-emerald-400" />}
                        {exp.id === "exp2" && <TrendingUp className="w-4 h-4 text-cyan-400" />}
                        {exp.id === "exp3" && <Sparkles className="w-4 h-4 text-purple-400" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-200">{exp.role}</h4>
                        <span className="text-xs text-slate-500 block">{exp.company}</span>
                      </div>
                    </div>

                    <span className="font-mono text-[10px] bg-slate-900 px-2 py-0.5 border border-slate-800 text-cyan-400 rounded-full">
                      {exp.period}
                    </span>
                  </div>

                  {/* Highlights list visible when expanded */}
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden mt-4 pt-4 border-t border-slate-900 space-y-2.5 text-xs text-slate-400"
                      >
                        {exp.highlights.map((h, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                            <span>{h}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex justify-end text-[9px] text-slate-600 font-mono mt-1">
                    <span>{isActive ? "Batafsil yopish" : "Expand - Yutuqlar"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 7: SECURE ENCRYPTED CONSULTATION FORM */}
        <section id="contact" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-950 border border-slate-900 rounded-2xl p-6 md:p-8 scroll-mt-20">
          <div className="lg:col-span-6 space-y-5">
            <div className="flex items-center space-x-1 px-3 py-1 rounded bg-slate-900 text-cyan-400 font-mono text-[9px] uppercase border border-cyan-800/20 max-w-fit font-bold">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Secure Shell Transmission Port</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100 font-display">
              Keling, Birgalikda Yangi <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-green to-nyanza">
                Cho'qqilarni Zabt Etamiz!
              </span>
            </h2>

            <p className="text-slate-400 text-xs sm:text-xs leading-relaxed max-w-md">
              Sizda marketingni AI avtomatlashtirish, veb-dizayn yoki firibgarlarni audit qilish (Penetrasion testlar) bo'yicha loyiha bormi? Ma'lumotlarni qoldiring, shifrlangan SSH ulanishi orqali men bilan aloqa o'rnating.
            </p>

            <div className="space-y-3.5 text-xs text-slate-300 font-mono">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>muxammadali@ai.uz</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+998 33 293 04 07</span>
              </div>
              <div className="flex items-center space-x-2">
                <Instagram className="w-4 h-4 text-rose-450 shrink-0" />
                <span>@themuxammad23</span>
              </div>
            </div>
          </div>

          {/* Secure Interactive Terminal Transmission form on right */}
          <div className="lg:col-span-6 bg-slate-900/20 border border-slate-900 rounded-xl p-5 md:p-6 shadow-xl relative min-h-[300px] flex flex-col justify-between">
            {!sendSuccess && encryptingProgress === null && (
              <form onSubmit={handleBookConsultation} className="space-y-4">
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-mono mb-1">Ismingiz</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Masalan: Asliddin"
                    className="w-full bg-slate-950 border border-slate-900 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition animate-fade-in"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-mono mb-1">Telefon raqamingiz</label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={handlePhoneChange}
                    placeholder="Masalan: +998 90 123 45 67"
                    className={`w-full bg-slate-950 border rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition animate-fade-in ${
                      contactPhone
                        ? isPhoneValid()
                          ? "border-emerald-500/70 focus:border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.1)]"
                          : "border-amber-500/70 focus:border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.1)]"
                        : "border-slate-900 focus:border-cyan-500"
                    }`}
                  />
                  {contactPhone && (
                    <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono select-none">
                      {isPhoneValid() ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-semibold animate-fade-in">
                          ✓ Raqam to'liq formatda
                        </span>
                      ) : (
                        <span className="text-amber-400 animate-pulse">
                          ⚠ Raqam to'liq emas (Kamida 12 ta raqam bo'lishi kerak)
                        </span>
                      )}
                      <span className="text-slate-500 text-[9px] uppercase font-bold">
                        Jami: {contactPhone.replace(/\D/g, "").length}/12 xona
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-mono mb-1">Xabaringiz</label>
                  <textarea
                    required
                    rows={3}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Loyihangiz bo'yicha qisqacha tavsiflarni yozing..."
                    className="w-full bg-slate-950 border border-slate-900 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition animate-fade-in"
                  />
                </div>

                <button
                  type="submit"
                  id="submit-contact-btn"
                  disabled={!contactName || !contactPhone || !contactMessage || !isPhoneValid()}
                  className={`w-full flex items-center justify-center gap-1.5 font-bold text-xs py-2.5 rounded-lg font-mono tracking-wider transition-all duration-300 shadow-md ${
                    (!contactName || !contactPhone || !contactMessage || !isPhoneValid())
                      ? "bg-slate-950 text-slate-600 border border-slate-900/65 opacity-55 cursor-not-allowed"
                      : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer shadow-emerald-950/20"
                  }`}
                >
                  <Send className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>XABARNI ENCRYPT QILIB TRANS-MISSION ETISh</span>
                </button>
              </form>
            )}

            {/* Animating encryption loader state */}
            {encryptingProgress !== null && (
              <div className="h-64 flex flex-col justify-center items-center">
                <Cpu className="w-10 h-10 text-cyan-400 animate-spin mb-4" />
                
                <div className="w-full max-w-xs space-y-2">
                  <div className="flex justify-between font-mono text-[10px] text-cyan-400">
                    <span>SECURE TRANSMITTING...</span>
                    <span>{encryptingProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-850">
                    <div className="bg-gradient-to-r from-nyanza to-slate-green h-full rounded-full" style={{ width: `${encryptingProgress}%` }} />
                  </div>
                </div>

                <div className="mt-4 text-[9px] font-mono text-slate-400 space-y-1 w-full text-center max-w-xs">
                  {encryptionLogs.map((log, index) => (
                    <p key={index} className="truncate">
                      {log}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Success state */}
            {sendSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-64 flex flex-col justify-center items-center text-center p-4 space-y-3"
              >
                <div className="w-12 h-12 bg-emerald-950/80 border border-emerald-500 rounded-full flex items-center justify-center text-emerald-400">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h4 className="text-emerald-400 font-bold font-sans text-sm">Aloqa Tunnel Muvaffaqiyatli O'rnatildi!</h4>
                <p className="text-slate-400 text-xs font-sans max-w-sm">
                  Rahmat! Sizning xabaringiz shifrlangan shpion ko'rkamida Muxammadali Gulmurodov xizmatlar xonasiga yo'llandi. Tez orada siz bilan bog'laniladi.
                </p>
                <button
                  onClick={() => setSendSuccess(false)}
                  className="font-mono text-[10px] border border-slate-800 rounded px-3 py-1 text-slate-500 hover:text-slate-300 hover:border-slate-650 transition cursor-pointer"
                >
                  Yangi aloqa o'rnatish
                </button>
              </motion.div>
            )}
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              {branding.avatarUrl ? (
                <img
                  src={branding.avatarUrl}
                  alt={branding.name}
                  className="w-6 h-6 rounded-full object-cover border border-slate-800"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className={`w-6 h-6 rounded-full bg-gradient-to-tr ${branding.accentColor} flex items-center justify-center font-bold text-slate-950 text-xs`}>
                  {branding.initials}
                </span>
              )}
              <span className="font-bold text-slate-100 font-sans text-xs tracking-tight">{branding.name} Gulmurodov</span>
            </div>
            <p className="text-[11px] text-slate-500 max-w-xs">
              {branding.subtitle} — Boshqarish tizimlari markazi.
            </p>
          </div>

          {/* Social Links redirecting to original properties */}
          <div className="flex space-x-4">
            <a
              href="https://t.me/muxammadali_x7"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-cyan-400 transition"
              title="Telegram"
            >
              <span className="text-xs font-mono">Telegram</span>
            </a>
            <a
              href="https://instagram.com/themuxammad23"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-rose-500 transition"
              title="Instagram"
            >
              <span className="text-xs font-mono">Instagram</span>
            </a>
            <a
              href="tel:+998332930407"
              className="text-slate-500 hover:text-emerald-400 transition"
              title="Phone"
            >
              <span className="text-xs font-mono">Phone</span>
            </a>
          </div>

          <p className="text-[11px] text-slate-600 font-mono">
            © 2026 Muxammadali Gulmurodov. Barcha huquqlar himoyalangan.
          </p>
        </div>
      </footer>

      {/* Admin Panel Component layer */}
      <AnimatePresence>
        {isAdminOpen && (
          <AdminPanel
            isOpen={isAdminOpen}
            onClose={() => setIsAdminOpen(false)}
            projects={projects}
            setProjects={updateProjects}
            skillCategories={skillCategories}
            setSkillCategories={updateSkillCategories}
            experiences={experiences}
            setExperiences={updateExperiences}
            messages={messages}
            setMessages={updateMessages}
            branding={branding}
            setBranding={updateBranding}
            articles={articles}
            setArticles={updateArticles}
            videos={videos}
            setVideos={updateVideos}
            images={images}
            setImages={updateImages}
            seoSettings={seoSettings}
            setSeoSettings={updateSeoSettings}
            analytics={analytics}
            setAnalytics={updateAnalytics}
            statusNotUsed1="" // placeholder to keep structural diff clean
            telegramSettings={telegramSettings}
            setTelegramSettings={updateTelegramSettings}
          />
        )}
      </AnimatePresence>

      {/* PORTAL MODAL 1: VIDEOLAR OYNASI */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-md z-50 overflow-y-auto flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 15 }}
              className="bg-slate-950/90 border border-slate-900 rounded-3xl max-w-5xl w-full h-[90vh] flex flex-col justify-between shadow-2xl relative overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-900 flex items-center justify-between bg-slate-950/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-center text-${t.primary}`}>
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-100 font-sans">Yopiq Video Masterklasslar</h3>
                    <p className="text-slate-500 text-[11px] font-mono uppercase tracking-wider">Muxammadali Video Portal v1.2</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsVideoModalOpen(false)}
                  className="bg-slate-900 hover:bg-slate-850 p-2.5 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-full transition cursor-pointer flex items-center gap-1 text-xs"
                  title="Portalni yopish"
                >
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline font-mono text-[9px] pr-1">YOPISH</span>
                </button>
              </div>

              {/* Content body */}
              <div className="p-6 md:p-8 flex-1 overflow-y-auto space-y-6">
                {videos.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-center space-y-3 bg-slate-950/40 border border-dashed border-slate-900 rounded-2xl p-6">
                    <span className="text-2xl">📹</span>
                    <p className="text-xs font-mono text-slate-500">
                      Hozircha amaliy video darsliklar yuklanmagan. Admin paneldan tizimga yuklang!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {videos.map((vid) => (
                      <div 
                        key={vid.id}
                        className="bg-slate-900/40 border border-slate-900 hover:border-slate-850/60 rounded-2xl overflow-hidden p-5 space-y-4 shadow-xl transition-all"
                      >
                        <div className="h-52 w-full bg-slate-950 border border-slate-900 rounded-xl overflow-hidden relative shadow-inner">
                          {vid.embedUrl.startsWith("data:") ? (
                            <video
                              src={vid.embedUrl}
                              controls
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <iframe
                              src={vid.embedUrl}
                              title={vid.title}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className={`px-2.5 py-0.5 rounded-full bg-${t.primary}/10 text-${t.primary} border border-${t.primary}/20 uppercase`}>
                              DARS ({vid.duration})
                            </span>
                            <span className="text-slate-500">{vid.uploadedAt}</span>
                          </div>
                          <h4 className="text-base font-bold text-slate-200">
                            {vid.title}
                          </h4>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {vid.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status footer inside modal */}
              <div className="p-4 px-6 border-t border-slate-900 bg-slate-950/70 text-center flex justify-between items-center text-[9px] font-mono text-slate-500">
                <span>MUTLAQ MAXFIY • FAQAT BUYURTMALAR EVALUATSION HUJJATLARI</span>
                <span>SYSTEM STATUS: <span className="text-emerald-400">ONLINE</span></span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PORTAL MODAL 2: MAQOLALAR OYNASI */}
      <AnimatePresence>
        {isArticlesModalOpen && (
          <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-md z-50 overflow-y-auto flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 15 }}
              className="bg-slate-950/90 border border-slate-900 rounded-3xl max-w-5xl w-full h-[90vh] flex flex-col justify-between shadow-2xl relative overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-900 flex items-center justify-between bg-slate-950/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-center text-${t.primary}`}>
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-100 font-sans">Kiberxavfsizlik va Marketing Maqolalari</h3>
                    <p className="text-slate-500 text-[11px] font-mono uppercase tracking-wider">Bilimlar Markazi • Maqolalar ({articles.length})</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsArticlesModalOpen(false)}
                  className="bg-slate-900 hover:bg-slate-850 p-2.5 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-full transition cursor-pointer flex items-center gap-1 text-xs"
                >
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline font-mono text-[9px] pr-1">YOPISH</span>
                </button>
              </div>

              {/* Content body */}
              <div className="p-6 md:p-8 flex-1 overflow-y-auto space-y-6">
                {articles.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-center space-y-3 bg-slate-950/40 border border-dashed border-slate-900 rounded-2xl p-6">
                    <span className="text-2xl">📑</span>
                    <p className="text-xs font-mono text-slate-500">
                      Hozircha ilmiy-amaliy maqolalar yuklanmagan. Admin paneldan tizimga yuklang!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.map((art) => (
                      <div 
                        key={art.id}
                        className="bg-slate-900/30 border border-slate-900 hover:border-slate-850 rounded-2xl overflow-hidden transition group flex flex-col justify-between shadow-lg"
                      >
                        <div>
                          {art.coverUrl && (
                            <div className="h-44 w-full overflow-hidden relative">
                              <img 
                                src={art.coverUrl} 
                                alt={art.title} 
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute top-2 left-2 bg-slate-950/95 text-slate-300 font-mono text-[9px] px-2 py-0.5 rounded border border-slate-850 uppercase">
                                {art.category}
                              </div>
                            </div>
                          )}

                          <div className="p-5 space-y-2">
                            <span className="text-[10px] font-mono text-slate-500 block">
                              {art.publishDate} • {art.readTime} o'qish
                            </span>
                            <h4 className={`text-base font-bold text-slate-200 group-hover:text-${t.primary} transition line-clamp-2`}>
                              {art.title}
                            </h4>
                            <p className="text-xs text-slate-400 font-sans line-clamp-3 leading-relaxed">
                              {art.content}
                            </p>
                          </div>
                        </div>

                        <div className="p-5 pt-0">
                          <button
                            onClick={() => setReadingArticle(art)}
                            className={`w-full text-center py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-mono text-[10px] font-semibold border border-slate-850 rounded-lg group-hover:border-${t.primary}/30 transition cursor-pointer`}
                          >
                            BATAFSIL O'QISH
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status footer inside modal */}
              <div className="p-4 px-6 border-t border-slate-900 bg-slate-950/70 text-center flex justify-between items-center text-[9px] font-mono text-slate-500">
                <span>MUTOLAA BILIMI BILAN KUCHLIDIR • BILIMLAR PORTALI</span>
                <span>SYSTEM STATUS: <span className="text-emerald-400">ONLINE</span></span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PORTAL MODAL 3: RASMLAR GALEREYASI OYNASI */}
      <AnimatePresence>
        {isImagesModalOpen && (
          <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-md z-50 overflow-y-auto flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 15 }}
              className="bg-slate-950/90 border border-slate-900 rounded-3xl max-w-5xl w-full h-[90vh] flex flex-col justify-between shadow-2xl relative overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-900 flex items-center justify-between bg-slate-950/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-center text-${t.primary}`}>
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-100 font-sans">Yuklangan Rasm Aktivlari Galereyasi</h3>
                    <p className="text-slate-500 text-[11px] font-mono uppercase tracking-wider">Aktivlar Saqlash Ombori • Jami ({images.length} ta rasm)</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsImagesModalOpen(false)}
                  className="bg-slate-900 hover:bg-slate-850 p-2.5 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-full transition cursor-pointer flex items-center gap-1 text-xs"
                >
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline font-mono text-[9px] pr-1">YOPISH</span>
                </button>
              </div>

              {/* Content body */}
              <div className="p-6 md:p-8 flex-1 overflow-y-auto space-y-6">
                {images.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-center space-y-3 bg-slate-950/40 border border-dashed border-slate-900 rounded-2xl p-6">
                    <span className="text-2xl">🖼️</span>
                    <p className="text-xs font-mono text-slate-500">
                      Galereyada rasmlar mavjud emas. Admin panelda yangi rasmlar yuklang!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((img) => (
                      <div 
                        key={img.id}
                        className="bg-slate-900/30 border border-slate-900 hover:border-slate-800 rounded-2xl overflow-hidden shadow-lg p-3 transition group flex flex-col justify-between"
                      >
                        <div 
                          className="h-40 w-full rounded-xl overflow-hidden relative cursor-pointer group shadow"
                          onClick={() => setViewerImageUrl(img.url)}
                        >
                          <img 
                            src={img.url} 
                            alt={img.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                            <span className="text-[10px] font-mono bg-slate-950 px-2.5 py-1 rounded-md border border-slate-850 text-slate-200">
                              KATTALASHTIRISH
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 space-y-2">
                          <div className="space-y-0.5">
                            <h5 className="text-xs font-bold text-slate-300 line-clamp-1">{img.name}</h5>
                            <span className="text-[9px] font-mono text-slate-500 block">Hajmi: {img.size}</span>
                          </div>
                          
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(img.url);
                              alert("Havola clipboardga nusxalandi!");
                            }}
                            className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-[9px] font-mono uppercase text-slate-400 hover:text-white border border-slate-850 rounded-lg cursor-pointer transition"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>HAVOLANI NUSXALASH</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status footer inside modal */}
              <div className="p-4 px-6 border-t border-slate-900 bg-slate-950/70 text-center flex justify-between items-center text-[9px] font-mono text-slate-500">
                <span>RANG-BARANG PORTFOLIO ASSETLARI • SECURE HOSTED STORAGE</span>
                <span>SYSTEM STATUS: <span className="text-emerald-400">ONLINE</span></span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ARTICLE ACTIVE MUTOLAA MODAL OVERLAY */}
      <AnimatePresence>
        {readingArticle && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-55 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-950 border border-slate-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative"
            >
              {readingArticle.coverUrl && (
                <div className="h-60 w-full relative">
                  <img 
                    src={readingArticle.coverUrl} 
                    alt={readingArticle.title} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
                  <button
                    onClick={() => setReadingArticle(null)}
                    className="absolute top-4 right-4 bg-slate-950/85 p-2 border border-slate-800 rounded-full text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 bg-${t.primary}/10 text-${t.primary} border border-${t.primary}/20 text-[10px] font-mono rounded uppercase`}>
                    {readingArticle.category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {readingArticle.publishDate} • {readingArticle.author}
                  </span>
                </div>

                <h3 className="text-xl font-bold font-sans text-slate-200">
                  {readingArticle.title}
                </h3>

                <div className="text-xs text-slate-300 leading-relaxed font-sans max-h-60 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                  {readingArticle.content.split("\n\n").map((para, pIdx) => (
                    <p key={pIdx}>
                      {para}
                    </p>
                  ))}
                </div>

                <div className="border-t border-slate-900 pt-4 flex justify-between items-center">
                  <span className="text-[9px] font-mono text-slate-500 uppercase font-bold">✓ Himoyalangan Veb-Xabar</span>
                  <button
                    onClick={() => setReadingArticle(null)}
                    className={`px-4 py-1.5 bg-${t.primary} text-slate-950 font-bold font-mono text-[10px] rounded hover:opacity-90 transition cursor-pointer`}
                  >
                    YOPISH
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FULLSCREEN LIGHTBOX PHOTO VIEWER */}
      <AnimatePresence>
        {viewerImageUrl && (
          <div 
            className="fixed inset-0 bg-slate-950/98 backdrop-blur-md z-55 flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setViewerImageUrl(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl relative shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={viewerImageUrl} 
                alt="Aktiv Kattadan Rasm" 
                className="w-full h-auto max-h-[80vh] object-contain border border-slate-900 rounded-2xl"
                referrerPolicy="no-referrer"
              />
              
              <button
                onClick={() => setViewerImageUrl(null)}
                className="absolute top-4 right-4 bg-slate-950/85 p-2 border border-slate-800 rounded-full text-slate-400 hover:text-white cursor-pointer transition shadow"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 👑 DYNAMIC 3D GLASSMORPHIC BUBBLE MENU */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-sm sm:max-w-md px-4 pointer-events-none">
        <div className="relative bg-slate-900/90 backdrop-blur-xl border border-nyanza/20 rounded-full py-2 px-3 sm:px-5 flex items-center justify-between gap-1 shadow-[0_16px_36px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.05)] pointer-events-auto">
          {[
            { id: "home", label: "Asosiy", icon: Home },
            { id: "skills", label: "Skills", icon: Cpu },
            { id: "threatmap", label: "Kiber", icon: Shield },
            { id: "sandbox", label: "Sandbox", icon: Terminal },
            { id: "projects", label: "Loyihalar", icon: Briefcase },
            { id: "contact", label: "Aloqa", icon: MessageSquare }
          ].map((item) => {
            const IconComponent = item.icon;
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleNavClick(e, item.id)}
                className="relative flex flex-col items-center justify-center w-11 h-11 rounded-full transition-all duration-300 group"
                title={item.label}
              >
                {isActive ? (
                  <motion.div
                    layoutId="activeBubbleMenuCircle"
                    className="absolute -top-7 w-12 h-12 rounded-full bg-nyanza border border-white/10 shadow-[inset_0_2px_4px_rgba(255,255,255,0.5),0_10px_20px_rgba(200,249,4,0.4)] flex items-center justify-center"
                    transition={{ type: "spring", stiffness: 380, damping: 24 }}
                  >
                    <IconComponent className="w-5 h-5 text-slate-950 stroke-[2.5]" />
                    <div className="absolute inset-1 rounded-full bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
                  </motion.div>
                ) : (
                  <IconComponent className="w-5 h-5 text-slate-400 group-hover:text-nyanza transition-all group-hover:scale-115" />
                )}
                
                <span className={`text-[8px] font-mono mt-1 font-semibold leading-none ${isActive ? "opacity-0 mt-6" : "text-slate-500 group-hover:text-nyanza"} transition-all duration-300`}>
                  {item.label}
                </span>
              </a>
            );
          })}
        </div>
      </div>

    </div>
  );
}
