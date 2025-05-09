'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewsWritePage() {
  const [step, setStep] = useState(1); // 1: URL 입력, 2: 키워드 수정, 3: 기사 생성, 4: 최종 확인
  const [title, setTitle] = useState('');
  const [preview, setPreview] = useState('');
  const [content, setContent] = useState('');
  const [keywords, setKeywords] = useState('');
  const [link, setLink] = useState('');
  const [siteAnalysis, setSiteAnalysis] = useState(null);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasBacklinks, setHasBacklinks] = useState(false);
  const router = useRouter();

  const handleAnalyzeSite = async (additionalInfo = '') => {
    if (!link.trim()) {
      alert('웹사이트 주소는 필수값 입니다!');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/analyze-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link, additionalInfo }),
      });

      const data = await res.json();

      if (res.ok) {
        setKeywords(data.keywords);
        setSiteAnalysis(data.analysis);
        setStep(2);
      } else {
        alert('사이트 분석 실패: ' + data.error);
      }
    } catch (error) {
      alert('사이트 분석 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReanalyze = async () => {
    await handleAnalyzeSite(additionalInfo);
  };

  const handleGenerateArticle = async () => {
    setIsLoading(true);
    try {
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
        setStep(3);
      } else {
        alert('AI 기사 생성 실패: ' + data.error);
      }
    } catch (error) {
      alert('AI 기사 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsertBacklinks = () => {
    const keywordList = keywords.split(',').map(k => k.trim());
    let newContent = content;

    keywordList.forEach((keyword) => {
      if (keyword) {
        const regex = new RegExp(`(${keyword})`, 'g');
        newContent = newContent.replace(
          regex,
          `<a href="${link}" target="_blank">$1</a>`
        );
      }
    });

    setContent(newContent);
    setHasBacklinks(true);
    setStep(4);
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
      
      {/* 진행 단계 표시 */}
      <div className="flex justify-between mb-8">
        {[1, 2, 3, 4].map((stepNumber) => (
          <div
            key={stepNumber}
            className={`flex-1 text-center ${
              step >= stepNumber ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
              step >= stepNumber ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}>
              {stepNumber}
            </div>
            <div className="mt-2 text-sm">
              {stepNumber === 1 && 'URL 입력'}
              {stepNumber === 2 && '키워드 수정'}
              {stepNumber === 3 && '기사 생성'}
              {stepNumber === 4 && '최종 확인'}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Step 1: URL 입력 */}
        {step === 1 && (
          <div className="space-y-4">
            <input
              className="border p-2 rounded w-full"
              placeholder="타겟 사이트 URL을 입력하세요"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
            <button
              type="button"
              onClick={() => handleAnalyzeSite()}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isLoading ? '분석 중...' : '사이트 분석하기'}
            </button>
          </div>
        )}

        {/* Step 2: 키워드 수정 */}
        {step === 2 && (
          <div className="space-y-6">
            {/* 사이트 분석 결과 */}
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-bold mb-4 text-lg">사이트 분석 결과</h3>
              {siteAnalysis && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">주요 서비스/제품</h4>
                    <p className="text-gray-700">{siteAnalysis.services}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">타겟 고객층</h4>
                    <p className="text-gray-700">{siteAnalysis.targetAudience}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">주요 특징과 장점</h4>
                    <p className="text-gray-700">{siteAnalysis.features}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">시장 포지셔닝</h4>
                    <p className="text-gray-700">{siteAnalysis.positioning}</p>
                  </div>
                </div>
              )}
            </div>

            {/* 부가 설명 입력 */}
            <div className="bg-white p-4 rounded border">
              <h3 className="font-bold mb-4 text-lg">부가 설명</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    추가 정보 입력
                  </label>
                  <textarea
                    className="border p-2 rounded w-full min-h-[100px]"
                    placeholder="사이트에 대한 추가 정보나 특별히 고려해야 할 점을 입력하세요"
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    사이트에 대한 추가 정보나 특별히 고려해야 할 점을 입력하면 더 정확한 분석이 가능합니다.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleReanalyze}
                  disabled={isLoading}
                  className="w-full bg-blue-100 text-blue-600 py-2 rounded hover:bg-blue-200 disabled:bg-blue-50 disabled:text-blue-300"
                >
                  {isLoading ? '분석 중...' : '부가 설명을 반영하여 다시 분석하기'}
                </button>
              </div>
            </div>

            {/* 키워드 수정 폼 */}
            <div className="bg-white p-4 rounded border">
              <h3 className="font-bold mb-4 text-lg">키워드 수정</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    추천 키워드
                  </label>
                  <textarea
                    className="border p-2 rounded w-full min-h-[100px]"
                    placeholder="키워드를 수정하세요 (쉼표로 구분)"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    추천된 키워드를 수정하거나 새로운 키워드를 추가할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
              >
                이전
              </button>
              <button
                type="button"
                onClick={handleGenerateArticle}
                disabled={isLoading}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
              >
                {isLoading ? '기사 생성 중...' : '기사 생성하기'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: 기사 생성 */}
        {step === 3 && (
          <div className="space-y-4">
            <input
              className="border p-2 rounded w-full"
              placeholder="제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              className="border p-2 rounded w-full"
              placeholder="미리보기 문구"
              value={preview}
              onChange={(e) => setPreview(e.target.value)}
            />
            <textarea
              className="border p-2 rounded w-full min-h-[200px]"
              placeholder="본문 내용"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
              >
                이전
              </button>
              <button
                type="button"
                onClick={handleInsertBacklinks}
                className="flex-1 bg-purple-500 text-white py-2 rounded hover:bg-purple-600"
              >
                백링크 삽입하기
              </button>
            </div>
          </div>
        )}

        {/* Step 4: 최종 확인 */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-bold mb-4 text-lg">최종 확인</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">기본 정보</h4>
                  <div className="bg-white p-3 rounded border">
                    <p className="mb-2"><strong>제목:</strong> {title}</p>
                    <p className="mb-2"><strong>미리보기:</strong> {preview}</p>
                    <p className="mb-2"><strong>키워드:</strong> {keywords}</p>
                    <p className="mb-2"><strong>타겟 URL:</strong> {link}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">기사 내용</h4>
                  <div className="bg-white p-3 rounded border">
                    <div 
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: content }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
              >
                이전
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-green-300"
              >
                {isSubmitting ? '작성 중...' : '작성 완료하기'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
