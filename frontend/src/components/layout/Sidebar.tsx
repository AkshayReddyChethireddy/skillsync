import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Brain, ListChecks, Zap, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore } from '../../store/authStore';

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/skills', icon: Brain, label: 'Skills' },
  { to: '/log', icon: ListChecks, label: 'Log Session' },
];

export function Sidebar() {
  const { user, logout } = useAuthStore();

  return (
    <aside className="w-64 flex flex-col bg-slate-900 border-r border-slate-800 h-full">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Zap className="text-indigo-400" size={22} />
          <span className="text-xl font-bold text-white">SkillSync</span>
        </div>
        <p className="text-xs text-slate-500 mt-1">Learning Momentum Platform</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white">
            {user?.username?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.full_name || user?.username}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 transition-colors w-full"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
