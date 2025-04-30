'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewsWritePage() {
  const [title, setTitle] = useState('');
  const [preview, setPreview] = useState('');
  const [content, setContent] = useState('');
  const [keywords, setKeywords] = useState('');
  const [link, setLink] = useState('');
  const router = useRouter();

  const handleAIGenerate = async () => {
    if (!keywords.trim() || !link.trim()) {
      alert('키워드와 링크를 모두 입력해 주세요!');
      return;
    }

    const res = await fetch('/api/generate-article', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keywords, link }),
    });

    const data = await res.json();

    if (res.ok) {
      setTitle(data.title);
      setPreview(data.preview);
      setContent(data.content);
    } else {
      alert('AI 기사 생성 실패: ' + data.error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch('/api/news', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ title, preview, content }),
    });

    if (res.ok) {
      alert('작성 완료!');
      router.push('/');
    } else {
      alert('작성 실패!');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">뉴스 작성</h2>
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
          placeholder="본문 내용"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <input
          className="border p-2 rounded"
          placeholder="키워드 (콤마로 구분)"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
        />
        <input
          className="border p-2 rounded"
          placeholder="링크 (모든 키워드에 동일하게 적용)"
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />
        <button
          type="button"
          onClick={handleAIGenerate}
          className="bg-green-500 text-white py-2 rounded hover:bg-green-600"
        >
          AI로 기사 생성하기
        </button>
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          작성하기
        </button>
      </form>
    </div>
  );
}
