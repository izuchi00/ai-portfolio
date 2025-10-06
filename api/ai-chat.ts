import type { VercelRequest, VercelResponse } from '@vercel/node';

const HF_INFERENCE_API_URL = "https://api-inference.huggingface.co/models/";
const HF_MODEL = "HuggingFaceH4/zephyr-7b-beta"; // You can change this to your preferred model

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS', // Explicitly allow POST and OPTIONS
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Set CORS headers for all responses
  Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));

  // Log the received request method for debugging
  console.log("Received request method:", req.method);

  if (req.method === 'OPTIONS') {
    // Handle CORS preflight request
    return res.status(200).send('ok');
  }

  if (req.method !== 'POST') {
    // Log if a method other than POST is received for the main request
    console.error("Method Not Allowed:", req.method);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    const HF_API_KEY = process.env.HF_API_KEY; // This will be set in Vercel environment variables

    if (!HF_API_KEY) {
      console.error("Hugging Face API Key (HF_API_KEY) not set.");
      return res.status(500).json({ error: 'Hugging Face API Key (HF_API_KEY) not set.' });
    }

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
      const errorData = await response.json();
      console.error("Hugging Face API Error:", errorData);
      return res.status(response.status).json({ error: `Hugging Face API error: ${response.statusText} - ${JSON.stringify(errorData)}` });
    }

    const data = await response.json();
    const aiResponse = data[0]?.generated_text || "No specific response from Hugging Face.";

    return res.status(200).json({ response: aiResponse });

  } catch (error: any) {
    console.error("Vercel Function Error:", error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}