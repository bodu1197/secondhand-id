'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CallbackPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // 세션이 있으면 홈으로 리다이렉트
        router.replace('/');
      } else {
        // 세션이 없으면 로그인 페이지로 리다이렉트 (에러 또는 로그인 실패)
        router.replace('/auth/login');
      }
    };

    // URL 해시가 변경될 때마다 콜백 처리
    // Supabase Auth Helpers가 자동으로 URL 해시를 처리하여 세션을 설정합니다.
    // 여기서는 세션이 설정되었는지 확인하고 리다이렉트만 수행합니다.
    handleCallback();
  }, [router, supabase]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-3xl font-bold">Memproses Login...</h1> {/* Processing Login... */}
      <p>Mohon tunggu sebentar.</p> {/* Please wait a moment. */}
    </main>
  );
}
