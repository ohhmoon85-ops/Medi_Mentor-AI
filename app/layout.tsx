import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '닥터홈 — 우리집 1차 의료 안내 + 건강기능식품 가이드',
  description: '증상으로 진료과·의료기관을 안내하고, 관련 건강기능식품 정보를 함께 제공하는 가정용 의료 안내 서비스',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full bg-white text-gray-900 antialiased">{children}</body>
    </html>
  )
}
