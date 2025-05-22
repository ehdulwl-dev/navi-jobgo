
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { preferredJobs } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    if (!preferredJobs || !Array.isArray(preferredJobs) || preferredJobs.length === 0) {
      throw new Error('No preferred jobs provided');
    }

    // Join preferred jobs into a comma-separated list
    const jobList = preferredJobs.join(', ');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a career advisor that provides relevant keywords for job fields. Respond with exactly three short keywords (1-2 words each) in Korean related to the given job fields. Return ONLY the three keywords as a JSON array without any explanation or additional text."
          },
          {
            role: "user",
            content: `Provide three key keywords for these job fields: ${jobList}`
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const keywords = data.choices[0].message.content;
    
    // Parse the JSON string from OpenAI
    let parsedKeywords;
    try {
      parsedKeywords = JSON.parse(keywords);
    } catch (e) {
      console.error("Failed to parse OpenAI response:", keywords);
      throw new Error("Invalid response format from OpenAI");
    }

    return new Response(JSON.stringify(parsedKeywords), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in get-job-keywords function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        keywords: ["의료", "간호", "요양"] // Default fallback keywords
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
