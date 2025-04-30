'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ClientHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    setMounted(true); // 마운트 완료 표시
  }, []);

  if (!mounted) return null; // 처음엔 아무것도 렌더링하지 않음

  return (
    <nav className="flex gap-4 items-center">
      {isLoggedIn ? (
        <>
          <Link href="/admin/new">기사 작성</Link>
          <button onClick={() => {
            localStorage.removeItem("token");
            location.reload();
          }}>
            로그아웃
          </button>
        </>
      ) : (
        <Link href="/login">로그인</Link>
      )}
    </nav>
  );
}
