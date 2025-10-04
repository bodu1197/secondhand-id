'use client';

import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { UserRound, LogOut } from 'lucide-react';

export default function Header() {
  const supabase = createClientComponentClient();
  const [session, setSession] = useState<Session | null>(null);

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
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-gray-800">
          Toko Monggo
        </Link>
        <div className="space-x-4 flex items-center">
<<<<<<< HEAD
          {(session && session.user) ? ( // Check if session exists AND has a user
            <div className="flex items-center space-x-4">
              <Link href="/my-profile" className="text-gray-800 hover:opacity-80">
                <UserRound className="w-6 h-6" />
              </Link>
              <button onClick={handleSignOut} className="text-gray-800 hover:opacity-80">
>>>>>>> 8a8685e61326a63fdd74e93b3aec0cf4a90fb43f
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          ) : (
<<<<<<< HEAD
            <Link href="/auth/login" className="text-gray-800 hover:opacity-80">
>>>>>>> 8a8685e61326a63fdd74e93b3aec0cf4a90fb43f
              <UserRound className="w-6 h-6" />
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}