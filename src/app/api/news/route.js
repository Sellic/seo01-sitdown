import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, preview, content } = body;

    if (!title || !preview || !content) {
      return new Response(JSON.stringify({ message: "모든 필드를 채워주세요." }), {
        status: 400,
      });
    }

    const newNews = await prisma.news.create({
      data: {
        title,
        preview,
        content,
      },
    });

    return new Response(JSON.stringify(newNews), {
      status: 201,
    });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "서버 에러 발생" }), {
      status: 500,
    });
  }
}
