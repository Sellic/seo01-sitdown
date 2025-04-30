import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { keywords, link } = await req.json();

    if (!keywords || !link) {
      return Response.json(
        { error: '키워드와 링크가 모두 필요합니다.' },
        { status: 400 }
      );
    }

    const keywordList = keywords.split(',').map(k => k.trim());

    const prompt = `
당신은 뉴스 기사 작성자입니다. 아래 키워드를 사용해 다음 형식에 맞는 기사 1건을 작성해 주세요 본문은 2000자 내외로 최대한 길게 작성해주세요. 

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
        { role: 'system', content: '당신은 뉴스 기사 작성 AI입니다.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
    });

    const text = chatRes.choices[0].message.content;

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
    });

  } catch (err) {
    console.error(err);
    return Response.json({ error: 'AI 기사 생성 중 오류 발생' }, { status: 500 });
  }
}
