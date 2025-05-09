import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { link, additionalInfo } = await req.json();

    if (!link) {
      return Response.json(
        { error: '링크가 반드시 필요합니다.' },
        { status: 400 }
      );
    }

    const prompt = `
    당신은 웹사이트 분석 전문가입니다.
    
    아래 웹사이트를 분석하여 다음 정보를 제공해주세요:
    
    1. 주요 서비스/제품: 해당 사이트가 제공하는 주요 서비스나 제품에 대한 설명
    2. 타겟 고객층: 이 서비스/제품의 주요 타겟 고객층
    3. 주요 특징과 장점: 이 서비스/제품의 주요 특징과 경쟁력
    4. 시장 포지셔닝: 이 서비스/제품의 시장에서의 위치와 차별점
    
    ${additionalInfo ? `\n추가 정보:\n${additionalInfo}\n` : ''}
    
    위 정보를 바탕으로 SEO에 효과적인 키워드 10개를 추천해주세요.
    각 키워드는 쉼표로 구분하여 나열해주세요.
    
    응답 형식:
    ---
    분석:
    - 주요 서비스/제품: [내용]
    - 타겟 고객층: [내용]
    - 주요 특징과 장점: [내용]
    - 시장 포지셔닝: [내용]
    
    키워드: [키워드1, 키워드2, ...]
    
    웹사이트: ${link}
    `;

    const chatRes = await openai.chat.completions.create({
      model: 'gpt-4.1-nano',
      messages: [
        { 
          role: 'system', 
          content: '당신은 웹사이트 분석 및 SEO 키워드 추천 전문가입니다.' 
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    });

    const text = chatRes.choices[0].message.content.trim();
    
    // 분석 결과 파싱
    const analysisMatch = text.match(/분석:\s*([\s\S]+?)(?=키워드:|$)/);
    const keywordsMatch = text.match(/키워드:\s*(.+)/);

    const analysisText = analysisMatch?.[1]?.trim() ?? '';
    const analysis = {
      services: analysisText.match(/주요 서비스\/제품:\s*(.+)/)?.[1]?.trim() ?? '',
      targetAudience: analysisText.match(/타겟 고객층:\s*(.+)/)?.[1]?.trim() ?? '',
      features: analysisText.match(/주요 특징과 장점:\s*(.+)/)?.[1]?.trim() ?? '',
      positioning: analysisText.match(/시장 포지셔닝:\s*(.+)/)?.[1]?.trim() ?? '',
    };

    return Response.json({
      keywords: keywordsMatch?.[1]?.trim() ?? '',
      analysis,
      link
    });

  } catch (err) {
    console.error(err);
    return Response.json({ error: '사이트 분석 중 오류 발생' }, { status: 500 });
  }
} 