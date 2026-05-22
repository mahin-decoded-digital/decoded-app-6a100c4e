import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useClubStore } from '@/stores/clubStore';
import { useBookingStore } from '@/stores/bookingStore';
import { useAuthStore } from '@/stores/authStore';
import { useAuditStore } from '@/stores/auditStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Search, BookOpen, X, RefreshCw, Calendar } from 'lucide-react';
import type { Booking } from '@/types';

function statusBadge(status: string) {
  const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    confirmed: { label: 'Confirmed', variant: 'default' },
    pending: { label: 'Pending', variant: 'secondary' },
    canceled: { label: 'Canceled', variant: 'destructive' },
    blocked: { label: 'Blocked', variant: 'outline' },
    expired: { label: 'Expired', variant: 'outline' },
  };
  const info = map[status] || { label: status, variant: 'outline' as const };
  return <Badge variant={info.variant}>{info.label}</Badge>;
}

function formatDateTime(date: Date) {
  const d = new Date(date);
  return d.toLocaleDateString('en-NZ', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function BookingsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'canceled' | 'blocked'>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const clubs = useClubStore((s) => s.clubs);
  const currentClubId = useClubStore((s) => s.currentClubId);
  const allBookings = useBookingStore((s) => s.bookings);
  const cancelBooking = useBookingStore((s) => s.cancelBooking);
  const currentUser = useAuthStore((s) => s.currentUser);
  const addLog = useAuditStore((s) => s.addLog);

  const currentClub = useMemo(() => clubs.find((c) => c.id === currentClubId), [clubs, currentClubId]);

  const bookings = useMemo(() => {
    return allBookings
      .filter((b) => b.clubId === currentClubId)
      .filter((b) => filter === 'all' || b.status === filter)
      .filter((b) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          b.customerName?.toLowerCase().includes(q) ||
          b.facilityName?.toLowerCase().includes(q) ||
          b.customerEmail?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allBookings, currentClubId, filter, search]);

  const handleCancel = () => {
    if (!selectedBooking || !currentUser || !currentClub) return;
    const result = cancelBooking(selectedBooking.id, 'manager');
    if (result.ok) {
      addLog({
        actorUserId: currentUser.id,
        actorName: currentUser.name,
        clubId: currentClubId || '',
        clubName: currentClub.name,
        action: 'booking.canceled',
        targetType: 'booking',
        targetId: selectedBooking.id,
        payloadJson: { refundCents: result.refundCents, customerName: selectedBooking.customerName },
      });
      toast.success(`Booking canceled. Refund: $${((result.refundCents || 0) / 100).toFixed(2)} NZD`);
      setSelectedBooking(null);
      setConfirmCancel(false);
    } else {
      toast.error(result.error || 'Could not cancel booking.');
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-[var(--nr-ink)]">Bookings</h1>
            <p className="text-sm text-[var(--nr-muted)]">All bookings for {currentClub?.name || 'your club'}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nr-muted)]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer, facility…"
              className="pl-9 h-9"
            />
          </div>
          <div className="flex items-center gap-1 bg-[var(--nr-neutral)] rounded-[var(--nr-radius)] p-0.5">
            {(['all', 'confirmed', 'canceled', 'blocked'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-sm font-medium rounded-[6px] capitalize transition-colors ${
                  filter === f
                    ? 'bg-background text-[var(--nr-ink)] shadow-[var(--nr-shadow-sm)]'
                    : 'text-[var(--nr-muted)] hover:text-[var(--nr-ink)]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BookOpen size={40} className="text-[var(--nr-border)] mb-4" />
            <h3 className="font-semibold text-[var(--nr-ink)] mb-1">No bookings yet</h3>
            <p className="text-sm text-[var(--nr-muted)] max-w-xs">
              When customers book online or you add walk-ins from the calendar, they'll appear here.
            </p>
          </div>
        ) : (
          <div className="bg-background border border-[var(--nr-border)] rounded-[var(--nr-radius-lg)] overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Facility</th>
                  <th>Date & time</th>
                  <th>Duration</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Type</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => {
                  const startAt = new Date(b.startAt);
                  const endAt = new Date(b.endAt);
                  const hours = Math.round((endAt.getTime() - startAt.getTime()) / (1000 * 60 * 60));
                  return (
                    <tr key={b.id}>
                      <td>
                        <p className="font-medium text-[var(--nr-ink)]">{b.customerName || '—'}</p>
                        {b.customerPhone && <p className="text-xs text-[var(--nr-muted)]">{b.customerPhone}</p>}
                      </td>
                      <td className="text-[var(--nr-muted)]">{b.facilityName}</td>
                      <td className="text-[var(--nr-muted)] text-sm">{formatDateTime(startAt)}</td>
                      <td className="text-[var(--nr-muted)]">{hours}h</td>
                      <td className="font-medium text-[var(--nr-ink)]">
                        {b.totalCents ? `$${(b.totalCents / 100).toFixed(2)}` : '—'}
                      </td>
                      <td>{statusBadge(b.status)}</td>
                      <td>
                        <span className="text-xs text-[var(--nr-muted)] capitalize">{b.type.replace('_', ' ')}</span>
                      </td>
                      <td>
                        {b.status !== 'canceled' && b.status !== 'blocked' && b.status !== 'expired' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => { setSelectedBooking(b); setConfirmCancel(true); }}
                          >
                            Cancel
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cancel confirmation dialog */}
      <Dialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Cancel this booking?</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="py-2 space-y-2 text-sm text-[var(--nr-muted)]">
              <p><strong className="text-[var(--nr-ink)]">{selectedBooking.customerName}</strong> · {selectedBooking.facilityName}</p>
              <p>{formatDateTime(new Date(selectedBooking.startAt))}</p>
              <p className="text-[var(--nr-green-dark)]">As manager, you can issue a full refund.</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmCancel(false)}>Keep booking</Button>
            <Button variant="destructive" onClick={handleCancel}>Cancel & refund</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
