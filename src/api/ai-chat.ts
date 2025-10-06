import type { VercelRequest, VercelResponse } from '@vercel/node';

const HF_INFERENCE_API_URL = "https://api-inference.huggingface.co/models/";
const HF_MODEL = "HuggingFaceH4/zephyr-7b-beta"; // You can change this to your preferred model

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    // Handle CORS preflight request
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).send('ok');
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    const HF_API_KEY = process.env.HF_API_KEY; // This will be set in Vercel environment variables

    if (!HF_API_KEY) {
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
    // Hugging Face Inference API often returns an array of objects
    const aiResponse = data[0]?.generated_text || "No specific response from Hugging Face.";

    return res.status(200).json({ response: aiResponse });

  } catch (error: any) {
    console.error("Vercel Function Error:", error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}