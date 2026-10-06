import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Bell, ChevronDown } from 'lucide-react';
import Logo from '../components/ui/Logo';
import ThemeSwitcher from '../components/shared/ThemeSwitcher';
import LanguageSwitcher from '../components/shared/LanguageSwitcher';
import { NAV_BY_ROLE } from '../components/shared/DashboardNav';
import ChatWidget from '../components/shared/ChatWidget';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useApi } from '../hooks/useApi';
import { getNotifications } from '../api/notifications';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navItems = NAV_BY_ROLE[user?.role] || [];
  // Live unread notifications from MongoDB via API
  const { data: notificationsData } = useApi(
    () => (user ? getNotifications(user.role === 'admin' ? undefined : user.department) : Promise.resolve([])),
    [user?.department, user?.role]
  );
  const unread = (notificationsData || []).filter((n) => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-ink-100 dark:border-ink-800 bg-white/90 dark:bg-ink-900/90 backdrop-blur-sm sticky top-0 h-screen">
        <div className="h-16 flex items-center px-5 border-b border-ink-100 dark:border-ink-800">
          <Logo size="sm" />
        </div>
        <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300'
                    : 'text-ink-500 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800'
                }`
              }
            >
              <item.icon size={18} />
              {t(item.label)}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-ink-100 dark:border-ink-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut size={18} /> {t('logout')}
          </button>
        </div>
      </aside>

      {/* Sidebar - mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-900/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-white dark:bg-ink-900 flex flex-col animate-fade-up">
            <div className="h-16 flex items-center justify-between px-5 border-b border-ink-100 dark:border-ink-800">
              <Logo size="sm" />
              <button onClick={() => setSidebarOpen(false)} aria-label="Close menu"><X size={20} /></button>
            </div>
            <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                      isActive ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300' : 'text-ink-500 dark:text-ink-400'
                    }`
                  }
                >
                  <item.icon size={18} /> {t(item.label)}
                </NavLink>
              ))}
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-500">
                <LogOut size={18} /> {t('logout')}
              </button>
            </nav>
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 border-b border-ink-100 dark:border-ink-800 bg-white/90 dark:bg-ink-900/90 backdrop-blur-sm flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Menu size={20} />
            </button>
            <div className="lg:hidden"><Logo size="sm" withText={false} /></div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher compact />
            <ThemeSwitcher compact />
            <NavLink to={`/${user?.role}/notifications`} className="relative p-2 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800" aria-label="Notifications">
              <Bell size={18} />
              {unread > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-slot-500" />}
            </NavLink>
            <div className="relative">
              <button onClick={() => setProfileOpen((o) => !o)} className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-ink-100 dark:hover:bg-ink-800">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                  style={{ backgroundColor: user?.avatarColor || '#7F1D1D' }}
                >
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium leading-tight">{user?.name}</p>
                  <p className="text-xs text-ink-400 capitalize leading-tight">{user?.role}</p>
                </div>
                <ChevronDown size={14} className="text-ink-400 hidden sm:block" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 rounded-xl shadow-glow py-1.5 z-30">
                  <NavLink to={`/${user?.role}/settings`} onClick={() => setProfileOpen(false)} className="block px-3.5 py-2 text-sm hover:bg-ink-50 dark:hover:bg-ink-700">
                    {t('settings')}
                  </NavLink>
                  <button onClick={handleLogout} className="w-full text-left px-3.5 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                    {t('logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Campus Assistant — a floating chatbot for campus members to ask about free
          classrooms, their timetable, venue changes, and how the app works. */}
      {user && <ChatWidget />}
    </div>
  );
}
