import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(req, { params }) {
  const id = Number(params.id);
  const news = await prisma.news.findUnique({ where: { id } });

  if (!news) {
    return Response.json({ error: "뉴스를 찾을 수 없습니다." }, { status: 404 });
  }

  return Response.json(news);
}

export async function DELETE(req, { params }) {
  const id = Number(params.id);

  try {
    await prisma.news.delete({ where: { id } });
    return Response.json({ message: "삭제 완료" });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "삭제 실패" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const id = Number(params.id);
  const body = await req.json();

  try {
    const updated = await prisma.news.update({
      where: { id },
      data: {
        title: body.title,
        preview: body.preview,
        content: body.content,
      },
    });

    return Response.json(updated);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "수정 실패" }, { status: 500 });
  }
}