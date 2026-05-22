import { useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useClubStore } from '@/stores/clubStore';
import { useBookingStore } from '@/stores/bookingStore';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { BarChart2, TrendingUp, Clock, DollarSign } from 'lucide-react';

function StatCard({ icon: Icon, label, value, sub, color = 'var(--nr-green)' }: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-[var(--nr-muted)] font-medium">{label}</p>
        <div className="w-8 h-8 rounded-[var(--nr-radius)] flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon size={16} style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-[var(--nr-ink)]">{value}</p>
      {sub && <p className="text-xs text-[var(--nr-muted)] mt-1">{sub}</p>}
    </div>
  );
}

export default function ReportsPage() {
  const clubs = useClubStore((s) => s.clubs);
  const currentClubId = useClubStore((s) => s.currentClubId);
  const allFacilities = useClubStore((s) => s.facilities);
  const allBookings = useBookingStore((s) => s.bookings);

  const currentClub = useMemo(() => clubs.find((c) => c.id === currentClubId), [clubs, currentClubId]);
  const facilities = useMemo(() => allFacilities.filter((f) => f.clubId === currentClubId), [allFacilities, currentClubId]);

  const confirmedBookings = useMemo(
    () => allBookings.filter((b) => b.clubId === currentClubId && b.status === 'confirmed'),
    [allBookings, currentClubId]
  );

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const weeklyRevenueCents = useMemo(
    () => confirmedBookings
      .filter((b) => new Date(b.startAt) >= weekStart)
      .reduce((acc, b) => acc + b.totalCents, 0),
    [confirmedBookings, weekStart]
  );

  const monthlyRevenueCents = useMemo(
    () => confirmedBookings
      .filter((b) => new Date(b.startAt) >= monthStart)
      .reduce((acc, b) => acc + b.totalCents, 0),
    [confirmedBookings, monthStart]
  );

  const totalBookingsMonth = useMemo(
    () => confirmedBookings.filter((b) => new Date(b.startAt) >= monthStart).length,
    [confirmedBookings, monthStart]
  );

  // Utilisation: confirmed hours / total available hours this month
  const utilizationPct = useMemo(() => {
    if (facilities.length === 0) return 0;
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const availableHours = facilities.length * daysInMonth * 10; // rough 10h/day average
    const bookedHours = confirmedBookings
      .filter((b) => new Date(b.startAt) >= monthStart)
      .reduce((acc, b) => {
        const hours = (new Date(b.endAt).getTime() - new Date(b.startAt).getTime()) / (1000 * 60 * 60);
        return acc + hours;
      }, 0);
    return Math.min(Math.round((bookedHours / availableHours) * 100), 100);
  }, [confirmedBookings, monthStart, facilities]);

  // Revenue by day (last 7 days)
  const revenueByDay = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });

    return days.map((day) => {
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);
      const revenue = confirmedBookings
        .filter((b) => new Date(b.startAt) >= day && new Date(b.startAt) < nextDay)
        .reduce((acc, b) => acc + b.totalCents, 0);
      return {
        day: day.toLocaleDateString('en-NZ', { weekday: 'short', day: 'numeric' }),
        revenue: revenue / 100,
      };
    });
  }, [confirmedBookings]);

  // Top slots
  const topSlots = useMemo(() => {
    const slotCounts = new Map<string, number>();
    confirmedBookings.forEach((b) => {
      const hour = new Date(b.startAt).getHours();
      const label = `${hour > 12 ? hour - 12 : hour}:00${hour >= 12 ? 'pm' : 'am'}`;
      slotCounts.set(label, (slotCounts.get(label) || 0) + 1);
    });
    return Array.from(slotCounts.entries())
      .map(([time, count]) => ({ time, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [confirmedBookings]);

  const planLimits = useMemo(() => {
    if (!currentClub) return null;
    const limits: Record<string, { limit: number | null }> = {
      starter: { limit: 200 },
      growth: { limit: 800 },
      pro: { limit: null },
    };
    return limits[currentClub.planId];
  }, [currentClub]);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        <div>
          <h1 className="text-xl font-bold text-[var(--nr-ink)]">Reports</h1>
          <p className="text-sm text-[var(--nr-muted)]">Revenue, utilisation, and booking trends for {currentClub?.name || 'your club'}</p>
        </div>

        {/* Stat cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={DollarSign}
            label="Weekly revenue"
            value={`$${(weeklyRevenueCents / 100).toFixed(2)}`}
            sub="Last 7 days"
          />
          <StatCard
            icon={DollarSign}
            label="Monthly revenue"
            value={`$${(monthlyRevenueCents / 100).toFixed(2)}`}
            sub="This month"
          />
          <StatCard
            icon={Clock}
            label="Bookings this month"
            value={String(totalBookingsMonth)}
            sub={planLimits?.limit ? `of ${planLimits.limit} limit` : 'Unlimited'}
            color="var(--nr-gold)"
          />
          <StatCard
            icon={TrendingUp}
            label="Utilisation"
            value={`${utilizationPct}%`}
            sub="This month (estimated)"
          />
        </div>

        {/* Revenue chart */}
        <div className="bg-background border border-[var(--nr-border)] rounded-[var(--nr-radius-lg)] p-6">
          <h2 className="text-sm font-semibold text-[var(--nr-ink)] mb-4">Revenue — last 7 days</h2>
          {revenueByDay.every((d) => d.revenue === 0) ? (
            <div className="flex items-center justify-center h-40 text-center">
              <div>
                <BarChart2 size={32} className="text-[var(--nr-border)] mx-auto mb-2" />
                <p className="text-sm text-[var(--nr-muted)]">No revenue data yet. Confirmed bookings will appear here.</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueByDay} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--nr-border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--nr-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--nr-muted)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  formatter={(v: number) => [`$${v.toFixed(2)} NZD`, 'Revenue']}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--nr-border)' }}
                />
                <Bar dataKey="revenue" fill="var(--nr-green)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top slots */}
          <div className="bg-background border border-[var(--nr-border)] rounded-[var(--nr-radius-lg)] p-6">
            <h2 className="text-sm font-semibold text-[var(--nr-ink)] mb-4">Top booking times</h2>
            {topSlots.length === 0 ? (
              <p className="text-sm text-[var(--nr-muted)]">No bookings yet. Your most popular time slots will appear here.</p>
            ) : (
              <div className="space-y-3">
                {topSlots.map((slot, i) => (
                  <div key={slot.time} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[var(--nr-muted)] w-4">{i + 1}</span>
                    <span className="text-sm font-medium text-[var(--nr-ink)] w-16">{slot.time}</span>
                    <div className="flex-1">
                      <Progress value={slot.count} max={topSlots[0].count} />
                    </div>
                    <span className="text-sm text-[var(--nr-muted)] w-12 text-right">{slot.count} bkgs</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Plan usage */}
          <div className="bg-background border border-[var(--nr-border)] rounded-[var(--nr-radius-lg)] p-6">
            <h2 className="text-sm font-semibold text-[var(--nr-ink)] mb-4">Plan usage this month</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-[var(--nr-muted)]">Bookings</span>
                  <span className="text-sm font-medium text-[var(--nr-ink)]">
                    {totalBookingsMonth} {planLimits?.limit ? `/ ${planLimits.limit}` : '/ ∞'}
                  </span>
                </div>
                <Progress
                  value={totalBookingsMonth}
                  max={planLimits?.limit || totalBookingsMonth || 1}
                  color={planLimits?.limit && totalBookingsMonth > planLimits.limit * 0.9 ? 'var(--nr-gold)' : 'var(--nr-green)'}
                />
                {planLimits?.limit && totalBookingsMonth > planLimits.limit * 0.8 && (
                  <p className="text-xs text-[var(--nr-gold)] mt-1">Approaching your plan limit. Consider upgrading.</p>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-[var(--nr-muted)]">Nets active</span>
                  <span className="text-sm font-medium text-[var(--nr-ink)]">
                    {facilities.length} {currentClub?.planId === 'starter' ? '/ 2' : currentClub?.planId === 'growth' ? '/ 6' : '/ ∞'}
                  </span>
                </div>
                <Progress
                  value={facilities.length}
                  max={currentClub?.planId === 'starter' ? 2 : currentClub?.planId === 'growth' ? 6 : Math.max(facilities.length, 1)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
