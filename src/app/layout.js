import "./globals.css";
import Link from 'next/link';
import ClientHeader from '@/components/ClientHeader';
import { GoogleAnalytics } from '@next/third-parties/google'

export const metadata = {
  title: "SIT DOWN - 서울 산업 트렌드 뉴스",
  description: "Seoul Industry Trend Up & Down. SIT DOWN은 서울의 산업 동향과 트렌드를 기록하는 뉴스 포털입니다.",
  keywords: ["산업 동향", "서울 산업", "스타트업", "트렌드", "SIT DOWN"],
  authors: [{ name: "SIT DOWN 운영팀", url: "https://sitdown.kr" }],
  openGraph: {
    title: "SIT DOWN - 산업 트렌드 뉴스 포털",
    description: "서울 산업 트렌드를 빠르게 캐치하는 뉴스 큐레이션 플랫폼",
    url: "https://sitdown.kr",
    siteName: "SIT DOWN",
    images: [
      {
        url: "https://sitdown.kr/og.png",
        width: 1200,
        height: 630,
        alt: "SIT DOWN",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className="flex flex-col min-h-screen">
        <GoogleAnalytics gaId="G-3EGLQXQ4MP" />
        <header className="flex justify-between p-4 bg-gray-100">
          <Link href="/">
            <h1 className="font-bold">📰 Sellic Industry Trend Up & Down</h1>
          </Link>
          <ClientHeader />
        </header>
        
        <main className="flex-1 p-4">
          {children}
        </main>

        <footer className="bg-gray-100 text-center p-4 text-gray-600 text-sm">
          © 2025 SIT DOWN. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
