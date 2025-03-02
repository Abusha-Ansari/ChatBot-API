import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import eventData from "./eventData.json" assert { type: "json" };

const app = express();
const PORT = process.env.PORT || 3000;
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

app.use(express.json());

app.post("/ask", async (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: "Please provide a question." });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are a helpful assistant that answers questions based on the provided text.
Respond concisely and only provide the necessary information. You can add some context to your answers if needed.
if you cannot find the answer, you can say "I dont have context to answer your question". dont mention about the document. also make it formal also only Answer the following question based on the provided JSON event data:\n\n
        ${JSON.stringify(eventData, null, 2)}\n\n
        Question: ${question}`;

    const result = await model.generateContent(prompt);

    const rawResponse =
      result.response.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No valid response received.";

    const cleanResponse = rawResponse
      .replace(/[*_`]+/g, "")
      .replace(/\s+/g, " ")
      .trim();

    res.json({ answer: cleanResponse });
  } catch (error) {
    console.error("Error generating response:", error);
    res
      .status(500)
      .json({ error: "An error occurred while generating the response." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});