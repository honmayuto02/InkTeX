import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // APIルートに対して GET メソッドでアクセスが来た場合（Botなど）
  // ただし /api/sync は GET でのポーリングや作成を行うため許可する
  if (pathname.startsWith('/api/') && request.method === 'GET' && !pathname.startsWith('/api/sync')) {
    return new NextResponse(
      JSON.stringify({ error: 'Method Not Allowed', message: 'API endpoints only accept POST requests.' }),
      {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  return NextResponse.next();
}

// 【重要】静的ファイル（画像など）ではMiddlewareを起動させない設定
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
