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

    // --- Attempt to use Groq API first ---
    if (GROQ_API_KEY) {
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
          // Fallback to Hugging Face if Groq fails
        } else {
          const answer = groqData.choices?.[0]?.message?.content ?? 'No text generated from Groq.';
          return res.status(200).json({ response: answer, provider: 'groq' });
        }
      } catch (groqError: any) {
        console.error('Error calling Groq API:', groqError);
        // Fallback to Hugging Face if Groq call throws an error
      }
    } else {
      console.warn('GROQ_API_KEY not set, falling back to Hugging Face.');
    }

    // --- Fallback to Hugging Face API ---
    const HF_TOKEN = (process.env.HF_TOKEN || '').trim();
    const PREFERRED = (process.env.HF_MODEL || '').trim();
    const CANDIDATES = [PREFERRED, 'google/flan-t5-small', 'sshleifer/tiny-gpt2'].filter(Boolean);

    if (!HF_TOKEN) {
      return res.status(500).json({ error: 'HF_TOKEN not set in environment, and GROQ_API_KEY was also not available.' });
    }

    async function callHF(modelId: string, prompt: string) {
      const url = `https://api-inference.huggingface.co/models/${modelId}`;
      const r = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${HF_TOKEN}`, 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          inputs: prompt,
          parameters: { max_new_tokens: 128, do_sample: true, return_full_text: false },
          options: { wait_for_model: true }
        })
      });
      const text = await r.text();
      return { ok: r.ok, status: r.status, text, modelId };
    }

    let result;
    for (const m of CANDIDATES) {
      result = await callHF(m, prompt);
      console.log('HF status:', result.status, 'model:', m, 'sample:', result.text.slice(0, 120));
      if (result.ok) { // success
        let data: any;
        try {
          data = JSON.parse(result.text);
        } catch (e) {
          console.error(`Failed to parse JSON from model ${m}:`, result.text.slice(0, 200));
          continue; // Try next model if JSON parsing fails
        }
        const answer = Array.isArray(data) ? (data[0]?.generated_text ?? data[0]?.text) : (data.generated_text ?? data.text);
        return res.status(200).json({ response: answer ?? 'No text generated.', model: m, provider: 'huggingface' });
      }
    }

    // if we got here, all models (Groq and HF fallbacks) failed
    return res.status(502).json({
      error: 'All AI providers failed to generate a response.',
      tried: CANDIDATES,
      lastHFStatus: result?.status,
      lastHFBodySample: result?.text?.slice(0, 200)
    });

  } catch (err: any) {
    console.error('Function error:', err);
    return res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
}