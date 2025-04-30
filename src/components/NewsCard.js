import Link from "next/link";

export default function NewsCard({ id, title, date, preview }) {
  return (
    <Link href={`/news/${id}`}>
      <div className="border p-4 rounded hover:shadow-md cursor-pointer">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-2">{date}</p>
        <p className="text-gray-800">{preview}</p>
      </div>
    </Link>
  );
}
