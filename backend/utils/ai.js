const Groq = require("groq-sdk");
const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Universal AI helper:
 * Tries Groq first (if GROQ_API_KEY is configured and valid),
 * and automatically falls back to Google Gemini if Groq fails or is not configured.
 */
async function generateAI({ systemPrompt = "", userPrompt = "", temperature = 0.3, maxTokens = 1024 }) {
  let groqError = null;

  // 1. Try Groq if GROQ_API_KEY is present
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey && groqKey.trim() && !groqKey.includes("your_")) {
    try {
      const groq = new Groq({ apiKey: groqKey.trim() });
      const messages = [];
      if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
      messages.push({ role: "user", content: userPrompt });

      const completion = await groq.chat.completions.create({
        messages,
        model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
        temperature,
        max_tokens: maxTokens,
      });

      const responseText = completion?.choices?.[0]?.message?.content;
      if (responseText) {
        return responseText.trim();
      }
    } catch (err) {
      groqError = err.message;
      console.warn(`[AI] Groq call failed (${err.message}). Trying Gemini fallback...`);
    }
  }

  // 2. Try Google Gemini fallback
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
  if (geminiKey && geminiKey.trim()) {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey.trim());
      const modelsToTry = [
        "gemini-3.5-flash-lite",
        "gemini-flash-lite-latest",
        "gemini-3.8-flash",
        "gemini-flash-latest",
      ];

      const fullPrompt = systemPrompt
        ? `${systemPrompt}\n\n[USER INPUT / CONTENT]:\n${userPrompt}`
        : userPrompt;

      let lastGeminiErr = null;
      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
              temperature,
              maxOutputTokens: maxTokens,
            },
          });
          const result = await model.generateContent(fullPrompt);
          const responseText = result.response.text();
          if (responseText) {
            return responseText.trim();
          }
        } catch (mErr) {
          lastGeminiErr = mErr;
          console.warn(`[AI] Gemini model ${modelName} failed: ${mErr.message}`);
        }
      }
      throw lastGeminiErr || new Error("All Gemini models failed.");
    } catch (gErr) {
      console.error(`[AI] Gemini call failed: ${gErr.message}`);
      throw new Error(`AI generation failed. Groq: ${groqError || "not set"}. Gemini: ${gErr.message}`);
    }
  }

  throw new Error(
    `No AI API key found! Please set GROQ_API_KEY or GEMINI_API_KEY in backend/.env. (Groq error: ${groqError || "none"})`
  );
}

module.exports = { generateAI };
