'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DeleteEditButtons({ newsId }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleDelete = async () => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    const res = await fetch(`/api/news/${newsId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (res.ok) {
      await fetch('/api/revalidate?path=/', {
        method: 'POST',
        headers: {
          'x-revalidate-token': process.env.NEXT_PUBLIC_REVALIDATE_TOKEN
        }
      });
      alert("삭제되었습니다.");
      router.push("/");
    } else {
      const result = await res.json();
      alert("삭제 실패: " + result.error);
    }
  };

  if (!isLoggedIn) return null;

  return (
    <div className="flex gap-4">
      <button
        className="px-4 py-2 bg-yellow-400 rounded"
        onClick={() => router.push(`/news/${newsId}/edit`)}
      >
        수정
      </button>
      <button
        className="px-4 py-2 bg-red-600 text-white rounded"
        onClick={handleDelete}
      >
        삭제
      </button>
    </div>
  );
}
