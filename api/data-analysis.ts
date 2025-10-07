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
    const { data, headers, analysisType } = body;

    if (!data || !headers || !analysisType) {
      return res.status(400).json({ error: 'Missing data, headers, or analysisType in request body.' });
    }

    const GROQ_API_KEY = (process.env.GROQ_API_KEY || '').trim();
    const HF_TOKEN = (process.env.HF_TOKEN || '').trim();
    const PREFERRED_HF_MODEL = (process.env.HF_MODEL || '').trim();

    // Prepare a concise data summary for the LLM
    const dataSample = JSON.stringify(data.slice(0, 5), null, 2); // First 5 rows
    const dataOverview = `Dataset has ${data.length} rows and ${headers.length} columns. Headers: ${headers.join(', ')}. Sample data:\n${dataSample}`;

    let prompt = `You are an expert data analyst AI. Based on the following dataset overview and the requested analysis type, generate a comprehensive, professional, and easy-to-understand data analysis report. Focus on key insights, steps taken (simulated), and potential visualizations. Do not generate actual code or images, but describe them.

Dataset Overview:
${dataOverview}

Requested Analysis Type: ${analysisType}

`;

    switch (analysisType) {
      case 'basic':
        prompt += `
Perform a basic data analysis covering:
1.  **Data Preparation**: Describe typical steps like handling missing values (e.g., median/mean imputation), removing duplicates, and converting data types (e.g., Gender to numerical).
2.  **Data Exploration & Visualization**: Describe key feature distributions (histograms), correlations (heatmap), and relationships between important features (scatter plots, pair plots). Include insights from gender counts and distributions across age, spending, and income groups.
3.  **Summary Statistics**: Provide descriptive statistics for numerical columns.
`;
        break;
      case 'clustering':
        prompt += `
Perform an advanced clustering analysis covering:
1.  **Data Standardization**: Explain the need for and process of standardizing data.
2.  **K-Means Clustering**: Describe how to determine the optimal number of clusters (Elbow Method, Silhouette Score) and the application of K-Means. Provide insights into the resulting customer segments based on Age, Annual Income, and Spending Score. Describe 2D and 3D visualizations of these clusters.
3.  **Hierarchical Clustering**: Describe the process, dendrogram visualization, and how to determine clusters.
4.  **Agglomerative Clustering**: Describe its application and comparison with K-Means.
5.  **DBSCAN Clustering**: Describe the K-Distance plot for parameter selection and the application of DBSCAN.
6.  **Comparison**: Compare the silhouette scores of different clustering methods and summarize the final customer segments.
`;
        break;
      case 'association':
        prompt += `
Perform an association rule mining analysis covering:
1.  **Data Preparation**: Describe how to convert numerical features into categorical bins (e.g., Age, Income, Spending Score).
2.  **Transaction Dataset**: Explain how to create a transaction dataset from categorical attributes.
3.  **One-Hot Encoding**: Describe the one-hot encoding process for transactions.
4.  **Frequent Itemsets**: Describe the generation of frequent itemsets using Apriori.
5.  **Association Rules**: Describe the generation and interpretation of meaningful association rules (e.g., using Lift and Confidence).
6.  **Visualization**: Describe how a directed graph could visualize these association rules.
7.  **Insights**: Provide actionable insights from the discovered association rules, explaining how they can inform business strategies.
`;
        break;
      default:
        prompt += `Perform a general data analysis.`;
    }

    let aiResponseText = "No AI response generated.";
    let providerUsed = "none";

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
            model: 'llama-3.1-8b-instant',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 2048 // Increased max_tokens for detailed reports
          })
        });

        const groqData = await groqResponse.json();

        if (!groqResponse.ok) {
          console.error('Groq API request failed for data analysis:', groqResponse.status, groqData);
        } else {
          aiResponseText = groqData.choices?.[0]?.message?.content ?? 'No text generated from Groq.';
          providerUsed = 'groq';
        }
      } catch (groqError: any) {
        console.error('Error calling Groq API for data analysis:', groqError);
      }
    } else {
      console.warn('GROQ_API_KEY not set for data analysis, falling back to Hugging Face.');
    }

    // --- Fallback to Hugging Face API if Groq failed or not configured ---
    if (providerUsed === 'none' && HF_TOKEN) {
      const CANDIDATES = [PREFERRED_HF_MODEL, 'google/flan-t5-small', 'sshleifer/tiny-gpt2'].filter(Boolean);

      async function callHF(modelId: string, currentPrompt: string) {
        const url = `https://api-inference.huggingface.co/models/${modelId}`;
        const r = await fetch(url, {
          method: 'POST',
          headers: { Authorization: `Bearer ${HF_TOKEN}`, 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            inputs: currentPrompt,
            parameters: { max_new_tokens: 512, do_sample: true, return_full_text: false }, // Adjusted max_new_tokens
            options: { wait_for_model: true }
          })
        });
        const text = await r.text();
        return { ok: r.ok, status: r.status, text, modelId };
      }

      let result;
      for (const m of CANDIDATES) {
        result = await callHF(m, prompt);
        console.log('HF status for data analysis:', result.status, 'model:', m, 'sample:', result.text.slice(0, 120));
        if (result.ok) {
          let data: any;
          try {
            data = JSON.parse(result.text);
          } catch (e) {
            console.error(`Failed to parse JSON from HF model ${m} for data analysis:`, result.text.slice(0, 200));
            continue;
          }
          aiResponseText = Array.isArray(data) ? (data[0]?.generated_text ?? data[0]?.text) : (data.generated_text ?? data.text);
          providerUsed = 'huggingface';
          break; // Exit loop on first successful HF response
        }
      }
    }

    if (providerUsed === 'none') {
      return res.status(502).json({
        error: 'All AI providers failed to generate a data analysis report.',
        tried: (GROQ_API_KEY ? ['groq'] : []).concat(HF_TOKEN ? CANDIDATES : []),
        lastHFStatus: result?.status,
        lastHFBodySample: result?.text?.slice(0, 200)
      });
    }

    return res.status(200).json({ report: aiResponseText, provider: providerUsed });

  } catch (err: any) {
    console.error('Data analysis function error:', err);
    return res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
}