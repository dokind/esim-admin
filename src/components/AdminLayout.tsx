'use client';

import { ReactNode } from 'react';
import { 
  LayoutDashboard, 
  Globe, 
  Users, 
  Settings, 
  BarChart3,
  Menu,
  Bell
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, current: true },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, current: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center">
            <button className="md:hidden mr-4">
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">eSIM Admin</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-600 hover:text-gray-900">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">A</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-gray-200">
          <div className="flex-1 pt-6">
            <div className="px-3">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`
                      group flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1
                      ${item.current
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon
                      className={`
                        mr-3 h-5 w-5 flex-shrink-0
                        ${item.current ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
                      `}
                    />
                    {item.name}
                  </a>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
