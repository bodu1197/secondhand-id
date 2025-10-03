'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import Header from '../../components/Header';
import { Camera, Loader2 } from 'lucide-react';

export default function EditMyProfilePage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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

        const { data: existingProfile, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', supabaseUser.id)
          .single();

        if (fetchError) throw fetchError;

        setProfile(existingProfile);
        setName(existingProfile.name);
        setLocation(existingProfile.location || '');
        setAvatarUrl(existingProfile.avatar);

      } catch (err: any) {
        console.error('프로필 로딩 오류:', err.message);
        setError('프로필을 불러오는데 실패했습니다. 다시 시도해주세요.');
      } finally {
        setLoading(false);
      }
    };

    getUserAndProfile();
  }, [supabase, router]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setAvatarFile(file);
      setAvatarUrl(URL.createObjectURL(file)); // Preview new avatar
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      let newAvatarPath = avatarUrl;

      if (avatarFile) {
        setUploadingAvatar(true);
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars') // Assuming a bucket named 'avatars' exists
          .upload(filePath, avatarFile, { cacheControl: '3600', upsert: false });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
        
        newAvatarPath = publicUrlData.publicUrl;
        setUploadingAvatar(false);
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({ name, location, avatar: newAvatarPath })
        .eq('auth_id', user?.id);

      if (updateError) throw updateError;

      router.push('/my-profile'); // Redirect back to profile page

    } catch (err: any) {
      console.error('프로필 업데이트 오류:', err.message);
      setError('프로필 업데이트에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
      setUploadingAvatar(false);
    }
  };

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
          <Link href="/my-profile" className="mt-4 inline-block px-6 py-2 text-white bg-blue-600 rounded hover:bg-blue-700">
            내 프로필로 돌아가기
          </Link>
        </div>
      </main>
    );
  }

  if (!user || !profile) {
    router.push('/auth/login');
    return null;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-10">
        <main className="container mx-auto p-6">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">프로필 수정</h1>
            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative w-32 h-32 rounded-full border-4 border-blue-500 object-cover group">
                  <img
                    src={avatarUrl || `https://api.dicebear.com/6.x/initials/svg?seed=${profile.name}`}
                    alt="Profile Avatar"
                    className="w-full h-full rounded-full object-cover"
                  />
                  <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="w-8 h-8 text-white" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      disabled={uploadingAvatar}
                    />
                  </label>
                  {uploadingAvatar && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 rounded-full">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500">클릭하여 아바타 변경</p>
              </div>

              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">이름</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                />
              </div>

              {/* Location Field */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">위치</label>
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Link href="/my-profile" className="inline-flex justify-center py-3 px-6 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300">
                  취소
                </Link>
                <button
                  type="submit"
                  className="inline-flex justify-center py-3 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300"
                  disabled={submitting || uploadingAvatar}
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : null}
                  저장
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}
