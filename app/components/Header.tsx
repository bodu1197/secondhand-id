'use client';

import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { UserRound, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const supabase = createClientComponentClient();
  const [session, setSession] = useState<Session | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/products?q=${searchQuery}`);
    }
  };

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  return (
    <header className="bg-[#111827] shadow-md fixed top-0 left-0 right-0 z-50">
      <nav className="max-w-screen-xl mx-auto py-4 flex justify-between items-center">
        <div className="w-full flex justify-between items-center px-6"> {/* Added px-6 here */}
          <Link href="/" className="text-2xl font-bold text-gray-200">
            Toko Monggo
          </Link>

          {/* Search Bar for PC */}
          <div className="hidden md:flex flex-grow mx-4">
            <input
              type="text"
              placeholder="Cari produk..."
              className="w-full p-2 rounded-lg border border-gray-700 bg-[#1f2937] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            <button
              onClick={handleSearch}
              className="ml-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline"
            >
              Cari
            </button>
          </div>

          <div className="hidden md:flex space-x-4 items-center">
            <Link href="/products/register" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full text-sm">
              Jual
            </Link>
            {(session && session.user) ? ( // Check if session exists AND has a user
              <div className="flex items-center space-x-4">
                <Link href="/my-profile" className="text-gray-200 hover:opacity-80">
                  <UserRound className="w-6 h-6" />
                </Link>
                <button onClick={handleSignOut} className="text-gray-200 hover:opacity-80">
                  <LogOut className="w-6 h-6" />
                </button>
              </div>
            ) : (
              <Link href="/auth/login" className="text-gray-200 hover:opacity-80">
                <UserRound className="w-6 h-6" />
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}