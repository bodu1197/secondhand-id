'use client';

import Link from 'next/link';
import { Home as HomeIcon, PlusSquare, MapPin, MessageSquare, UserRound } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Beranda',
      icon: HomeIcon,
      href: '/',
    },
    {
      name: 'Jual',
      icon: PlusSquare,
      href: '/products/register',
    },
    {
      name: 'Sekitar',
      icon: MapPin,
      href: '/nearby', // Assuming a nearby page
    },
    {
      name: 'Obrolan',
      icon: MessageSquare,
      href: '/chat', // Assuming a chat page
    },
    {
      name: 'Akun Saya',
      icon: UserRound,
      href: '/my-profile',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1f2937] border-t border-gray-700 shadow-lg md:hidden z-50">
      <div className="flex justify-around h-14">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center text-xs font-medium transition-colors ${isActive ? 'text-blue-400' : 'text-gray-400 hover:text-gray-100'}`}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
