import { PrismaClient } from "@prisma/client";
import NewsCard from "../components/NewsCard";

const prisma = new PrismaClient();

export default async function Home() {
  const newsList = await prisma.news.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h2 className="text-3xl font-bold mb-6">Latest News</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {newsList.map((news) => (
          <NewsCard
            id={news.id}  // <- 추가! id 꼭 넘겨야 함!!
            title={news.title}
            date={new Date(news.createdAt).toISOString().split("T")[0]}
            preview={news.preview}
            key={news.id}  // (React 최적화 위해 key도 추가)
          />
        ))}
      </div>
    </div>
  );
}
