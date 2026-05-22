import { useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useClubStore } from '@/stores/clubStore';
import { Avatar } from '@/components/ui/avatar';
import {
  Calendar,
  BookOpen,
  Users,
  BarChart2,
  Settings,
  CreditCard,
  Package,
  Palette,
  Clock,
  DollarSign,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  Home,
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Calendar', icon: Calendar, exact: true },
  { path: '/dashboard/bookings', label: 'Bookings', icon: BookOpen },
  { path: '/dashboard/customers', label: 'Customers', icon: Users },
  { path: '/dashboard/resources', label: 'Resources', icon: Package },
  { path: '/dashboard/reports', label: 'Reports', icon: BarChart2 },
  { path: '/dashboard/branding', label: 'Branding', icon: Palette },
  { path: '/dashboard/operations', label: 'Operations', icon: Clock },
  { path: '/dashboard/pricing', label: 'Pricing', icon: DollarSign },
  { path: '/dashboard/billing', label: 'Subscription', icon: CreditCard },
  { path: '/dashboard/settings', label: 'Settings', icon: Settings },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);
  const clubs = useClubStore((s) => s.clubs);
  const currentClubId = useClubStore((s) => s.currentClubId);

  const currentClub = useMemo(
    () => clubs.find((c) => c.id === currentClubId),
    [clubs, currentClubId]
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-[var(--nr-neutral)] overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-[var(--nr-ink)]/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col bg-background border-r border-[var(--nr-border)]',
          'transition-transform duration-200 ease-in-out',
          'w-[var(--nr-sidebar-width)]',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:relative lg:translate-x-0 lg:flex'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-[var(--nr-border)] shrink-0">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-[6px] bg-[var(--nr-green)] flex items-center justify-center">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="1.5"/>
                <path d="M5 8 L11 8 M8 5 L8 11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-bold text-[var(--nr-ink)] text-base tracking-tight">NetReserve</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded text-[var(--nr-muted)] hover:text-[var(--nr-ink)]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Club badge */}
        {currentClub && (
          <div className="px-3 py-2.5 border-b border-[var(--nr-border)] shrink-0">
            <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-[var(--nr-radius)] bg-[var(--nr-neutral)]">
              <div
                className="w-6 h-6 rounded flex items-center justify-center text-background text-xs font-bold shrink-0"
                style={{ backgroundColor: currentClub.brandingColor || 'var(--nr-green)' }}
              >
                {currentClub.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[var(--nr-ink)] truncate">{currentClub.name}</p>
                <p className="text-[10px] text-[var(--nr-muted)] capitalize">{currentClub.planId} plan</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'sidebar-item',
                isActive(item.path, item.exact) ? 'active' : ''
              )}
            >
              <item.icon size={16} />
              <span>{item.label}</span>
            </Link>
          ))}

          {currentUser?.role === 'platform_admin' && (
            <>
              <div className="my-2 border-t border-[var(--nr-border)]" />
              <Link
                to="/admin"
                className={cn('sidebar-item', isActive('/admin') ? 'active' : '')}
              >
                <ShieldCheck size={16} />
                <span>Admin</span>
              </Link>
            </>
          )}
        </nav>

        {/* User section */}
        <div className="border-t border-[var(--nr-border)] p-3 shrink-0">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2.5 w-full px-2 py-1.5 rounded-[var(--nr-radius)] hover:bg-[var(--nr-neutral)] transition-colors"
            >
              <Avatar name={currentUser?.name || 'U'} size="sm" />
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-[var(--nr-ink)] truncate">{currentUser?.name}</p>
                <p className="text-xs text-[var(--nr-muted)] truncate">{currentUser?.email}</p>
              </div>
              <ChevronDown size={14} className="text-[var(--nr-muted)] shrink-0" />
            </button>

            {userMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-background border border-[var(--nr-border)] rounded-[var(--nr-radius)] shadow-[var(--nr-shadow-md)] overflow-hidden z-50">
                <Link
                  to="/dashboard/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--nr-ink)] hover:bg-[var(--nr-neutral)] transition-colors"
                >
                  <Settings size={14} />
                  Settings
                </Link>
                <Link
                  to="/"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--nr-ink)] hover:bg-[var(--nr-neutral)] transition-colors"
                >
                  <Home size={14} />
                  View site
                </Link>
                <div className="border-t border-[var(--nr-border)]" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-[var(--nr-red-light)] transition-colors"
                >
                  <LogOut size={14} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 h-14 px-4 bg-background border-b border-[var(--nr-border)] shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-[var(--nr-radius)] text-[var(--nr-muted)] hover:text-[var(--nr-ink)] hover:bg-[var(--nr-neutral)] transition-colors"
          >
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[var(--nr-green)] flex items-center justify-center">
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="1.5"/>
                <path d="M5 8 L11 8 M8 5 L8 11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-bold text-[var(--nr-ink)] text-sm">NetReserve</span>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
