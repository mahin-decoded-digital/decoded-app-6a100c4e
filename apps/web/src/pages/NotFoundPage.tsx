import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="flex items-center justify-center gap-2 mb-12">
          <div className="w-7 h-7 rounded-[6px] bg-[var(--nr-green)] flex items-center justify-center">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="1.5"/>
              <path d="M5 8 L11 8 M8 5 L8 11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-bold text-[var(--nr-ink)] text-sm">NetReserve</span>
        </div>

        <h1 className="text-8xl font-black text-[var(--nr-green-light)] mb-2 leading-none">404</h1>
        <h2 className="text-2xl font-bold text-[var(--nr-ink)] mb-3">Page not found</h2>
        <p className="text-[var(--nr-muted)] mb-8 leading-relaxed">
          The page you're looking for doesn't exist. If you're trying to access a booking page, check that you have the correct club link.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link to="/">
            <Button className="bg-[var(--nr-green)] hover:bg-[var(--nr-green-dark)] text-background">
              Go to homepage
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline">
              Manager sign-in
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
