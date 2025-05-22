
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QualificationItem {
  id: string;
  name: string;
  isMatched: boolean;
}

interface AdviceResponse {
  id: string;
  qualification: string;
  advice: string;
  hasLink: boolean;
}

// Check if a qualification is likely related to certifications
function isCertificationRelated(text: string): boolean {
  const certKeywords = [
    "자격증", "certification", "certificate", "license", "certified",
    "기사", "산업기사", "기술사", "자격", "면허", "1급", "2급", "engineer"
  ];
  
  return certKeywords.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()));
}

// Remove quotation marks from text
function removeQuotationMarks(text: string): string {
  // Remove both single and double quotes from the beginning and end of the string
  return text.replace(/^["']|["']$/g, "").trim();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { qualifications } = await req.json();
    
    if (!qualifications || !Array.isArray(qualifications) || qualifications.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid or empty qualifications array" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Generating advice for ${qualifications.length} qualifications`);
    
    // Process each qualification to generate advice
    const advicePromises = qualifications.map(async (qual: QualificationItem) => {
      if (qual.isMatched) {
        return null; // Skip matched qualifications
      }
      
      // 변경된 프롬프트: 더 짧고 직접적인 조언을 제공하도록 수정
      const systemPrompt = `
        당신은 구직자에게 도움을 주는 친절한 취업 코치입니다. 
        구직자가 특정 자격 요건이나 우대 사항을 충족하지 못할 때, 그것을 어떻게 달성할 수 있는지에 대한 
        간결하고 실용적인 조언을 제공하세요.
        
        응답은 한국어로 작성하고, 30자 내외의 매우 짧고 직접적인 문장으로 작성해주세요.
        요구사항 자체를 문장에 포함해서 작성해주세요. 예를 들면:
        - "경력 7년 이상이 필요해요"
        - "코스요리/오마카세 업장에서 경험을 쌓아보세요"
        - "경비신임이수교육을 받아야 해요"
        
        "~하세요" 형태의 존칭어를 사용해주세요.
        절대 따옴표를 응답에 포함하지 마세요.
      `;
      
      const userPrompt = `
        다음 자격 요건에 대한 매우 짧고 직접적인 조언을 제공해주세요: "${qual.name}"
        
        조언은 한 문장으로, 최대 30자 이내로 작성해주세요.
        요구사항 자체를 문장에 포함시켜주세요.
        따옴표는 절대 사용하지 마세요.
      `;

      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openAIApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 100,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("OpenAI API Error:", errorData);
          return {
            id: qual.id,
            qualification: qual.name,
            advice: `${qual.name}이(가) 필요해요`,
            hasLink: false,
          };
        }

        const data = await response.json();
        let advice = data.choices[0].message.content.trim();
        
        // Remove any quotation marks from the advice
        advice = removeQuotationMarks(advice);
        
        const hasCertLink = isCertificationRelated(qual.name);

        return {
          id: qual.id,
          qualification: qual.name,
          advice: advice,
          hasLink: hasCertLink,
        };
      } catch (error) {
        console.error("Error generating advice:", error);
        return {
          id: qual.id,
          qualification: qual.name,
          advice: `${qual.name}이(가) 필요해요`,
          hasLink: false,
        };
      }
    });

    // Filter out nulls (matched qualifications) and wait for all promises
    const adviceResults = (await Promise.all(advicePromises)).filter(Boolean) as AdviceResponse[];
    
    console.log(`Generated ${adviceResults.length} advice items`);

    return new Response(JSON.stringify({ adviceItems: adviceResults }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-qualification-advice function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
