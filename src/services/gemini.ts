import { GoogleGenAI } from "@google/genai";
import { Message, Role } from "../types";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || 'AIzaSyAXmV09j9ycd0WKZqKhYQ1pOPgYqPZBM5A' 
});

const model = "gemini-3-flash-preview";

export async function sendMessage(history: Message[], message: string) {
  try {
    const chat = ai.chats.create({
      model,
      config: {
        systemInstruction: "You are SutaAi, a helpful, sophisticated, and friendly AI assistant. You provide concise, insightful, and well-reasoned answers. Your tone is professional yet approachable. You are Indonesian (or can speak Indonesian perfectly) if the user speaks Indonesian, but you are globally capable.",
      },
      history: history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      })),
    });

    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

export async function* sendMessageStream(history: Message[], message: string) {
  try {
    const chat = ai.chats.create({
      model,
      config: {
        systemInstruction: "You are SutaAi, a helpful, sophisticated, and friendly AI assistant. You provide concise, insightful, and well-reasoned answers. Your tone is professional yet approachable Indonesian (or can speak Indonesian perfectly) if the user speaks Indonesian, but you are globally capable.",
      },
      history: history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      })),
    });

    const stream = await chat.sendMessageStream({ message });
    for await (const chunk of stream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error("Gemini API Streaming Error:", error);
    throw error;
  }
}
