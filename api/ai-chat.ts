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
    // Body may be string if client sent wrong headers; guard for that.
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const prompt = body?.prompt?.toString().trim();
    if (!prompt) return res.status(400).json({ error: 'Prompt is required.' });

    const HF_TOKEN = (process.env.HF_TOKEN || '').trim();
    const MODEL_ID = (process.env.HF_MODEL || 'HuggingFaceH4/zephyr-7b-beta').trim();

    if (!HF_TOKEN) {
      return res.status(500).json({ error: 'HF_TOKEN not set in environment.' });
    }

    const url = `https://api-inference.huggingface.co/models/${MODEL_ID}`;
    console.log('Calling HF model:', MODEL_ID, 'URL:', url);

    const r = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 256,
          temperature: 0.7,
          do_sample: true,
          return_full_text: false,
        },
        options: { wait_for_model: true },
      }),
    });

    const text = await r.text();

    // Normalize HF errors: r.status not OK → return 502 with details
    if (!r.ok) {
      let hfError: string;
      try {
        const parsed = JSON.parse(text);
        // HF often returns { error: "Model ... not found" } or { error: { message: "..." } }
        hfError = typeof parsed?.error === 'string'
          ? parsed.error
          : parsed?.error?.message || text || r.statusText;
      } catch {
        hfError = text || r.statusText;
      }

      // Common helpful hint for 404s
      const hint = r.status === 404
        ? `Check that the model "${MODEL_ID}" is public and served by the Hugging Face Inference API, or switch to a known-good model like "HuggingFaceH4/zephyr-7b-beta".`
        : undefined;

      return res.status(502).json({
        error: 'Hugging Face request failed',
        status: r.status,
        model: MODEL_ID,
        detail: hfError,
        hint,
      });
    }

    let data: any;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(500).json({ error: `HF returned non-JSON response`, sample: text.slice(0, 200) });
    }

    // Extract generated text from array or object
    let answer: string | undefined;
    if (Array.isArray(data)) {
      answer = data[0]?.generated_text ?? data[0]?.text;
    } else if (data && typeof data === 'object') {
      answer = data.generated_text ?? data.text;
    }
    if (!answer) answer = 'No text generated.';

    return res.status(200).json({ response: answer, model: MODEL_ID });
  } catch (err: any) {
    console.error('Function error:', err);
    return res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
}