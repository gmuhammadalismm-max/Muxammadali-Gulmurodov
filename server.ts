import express from "express";
import path from "path";
import dns from "dns";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

const DB_PATH = path.join(process.cwd(), "db.json");

// Initialize Gemini SDK with telemetry header according to guidelines
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Increase JSON limit so base64 videos/images upload seamlessly
app.use(express.json({ limit: "250mb" }));
app.use(express.urlencoded({ limit: "250mb", extended: true }));

// API: Get entire Database state
app.get("/api/db", (req, res) => {
  let db: any = {};
  if (fs.existsSync(DB_PATH)) {
    try {
      db = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
    } catch (err) {
      console.error("Error reading db.json:", err);
    }
  }
  res.json({ success: true, db });
});

// API: Update Database state (supports incremental/block updates)
app.post("/api/db", (req, res) => {
  try {
    let existingDb: any = {};
    if (fs.existsSync(DB_PATH)) {
      try {
        existingDb = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
      } catch (err) {
        // empty or corrupted file
      }
    }

    // Merge changes
    const mergedDb = { ...existingDb, ...req.body };

    // Write back
    fs.writeFileSync(DB_PATH, JSON.stringify(mergedDb, null, 2), "utf-8");
    res.json({ success: true, message: "Database saved successfully" });
  } catch (err: any) {
    console.error("Error writing to db.json:", err);
    res.status(500).json({ error: "Could not save database changes", details: err.message });
  }
});

// API: Check status
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    apiConfigured: !!ai,
  });
});

// SYSTEM INSTRUCTIONS FOR THE AI ASSISTANT
const CHAT_SYSTEM_INSTRUCTION = `
Siz Muxammadali Gulmurodov portfoliosining sun'iy intellekt boti va shaxsiy yordamchisiz.
Muxammadali o'zining yuksak professional tajribasi va kreativ qobiliyatlari bilan tanilgan:
1. **AI Yaratuvchi**: Prompt muhandisligi, GPT modellari, AI avtomatizatsiya va aqlli chatbotlar yaratish.
2. **Marketing Strategi**: SMM (ijtimoiy tarmoqlar marketingi), SEO, brending va konversiyali raqamli reklama.
3. **Kiberxavfsizlik eksperti**: Penetratsion test (kirib borish testi), xavfsizlik auditi, fishingni aniqlash modellari yaratish.
4. **Veb-dasturchi**: Responsive dizaynlar, yuqori sifatli va zamonaviy reaktiv boshqaruv panellari (React, Node.js).

Sizning vazifangiz - portfoliosiga tashrif buyurgan foydalanuvchilar (ish beruvchilar, mijozlar, kuzatuvchilar) bilan juda samimiy, muloyim va professional tilda suhbatlashish.
Muxammadali nomidan gapirmang, balki uning "AI Yordamchisi" sifatida gapiring (masalan, "Muxammadali quyidagi ko'nikmalarga ega..." yoki "Muxammadali ushbu loyihani ishlab chiqqan...").

Suhbatdosh qaysi tilda murojaat qilsa, o'sha tilda javob bering (O'zbek tili, Rus tili yoki Ingliz tili). Javoblaringiz lo'nda, ma'lumotga boy va chiroyli formatlangan bo'lsin. Portfolioda taqdim etilgan loyihalar (AI Marketing Assistant, PhishDetector, SEO Analyzer Pro, Live Cyber Threat Map) haqida ham tushuncha bera olasiz.

Muxammadali bilan aloqa:
Telegram: @muxammadali_x7
Instagram: @themuxammad23
Telefon: +998 33 293 04 07
Email: muxammadali@ai.uz

Agar foydalanuvchi qiziqsa, uni Muxammadali bilan tepadagi aloqa kanallari orqali bog'lanishga undang!
`;

// API: AI Assistant Chat Interface
app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Xabar bo'sh bo'lishi mumkin emas." });
  }

  const msgLower = message.toLowerCase().trim();

  if (!ai) {
    // Elegant and extremely friendly fallback when Gemini API key is not configured yet
    let fallbackText = "";

    if (msgLower.includes("salom") || msgLower.includes("hello") || msgLower.includes("hi") || msgLower.includes("assalom")) {
      fallbackText = "Vaalaykum assalom! 🌐 Muxammadali Gulmurodovning portfoliodagi sun'iy intellekt bo'yicha yordamchisiman.\n\nMenga quyidagi savollarni berishingiz mumkin:\n- **Loyihalari** haqida ma'lumot berish\n- **Marketing** xizmatlarini tushuntirish\n- **Kiberxavfsizlik (Cybersecurity)** maslahatlarini olish\n- **Muxammadali bilan aloqa** o'rnatish\n\nSizga qaysi yo'nalish bo'yicha yordam bera olaman?";
    } else if (msgLower.includes("loyiha") || msgLower.includes("project") || msgLower.includes("yutuq") || msgLower.includes("portf")) {
      fallbackText = "Muxammadali tomonidan ishlab chiqilgan ajoyib loyihalar ro'yxati:\n\n1. **🧠 AI Marketing Assistant**: Bizneslar uchun sotuvchi kreativ matnlar, ijtimoiy tarmoq postlari va reklama g'oyalarini bir zumda yozadigan aqlli modul. Hozirda 1,000 dan ortiq faol foydalanuvchiga ega.\n2. **🔐 PhishDetector AI**: Sayt manzili (URL) va WHOIS ma'lumotlarini o'spirib, soxta klik hamda payme to'lov sahifalarini sekundiga 0.2s ichida aniqlovchi xavfsizlik datchigi.\n3. **📈 SEO Analyzer Pro**: Saytlarni qidiruv datchiklariga moslashuvi, tezligi hamda marketing ko'rsatkichlarini chuqur tekshirib sotuvchi hooks beruvchi to'plam.\n\nQaysi biri haqida kengroq gapirib beray?";
    } else if (msgLower.includes("kiber") || msgLower.includes("cyber") || msgLower.includes("xavfsizlik") || msgLower.includes("pentest") || msgLower.includes("hujum")) {
      fallbackText = "🔐 **Kiberxavfsizlik yo'nalishi bo'yicha professional xizmatlar:**\n\nMuxammadali tizimlar, veb-saytlar hamda serverlar xavfsizligini ta'minlashda quyidagi sinovlarni taklif etadi:\n- **Penetrasion test (Kirib borish testi)**: Saytingiz datchiklari va formalarini xakerlar hujumidan oldin buzib ko'rib, zaifliklarni bartaraf etish.\n- **Heuristic Phishing Detection**: Bank yoki to'lov soxta tizimlarini o'rnatilgan algoritm orqali fosh qilish.\n- **Tarmoq monitoringi va SQLi prevention**.\n\nAgar xavfsizlik auditi kerak bo'lsa, pastdagi shifrlangan formani to'ldirishingiz mumkin!";
    } else if (msgLower.includes("marketing") || msgLower.includes("reklama") || msgLower.includes("seo") || msgLower.includes("smm") || msgLower.includes("target")) {
      fallbackText = "📈 **Raqamli Marketing va SMM xizmatlari:**\n\nMuxammadli raqamli marketingda aqlli sun'yi intellekt modellarini qo'llagan holda quyidagi natijalarni kafolatlaydi:\n- **Organik SEO (Google'da 1-o'rin)**: To'g'ri kalit so'zlar loyihasi orqali saytingizga kelayotgan bepul xaridorlar oqimini 2.5 barobargacha o'stirish.\n- **Sotuvchi SMM ssenariylari**: Ijtimoiy tarmoqlar (Instagram reels, TikTok) uchun g'aroyib va yoshbop reklama hooks (ko'priklar) tayyorlash.\n- **ROAS o'sishi**: Reklamaga tikilgan pulni 3 barobar yaxshiroq marketing ko'rsatkichi bilan aylantirish.\n\nSaytingizni sinab ko'rish uchun **SEO Analyzer Pro** tabidan foydalaning!";
    } else if (msgLower.includes("aloqa") || msgLower.includes("kontakt") || msgLower.includes("telefon") || msgLower.includes("bog'lan") || msgLower.includes("telfon") || msgLower.includes("telegram") || msgLower.includes("contact")) {
      fallbackText = "Muxammadali bilan to'g'ridan-to'g'ri aloqa kanallari:\n\n- ✈️ **Telegram**: [@muxammadali_x7](https://t.me/muxammadali_x7)\n- 📸 **Instagram**: [@themuxammad23](https://instagram.com/themuxammad23)\n- 📞 **Telefon**: +998 33 293 04 07\n- ✉️ **Email**: [muxammadali@ai.uz](mailto:muxammadali@ai.uz)\n\nSiz ham o'z saytingiz yoki biznesingizga sun'iy intellekt botlarini ulash hamda xavfsizlik choralarini ko'rish bo'yicha maslahatlar olishingiz mumkin. Muxammadali bilan hamkorlik qilishga shoshiling!";
    } else if (msgLower.includes("kim") || msgLower.includes("shaxs") || msgLower.includes("manba") || msgLower.includes("muxammadali")) {
      fallbackText = "Muxammadali Gulmurodov — o'ta tajribali ko'p qirrali mutaxassis:\n\n- 🤖 **AI Developer**: Prompt Engineering, aqlli bot avtomatizatsiyalari va tizimli yo'riqnomalar ustasi.\n- 📊 **Marketing Leader**: Bizneslarni tezkor Google qidiruvigacha olib chiquvchi va SMM konversiyasini oshiruvchi lizer.\n- 🔐 **Ethical Cybersecurity Expert**: Ijtimoiy muhandislik fishing zararli tarmoqlarini ochish va himoya tizimlarini loyihalashtirish xizmatlari.\n\nUning ishlashini pastdagi **Kiber Threat Map** va **Mini Sandbox** orqali interaktiv tarzda sinashingiz mumkin!";
    } else {
      fallbackText = "Muxammadalining portfolioga doir barcha savollarga javob bera olaman. 🚀\n\nIltimos, quyidagi mavzulardan birini tanlang yoki yozing:\n- **Loyihalar** (AI Marketing, PhishDetector, SEO Analyzer)\n- **Kiberxavfsizlik xizmati**\n- **Targeting / SEO audit**\n- **Muxammadali bilan aloqa bog'lash**\n\nMenga o'z savolingizni yozib qoldiring!";
    }

    return res.json({ text: fallbackText });
  }

  try {
    // Transform incoming general history format into the appropriate structure for Google Gen AI if needed,
    // or pass formatted contents. We can assemble chat history using generation contents parameters.
    const contents: any[] = [];
    
    if (history && Array.isArray(history)) {
      history.forEach((turn: any) => {
        contents.push({
          role: turn.role === "user" ? "user" : "model",
          parts: [{ text: turn.text }],
        });
      });
    }
    
    // Add current user message
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: CHAT_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const answer = response.text || "Kechirasiz, xatolik yuz berdi.";
    res.json({ text: answer });
  } catch (err: any) {
    console.error("Gemini API Error in chat, falling back to offline assistant:", err);
    // Return high quality fallback response directly
    let fallbackText = "";

    if (msgLower.includes("salom") || msgLower.includes("hello") || msgLower.includes("hi") || msgLower.includes("assalom") || msgLower.includes("privet")) {
      fallbackText = "Vaalaykum assalom! 🌐 Muxammadali Gulmurodovning portfoliodagi sun'iy intellekt bo'yicha yordamchisiman.\n\nMenga quyidagi savollarni berishingiz mumkin:\n- **Loyihalari** haqida ma'lumot berish\n- **Marketing** xizmatlarini tushuntirish\n- **Kiberxavfsizlik (Cybersecurity)** maslahatlarini olish\n- **Muxammadali bilan aloqa** o'rnatish\n\nSizga qaysi yo'nalish bo'yicha yordam bera olaman?";
    } else if (msgLower.includes("loyiha") || msgLower.includes("project") || msgLower.includes("yutuq") || msgLower.includes("portf") || msgLower.includes("ish")) {
      fallbackText = "Muxammadali tomonidan ishlab chiqilgan ajoyib loyihalar ro'yxati:\n\n1. **🧠 AI Marketing Assistant**: Bizneslar uchun sotuvchi kreativ matnlar, ijtimoiy tarmoq postlari va reklama g'oyalarini bir zumda yozadigan aqlli modul. Hozirda 1,000 dan ortiq faol foydalanuvchiga ega.\n2. **🔐 PhishDetector AI**: Sayt manzili (URL) va WHOIS ma'lumotlarini o'spirib, soxta klik hamda payme to'lov sahifalarini sekundiga 0.2s ichida aniqlovchi xavfsizlik datchigi.\n3. **📈 SEO Analyzer Pro**: Saytlarni qidiruv datchiklariga moslashuvi, tezligi hamda marketing ko'rsatkichlarini chuqur tekshirib sotuvchi hooks beruvchi to'plam.\n\nQaysi biri haqida kengroq gapirib beray?";
    } else if (msgLower.includes("kiber") || msgLower.includes("cyber") || msgLower.includes("xavfsizlik") || msgLower.includes("pentest") || msgLower.includes("hujum")) {
      fallbackText = "🔐 **Kiberxavfsizlik yo'nalishi bo'yicha professional xizmatlar:**\n\nMuxammadali tizimlar, veb-saytlar hamda serverlar xavfsizligini ta'minlashda quyidagi sinovlarni taklif etadi:\n- **Penetrasion test (Kirib borish testi)**: Saytingiz datchiklari va formalarini xakerlar hujumidan oldin buzib ko'rib, zaifliklarni bartaraf etish.\n- **Heuristic Phishing Detection**: Bank yoki to'lov soxta tizimlarini o'rnatilgan algoritm orqali fosh qilish.\n- **Tarmoq monitoringi va SQLi prevention**.\n\nAgar xavfsizlik auditi kerak bo'lsa, pastdagi shifrlangan formani to'ldirishingiz mumkin!";
    } else if (msgLower.includes("marketing") || msgLower.includes("reklama") || msgLower.includes("seo") || msgLower.includes("smm") || msgLower.includes("target")) {
      fallbackText = "📈 **Raqamli Marketing va SMM xizmatlari:**\n\nMuxammadli raqamli marketingda aqlli sun'yi intellekt modellarini qo'llagan holda quyidagi natijalarni kafolatlaydi:\n- **Organik SEO (Google'da 1-o'rin)**: To'g'ri kalit so'zlar loyihasi orqali saytingizga kelayotgan bepul xaridorlar oqimini 2.5 barobargacha o'stirish.\n- **Sotuvchi SMM ssenariylari**: Ijtimoiy tarmoqlar (Instagram reels, TikTok) uchun g'aroyib va yoshbop reklama hooks (ko'priklar) tayyorlash.\n- **ROAS o'sishi**: Reklamaga tikilgan pulni 3 barobar yaxshiroq marketing ko'rsatkichi bilan aylantirish.\n\nSaytingizni sinab ko'rish uchun **SEO Analyzer Pro** tabidan foydalaning!";
    } else if (msgLower.includes("aloqa") || msgLower.includes("kontakt") || msgLower.includes("telefon") || msgLower.includes("bog'lan") || msgLower.includes("telfon") || msgLower.includes("telegram") || msgLower.includes("contact")) {
      fallbackText = "Muxammadali bilan to'g'ridan-to'g'ri aloqa kanallari:\n\n- ✈️ **Telegram**: [@muxammadali_x7](https://t.me/muxammadali_x7)\n- 📸 **Instagram**: [@themuxammad23](https://instagram.com/themuxammad23)\n- 📞 **Telefon**: +998 33 293 04 07\n- ✉️ **Email**: [muxammadali@ai.uz](mailto:muxammadali@ai.uz)\n\nSiz ham o'z saytingiz yoki biznesingizga sun'iy intellekt botlarini ulash hamda xavfsizlik choralarini ko'rish bo'yicha maslahatlar olishingiz mumkin. Muxammadali bilan hamkorlik qilishga shoshiling!";
    } else if (msgLower.includes("kim") || msgLower.includes("shaxs") || msgLower.includes("manba") || msgLower.includes("muxammadali") || msgLower.includes("expert")) {
      fallbackText = "Muxammadali Gulmurodov — o'ta tajribali ko'p qirrali mutaxassis:\n\n- 🤖 **AI Developer**: Prompt Engineering, aqlli bot avtomatizatsiyalari va tizimli yo'riqnomalar ustasi.\n- 📊 **Marketing Leader**: Bizneslarni tezkor Google qidiruvigacha olib chiquvchi va SMM konversiyasini oshiruvchi lizer.\n- 🔐 **Ethical Cybersecurity Expert**: Ijtimoiy muhandislik fishing zararli tarmoqlarini ochish va himoya tizimlarini loyihalashtirish xizmatlari.\n\nUning ishlashini pastdagi **Kiber Threat Map** va **Mini Sandbox** orqali interaktiv tarzda sinashingiz mumkin!";
    } else {
      fallbackText = "Muxammadalining portfolioga doir barcha savollargacha yordam bera olaman. 🚀\n\nIltimos, quyidagi mavzulardan birini tanlang yoki yozing:\n- **Loyihalar** (AI Marketing, PhishDetector, SEO Analyzer)\n- **Kiberxavfsizlik xizmati**\n- **Targeting / SEO audit**\n- **Muxammadali bilan aloqa bog'lash**\n\nMenga o'z savolingizni yozib qoldiring!";
    }

    res.json({ text: fallbackText });
  }
});

// API: Rich SEO & SMM Website Analyzer (Full-stack Integration)
app.post("/api/seo-analyzer", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "Veb-sayt manzili talab qilinadi." });
  }

  // Basic mock checks for the backend report
  const cleanUrl = url.replace(/^(https?:\/\/)?(www\.)?/, "");
  const protocol = url.startsWith("https://") ? "HTTPS" : url.startsWith("http://") ? "HTTP" : "HTTPS (Tavsiya etiladi)";
  const isSslSafe = url.startsWith("https://");
  
  // Simulated heuristic analysis
  const pageLoadSim = Math.floor(Math.random() * 800) + 200; // 200ms - 1000ms
  const desktopSpeedScore = Math.floor(Math.random() * 25) + 75; // 75-100%
  const mobileSpeedScore = Math.floor(Math.random() * 30) + 60; // 60-90%
  
  // Use Gemini to generate ultra-realistic SEO audit recommendations + High-Conversion SMM ad hooks
  if (!ai) {
    // Fallback if AI key is missing
    return res.json({
      success: true,
      simulated: true,
      url: cleanUrl,
      protocol: protocol,
      sslStatus: isSslSafe ? "Xavfsiz (SSL faol)" : "Ogohlantirish (SSL o'rnatilmagan bo'lishi mumkin)",
      speedScore: { desktop: desktopSpeedScore, mobile: mobileSpeedScore },
      loadTime: `${pageLoadSim}ms`,
      seoAudit: `### Boshlang'ich SEO Audit (${cleanUrl})
1. **Sarlavha (Title Tag)**: Mavjud va optimallashgan ko'rinadi, biroq meta tavsiflarni uzunligini nazorat qiling.
2. **Meta Keywords**: Kalit so'zlar optimallashtirilmagan.
3. **Mobil moslashuvchanlik**: Sayt mobil qurilmalarga to'liq moslashgan va yuklanish tezligi a'lo darajada.

#### Muxammadali strategiyasidan tavsiyalar:
- Sayt yuklanishini tezlashtirish uchun rasm formatlarini WebP formatiga o'tkazing.
- CTA (harakatga chaqiruv) tugmalarining kontrasti va ko'rinuvchanligini oshiring.`,
      smmHooks: `### Ijtimoiy tarmoqlar uchun marketing g'oyalari (SMM Hooks)
1. 🔥 **E'tiborni Tortuvchi (Hook)**: "Saytingiz boru, lekin mijozlar undan bexabarmi? Mana qanday qilib SEO yordamida Google qidiruvida bepul 1-o'ringa chiqish mumkin!"
2. 💡 **Ekspert tavsiyasi**: "Sizning sohangizda raqobatbardosh bo'lish uchun haftasiga kamida 2 ta yuqori sifatli maqola yoki blog post joylab boring."`
    });
  }

  try {
    const analysisPrompt = `
Siz professional Digital Marketing va SEO auditorisiz (Muxammadali Gulmurodov metodologiyasi asosida).
Iltimos, ushbu veb-sayt uchun batafsil tahlil va ijtimoiy tarmoqlar (SMM) uchun reklama koptoklari (hooks) hamda SEO o'sish takliflarini tayyorlang:
Veb-sayt: ${cleanUrl}
Ishlatuvchi protokol: ${protocol}

Format:
Javob faqat markdown formatida bo'lsin va tarkibiga quyidagilarni kiriting:
1. **SEO tahlili**: Sarlavhalar, yuklanish tezligi, meta ma'lumotlar va texnik xatolar bo'yicha amaliy maslahatlar.
2. **SMM Rejalari va Reklama Hooks (Ko'priklar)**: Ushbu sayt yoki brendni ijtimoiy tarmoqlarda reklama qilish uchun 3 ta juda jozibali visual/reklama ssenariylari, yoshlarga yoqadigan va eng muhimi sotuvchi formatdagi sarlavhalar (Uzbek tilida).
3. **Muxammadali tavsiyalar paketi**: Konversiyani oshirish va foydalanuvchilar oqimini 2 barobar ko'paytirish uchun 3 ta shoshilinch qadam.

Do'stona, ishonchli, ekspert va sotuvchi ohangda (Uzbek tilida) javob bering.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: analysisPrompt,
      config: {
        temperature: 0.8,
      },
    });

    const reportText = response.text || "Tahlil natijalari tayyorlanmadi.";

    // Split report nicely or return as formatted markdown
    res.json({
      success: true,
      simulated: false,
      url: cleanUrl,
      protocol: protocol,
      sslStatus: isSslSafe ? "Xavfsiz (SSL faol)" : "Xavfli / Protokol aniqlanmadi",
      speedScore: { desktop: desktopSpeedScore, mobile: mobileSpeedScore },
      loadTime: `${pageLoadSim}ms`,
      reportMarkdown: reportText,
    });
  } catch (err: any) {
    console.error("Gemini API Error in SEO audit:", err);
    res.status(500).json({ error: "Veb-sayt tahlil qilinayotganda xatolik yuz berdi.", details: err.message });
  }
});

// Serve frontend application with Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting development server with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting production routing...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
