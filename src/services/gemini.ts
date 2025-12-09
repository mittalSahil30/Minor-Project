import { GoogleGenAI } from "@google/genai";
import type { ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

// --- Chatbot Logic ---
export const sendMessageToGemini = async (
  history: ChatMessage[],
  newMessage: string,
  userName: string,
  userBio?: string
): Promise<string> => {
  try {
    // Transform our stored history into Gemini's history format
    const recentHistory = history.slice(-20).map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    const systemInstruction = `
      You are MindBase, a compassionate, supportive, and empathetic mental health companion. 
      Your user is named ${userName}.
      
      User's Personal Background/Bio:
      "${userBio || 'The user has not provided a bio yet.'}"

      Use this background information to personalize your advice and understanding of their situation.
      For example, if the bio mentions specific struggles or interests, reference them gently where appropriate.
      
      Provide supportive, non-judgmental responses. 
      If the user seems in immediate danger, strictly advise them to seek professional help or call emergency services immediately.
      Keep responses concise but warm.
    `;

    const chat = ai.chats.create({
      model: MODEL_NAME,
      history: recentHistory,
      config: {
        systemInstruction: systemInstruction.trim(),
      },
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "I'm listening, please go on.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I apologize, I'm having trouble processing that right now. Could you try again?";
  }
};
