import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import eventData from "../data/eventData.js";
import cleanResponse from "../utils/responseFormatter.js";
import dotenvConfig from "../config/dotenvConfig.js";
dotenvConfig();

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/", async (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: "Please provide a question." });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are a helpful assistant that answers questions based on the provided text.
    Respond concisely and only provide the necessary information. 
    If you cannot find the answer, say "I don’t have context to answer your question."
    Answer based on the following JSON event data:\n\n
    ${JSON.stringify(eventData, null, 2)}\n\n
    Question: ${question}`;

    const result = await model.generateContent(prompt);
    const rawResponse = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || "No valid response received.";
    
    res.json({ answer: cleanResponse(rawResponse) });
  } catch (error) {
    console.error("Error generating response:", error);
    res.status(500).json({ error: "An error occurred while generating the response." });
  }
});

export default router;
