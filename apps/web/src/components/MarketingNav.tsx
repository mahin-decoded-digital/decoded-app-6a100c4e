import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function MarketingNav() {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-[var(--nr-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-[6px] bg-[var(--nr-green)] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="1.5"/>
                <path d="M5 8 L11 8 M8 5 L8 11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-bold text-[var(--nr-ink)] text-lg tracking-tight">NetReserve</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/pricing" className="text-sm text-[var(--nr-muted)] hover:text-[var(--nr-ink)] transition-colors font-medium">
              Pricing
            </Link>
            <Link to="/#features" className="text-sm text-[var(--nr-muted)] hover:text-[var(--nr-ink)] transition-colors font-medium">
              Features
            </Link>
            <Link to="/#how-it-works" className="text-sm text-[var(--nr-muted)] hover:text-[var(--nr-ink)] transition-colors font-medium">
              How it works
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
              Sign in
            </Button>
            <Button
              size="sm"
              onClick={() => navigate('/signup')}
              className="bg-[var(--nr-green)] hover:bg-[var(--nr-green-dark)] text-background"
            >
              Get started free
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
