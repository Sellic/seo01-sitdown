'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewsEditPage({ params }) {
  const router = useRouter();
  const newsId = Number(params.id);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [preview, setPreview] = useState('');

  useEffect(() => {
    const fetchNews = async () => {
      const res = await fetch(`/api/news/${newsId}`);
      const data = await res.json();
      setTitle(data.title);
      setPreview(data.preview);
      setContent(data.content);
    };

    fetchNews();
  }, [newsId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(`/api/news/${newsId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ title, preview, content }),
    });

    if (res.ok) {
      alert('수정 완료!');
      router.push(`/news/${newsId}`);
    } else {
      const err = await res.json();
      alert('수정 실패: ' + err.error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">뉴스 수정</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          className="border p-2 rounded"
          placeholder="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="border p-2 rounded"
          placeholder="미리보기 문구"
          value={preview}
          onChange={(e) => setPreview(e.target.value)}
        />
        <textarea
          className="border p-2 rounded min-h-[200px]"
          placeholder="본문"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button type="submit" className="bg-blue-600 text-white py-2 rounded">
          수정하기
        </button>
      </form>
    </div>
  );
}
