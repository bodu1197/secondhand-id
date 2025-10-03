'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import Header from '../components/Header';

export default function MyProfilePage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getUserAndProfile = async () => {
      try {
        const { data: { user: supabaseUser }, error: userError } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!supabaseUser) {
          router.push('/auth/login');
          return;
        }
        setUser(supabaseUser);

        let profileData;
        const { data: existingProfile, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', supabaseUser.id)
          .single();

        if (fetchError && fetchError.code === 'PGRST116') {
          const { data: newProfile, error: insertError } = await supabase
            .from('users')
            .insert({
              auth_id: supabaseUser.id,
              name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || '새 사용자',
              email: supabaseUser.email,
              avatar: supabaseUser.user_metadata?.avatar_url,
            })
            .select('*')
            .single();

          if (insertError) throw insertError;
          profileData = newProfile;
        } else if (fetchError) {
          throw fetchError;
        } else {
          profileData = existingProfile;
        }
        setProfile(profileData);

      } catch (err: any) {
        console.error('프로필 로딩 오류:', err.message);
        setError('프로필을 불러오는데 실패했습니다. 다시 시도해주세요.');
        // Optionally, you might want to delay this redirect or show the error for a bit
        // router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    getUserAndProfile();
  }, [supabase, router]);

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg text-gray-600">프로필을 불러오는 중...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-red-500">{error}</p>
          <Link href="/auth/login" className="mt-4 inline-block px-6 py-2 text-white bg-blue-600 rounded hover:bg-blue-700">
            로그인으로 돌아가기
          </Link>
        </div>
      </main>
    );
  }

  if (!user || !profile) {
    // This case might be redundant due to the checks in useEffect, but it's good for safety.
    router.push('/auth/login');
    return null; // Render nothing while redirecting
  }

  return (
    <>
    <Header />
    <div className="min-h-screen bg-gray-50">
        {/* Profile Card */}
        <main className="container mx-auto p-6">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
                <div className="flex flex-col items-center space-y-4">
                    <img 
                        src={profile.avatar || `https://api.dicebear.com/6.x/initials/svg?seed=${profile.name}`}
                        alt="Profile Avatar"
                        className="w-32 h-32 rounded-full border-4 border-blue-500 object-cover"
                    />
                    <h2 className="text-3xl font-bold text-gray-900">{profile.name}</h2>
                </div>
                <div className="mt-8 border-t border-gray-200 pt-6">
                    <dl className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                            <dt className="text-sm font-medium text-gray-500">이메일 주소</dt>
                            <dd className="md:col-span-2 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{profile.email}</dd>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                            <dt className="text-sm font-medium text-gray-500">전화번호</dt>
                            <dd className="md:col-span-2 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                                {profile.phone || '정보 없음'}
                            </dd>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                            <dt className="text-sm font-medium text-gray-500">위치</dt>
                            <dd className="md:col-span-2 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                                {profile.location || '정보 없음'}
                            </dd>
                        </div>
                    </dl>
                </div>
                <div className="mt-8 text-center">
                    <Link href="/my-profile/edit" className="inline-block px-8 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition duration-300">
                        프로필 수정
                    </Link>
                </div>
            </div>
        </main>
    </div>
    </>
  );
}
