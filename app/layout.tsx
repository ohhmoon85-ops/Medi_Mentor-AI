import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MediMentor AI - 의료 진료 지원 플랫폼',
  description: '환자·의사 양방향 AI 임상 지원 서비스',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full bg-white text-gray-900 antialiased">{children}</body>
    </html>
  )
}
