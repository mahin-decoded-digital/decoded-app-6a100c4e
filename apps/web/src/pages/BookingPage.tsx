import { useState, useMemo } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useClubStore } from '@/stores/clubStore';
import { useBookingStore } from '@/stores/bookingStore';
import { useAuthStore } from '@/stores/authStore';
import { useMemberStore } from '@/stores/memberStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  ArrowRight,
  Package,
} from 'lucide-react';

const HERO_URL = 'https://images.pexels.com/photos/37144640/pexels-photo-37144640.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

function formatDate(d: Date) {
  return d.toLocaleDateString('en-NZ', { weekday: 'long', day: 'numeric', month: 'long' });
}

function formatTime(hour: number, minutes = 0) {
  const ampm = hour >= 12 ? 'pm' : 'am';
  const h = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  const m = minutes > 0 ? `:${String(minutes).padStart(2, '0')}` : '';
  return `${h}${m}${ampm}`;
}

const SLOT_STEP = 30; // minutes
const HOURS = Array.from({ length: 32 }, (_, i) => {
  const totalMins = 8 * 60 + i * SLOT_STEP; // starts 8am
  return { hour: Math.floor(totalMins / 60), minute: totalMins % 60 };
}); // 8am to 11:30pm (32 half-hour slots)

export default function BookingPage() {
  const { slug } = useParams<{ slug: string }>();

  const clubs = useClubStore((s) => s.clubs);
  const facilities = useClubStore((s) => s.facilities);
  const addons = useClubStore((s) => s.addons);
  const getClubSettings = useClubStore((s) => s.getClubSettings);
  const allBookings = useBookingStore((s) => s.bookings);
  const createBooking = useBookingStore((s) => s.createBooking);
  const hasConflict = useBookingStore((s) => s.hasConflict);
  const currentUser = useAuthStore((s) => s.currentUser);
  const isMember = useMemberStore((s) => s.isMember);

  const club = useMemo(() => clubs.find((c) => c.slug === slug), [clubs, slug]);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedFacility, setSelectedFacility] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ hour: number; minute: number } | null>(null);
  const [duration, setDuration] = useState(1);
  const [addBowlingMachine, setAddBowlingMachine] = useState(false);
  const [step, setStep] = useState<'select' | 'details' | 'confirm' | 'done'>('select');
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');

  if (!slug) return <Navigate to="/" replace />;
  if (!club) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--nr-ink)] mb-2">Club not found</h1>
          <p className="text-[var(--nr-muted)] mb-4">This booking page doesn't exist or the club may be inactive.</p>
          <Link to="/" className="text-[var(--nr-green)] hover:underline text-sm">Visit NetReserve →</Link>
        </div>
      </div>
    );
  }

  const clubFacilities = facilities.filter((f) => f.clubId === club.id && f.active);
  const clubAddons = addons.filter((a) => a.clubId === club.id && a.active);
  const bowlingMachine = clubAddons.find((a) => a.addonType === 'bowling_machine');
  const settings = getClubSettings(club.id);

  const isUserMember = currentUser ? isMember(club.id, currentUser.id) : false;
  const netRateCents = isUserMember ? settings.memberNetRateCents : settings.nonMemberNetRateCents;
  const bmRateCents = bowlingMachine
    ? (isUserMember ? bowlingMachine.priceMemberCents : bowlingMachine.priceNonmemberCents)
    : 0;

  const totalCents = netRateCents * duration + (addBowlingMachine && bowlingMachine ? bmRateCents * duration : 0);

  const prevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    if (d >= new Date(new Date().setHours(0, 0, 0, 0))) setSelectedDate(d);
  };

  const nextDay = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + settings.maxAdvanceDays);
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    if (d <= maxDate) setSelectedDate(d);
  };

  const getSlotConflict = (facilityId: string, slot: { hour: number; minute: number }) => {
    const start = new Date(selectedDate);
    start.setHours(slot.hour, slot.minute, 0, 0);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + duration * 60);
    return hasConflict(facilityId, start, end);
  };

  const handleBookingConfirm = () => {
    if (!selectedFacility || !selectedSlot || !club) return;
    if (!customerName.trim() || !customerEmail.trim()) {
      toast.error('Name and email are required.');
      return;
    }

    const startAt = new Date(selectedDate);
    startAt.setHours(selectedSlot.hour, selectedSlot.minute, 0, 0);
    const endAt = new Date(startAt);
    endAt.setHours(endAt.getHours() + duration);

    const facility = clubFacilities.find((f) => f.id === selectedFacility);

    const result = createBooking({
      clubId: club.id,
      facilityId: selectedFacility,
      userId: currentUser?.id || `guest_${Date.now()}`,
      startAt,
      endAt,
      status: 'confirmed',
      totalCents,
      memberPricingApplied: isUserMember,
      paymentIntentId: `pi_sim_${Date.now()}`,
      type: 'customer',
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim(),
      facilityName: facility?.name || '',
      addonIds: addBowlingMachine && bowlingMachine ? [bowlingMachine.id] : [],
    });

    if (!result.ok) {
      toast.error(result.error || 'Could not complete booking. Please try again.');
      return;
    }

    setStep('done');
  };

  const brandColor = club.brandingColor || 'var(--nr-green)';

  return (
    <div className="min-h-screen bg-[var(--nr-neutral)]">
      {/* Club header */}
      <div className="relative h-40 sm:h-56 overflow-hidden">
        <img
          src={club.heroPhotoUrl || HERO_URL}
          alt={club.name}
          crossOrigin="anonymous"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--nr-ink)]/70 via-[var(--nr-ink)]/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-[var(--nr-radius)] flex items-center justify-center text-background font-bold text-lg"
              style={{ backgroundColor: brandColor }}
            >
              {club.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-background font-bold text-lg leading-tight">{club.name}</h1>
              <p className="text-background/70 text-xs">Online booking powered by NetReserve</p>
            </div>
          </div>
          {isUserMember && (
            <span className="text-xs font-medium px-2 py-1 rounded-full text-background border border-background/30">
              ✓ Member
            </span>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {step === 'done' ? (
          <div className="bg-background border border-[var(--nr-border)] rounded-[var(--nr-radius-xl)] p-10 text-center shadow-[var(--nr-shadow-md)]">
            <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center" style={{ backgroundColor: `${brandColor}18` }}>
              <CheckCircle size={32} style={{ color: brandColor }} />
            </div>
            <h2 className="text-2xl font-bold text-[var(--nr-ink)] mb-2">Booking confirmed!</h2>
            <p className="text-[var(--nr-muted)] mb-5">
              A confirmation has been sent to {customerEmail}. You'll receive an SMS reminder 2 hours before your session.
            </p>
            <div className="p-4 bg-[var(--nr-neutral)] rounded-[var(--nr-radius-lg)] text-sm text-left mb-6 space-y-1">
              <p><span className="text-[var(--nr-muted)]">Date:</span> <strong className="text-[var(--nr-ink)]">{formatDate(selectedDate)}</strong></p>
              <p><span className="text-[var(--nr-muted)]">Time:</span> <strong className="text-[var(--nr-ink)]">{selectedSlot && formatTime(selectedSlot.hour, selectedSlot.minute)} · {duration}h</strong></p>
              <p><span className="text-[var(--nr-muted)]">Net:</span> <strong className="text-[var(--nr-ink)]">{clubFacilities.find(f => f.id === selectedFacility)?.name}</strong></p>
              <p><span className="text-[var(--nr-muted)]">Total paid:</span> <strong style={{ color: brandColor }}>${(totalCents / 100).toFixed(2)} NZD</strong></p>
              {isUserMember && <p className="text-xs" style={{ color: brandColor }}>✓ Member rate applied</p>}
            </div>
            <Button
              onClick={() => { setStep('select'); setSelectedSlot(null); setSelectedFacility(null); }}
              style={{ backgroundColor: brandColor }}
              className="text-background hover:opacity-90"
            >
              Make another booking
            </Button>
          </div>
        ) : step === 'confirm' ? (
          <div className="bg-background border border-[var(--nr-border)] rounded-[var(--nr-radius-xl)] p-6 shadow-[var(--nr-shadow-md)]">
            <button onClick={() => setStep('details')} className="flex items-center gap-1 text-sm text-[var(--nr-muted)] mb-5 hover:text-[var(--nr-ink)] transition-colors">
              <ChevronLeft size={14} /> Back
            </button>
            <h2 className="text-lg font-bold text-[var(--nr-ink)] mb-4">Confirm & pay</h2>

            <div className="p-4 bg-[var(--nr-neutral)] rounded-[var(--nr-radius-lg)] space-y-2 text-sm mb-5">
              <div className="flex justify-between"><span className="text-[var(--nr-muted)]">Date</span><span className="font-medium text-[var(--nr-ink)]">{formatDate(selectedDate)}</span></div>
              <div className="flex justify-between"><span className="text-[var(--nr-muted)]">Time</span><span className="font-medium text-[var(--nr-ink)]">{selectedSlot && formatTime(selectedSlot.hour, selectedSlot.minute)} · {duration}h</span></div>
              <div className="flex justify-between"><span className="text-[var(--nr-muted)]">Net</span><span className="font-medium text-[var(--nr-ink)]">{clubFacilities.find(f => f.id === selectedFacility)?.name}</span></div>
              {addBowlingMachine && bowlingMachine && (
                <div className="flex justify-between"><span className="text-[var(--nr-muted)]">{bowlingMachine.label}</span><span className="font-medium text-[var(--nr-ink)]">${(bmRateCents * duration / 100).toFixed(2)}</span></div>
              )}
              <div className="flex justify-between pt-2 border-t border-[var(--nr-border)]">
                <span className="font-semibold text-[var(--nr-ink)]">Total (GST incl.)</span>
                <span className="font-bold text-lg" style={{ color: brandColor }}>${(totalCents / 100).toFixed(2)} NZD</span>
              </div>
              {isUserMember && <p className="text-xs" style={{ color: brandColor }}>✓ Member rate applied</p>}
            </div>

            <Button
              onClick={handleBookingConfirm}
              className="w-full h-12 text-background font-semibold text-base hover:opacity-90"
              style={{ backgroundColor: brandColor }}
            >
              Pay ${(totalCents / 100).toFixed(2)} NZD
              <ArrowRight size={16} className="ml-2" />
            </Button>
            <p className="text-xs text-center text-[var(--nr-muted)] mt-2">Secure payment via Stripe. Card, Apple Pay, Google Pay accepted.</p>
          </div>
        ) : step === 'details' ? (
          <div className="bg-background border border-[var(--nr-border)] rounded-[var(--nr-radius-xl)] p-6 shadow-[var(--nr-shadow-md)]">
            <button onClick={() => setStep('select')} className="flex items-center gap-1 text-sm text-[var(--nr-muted)] mb-5 hover:text-[var(--nr-ink)] transition-colors">
              <ChevronLeft size={14} /> Back
            </button>
            <h2 className="text-lg font-bold text-[var(--nr-ink)] mb-4">Your details</h2>

            <div className="space-y-4 mb-5">
              <div>
                <Label className="text-sm font-medium text-[var(--nr-ink)]">Your name *</Label>
                <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="mt-1.5 h-10" placeholder="Priya Sharma" />
              </div>
              <div>
                <Label className="text-sm font-medium text-[var(--nr-ink)]">Email *</Label>
                <Input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="mt-1.5 h-10" placeholder="priya@example.com" />
              </div>
              <div>
                <Label className="text-sm font-medium text-[var(--nr-ink)]">Mobile (for SMS reminder)</Label>
                <Input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="mt-1.5 h-10" placeholder="+64 21 123 4567" />
              </div>
            </div>

            {bowlingMachine && (
              <div className="p-4 bg-[var(--nr-neutral)] rounded-[var(--nr-radius-lg)] border border-[var(--nr-border)] mb-5">
                <Switch
                  checked={addBowlingMachine}
                  onChange={setAddBowlingMachine}
                  label={`Add ${bowlingMachine.label}`}
                  description={`+$${(bmRateCents / 100).toFixed(2)}/hr · ${isUserMember ? 'Member rate' : 'Non-member rate'}`}
                />
              </div>
            )}

            <div className="flex justify-between items-center mb-4 text-sm">
              <span className="text-[var(--nr-muted)]">Total</span>
              <span className="text-lg font-bold" style={{ color: brandColor }}>${(totalCents / 100).toFixed(2)} NZD</span>
            </div>

            <Button
              onClick={() => {
                if (!customerName.trim() || !customerEmail.trim()) { toast.error('Name and email are required.'); return; }
                setStep('confirm');
              }}
              className="w-full h-11 text-background font-semibold hover:opacity-90"
              style={{ backgroundColor: brandColor }}
            >
              Review & pay
              <ArrowRight size={15} className="ml-2" />
            </Button>
          </div>
        ) : (
          /* Step: select */
          <div className="space-y-5">
            {/* Date picker */}
            <div className="bg-background border border-[var(--nr-border)] rounded-[var(--nr-radius-xl)] p-5 shadow-[var(--nr-shadow-sm)]">
              <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" size="icon" onClick={prevDay}><ChevronLeft size={16} /></Button>
                <div className="text-center">
                  <p className="font-semibold text-[var(--nr-ink)] text-sm">{formatDate(selectedDate)}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={nextDay}><ChevronRight size={16} /></Button>
              </div>

              {/* Net selector */}
              {clubFacilities.length > 1 && (
                <div className="flex gap-2 mb-4 flex-wrap">
                  <button
                    onClick={() => setSelectedFacility(null)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
                      !selectedFacility
                        ? 'text-background border-transparent'
                        : 'text-[var(--nr-muted)] border-[var(--nr-border)] hover:border-[var(--nr-muted)]'
                    )}
                    style={!selectedFacility ? { backgroundColor: brandColor, borderColor: brandColor } : {}}
                  >
                    All nets
                  </button>
                  {clubFacilities.map((fac) => (
                    <button
                      key={fac.id}
                      onClick={() => setSelectedFacility(fac.id)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
                        selectedFacility === fac.id
                          ? 'text-background border-transparent'
                          : 'text-[var(--nr-muted)] border-[var(--nr-border)] hover:border-[var(--nr-muted)]'
                      )}
                      style={selectedFacility === fac.id ? { backgroundColor: brandColor, borderColor: brandColor } : {}}
                    >
                      {fac.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Duration */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-[var(--nr-muted)] uppercase tracking-widest mb-2">Duration</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((h) => (
                    <button
                      key={h}
                      onClick={() => setDuration(h)}
                      className={cn(
                        'flex-1 py-2 text-sm font-medium rounded-[var(--nr-radius)] border transition-colors',
                        duration === h ? 'text-background border-transparent' : 'text-[var(--nr-muted)] border-[var(--nr-border)] hover:border-[var(--nr-muted)]'
                      )}
                      style={duration === h ? { backgroundColor: brandColor } : {}}
                    >
                      {h}h
                    </button>
                  ))}
                </div>
              </div>

              {/* Time slots */}
              {clubFacilities.length === 0 ? (
                <p className="text-sm text-center text-[var(--nr-muted)] py-6">No nets available for booking.</p>
              ) : (
                <div>
                  <p className="text-xs font-semibold text-[var(--nr-muted)] uppercase tracking-widest mb-2">
                    Available times {selectedFacility ? `— ${clubFacilities.find(f => f.id === selectedFacility)?.name}` : '— any net'}
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {HOURS.map((slot) => {
                      const facilityToCheck = selectedFacility || clubFacilities[0]?.id;
                      if (!facilityToCheck) return null;
                      const conflict = getSlotConflict(facilityToCheck, slot);
                      const isSelected = selectedSlot?.hour === slot.hour && selectedSlot?.minute === slot.minute;
                      return (
                        <button
                          key={`${slot.hour}:${slot.minute}`}
                          disabled={conflict}
                          onClick={() => {
                            setSelectedSlot(slot);
                            if (!selectedFacility) setSelectedFacility(facilityToCheck);
                          }}
                          className={cn(
                            'py-2 text-sm font-medium rounded-[var(--nr-radius)] border transition-colors',
                            conflict ? 'bg-[var(--nr-neutral)] text-[var(--nr-border)] cursor-not-allowed border-[var(--nr-border)]' : '',
                            isSelected ? 'text-background border-transparent' : !conflict ? 'text-[var(--nr-muted)] border-[var(--nr-border)] hover:border-[var(--nr-muted)]' : ''
                          )}
                          style={isSelected ? { backgroundColor: brandColor } : {}}
                        >
                          {formatTime(slot.hour, slot.minute)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Price summary + CTA */}
            {selectedSlot && (
              <div className="bg-background border border-[var(--nr-border)] rounded-[var(--nr-radius-xl)] p-5 shadow-[var(--nr-shadow-sm)]">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-[var(--nr-ink)]">
                      {formatTime(selectedSlot.hour, selectedSlot.minute)} · {duration}h
                    </p>
                    <p className="text-sm text-[var(--nr-muted)]">
                      {clubFacilities.find(f => f.id === selectedFacility)?.name}
                    </p>
                    {isUserMember && <p className="text-xs" style={{ color: brandColor }}>✓ Member rate</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold" style={{ color: brandColor }}>${(netRateCents * duration / 100).toFixed(2)}</p>
                    <p className="text-xs text-[var(--nr-muted)]">GST incl.</p>
                  </div>
                </div>
                <Button
                  onClick={() => setStep('details')}
                  className="w-full h-11 text-background font-semibold hover:opacity-90"
                  style={{ backgroundColor: brandColor }}
                >
                  Continue to checkout
                  <ArrowRight size={15} className="ml-2" />
                </Button>
              </div>
            )}

            {/* Pricing info */}
            <div className="text-center">
              <p className="text-xs text-[var(--nr-muted)]">
                {isUserMember ? (
                  <>Member rate: <strong>${(settings.memberNetRateCents / 100).toFixed(2)}/hr</strong></>
                ) : (
                  <>Non-member: <strong>${(settings.nonMemberNetRateCents / 100).toFixed(2)}/hr</strong> · Members save ${((settings.nonMemberNetRateCents - settings.memberNetRateCents) / 100).toFixed(2)}/hr</>
                )}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-6 text-xs text-[var(--nr-muted)]">
        Booking powered by{' '}
        <Link to="/" className="font-medium" style={{ color: brandColor }}>NetReserve</Link>
        {' '}· No double-bookings guaranteed
      </div>
    </div>
  );
}
