'use client';

import { useState } from 'react';
import { FiMenu, FiX, FiUser } from 'react-icons/fi';
import { useAuthStore } from '@/stores/auth.store';
import Sidebar from './Sidebar';

interface HeaderProps {
  title?: string;
}

export default function Header({ title }: HeaderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuthStore();

  return (
    <>
      <header className="bg-white border-b border-slate-200 px-4 lg:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
            onClick={() => setSidebarOpen(true)}
          >
            <FiMenu size={20} />
          </button>
          {title && <h1 className="text-lg font-semibold text-slate-800">{title}</h1>}
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <FiUser size={14} className="text-blue-600" />
          </div>
          <span className="hidden sm:block font-medium">{user?.nome || user?.email}</span>
        </div>
      </header>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64">
            <div className="relative h-full">
              <button
                className="absolute top-4 right-4 z-10 text-white/70 hover:text-white"
                onClick={() => setSidebarOpen(false)}
              >
                <FiX size={20} />
              </button>
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
