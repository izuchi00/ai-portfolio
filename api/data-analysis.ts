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

    // Declare these variables at a higher scope to avoid "Cannot find name" errors
    let hfCandidates: string[] = [];
    let hfResult: any = null;

    // Prepare a concise data summary for the LLM
    const dataSample = JSON.stringify(data.slice(0, 5), null, 2); // First 5 rows
    const dataOverview = `Dataset has ${data.length} rows and ${headers.length} columns. Headers: ${headers.join(', ')}. Sample data:\n${dataSample}`;

    let prompt = `You are an expert data analyst AI. Based on the following dataset overview and the requested analysis type, generate a comprehensive, professional, and easy-to-understand data analysis report. Focus on key insights, steps taken (simulated), and potential visualizations. Do not generate actual code or images, but describe them.

Dataset Overview:
${dataOverview}

Requested Analysis Type: ${analysisType}

`;

    switch (analysisType) {
      case 'data_preparation':
        prompt += `
Perform a data preparation and cleaning analysis covering:
1.  **Loading and Initial Inspection**: Describe how the dataset would be loaded and initial checks for shape, data types, and first few rows.
2.  **Missing Values**: Detail the identification of missing values and strategies for handling them (e.g., imputation with median/mean for numerical, mode for categorical).
3.  **Duplicate Values**: Explain how duplicate rows would be identified and removed.
4.  **Data Type Conversion**: Describe any necessary data type conversions (e.g., converting 'Gender' to numerical representation).
5.  **Summary Statistics**: Provide descriptive statistics for numerical columns after cleaning.
6.  **Outlier Detection and Handling**: Explain how outliers would be detected (e.g., using box plots, 3-sigma rule) and handled (e.g., capping).
`;
        break;
      case 'exploratory_analysis':
        prompt += `
Perform an exploratory data analysis (EDA) covering:
1.  **Summary Statistics**: Provide descriptive statistics for numerical columns (mean, median, std, min, max).
2.  **Feature Distributions**: Describe the distributions of key numerical features using histograms and density plots.
3.  **Correlation Matrix**: Explain the correlation between numerical variables using a heatmap and interpret significant correlations.
3.  **Relationship between Key Features**: Describe scatter plots to visualize relationships between important pairs of features (e.g., Age vs Spending Score, Annual Income vs Spending Score), potentially colored by a categorical variable like Gender.
5.  **Pair Plots**: Describe how pair plots would show relationships between all numerical variables.
6.  **Group Comparisons**: Analyze and describe comparisons of key metrics (e.g., Spending Score) across different groups (e.g., Gender, Age Range, Income Group).
`;
        break;
      case 'data_visualization':
        prompt += `
Perform a data visualization and analysis report covering:
1.  **Key Feature Distributions**: Describe visualizations like histograms and box plots for individual features (e.g., Age, Annual Income, Spending Score).
2.  **Relationship Visualizations**: Describe scatter plots (e.g., Age vs Spending Score, Annual Income vs Spending Score) to show relationships between pairs of variables, potentially using color to represent a third variable (e.g., Gender).
3.  **Categorical Distributions**: Describe bar charts and pie charts for categorical features (e.g., Gender Count, Age Group distribution, Income Group distribution).
4.  **Group Comparisons**: Describe visualizations like bar plots and box plots to compare numerical features across different categories (e.g., Average Spending Score by Gender).
5.  **Insights**: For each described visualization, provide key insights and trends that would be observed.
`;
        break;
      case 'correlation_analysis':
        prompt += `
Perform a correlation analysis covering:
1.  **Correlation Matrix**: Describe the calculation and visualization of a correlation matrix using a heatmap for all numerical variables.
2.  **Interpretation of Correlations**: Explain what positive, negative, and no correlation mean in the context of the dataset. Identify and interpret the strongest positive and negative correlations.
3.  **Pair Plots**: Describe how pair plots would visually represent the pairwise relationships and correlations between all numerical features.
4.  **Actionable Insights**: Provide insights derived from the correlations, suggesting how these relationships could inform business decisions.
`;
        break;
      case 'anomaly_detection':
        prompt += `
Perform an anomaly detection analysis covering:
1.  **Methodology**: Describe common anomaly detection techniques (e.g., Isolation Forest, One-Class SVM, Z-score).
2.  **Feature Selection**: Explain which features would be most relevant for detecting anomalies in this dataset.
3.  **Detection Process**: Describe the steps to apply an anomaly detection algorithm and identify outliers.
4.  **Visualization of Anomalies**: Describe how anomalies would be visualized (e.g., scatter plots highlighting anomalous points).
5.  **Interpretation**: Explain the characteristics of the detected anomalies and their potential implications for the business.
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
      case 'sentiment_analysis':
        prompt += `
Perform a sentiment analysis on the provided text data. Since the data is a table, assume one of the columns contains text (e.g., 'review_text', 'comment').
1.  **Data Identification**: Identify the most likely text column for sentiment analysis.
2.  **Sentiment Scoring**: Describe how each text entry would be assigned a sentiment score (e.g., positive, negative, neutral).
3.  **Overall Sentiment**: Summarize the overall sentiment distribution across the dataset.
4.  **Key Sentiment Drivers**: Identify common words or phrases associated with positive and negative sentiments.
5.  **Visualization**: Describe how sentiment distribution could be visualized (e.g., bar chart of sentiment categories).
6.  **Insights**: Provide actionable insights based on the sentiment analysis (e.g., customer satisfaction, product feedback).
`;
        break;
      case 'text_extraction':
        prompt += `
Perform a text extraction analysis on the provided text data. Since the data is a table, assume one of the columns contains text.
1.  **Objective**: Explain the goal of extracting specific entities (e.g., names, organizations, locations, dates, keywords) from the text.
2.  **Methodology**: Describe techniques like Named Entity Recognition (NER) or keyword extraction.
3.  **Extraction Process**: Detail how the extraction would be performed on the identified text column.
4.  **Results**: Provide examples of what kind of entities would be extracted and how they would be presented (e.g., a new column for extracted names).
5.  **Use Cases**: Explain the practical applications of such extracted information.
`;
        break;
      case 'language_translation':
        prompt += `
Perform a language translation analysis on the provided text data. Since the data is a table, assume one of the columns contains text.
1.  **Objective**: Explain the goal of translating text from one language to another (e.g., customer reviews from Spanish to English).
2.  **Language Detection**: Describe how the original language of the text would be detected.
3.  **Translation Process**: Detail how the text in the identified column would be translated to a target language.
4.  **Output**: Describe how the translated text would be presented (e.g., a new column with translated content).
5.  **Benefits**: Explain the benefits of having translated text for global analysis or communication.
`;
        break;
      case 'traffic_acquisition':
        prompt += `
Generate a simulated traffic acquisition report. This analysis typically requires integration with web analytics platforms (e.g., Google Analytics).
1.  **Data Sources**: Describe the typical data sources for a traffic acquisition report (e.g., Google Analytics, marketing platforms).
2.  **Key Metrics**: Identify key metrics that would be analyzed (e.g., Sessions, Users, Pageviews, Bounce Rate, Conversion Rate, Acquisition Channels).
3.  **Channel Breakdown**: Describe a breakdown of traffic by acquisition channels (e.g., Organic Search, Direct, Referral, Social, Paid Search).
4.  **Trends and Insights**: Describe how trends over time would be analyzed and key insights derived (e.g., growth in organic traffic, performance of paid campaigns).
5.  **Recommendations**: Provide simulated recommendations for optimizing traffic acquisition based on the report.
`;
        break;
      default:
        prompt += `Perform a general AI-driven report based on the data.`;
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
      hfCandidates = [PREFERRED_HF_MODEL, 'google/flan-t5-small', 'sshleifer/tiny-gpt2'].filter(Boolean);

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

      for (const m of hfCandidates) {
        hfResult = await callHF(m, prompt);
        console.log('HF status for data analysis:', hfResult.status, 'model:', m, 'sample:', hfResult.text.slice(0, 120));
        if (hfResult.ok) {
          let data: any;
          try {
            data = JSON.parse(hfResult.text);
          } catch (e) {
            console.error(`Failed to parse JSON from HF model ${m} for data analysis:`, hfResult.text.slice(0, 200));
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
        tried: (GROQ_API_KEY ? ['groq'] : []).concat(HF_TOKEN ? hfCandidates : []),
        lastHFStatus: hfResult?.status,
        lastHFBodySample: hfResult?.text?.slice(0, 200)
      });
    }

    return res.status(200).json({ report: aiResponseText, provider: providerUsed });

  } catch (err: any) {
    console.error('Data analysis function error:', err);
    return res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
}