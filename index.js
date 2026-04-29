import express from "express";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Force reload env from .env file, ignoring system variables
delete process.env.OPENAI_API_KEY;
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Debug: Show which API key is loaded
console.log("🔑 API Key loaded (first 20 chars):", process.env.OPENAI_API_KEY?.substring(0, 20));

app.post('/api/get-suggestions', async (req, res) => {
  const { idea } = req.body;
  
  if (!idea) {
    return res.status(400).json({ error: "Please provide a design idea." });
  }

  try {
    // Call 1: Improved version
    const improved = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "user",
        content: `You are a design critique expert. A designer has proposed this idea:\n\n"${idea}"\n\nProvide an IMPROVED version of this idea. Keep the core concept but suggest enhancements, refinements, or better execution.\n\nRespond with ONLY a valid JSON object (no markdown, no backticks, no extra text). Use these exact fields:\n{"title": "short name for the improvement", "description": "3-4 sentences explaining the enhancement"}`
      }],
      temperature: 0.7,
    });

    // Call 2: Completely different
    const alternative = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "user",
        content: `You are a creative design strategist. A designer has proposed:\n\n"${idea}"\n\nSuggest a COMPLETELY DIFFERENT idea that solves the same problem but takes a radically different approach.\n\nRespond with ONLY a valid JSON object (no markdown, no backticks, no extra text). Use these exact fields:\n{"title": "short name for this alternative", "description": "3-4 sentences explaining this new direction"}`
      }],
      temperature: 0.8,
    });

    // Call 3: Challenges & concerns
    const challenges = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "user",
        content: `You are a design critic. A designer proposed:\n\n"${idea}"\n\nIdentify potential FLAWS, CHALLENGES, or CONCERNS with this idea. What could go wrong? What assumptions might be incorrect? What important aspects might be overlooked?\n\nRespond with ONLY a valid JSON object (no markdown, no backticks, no extra text). Use these exact fields:\n{"title": "main concern or flaw", "description": "3-4 sentences explaining the challenge or flaw in detail", "suggestion": "1-2 sentences on how to address or mitigate this concern"}`
      }],
      temperature: 0.6,
    });

    // Helper function to parse JSON and strip markdown if needed
    function parseJSON(str) {
      let cleaned = str.trim();
      // Remove markdown code blocks if present (handle newlines)
      cleaned = cleaned.replace(/^```[\w]*\n?/m, '').replace(/\n?```$/m, '');
      return JSON.parse(cleaned);
    }

    // Parse responses
    const improvedData = parseJSON(improved.choices[0].message.content);
    const alternativeData = parseJSON(alternative.choices[0].message.content);
    const challengesData = parseJSON(challenges.choices[0].message.content);

    res.json({
      improved: improvedData,
      alternative: alternativeData,
      challenges: challengesData
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate suggestions." });
  }
});

app.listen(3001, () => {
  console.log("✓ Server running on http://localhost:3001");
  console.log("✓ Make sure OPENAI_API_KEY is set in your environment");
});

