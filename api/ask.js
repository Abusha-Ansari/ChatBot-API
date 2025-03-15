import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import eventData from "../data/eventData.js";
import cleanResponse from "../utils/responseFormatter.js";
import dotenvConfig from "../config/dotenvConfig.js";
dotenvConfig();

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function jsonToText(data) {
  let text = "";

  for (const event in data) {
    text += `Event: ${data[event].event_name || event}\n`;

    for (const key in data[event]) {
      if (key === "event_name") continue; // Skip event_name since it's already included

      if (typeof data[event][key] === "object" && !Array.isArray(data[event][key])) {
        text += `${key}:\n`;
        for (const subKey in data[event][key]) {
          text += `  ${subKey}: ${data[event][key][subKey]}\n`;
        }
      } else if (Array.isArray(data[event][key])) {
        text += `${key}:\n`;
        data[event][key].forEach((item, index) => {
          text += `  ${index + 1}. ${item}\n`;
        });
      } else {
        text += `${key}: ${data[event][key]}\n`;
      }
    }

    text += "\n"; // Add a newline between events
  }

  return text;
}

router.post("/", async (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: "Please provide a question." });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const eventDataText = jsonToText(eventData);

    const prompt = `You are a helpful assistant that answers questions based on the provided event data.
    Respond concisely and only provide the necessary information. 
    If you cannot find the answer, say "I don’t have context to answer your question."
    Here is the event data in text format:\n\n
    ${eventDataText}\n\n
    Question: ${question}`;

    const result = await model.generateContent(prompt);
    const rawResponse =
      result.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No valid response received.";

    res.json({ answer: cleanResponse(rawResponse) });
  } catch (error) {
    console.error("Error generating response:", error);
    res
      .status(500)
      .json({ error: "An error occurred while generating the response." });
  }
});

export default router;
