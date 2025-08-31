// api/summarize-link.js

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

  // Ensure a URL was sent in the request body
  const url = req.body?.url;
  if (!url) {
    return res.status(400).json({ message: 'No URL received.' });
  }

  try {
    // Fetch the page content
    const response = await fetch(url);
    let text = await response.text();

    // Strip out HTML tags for a cleaner summary input
    text = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Summarize the following webpage content:\n\n${text}`;

    // Generate content from the prompt
    const result = await model.generateContent(prompt);
    const aiResponse = await result.response;
    const summary = aiResponse.text();

    // Send the summary back to the client
    res.status(200).json({ summary: summary });

  } catch (error) {
    console.error("Error summarizing link:", error);
    res.status(500).json({ message: 'Failed to summarize link.', error: error.message });
  }
}
