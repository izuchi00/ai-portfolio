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
    const HF_MODEL = "google/gemma-2b-it"; // Changed to a model served by an inference provider

    if (!HF_TOKEN) {
      return res.status(500).json({ error: 'Hugging Face API Token (HF_TOKEN) not set. Please configure it in Vercel environment variables.' });
    }

    // Updated to the new Hugging Face Inference Providers endpoint
    const huggingFaceApiUrl = `https://router.huggingface.co/hf-inference/${HF_MODEL}`;
    
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

    const responseText = await response.text();

    if (!response.ok) {
      let errorMessage = `Hugging Face API error (${response.status}): ${response.statusText}`;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.error?.message || JSON.stringify(errorData);
      } catch (e) {
        errorMessage = responseText || errorMessage;
      }
      console.error("Hugging Face API Error:", errorMessage);
      return res.status(response.status).json({ error: `Hugging Face API model not found or inaccessible. Model: ${HF_MODEL} - ${errorMessage}` });
    }

    if (responseText.trim().toLowerCase() === 'not found') {
        return res.status(404).json({ error: `Hugging Face API returned 'Not Found' for model ${HF_MODEL}. This might indicate the model is unavailable or your token lacks specific permissions.` });
    }

    let data;
    try {
        data = JSON.parse(responseText);
    } catch (jsonError) {
        console.error("Failed to parse JSON from Hugging Face response:", responseText, jsonError);
        return res.status(500).json({ error: `Hugging Face API returned non-JSON response: ${responseText.substring(0, 200)}...` });
    }
    
    const aiResponse = data[0]?.generated_text || "No specific response from Hugging Face.";

    return res.status(200).json({ response: aiResponse });

  } catch (error: any) {
    console.error("Vercel Function Internal Error:", error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}