const express = require("express");
const router = express.Router();
const History = require("../models/History");
const { generateAI } = require("../utils/ai");
const { getSubtitles } = require("youtube-captions-scraper");

const isYouTubeLink = (text) => {
  if (!text || typeof text !== "string") return false;
  const clean = text.trim().toLowerCase();
  return clean.includes("youtube.com") || clean.includes("youtu.be");
};

const getVideoId = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  // Clean whitespace, surrounding quotes and brackets
  const url = rawUrl.trim().replace(/^["'<]|["'>]$/g, "");

  // 1. Direct 11-char Video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }

  // 2. Try Standard URL parsing
  try {
    const normalized = url.startsWith("http://") || url.startsWith("https://") 
      ? url 
      : "https://" + url;
    const parsed = new URL(normalized);

    // youtu.be/<id>
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.slice(1).split("/")[0].split("?")[0];
      if (/^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
    }

    // youtube.com (m.youtube.com, music.youtube.com, www.youtube.com)
    if (parsed.hostname.includes("youtube.com")) {
      // ?v=<id>
      const v = parsed.searchParams.get("v");
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;

      // /shorts/<id>, /live/<id>, /embed/<id>, /v/<id>
      const parts = parsed.pathname.split("/").filter(Boolean);
      const prefixIdx = parts.findIndex(p => ["shorts", "live", "embed", "v"].includes(p.toLowerCase()));
      if (prefixIdx !== -1 && parts[prefixIdx + 1]) {
        const id = parts[prefixIdx + 1].split("?")[0].split("&")[0];
        if (/^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
      }
    }
  } catch (e) {
    // Ignore and fall back to regex
  }

  // 3. Robust Regex fallback
  const regexes = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/|youtube\.com\/(?:embed|shorts|live|v)\/)([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.|m\.|music\.)?youtube\.com\/watch\?.*?v=([a-zA-Z0-9_-]{11})/,
    /(?:^|\s|\/)([a-zA-Z0-9_-]{11})(?:\?|&|\/|$)/
  ];

  for (const reg of regexes) {
    const match = url.match(reg);
    if (match && match[1] && /^[a-zA-Z0-9_-]{11}$/.test(match[1])) {
      return match[1];
    }
  }

  return null;
};

const fetchWithTimeout = (url, options = {}, timeoutMs = 12000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer));
};

const getTranscript = async (videoId) => {
  const apiKey = process.env.SUPADATA_API_KEY;

  if (apiKey && apiKey.trim() && !apiKey.includes("your_")) {
    const endpoints = [
      `https://api.supadata.ai/v1/youtube/transcript?videoId=${videoId}&text=true`,
      `https://api.supadata.ai/v1/youtube/transcript?videoId=${videoId}`,
      `https://api.supadata.ai/v1/youtube/transcript?url=https://www.youtube.com/watch?v=${videoId}`,
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetchWithTimeout(
          endpoint,
          { headers: { "x-api-key": apiKey.trim() } },
          12000
        );

        if (!response.ok) {
          continue;
        }

        const data = await response.json();
        console.log(`[Supadata] Endpoint success: ${endpoint}`);

        if (data.content) {
          if (Array.isArray(data.content)) {
            const joined = data.content.map((t) => t.text || t).join(" ");
            if (joined.trim().length > 30) return joined.substring(0, 8000);
          } else if (typeof data.content === "string" && data.content.trim().length > 30) {
            return data.content.substring(0, 8000);
          }
        }

        if (data.text && typeof data.text === "string" && data.text.trim().length > 30) {
          return data.text.substring(0, 8000);
        }

        if (data.transcript && typeof data.transcript === "string") {
          return data.transcript.substring(0, 8000);
        }

        if (Array.isArray(data)) {
          const joined = data.map((t) => t.text || t).join(" ");
          if (joined.trim().length > 30) return joined.substring(0, 8000);
        }
      } catch (err) {
        console.warn(`[Supadata] Endpoint error: ${endpoint} → ${err.message}`);
      }
    }
  }

  // Fallback: youtube-captions-scraper
  try {
    const captions = await getSubtitles({ videoID: videoId, lang: "en" });
    if (captions && captions.length > 0) {
      const joined = captions.map((c) => c.text).join(" ");
      if (joined.trim().length > 30) {
        console.log(`[Captions Scraper] Success fetching subtitles for ${videoId}`);
        return joined.substring(0, 8000);
      }
    }
  } catch (err) {
    console.warn(`[Captions Scraper] Scraper failed for ${videoId}: ${err.message}`);
  }

  throw new Error("Transcript is not available for this video.");
};

router.post("/summary", async (req, res) => {
  const { text, language = "English" } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: "Text is required" });
  }

  try {
    let contentToSummarize = text.trim();

    if (isYouTubeLink(contentToSummarize)) {
      const cleanLower = contentToSummarize.toLowerCase();

      // Playlist link check
      if (cleanLower.includes("playlist?list=") && !cleanLower.includes("v=")) {
        return res.status(400).json({
          summary: "⚠️ Yeh ek YouTube Playlist ka link hai. Kripya kisi specific video ka link paste karein!"
        });
      }

      // Channel link check
      if (cleanLower.includes("youtube.com/@") || cleanLower.includes("youtube.com/channel/") || cleanLower.includes("youtube.com/c/")) {
        return res.status(400).json({
          summary: "⚠️ Yeh ek YouTube Channel ka link hai. Kripya kisi specific video ka link paste karein!"
        });
      }

      const videoId = getVideoId(contentToSummarize);
      if (!videoId) {
        return res.status(400).json({
          summary: "⚠️ Invalid YouTube URL. Kripya kisi valid YouTube video ka link daalein (jaise: https://www.youtube.com/watch?v=... ya https://youtu.be/...)"
        });
      }

      console.log(`[YouTube] Video ID: ${videoId}`);

      try {
        contentToSummarize = await getTranscript(videoId);
        console.log(`[Transcript] Length: ${contentToSummarize.length} chars`);
        contentToSummarize = `[IMPORTANT: Transcript may be in any language but you MUST respond in ${language} ONLY]\n\n${contentToSummarize}`;
      } catch (err) {
        console.error("[Transcript Error]", err.message);
        return res.status(400).json({
          summary: `⚠️ Transcript is not available for this video.\nPossible reasons:\n• Is video me subtitles ya auto-captions enabled nahi hain\n• Video private ya age-restricted hai\n\nAap direct video ka text ya notes paste karke summary generate kar sakte hain!`,
        });
      }
    }

    const languagePrompts = {
      English: `Summarize the content in ENGLISH ONLY using ONLY bullet points. Even if the content is in Hindi or any other language, your response MUST be in English.
Rules:
- Every point MUST start with • symbol
- Each point on a new line
- No paragraphs, no intro sentence, no conclusion sentence
- Just bullet points only
Example format:
• First key point here
• Second key point here
• Third key point here`,

      Hindi: `Neeche diye gaye content ka summary SIRF HINDI mein aur SIRF bullet points mein karo. Content kisi bhi language mein ho, jawab SIRF Hindi Devanagari mein do.
Niyam:
- Har point • se shuru hona chahiye
- Har point nayi line pe ho
- Devanagari script mein likho
- Koi paragraph nahi, koi intro nahi, sirf bullet points
Example format:
• Pehla mukhya point yahan
• Doosra mukhya point yahan
• Teesra mukhya point yahan`,

      Hinglish: `Neeche diye gaye content ka summary SIRF HINGLISH mein aur SIRF bullet points mein karo. Content kisi bhi language mein ho, jawab SIRF Hinglish Roman script mein do.
Niyam:
- Har point • se shuru hona chahiye
- Har point nayi line pe ho
- SIRF Roman/Latin script use karo (Devanagari bilkul nahi)
- Hindi aur English words mix karo
- Koi paragraph nahi, koi intro nahi, sirf bullet points
Example format:
• Aaj humne Coulombs Law ke baare mein padha
• Yeh law do charges ke beech ki force calculate karta hai
• Force ka formula hai k * q1 * q2 divided by r squared`,
    };

    const prompt = languagePrompts[language] || languagePrompts["English"];

    const systemPrompt = `You are a summarizer that ONLY outputs bullet points.
STRICT RULES:
1. Every single point MUST start with • symbol
2. Each point on its own new line
3. NO paragraphs ever
4. NO intro sentences like "Here is the summary"
5. NO conclusion sentences
6. Just bullet points, nothing else
7. MOST IMPORTANT: You MUST respond in ${language} language ONLY — no matter what language the input/transcript is in.
${language === "English" ? "Write ONLY in English." : ""}
${language === "Hindi" ? "Write ONLY in Hindi using Devanagari script." : ""}
${language === "Hinglish" ? "Write ONLY in Hinglish using Roman/Latin script. Never use Devanagari." : ""}`;

    const userPrompt = `${prompt}\n\nContent to summarize:\n${contentToSummarize}`;

    let summary = await generateAI({
      systemPrompt,
      userPrompt,
      temperature: 0.3,
      maxTokens: 1024,
    });

    // Force bullet points — agar model ne paragraph diya toh convert karo
    const hasBullets = summary.includes("•") || summary.includes("* ") || summary.includes("- ");
    if (!hasBullets) {
      summary = summary
        .split(/(?<=[।.!?])\s+/)
        .filter(s => s.trim().length > 20)
        .map(s => `• ${s.trim()}`)
        .join("\n");
    }

    // * aur - ko • mein convert karo
    summary = summary
      .replace(/^\s*\*\s+/gm, "• ")
      .replace(/^\s*-\s+/gm, "• ");

    // Save to history async
    let userId = "guest";
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (token) {
        const jwt = require("jsonwebtoken");
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "neuronotes_secret_key");
        userId = decoded.id || decoded._id || "guest";
      }
    } catch {}

    History.create({ input: text, summary, language, userId }).catch((e) =>
      console.warn("[History Save Info]", e.message)
    );

    res.json({ summary });

  } catch (err) {
    console.error("[Summary Route Error]", err.message);
    res.status(500).json({ error: "Failed to generate summary: " + err.message });
  }
});

module.exports = router;
