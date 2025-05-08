// app/news/[id]/page.js

// generateStaticParams 제거
// export async function generateStaticParams() { ... }


import { PrismaClient } from "@prisma/client";
import DeleteEditButtons from "./_components/DeleteEditButtons";
const prisma = new PrismaClient();

export default async function NewsDetailPage({ params }) {
  const newsId = Number(params.id);

  if (!newsId || isNaN(newsId)) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <h2 className="text-2xl font-bold mb-4">유효하지 않은 뉴스 ID입니다.</h2>
      </div>
    );
  }

  const news = await prisma.news.findUnique({
    where: { id: newsId },
  });

  if (!news) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <h2 className="text-2xl font-bold mb-4">뉴스를 찾을 수 없습니다.</h2>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">{news.title}</h1>
      <p className="text-gray-600 mb-4">
        {new Date(news.createdAt).toISOString().split("T")[0]}
      </p>
      <div
        className="text-lg leading-7 whitespace-pre-line"
        dangerouslySetInnerHTML={{ __html: news.content }}
      />
      <DeleteEditButtons newsId={news.id} />
    </div>
  );
}
