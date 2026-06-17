'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FiHome, FiFileText, FiPlus, FiLogOut } from 'react-icons/fi';
import { useLogout } from '@/hooks/auth/useLogout';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: FiHome },
  { href: '/receipts/new', label: 'Novo Recibo', icon: FiPlus },
  { href: '/receipts', label: 'Meus Recibos', icon: FiFileText },
];

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useLogout();

  return (
    <div className="flex flex-col h-full bg-[#0f1e3c] text-white">
      <div className="flex items-center justify-center px-6 py-6 border-b border-white/10">
        <div className="relative w-40 h-14">
          <Image
            src="/logo-autobras.png"
            alt="Autobras"
            fill
            className="object-contain"
            priority
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
        {/* Fallback text logo */}
        <div className="absolute">
          <span className="sr-only">Autobras</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={(e) => {
                if (isActive) {
                  e.preventDefault();
                  window.location.href = href;
                  return;
                }
                onClose?.();
              }}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                ${isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-6 border-t border-white/10 pt-4">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all w-full"
        >
          <FiLogOut size={18} />
          Sair
        </button>
      </div>
    </div>
  );
}
