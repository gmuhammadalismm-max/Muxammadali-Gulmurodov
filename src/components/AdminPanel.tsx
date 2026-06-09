/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Lock, Unlock, Settings, Trash2, Plus, Edit2, Save, Check, X, 
  ShieldAlert, Sparkles, TrendingUp, Code2, Eye, Mail, Terminal, 
  ChevronRight, MessageSquare, Briefcase, AlertOctagon, Radio, Cpu,
  Image as ImageIcon, Video, Globe, Key, BarChart3, Upload, ShieldCheck, Award, Send
} from "lucide-react";
import { 
  Project, SkillCategory, Experience, ContactMessage, ThreatEvent,
  LogoBranding, AdminArticle, AdminVideo, AdminImage, SEOSettings, AnalyticsMetric, TelegramSettings 
} from "../types";

// Client-side image compression utility to ensure payloads stay well under the 1MB Firestore size limit, enabling real-time multi-device synchronization.
const compressImage = (file: File, maxW = 800, maxH = 800, quality = 0.65): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxW) {
            height = Math.round((height * maxW) / width);
            width = maxW;
          }
        } else {
          if (height > maxH) {
            width = Math.round((width * maxH) / height);
            height = maxH;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(dataUrl);
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = () => {
        resolve(event.target?.result as string);
      };
    };
    reader.onerror = (err) => reject(err);
  });
};

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  skillCategories: SkillCategory[];
  setSkillCategories: React.Dispatch<React.SetStateAction<SkillCategory[]>>;
  experiences: Experience[];
  setExperiences: React.Dispatch<React.SetStateAction<Experience[]>>;
  messages: ContactMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ContactMessage[]>>;
  branding: LogoBranding;
  setBranding: React.Dispatch<React.SetStateAction<LogoBranding>>;
  articles: AdminArticle[];
  setArticles: React.Dispatch<React.SetStateAction<AdminArticle[]>>;
  videos: AdminVideo[];
  setVideos: React.Dispatch<React.SetStateAction<AdminVideo[]>>;
  images: AdminImage[];
  setImages: React.Dispatch<React.SetStateAction<AdminImage[]>>;
  seoSettings: SEOSettings;
  setSeoSettings: React.Dispatch<React.SetStateAction<SEOSettings>>;
  analytics: AnalyticsMetric;
  setAnalytics: React.Dispatch<React.SetStateAction<AnalyticsMetric>>;
  telegramSettings: TelegramSettings;
  setTelegramSettings: React.Dispatch<React.SetStateAction<TelegramSettings>>;
}

type AdminTab = 
  | "inbox" 
  | "projects" 
  | "skills" 
  | "experience" 
  | "branding" 
  | "articles" 
  | "videos" 
  | "gallery" 
  | "seo" 
  | "threats" 
  | "security" 
  | "analytics";

export default function AdminPanel({
  isOpen,
  onClose,
  projects,
  setProjects,
  skillCategories,
  setSkillCategories,
  experiences,
  setExperiences,
  messages,
  setMessages,
  branding,
  setBranding,
  articles,
  setArticles,
  videos,
  setVideos,
  images,
  setImages,
  seoSettings,
  setSeoSettings,
  analytics,
  setAnalytics,
  telegramSettings,
  setTelegramSettings
}: AdminPanelProps & { statusNotUsed1?: string }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState<AdminTab>("branding");
  
  // Telegram test states
  const [telegramTestLoading, setTelegramTestLoading] = useState(false);
  const [telegramTestStatus, setTelegramTestStatus] = useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);

  const handleTestTelegram = async () => {
    if (!telegramSettings?.botToken || !telegramSettings?.chatId) {
      setTelegramTestStatus({
        success: false,
        message: "Bot Token va Chat ID to'ldirilmagan!",
      });
      return;
    }

    setTelegramTestLoading(true);
    setTelegramTestStatus(null);

    try {
      const response = await fetch("/api/telegram-notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "🤖 Sinov Foydalanuvchisi",
          phone: "+998 (33) 293-04-07",
          message: "Ushbu xabar portfoliongiz tahrirlash tizimidan sinov tariqasida yuborildi. Agar buni o'qiyotgan bo'lsangiz, Telegram sozlamalaringiz muvaffaqiyatli bog'landi!",
          botToken: telegramSettings.botToken,
          chatId: telegramSettings.chatId,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success && !data.notConfigured) {
        setTelegramTestStatus({
          success: true,
          message: "Tabriklaymiz! Sinov xabari Telegram botingizga muvaffaqiyatli yuborildi.",
        });
      } else if (data.notConfigured) {
        setTelegramTestStatus({
          success: false,
          message: "Telegram bot sozlanmagan. Tizim parametrlarni qabul qilmadi.",
        });
      } else {
        setTelegramTestStatus({
          success: false,
          message: data.error || "Telegramga yuborishda xatolik yuz berdi.",
          details: data.details || JSON.stringify(data),
        });
      }
    } catch (err: any) {
      setTelegramTestStatus({
        success: false,
        message: "Server bilan ulanishda xatolik yuz berdi.",
        details: err.message,
      });
    } finally {
      setTelegramTestLoading(false);
    }
  };
  
  // Custom Passcode settings
  const [currentPasscodes, setCurrentPasscodes] = useState<string[]>(() => {
    const saved = localStorage.getItem("gmuhammadali_passcodes");
    return saved ? JSON.parse(saved) : ["2026", "admin777", "332930407"];
  });
  const [newPasscodeInput, setNewPasscodeInput] = useState("");
  const [securityLogs, setSecurityLogs] = useState<string[]>([
    "🛡️ Tizim ishga tushirildi va himoyalandi.",
    "🔑 Sukut bo'yicha kirish kodi: '2026' yoki 'admin777'"
  ]);

  // Decryption animation states for contact message inbox
  const [decryptingId, setDecryptingId] = useState<string | null>(null);
  const [decryptedIds, setDecryptedIds] = useState<string[]>([]);
  const [decryptionLogs, setDecryptionLogs] = useState<string[]>([]);

  // Project editing forms state
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState<Partial<Project>>({
    title: "",
    tagline: "",
    description: "",
    usersCount: "",
    performanceMetric: "",
    tech: [],
    category: "ai"
  });
  const [techInput, setTechInput] = useState("");

  // Experience editing forms state
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [newExperience, setNewExperience] = useState<Partial<Experience>>({
    role: "",
    company: "",
    period: "",
    highlights: [],
    icon: "Shield"
  });
  const [highlightInput, setHighlightInput] = useState("");

  // Threat alert manual simulation dispatch states
  const [customAttack, setCustomAttack] = useState({
    source: "Tashkent Admin HQ",
    target: "Security Firewall Sandbox",
    attackType: "Manual Security Test Blocked",
    severity: "high" as "high" | "medium" | "low",
    direction: "Inbound" as "Inbound" | "Outbound"
  });
  const [alertDispatched, setAlertDispatched] = useState(false);

  // Dynamic branding customizations
  const [brandForm, setBrandForm] = useState<LogoBranding>({ ...branding });

  // Article creation states
  const [newArticle, setNewArticle] = useState<Partial<AdminArticle>>({
    title: "",
    category: "Sun'iy Intellekt",
    content: "",
    coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    author: branding.name || "Muxammadali Gulmurodov",
    readTime: "3 daqiqa"
  });

  // Video creation states
  const [newVideo, setNewVideo] = useState({
    title: "",
    description: "",
    embedUrl: "",
    duration: "10:00"
  });

  // Mock index and crawler states
  const [mockKeywordsInput, setMockKeywordsInput] = useState(seoSettings.keywords);
  const [mockDescInput, setMockDescInput] = useState(seoSettings.metaDescription);
  const [mockSitemapInput, setMockSitemapInput] = useState(seoSettings.sitemapUrl);
  const [isIndexedInput, setIsIndexedInput] = useState(seoSettings.isGoogleIndexed);
  const [seoCheckLoading, setSeoCheckLoading] = useState(false);
  const [seoLogs, setSeoLogs] = useState<string[]>([]);

  // Asset image upload states
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [imageUrlFormInput, setImageUrlFormInput] = useState("");
  const [imageNameFormInput, setImageNameFormInput] = useState("");

  // Analytics input states
  const [analyticsForm, setAnalyticsForm] = useState<AnalyticsMetric>({ ...analytics });

  // Authentication submission
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPasscodes.includes(passcode.trim())) {
      setIsAuthenticated(true);
      setAuthError("");
      const now = new Date().toLocaleTimeString();
      setSecurityLogs(prev => [...prev, `🔓 Muvaffaqiyatli kirildi. Vaqt: ${now}`]);
    } else {
      setAuthError("Xavfsizlik kodi noto'g'ri!");
      setPasscode("");
      setTimeout(() => setAuthError(""), 3000);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPasscode("");
  };

  // Safe decryption simulator
  const triggerDecryption = (msgId: string) => {
    if (decryptedIds.includes(msgId)) return;
    setDecryptingId(msgId);
    setDecryptionLogs([
      "📡 RSA-4096 shifr kalitlari qidirilmoqda...",
      "⚙️ Kalit parametrlari test qilinmoqda..."
    ]);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step === 1) {
        setDecryptionLogs(prev => [...prev, "🔑 Kod xeshi tekshirildi: [AE7F..42FF]"]);
      } else if (step === 2) {
        setDecryptionLogs(prev => [...prev, "🛡️ Aloqa xabari muvaffaqiyatli shifrdan yechildi!"]);
      } else if (step === 3) {
        clearInterval(interval);
        setDecryptedIds(prev => [...prev, msgId]);
        setDecryptingId(null);
        setDecryptionLogs([]);
        
        // Mark as read
        setMessages(prev => {
          const updated = prev.map(m => m.id === msgId ? { ...m, isRead: true } : m);
          localStorage.setItem("gmuhammadali_messages", JSON.stringify(updated));
          return updated;
        });
      }
    }, 400);
  };

  const deleteMessage = (id: string) => {
    const updated = messages.filter(m => m.id !== id);
    setMessages(updated);
    localStorage.setItem("gmuhammadali_messages", JSON.stringify(updated));
  };

  // --- PROJECTS ---
  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    const updated = projects.map(p => p.id === editingProject.id ? editingProject : p);
    setProjects(updated);
    localStorage.setItem("gmuhammadali_projects", JSON.stringify(updated));
    setEditingProject(null);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title) return;

    const created: Project = {
      id: "proj_" + Math.random().toString(36).substr(2, 9),
      title: newProject.title,
      tagline: newProject.tagline || "",
      description: newProject.description || "",
      performanceMetric: newProject.performanceMetric || "Active",
      usersCount: newProject.usersCount || "0+",
      tech: newProject.tech || [],
      category: newProject.category || "ai"
    };

    const updated = [...projects, created];
    setProjects(updated);
    localStorage.setItem("gmuhammadali_projects", JSON.stringify(updated));

    setNewProject({
      title: "",
      tagline: "",
      description: "",
      usersCount: "",
      performanceMetric: "",
      tech: [],
      category: "ai"
    });
    setTechInput("");
  };

  const deleteProject = (id: string) => {
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    localStorage.setItem("gmuhammadali_projects", JSON.stringify(updated));
  };

  // --- SKILLS ---
  const updateSkillLevel = (catId: string, skillName: string, newLevel: number) => {
    const updated = skillCategories.map(cat => {
      if (cat.id === catId) {
        return {
          ...cat,
          skills: cat.skills.map(s => s.name === skillName ? { ...s, level: newLevel } : s)
        };
      }
      return cat;
    });
    setSkillCategories(updated);
    localStorage.setItem("gmuhammadali_skills", JSON.stringify(updated));
  };

  // --- EXPERIENCES ---
  const handleSaveExperience = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExperience) return;
    const updated = experiences.map(exp => exp.id === editingExperience.id ? editingExperience : exp);
    setExperiences(updated);
    localStorage.setItem("gmuhammadali_experience", JSON.stringify(updated));
    setEditingExperience(null);
  };

  const handleCreateExperience = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExperience.role || !newExperience.company) return;

    const created: Experience = {
      id: "exp_" + Math.random().toString(36).substr(2, 9),
      role: newExperience.role,
      company: newExperience.company,
      period: newExperience.period || "2026",
      highlights: newExperience.highlights || [],
      icon: newExperience.icon || "Shield"
    };

    const updated = [...experiences, created];
    setExperiences(updated);
    localStorage.setItem("gmuhammadali_experience", JSON.stringify(updated));

    setNewExperience({
      role: "",
      company: "",
      period: "",
      highlights: [],
      icon: "Shield"
    });
    setHighlightInput("");
  };

  const deleteExperience = (id: string) => {
    const updated = experiences.filter(exp => exp.id !== id);
    setExperiences(updated);
    localStorage.setItem("gmuhammadali_experience", JSON.stringify(updated));
  };

  // --- REPUBLICATION THREATS EVENTS ---
  const dispatchThreatAlert = () => {
    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0];
    
    const fakeThreat: ThreatEvent = {
      id: Math.random().toString(),
      time: timeStr,
      source: customAttack.source,
      target: customAttack.target,
      attackType: customAttack.attackType,
      severity: customAttack.severity,
      direction: customAttack.direction
    };

    const event = new CustomEvent("gmuhammadali-threat", { detail: fakeThreat });
    window.dispatchEvent(event);

    setAlertDispatched(true);
    setTimeout(() => setAlertDispatched(false), 2000);
  };

  // --- LIVE BRANDING BRAND CUSTOMIZER ---
  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    setBranding(brandForm);
    localStorage.setItem("gmuhammadali_branding", JSON.stringify(brandForm));
    alert("Branding sozlamalari muvaffaqiyatli saqlandi!");
  };

  // --- BLOG ARTICLES CREATOR ---
  const handlePublishArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArticle.title || !newArticle.content) return;

    const published: AdminArticle = {
      id: "art_" + Math.random().toString(36).substr(2, 9),
      title: newArticle.title,
      category: newArticle.category || "Sun'iy Intellekt",
      content: newArticle.content,
      coverUrl: newArticle.coverUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      author: newArticle.author || branding.name || "Muxammadali",
      publishDate: new Date().toLocaleDateString("en-GB").replace(/\//g, "."),
      readTime: newArticle.readTime || "4 daqiqa"
    };

    const updated = [published, ...articles];
    setArticles(updated);
    localStorage.setItem("gmuhammadali_articles", JSON.stringify(updated));

    setNewArticle({
      title: "",
      category: "Sun'iy Intellekt",
      content: "",
      coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      author: branding.name || "Muxammadali Gulmurodov",
      readTime: "3 daqiqa"
    });
    alert("Yangi maqola e'lon qilindi va saytda faollashdi!");
  };

  const deleteArticle = (id: string) => {
    const updated = articles.filter(a => a.id !== id);
    setArticles(updated);
    localStorage.setItem("gmuhammadali_articles", JSON.stringify(updated));
  };

  // --- VIDEO MASTER CLASSES MEDIA VAULT ---
  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideo.title || !newVideo.embedUrl) return;

    // Standardize YouTube link to embed link if needed
    let finalEmbed = newVideo.embedUrl;
    if (!newVideo.embedUrl.startsWith("data:")) {
      if (newVideo.embedUrl.includes("watch?v=")) {
        const vidId = newVideo.embedUrl.split("watch?v=")[1]?.split("&")[0];
        if (vidId) finalEmbed = `https://www.youtube.com/embed/${vidId}`;
      } else if (newVideo.embedUrl.includes("youtu.be/")) {
        const vidId = newVideo.embedUrl.split("youtu.be/")[1]?.split("?")[0];
        if (vidId) finalEmbed = `https://www.youtube.com/embed/${vidId}`;
      }
    }

    const created: AdminVideo = {
      id: "vid_" + Math.random().toString(36).substr(2, 9),
      title: newVideo.title,
      description: newVideo.description,
      embedUrl: finalEmbed,
      duration: newVideo.duration || "Lokal",
      uploadedAt: new Date().toLocaleDateString("en-GB").replace(/\//g, ".")
    };

    const updated = [created, ...videos];
    setVideos(updated);
    localStorage.setItem("gmuhammadali_videos", JSON.stringify(updated));

    setNewVideo({
      title: "",
      description: "",
      embedUrl: "",
      duration: "10:00"
    });
    alert("Video darsligi muvaffaqiyatli integratsiya qilindi!");
  };

  const deleteVideo = (id: string) => {
    const updated = videos.filter(v => v.id !== id);
    setVideos(updated);
    localStorage.setItem("gmuhammadali_videos", JSON.stringify(updated));
  };

  // --- ASSET IMAGES UPLOADS GALLERY ---
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!imageNameFormInput) {
      setImageNameFormInput(file.name.split(".")[0]);
    }

    try {
      // Compress image client side to keep Firestore document size well within limits
      const compressedBase64 = await compressImage(file, 800, 800, 0.65);
      setImageUrlFormInput(compressedBase64);
    } catch (err) {
      console.error("Image compression failed, using original size:", err);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrlFormInput(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMockImageUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrlFormInput) {
      alert("Iltimos, avvalo rasm faylini tanlang (Yuklang)!");
      return;
    }

    setImageUploadLoading(true);
    setTimeout(() => {
      // Calculate approximate size from Base64 string length
      const approximateSizeInBytes = (imageUrlFormInput.length * 3) / 4;
      const sizeKb = Math.floor(approximateSizeInBytes / 1024);
      const displaySize = sizeKb > 1024 
        ? `${(sizeKb / 1024).toFixed(1)} MB` 
        : `${sizeKb} KB`;

      const created: AdminImage = {
        id: "img_" + Math.random().toString(36).substr(2, 9),
        name: imageNameFormInput || "custom_uploaded_asset.png",
        url: imageUrlFormInput,
        size: displaySize,
        uploadedAt: new Date().toLocaleDateString("en-GB").replace(/\//g, ".")
      };

      const updated = [created, ...images];
      setImages(updated);
      localStorage.setItem("gmuhammadali_images", JSON.stringify(updated));

      setImageUrlFormInput("");
      setImageNameFormInput("");
      setImageUploadLoading(false);
      alert("Fayl galereyadan muvaffaqiyatli saqlandi!");
    }, 800);
  };

  const deleteImage = (id: string) => {
    const updated = images.filter(img => img.id !== id);
    setImages(updated);
    localStorage.setItem("gmuhammadali_images", JSON.stringify(updated));
  };

  // --- SEO OPTIMIZER ---
  const handleSaveSEO = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: SEOSettings = {
      keywords: mockKeywordsInput,
      metaDescription: mockDescInput,
      sitemapUrl: mockSitemapInput,
      isGoogleIndexed: isIndexedInput
    };
    setSeoSettings(updated);
    localStorage.setItem("gmuhammadali_seo", JSON.stringify(updated));
    alert("SEO sozlamalari saqlandi!");
  };

  const runMockGoogleCrawler = () => {
    setSeoCheckLoading(true);
    setSeoLogs([
      "🔎 Google indexer spider-bot ulanmoqda [66.249.66.1]...",
      "📄 Metataglarni tahlil qilish: robot.txt tekshirilmoqda...",
      "📝 Kalit so'zlar mosligi tahlil qilinmoqda..."
    ]);

    setTimeout(() => {
      setSeoLogs(prev => [
        ...prev,
        `✓ Sitemap.xml yuklandi: faol statusli manzillar soni ${articles.length + projects.length + 5}`,
        `✓ MetaDescription oquvchanligi xatosi: 0 (A'lo!)`,
        `✓ Google indeks qidiruv muvaffaqiyatli yakunlandi!`
      ]);
      setSeoCheckLoading(false);
    }, 1500);
  };

  // --- ANALYTICS CONTROLLER ---
  const handleSaveAnalytics = (e: React.FormEvent) => {
    e.preventDefault();
    setAnalytics(analyticsForm);
    localStorage.setItem("gmuhammadali_analytics", JSON.stringify(analyticsForm));
    alert("Analitika ko'rsatkichlari test tizimi uchun yangilandi!");
  };

  // --- PASSCODE / PIN ---
  const handleAddPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasscodeInput.trim()) return;
    const updated = [...currentPasscodes, newPasscodeInput.trim()];
    setCurrentPasscodes(updated);
    localStorage.setItem("gmuhammadali_passcodes", JSON.stringify(updated));
    setNewPasscodeInput("");
    const now = new Date().toLocaleTimeString();
    setSecurityLogs(prev => [...prev, `🔑 Yangi PIN kod ro'yxatga qo'shildi: ${now}`]);
    alert("Yangi xavfsizlik passcodi kiritildi!");
  };

  const clearSecurityLogs = () => {
    setSecurityLogs(["🛡️ Tizim loglari yangilandi."]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="absolute w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-6xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden relative"
      >
        {/* Head header */}
        <div className="border-b border-slate-900 px-6 py-4 flex items-center justify-between bg-slate-950">
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="text-xs font-mono tracking-tight font-bold text-slate-100 flex items-center gap-1.5 uppercase">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>G-CORE SECURITY SUPERINTENDENT v3.5</span>
            </h2>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1 px-3 border border-slate-900 rounded bg-slate-900 text-slate-400 hover:text-white hover:border-slate-850 hover:bg-slate-850 transition text-xs font-mono uppercase cursor-pointer"
          >
            Yopish [Esc]
          </button>
        </div>

        {/* NOT AUTHENTICATED */}
        {!isAuthenticated ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-md mx-auto text-center space-y-6 my-10">
            <div className="w-12 h-12 bg-slate-900 border border-slate-850 text-cyan-400 flex items-center justify-center rounded-full">
              <Lock className="w-5 h-5 animate-pulse" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-200 font-mono uppercase tracking-wider">Passcode Tekshiruvi</h3>
              <p className="text-[11px] text-slate-500 font-sans leading-relaxed">
                Tizimning boshqaruv bloklariga kirish uchun xavfsizlik PIN-kodini kiriting.
              </p>
            </div>

            <form onSubmit={handleLogin} className="w-full space-y-3 font-mono">
              <input
                type="password"
                required
                autoFocus
                placeholder="Xavfsizlik Passcode (kod)"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-center text-xs text-slate-100 focus:outline-none focus:border-cyan-500 placeholder-slate-700 tracking-widest text-lg"
              />

              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 text-xs font-bold font-mono rounded tracking-wider cursor-pointer"
              >
                TIZIMGA ULANIShNI RUN ETISH
              </button>

              {authError && (
                <p className="text-[10px] text-rose-500 font-mono animate-shake">{authError}</p>
              )}
            </form>

            <span className="text-[9px] text-slate-600 font-mono">HURMATLI ADMIN, KOD SIZNING SHAXSIY KARTANGIZDA BELGILANGAN</span>
          </div>
        ) : (
          /* AUTHENTICATED SYSTEM PANEL */
          <div className="flex-1 flex overflow-hidden">
            
            {/* Sidebar navigation for 12 Tabs */}
            <div className="w-56 border-r border-slate-900 bg-slate-950/40 select-none overflow-y-auto max-h-full scrollbar-thin">
              <div className="p-3 border-b border-slate-900 bg-slate-950/80">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>SISTEMA ADMIN FAOL</span>
                </div>
              </div>

              <nav className="p-2 space-y-1 text-xs font-mono">
                <div className="text-[9px] text-slate-500 font-bold uppercase p-1.5 tracking-wider font-mono">ASOSIY SOZLAMALAR</div>
                
                <button
                  onClick={() => setActiveTab("branding")}
                  className={`w-full text-left p-2 rounded flex items-center gap-2 transition cursor-pointer ${activeTab === "branding" ? "bg-cyan-950/50 text-cyan-400 border border-cyan-900/40 font-bold" : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"}`}
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>Branding & Logo</span>
                </button>

                <button
                  onClick={() => setActiveTab("articles")}
                  className={`w-full text-left p-2 rounded flex items-center gap-2 transition cursor-pointer ${activeTab === "articles" ? "bg-cyan-950/50 text-cyan-400 border border-cyan-900/40 font-bold" : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"}`}
                >
                  <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                  <span>Blog Maqolalar</span>
                </button>

                <button
                  onClick={() => setActiveTab("videos")}
                  className={`w-full text-left p-2 rounded flex items-center gap-2 transition cursor-pointer ${activeTab === "videos" ? "bg-cyan-950/50 text-cyan-400 border border-cyan-900/40 font-bold" : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"}`}
                >
                  <Video className="w-3.5 h-3.5 shrink-0" />
                  <span>Video Vault</span>
                </button>

                <button
                  onClick={() => setActiveTab("gallery")}
                  className={`w-full text-left p-2 rounded flex items-center gap-2 transition cursor-pointer ${activeTab === "gallery" ? "bg-cyan-950/50 text-cyan-400 border border-cyan-900/40 font-bold" : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"}`}
                >
                  <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                  <span>Rasm galereyasi</span>
                </button>

                <div className="text-[9px] text-slate-500 font-bold uppercase p-1.5 pt-3 tracking-wider font-mono">Veb portfellar va CRUD</div>

                <button
                  onClick={() => setActiveTab("projects")}
                  className={`w-full text-left p-2 rounded flex items-center gap-2 transition cursor-pointer ${activeTab === "projects" ? "bg-cyan-950/50 text-cyan-400 border border-cyan-900/40 font-bold" : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"}`}
                >
                  <Briefcase className="w-3.5 h-3.5 shrink-0" />
                  <span>Loyihalar CRUD</span>
                </button>

                <button
                  onClick={() => setActiveTab("skills")}
                  className={`w-full text-left p-2 rounded flex items-center gap-2 transition cursor-pointer ${activeTab === "skills" ? "bg-cyan-950/50 text-cyan-400 border border-cyan-900/40 font-bold" : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"}`}
                >
                  <Code2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Skills Sliders</span>
                </button>

                <button
                  onClick={() => setActiveTab("experience")}
                  className={`w-full text-left p-2 rounded flex items-center gap-2 transition cursor-pointer ${activeTab === "experience" ? "bg-cyan-950/50 text-cyan-400 border border-cyan-900/40 font-bold" : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"}`}
                >
                  <Award className="w-3.5 h-3.5 shrink-0" />
                  <span>Tajriba Martabalari</span>
                </button>

                <div className="text-[9px] text-slate-500 font-bold uppercase p-1.5 pt-3 tracking-wider font-mono">Xabarlar va Aloqalar</div>

                <button
                  onClick={() => setActiveTab("inbox")}
                  className={`w-full text-left p-2 rounded flex items-center gap-2 transition cursor-pointer ${activeTab === "inbox" ? "bg-cyan-950/50 text-cyan-400 border border-cyan-900/40 font-bold" : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"}`}
                >
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span>Inbox Mijozlar</span>
                </button>

                <div className="text-[9px] text-slate-500 font-bold uppercase p-1.5 pt-3 tracking-wider font-mono">SEO, KIBER & ANALITIKA</div>

                <button
                  onClick={() => setActiveTab("seo")}
                  className={`w-full text-left p-2 rounded flex items-center gap-2 transition cursor-pointer ${activeTab === "seo" ? "bg-cyan-950/50 text-cyan-400 border border-cyan-900/40 font-bold" : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"}`}
                >
                  <Globe className="w-3.5 h-3.5 shrink-0" />
                  <span>SEO & Meta optimizer</span>
                </button>

                <button
                  onClick={() => setActiveTab("threats")}
                  className={`w-full text-left p-2 rounded flex items-center gap-2 transition cursor-pointer ${activeTab === "threats" ? "bg-cyan-950/50 text-cyan-400 border border-cyan-900/40 font-bold" : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"}`}
                >
                  <Radio className="w-3.5 h-3.5 shrink-0 animate-pulse text-red-500" />
                  <span>Threat Emitter</span>
                </button>

                <button
                  onClick={() => setActiveTab("analytics")}
                  className={`w-full text-left p-2 rounded flex items-center gap-2 transition cursor-pointer ${activeTab === "analytics" ? "bg-cyan-950/50 text-cyan-400 border border-cyan-900/40 font-bold" : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"}`}
                >
                  <BarChart3 className="w-3.5 h-3.5 shrink-0" />
                  <span>Trafik Analitika</span>
                </button>

                <button
                  onClick={() => setActiveTab("security")}
                  className={`w-full text-left p-2 rounded flex items-center gap-2 transition cursor-pointer ${activeTab === "security" ? "bg-cyan-950/50 text-cyan-400 border border-cyan-900/40 font-bold" : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"}`}
                >
                  <Key className="w-3.5 h-3.5 shrink-0" />
                  <span>Xavfsizlik & PIN</span>
                </button>
              </nav>

              <div className="p-3 border-t border-slate-900 mt-6 text-center">
                <button
                  onClick={handleLogout}
                  className="w-full text-[10px] py-1 bg-slate-900 hover:bg-red-950 border border-slate-850 hover:border-red-900 hover:text-red-400 rounded transition font-mono uppercase cursor-pointer"
                >
                  Tizimdan chiqish
                </button>
              </div>
            </div>

            {/* Content view screen */}
            <div className="flex-1 p-6 overflow-y-auto max-h-full bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-950/40 via-slate-950 to-slate-950 scrollbar-thin">
              
              {/* BRANDING EDITOR */}
              {activeTab === "branding" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">🎨 Branding & Logo Customizer (Brend va Logo tahriri)</h3>
                    <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                      Veb portfel sarlavhasini, qisqartma logoni va rang mavzularini o'zgartiring. Bu o'zgarish saytda avtomatik akslanadi.
                    </p>
                  </div>

                  <form onSubmit={handleSaveBranding} className="bg-slate-900/10 border border-slate-900 rounded-xl p-5 space-y-4 max-w-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                      <div>
                        <label className="block text-[10px] text-slate-500 uppercase mb-1">Qisqartma Harf (Initials Logo)</label>
                        <input
                          type="text"
                          maxLength={3}
                          value={brandForm.initials}
                          onChange={(e) => setBrandForm({ ...brandForm, initials: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-xs text-slate-100 placeholder-slate-700"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 uppercase mb-1">To'liq ism / Logo nomi</label>
                        <input
                          type="text"
                          value={brandForm.name}
                          onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-xs text-slate-100"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 uppercase mb-1">Mutaxassislik kodi / Subtitle</label>
                        <input
                          type="text"
                          value={brandForm.subtitle}
                          onChange={(e) => setBrandForm({ ...brandForm, subtitle: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-xs text-slate-100"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 uppercase mb-1">Dinamik profil Avatar rasm ulanishi (URL)</label>
                        <input
                          type="text"
                          placeholder="Ixtiyoriy rasm linki"
                          value={brandForm.avatarUrl}
                          onChange={(e) => setBrandForm({ ...brandForm, avatarUrl: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-xs text-slate-100 placeholder-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase mb-1 font-bold text-cyan-400">Yoki logotip rasm faylini yuklang (Galereya)</label>
                        <div className="flex items-center gap-3">
                          {brandForm.avatarUrl && (
                            <div className="w-10 h-10 rounded-full border border-slate-850 overflow-hidden bg-slate-950 flex-shrink-0">
                              <img 
                                src={brandForm.avatarUrl} 
                                alt="Branding Avatar Preview" 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          )}
                          <label className="flex-1 flex items-center justify-center gap-2 border border-dashed border-slate-850 hover:border-cyan-500/50 rounded px-3 py-1.5 cursor-pointer bg-slate-950/50 hover:bg-slate-950 transition text-slate-400 hover:text-cyan-300">
                            <Upload className="w-3.5 h-3.5" />
                            <span className="text-[10px]">Qurilmadan rasm tanlash (Galereyadan)</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    if (event.target?.result) {
                                      const img = new Image();
                                      img.src = event.target.result as string;
                                      img.onload = () => {
                                        const canvas = document.createElement("canvas");
                                        const maxDim = 256;
                                        let width = img.width;
                                        let height = img.height;
                                        if (width > height) {
                                          if (width > maxDim) {
                                            height = Math.round((height * maxDim) / width);
                                            width = maxDim;
                                          }
                                        } else {
                                          if (height > maxDim) {
                                            width = Math.round((width * maxDim) / height);
                                            height = maxDim;
                                          }
                                        }
                                        canvas.width = width;
                                        canvas.height = height;
                                        const ctx = canvas.getContext("2d");
                                        if (ctx) {
                                          ctx.drawImage(img, 0, 0, width, height);
                                          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
                                          setBrandForm({ ...brandForm, avatarUrl: compressedBase64 });
                                        } else {
                                          setBrandForm({ ...brandForm, avatarUrl: event.target.result as string });
                                        }
                                      };
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }} 
                              className="hidden" 
                            />
                          </label>
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[10px] text-slate-500 uppercase mb-1.5">Rang gradiyent palitrasi presets (Accent gradient)</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-[10px]">
                          {[
                            { label: "Cyan Magic", value: "from-cyan-500 to-emerald-400" },
                            { label: "Emerald Spark", value: "from-emerald-400 to-teal-600" },
                            { label: "Deep Sunset Purple", value: "from-rose-500 to-violet-600" },
                            { label: "Retro Orange", value: "from-orange-500 to-amber-400" }
                          ].map((preset) => (
                            <button
                              key={preset.value}
                              type="button"
                              onClick={() => setBrandForm({ ...brandForm, accentColor: preset.value })}
                              className={`p-2 border rounded cursor-pointer transition ${brandForm.accentColor === preset.value ? "bg-cyan-950/40 border-cyan-500 text-cyan-400 font-bold" : "bg-slate-950/60 border-slate-900 text-slate-400 hover:text-white"}`}
                            >
                              <span className={`inline-block w-2.5 h-2.5 rounded-sm bg-gradient-to-r ${preset.value} mr-1.5`} />
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-900/80 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                        <span>Saytdagi logoni jonli yangilaydi</span>
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 cursor-pointer bg-cyan-500 text-slate-950 font-bold font-mono text-xs rounded shadow-lg flex items-center gap-1"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>BRANDING SAQLASH</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* BLOG ARTICLES CREATOR */}
              {activeTab === "articles" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">📝 Blog & Maqolalar Ma'lumotlar Boshqaruvi</h3>
                    <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                      Veb portfelning yangi "Media & Blog" bo'limida chop etiladigan sun'iy intellekt va kiber-loyihalar maqolalarini yarating va boshqaring.
                    </p>
                  </div>

                  {/* Add article dialog */}
                  <details className="bg-slate-900/10 border border-slate-900 rounded-xl p-4 group">
                    <summary className="font-mono text-xs text-cyan-400 font-semibold cursor-pointer list-none flex items-center justify-between select-none">
                      <span className="flex items-center gap-1.5">
                        <Plus className="w-4 h-4 shrink-0" />
                        <span>Yangi Maqola Qo'shish Formasi</span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-600 transition-transform group-open:rotate-90" />
                    </summary>

                    <form onSubmit={handlePublishArticle} className="grid grid-cols-1 gap-4 mt-4 text-xs font-mono">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase mb-1">Maqola sarlavhasi (Title)</label>
                          <input
                            type="text"
                            required
                            placeholder="SMM da AI generativ strategiyalari"
                            value={newArticle.title}
                            onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-900 rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase mb-1">Maqola Yo'nalishi (Category)</label>
                          <select
                            value={newArticle.category}
                            onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-900 rounded px-3 py-1.5 text-xs text-slate-100"
                          >
                            <option value="Sun'iy Intellekt">🧠 Sun'iy Intellekt</option>
                            <option value="Kiberxavfsizlik">🔐 Kiberxavfsizlik</option>
                            <option value="SMM Marketing">📊 SMM Marketing</option>
                            <option value="Dasturlash">💻 Dasturlash</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase mb-1">Cover rasm ulanishi (Unsplash URL)</label>
                          <input
                            type="text"
                            value={newArticle.coverUrl}
                            onChange={(e) => setNewArticle({ ...newArticle, coverUrl: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-900 rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase mb-1">O'qish muddati (Masalan: 4 daqiqa)</label>
                          <input
                            type="text"
                            value={newArticle.readTime}
                            onChange={(e) => setNewArticle({ ...newArticle, readTime: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-900 rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 uppercase mb-1">Mavzu matni (Article complete Body)</label>
                        <textarea
                          required
                          rows={5}
                          placeholder="Bu yerga maqolaning batafsil matnini yozing..."
                          value={newArticle.content}
                          onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-900 rounded px-3 py-2 text-xs text-slate-100 focus:outline-none"
                        />
                      </div>

                      <div className="pt-1">
                        <button
                          type="submit"
                          className="px-4 py-2 cursor-pointer bg-emerald-500 text-slate-950 font-bold text-xs rounded hover:bg-emerald-400 transition"
                        >
                          MAQOLANI PORTALDA CHOP ETISH
                        </button>
                      </div>
                    </form>
                  </details>

                  {/* List active articles */}
                  <div className="space-y-3 pt-2">
                    <span className="block text-[10px] text-slate-500 uppercase font-mono">Hozirgi maqolalar ({articles.length})</span>
                    <div className="space-y-2">
                      {articles.map((art) => (
                        <div key={art.id} className="flex justify-between items-center bg-slate-900/10 border border-slate-900 p-3 rounded-lg text-xs font-mono">
                          <div className="truncate pr-4">
                            <span className="px-1.5 py-0.5 text-[9px] bg-slate-950 text-slate-400 rounded border border-slate-850 uppercase mr-2">{art.category}</span>
                            <span className="text-slate-200 font-sans font-bold">{art.title}</span>
                          </div>
                          <button
                            onClick={() => deleteArticle(art.id)}
                            className="p-1 px-2 border border-slate-900 hover:border-red-900 bg-slate-950/40 text-slate-500 hover:text-red-400 rounded transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* VIDEO SYSTEM VAULT */}
              {activeTab === "videos" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">📹 Video Media Masterclasses (Darsliklarni yuklash)</h3>
                    <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                      Saytda aks etadigan video masterklass links ro'yxatini tahrirlang (YouTube yoki embed havolalar).
                    </p>
                  </div>

                  <form onSubmit={handleAddVideo} className="bg-slate-900/10 border border-slate-900 rounded-xl p-5 space-y-4 max-w-2xl font-mono text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-slate-500 uppercase mb-1">Darslikning nomi (Video Title)</label>
                        <input
                          type="text"
                          required
                          placeholder="Masalan: Phishing saytlardan himoyalanish darsi"
                          value={newVideo.title}
                          onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-100"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 uppercase mb-1">Dars Davomiyligi (Duration)</label>
                        <input
                          type="text"
                          placeholder="12:45"
                          value={newVideo.duration}
                          onChange={(e) => setNewVideo({ ...newVideo, duration: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-100"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[10px] text-slate-500 uppercase mb-1">YouTube / Embed Video Havola ulanishi (Embed link / watch URL)</label>
                        <input
                          type="text"
                          required={!newVideo.embedUrl}
                          placeholder="Havola yoki quyidan video fayl yuklang..."
                          value={newVideo.embedUrl.startsWith("data:") ? "Muvaffaqiyatli qurilmadan yuklandi" : newVideo.embedUrl}
                          onChange={(e) => setNewVideo({ ...newVideo, embedUrl: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-700"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[10px] text-slate-400 uppercase mb-1 font-bold text-cyan-400">Yoki dars videosini qurilmadan yuklang (Galereya)</label>
                        <div className="space-y-2">
                          <label className="flex items-center justify-center gap-2 border border-dashed border-slate-850 hover:border-cyan-500/50 rounded px-3 py-2 cursor-pointer bg-slate-950/50 hover:bg-slate-950 transition text-slate-400 hover:text-cyan-300">
                            <Upload className="w-3.5 h-3.5" />
                            <span className="text-[10px]">Qurilmadan video tanlash (.mp4, .mov, .avi, vb.)</span>
                            <input 
                              type="file" 
                              accept="video/*" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const sizeMb = file.size / (1024 * 1024);
                                  if (sizeMb > 1.5) {
                                    alert(
                                      `❌ Video darsligi hajmi juda katta (${sizeMb.toFixed(1)} MB).\n\nPortfolio barcha telefon va qurilmalarda bir xil sinxron ishlashi uchun video fayli hajmi 1.5 MB dan kichik bo'lishi kerak.\n\nTavsiya: Dars videosini YouTube yoki Google Drive-ga yuklab, uning embed/ulanish havolasini tepaga kiriting. Bu barcha qurilmalarda juda tez va bexato yuklanadi!`
                                    );
                                    e.target.value = "";
                                    return;
                                  }
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    if (event.target?.result) {
                                      setNewVideo({ 
                                        ...newVideo, 
                                        embedUrl: event.target.result as string,
                                        duration: "Lokal Video"
                                      });
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }} 
                              className="hidden" 
                            />
                          </label>
                          {newVideo.embedUrl && newVideo.embedUrl.startsWith("data:") && (
                            <div className="bg-slate-950 p-2.5 border border-slate-850 rounded-lg space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-mono text-emerald-400 block font-bold">✓ Lokal dars videosi yuklandi</span>
                                <button 
                                  type="button" 
                                  onClick={() => setNewVideo({ ...newVideo, embedUrl: "" })}
                                  className="text-[9px] font-mono text-red-400 hover:underline uppercase cursor-pointer"
                                >
                                  O'chirish
                                </button>
                              </div>
                              <video 
                                src={newVideo.embedUrl} 
                                controls 
                                className="w-full h-32 rounded bg-slate-900 border border-slate-850"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[10px] text-slate-500 uppercase mb-1">Video haqida qisqa tavsif</label>
                        <input
                          type="text"
                          placeholder="Kibersavodxonlik qoidalari va xakerlik ssenariylari tahlili."
                          value={newVideo.description}
                          onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-100"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2 cursor-pointer bg-cyan-400 text-slate-950 font-bold text-xs rounded hover:bg-cyan-300 transition"
                    >
                      DARS VIDEOSINI INTEGRATSIYA ETISH
                    </button>
                  </form>

                  {/* List active videos */}
                  <div className="space-y-3">
                    <span className="block text-[10px] text-slate-500 uppercase font-mono">Darslar ro'yxati ({videos.length})</span>
                    <div className="space-y-2">
                      {videos.map(vid => (
                        <div key={vid.id} className="flex justify-between items-center bg-slate-900/10 border border-slate-900 p-3 rounded-lg text-xs font-mono">
                          <div>
                            <span className="text-cyan-400 font-bold mr-2">[{vid.duration}]</span>
                            <span className="text-slate-200">{vid.title}</span>
                          </div>
                          <button
                            onClick={() => deleteVideo(vid.id)}
                            className="p-1 px-2 border border-slate-900 hover:border-red-900 bg-slate-950/40 text-slate-500 hover:text-red-400 rounded transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ASSET IMAGE GALLERY */}
              {activeTab === "gallery" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">🖼️ Portfolio Asset Gallery (Rasm va fayllar sandig'i)</h3>
                    <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                      Portfelingiz uchun rasmlar galereyasidir. Rasmlar ulanishini yuklang, saytning istalgan joylarida ishlatish uchun linkni oling.
                    </p>
                  </div>

                  <form onSubmit={handleMockImageUpload} className="bg-slate-900/10 border border-slate-900 rounded-xl p-5 space-y-4 max-w-2xl font-mono text-xs">
                    <span className="block font-mono text-[10px] text-slate-500 uppercase">📁 QURILMADAN YANGI RASM yuklash (FAQAT GALEREYADAN)</span>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase mb-1">Rasm nomi yoki kalit so'zi</label>
                          <input
                            type="text"
                            required
                            placeholder="SMM banner masterclass"
                            value={imageNameFormInput}
                            onChange={(e) => setImageNameFormInput(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-700"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase mb-1 font-bold text-emerald-400">Rasm faylini tanlang</label>
                          <label className="flex flex-col items-center justify-center border border-dashed border-slate-800 hover:border-emerald-500/50 rounded-lg p-4 cursor-pointer bg-slate-950/50 hover:bg-slate-950 transition group">
                            <Upload className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 mb-1 transition" />
                            <span className="text-[10px] text-slate-400 group-hover:text-emerald-300 text-center">Bosib galereyadan rasm tanlang</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              required={!imageUrlFormInput}
                              onChange={handleImageFileChange} 
                              className="hidden" 
                            />
                          </label>
                        </div>
                      </div>

                      {/* Image Preview Box */}
                      <div className="flex flex-col justify-between border border-slate-900 bg-slate-950/20 rounded-lg p-3">
                        <span className="block text-[9px] text-slate-500 uppercase mb-2">Tanlangan rasm ko'rinishi</span>
                        {imageUrlFormInput ? (
                          <div className="flex-1 flex flex-col justify-center items-center gap-2">
                            <div className="h-28 w-full max-w-[200px] bg-slate-900 border border-slate-800 rounded overflow-hidden relative">
                              <img 
                                src={imageUrlFormInput} 
                                alt="Fayl ko'rinishi" 
                                className="w-full h-full object-cover" 
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <span className="text-[9px] text-emerald-400 font-bold truncate max-w-xs">{imageNameFormInput || "Fayl yuklandi"}</span>
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center text-slate-600 text-center font-sans border border-dashed border-slate-900 rounded p-4">
                            <ImageIcon className="w-8 h-8 text-slate-700 mb-1" />
                            <p className="text-[10px]">Hozircha rasm tanlanmagan. Iltimos, qurilmangizdan rasm faylini tanlang.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={imageUploadLoading || !imageUrlFormInput}
                        className={`px-4 py-2 rounded font-bold text-xs font-mono uppercase flex items-center gap-1.5 transition ${
                          imageUploadLoading || !imageUrlFormInput 
                            ? "bg-slate-900 text-slate-500 cursor-not-allowed border border-slate-850" 
                            : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer shadow-md"
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{imageUploadLoading ? "ASSET YUKLANMOQDA..." : "GALEREYAGA SAQLASH"}</span>
                      </button>
                    </div>
                  </form>

                  <div className="space-y-3">
                    <span className="block text-[10px] text-slate-500 uppercase font-mono">Galereya rasmlari ({images.length})</span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {images.map(img => (
                        <div key={img.id} className="bg-slate-950 border border-slate-900 rounded-lg overflow-hidden p-2.5 space-y-2 text-xs font-mono">
                          <div className="h-28 bg-slate-900 rounded overflow-hidden">
                            <img src={img.url} alt={img.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div className="space-y-1">
                            <p className="font-sans font-bold text-slate-300 truncate" title={img.name}>{img.name}</p>
                            <div className="flex justify-between text-[9px] text-slate-500">
                              <span>{img.size}</span>
                              <span>{img.uploadedAt}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(img.url);
                                alert("Rasm havolasi buferga nusxalandi!");
                              }}
                              className="flex-1 py-1 text-center border border-slate-850 hover:bg-slate-900 text-cyan-400 rounded text-[9px] font-bold"
                            >
                              LINK KOPIYA
                            </button>
                            <button
                              onClick={() => deleteImage(img.id)}
                              className="p-1 px-2 border border-slate-850 hover:border-red-950 text-slate-400 hover:text-red-400 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* LOYIHALAR CRUD */}
              {activeTab === "projects" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">💼 Loyihalar Ro'yxati & CRUD tahriri</h3>
                    <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                      Portfolio bo'limidagi loyihalarni to'liq tahrirlang, o'chiring yoki yangi eng muhim ishlar qo'shing.
                    </p>
                  </div>

                  {editingProject && (
                    <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-5 space-y-4 max-w-2xl">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-mono font-bold text-cyan-400 uppercase">Loyihani Tahrirlash: {editingProject.title}</span>
                        <button onClick={() => setEditingProject(null)} className="text-[10px] font-mono text-slate-500 hover:text-slate-300">Bekor qilish</button>
                      </div>

                      <form onSubmit={handleSaveProject} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase mb-1">Loyiha Nomi (Title)</label>
                          <input
                            type="text"
                            required
                            value={editingProject.title}
                            onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-100"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase mb-1">Slogan (Tagline)</label>
                          <input
                            type="text"
                            required
                            value={editingProject.tagline}
                            onChange={(e) => setEditingProject({ ...editingProject, tagline: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-100"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-[10px] text-slate-500 uppercase mb-1">Mavzu Tavsifi (Description)</label>
                          <textarea
                            required
                            rows={3}
                            value={editingProject.description}
                            onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-100"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase mb-1 font-mono">Metrik ko'rsatkichi (Metric)</label>
                          <input
                            type="text"
                            value={editingProject.performanceMetric}
                            onChange={(e) => setEditingProject({ ...editingProject, performanceMetric: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-100"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase mb-1">Foydalanuvchilar (Users Count)</label>
                          <input
                            type="text"
                            value={editingProject.usersCount}
                            onChange={(e) => setEditingProject({ ...editingProject, usersCount: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-100"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <button
                            type="submit"
                            className="px-4 py-2 bg-cyan-500 cursor-pointer text-slate-950 font-bold text-xs rounded font-mono uppercase"
                          >
                            LOYIHA MA'LUMOTLARINI SAQLASH
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {!editingProject && (
                    <details className="bg-slate-900/10 border border-slate-900 rounded-xl p-4 group">
                      <summary className="font-mono text-xs text-cyan-400 font-semibold cursor-pointer list-none flex items-center justify-between select-none">
                        <span className="flex items-center gap-1.5">
                          <Plus className="w-4 h-4 shrink-0" />
                          <span>Yangi Loyiha Qo'shish Formasi</span>
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-600 transition-transform group-open:rotate-90" />
                      </summary>

                      <form onSubmit={handleCreateProject} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs font-mono">
                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase mb-1">Sarlavha (Title)</label>
                          <input
                            type="text"
                            required
                            placeholder="Masalan: G-Web Firewall AI"
                            value={newProject.title}
                            onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-900 rounded px-3 py-1.5 text-slate-100"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase mb-1">Tagline (Slogan)</label>
                          <input
                            type="text"
                            placeholder="Aqlli kiber firewall tizim"
                            value={newProject.tagline}
                            onChange={(e) => setNewProject({ ...newProject, tagline: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-900 rounded px-3 py-1.5 text-slate-100"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-[10px] text-slate-500 uppercase mb-1">Tarixi / Tavsifi (Description)</label>
                          <textarea
                            placeholder="Mijoz serverlari uchun maxsus datchik..."
                            value={newProject.description}
                            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-900 rounded px-3 py-1.5 text-slate-100"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase mb-1">Kategoriya</label>
                          <select
                            value={newProject.category}
                            onChange={(e) => setNewProject({ ...newProject, category: e.target.value as any })}
                            className="w-full bg-slate-950 border border-slate-900 rounded px-3 py-1.5 text-slate-100"
                          >
                            <option value="ai">🧠 AI</option>
                            <option value="cyber">🔐 Cyber Sec</option>
                            <option value="marketing">📊 Marketing</option>
                            <option value="web">💻 Web/App</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase mb-1">Ishlatilgan texnikalar (Vergulli ro'yxat)</label>
                          <input
                            type="text"
                            placeholder="React, Express, OpenAI"
                            value={techInput}
                            onChange={(e) => {
                              setTechInput(e.target.value);
                              setNewProject({ ...newProject, tech: e.target.value.split(",").map(s => s.trim()).filter(Boolean) });
                            }}
                            className="w-full bg-slate-950 border border-slate-900 rounded px-3 py-1.5 text-slate-100"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <button
                            type="submit"
                            className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded font-mono uppercase hover:bg-emerald-400"
                          >
                            LOYIHANI RO'YXATGA QO'SHISH
                          </button>
                        </div>
                      </form>
                    </details>
                  )}

                  {/* Existing projects list */}
                  <div className="space-y-3">
                    <span className="block text-[10px] text-slate-500 uppercase font-mono">Loyiha ro'yxati ({projects.length})</span>
                    <div className="space-y-2">
                      {projects.map(proj => (
                        <div key={proj.id} className="flex justify-between items-center bg-slate-900/10 border border-slate-900 p-3 rounded-lg text-xs font-mono">
                          <div>
                            <span className="text-slate-400 font-sans font-bold pr-2">{proj.title}</span>
                            <span className="text-slate-600">({proj.category})</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingProject(proj)}
                              className="p-1 px-2 border border-slate-900 hover:bg-slate-900 text-slate-400 hover:text-white rounded"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteProject(proj.id)}
                              className="p-1 px-2 border border-slate-900 hover:border-red-900 bg-slate-950/40 text-slate-500 hover:text-red-400 rounded transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SKILLS SLIDERS */}
              {activeTab === "skills" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">📊 Ko'nikmalar & Sliders darajasi</h3>
                    <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                      Portfolio sarlavhalaridagi o'zlashtirish burchaklari darajasini o'zgartiring. Range elementlar orqali darajani sozlang.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {skillCategories.map((cat) => (
                      <div key={cat.id} className="bg-slate-900/20 border border-slate-900 rounded-xl p-4 space-y-4 font-mono">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${cat.color}`} />
                          <h4 className="text-xs font-bold text-slate-300 uppercase">{cat.title}</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {cat.skills.map((s, idx) => (
                            <div key={idx} className="bg-slate-950/30 border border-slate-900/50 p-2.5 rounded-lg space-y-2">
                              <div className="flex justify-between items-center text-[11px]">
                                <span className="text-slate-300 truncate max-w-[70%]">{s.name}</span>
                                <span className="text-cyan-400 font-bold">{s.level}%</span>
                              </div>
                              <input
                                type="range"
                                min="1"
                                max="100"
                                value={s.level}
                                onChange={(e) => updateSkillLevel(cat.id, s.name, parseInt(e.target.value))}
                                className="w-full accent-cyan-500 h-1 bg-slate-900 rounded cursor-pointer"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* EXPERIENCE */}
              {activeTab === "experience" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">💼 Ish tajribasi bosqichlari boshqaruvi</h3>
                    <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                      Karyera timeline ro'yxatiga yangi ish tajribalari qo'shing yoki borlarini yangilang.
                    </p>
                  </div>

                  {editingExperience && (
                    <form onSubmit={handleSaveExperience} className="bg-slate-900/30 border border-slate-800 rounded-xl p-5 space-y-4 max-w-2xl font-mono text-xs">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-cyan-400">Tahrirlash: {editingExperience.role}</span>
                        <button type="button" onClick={() => setEditingExperience(null)} className="text-[10px] text-slate-500">Bekor qilish</button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase mb-1">Lavozim (Role)</label>
                          <input
                            type="text"
                            value={editingExperience.role}
                            onChange={(e) => setEditingExperience({ ...editingExperience, role: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase mb-1">Kompaniya</label>
                          <input
                            type="text"
                            value={editingExperience.company}
                            onChange={(e) => setEditingExperience({ ...editingExperience, company: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold rounded cursor-pointer text-xs"
                      >
                        SAQLASH
                      </button>
                    </form>
                  )}

                  {!editingExperience && (
                    <details className="bg-slate-900/10 border border-slate-900 rounded-xl p-4 group">
                      <summary className="font-mono text-xs text-cyan-400 font-semibold cursor-pointer list-none flex items-center justify-between select-none">
                        <span className="flex items-center gap-1.5">
                          <Plus className="w-4 h-4 shrink-0" />
                          <span>Yangi Karyera Bosqichi Qo'shish</span>
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-600 transition-transform group-open:rotate-90" />
                      </summary>

                      <form onSubmit={handleCreateExperience} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs font-mono">
                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase mb-1">Lavozim</label>
                          <input
                            type="text"
                            required
                            placeholder="Masalan: AI Developer Leader"
                            value={newExperience.role}
                            onChange={(e) => setNewExperience({ ...newExperience, role: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-900 rounded px-3 py-1.5 text-slate-100"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase mb-1">Idora / Kompaniya</label>
                          <input
                            type="text"
                            required
                            placeholder="Cyber Security Hub"
                            value={newExperience.company}
                            onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-900 rounded px-3 py-1.5 text-slate-100"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase mb-1">Ish Davri (Period)</label>
                          <input
                            type="text"
                            placeholder="2025 - Hozirgi"
                            value={newExperience.period}
                            onChange={(e) => setNewExperience({ ...newExperience, period: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-900 rounded px-3 py-1.5 text-slate-100"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase mb-1">Asosiy yutuqlar (Vergulli ro'yxat)</label>
                          <input
                            type="text"
                            placeholder="Trafik o'sishi 3 barobar | Firewall kuchaytirildi"
                            value={highlightInput}
                            onChange={(e) => {
                              setHighlightInput(e.target.value);
                              setNewExperience({ ...newExperience, highlights: e.target.value.split("|").map(s => s.trim()).filter(Boolean) });
                            }}
                            className="w-full bg-slate-950 border border-slate-900 rounded px-3 py-1.5 text-slate-100"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <button
                            type="submit"
                            className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded uppercase hover:bg-emerald-400"
                          >
                            KARYERA BOSQICHINI SAQLASH
                          </button>
                        </div>
                      </form>
                    </details>
                  )}

                  <div className="space-y-3">
                    <span className="block text-[10px] text-slate-500 uppercase font-mono">Tarixiy martaba bosqichlari ({experiences.length})</span>
                    <div className="space-y-2">
                      {experiences.map(exp => (
                        <div key={exp.id} className="flex justify-between items-center bg-slate-900/10 border border-slate-900 p-3 rounded-lg text-xs font-mono">
                          <div>
                            <span className="font-bold text-slate-200">{exp.role}</span> — <span className="text-slate-500">{exp.company} ({exp.period})</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingExperience(exp)}
                              className="p-1 px-2 border border-slate-900 hover:bg-slate-900 text-slate-400 hover:text-white rounded"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteExperience(exp.id)}
                              className="p-1 px-2 border border-slate-900 hover:border-red-900 bg-slate-950/40 text-slate-500 hover:text-red-400 rounded transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* INBOX CLIENT MESSAGES */}
              {activeTab === "inbox" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">📨 Inbox - Mijozlar Shifrlangan Xabarlari</h3>
                    <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                      Mijozlar yuborgan har bir xabar RSA-4096 shifri ostida keladi. Haqiqiy xabarni o'qish uchun uning ustiga bosib shifrni yeching.
                    </p>
                  </div>

                  {messages.length === 0 ? (
                    <div className="bg-slate-950/40 border border-slate-900 border-dashed rounded-xl p-8 text-center text-xs font-mono text-slate-500">
                      Mijozlardan hozircha shifrlangan xabarlar mavjud emas.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg) => {
                        const isDecrypted = decryptedIds.includes(msg.id);
                        return (
                          <div 
                            key={msg.id} 
                            className={`border rounded-xl p-4 space-y-3 font-mono text-xs transition relative ${isDecrypted ? "bg-slate-900/10 border-slate-900" : "bg-slate-900/5 border-slate-900/50 hover:bg-slate-900/10"}`}
                          >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-900/85 pb-2.5">
                              <div>
                                <span className="block text-[10px] text-slate-500 uppercase">Yuboruvchi shaxsi:</span>
                                <span className="font-bold text-slate-200">{isDecrypted ? msg.name : "🔐 SHIFRLANGAN MANBA"}</span>
                              </div>
                              <div>
                                <span className="block text-[10px] text-slate-500 uppercase md:text-right">Veb kodi ulanishi:</span>
                                <span className="text-cyan-400 text-[10px]">{isDecrypted ? msg.email : "RSA-4096_SSL_KEY"}</span>
                              </div>
                            </div>

                            <div className="space-y-1.5 py-1">
                              <span className="block text-[10px] text-slate-500 uppercase">Xabar matni tavsifi:</span>
                              {isDecrypted ? (
                                <p className="text-slate-300 font-sans text-xs bg-slate-950/50 p-3 border border-slate-900 rounded-lg whitespace-pre-wrap">{msg.message}</p>
                              ) : (
                                <div className="p-3 bg-slate-950/80 border border-slate-900 rounded-lg text-slate-500 select-all font-mono tracking-widest break-all text-[10px] leading-relaxed">
                                  U0dWeWMyOW1kR0Z5Y0dWeWMyOW1kR0Z5Y0dWeWMyOW1kR0Z5Y0dWeWMyOW1kR0Z5Y0dWeWMyOW1kR0Z5Y0dWeWMyOW1kR0Z5
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                              <span className="text-[9px] text-slate-600 uppercase">{msg.timestamp}</span>

                              <div className="flex items-center gap-2">
                                {!isDecrypted && (
                                  <button
                                    onClick={() => triggerDecryption(msg.id)}
                                    disabled={decryptingId !== null}
                                    className="px-3.5 py-1.5 cursor-pointer bg-cyan-500 text-slate-950 font-bold text-[10px] rounded hover:bg-cyan-400 transition"
                                  >
                                    {decryptingId === msg.id ? "SHIFR YECHILMOQDA..." : "DECRYPT XABAR MATHNI"}
                                  </button>
                                )}

                                <button
                                  onClick={() => deleteMessage(msg.id)}
                                  className="p-1 px-2 border border-slate-850 bg-slate-950/40 text-slate-500 hover:text-red-400 rounded hover:border-red-950 transition"
                                >
                                  Xabarni o'chirish
                                </button>
                              </div>
                            </div>

                            {/* Decryption simulator logs */}
                            {decryptingId === msg.id && (
                              <div className="p-3 bg-slate-950 border border-slate-900 rounded-lg space-y-1 mt-2">
                                <span className="block text-[8px] text-cyan-400 font-mono animate-pulse">DECRYPTION TERMINAL ACTIVE:</span>
                                {decryptionLogs.map((log, idx) => (
                                  <p key={idx} className="text-[9px] text-slate-400 font-mono truncate">{log}</p>
                                ))}
                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* SEO & GOOGLE OPTIMIZER */}
              {activeTab === "seo" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">🌐 SEO & Meta Tags Controller (Google Index Indexer)</h3>
                    <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                      Qidiruv mexanizmlari metama'lumotlarini o'zgartiring va bepul organik Google o'sish test datchiklarini boshqaring.
                    </p>
                  </div>

                  <form onSubmit={handleSaveSEO} className="bg-slate-900/10 border border-slate-900 rounded-xl p-5 space-y-4 max-w-2xl font-mono text-xs">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-[10px] text-slate-500 uppercase mb-1">Meta kalit so'zlar (Meta Keywords - Vergulli ro'yxat)</label>
                        <input
                          type="text"
                          value={mockKeywordsInput}
                          onChange={(e) => setMockKeywordsInput(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 uppercase mb-1">Meta Tavsif (SEO Meta Description)</label>
                        <textarea
                          rows={3}
                          value={mockDescInput}
                          onChange={(e) => setMockDescInput(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase mb-1">Sitemap manzili (Sitemap Xml)</label>
                          <input
                            type="text"
                            value={mockSitemapInput}
                            onChange={(e) => setMockSitemapInput(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-xs text-slate-100"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase mb-1">Google qizil datchigi statusi (Google Index status)</label>
                          <div className="flex items-center gap-2 mt-2 h-7">
                            <input
                              type="checkbox"
                              checked={isIndexedInput}
                              onChange={(e) => setIsIndexedInput(e.target.checked)}
                              className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                              id="is-google-indexed-chk"
                            />
                            <label htmlFor="is-google-indexed-chk" className="text-slate-300 font-bold select-none cursor-pointer">Index ulanish faol</label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-900/80 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={runMockGoogleCrawler}
                        className="px-3 py-2 bg-slate-900 border border-slate-850 hover:border-slate-700 text-slate-300 hover:text-white rounded"
                      >
                        Crawler testini ishga tushirish (Google Crawler test)
                      </button>

                      <button
                        type="submit"
                        className="px-4 py-2 cursor-pointer bg-cyan-500 text-slate-950 font-bold rounded"
                      >
                        SEO INTEGRATSIYA SAQLASH
                      </button>
                    </div>
                  </form>

                  {/* Crawl logs view */}
                  {seoLogs.length > 0 && (
                    <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 max-w-2xl font-mono text-xs space-y-1.5 relative">
                      <span className="block text-[8px] text-slate-500 uppercase mb-1 animate-pulse">SEO CRAWL STATUS FEED:</span>
                      {seoLogs.map((log, idx) => (
                        <p key={idx} className="text-slate-400 text-[10px] leading-relaxed truncate">{log}</p>
                      ))}
                      {seoCheckLoading && <div className="absolute right-4 top-4 text-[9px] text-cyan-400 select-none animate-spin">⚡</div>}
                    </div>
                  )}
                </div>
              )}

              {/* THREATS SIMULATOR */}
              {activeTab === "threats" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">⚠️ Live Security Threat Simulator (Hujumlar Datchigi)</h3>
                    <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                      Live Cyber Threat Map paneliga datchiklardan soxta hakerlik hujumlari yo'llang. Bu saytdagi live terminalda bevosita tahlil qilinadi.
                    </p>
                  </div>

                  <div className="bg-slate-900/10 border border-slate-900 p-5 rounded-xl space-y-4 max-w-2xl text-xs font-mono">
                    <span className="block text-xs font-mono font-bold text-rose-500 uppercase flex items-center gap-1.5 select-none">
                      <AlertOctagon className="w-4 h-4 shrink-0 animate-bounce" />
                      <span>SIMULATED SECURITY CONTROL HQ</span>
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-slate-500 uppercase mb-1">Anomaliya manbasi (Source IP / Region)</label>
                        <input
                          type="text"
                          value={customAttack.source}
                          onChange={(e) => setCustomAttack({ ...customAttack, source: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-slate-100"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 uppercase mb-1">Anomaliya mo'ljali (Target host)</label>
                        <input
                          type="text"
                          value={customAttack.target}
                          onChange={(e) => setCustomAttack({ ...customAttack, target: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-slate-100"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 uppercase mb-1">Xavf Turi (Attack Vector)</label>
                        <select
                          value={customAttack.attackType}
                          onChange={(e) => setCustomAttack({ ...customAttack, attackType: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-slate-100"
                        >
                          <option value="SQL Injection on auth blocked">SQL Injection on auth blocked</option>
                          <option value="Manual Security Test Blocked">Manual Security Test Blocked</option>
                          <option value="DDoS Bypass Intercepted by Web Firewall">DDoS Bypass Intercepted by Web Firewall</option>
                          <option value="Phishing Link Analyzer Discovered Payload">Phishing Link Analyzer Discovered Payload</option>
                          <option value="SSH Backdoor Scan Intercepted">SSH Backdoor Scan Intercepted</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 uppercase mb-1">Xavf darajasi (Severity)</label>
                        <select
                          value={customAttack.severity}
                          onChange={(e) => setCustomAttack({ ...customAttack, severity: e.target.value as any })}
                          className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-slate-100"
                        >
                          <option value="low">Paket monitoring darajasi (Low)</option>
                          <option value="medium">Tizim filtratsiyasi (Medium)</option>
                          <option value="high">Favqulodda to'xtatildi (High)</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center gap-3">
                      <button
                        onClick={dispatchThreatAlert}
                        className="px-4 py-2.5 bg-rose-600 text-slate-100 font-bold rounded hover:bg-rose-500 flex items-center gap-1 cursor-pointer"
                      >
                        <Radio className="w-4 h-4 text-white animate-pulse" />
                        <span>TAHDID DISPATCH QILISH (Run Incident)</span>
                      </button>

                      {alertDispatched && (
                        <span className="text-[10px] text-emerald-400 animate-pulse font-bold">
                          ✓ Live Threat Map vizualizatsiya xabari yo'llandi!
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TRAFFIC ANALYTICS */}
              {activeTab === "analytics" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">📈 Traffic & Interactive Analytics Simulator (Statistika tahriri)</h3>
                    <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                      Portfelingizdagi media hamda analytics statistika datchiklarini tahrirlang (Simulated Views, clicks, leads, conversions). Saytda ushbu analitika doimiy vizuallashadi.
                    </p>
                  </div>

                  <form onSubmit={handleSaveAnalytics} className="bg-slate-900/10 border border-slate-900 rounded-xl p-5 space-y-4 max-w-2xl font-mono text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-slate-500 uppercase mb-1">Umumiy tashriflar soni (Total Views)</label>
                        <input
                          type="number"
                          value={analyticsForm.views}
                          onChange={(e) => setAnalyticsForm({ ...analyticsForm, views: parseInt(e.target.value) || 0 })}
                          className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-slate-100 font-sans"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 uppercase mb-1">SMM Clicks / Reklama bosishlari</label>
                        <input
                          type="number"
                          value={analyticsForm.clicks}
                          onChange={(e) => setAnalyticsForm({ ...analyticsForm, clicks: parseInt(e.target.value) || 0 })}
                          className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-slate-100 font-sans"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 uppercase mb-1">Mijozlarni xaridorga aylantirish (Conversion Rate %)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={analyticsForm.conversion}
                          onChange={(e) => setAnalyticsForm({ ...analyticsForm, conversion: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-slate-100 font-sans"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 uppercase mb-1">Band qilingan konsultatsiyalar (Leads Booked)</label>
                        <input
                          type="number"
                          value={analyticsForm.consultationsBooked}
                          onChange={(e) => setAnalyticsForm({ ...analyticsForm, consultationsBooked: parseInt(e.target.value) || 0 })}
                          className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-slate-100 font-sans"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2 cursor-pointer bg-cyan-500 text-slate-950 font-bold text-xs rounded hover:bg-cyan-400 transition"
                    >
                      STATISTIKANI YANGILASH
                    </button>
                  </form>
                </div>
              )}

              {/* SECURITY & PIN CODE EDITOR */}
              {activeTab === "security" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">🔑 Security & Admin Passcode Access (PIN tizim boshqaruvi)</h3>
                    <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                      Admin paneliga kiruvchi passcode ro'yxatini yangilang, faol ruxsat belgilarini o'zgartiring va ulanish tarixining loglarini kuzating.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
                    <form onSubmit={handleAddPasscode} className="bg-slate-900/10 border border-slate-900 rounded-xl p-5 space-y-4 font-mono">
                      <span className="block text-[10px] text-slate-400 uppercase font-bold">YANGI PIN CODE QO'SHISH</span>
                      
                      <div>
                        <label className="block text-[10px] text-slate-500 uppercase mb-1">Passcode (kirish kodi)</label>
                        <input
                          type="text"
                          required
                          placeholder="Masalan: gmuhammadali999"
                          value={newPasscodeInput}
                          onChange={(e) => setNewPasscodeInput(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-slate-100 focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="px-4 py-2 cursor-pointer bg-emerald-500 text-slate-950 font-bold rounded"
                      >
                        PIN KODNII FAOL QILISh
                      </button>

                      <div className="space-y-1.5 mt-2">
                        <span className="block text-[10px] text-slate-500 uppercase">Amaldagi kodlar:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {currentPasscodes.map((code, idx) => (
                            <span key={idx} className="bg-slate-950 border border-slate-900 px-2.5 py-1 text-[10px] text-slate-300 rounded font-bold">
                              •••• (Nusxa)
                            </span>
                          ))}
                        </div>
                      </div>
                    </form>

                    {/* Connection historical log tracker */}
                    <div className="bg-slate-900/10 border border-slate-900 rounded-xl p-5 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <span className="block text-[10px] text-slate-400 uppercase font-bold">LOGIN HARAKATLARI LOGI</span>
                        <div className="space-y-1 max-h-40 overflow-y-auto scrollbar-thin text-[10px] leading-relaxed text-slate-400">
                          {securityLogs.map((log, idx) => (
                            <p key={idx} className="truncate">{log}</p>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={clearSecurityLogs}
                        className="w-full py-1.5 border border-slate-900 hover:border-slate-800 hover:text-white transition text-slate-500 text-[10px] rounded"
                      >
                        Tozalash loglari
                      </button>
                    </div>
                  </div>

                  {/* TELEGRAM NOTIFICATION SYSTEM CONFIGURATION */}
                  <div className="bg-slate-900/10 border border-slate-900 rounded-xl p-5 space-y-4 font-mono mt-6">
                    <div>
                      <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono flex items-center gap-2">
                        <Send className="w-4 h-4 text-cyan-400 animate-pulse" />
                        Telegram Xabarnoma Tizimi Sozlamalari
                      </h4>
                      <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                        Mijozlar portfoliodagi aloqa formasi orqali xabar yozishganda, u sizning shaxsiy Telegram botingiz orqali zudlik bilan sizga yetib boradi.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                      <div>
                        <label className="block text-[10px] text-slate-500 uppercase mb-1">Telegram Bot Token (HTTP API Key)</label>
                        <input
                          type="password"
                          placeholder="Token (masalan: 123456:ABC...)"
                          value={telegramSettings?.botToken || ""}
                          onChange={(e) => setTelegramSettings(prev => ({ ...prev, botToken: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-slate-100 focus:outline-none placeholder-slate-700 font-sans"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 uppercase mb-1">Chat ID (Shaxsiy ID)</label>
                        <input
                          type="text"
                          placeholder="Chat ID (masalan: 54321098)"
                          value={telegramSettings?.chatId || ""}
                          onChange={(e) => setTelegramSettings(prev => ({ ...prev, chatId: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-slate-100 focus:outline-none placeholder-slate-700"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <button
                        onClick={() => setTelegramSettings(prev => ({ ...prev, isEnabled: !prev.isEnabled }))}
                        className={`w-full py-2.5 px-4 cursor-pointer font-bold rounded tracking-wider flex items-center justify-center gap-2 transition duration-300 ${
                          telegramSettings?.isEnabled && telegramSettings?.botToken && telegramSettings?.chatId
                            ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950" 
                            : "bg-slate-900 border border-slate-850 hover:bg-slate-850 text-slate-400"
                        }`}
                      >
                        {telegramSettings?.isEnabled && telegramSettings?.botToken && telegramSettings?.chatId ? (
                          <>
                            <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                            XABARNOMA FAOL
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4 text-slate-400 stroke-[3]" />
                            FAOL EMAS
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleTestTelegram}
                        disabled={telegramTestLoading}
                        className="w-full py-2.5 px-4 cursor-pointer font-bold rounded bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 flex items-center justify-center gap-2 transition duration-300"
                      >
                        {telegramTestLoading ? (
                          <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        SINOV XABARI YUBORISH
                      </button>
                    </div>

                    {telegramTestStatus && (
                      <div className={`p-4 rounded-lg text-xs font-sans border ${
                        telegramTestStatus.success 
                          ? "bg-emerald-950/40 border-emerald-800 text-emerald-200" 
                          : "bg-rose-950/40 border-rose-800 text-rose-200"
                      }`}>
                        <div className="font-bold flex items-center gap-1.5">
                          {telegramTestStatus.success ? (
                            <Check className="w-4.5 h-4.5 text-emerald-400" />
                          ) : (
                            <X className="w-4.5 h-4.5 text-rose-400" />
                          )}
                          {telegramTestStatus.message}
                        </div>
                        {telegramTestStatus.details && (
                          <div className="mt-2 p-2 bg-slate-950 rounded border border-slate-850 font-mono text-[11px] overflow-auto max-h-[140px] text-slate-300 leading-relaxed">
                            <strong>Telegram API xatosi tafsiloti:</strong>
                            <pre className="mt-1 whitespace-pre-wrap">{telegramTestStatus.details}</pre>
                            <span className="block mt-2 text-slate-400 font-sans text-[10px]">
                              💡 Boshqotirma yechimi: Botni Telegramda yozib topgandan so'ng, unga albatta <strong>/start</strong> buyrug'ini bering va Bot Tokeniz/Chat IDingiz to'g'riligiga ishonch bosil qiling!
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="text-[10px] text-slate-400 bg-slate-950/40 p-3 rounded border border-slate-900/60 leading-relaxed font-sans mt-2">
                      💡 **Qanday sozlash kerak?** 
                      1. Telegramda <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-cyan-400 underline">@BotFather</a> botini qidirib oling va <code className="bg-slate-900 px-1 py-0.5 rounded text-cyan-300">/newbot</code> buyrug'i bilan yangi bot yarating. Chiqqan API tokenini nusxalab tepadagi **Bot Token** maydoniga joylang. 
                      2. <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer" className="text-cyan-400 underline">@userinfobot</a> ga xabar yozib o'zingizning shaxsiy Telegram IDingizni aniqlang va uni **Chat ID (Shaxsiy ID)** maydoniga joylang. 
                      3. Yaratgan botingizga kirib, albatta <code className="bg-slate-900 px-1 py-0.5 rounded text-cyan-300">/start</code> ni bosib qo'ying (aks holda bot sizga xabar yubora olmaydi).
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </motion.div>
    </div>
  );
}
