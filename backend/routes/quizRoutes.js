const express = require("express");
const router = express.Router();
const { generateAI } = require("../utils/ai");

router.post("/quiz", async (req, res) => {
  const { summary, language = "English" } = req.body;

  if (!summary) {
    return res.status(400).json({ error: "Summary is required" });
  }

  try {
    const raw = await generateAI({
      systemPrompt: `You are an expert quiz maker. Generate topic-based conceptual questions that test understanding of the subject matter — NOT reading comprehension questions about the passage. Questions should test if the student actually understands the concepts, facts, and topics covered. Never ask "According to the summary..." or "What does the passage say...". Ask direct knowledge questions about the topic. Return ONLY a valid JSON array, no extra text, no markdown.`,
      userPrompt: `The following is a summary of a topic. Identify the subject/topic from it and generate exactly 5 MCQ questions that test conceptual knowledge of that topic.

Rules:
- Questions must be about the TOPIC/CONCEPT, not about "what the summary says"
- Never use phrases like "According to the passage", "As mentioned", "The summary states"
- Ask direct factual/conceptual questions
- All questions in English
- Return ONLY a valid JSON array, no extra text, no markdown

Format:
[
  {
    "question": "Direct question about the topic?",
    "options": ["A) opt1", "B) opt2", "C) opt3", "D) opt4"],
    "answer": "A) opt1"
  }
]

Summary:
${summary}`,
      temperature: 0.5,
      maxTokens: 1024,
    });

    let cleaned = raw.replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim();
    const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
    const questions = JSON.parse(jsonMatch ? jsonMatch[0] : cleaned);
    res.json({ questions });

  } catch (err) {
    console.error("Quiz Error:", err.message);
    res.status(500).json({ error: "Failed to generate quiz: " + err.message });
  }
});

module.exports = router;
