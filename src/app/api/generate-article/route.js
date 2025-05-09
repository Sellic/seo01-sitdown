import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { keywords, link, keywordRelation } = await req.json();

    if (!link) {
      return Response.json(
        { error: '링크가 반드시 필요합니다.' },
        { status: 400 }
      );
    }

    const keywordList = keywords.split(',').map(k => k.trim());

    const prompt = `
    당신은 뉴스 기사 작성자입니다. 

    아래 웹사이트가 소개하는 회사나 서비스에 대해서 조사하고, 마케팅적 관점에서 이 회사를 가장 잘 소개할 수 있는 키워드 10개를 SEO적 관점에서 선택하세요. 
    (기사는 SEO 백링크 제작을 위해 작성되는것이지만 티가 나서는 안됨.)

    해당 키워드와 해당 웹사이트의 정보를 참고하여 다음 형식에 맞는 기사 1건을 2000자 내외로 작성해 주세요. 
    키워드를 반드시 다 사용할 필요는 없음. 적절하게 사용하면 됩니다.
    키워드 간의 관계에 더 집중해서 기사를 작성 해 주세요. 
    
    아래 필수 키워드는 반드시 포함되어야 합니다.

    웹사이트 : ${link}
    ${keywords ? `필수 키워드: ${keywords}` : ''}
    ${keywordRelation ? `추가 설명: ${keywordRelation}` : ''}

    응답 형식:
    ---
    선택된 키워드(콤마로 구분): ...
    제목: ...
    미리보기: ...
    본문: ...

`;

    const chatRes = await openai.chat.completions.create({
      model: 'gpt-4.1-nano',
      messages: [
        { 
          role: 'system', 
          content: '당신은 뉴스 기사 작성 AI입니다. 키워드 간의 관계를 고려하여 논리적이고 일관된 기사를 작성해주세요. ' 
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
    });

    const text = chatRes.choices[0].message.content;

    const keywordsMatch = text.match(/선택된 키워드\(콤마로 구분\):\s*(.+)/);
    const titleMatch = text.match(/제목:\s*(.+)/);
    const previewMatch = text.match(/미리보기:\s*(.+)/);
    const contentMatch = text.match(/본문:\s*([\s\S]+)/);

    let content = contentMatch?.[1]?.trim() ?? '';

    // 🔗 키워드 자동 링크 삽입
    keywordList.forEach((keyword) => {
      if (keyword) {
        const regex = new RegExp(`(${keyword})`, 'g');
        content = content.replace(
          regex,
          `<a href="${link}" target="_blank">$1</a>`
        );
      }
    });

    return Response.json({
      title: titleMatch?.[1]?.trim() ?? '제목 없음',
      preview: previewMatch?.[1]?.trim() ?? '',
      content,
      keywords: keywordsMatch?.[1]?.trim() ?? '',
    });

  } catch (err) {
    console.error(err);
    return Response.json({ error: 'AI 기사 생성 중 오류 발생' }, { status: 500 });
  }
}
