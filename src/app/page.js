import { PrismaClient } from "@prisma/client";
import NewsCard from "../components/NewsCard";

const prisma = new PrismaClient();
const ITEMS_PER_PAGE = 10; // 한 페이지당 표시할 뉴스 개수

export default async function Home({ searchParams }) {
  const page = Number(searchParams?.page) || 1;
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const [newsList, totalNews] = await Promise.all([
    prisma.news.findMany({
      orderBy: { createdAt: "desc" },
      take: ITEMS_PER_PAGE,
      skip: skip,
    }),
    prisma.news.count(),
  ]);

  const totalPages = Math.ceil(totalNews / ITEMS_PER_PAGE);

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h2 className="text-3xl font-bold mb-6">Latest News</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {newsList.map((news) => (
          <NewsCard
            id={news.id}
            title={news.title}
            date={new Date(news.createdAt).toISOString().split("T")[0]}
            preview={news.preview}
            key={news.id}
          />
        ))}
      </div>

      {/* 페이지네이션 UI */}
      <div className="flex justify-center gap-2 mt-8">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <a
            key={pageNum}
            href={`/?page=${pageNum}`}
            className={`px-4 py-2 rounded ${
              pageNum === page
                ? "bg-gray-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {pageNum}
          </a>
        ))}
      </div>
    </div>
  );
}
