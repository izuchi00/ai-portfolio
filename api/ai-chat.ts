import type { VercelRequest, VercelResponse } from '@vercel/node';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for all responses
  Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));

  if (req.method === 'OPTIONS') {
    return res.status(200).send('ok');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed. Only POST requests are accepted.` });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    const HF_TOKEN = process.env.HF_TOKEN;
    const HF_MODEL = "google/gemma-2b-it"; // Using a free-tier Hugging Face model

    if (!HF_TOKEN) {
      return res.status(500).json({ error: 'Hugging Face API Token (HF_TOKEN) not set. Please configure it in Vercel environment variables.' });
    }

    const huggingFaceApiUrl = `https://api-inference.huggingface.co/models/${HF_MODEL}`;
    
    const response = await fetch(huggingFaceApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HF_TOKEN}`,
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
        },
        options: {
          wait_for_model: true, // Wait for the model to load if it's not active
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Hugging Face API Error:", errorData);
      return res.status(response.status).json({ error: errorData.error?.message || `Hugging Face API model not found or inaccessible. Model: ${HF_MODEL} - ${response.statusText}` });
    }

    const data = await response.json();
    // Hugging Face Inference API for text generation usually returns an array
    const aiResponse = data[0]?.generated_text || "No specific response from Hugging Face.";

    return res.status(200).json({ response: aiResponse });

  } catch (error: any) {
    console.error("Vercel Function Internal Error:", error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}