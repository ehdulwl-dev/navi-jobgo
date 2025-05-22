const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const axios = require('axios');

// 전체 채용 공고
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('TB_JOBS')
    .select('*')
    .order('reg_date', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// 공고 분석 API 추가 - OpenAI로 요구사항과 우대사항 추출
router.post('/analyze/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`시작: 공고 ID ${id} 분석 요청 접수`);
    
    // 1. Check if job exists and has requirements/preferences
    const { data: job, error: jobError } = await supabase
      .from('TB_JOBS')
      .select('id, title, description, requirements, preferences')
      .eq('id', id)
      .single();
    
    if (jobError || !job) {
      console.error('Job not found:', jobError);
      return res.status(404).json({ 
        error: 'Job not found',
        requirements: ["공고를 찾을 수 없습니다."],
        preferences: ["공고를 찾을 수 없습니다."]
      });
    }

    console.log(`공고 정보 조회 성공. ID: ${id}, Title: ${job.title}`);
    console.log(`현재 저장된 requirements/preferences 상태:`, {
      hasRequirements: !!job.requirements,
      hasPreferences: !!job.preferences
    });

    // 2. If requirements and preferences are already set and valid, return them
    let parsedRequirements = null;
    let parsedPreferences = null;
    
    if (job.requirements && job.preferences) {
      try {
        // Try to parse if they're strings
        if (typeof job.requirements === 'string') {
          parsedRequirements = JSON.parse(job.requirements);
          console.log(`Requirements 파싱 성공: ${typeof parsedRequirements}, 길이: ${parsedRequirements.length}`);
        } else if (Array.isArray(job.requirements)) {
          parsedRequirements = job.requirements;
          console.log(`Requirements는 이미 배열: 길이: ${parsedRequirements.length}`);
        }
        
        if (typeof job.preferences === 'string') {
          parsedPreferences = JSON.parse(job.preferences);
          console.log(`Preferences 파싱 성공: ${typeof parsedPreferences}, 길이: ${parsedPreferences.length}`);
        } else if (Array.isArray(job.preferences)) {
          parsedPreferences = job.preferences;
          console.log(`Preferences는 이미 배열: 길이: ${parsedPreferences.length}`);
        }
        
        // Only return if these are valid arrays with content
        if (Array.isArray(parsedRequirements) && Array.isArray(parsedPreferences) && 
            parsedRequirements.length > 0 && parsedPreferences.length > 0 &&
            !parsedRequirements.some(r => r.includes("오류") || r.includes("실패"))) {
          console.log(`기존 분석 데이터 반환 for job ${id}`);
          return res.json({ 
            requirements: parsedRequirements, 
            preferences: parsedPreferences 
          });
        } else {
          console.log("기존 분석 데이터가 유효하지 않아 새로 분석을 진행합니다.");
        }
      } catch (parseError) {
        console.error('기존 분석 데이터 파싱 오류:', parseError);
        // If parsing fails, continue with extraction
      }
    } else {
      console.log("분석 데이터가 없습니다. 새로 분석을 진행합니다.");
    }

    // 3. Extract requirements and preferences
    console.log(`ID: ${id} 공고에 대한 새 분석 시작...`);
    let extractedData;
    try {
      // OpenAI API 키 확인
      const apiKey = process.env.OPENAI_API_KEY;
      console.log(`OpenAI API Key 설정 상태: ${apiKey ? '설정됨' : '미설정'}`);
      
      extractedData = await extractJobRequirementsPreferences(job.description, job.title);
      
      if (!extractedData || !extractedData.requirements || !extractedData.preferences) {
        console.error('분석 결과가 올바르지 않습니다:', extractedData);
        return res.status(500).json({ 
          error: 'Failed to extract job requirements',
          requirements: ["공고 분석중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."],
          preferences: ["기술적 문제로 인해 분석이 완료되지 않았습니다."]
        });
      }
      
      console.log("분석 결과:", {
        requirementsCount: extractedData.requirements?.length || 0,
        preferencesCount: extractedData.preferences?.length || 0,
        requirementsSample: extractedData.requirements?.slice(0, 2),
        preferencesSample: extractedData.preferences?.slice(0, 2)
      });
      
    } catch (extractionError) {
      console.error('분석 실패:', extractionError);
      return res.status(500).json({ 
        error: 'Extraction failed',
        requirements: ["공고 분석중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."],
        preferences: ["기술적 문제로 인해 분석이 완료되지 않았습니다."]
      });
    }
    
    // Validate the extracted data is in the correct format
    if (!Array.isArray(extractedData.requirements) || !Array.isArray(extractedData.preferences)) {
      console.error('분석 결과가 배열 형식이 아닙니다:', {
        requirementsType: typeof extractedData.requirements,
        preferencesType: typeof extractedData.preferences,
        extractedData
      });
      
      // Convert to arrays if possible
      if (!Array.isArray(extractedData.requirements)) {
        extractedData.requirements = typeof extractedData.requirements === 'string' 
          ? [extractedData.requirements] 
          : ["응답 형식이 올바르지 않습니다."];
      }
      
      if (!Array.isArray(extractedData.preferences)) {
        extractedData.preferences = typeof extractedData.preferences === 'string' 
          ? [extractedData.preferences] 
          : ["응답 형식이 올바르지 않습니다."];
      }
      
      console.log("형식 변환 후:", {
        requirementsType: typeof extractedData.requirements,
        requirementsIsArray: Array.isArray(extractedData.requirements),
        preferencesType: typeof extractedData.preferences,
        preferencesIsArray: Array.isArray(extractedData.preferences)
      });
    }
    
    // 4. Save the extracted data to the database
    try {
      // Ensure we're storing valid JSON strings
      const requirementsJson = JSON.stringify(extractedData.requirements);
      const preferencesJson = JSON.stringify(extractedData.preferences);
      
      console.log(`Supabase에 분석 결과 저장 시도. 공고 ID: ${id}`);
      
      const { error: updateError } = await supabase
        .from('TB_JOBS')
        .update({
          requirements: requirementsJson,
          preferences: preferencesJson
        })
        .eq('id', id);
      
      if (updateError) {
        console.error('분석 결과 저장 실패:', updateError);
      } else {
        console.log(`분석 결과 저장 성공. 공고 ID: ${id}`);
      }
    } catch (updateError) {
      console.error('분석 결과 저장 실패:', updateError);
      // Continue to return the data even if saving failed
    }
    
    // 5. Return the extracted data
    console.log(`분석 완료 및 결과 반환. 공고 ID: ${id}`);
    return res.json(extractedData);
  } catch (error) {
    console.error('공고 분석 중 오류 발생:', error);
    res.status(500).json({ 
      error: error.message,
      requirements: ["공고 분석중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."],
      preferences: ["기술적 문제로 인해 분석이 완료되지 않았습니다."]
    });
  }
});

// Function to extract job requirements and preferences using OpenAI API
async function extractJobRequirementsPreferences(description, title) {
  // If no description is provided, return default values
  if (!description || description.trim() === '') {
    console.log("공고 내용이 없어 기본값 반환");
    return {
      requirements: ["정보가 제공되지 않았습니다"],
      preferences: ["정보가 제공되지 않았습니다"]
    };
  }

  try {
    console.log('공고 분석 시도:', title);
    
    // OpenAI API configuration - Get from environment variables
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('OpenAI API 키 설정 누락. 환경변수 OPENAI_API_KEY를 확인하세요.');
      return fallbackExtraction(description);
    }
    
    try {
      const prompt = `
      다음은 구직 공고의 내용입니다. 해당 공고에서 '자격 사항(requirements)'과 '우대 사항(preferences)'을 추출해주세요.
      
      공고 제목: ${title || '미제공'}
      
      공고 내용:
      ${description}
      
      아래 형식의 JSON으로 응답해주세요:
      {
        "requirements": ["자격사항1", "자격사항2", ...],
        "preferences": ["우대사항1", "우대사항2", ...]
      }
      
      각 항목은 짧고 명확한 문장으로 작성해 주세요. 공고에 명시된 내용이 없는 경우 해당 배열은 빈 배열로 두세요.
      반드시 JSON 형식으로만 응답하고, 다른 텍스트는 포함하지 마세요.
      `;
      
      console.log('OpenAI API 요청 시작');
      
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini', // Use a more widely available model
          messages: [
            { 
              role: 'system', 
              content: '당신은 채용 공고에서 자격 요건과 우대 사항을 추출하는 전문가입니다. 정확하고 간결하게 정보를 추출해주세요. 반드시 JSON 형식으로만 응답하세요.' 
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3, // Lower temperature for more focused responses
          max_tokens: 1000,  // Ensure we have enough tokens for the response
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 20000 // 20 seconds timeout
        }
      );

      console.log('OpenAI API 응답 수신됨');
      console.log('응답 상태 코드:', response.status);
      
      if (!response.data || !response.data.choices || !response.data.choices[0]) {
        console.error('OpenAI API 응답 형식 오류:', response.data);
        return fallbackExtraction(description);
      }

      // Parse the response to get the JSON output
      const content = response.data.choices[0].message.content;
      console.log('OpenAI 응답 원본:', content);
      
      // Try to extract valid JSON from the response
      try {
        // Find JSON in the string (in case the model outputs extra text)
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : content;
        console.log('추출된 JSON 문자열:', jsonStr);
        
        const extractedData = JSON.parse(jsonStr);
        
        // Validate the structure
        if (!extractedData.requirements || !extractedData.preferences ||
            !Array.isArray(extractedData.requirements) || !Array.isArray(extractedData.preferences)) {
          console.error('응답 형식이 올바르지 않습니다:');
          console.error('requirements의 타입:', typeof extractedData.requirements);
          console.error('preferences의 타입:', typeof extractedData.preferences);
          throw new Error('응답 형식이 올바르지 않습니다');
        }
        
        console.log('분석 결과 추출 성공:', {
          requirementsCount: extractedData.requirements.length,
          preferencesCount: extractedData.preferences.length
        });
        
        return {
          requirements: extractedData.requirements,
          preferences: extractedData.preferences
        };
      } catch (parseError) {
        console.error('OpenAI 응답 파싱 오류:', parseError, 'Content:', content);
        // Fallback to simple extraction
        return fallbackExtraction(description);
      }
    } catch (openaiError) {
      console.error('OpenAI API 오류:', openaiError.response?.status, openaiError.response?.statusText);
      console.error('상세 오류:', openaiError.response?.data || openaiError.message);
      // Use fallback extraction in case of API error
      return fallbackExtraction(description);
    }
  } catch (error) {
    console.error('분석 과정에서 일반 오류 발생:', error);
    // Use fallback extraction in case of general error
    return fallbackExtraction(description);
  }
}

// Improved fallback function for when OpenAI API fails
function fallbackExtraction(description) {
  console.log('Using fallback extraction method');
  const mockRequirements = [];
  const mockPreferences = [];
  
  // More robust pattern matching
  if (description) {
    // Common job requirements patterns
    const requirementPatterns = [
      { pattern: /경비|보안|security|guard/i, text: "경비교육이수자" },
      { pattern: /치매|요양|care|nursing/i, text: "치매교육이수자" },
      { pattern: /운전|면허|driver|license/i, text: "운전면허소지자" },
      { pattern: /사회복지|복지사|social worker|welfare/i, text: "사회복지사 자격증" },
      { pattern: /컴퓨터|IT|전산|computer/i, text: "컴퓨터 활용 능력" },
      { pattern: /영어|외국어|english|language/i, text: "외국어 능력" }
    ];
    
    // Common preferences patterns
    const preferencePatterns = [
      { pattern: /엑셀|excel|spreadsheet/i, text: "엑셀 활용 가능자" },
      { pattern: /워드|한글|word|document/i, text: "워드프로세서 능숙자" },
      { pattern: /경험|경력|experience/i, text: "관련 업무 경험자" },
      { pattern: /적극|성실|proactive|diligent/i, text: "적극적인 성격 소유자" },
      { pattern: /자격증|certification|license/i, text: "관련 자격증 소지자" }
    ];
    
    // Check for requirements
    requirementPatterns.forEach(item => {
      if (description.match(item.pattern) && !mockRequirements.includes(item.text)) {
        mockRequirements.push(item.text);
      }
    });
    
    // Check for preferences
    preferencePatterns.forEach(item => {
      if (description.match(item.pattern) && !mockPreferences.includes(item.text)) {
        mockPreferences.push(item.text);
      }
    });
  }
  
  // Add some default values if nothing was extracted
  if (mockRequirements.length === 0) {
    mockRequirements.push("경력 1년 이상", "관련 업무 유경험자");
  }
  
  if (mockPreferences.length === 0) {
    mockPreferences.push("컴퓨터 활용 능력 우수자", "적극적인 성격 소유자");
  }
  
  console.log(`Fallback extraction completed: ${mockRequirements.length} requirements, ${mockPreferences.length} preferences`);
  
  return {
    requirements: mockRequirements,
    preferences: mockPreferences
  };
}

module.exports = router;
