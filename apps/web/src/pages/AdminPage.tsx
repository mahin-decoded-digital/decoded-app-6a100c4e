import { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useClubStore } from '@/stores/clubStore';
import { useBookingStore } from '@/stores/bookingStore';
import { useAuthStore } from '@/stores/authStore';
import { useAuditStore } from '@/stores/auditStore';
import { toast } from 'sonner';
import { Search, ShieldCheck, TrendingUp, DollarSign, Users, Activity } from 'lucide-react';
import type { Club } from '@/types';

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    active: 'default',
    trialing: 'secondary',
    past_due: 'destructive',
    suspended: 'destructive',
    canceled: 'outline',
  };
  return <Badge variant={map[status] || 'outline'}>{status}</Badge>;
}

const PLAN_PRICES: Record<string, number> = { starter: 49, growth: 99, pro: 199 };

export default function AdminPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'clubs' | 'audit'>('clubs');

  const clubs = useClubStore((s) => s.clubs);
  const updateClub = useClubStore((s) => s.updateClub);
  const allBookings = useBookingStore((s) => s.bookings);
  const currentUser = useAuthStore((s) => s.currentUser);
  // Select logs array directly — not via the getter function (which would create new refs)
  const allLogs = useAuditStore((s) => s.logs);
  const addLog = useAuditStore((s) => s.addLog);

  const filteredClubs = useMemo(() => {
    if (!search.trim()) return clubs;
    const q = search.toLowerCase();
    return clubs.filter((c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q));
  }, [clubs, search]);

  const mrr = useMemo(
    () => clubs.filter((c) => c.status === 'active').reduce((acc, c) => acc + (PLAN_PRICES[c.planId] || 0), 0),
    [clubs]
  );

  const trialing = useMemo(() => clubs.filter((c) => c.status === 'trialing').length, [clubs]);
  const active = useMemo(() => clubs.filter((c) => c.status === 'active').length, [clubs]);
  const totalBookings = useMemo(() => allBookings.filter((b) => b.status === 'confirmed').length, [allBookings]);

  const handleSuspend = (club: Club) => {
    updateClub(club.id, { status: 'suspended' });
    if (currentUser) {
      addLog({
        actorUserId: currentUser.id,
        actorName: currentUser.name,
        clubId: club.id,
        clubName: club.name,
        action: 'club.suspended',
        targetType: 'club',
        targetId: club.id,
        payloadJson: { reason: 'admin_action' },
      });
    }
    toast.success(`${club.name} suspended.`);
  };

  const handleUnsuspend = (club: Club) => {
    updateClub(club.id, { status: 'active' });
    if (currentUser) {
      addLog({
        actorUserId: currentUser.id,
        actorName: currentUser.name,
        clubId: club.id,
        clubName: club.name,
        action: 'club.unsuspended',
        targetType: 'club',
        targetId: club.id,
        payloadJson: {},
      });
    }
    toast.success(`${club.name} reactivated.`);
  };

  const handleExtendTrial = (club: Club) => {
    const newEnd = new Date(club.trialEndsAt || Date.now());
    newEnd.setDate(newEnd.getDate() + 7);
    updateClub(club.id, { trialEndsAt: newEnd });
    if (currentUser) {
      addLog({
        actorUserId: currentUser.id,
        actorName: currentUser.name,
        clubId: club.id,
        clubName: club.name,
        action: 'trial.extended',
        targetType: 'club',
        targetId: club.id,
        payloadJson: { extendedBy: 7 },
      });
    }
    toast.success(`${club.name}'s trial extended by 7 days.`);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[var(--nr-radius)] bg-[var(--nr-green-faint)] flex items-center justify-center">
            <ShieldCheck size={18} className="text-[var(--nr-green)]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--nr-ink)]">Platform Admin</h1>
            <p className="text-sm text-[var(--nr-muted)]">NetReserve operations dashboard</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: DollarSign, label: 'MRR', value: `$${mrr.toLocaleString()}`, sub: 'Active clubs only' },
            { icon: Users, label: 'Total clubs', value: String(clubs.length), sub: `${trialing} trialing · ${active} active` },
            { icon: TrendingUp, label: 'All-time bookings', value: String(totalBookings), sub: 'Confirmed' },
            { icon: Activity, label: 'Audit events', value: String(allLogs.length), sub: 'All time' },
          ].map((stat) => (
            <div key={stat.label} className="stat-card">
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm text-[var(--nr-muted)]">{stat.label}</p>
                <div className="w-7 h-7 rounded bg-[var(--nr-green-faint)] flex items-center justify-center">
                  <stat.icon size={14} className="text-[var(--nr-green)]" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[var(--nr-ink)]">{stat.value}</p>
              <p className="text-xs text-[var(--nr-muted)] mt-1">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[var(--nr-border)]">
          {(['clubs', 'audit'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors capitalize ${
                activeTab === tab
                  ? 'border-[var(--nr-green)] text-[var(--nr-green-dark)]'
                  : 'border-transparent text-[var(--nr-muted)] hover:text-[var(--nr-ink)]'
              }`}
            >
              {tab === 'clubs' ? 'All clubs' : 'Audit log'}
            </button>
          ))}
        </div>

        {activeTab === 'clubs' && (
          <>
            <div className="relative max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nr-muted)]" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search clubs…"
                className="pl-9 h-9"
              />
            </div>

            {filteredClubs.length === 0 ? (
              <div className="text-center py-16">
                <Users size={36} className="text-[var(--nr-border)] mx-auto mb-3" />
                <p className="text-sm text-[var(--nr-muted)]">No clubs found. Club signups will appear here.</p>
              </div>
            ) : (
              <div className="bg-background border border-[var(--nr-border)] rounded-[var(--nr-radius-lg)] overflow-hidden">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Club</th>
                      <th>Plan</th>
                      <th>Status</th>
                      <th>Bookings</th>
                      <th>Signed up</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClubs.map((club) => {
                      const clubBookings = allBookings.filter((b) => b.clubId === club.id && b.status === 'confirmed').length;
                      return (
                        <tr key={club.id}>
                          <td>
                            <div className="flex items-center gap-3">
                              <div
                                className="w-7 h-7 rounded flex items-center justify-center text-background text-xs font-bold shrink-0"
                                style={{ backgroundColor: club.brandingColor || 'var(--nr-green)' }}
                              >
                                {club.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-[var(--nr-ink)]">{club.name}</p>
                                <p className="text-xs text-[var(--nr-muted)] font-mono">{club.slug}</p>
                              </div>
                            </div>
                          </td>
                          <td className="capitalize text-[var(--nr-muted)]">{club.planId}</td>
                          <td><StatusBadge status={club.status} /></td>
                          <td className="font-medium text-[var(--nr-ink)]">{clubBookings}</td>
                          <td className="text-[var(--nr-muted)] text-sm">
                            {new Date(club.createdAt).toLocaleDateString('en-NZ', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td>
                            <div className="flex items-center gap-1">
                              {club.status === 'trialing' && (
                                <Button size="sm" variant="ghost" onClick={() => handleExtendTrial(club)}>
                                  +7 days
                                </Button>
                              )}
                              {club.status !== 'suspended' ? (
                                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleSuspend(club)}>
                                  Suspend
                                </Button>
                              ) : (
                                <Button size="sm" variant="ghost" className="text-[var(--nr-green)]" onClick={() => handleUnsuspend(club)}>
                                  Reactivate
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {activeTab === 'audit' && (
          <div className="bg-background border border-[var(--nr-border)] rounded-[var(--nr-radius-lg)] overflow-hidden">
            {allLogs.length === 0 ? (
              <div className="text-center py-16">
                <Activity size={36} className="text-[var(--nr-border)] mx-auto mb-3" />
                <p className="text-sm text-[var(--nr-muted)]">No audit events yet. Actions taken by managers will appear here.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Actor</th>
                    <th>Club</th>
                    <th>Action</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {allLogs.slice(0, 100).map((log) => (
                    <tr key={log.id}>
                      <td className="text-xs text-[var(--nr-muted)] whitespace-nowrap">
                        {new Date(log.at).toLocaleString('en-NZ', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </td>
                      <td className="text-sm text-[var(--nr-ink)]">{log.actorName}</td>
                      <td className="text-sm text-[var(--nr-muted)]">{log.clubName}</td>
                      <td>
                        <span className="font-mono text-xs text-[var(--nr-green-dark)] bg-[var(--nr-green-faint)] px-2 py-0.5 rounded">
                          {log.action}
                        </span>
                      </td>
                      <td className="text-xs text-[var(--nr-muted)] max-w-[200px] truncate font-mono">
                        {JSON.stringify(log.payloadJson)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
