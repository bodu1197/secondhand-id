import Image from 'next/image';
import Header from './components/Header';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-gray-50 text-gray-800">
      <Header />
      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center text-center py-20 px-6">
        <h1 className="text-5xl font-extrabold text-gray-900 leading-tight">
          세상을 연결하는 새로운 방법
        </h1>
        <p className="mt-4 text-xl text-gray-600 max-w-2xl">
          저희 플랫폼과 함께라면, 당신의 아이디어가 현실이 됩니다. 지금 바로 시작하여 가능성을 탐험해보세요.
        </p>
        <Link href="/auth/register" className="mt-8 px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition duration-300 transform hover:scale-105">
          무료로 시작하기
        </Link>
      </main>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">주요 기능</h2>
          <div className="flex flex-wrap -mx-4">
            <div className="w-full md:w-1/3 px-4 mb-8">
              <div className="bg-gray-50 p-8 rounded-lg shadow-lg text-center">
                <h3 className="text-xl font-bold mb-2">실시간 협업</h3>
                <p className="text-gray-600">팀원들과 함께 문서를 실시간으로 편집하고 아이디어를 공유하세요.</p>
              </div>
            </div>
            <div className="w-full md:w-1/3 px-4 mb-8">
              <div className="bg-gray-50 p-8 rounded-lg shadow-lg text-center">
                <h3 className="text-xl font-bold mb-2">강력한 보안</h3>
                <p className="text-gray-600">당신의 데이터는 최신 암호화 기술로 안전하게 보호됩니다.</p>
              </div>
            </div>
            <div className="w-full md:w-1/3 px-4 mb-8">
              <div className="bg-gray-50 p-8 rounded-lg shadow-lg text-center">
                <h3 className="text-xl font-bold mb-2">다양한 통합</h3>
                <p className="text-gray-600">즐겨 사용하는 다른 서비스들과 손쉽게 연동하여 사용하세요.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-6 text-center">
          <p>&copy; 2025 Toko Monggo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
