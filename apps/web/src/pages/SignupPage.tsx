import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { ArrowRight, CheckCircle } from 'lucide-react';

export default function SignupPage() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);
  const currentUser = useAuthStore((s) => s.currentUser);

  const [form, setForm] = useState({ name: '', email: '', phone: '', clubName: '' });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [loading, setLoading] = useState(false);

  if (currentUser) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.name.trim()) e.name = 'Your name is required.';
    if (!form.email.trim() || !form.email.includes('@')) e.email = 'A valid email address is required.';
    if (!form.phone.trim()) e.phone = 'A mobile number is required for SMS reminders.';
    if (!form.clubName.trim()) e.clubName = 'Your club name is required.';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const firstError = Object.values(errs)[0];
      if (firstError) toast.error(firstError);
      return;
    }
    setErrors({});
    setLoading(true);

    await new Promise((r) => setTimeout(r, 800));

    const result = register(form.email.trim(), form.name.trim(), form.phone.trim(), 'club_manager');
    setLoading(false);

    if (!result.ok) {
      toast.error(result.error || 'Registration failed.');
      return;
    }

    toast.success('Account created! Setting up your club…');
    navigate('/onboarding');
  };

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((err) => ({ ...err, [field]: undefined }));
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left brand panel */}
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
            Your club, online in under 10 minutes.
          </h2>
          <p className="text-[var(--nr-green-light)] text-base leading-relaxed mb-8">
            Create your account, complete the setup wizard, and your booking page goes live instantly.
          </p>

          <ul className="space-y-3">
            {[
              '14-day free trial — no credit card',
              'Branded booking page at yourclub.netreserve.co.nz',
              'Stripe Connect for direct payouts to your bank',
              'Zero double-bookings, database-enforced',
              'SMS reminders sent automatically',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm">
                <CheckCircle size={15} className="text-[var(--nr-green)] shrink-0 mt-0.5" />
                <span className="text-background">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10">
          <p className="text-[var(--nr-green-light)] text-xs">
            Already trusted by cricket clubs across New Zealand.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-8 h-8 rounded-[8px] bg-[var(--nr-green)] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="1.5"/>
                <path d="M5 8 L11 8 M8 5 L8 11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-bold text-[var(--nr-ink)] text-lg tracking-tight">NetReserve</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[var(--nr-ink)] mb-2">Create your account</h1>
            <p className="text-[var(--nr-muted)] text-sm">Start your 14-day free trial. No credit card required.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-[var(--nr-ink)] font-medium text-sm">Your full name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={update('name')}
                placeholder="Sam Mitchell"
                className={`mt-1.5 h-11 ${errors.name ? 'border-destructive' : ''}`}
                autoComplete="name"
              />
              {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="email" className="text-[var(--nr-ink)] font-medium text-sm">Email address</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={update('email')}
                placeholder="sam@aucklandcricket.co.nz"
                className={`mt-1.5 h-11 ${errors.email ? 'border-destructive' : ''}`}
                autoComplete="email"
              />
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="phone" className="text-[var(--nr-ink)] font-medium text-sm">Mobile number</Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={update('phone')}
                placeholder="+64 21 123 4567"
                className={`mt-1.5 h-11 ${errors.phone ? 'border-destructive' : ''}`}
                autoComplete="tel"
              />
              {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
              <p className="mt-1 text-xs text-[var(--nr-muted)]">Used for SMS notifications about your account.</p>
            </div>

            <div>
              <Label htmlFor="clubName" className="text-[var(--nr-ink)] font-medium text-sm">Club name</Label>
              <Input
                id="clubName"
                value={form.clubName}
                onChange={update('clubName')}
                placeholder="Auckland Indoor Cricket"
                className={`mt-1.5 h-11 ${errors.clubName ? 'border-destructive' : ''}`}
              />
              {errors.clubName && <p className="mt-1 text-xs text-destructive">{errors.clubName}</p>}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[var(--nr-green)] hover:bg-[var(--nr-green-dark)] text-background font-semibold mt-2"
            >
              {loading ? 'Creating account…' : 'Create account & continue'}
              {!loading && <ArrowRight size={15} className="ml-2" />}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--nr-muted)]">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[var(--nr-green)] hover:underline">
              Sign in
            </Link>
          </p>

          <p className="mt-4 text-center text-xs text-[var(--nr-muted)]">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
