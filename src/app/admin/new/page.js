'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewsWritePage() {
  const [title, setTitle] = useState('');
  const [preview, setPreview] = useState('');
  const [content, setContent] = useState('');
  const [keywords, setKeywords] = useState('');
  const [link, setLink] = useState('');
  const [keywordRelation, setKeywordRelation] = useState('');
  const [isGenerated, setIsGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleAIGenerate = async () => {
    if (!link.trim()) {
      alert('웹사이트 주소는 필수값 입니다!');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          keywords, 
          link,
          keywordRelation 
        }),
      });

      const data = await res.json();
      console.log('API Response:', data);

      if (res.ok) {
        setTitle(data.title);
        setPreview(data.preview);
        setContent(data.content);
        if (data.keywords) {
          console.log('Setting keywords:', data.keywords);
          setKeywords(data.keywords);
        }
        setIsGenerated(true);
      } else {
        alert('AI 기사 생성 실패: ' + data.error);
      }
    } catch (error) {
      alert('AI 기사 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ title, preview, content }),
      });

      if (res.ok) {
        await fetch('/api/revalidate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: '/',
            secret: process.env.NEXT_PUBLIC_REVALIDATE_TOKEN,
          }),
        });
        alert('작성 완료!');
        router.push('/');
      } else {
        alert('작성 실패!');
        setIsSubmitting(false);
      }
    } catch (error) {
      alert('작성 중 오류가 발생했습니다.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">뉴스 작성</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          className="border p-2 rounded"
          placeholder="타겟 사이트 (모든 키워드에 동일하게 적용)"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAIGenerate();
            }
          }}
        />
        <input
          className="border p-2 rounded disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={!isGenerated}
        />
        <input
          className="border p-2 rounded disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="미리보기 문구"
          value={preview}
          onChange={(e) => setPreview(e.target.value)}
          disabled={!isGenerated}
        />
        <textarea
          className="border p-2 rounded min-h-[200px] disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="본문 내용"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={!isGenerated}
        />
        <input
          className="border p-2 rounded"
          placeholder="키워드 (콤마로 구분) (선택사항)"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
        />
        <textarea
          className="border p-2 rounded min-h-[100px]"
          placeholder="키워드 간의 관계나 기사의 맥락을 설명하면 더 나은 기사가 생성됨. 작성된 기사가 이상하면, 여기에 설명을 추가하세요.(선택사항)"
          value={keywordRelation}
          onChange={(e) => setKeywordRelation(e.target.value)}
        />
        <button
          type="button"
          onClick={handleAIGenerate}
          disabled={isLoading}
          className={`relative flex items-center justify-center bg-green-500 text-white py-2 rounded hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed min-h-[40px]`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              기사 생성 중...
            </>
          ) : isGenerated ? (
            '기사 다시 생성하기'
          ) : (
            'AI로 기사 생성하기'
          )}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '작성 중...' : '작성하기'}
        </button>
      </form>
    </div>
  );
}
