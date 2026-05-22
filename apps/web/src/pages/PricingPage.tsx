import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MarketingNav } from '@/components/MarketingNav';
import { CheckCircle, X, ArrowRight } from 'lucide-react';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 49,
    description: 'Perfect for smaller clubs with 1–2 cricket nets.',
    highlight: false,
    features: [
      { text: 'Up to 2 cricket nets', included: true },
      { text: '200 bookings / month', included: true },
      { text: '1 admin user', included: true },
      { text: 'Subdomain booking page', included: true },
      { text: 'Per-club logo & colours', included: true },
      { text: 'Member vs non-member pricing', included: true },
      { text: 'Bowling machine add-on', included: true },
      { text: 'Basic reports', included: true },
      { text: '100 SMS / month', included: true },
      { text: 'Email support (48h SLA)', included: true },
      { text: 'CSV export', included: false },
      { text: 'Custom domain', included: false },
      { text: 'White-label (no branding)', included: false },
      { text: 'Up to 3 admin users', included: false },
    ],
    cta: 'Start free trial',
    sms: '100 SMS included',
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 99,
    description: 'For mid-size clubs ready to grow their online bookings.',
    highlight: true,
    features: [
      { text: 'Up to 6 cricket nets', included: true },
      { text: '800 bookings / month', included: true },
      { text: '1 admin user', included: true },
      { text: 'Subdomain booking page', included: true },
      { text: 'Per-club logo & colours', included: true },
      { text: 'Member vs non-member pricing', included: true },
      { text: 'Bowling machine add-on', included: true },
      { text: 'Basic reports', included: true },
      { text: '500 SMS / month', included: true },
      { text: 'Email support (24h SLA)', included: true },
      { text: 'CSV export', included: true },
      { text: 'Custom domain', included: false },
      { text: 'White-label (no branding)', included: false },
      { text: 'Up to 3 admin users', included: false },
    ],
    cta: 'Start free trial',
    sms: '500 SMS included',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 199,
    description: 'Unlimited scale for large facilities and busy clubs.',
    highlight: false,
    features: [
      { text: 'Unlimited cricket nets', included: true },
      { text: 'Unlimited bookings', included: true },
      { text: 'Up to 3 admin users', included: true },
      { text: 'Subdomain booking page', included: true },
      { text: 'Per-club logo & colours', included: true },
      { text: 'Member vs non-member pricing', included: true },
      { text: 'Bowling machine add-on', included: true },
      { text: 'Basic reports', included: true },
      { text: '2,000 SMS / month', included: true },
      { text: 'Priority email + phone (4h SLA)', included: true },
      { text: 'CSV export', included: true },
      { text: 'Custom domain', included: true },
      { text: 'White-label (no branding)', included: true },
      { text: 'Up to 3 admin users', included: true },
    ],
    cta: 'Start free trial',
    sms: '2,000 SMS included',
  },
];

const FAQS = [
  {
    q: "Do you take a cut of my booking revenue?",
    a: "No. We charge a flat monthly subscription. Your booking revenue flows directly from Stripe to your NZ bank account. Stripe's standard processing fee (~1.5% + 30c) is separate and goes to Stripe."
  },
  {
    q: "What happens when my trial ends?",
    a: "After 14 days, you'll be prompted to add a payment method. If you don't, your booking page is suspended (but your data is kept). You can reactivate any time within 30 days."
  },
  {
    q: "Can I change my plan?",
    a: "Yes, any time. Upgrades are prorated immediately. Downgrades take effect at the next billing cycle."
  },
  {
    q: "What's the SMS overage rate?",
    a: "If you exceed your plan's SMS allowance, additional SMS cost $0.15 NZD each. We'll warn you before you hit the limit."
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from your dashboard any time. You keep access until the end of your billing period. You can export your data on the way out."
  },
  {
    q: "Is pricing GST-inclusive?",
    a: "Yes. All pricing shown is GST-inclusive (15% NZ GST). Your invoices include a GST breakdown."
  },
];

export default function PricingPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-background min-h-screen">
      <MarketingNav />

      <div className="pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-[var(--nr-ink)] mb-4 tracking-tight">
              Simple, transparent pricing
            </h1>
            <p className="text-lg text-[var(--nr-muted)] max-w-2xl mx-auto mb-3">
              Flat monthly subscription. No booking fees. No hidden charges.
            </p>
            <p className="text-sm text-[var(--nr-muted)]">
              All prices in NZD, GST inclusive. 14-day free trial on all plans — no credit card required.
            </p>
          </div>

          {/* Plans */}
          <div className="grid lg:grid-cols-3 gap-6 mb-20">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-[var(--nr-radius-xl)] border-2 p-8 ${
                  plan.highlight
                    ? 'border-[var(--nr-green)] shadow-[var(--nr-shadow-lg)] bg-[var(--nr-green-faint)]'
                    : 'border-[var(--nr-border)] bg-background shadow-[var(--nr-shadow-sm)]'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="badge-green text-xs px-4 py-1 shadow-sm">Most popular</span>
                  </div>
                )}

                <div className="mb-6">
                  <h2 className="text-lg font-bold text-[var(--nr-ink)] mb-1">{plan.name}</h2>
                  <p className="text-sm text-[var(--nr-muted)] mb-4">{plan.description}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-black text-[var(--nr-ink)]">${plan.price}</span>
                    <span className="text-[var(--nr-muted)] mb-1">/mo NZD</span>
                  </div>
                  <p className="text-xs text-[var(--nr-muted)] mt-1">{plan.sms}</p>
                </div>

                <Button
                  onClick={() => navigate('/signup')}
                  className={`w-full mb-6 ${
                    plan.highlight
                      ? 'bg-[var(--nr-green)] hover:bg-[var(--nr-green-dark)] text-background'
                      : ''
                  }`}
                  variant={plan.highlight ? 'default' : 'outline'}
                >
                  {plan.cta}
                  <ArrowRight size={14} className="ml-2" />
                </Button>

                <div className="space-y-2.5">
                  {plan.features.map((feature) => (
                    <div key={feature.text} className="flex items-start gap-2.5">
                      {feature.included ? (
                        <CheckCircle size={15} className="text-[var(--nr-green)] shrink-0 mt-0.5" />
                      ) : (
                        <X size={15} className="text-[var(--nr-border)] shrink-0 mt-0.5" />
                      )}
                      <span className={`text-sm ${feature.included ? 'text-[var(--nr-ink)]' : 'text-[var(--nr-muted)]'}`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* What you keep / don't pay */}
          <div className="grid md:grid-cols-2 gap-8 mb-20 p-8 bg-[var(--nr-neutral)] rounded-[var(--nr-radius-xl)] border border-[var(--nr-border)]">
            <div>
              <h3 className="font-bold text-[var(--nr-ink)] mb-4">What we don't do</h3>
              <ul className="space-y-2.5">
                {[
                  "Take a cut of your booking revenue",
                  "Sell your customer data — ever",
                  "Lock you in — cancel any time, export your data",
                  "Charge per-booking fees on top of your subscription",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-[var(--nr-muted)]">
                    <CheckCircle size={14} className="text-[var(--nr-green)] shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-[var(--nr-ink)] mb-4">What you need to go live</h3>
              <ul className="space-y-2.5">
                {[
                  "A nominated NZ business bank account (for Stripe payouts)",
                  "10 minutes for the setup wizard",
                  "Your club logo and a couple of net photos",
                  "An email to your regulars on launch day",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-[var(--nr-muted)]">
                    <CheckCircle size={14} className="text-[var(--nr-green)] shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* FAQ */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-[var(--nr-ink)] mb-8 text-center">Frequently asked questions</h2>
            <div className="space-y-4">
              {FAQS.map((faq) => (
                <div key={faq.q} className="border border-[var(--nr-border)] rounded-[var(--nr-radius-lg)] p-6">
                  <h3 className="font-semibold text-[var(--nr-ink)] mb-2">{faq.q}</h3>
                  <p className="text-sm text-[var(--nr-muted)] leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16">
            <Button
              size="lg"
              onClick={() => navigate('/onboarding')}
              className="bg-[var(--nr-green)] hover:bg-[var(--nr-green-dark)] text-background font-semibold px-10"
            >
              Start your 14-day free trial
              <ArrowRight size={16} className="ml-2" />
            </Button>
            <p className="mt-3 text-sm text-[var(--nr-muted)]">No credit card required.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[var(--nr-border)] py-8 bg-[var(--nr-neutral)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[var(--nr-green)] flex items-center justify-center">
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="1.5"/>
                <path d="M5 8 L11 8 M8 5 L8 11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-bold text-[var(--nr-ink)] text-sm">NetReserve</span>
          </Link>
          <p className="text-xs text-[var(--nr-muted)]">© 2026 NetReserve · NZD pricing · GST inclusive</p>
        </div>
      </footer>
    </div>
  );
}
