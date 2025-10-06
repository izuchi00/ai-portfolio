import type { VercelRequest, VercelResponse } from '@vercel/node';

const HF_INFERENCE_API_URL = "https://api-inference.huggingface.co/models/";
const HF_MODEL = "HuggingFaceH4/zephyr-7b-beta"; // You can change this to your preferred model

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Set CORS headers for all responses
  Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));

  console.log("--- Vercel Function Request Log ---");
  console.log("Received method:", req.method);
  console.log("Request URL:", req.url);
  console.log("Request headers:", req.headers);
  console.log("--- End Request Log ---");

  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS preflight request.");
    return res.status(200).send('ok');
  }

  if (req.method !== 'POST') {
    console.error(`Method Not Allowed: Expected POST, received ${req.method}`);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed. Only POST requests are accepted.` });
  }

  try {
    const { prompt } = req.body;
    console.log("Received POST request with prompt:", prompt ? prompt.substring(0, 100) + "..." : "No prompt");

    if (!prompt) {
      console.error("Prompt is missing from request body.");
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    const HF_API_KEY = process.env.HF_API_KEY;

    if (!HF_API_KEY) {
      console.error("Hugging Face API Key (HF_API_KEY) not set in environment variables.");
      return res.status(500).json({ error: 'Hugging Face API Key (HF_API_KEY) not set. Please configure it in Vercel environment variables.' });
    }

    console.log(`Calling Hugging Face Inference API with model: ${HF_MODEL}`);
    const response = await fetch(`${HF_INFERENCE_API_URL}${HF_MODEL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HF_API_KEY}`,
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text(); // Get raw text to avoid json parsing errors
      console.error(`Hugging Face API Error: Status ${response.status}, Text: ${errorText}`);
      let errorDetail = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        errorDetail = errorJson.error || errorText;
      } catch (e) {
        // Not a JSON error, use raw text
      }
      return res.status(response.status).json({ error: `Hugging Face API error: ${response.statusText} - ${errorDetail}` });
    }

    const data = await response.json();
    const aiResponse = data[0]?.generated_text || "No specific response from Hugging Face.";
    console.log("Successfully received AI response.");

    return res.status(200).json({ response: aiResponse });

  } catch (error: any) {
    console.error("Vercel Function Internal Error:", error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}