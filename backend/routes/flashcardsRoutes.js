const express = require("express");
const router = express.Router();
const { generateAI } = require("../utils/ai");

router.post("/flashcards", async (req, res) => {
  const { summary, language = "English" } = req.body;
  if (!summary) return res.status(400).json({ error: "Summary required" });

  const langNote = language === "Hindi"
    ? "Questions aur answers Hindi mein likho (Devanagari)."
    : language === "Hinglish"
    ? "Questions aur answers Hinglish mein likho — Roman script mein Hindi+English mix."
    : "Write questions and answers in English.";

  try {
    const raw = await generateAI({
      systemPrompt: `You generate flashcards from summaries. Always return ONLY a valid JSON array, no markdown, no explanation. Format: [{"q":"question","a":"answer"}]`,
      userPrompt: `Generate 8 flashcards from this summary. ${langNote} Return ONLY the JSON array.\n\nSummary:\n${summary}`,
      temperature: 0.4,
      maxTokens: 1024,
    });

    let cleaned = raw.replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim();
    const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
    const flashcards = JSON.parse(jsonMatch ? jsonMatch[0] : cleaned);
    res.json({ flashcards });
  } catch (err) {
    console.error("[Flashcards Error]", err.message);
    res.status(500).json({ error: "Failed to generate flashcards: " + err.message });
  }
});

module.exports = router;
