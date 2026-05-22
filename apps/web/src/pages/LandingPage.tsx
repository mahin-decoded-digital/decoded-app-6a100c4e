import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MarketingNav } from '@/components/MarketingNav';
import {
  Calendar,
  CreditCard,
  Shield,
  Smartphone,
  Bell,
  BarChart2,
  CheckCircle,
  ArrowRight,
  Star,
  Users,
  Zap,
} from 'lucide-react';

const HERO_URL = 'https://images.pexels.com/photos/37144640/pexels-photo-37144640.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

const FEATURES = [
  {
    icon: Calendar,
    title: 'Live availability grid',
    description: 'Customers see real-time net availability and book in under 90 seconds. No calls, no WhatsApp, no waiting.',
  },
  {
    icon: Shield,
    title: 'Zero double-bookings, guaranteed',
    description: 'Database-enforced exclusion constraints make overlapping bookings technically impossible — not just unlikely.',
  },
  {
    icon: CreditCard,
    title: 'Money straight to your account',
    description: 'Stripe Connect routes booking payments directly to your NZ bank account. We never touch your revenue.',
  },
  {
    icon: Users,
    title: 'Member & non-member pricing',
    description: 'Set separate rates for members and casual players. Pricing applies automatically when they log in.',
  },
  {
    icon: Bell,
    title: 'Automated SMS reminders',
    description: 'Customers get an SMS 2 hours before their session. Fewer no-shows, happier managers.',
  },
  {
    icon: BarChart2,
    title: 'Revenue & utilisation reports',
    description: 'Weekly revenue totals, utilisation rates, and top time slots — everything you need to optimise your facility.',
  },
  {
    icon: Smartphone,
    title: 'Mobile-first for everyone',
    description: 'Whether you\'re a manager on the floor or a player booking from the car park — it works perfectly on mobile.',
  },
  {
    icon: Zap,
    title: 'On air in under 10 minutes',
    description: 'Our self-serve wizard walks you through everything. Club name, nets, pricing, Stripe — done in one sitting.',
  },
];

const STATS = [
  { value: '70%+', label: 'Bookings shift online within 90 days' },
  { value: '90s', label: 'Average time to complete a booking' },
  { value: '8–12h', label: 'Manager time saved every week' },
  { value: '0', label: 'Double-bookings since launch' },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Sign up your club',
    description: 'Create an account, complete the 10-step wizard: club details, facilities, pricing, and Stripe Connect.',
  },
  {
    step: '02',
    title: 'Go live instantly',
    description: 'Your branded booking page at yourclub.netreserve.co.nz is live the moment you click launch.',
  },
  {
    step: '03',
    title: 'Share with your players',
    description: 'Send the link to your regulars. They book online, pay by card, and get instant confirmation.',
  },
  {
    step: '04',
    title: 'Manage from your dashboard',
    description: 'Walk-ins, blocks, refunds, reports — everything from one place on your phone or laptop.',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-background min-h-screen">
      <MarketingNav />

      {/* Hero */}
      <section className="pt-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-64px)] py-16">
            <div>
              <div className="inline-flex items-center gap-2 bg-[var(--nr-green-faint)] text-[var(--nr-green-dark)] text-sm font-medium px-3 py-1.5 rounded-full mb-6 border border-[var(--nr-green-light)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--nr-green)] animate-pulse" />
                Built for New Zealand cricket clubs
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--nr-ink)] leading-tight mb-6 tracking-tight">
                Stop taking<br />bookings on<br />
                <span className="text-[var(--nr-green)]">WhatsApp.</span>
              </h1>

              <p className="text-lg text-[var(--nr-muted)] mb-8 leading-relaxed max-w-lg">
                NetReserve is the booking platform built for cricket clubs. Your customers book and pay online 24/7. You get automatic payouts, zero double-bookings, and a dashboard you can run from your phone.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Button
                  size="lg"
                  onClick={() => navigate('/onboarding')}
                  className="bg-[var(--nr-green)] hover:bg-[var(--nr-green-dark)] text-background font-semibold px-8"
                >
                  Start your free trial
                  <ArrowRight size={16} className="ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/pricing')}
                >
                  View pricing
                </Button>
              </div>

              <div className="flex items-center gap-2 text-sm text-[var(--nr-muted)]">
                <CheckCircle size={14} className="text-[var(--nr-green)]" />
                <span>14-day free trial</span>
                <span className="mx-2">·</span>
                <CheckCircle size={14} className="text-[var(--nr-green)]" />
                <span>No credit card required</span>
                <span className="mx-2">·</span>
                <CheckCircle size={14} className="text-[var(--nr-green)]" />
                <span>Cancel anytime</span>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-[var(--nr-radius-xl)] overflow-hidden shadow-[var(--nr-shadow-lg)] border border-[var(--nr-border)]">
                <img
                  src={HERO_URL}
                  alt="Indoor cricket net facility"
                  crossOrigin="anonymous"
                  className="w-full h-[480px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--nr-ink)]/60 via-transparent to-transparent" />

                {/* Floating stat cards */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-background/95 backdrop-blur-sm rounded-[var(--nr-radius-lg)] p-4 shadow-[var(--nr-shadow-md)]">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-[var(--nr-green-faint)] flex items-center justify-center">
                        <CheckCircle size={16} className="text-[var(--nr-green)]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--nr-ink)]">Booking confirmed</p>
                        <p className="text-xs text-[var(--nr-muted)]">Net 2 · Tuesday 7:00 PM · 1 hour</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--nr-muted)]">Member rate applied</span>
                      <span className="font-semibold text-[var(--nr-green)]">$20.00 NZD</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-[var(--nr-border)] bg-[var(--nr-neutral)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.value} className="text-center">
                <p className="text-3xl font-bold text-[var(--nr-green)] mb-1">{stat.value}</p>
                <p className="text-sm text-[var(--nr-muted)]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--nr-ink)] mb-4 tracking-tight">
              Everything a cricket club needs
            </h2>
            <p className="text-lg text-[var(--nr-muted)] max-w-2xl mx-auto">
              Purpose-built for indoor cricket facilities — not adapted from a yoga studio booking tool.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="stat-card group hover:shadow-[var(--nr-shadow-md)] transition-shadow">
                <div className="w-10 h-10 rounded-[var(--nr-radius)] bg-[var(--nr-green-faint)] flex items-center justify-center mb-4">
                  <feature.icon size={20} className="text-[var(--nr-green)]" />
                </div>
                <h3 className="font-semibold text-[var(--nr-ink)] mb-2 text-sm">{feature.title}</h3>
                <p className="text-sm text-[var(--nr-muted)] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-[var(--nr-green-faint)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--nr-ink)] mb-4 tracking-tight">
              Up and running in 10 minutes
            </h2>
            <p className="text-lg text-[var(--nr-muted)] max-w-2xl mx-auto">
              Our guided wizard handles the setup. No developer needed.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="relative">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-[calc(100%-16px)] w-8 border-t-2 border-dashed border-[var(--nr-green-light)] z-10" />
                )}
                <div className="text-4xl font-black text-[var(--nr-green-light)] mb-3">{step.step}</div>
                <h3 className="font-semibold text-[var(--nr-ink)] mb-2">{step.title}</h3>
                <p className="text-sm text-[var(--nr-muted)] leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--nr-ink)] mb-4 tracking-tight">
            Flat monthly pricing. No booking fees.
          </h2>
          <p className="text-lg text-[var(--nr-muted)] mb-8 max-w-2xl mx-auto">
            We charge a predictable subscription. You keep 100% of your booking revenue (less Stripe's standard processing fee).
          </p>

          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            {[
              { name: 'Starter', price: '$49', note: 'Up to 2 nets', color: 'border-[var(--nr-border)]' },
              { name: 'Growth', price: '$99', note: 'Up to 6 nets — most popular', color: 'border-[var(--nr-green)]', highlight: true },
              { name: 'Pro', price: '$199', note: 'Unlimited nets + custom domain', color: 'border-[var(--nr-border)]' },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`stat-card border-2 ${plan.color} ${plan.highlight ? 'bg-[var(--nr-green-faint)]' : ''}`}
              >
                {plan.highlight && (
                  <div className="inline-flex items-center gap-1 badge-green mb-3 text-xs">
                    <Star size={10} />
                    Most popular
                  </div>
                )}
                <p className="font-semibold text-[var(--nr-ink)] mb-1">{plan.name}</p>
                <p className="text-2xl font-bold text-[var(--nr-ink)] mb-1">
                  {plan.price}<span className="text-sm font-normal text-[var(--nr-muted)]">/mo NZD</span>
                </p>
                <p className="text-sm text-[var(--nr-muted)]">{plan.note}</p>
              </div>
            ))}
          </div>

          <Link to="/pricing">
            <Button variant="outline" className="mr-3">
              Compare all features
            </Button>
          </Link>
          <Button
            onClick={() => navigate('/onboarding')}
            className="bg-[var(--nr-green)] hover:bg-[var(--nr-green-dark)] text-background"
          >
            Start free trial
            <ArrowRight size={14} className="ml-2" />
          </Button>
        </div>
      </section>

      {/* Testimonial / trust */}
      <section className="py-16 bg-[var(--nr-ink)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-2xl font-semibold text-background mb-6 leading-relaxed">
            "We used to get 15 WhatsApp messages before 9am. Now we check the dashboard once and it's all there."
          </p>
          <p className="text-[var(--nr-green-light)] font-medium">— Sam, Club Manager · Auckland Indoor Cricket</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--nr-ink)] mb-4 tracking-tight">
            Ready to modernise your club?
          </h2>
          <p className="text-lg text-[var(--nr-muted)] mb-8">
            Join cricket clubs across New Zealand who've moved their bookings online.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/onboarding')}
            className="bg-[var(--nr-green)] hover:bg-[var(--nr-green-dark)] text-background font-semibold px-10"
          >
            Get started — it's free for 14 days
            <ArrowRight size={16} className="ml-2" />
          </Button>
          <p className="mt-4 text-sm text-[var(--nr-muted)]">No credit card required. Cancel anytime.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--nr-border)] py-12 bg-[var(--nr-neutral)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[var(--nr-green)] flex items-center justify-center">
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="1.5"/>
                  <path d="M5 8 L11 8 M8 5 L8 11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="font-bold text-[var(--nr-ink)] text-sm">NetReserve</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-[var(--nr-muted)]">
              <Link to="/pricing" className="hover:text-[var(--nr-ink)] transition-colors">Pricing</Link>
              <a href="#features" className="hover:text-[var(--nr-ink)] transition-colors">Features</a>
              <Link to="/login" className="hover:text-[var(--nr-ink)] transition-colors">Sign in</Link>
            </div>
            <p className="text-xs text-[var(--nr-muted)]">
              © 2026 NetReserve · New Zealand · GST inclusive pricing
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
