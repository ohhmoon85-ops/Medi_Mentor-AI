import { NextRequest, NextResponse } from 'next/server'

// /pro/* 라우트는 세션 기반 인증 체크 (Phase 4에서 Supabase Auth로 교체)
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // /pro/verify는 인증 없이 접근 가능
  if (pathname.startsWith('/pro') && !pathname.startsWith('/pro/verify')) {
    // 실제 운영에서는 Supabase Auth JWT 검증으로 교체
    // 현재는 클라이언트 사이드 sessionStorage 체크로 임시 처리
    // (서버 미들웨어에서는 클라이언트 sessionStorage 접근 불가)
    // Phase 4에서 Supabase SSR 쿠키 기반 인증으로 교체 예정
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/pro/:path*'],
}
