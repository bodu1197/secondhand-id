'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import Header from '../../components/Header';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [passwordMatchError, setPasswordMatchError] = useState('');
  const [isMinLengthValid, setIsMinLengthValid] = useState(false);
  const [hasUppercase, setHasUppercase] = useState(false);
  const [hasLowercase, setHasLowercase] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecialChar, setHasSpecialChar] = useState(false);
  const [isThreeOfFourValid, setIsThreeOfFourValid] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (confirmPassword && password !== confirmPassword) {
      setPasswordMatchError('비밀번호가 일치하지 않습니다.');
    } else {
      setPasswordMatchError('');
    }
  }, [password, confirmPassword]);

  useEffect(() => {
    const minLength = password.length >= 8;
    const upper = /[A-Z]/.test(password);
    const lower = /[a-z]/.test(password);
    const num = /[0-9]/.test(password);
    const special = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    setIsMinLengthValid(minLength);
    setHasUppercase(upper);
    setHasLowercase(lower);
    setHasNumber(num);
    setHasSpecialChar(special);

    const conditionsMet = [upper, lower, num, special].filter(Boolean).length;
    setIsThreeOfFourValid(conditionsMet >= 3);
  }, [password]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('가입 진행 중...');

    if (passwordMatchError || !isMinLengthValid || !isThreeOfFourValid) {
      setMessage('비밀번호 오류를 수정해주세요.');
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) {
      setMessage(`가입 실패: ${error.message}`);
    } else if (data.user) {
      // Generate default avatar URL
      const defaultAvatarUrl = `https://api.dicebear.com/6.x/initials/svg?seed=${name}`;

      const { error: insertError } = await supabase.from('users').insert({
        auth_id: data.user.id, // Use data.user.id directly
        name: name,
        email: email,
        avatar: defaultAvatarUrl, // Store the generated avatar URL
      });

      if (insertError) {
        setMessage(`사용자 정보 저장 실패: ${insertError.message}`);
      } else {
        setMessage('가입 성공! 이메일을 확인하여 인증을 완료해주세요.');
      }
    }
  };

  const renderValidationCheck = (isValid: boolean, text: string) => (
    <li className={`flex items-center ${isValid ? 'text-green-600' : 'text-red-500'}`}>
      <svg className="w-4 h-4 mr-2 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
        {isValid ? (
          <path d="M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm-1.293-4.293a1 1 0 0 0 1.414 1.414l4-4a1 1 0 0 0-1.414-1.414L9 12.586l-2.293-2.293a1 1 0 0 0-1.414 1.414l3 3z" />
        ) : (
          <path d="M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zM8.707 7.293a1 1 0 0 0-1.414 1.414L7.586 10l-1.293 1.293a1 1 0 1 0 1.414 1.414L9 11.414l1.293 1.293a1 1 0 0 0 1.414-1.414L10.414 10l1.293-1.293a1 1 0 0 0-1.414-1.414L9 8.586 7.707 7.293z" />
        )}
      </svg>
      {text}
    </li>
  );

  return (
    <>
    <Header />
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-4xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 shadow-lg rounded-lg overflow-hidden">
        {/* Left side: Image */}
        <div className="hidden md:block bg-blue-600 p-12 text-white">
          <h2 className="text-3xl font-extrabold mb-4">새로운 여정을 시작하세요</h2>
          <p className="text-blue-100">
            계정을 만들어 저희 커뮤니티에 참여하세요. 단 몇 분이면 충분합니다.
          </p>
        </div>

        {/* Right side: Form */}
        <div className="p-8 bg-white">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">계정 만들기</h1>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">이름</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                placeholder="홍길동"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">이메일 주소</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">비밀번호</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">비밀번호 확인</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                placeholder="••••••••"
              />
              {passwordMatchError && <p className="text-xs text-red-500 mt-1">{passwordMatchError}</p>}
            </div>
            
            <div className="text-xs text-gray-600 space-y-1">
              <p>비밀번호는 다음 조건을 충족해야 합니다:</p>
              <ul className="list-none space-y-1">
                {renderValidationCheck(isMinLengthValid, '최소 8자 이상')}
                {renderValidationCheck(isThreeOfFourValid, '다음 중 3가지 이상 조합')}
              </ul>
              <ul className="list-disc list-inside pl-4 text-gray-500">
                  <li>영문 대문자 (A-Z)</li>
                  <li>영문 소문자 (a-z)</li>
                  <li>숫자 (0-9)</li>
                  <li>특수문자 (!@#$...)</li>
              </ul>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300"
            >
              가입하기
            </button>
          </form>
          {message && <p className="mt-4 text-center text-sm text-green-600">{message}</p>}
          <p className="mt-8 text-center text-sm text-gray-600">
            이미 계정이 있으신가요?{' '}
            <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
