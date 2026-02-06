'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Upload,
  DollarSign,
  LogOut,
  TrendingUp,
  X,
  Settings,
  HelpCircle,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/upload', label: 'Upload CSV', icon: Upload },
  { href: '/income', label: 'Income Records', icon: DollarSign },
];

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const userInitial = user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U';
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="flex flex-col h-full w-64 bg-gray-900/95 backdrop-blur-xl border-r border-white/10">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <span className="text-lg font-bold text-white">IncomeTracker</span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-gray-400 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Menu
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Help section */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-white/10 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="w-5 h-5 text-blue-400" />
            <span className="font-medium text-white text-sm">Need help?</span>
          </div>
          <p className="text-xs text-gray-400 mb-3">
            Upload your first CSV to start tracking income
          </p>
          <Link
            href="/upload"
            onClick={onClose}
            className="block w-full text-center text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
          >
            Get Started →
          </Link>
        </div>
      </div>

      {/* User section */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
            {userInitial.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{userName}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => {
            signOut();
            onClose?.();
          }}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-gray-400 hover:bg-white/5 hover:text-white rounded-xl transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign out</span>
        </button>
      </div>
    </div>
  );
}
