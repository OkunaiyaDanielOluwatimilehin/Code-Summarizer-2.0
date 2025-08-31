// api/summarize.js

import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Check if the API key is set
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ message: 'API key not configured.' });
  }

  // Ensure a file was sent in the request body
  const fileContent = req.body?.fileContent;
  if (!fileContent) {
    return res.status(400).json({ message: 'No file content received.' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Using a more cost-effective model for this task

    const prompt = `YYou are a world-class software engineer and technical writer. Your task is to provide a comprehensive, yet brief summary of the code provided. Write a single, coherent paragraph of 3-4 sentences that explains the code's core purpose, its primary functionalities, and the main technologies or libraries used. Do not use bullet points. Bold the most important keywords and concepts to make them stand out.: ${fileContent}`;

    // Generate content from the prompt
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    // Send the summary back to the client
    res.status(200).json({ summary: summary });

  } catch (error) {
    console.error("Error summarizing code:", error);
    res.status(500).json({ message: 'Failed to summarize code.', error: error.message });
  }
}