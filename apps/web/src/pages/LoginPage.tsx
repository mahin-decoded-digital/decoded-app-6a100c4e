import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { ArrowRight, Mail } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const currentUser = useAuthStore((s) => s.currentUser);

  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  if (currentUser) {
    navigate(from, { replace: true });
    return null;
  }

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address.');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    const result = login(email.trim());
    setLoading(false);

    if (!result.ok) {
      toast.error(result.error || 'Sign-in failed.');
      return;
    }

    toast.success('Signed in successfully!');
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel - brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-[var(--nr-ink)] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--nr-green)]/10" />
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-12">
            <div className="w-9 h-9 rounded-[8px] bg-[var(--nr-green)] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="1.5"/>
                <path d="M5 8 L11 8 M8 5 L8 11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-bold text-background text-xl tracking-tight">NetReserve</span>
          </div>

          <h2 className="text-3xl font-bold text-background mb-4 leading-tight">
            Your club dashboard awaits.
          </h2>
          <p className="text-[var(--nr-green-light)] text-base leading-relaxed">
            Sign in to manage bookings, view your calendar, and keep your club running smoothly.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {[
            { stat: 'Zero double-bookings', desc: 'Database-enforced guarantee' },
            { stat: '90-second bookings', desc: 'For your customers' },
            { stat: 'Direct payouts', desc: "Money straight to your bank" },
          ].map((item) => (
            <div key={item.stat} className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--nr-green)] mt-2 shrink-0" />
              <div>
                <p className="text-background font-semibold text-sm">{item.stat}</p>
                <p className="text-[var(--nr-green-light)] text-xs">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10 justify-center">
            <div className="w-9 h-9 rounded-[8px] bg-[var(--nr-green)] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="1.5"/>
                <path d="M5 8 L11 8 M8 5 L8 11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-bold text-[var(--nr-ink)] text-xl tracking-tight">NetReserve</span>
          </div>

          {!sent ? (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-[var(--nr-ink)] mb-2">Welcome back</h1>
                <p className="text-[var(--nr-muted)] text-sm">
                  Enter your email and we'll send you a sign-in link. No password needed.
                </p>
              </div>

              <form onSubmit={handleSendLink} className="space-y-5">
                <div>
                  <Label htmlFor="email" className="text-[var(--nr-ink)] font-medium text-sm">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@yourclub.co.nz"
                    className="mt-1.5 h-11"
                    autoComplete="email"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-[var(--nr-green)] hover:bg-[var(--nr-green-dark)] text-background font-semibold"
                >
                  {loading ? 'Sending…' : 'Send sign-in link'}
                  {!loading && <ArrowRight size={15} className="ml-2" />}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-[var(--nr-muted)]">
                Don't have an account?{' '}
                <Link to="/signup" className="font-semibold text-[var(--nr-green)] hover:underline">
                  Sign up your club
                </Link>
              </p>
            </>
          ) : (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[var(--nr-green-faint)] flex items-center justify-center mx-auto mb-6">
                <Mail size={24} className="text-[var(--nr-green)]" />
              </div>
              <h2 className="text-xl font-bold text-[var(--nr-ink)] mb-2">Check your inbox</h2>
              <p className="text-sm text-[var(--nr-muted)] mb-6">
                We've sent a sign-in link to <strong>{email}</strong>. Click the link to continue.
              </p>
              <Button variant="ghost" size="sm" onClick={() => setSent(false)}>
                Use a different email
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
