const express = require("express");
const router = express.Router();
const { generateAI } = require("../utils/ai");

router.post("/ask", async (req, res) => {
  const { question, summary, language = "English" } = req.body;

  if (!question || !summary) {
    return res.status(400).json({ error: "Both question and summary are required." });
  }

  const langPrompt = {
    English: "Answer in clear English.",
    Hindi: "Jawab Hindi mein do (Devanagari script mein).",
    Hinglish: "Jawab Hinglish mein do — Roman script mein Hindi aur English mix karke. Devanagari bilkul nahi.",
  };

  try {
    const answer = await generateAI({
      systemPrompt: `You are a helpful study assistant. Answer questions based ONLY on the provided summary. If the answer is not in the summary, say so. Be concise. ${langPrompt[language] || langPrompt["English"]}`,
      userPrompt: `Summary:\n${summary}\n\nQuestion: ${question}`,
      temperature: 0.4,
      maxTokens: 512,
    });

    res.json({ answer });
  } catch (err) {
    console.error("[Ask Error]", err.message);
    res.status(500).json({ error: "Failed to generate answer: " + err.message });
  }
});

module.exports = router;
