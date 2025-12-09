import type { JournalEntry } from "../types";

// Safely retrieve API Key to avoid runtime crashes
const getHfApiKey = () => {
  try {
    return import.meta.env?.VITE_HUGGING_FACE_API_KEY || "";
  } catch (e) {
    console.warn("Error reading env:", e);
  }
  return "";
};

const HF_API_KEY = getHfApiKey();
const MODEL_ID = "SamLowe/roberta-base-go_emotions";

/**
 * Analyze text using the specific Hugging Face model requested.
 * Requires VITE_HUGGING_FACE_API_KEY in .env
 */
export const analyzeSentiment = async (text: string): Promise<string[]> => {
  // If no key is provided, return a safe fallback
  if (!HF_API_KEY) {
    console.warn("Missing VITE_HUGGING_FACE_API_KEY in .env file.");
    return ["Neutral"];
  }

  try {
    const response = await fetch(
      `https://router.huggingface.co/models/${MODEL_ID}`,
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ inputs: text }),
      }
    );

    if (!response.ok) {
        // Handle model loading state (503) which is common with free HF inference
        if (response.status === 503) {
            return ["model loading..."];
        }
        throw new Error(`HF API Error: ${response.statusText}`);
    }

    const result = await response.json();
    
    // The API usually returns a nested array: [[{ label: 'joy', score: 0.9 }, ...]]
    if (Array.isArray(result) && result.length > 0 && Array.isArray(result[0])) {
      const predictions = result[0];
      // Sort by score and take top 2 emotions
      const topEmotions = predictions
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, 2)
        .map((p: any) => p.label);
      
      return topEmotions;
    }

    return ["neutral"];
  } catch (error) {
    console.error("Sentiment Analysis Failed:", error);
    return ["analysis error"];
  }
};

/**
 * Calculate collective emotion based on past 5-7 entries.
 */
export const getCollectiveMood = (entries: JournalEntry[]): string => {
  if (entries.length === 0) return "Neutral";

  // Look at last 7 entries
  const recentEntries = entries.slice(0, 7);
  const emotionCounts: Record<string, number> = {};

  recentEntries.forEach(entry => {
    entry.emotions.forEach(emotion => {
      // Clean up emotion string
      const e = emotion.toLowerCase().trim();
      // Skip error messages
      if (e.includes('error') || e.includes('loading') || e.includes('missing')) return;
      
      emotionCounts[e] = (emotionCounts[e] || 0) + 1;
    });
  });

  // Find the most frequent emotion
  let maxCount = 0;
  let dominantMood = "Mixed";
  let hasData = false;

  Object.entries(emotionCounts).forEach(([emotion, count]) => {
    hasData = true;
    if (count > maxCount) {
      maxCount = count;
      dominantMood = emotion;
    }
  });

  if (!hasData) return "Neutral";

  return dominantMood.charAt(0).toUpperCase() + dominantMood.slice(1);
};