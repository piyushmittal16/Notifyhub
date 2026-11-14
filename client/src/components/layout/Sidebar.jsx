import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  FolderKanban, 
  FileCode2, 
  History, 
  ShieldCheck 
} from 'lucide-react';

export const Sidebar = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();

  const navItems = [
    { name: 'Analytics', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'Templates', path: '/templates', icon: FileCode2 },
    { name: 'Email Logs', path: '/logs', icon: History },
  ];

  if (isAdmin) {
    navItems.push({ name: 'Admin Panel', path: '/admin', icon: ShieldCheck });
  }

  // Active item ka index pata karo (pill slide karne ke liye)
  const activeIndex = navItems.findIndex((item) => {
    if (item.path === '/dashboard' && (location.pathname === '/' || location.pathname === '/dashboard')) {
      return true;
    }
    return location.pathname.startsWith(item.path) && item.path !== '/dashboard';
  });

  return (
    <aside className="w-14 sm:w-56 shrink-0 border-r border-line bg-surface min-h-[calc(100vh-3.5rem)] p-2 sm:p-3">
      <nav className="nav relative flex flex-col gap-1">
        {/* 3. Sliding Active Pill */}
        {activeIndex !== -1 && (
          <div
            className="pill absolute left-0 right-0 h-10 rounded-lg bg-brand pointer-events-none"
            style={{ transform: `translateY(${activeIndex * 44}px)` }}
          />
        )}

        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = index === activeIndex;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`relative z-10 h-10 flex items-center gap-3 px-3 rounded-lg font-medium text-sm transition-colors ${
                isActive ? 'text-white' : 'text-sub hover:text-ink'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0 transition-transform duration-200" />
              <span className="hidden sm:inline truncate">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};
