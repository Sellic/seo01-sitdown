import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { keywords, link } = await req.json();

    if (!keywords || !link) {
      return Response.json(
        { error: '키워드와 링크가 반드시 필요합니다.' },
        { status: 400 }
      );
    }

    const prompt = `
    당신은 뉴스 기사 작성자입니다. 

    아래 웹사이트와 키워드를 바탕으로 마케팅적 관점에서 기사를 작성해주세요.
    (기사는 SEO 백링크 제작을 위해 작성되는것이지만 티가 나서는 안됨.)

    해당 키워드와 해당 웹사이트의 정보를 참고하여 다음 형식에 맞는 기사 1건을 2000자 내외로 작성해 주세요. 
    키워드를 자연스럽게 포함시켜주세요.
    
    웹사이트 : ${link}
    키워드: ${keywords}

    응답 형식:
    ---
    제목: ...
    미리보기: ...
    본문: ...
`;

    const chatRes = await openai.chat.completions.create({
      model: 'gpt-4.1-nano',
      messages: [
        { 
          role: 'system', 
          content: '당신은 뉴스 기사 작성 AI입니다. 키워드를 자연스럽게 포함하여 논리적이고 일관된 기사를 작성해주세요.' 
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
    });

    const text = chatRes.choices[0].message.content;

    const titleMatch = text.match(/제목:\s*(.+)/);
    const previewMatch = text.match(/미리보기:\s*(.+)/);
    const contentMatch = text.match(/본문:\s*([\s\S]+)/);

    let content = contentMatch?.[1]?.trim() ?? '';

    return Response.json({
      title: titleMatch?.[1]?.trim() ?? '제목 없음',
      preview: previewMatch?.[1]?.trim() ?? '',
      content,
      keywords,
      link
    });

  } catch (err) {
    console.error(err);
    return Response.json({ error: 'AI 기사 생성 중 오류 발생' }, { status: 500 });
  }
}
