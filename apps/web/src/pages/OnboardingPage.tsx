import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useClubStore } from '@/stores/clubStore';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  MapPin,
  Palette,
  Package,
  DollarSign,
  Clock,
  CreditCard,
  Star,
  Eye,
  Rocket,
} from 'lucide-react';
import type { SubscriptionPlan } from '@/types';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const STEP_INFO = [
  { title: 'Club basics', icon: MapPin, description: 'Your club name and location' },
  { title: 'Branding', icon: Palette, description: 'Logo, colours, and hero photo' },
  { title: 'Facilities', icon: Package, description: 'Your cricket nets' },
  { title: 'Operating hours', icon: Clock, description: 'When your club is open' },
  { title: 'Pricing', icon: DollarSign, description: 'Member and non-member rates' },
  { title: 'Add-ons', icon: Package, description: 'Bowling machine and extras' },
  { title: 'Policies', icon: CheckCircle, description: 'Cancellation and booking rules' },
  { title: 'Stripe Connect', icon: CreditCard, description: 'Connect your bank account' },
  { title: 'Choose a plan', icon: Star, description: 'Select your subscription' },
  { title: 'Review & launch', icon: Rocket, description: 'Preview and go live' },
];

const PLANS: { id: SubscriptionPlan; name: string; price: number; nets: string; bookings: string; highlight: boolean }[] = [
  { id: 'starter', name: 'Starter', price: 49, nets: 'Up to 2 nets', bookings: '200 bookings/mo', highlight: false },
  { id: 'growth', name: 'Growth', price: 99, nets: 'Up to 6 nets', bookings: '800 bookings/mo', highlight: true },
  { id: 'pro', name: 'Pro', price: 199, nets: 'Unlimited nets', bookings: 'Unlimited bookings', highlight: false },
];

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export default function OnboardingPage() {
  const navigate = useNavigate();

  // Individual selectors — one per value to avoid infinite re-render loops
  const state = useOnboardingStore((s) => s.state);
  const nextStep = useOnboardingStore((s) => s.nextStep);
  const prevStep = useOnboardingStore((s) => s.prevStep);
  const updateState = useOnboardingStore((s) => s.updateState);
  const setFacilityName = useOnboardingStore((s) => s.setFacilityName);
  const setFacilityCount = useOnboardingStore((s) => s.setFacilityCount);
  const updateHours = useOnboardingStore((s) => s.updateHours);
  const markStripeConnected = useOnboardingStore((s) => s.markStripeConnected);
  const selectPlan = useOnboardingStore((s) => s.selectPlan);
  const complete = useOnboardingStore((s) => s.complete);

  const createClub = useClubStore((s) => s.createClub);
  const addFacility = useClubStore((s) => s.addFacility);
  const addAddon = useClubStore((s) => s.addAddon);
  const setCurrentClub = useClubStore((s) => s.setCurrentClub);
  const currentUser = useAuthStore((s) => s.currentUser);

  const slug = useMemo(() => toSlug(state.clubName || 'my-club'), [state.clubName]);

  const handleNext = () => {
    if (state.step === 1 && !state.clubName.trim()) {
      toast.error('Club name is required.');
      return;
    }
    if (state.step === 1 && !state.address.trim()) {
      toast.error('Club address is required.');
      return;
    }
    if (state.step === 5) {
      if (state.memberRateCents <= 0 || state.nonMemberRateCents <= 0) {
        toast.error('Please set valid rates for both member and non-member pricing.');
        return;
      }
    }
    nextStep();
  };

  const handleLaunch = () => {
    if (!currentUser) {
      toast.error('Please sign in to launch your club.');
      navigate('/login');
      return;
    }

    const club = createClub({
      slug,
      name: state.clubName,
      status: 'trialing',
      planId: state.selectedPlan,
      stripeAccountId: state.stripeConnected ? `acct_sim_${Date.now()}` : '',
      stripeSubscriptionId: '',
      brandingColor: state.brandingColor,
      logoUrl: state.logoUrl,
      heroPhotoUrl: state.heroPhotoUrl,
      address: state.address,
      gstNumber: state.gstNumber,
      timezone: 'Pacific/Auckland',
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    });

    state.facilityNames.slice(0, state.facilityCount).forEach((name, i) => {
      addFacility({
        clubId: club.id,
        facilityType: 'cricket_net',
        name,
        displayOrder: i,
        active: true,
      });
    });

    if (state.bowlingMachineEnabled) {
      addAddon({
        clubId: club.id,
        addonType: 'bowling_machine',
        label: 'Bowling Machine',
        inventoryCount: state.bowlingMachineCount,
        priceMemberCents: state.bowlingMachineMemberCents,
        priceNonmemberCents: state.bowlingMachineNonMemberCents,
        active: true,
      });
    }

    setCurrentClub(club.id);
    complete();
    toast.success(`${state.clubName} is live! Welcome to NetReserve.`);
    navigate('/dashboard');
  };

  const step = state.step;

  return (
    <div className="min-h-screen bg-[var(--nr-neutral)] flex flex-col">
      {/* Header */}
      <header className="bg-background border-b border-[var(--nr-border)] px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[6px] bg-[var(--nr-green)] flex items-center justify-center">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="1.5"/>
              <path d="M5 8 L11 8 M8 5 L8 11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-bold text-[var(--nr-ink)] text-sm">NetReserve</span>
        </div>

        <div className="flex-1 px-6">
          <div className="onboarding-progress max-w-sm">
            <div className="onboarding-progress-fill" style={{ width: `${(step / 10) * 100}%` }} />
          </div>
        </div>

        <span className="text-xs text-[var(--nr-muted)] shrink-0">Step {step} of 10</span>
      </header>

      {/* Step list sidebar */}
      <div className="flex-1 flex max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8">
        <aside className="hidden lg:flex flex-col w-56 shrink-0">
          {STEP_INFO.map((info, i) => {
            const stepNum = i + 1;
            const done = stepNum < step;
            const active = stepNum === step;
            return (
              <div
                key={stepNum}
                className={`flex items-start gap-3 py-3 px-3 rounded-[var(--nr-radius)] transition-colors ${
                  active ? 'bg-[var(--nr-green-faint)]' : ''
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold mt-0.5 ${
                  done
                    ? 'bg-[var(--nr-green)] text-background'
                    : active
                    ? 'bg-[var(--nr-green)] text-background'
                    : 'bg-[var(--nr-border)] text-[var(--nr-muted)]'
                }`}>
                  {done ? <CheckCircle size={12} /> : stepNum}
                </div>
                <div>
                  <p className={`text-sm font-medium ${active ? 'text-[var(--nr-green-dark)]' : 'text-[var(--nr-muted)]'}`}>
                    {info.title}
                  </p>
                  {active && <p className="text-xs text-[var(--nr-muted)] mt-0.5">{info.description}</p>}
                </div>
              </div>
            );
          })}
        </aside>

        {/* Main step content */}
        <div className="flex-1 bg-background rounded-[var(--nr-radius-xl)] border border-[var(--nr-border)] shadow-[var(--nr-shadow-sm)] p-8">
          <div className="mb-8">
            <p className="text-xs font-semibold text-[var(--nr-green)] uppercase tracking-widest mb-1">
              Step {step} of 10
            </p>
            <h1 className="text-2xl font-bold text-[var(--nr-ink)]">{STEP_INFO[step - 1]?.title}</h1>
            <p className="text-[var(--nr-muted)] text-sm mt-1">{STEP_INFO[step - 1]?.description}</p>
          </div>

          {/* Step 1: Club basics */}
          {step === 1 && (
            <div className="space-y-5 max-w-lg">
              <div>
                <Label className="text-sm font-medium text-[var(--nr-ink)]">Club name *</Label>
                <Input
                  value={state.clubName}
                  onChange={(e) => updateState({ clubName: e.target.value })}
                  placeholder="Auckland Indoor Cricket"
                  className="mt-1.5 h-11"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-[var(--nr-ink)]">Club address *</Label>
                <Input
                  value={state.address}
                  onChange={(e) => updateState({ address: e.target.value })}
                  placeholder="123 Victoria Street, Auckland, New Zealand"
                  className="mt-1.5 h-11"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-[var(--nr-ink)]">GST number (optional)</Label>
                <Input
                  value={state.gstNumber}
                  onChange={(e) => updateState({ gstNumber: e.target.value })}
                  placeholder="12-345-678"
                  className="mt-1.5 h-11"
                />
                <p className="text-xs text-[var(--nr-muted)] mt-1">Required for GST-registered businesses. Shown on invoices.</p>
              </div>
              <div className="p-3 bg-[var(--nr-neutral)] rounded-[var(--nr-radius)] border border-[var(--nr-border)]">
                <p className="text-xs text-[var(--nr-muted)]">
                  <span className="font-medium text-[var(--nr-ink)]">Timezone:</span> Pacific/Auckland (auto-set for New Zealand)
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Branding */}
          {step === 2 && (
            <div className="space-y-6 max-w-lg">
              <div>
                <Label className="text-sm font-medium text-[var(--nr-ink)]">Primary brand colour</Label>
                <div className="flex items-center gap-3 mt-1.5">
                  <input
                    type="color"
                    value={state.brandingColor}
                    onChange={(e) => updateState({ brandingColor: e.target.value })}
                    className="w-12 h-10 rounded cursor-pointer border border-[var(--nr-border)]"
                  />
                  <Input
                    value={state.brandingColor}
                    onChange={(e) => updateState({ brandingColor: e.target.value })}
                    placeholder="#16a34a"
                    className="h-10 font-mono"
                  />
                </div>
                <p className="text-xs text-[var(--nr-muted)] mt-1">Used on your booking page and email templates.</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-[var(--nr-ink)]">Logo URL (optional)</Label>
                <Input
                  value={state.logoUrl}
                  onChange={(e) => updateState({ logoUrl: e.target.value })}
                  placeholder="https://yourclub.co.nz/logo.png"
                  className="mt-1.5 h-11"
                />
                <p className="text-xs text-[var(--nr-muted)] mt-1">Leave blank to use your club initials instead.</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-[var(--nr-ink)]">Hero photo URL (optional)</Label>
                <Input
                  value={state.heroPhotoUrl}
                  onChange={(e) => updateState({ heroPhotoUrl: e.target.value })}
                  placeholder="https://yourclub.co.nz/hero.jpg"
                  className="mt-1.5 h-11"
                />
                <p className="text-xs text-[var(--nr-muted)] mt-1">Shown at the top of your public booking page. We use a default if blank.</p>
              </div>

              {/* Preview */}
              <div className="p-4 rounded-[var(--nr-radius-lg)] border border-[var(--nr-border)] bg-[var(--nr-neutral)]">
                <p className="text-xs font-semibold text-[var(--nr-muted)] uppercase tracking-widest mb-3">Preview</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-[var(--nr-radius)] flex items-center justify-center text-background font-bold text-sm"
                    style={{ backgroundColor: state.brandingColor }}
                  >
                    {state.clubName ? state.clubName.charAt(0) : 'C'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[var(--nr-ink)]">{state.clubName || 'Your Club Name'}</p>
                    <p className="text-xs" style={{ color: state.brandingColor }}>{slug}.netreserve.co.nz</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Facilities */}
          {step === 3 && (
            <div className="space-y-6 max-w-lg">
              <div>
                <Label className="text-sm font-medium text-[var(--nr-ink)]">Number of cricket nets</Label>
                <div className="flex items-center gap-3 mt-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setFacilityCount(state.facilityCount - 1)}
                    disabled={state.facilityCount <= 1}
                  >
                    −
                  </Button>
                  <span className="text-xl font-bold text-[var(--nr-ink)] w-8 text-center">{state.facilityCount}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setFacilityCount(state.facilityCount + 1)}
                    disabled={state.facilityCount >= 20}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-[var(--nr-ink)]">Net names</Label>
                {state.facilityNames.slice(0, state.facilityCount).map((name, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-sm text-[var(--nr-muted)] w-5 shrink-0">{i + 1}.</span>
                    <Input
                      value={name}
                      onChange={(e) => setFacilityName(i, e.target.value)}
                      placeholder={`Net ${i + 1}`}
                      className="h-10"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Operating hours */}
          {step === 4 && (
            <div className="space-y-3 max-w-lg">
              <div className="flex gap-2 mb-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    [1,2,3,4,5].forEach(d => updateHours(d, { openTime: '06:00', closeTime: '22:00', closed: false }));
                    [0,6].forEach(d => updateHours(d, { openTime: '07:00', closeTime: '20:00', closed: false }));
                  }}
                >
                  Weekdays 6am–10pm
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    [0,1,2,3,4,5,6].forEach(d => updateHours(d, { openTime: '08:00', closeTime: '18:00', closed: false }));
                  }}
                >
                  All days 8am–6pm
                </Button>
              </div>
              {state.operatingHours.map((h) => (
                <div key={h.dayOfWeek} className="flex items-center gap-3 p-3 rounded-[var(--nr-radius)] bg-[var(--nr-neutral)] border border-[var(--nr-border)]">
                  <span className="w-20 text-sm font-medium text-[var(--nr-ink)] shrink-0">{DAYS[h.dayOfWeek]}</span>
                  <Switch
                    checked={!h.closed}
                    onChange={(val) => updateHours(h.dayOfWeek, { closed: !val })}
                    className="shrink-0"
                  />
                  {!h.closed ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        type="time"
                        value={h.openTime}
                        onChange={(e) => updateHours(h.dayOfWeek, { openTime: e.target.value })}
                        className="h-8 text-sm w-28"
                      />
                      <span className="text-[var(--nr-muted)] text-sm">to</span>
                      <Input
                        type="time"
                        value={h.closeTime}
                        onChange={(e) => updateHours(h.dayOfWeek, { closeTime: e.target.value })}
                        className="h-8 text-sm w-28"
                      />
                    </div>
                  ) : (
                    <span className="text-sm text-[var(--nr-muted)]">Closed</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Step 5: Pricing */}
          {step === 5 && (
            <div className="space-y-5 max-w-lg">
              <div className="p-3 bg-[var(--nr-green-faint)] rounded-[var(--nr-radius)] border border-[var(--nr-green-light)] text-sm text-[var(--nr-green-dark)]">
                All prices are per hour, per net, GST-inclusive (NZD).
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-[var(--nr-ink)]">Member rate ($/hr)</Label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nr-muted)] text-sm">$</span>
                    <Input
                      type="number"
                      min={0}
                      value={state.memberRateCents / 100}
                      onChange={(e) => updateState({ memberRateCents: Math.round(parseFloat(e.target.value || '0') * 100) })}
                      className="pl-7 h-11"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-[var(--nr-ink)]">Non-member rate ($/hr)</Label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nr-muted)] text-sm">$</span>
                    <Input
                      type="number"
                      min={0}
                      value={state.nonMemberRateCents / 100}
                      onChange={(e) => updateState({ nonMemberRateCents: Math.round(parseFloat(e.target.value || '0') * 100) })}
                      className="pl-7 h-11"
                    />
                  </div>
                </div>
              </div>
              <p className="text-xs text-[var(--nr-muted)]">
                These are your base rates. You can update them any time from your dashboard pricing settings.
              </p>
            </div>
          )}

          {/* Step 6: Add-ons */}
          {step === 6 && (
            <div className="space-y-6 max-w-lg">
              <Switch
                checked={state.bowlingMachineEnabled}
                onChange={(val) => updateState({ bowlingMachineEnabled: val })}
                label="Enable bowling machine add-on"
                description="Customers can add a bowling machine to their booking at checkout."
              />

              {state.bowlingMachineEnabled && (
                <div className="space-y-4 pl-4 border-l-2 border-[var(--nr-green-light)]">
                  <div>
                    <Label className="text-sm font-medium text-[var(--nr-ink)]">Number of machines</Label>
                    <div className="flex items-center gap-3 mt-1.5">
                      <Button type="button" variant="outline" size="icon" onClick={() => updateState({ bowlingMachineCount: Math.max(1, state.bowlingMachineCount - 1) })}>−</Button>
                      <span className="text-lg font-bold text-[var(--nr-ink)] w-6 text-center">{state.bowlingMachineCount}</span>
                      <Button type="button" variant="outline" size="icon" onClick={() => updateState({ bowlingMachineCount: state.bowlingMachineCount + 1 })}>+</Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-[var(--nr-ink)]">Member rate ($/hr)</Label>
                      <div className="relative mt-1.5">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nr-muted)] text-sm">$</span>
                        <Input
                          type="number"
                          min={0}
                          value={state.bowlingMachineMemberCents / 100}
                          onChange={(e) => updateState({ bowlingMachineMemberCents: Math.round(parseFloat(e.target.value || '0') * 100) })}
                          className="pl-7 h-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-[var(--nr-ink)]">Non-member rate ($/hr)</Label>
                      <div className="relative mt-1.5">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nr-muted)] text-sm">$</span>
                        <Input
                          type="number"
                          min={0}
                          value={state.bowlingMachineNonMemberCents / 100}
                          onChange={(e) => updateState({ bowlingMachineNonMemberCents: Math.round(parseFloat(e.target.value || '0') * 100) })}
                          className="pl-7 h-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 7: Policies */}
          {step === 7 && (
            <div className="space-y-5 max-w-lg">
              <div>
                <Label className="text-sm font-medium text-[var(--nr-ink)]">Cancellation refund policy</Label>
                <p className="text-xs text-[var(--nr-muted)] mb-3">How much to refund based on notice given before the slot.</p>
                <div className="space-y-3">
                  {[
                    { label: '24+ hours notice', field: 'cancellation24hPct' as const },
                    { label: '12–24 hours notice', field: 'cancellation12hPct' as const },
                    { label: 'Under 12 hours notice', field: 'cancellation0hPct' as const },
                  ].map(({ label, field }) => (
                    <div key={field} className="flex items-center gap-3">
                      <span className="text-sm text-[var(--nr-ink)] w-40 shrink-0">{label}</span>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={state[field]}
                          onChange={(e) => updateState({ [field]: parseInt(e.target.value || '0') })}
                          className="h-9 w-20"
                        />
                        <span className="text-sm text-[var(--nr-muted)]">% refund</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-[var(--nr-ink)]">Booking buffer (hours)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={48}
                    value={state.bookingBufferHours}
                    onChange={(e) => updateState({ bookingBufferHours: parseInt(e.target.value || '1') })}
                    className="mt-1.5 h-10"
                  />
                  <p className="text-xs text-[var(--nr-muted)] mt-1">Minimum notice to book (customers only). Managers bypass this.</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-[var(--nr-ink)]">Max advance days</Label>
                  <Input
                    type="number"
                    min={1}
                    max={90}
                    value={state.maxAdvanceDays}
                    onChange={(e) => updateState({ maxAdvanceDays: parseInt(e.target.value || '14') })}
                    className="mt-1.5 h-10"
                  />
                  <p className="text-xs text-[var(--nr-muted)] mt-1">How far ahead customers can book.</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 8: Stripe */}
          {step === 8 && (
            <div className="space-y-6 max-w-lg">
              <p className="text-sm text-[var(--nr-muted)] leading-relaxed">
                NetReserve uses <strong className="text-[var(--nr-ink)]">Stripe Connect</strong> to route booking payments directly to your bank account. We never hold your money.
              </p>

              <div className="space-y-3">
                {[
                  'Your customers pay by card, Apple Pay, or Google Pay',
                  'Stripe processes the payment and deposits to your NZ bank account',
                  "NetReserve doesn't touch your booking revenue",
                  "Standard Stripe fee: ~1.5% + 30c per transaction",
                ].map((point) => (
                  <div key={point} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle size={14} className="text-[var(--nr-green)] shrink-0 mt-0.5" />
                    <span className="text-[var(--nr-muted)]">{point}</span>
                  </div>
                ))}
              </div>

              {!state.stripeConnected ? (
                <Button
                  onClick={() => {
                    markStripeConnected();
                    toast.success('Stripe account connected! (Demo mode)');
                  }}
                  className="bg-[var(--nr-ink)] hover:bg-[var(--nr-ink-soft)] text-background w-full h-11"
                >
                  <CreditCard size={16} className="mr-2" />
                  Connect Stripe account
                </Button>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-[var(--nr-green-faint)] rounded-[var(--nr-radius-lg)] border border-[var(--nr-green-light)]">
                  <CheckCircle size={20} className="text-[var(--nr-green)] shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-[var(--nr-green-dark)]">Stripe connected</p>
                    <p className="text-xs text-[var(--nr-muted)]">Payments will route to your bank account.</p>
                  </div>
                </div>
              )}

              <p className="text-xs text-[var(--nr-muted)]">
                You can skip this step and connect Stripe later from your dashboard, but you'll need it before accepting customer payments.
              </p>
            </div>
          )}

          {/* Step 9: Plan */}
          {step === 9 && (
            <div className="space-y-4 max-w-lg">
              {PLANS.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => selectPlan(plan.id)}
                  className={`w-full text-left p-4 rounded-[var(--nr-radius-lg)] border-2 transition-all ${
                    state.selectedPlan === plan.id
                      ? 'border-[var(--nr-green)] bg-[var(--nr-green-faint)]'
                      : 'border-[var(--nr-border)] hover:border-[var(--nr-green-light)]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-[var(--nr-ink)]">{plan.name}</p>
                        {plan.highlight && <span className="badge-green text-xs">Most popular</span>}
                      </div>
                      <p className="text-sm text-[var(--nr-muted)]">{plan.nets} · {plan.bookings}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-[var(--nr-ink)]">${plan.price}<span className="text-sm font-normal text-[var(--nr-muted)]">/mo</span></p>
                    </div>
                  </div>
                </button>
              ))}

              <div className="p-3 bg-[var(--nr-green-faint)] rounded-[var(--nr-radius)] border border-[var(--nr-green-light)] text-sm text-[var(--nr-green-dark)]">
                14-day free trial on all plans. No credit card required now.
              </div>
            </div>
          )}

          {/* Step 10: Review & Launch */}
          {step === 10 && (
            <div className="space-y-6 max-w-lg">
              <div className="p-5 bg-[var(--nr-neutral)] rounded-[var(--nr-radius-lg)] border border-[var(--nr-border)] space-y-3">
                {[
                  { label: 'Club', value: state.clubName },
                  { label: 'Address', value: state.address },
                  { label: 'Nets', value: `${state.facilityCount} cricket net${state.facilityCount !== 1 ? 's' : ''}` },
                  { label: 'Member rate', value: `$${(state.memberRateCents / 100).toFixed(2)}/hr` },
                  { label: 'Non-member rate', value: `$${(state.nonMemberRateCents / 100).toFixed(2)}/hr` },
                  { label: 'Plan', value: `${PLANS.find(p => p.id === state.selectedPlan)?.name} ($${PLANS.find(p => p.id === state.selectedPlan)?.price}/mo)` },
                  { label: 'Stripe', value: state.stripeConnected ? 'Connected' : 'Not connected (payments unavailable)' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-start justify-between gap-4">
                    <span className="text-sm text-[var(--nr-muted)] shrink-0">{label}</span>
                    <span className="text-sm font-medium text-[var(--nr-ink)] text-right">{value}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 p-4 bg-[var(--nr-green-faint)] rounded-[var(--nr-radius-lg)] border border-[var(--nr-green-light)]">
                <Eye size={18} className="text-[var(--nr-green)] shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-[var(--nr-green-dark)]">Your booking page URL</p>
                  <p className="text-sm text-[var(--nr-muted)] font-mono">{slug}.netreserve.co.nz</p>
                </div>
              </div>

              <Button
                onClick={handleLaunch}
                className="w-full h-12 bg-[var(--nr-green)] hover:bg-[var(--nr-green-dark)] text-background font-semibold text-base"
              >
                <Rocket size={18} className="mr-2" />
                Launch my club
              </Button>

              <p className="text-xs text-center text-[var(--nr-muted)]">
                You can change any setting from your dashboard after launching.
              </p>
            </div>
          )}

          {/* Nav buttons */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-[var(--nr-border)]">
            <Button
              type="button"
              variant="ghost"
              onClick={prevStep}
              disabled={step === 1}
            >
              <ArrowLeft size={16} className="mr-2" />
              Back
            </Button>

            {step < 10 && (
              <Button
                type="button"
                onClick={handleNext}
                className="bg-[var(--nr-green)] hover:bg-[var(--nr-green-dark)] text-background"
              >
                {step === 8 && !state.stripeConnected ? 'Skip for now' : 'Continue'}
                <ArrowRight size={16} className="ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
