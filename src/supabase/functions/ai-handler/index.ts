// Removed: import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Using Deno.serve directly
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();

    // --- OpenAI Integration ---
    const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
    const OPENAI_API_KEY = Deno.env.get("LLM_API_KEY"); // Using LLM_API_KEY secret for OpenAI key

    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "OPENAI_API_KEY (LLM_API_KEY) not set in Supabase secrets." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const openaiResponse = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // You can change this to "gpt-4o" or other models if you have access
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500, // Limit the response length
        temperature: 0.7, // Controls randomness (0.0 for deterministic, 1.0 for creative)
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error("OpenAI API Error:", errorData);
      return new Response(JSON.stringify({ error: `OpenAI API error: ${openaiResponse.statusText} - ${JSON.stringify(errorData)}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: openaiResponse.status,
      });
    }

    const openaiData = await openaiResponse.json();
    const aiResponse = openaiData.choices[0]?.message?.content || "No specific response from OpenAI.";

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Edge Function Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});