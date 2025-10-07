import type { VercelRequest, VercelResponse } from '@vercel/node';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === 'OPTIONS') return res.status(200).send('ok');
  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed. Only POST requests are accepted.` });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const prompt = body?.prompt?.toString().trim();
    if (!prompt) return res.status(400).json({ error: 'Prompt is required.' });

    const GROQ_API_KEY = (process.env.GROQ_API_KEY || '').trim();

    if (!GROQ_API_KEY) {
      return res.status(500).json({ error: 'GROQ_API_KEY not set in environment.' });
    }

    // --- Use Groq API ---
    try {
      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant', // A good, fast default model
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 256
        })
      });

      const groqData = await groqResponse.json();

      if (!groqResponse.ok) {
        console.error('Groq API request failed:', groqResponse.status, groqData);
        return res.status(groqResponse.status).json({ error: groqData.error?.message || 'Groq API request failed.' });
      } else {
        const answer = groqData.choices?.[0]?.message?.content ?? 'No text generated from Groq.';
        return res.status(200).json({ response: answer, provider: 'groq' });
      }
    } catch (groqError: any) {
      console.error('Error calling Groq API:', groqError);
      return res.status(500).json({ error: groqError?.message || 'Internal Server Error during Groq API call.' });
    }

  } catch (err: any) {
    console.error('Function error:', err);
    return res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
}