
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 500자 제한 함수 추가
function trimToMaxLength(text: string, maxLength = 500): string {
  if (text.length <= maxLength) return text;
  
  let trimmed = text.slice(0, maxLength);

  // 문장이 자연스럽게 끝나게 마무리 (마지막 온점, 느낌표, 물음표 기준)
  const lastPunctuation = Math.max(
    trimmed.lastIndexOf('.'),
    trimmed.lastIndexOf('!'),
    trimmed.lastIndexOf('?'),
    trimmed.lastIndexOf('다.')  // 한국어 마침
  );

  if (lastPunctuation > 0) {
    trimmed = trimmed.slice(0, lastPunctuation + 1);
  }

  return trimmed;
}

// 불필요한 문자(별표 등) 제거 함수 추가
function cleanGeneratedText(text: string): string {
  // 별표 제거
  text = text.replace(/\*\*/g, '');
  // 질문 형식으로 시작하는 경우 제거
  text = text.replace(/^(질문|질문\s*\d+\.)\s*.*?\n/i, '');
  // 앞뒤 공백 제거
  text = text.trim();
  return text;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY is not set in Supabase environment');
    }

    const { company, position, questions, answers, keywords } = await req.json();

    if (!company || !position || !questions || !answers || !keywords) {
      throw new Error('Missing required fields in request');
    }

    console.log("Request received with:", {
      company,
      position,
      questionCount: questions.length,
      answerCount: answers.length,
      keywordCount: keywords.length
    });

    const systemPrompt = `당신은 한국 기업 자기소개서 작성 전문 AI입니다.
- 지원 회사: ${company}
- 지원 직무: ${position}
- 다음 키워드들을 자연스럽게 포함해야 합니다: ${keywords.join(', ')}
- 별표(**)를 포함하지 말고 순수한 답변 내용만 작성하세요.
- 거짓 정보가 없도록 작성해줘.
- 질문을 반복하여 포함하지 마세요. 두괄식으로 답변 내용만 작성하세요.`;

    const generatedSections = [];

    // 각 질문에 대해 별도의 API 요청을 수행합니다
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const answerHint = answers[i] || '정보 없음';

      const userPrompt = `
[질문]
${question}

[답변 힌트]
${answerHint}

위 질문에 대해 답변 힌트를 참고하여, 키워드를 반영하고 지원 직무에 적합하도록 일목요연하고 핵심적인 내용으로 자기소개서 문단을 작성해주세요.
문장은 주어진 답변을 참고하여, 행동 중심, 수치 기반으로 직무에 적합하도록 발전시켜야 합니다.
인사 담당자에게 자연스럽고 매끄럽게 읽히도록, 명확하고 인간적인 톤으로 300-500자 내외로 작성하세요.
질문을 반복하지 말고, 별표(**)나 기타 특수기호 없이 답변 내용만 깔끔하게 작성해주세요.`;

      console.log(`Sending request for Question ${i + 1}: ${question}`);

      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openaiApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error(`OpenAI API error on Question ${i + 1}:`, error);
          throw new Error(`OpenAI API returned an error: ${error.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        let generatedAnswer = data.choices[0].message.content.trim();

        // 별표 제거 및 텍스트 정리
        generatedAnswer = cleanGeneratedText(generatedAnswer);
        
        // 여기서 500자 제한 적용
        generatedAnswer = trimToMaxLength(generatedAnswer, 500);

        // 각 질문-답변 쌍을 올바른 인덱스와 함께 저장합니다
        generatedSections.push({
          question: question,
          answer: generatedAnswer,
        });
        
        console.log(`Generated answer for question ${i + 1}, length: ${generatedAnswer.length}`);
      } catch (error) {
        console.error(`Error generating answer for question ${i + 1}:`, error);
        // 에러가 발생해도 계속 진행하고, 빈 답변을 추가합니다
        generatedSections.push({
          question: question,
          answer: `답변 생성 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`,
        });
      }
    }

    console.log("All OpenAI responses received successfully.");

    return new Response(
      JSON.stringify({
        success: true,
        coverLetter: {
          company,
          position,
          sections: generatedSections,
          keywords,
          date: new Date().toISOString(),
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error in generate-cover-letter function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
