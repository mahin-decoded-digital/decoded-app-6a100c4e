import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useClubStore } from '@/stores/clubStore';
import { useBookingStore } from '@/stores/bookingStore';
import { useAuthStore } from '@/stores/authStore';
import { useAuditStore } from '@/stores/auditStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  Clock,
  User,
} from 'lucide-react';

const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 6am to 9pm

function formatTime(hour: number) {
  const ampm = hour >= 12 ? 'pm' : 'am';
  const h = hour > 12 ? hour - 12 : hour;
  return `${h}:00${ampm}`;
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-NZ', { weekday: 'long', month: 'long', day: 'numeric' });
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function CalendarPage() {
  const navigate = useNavigate();
  const [viewDate, setViewDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [slotInfo, setSlotInfo] = useState<{ facilityId: string; hour: number; date: Date } | null>(null);
  const [newBooking, setNewBooking] = useState({ customerName: '', customerPhone: '', hours: '1', type: 'walk_in' as 'walk_in' | 'block' });

  const clubs = useClubStore((s) => s.clubs);
  const currentClubId = useClubStore((s) => s.currentClubId);
  const facilities = useClubStore((s) => s.facilities);
  const bookings = useBookingStore((s) => s.bookings);
  const createBooking = useBookingStore((s) => s.createBooking);
  const blockSlot = useBookingStore((s) => s.blockSlot);
  const hasConflict = useBookingStore((s) => s.hasConflict);
  const currentUser = useAuthStore((s) => s.currentUser);
  const addLog = useAuditStore((s) => s.addLog);

  const currentClub = useMemo(
    () => clubs.find((c) => c.id === currentClubId),
    [clubs, currentClubId]
  );

  const clubFacilities = useMemo(
    () => facilities.filter((f) => f.clubId === currentClubId && f.active),
    [facilities, currentClubId]
  );

  const weekDates = useMemo(() => {
    const start = new Date(viewDate);
    const day = start.getDay();
    start.setDate(start.getDate() - day);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [viewDate]);

  const dayBookings = useMemo(
    () => bookings.filter(
      (b) =>
        b.clubId === currentClubId &&
        (b.status === 'confirmed' || b.status === 'blocked' || b.status === 'pending') &&
        isSameDay(new Date(b.startAt), viewDate)
    ),
    [bookings, currentClubId, viewDate]
  );

  const getSlotBooking = (facilityId: string, hour: number, date: Date) => {
    return bookings.find((b) => {
      if (b.facilityId !== facilityId) return false;
      if (b.status === 'canceled' || b.status === 'expired') return false;
      const start = new Date(b.startAt);
      const end = new Date(b.endAt);
      const slotStart = new Date(date);
      slotStart.setHours(hour, 0, 0, 0);
      const slotEnd = new Date(date);
      slotEnd.setHours(hour + 1, 0, 0, 0);
      return start < slotEnd && end > slotStart;
    });
  };

  const handleSlotClick = (facilityId: string, hour: number, date: Date) => {
    const existing = getSlotBooking(facilityId, hour, date);
    if (existing) return;
    setSlotInfo({ facilityId, hour, date });
    setNewBooking({ customerName: '', customerPhone: '', hours: '1', type: 'walk_in' });
    setShowCreateDialog(true);
  };

  const handleCreateBooking = () => {
    if (!slotInfo || !currentClubId || !currentClub) return;

    const startAt = new Date(slotInfo.date);
    startAt.setHours(slotInfo.hour, 0, 0, 0);
    const endAt = new Date(startAt);
    endAt.setHours(startAt.getHours() + parseInt(newBooking.hours));

    const facility = clubFacilities.find((f) => f.id === slotInfo.facilityId);
    if (!facility) return;

    if (hasConflict(slotInfo.facilityId, startAt, endAt)) {
      toast.error('This slot conflicts with an existing booking.');
      return;
    }

    if (newBooking.type === 'block') {
      blockSlot({
        clubId: currentClubId,
        facilityId: slotInfo.facilityId,
        userId: currentUser?.id || '',
        startAt,
        endAt,
        status: 'blocked',
        totalCents: 0,
        memberPricingApplied: false,
        paymentIntentId: '',
        type: 'block',
        customerName: 'Blocked',
        customerEmail: '',
        customerPhone: '',
        facilityName: facility.name,
        addonIds: [],
      });
      toast.success('Slot blocked successfully.');
    } else {
      if (!newBooking.customerName.trim()) {
        toast.error('Customer name is required.');
        return;
      }
      const settings = useClubStore.getState().getClubSettings(currentClubId);
      const result = createBooking({
        clubId: currentClubId,
        facilityId: slotInfo.facilityId,
        userId: currentUser?.id || '',
        startAt,
        endAt,
        status: 'confirmed',
        totalCents: settings.nonMemberNetRateCents * parseInt(newBooking.hours),
        memberPricingApplied: false,
        paymentIntentId: '',
        type: 'walk_in',
        customerName: newBooking.customerName,
        customerEmail: '',
        customerPhone: newBooking.customerPhone,
        facilityName: facility.name,
        addonIds: [],
      });

      if (!result.ok) {
        toast.error(result.error || 'Failed to create booking.');
        return;
      }

      if (currentUser && currentClub) {
        addLog({
          actorUserId: currentUser.id,
          actorName: currentUser.name,
          clubId: currentClubId,
          clubName: currentClub.name,
          action: 'booking.created',
          targetType: 'booking',
          targetId: result.booking?.id || '',
          payloadJson: { customerName: newBooking.customerName, facilityName: facility.name },
        });
      }

      toast.success(`Walk-in booked for ${newBooking.customerName}.`);
    }

    setShowCreateDialog(false);
    setSlotInfo(null);
  };

  const prevDay = () => {
    const d = new Date(viewDate);
    d.setDate(d.getDate() - (viewMode === 'week' ? 7 : 1));
    setViewDate(d);
  };

  const nextDay = () => {
    const d = new Date(viewDate);
    d.setDate(d.getDate() + (viewMode === 'week' ? 7 : 1));
    setViewDate(d);
  };

  if (!currentClub) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full p-12 text-center">
          <div>
            <Calendar size={48} className="text-[var(--nr-border)] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[var(--nr-ink)] mb-2">No club set up yet</h2>
            <p className="text-[var(--nr-muted)] mb-6">Complete the onboarding wizard to launch your club and see your calendar.</p>
            <Button
              onClick={() => navigate('/onboarding')}
              className="bg-[var(--nr-green)] hover:bg-[var(--nr-green-dark)] text-background"
            >
              Set up your club
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Calendar header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--nr-border)] bg-background shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-[var(--nr-neutral)] rounded-[var(--nr-radius)] p-0.5">
              {(['day', 'week'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-[6px] capitalize transition-colors',
                    viewMode === mode
                      ? 'bg-background text-[var(--nr-ink)] shadow-[var(--nr-shadow-sm)]'
                      : 'text-[var(--nr-muted)] hover:text-[var(--nr-ink)]'
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={prevDay}>
                <ChevronLeft size={16} />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setViewDate(new Date())}>
                Today
              </Button>
              <Button variant="ghost" size="icon" onClick={nextDay}>
                <ChevronRight size={16} />
              </Button>
            </div>

            <h2 className="text-sm font-semibold text-[var(--nr-ink)] hidden sm:block">
              {viewMode === 'day'
                ? formatDate(viewDate)
                : `${weekDates[0].toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' })} – ${weekDates[6].toLocaleDateString('en-NZ', { month: 'short', day: 'numeric', year: 'numeric' })}`}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-4 text-xs text-[var(--nr-muted)]">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[var(--nr-green-faint)] border border-[var(--nr-green)]" />Booked</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[var(--nr-gold-light)] border border-[#fde68a]" />Walk-in</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[var(--nr-neutral)] border border-[var(--nr-border)]" />Blocked</span>
            </div>
            <Button
              size="sm"
              onClick={() => {
                const firstFac = clubFacilities[0];
                if (firstFac) {
                  setSlotInfo({ facilityId: firstFac.id, hour: new Date().getHours(), date: new Date() });
                  setShowCreateDialog(true);
                }
              }}
              className="bg-[var(--nr-green)] hover:bg-[var(--nr-green-dark)] text-background"
            >
              <Plus size={14} className="mr-1.5" />
              Add booking
            </Button>
          </div>
        </div>

        {/* Calendar grid */}
        <div className="flex-1 overflow-auto">
          {clubFacilities.length === 0 ? (
            <div className="flex items-center justify-center h-full p-12 text-center">
              <div>
                <Calendar size={40} className="text-[var(--nr-border)] mx-auto mb-3" />
                <p className="text-[var(--nr-muted)] text-sm">No facilities configured. Add nets from the Resources section.</p>
              </div>
            </div>
          ) : (
            <div className="min-w-[600px]">
              {/* Header row: time | facility names */}
              <div className="sticky top-0 z-10 bg-background border-b border-[var(--nr-border)] grid" style={{ gridTemplateColumns: `64px repeat(${clubFacilities.length}, 1fr)` }}>
                <div className="px-2 py-2.5 text-xs font-medium text-[var(--nr-muted)]" />
                {clubFacilities.map((fac) => (
                  <div key={fac.id} className="px-3 py-2.5 text-xs font-semibold text-[var(--nr-ink)] text-center border-l border-[var(--nr-border)] truncate">
                    {fac.name}
                  </div>
                ))}
              </div>

              {/* Hour rows */}
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="grid border-b border-[var(--nr-border)] min-h-[56px]"
                  style={{ gridTemplateColumns: `64px repeat(${clubFacilities.length}, 1fr)` }}
                >
                  <div className="px-2 py-2 text-xs text-[var(--nr-muted)] sticky left-0 bg-background shrink-0">
                    {formatTime(hour)}
                  </div>
                  {clubFacilities.map((fac) => {
                    const booking = getSlotBooking(fac.id, hour, viewDate);
                    const isStart = booking && new Date(booking.startAt).getHours() === hour;
                    return (
                      <div
                        key={fac.id}
                        className={cn(
                          'border-l border-[var(--nr-border)] cursor-pointer hover:bg-[var(--nr-green-faint)] transition-colors relative p-1',
                          booking?.type === 'block' ? 'bg-[var(--nr-neutral)] cursor-not-allowed hover:bg-[var(--nr-neutral)]' : '',
                          booking?.type === 'walk_in' ? 'bg-[var(--nr-gold-light)]' : '',
                          booking && booking.type !== 'block' && booking.type !== 'walk_in' ? 'bg-[var(--nr-green-faint)]' : ''
                        )}
                        onClick={() => !booking && handleSlotClick(fac.id, hour, viewDate)}
                      >
                        {booking && isStart && (
                          <div className={cn(
                            'rounded px-1.5 py-0.5 text-xs font-medium truncate',
                            booking.type === 'block' ? 'text-[var(--nr-muted)]' : 'text-[var(--nr-green-dark)]'
                          )}>
                            {booking.type === 'block' ? '— Blocked' : booking.customerName || 'Booked'}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Today's booking count */}
        <div className="border-t border-[var(--nr-border)] px-6 py-2.5 bg-background flex items-center gap-4 shrink-0">
          <Clock size={13} className="text-[var(--nr-muted)]" />
          <span className="text-xs text-[var(--nr-muted)]">
            {dayBookings.length} booking{dayBookings.length !== 1 ? 's' : ''} today
            {dayBookings.length > 0 && ` · $${(dayBookings.reduce((acc, b) => acc + b.totalCents, 0) / 100).toFixed(0)} NZD`}
          </span>
        </div>
      </div>

      {/* Create booking dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add booking</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3 p-3 bg-[var(--nr-neutral)] rounded-[var(--nr-radius)]">
              <Calendar size={14} className="text-[var(--nr-muted)]" />
              <div className="text-sm text-[var(--nr-muted)]">
                {slotInfo && (
                  <>
                    {clubFacilities.find(f => f.id === slotInfo.facilityId)?.name} · {formatDate(slotInfo.date)} · {formatTime(slotInfo.hour)}
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {(['walk_in', 'block'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setNewBooking((b) => ({ ...b, type }))}
                  className={cn(
                    'flex-1 py-2 text-sm font-medium rounded-[var(--nr-radius)] border transition-colors capitalize',
                    newBooking.type === type
                      ? 'border-[var(--nr-green)] bg-[var(--nr-green-faint)] text-[var(--nr-green-dark)]'
                      : 'border-[var(--nr-border)] text-[var(--nr-muted)] hover:border-[var(--nr-green-light)]'
                  )}
                >
                  {type === 'walk_in' ? 'Walk-in' : 'Block slot'}
                </button>
              ))}
            </div>

            {newBooking.type === 'walk_in' && (
              <>
                <div>
                  <Label className="text-sm font-medium text-[var(--nr-ink)]">Customer name *</Label>
                  <div className="relative mt-1.5">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nr-muted)]" />
                    <Input
                      value={newBooking.customerName}
                      onChange={(e) => setNewBooking((b) => ({ ...b, customerName: e.target.value }))}
                      placeholder="Raj Patel"
                      className="pl-9 h-10"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-[var(--nr-ink)]">Phone (optional)</Label>
                  <Input
                    value={newBooking.customerPhone}
                    onChange={(e) => setNewBooking((b) => ({ ...b, customerPhone: e.target.value }))}
                    placeholder="+64 21 123 4567"
                    className="mt-1.5 h-10"
                  />
                </div>
              </>
            )}

            <div>
              <Label className="text-sm font-medium text-[var(--nr-ink)]">Duration (hours)</Label>
              <div className="flex gap-2 mt-1.5">
                {['1', '2', '3', '4'].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setNewBooking((b) => ({ ...b, hours: h }))}
                    className={cn(
                      'flex-1 py-2 text-sm font-medium rounded-[var(--nr-radius)] border transition-colors',
                      newBooking.hours === h
                        ? 'border-[var(--nr-green)] bg-[var(--nr-green-faint)] text-[var(--nr-green-dark)]'
                        : 'border-[var(--nr-border)] text-[var(--nr-muted)] hover:border-[var(--nr-green-light)]'
                    )}
                  >
                    {h}h
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button
              onClick={handleCreateBooking}
              className="bg-[var(--nr-green)] hover:bg-[var(--nr-green-dark)] text-background"
            >
              {newBooking.type === 'block' ? 'Block slot' : 'Create booking'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
