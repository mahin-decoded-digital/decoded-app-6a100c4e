import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Avatar } from '@/components/ui/avatar';
import { useClubStore } from '@/stores/clubStore';
import { useBookingStore } from '@/stores/bookingStore';
import { useAuthStore } from '@/stores/authStore';
import { useMemberStore } from '@/stores/memberStore';
import { useAuditStore } from '@/stores/auditStore';
import { toast } from 'sonner';
import { Search, Users } from 'lucide-react';

interface CustomerRecord {
  userId: string;
  name: string;
  email: string;
  phone: string;
  bookingsCount: number;
  totalSpentCents: number;
  isMember: boolean;
  lastBooking: Date | null;
}

export default function CustomersPage() {
  const [search, setSearch] = useState('');

  const clubs = useClubStore((s) => s.clubs);
  const currentClubId = useClubStore((s) => s.currentClubId);
  const allBookings = useBookingStore((s) => s.bookings);
  const allUsers = useAuthStore((s) => s.users);
  const currentUser = useAuthStore((s) => s.currentUser);
  const addMember = useMemberStore((s) => s.addMember);
  const removeMember = useMemberStore((s) => s.removeMember);
  const isMember = useMemberStore((s) => s.isMember);
  const addLog = useAuditStore((s) => s.addLog);

  const currentClub = useMemo(() => clubs.find((c) => c.id === currentClubId), [clubs, currentClubId]);

  const clubBookings = useMemo(
    () => allBookings.filter((b) => b.clubId === currentClubId && b.status !== 'canceled' && b.status !== 'expired'),
    [allBookings, currentClubId]
  );

  const customers = useMemo((): CustomerRecord[] => {
    const byUserId = new Map<string, CustomerRecord>();

    clubBookings.forEach((b) => {
      if (!b.userId || b.type === 'block') return;
      const existing = byUserId.get(b.userId);
      const startAt = new Date(b.startAt);
      if (existing) {
        existing.bookingsCount += 1;
        existing.totalSpentCents += b.totalCents;
        if (!existing.lastBooking || startAt > existing.lastBooking) {
          existing.lastBooking = startAt;
        }
      } else {
        const user = allUsers.find((u) => u.id === b.userId);
        byUserId.set(b.userId, {
          userId: b.userId,
          name: user?.name || b.customerName || 'Unknown',
          email: user?.email || b.customerEmail || '',
          phone: user?.phone || b.customerPhone || '',
          bookingsCount: 1,
          totalSpentCents: b.totalCents,
          lastBooking: startAt,
          isMember: currentClubId ? isMember(currentClubId, b.userId) : false,
        });
      }
    });

    return Array.from(byUserId.values()).filter((c) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
    });
  }, [clubBookings, allUsers, currentClubId, isMember, search]);

  const handleToggleMember = (customer: CustomerRecord) => {
    if (!currentClubId || !currentUser || !currentClub) return;
    if (customer.isMember) {
      removeMember(currentClubId, customer.userId);
      addLog({
        actorUserId: currentUser.id,
        actorName: currentUser.name,
        clubId: currentClubId,
        clubName: currentClub.name,
        action: 'member.removed',
        targetType: 'user',
        targetId: customer.userId,
        payloadJson: { customerName: customer.name },
      });
      toast.success(`${customer.name} removed from members.`);
    } else {
      addMember(currentClubId, customer.userId);
      addLog({
        actorUserId: currentUser.id,
        actorName: currentUser.name,
        clubId: currentClubId,
        clubName: currentClub.name,
        action: 'member.added',
        targetType: 'user',
        targetId: customer.userId,
        payloadJson: { customerName: customer.name },
      });
      toast.success(`${customer.name} is now a member. Member pricing will apply automatically.`);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-[var(--nr-ink)]">Customers</h1>
            <p className="text-sm text-[var(--nr-muted)]">
              {customers.length} customer{customers.length !== 1 ? 's' : ''} · Toggle member status to apply member pricing
            </p>
          </div>
        </div>

        <div className="relative mb-5 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nr-muted)]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="pl-9 h-9"
          />
        </div>

        {customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Users size={40} className="text-[var(--nr-border)] mb-4" />
            <h3 className="font-semibold text-[var(--nr-ink)] mb-1">No customers yet</h3>
            <p className="text-sm text-[var(--nr-muted)] max-w-xs">
              {search
                ? 'No customers match your search.'
                : 'Customers who make bookings at your club will appear here. You can toggle their member status to apply member pricing automatically.'}
            </p>
          </div>
        ) : (
          <div className="bg-background border border-[var(--nr-border)] rounded-[var(--nr-radius-lg)] overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Bookings</th>
                  <th>Total spent</th>
                  <th>Last booking</th>
                  <th>Member</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.userId}>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar name={c.name} size="sm" />
                        <span className="font-medium text-[var(--nr-ink)]">{c.name}</span>
                      </div>
                    </td>
                    <td>
                      <p className="text-[var(--nr-muted)] text-sm">{c.email || '—'}</p>
                      {c.phone && <p className="text-xs text-[var(--nr-muted)]">{c.phone}</p>}
                    </td>
                    <td className="font-medium text-[var(--nr-ink)]">{c.bookingsCount}</td>
                    <td className="font-medium text-[var(--nr-ink)]">
                      ${(c.totalSpentCents / 100).toFixed(2)}
                    </td>
                    <td className="text-[var(--nr-muted)] text-sm">
                      {c.lastBooking
                        ? new Date(c.lastBooking).toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' })
                        : '—'}
                    </td>
                    <td>
                      <Switch
                        checked={currentClubId ? isMember(currentClubId, c.userId) : false}
                        onChange={() => handleToggleMember(c)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
