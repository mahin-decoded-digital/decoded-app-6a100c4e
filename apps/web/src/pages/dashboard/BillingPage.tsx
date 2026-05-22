import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useClubStore } from '@/stores/clubStore';
import { useBookingStore } from '@/stores/bookingStore';
import { useAuthStore } from '@/stores/authStore';
import { useAuditStore } from '@/stores/auditStore';
import { toast } from 'sonner';
import { CheckCircle, Star, ArrowRight, CreditCard, Calendar, Zap } from 'lucide-react';
import type { SubscriptionPlan } from '@/types';

const PLAN_INFO: Record<SubscriptionPlan, { name: string; price: number; nets: string; bookings: number | null; sms: number }> = {
  starter: { name: 'Starter', price: 49, nets: 'Up to 2 nets', bookings: 200, sms: 100 },
  growth: { name: 'Growth', price: 99, nets: 'Up to 6 nets', bookings: 800, sms: 500 },
  pro: { name: 'Pro', price: 199, nets: 'Unlimited nets', bookings: null, sms: 2000 },
};

export default function BillingPage() {
  const navigate = useNavigate();
  const clubs = useClubStore((s) => s.clubs);
  const currentClubId = useClubStore((s) => s.currentClubId);
  const upgradePlan = useClubStore((s) => s.upgradePlan);
  const facilities = useClubStore((s) => s.facilities);
  const allBookings = useBookingStore((s) => s.bookings);
  const currentUser = useAuthStore((s) => s.currentUser);
  const addLog = useAuditStore((s) => s.addLog);

  const currentClub = useMemo(() => clubs.find((c) => c.id === currentClubId), [clubs, currentClubId]);
  const plan = currentClub ? PLAN_INFO[currentClub.planId] : null;

  const clubFacilities = useMemo(
    () => facilities.filter((f) => f.clubId === currentClubId && f.active),
    [facilities, currentClubId]
  );

  const monthStart = useMemo(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const monthlyBookings = useMemo(
    () => allBookings.filter((b) => b.clubId === currentClubId && b.status === 'confirmed' && new Date(b.startAt) >= monthStart).length,
    [allBookings, currentClubId, monthStart]
  );

  const trialDaysLeft = useMemo(() => {
    if (!currentClub?.trialEndsAt) return 0;
    const left = Math.ceil((new Date(currentClub.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return Math.max(0, left);
  }, [currentClub]);

  const handleUpgrade = (planId: SubscriptionPlan) => {
    if (!currentClubId || !currentClub) return;
    upgradePlan(currentClubId, planId);
    if (currentUser) {
      addLog({
        actorUserId: currentUser.id,
        actorName: currentUser.name,
        clubId: currentClubId,
        clubName: currentClub.name,
        action: 'plan.changed',
        targetType: 'club',
        targetId: currentClubId,
        payloadJson: { from: currentClub.planId, to: planId },
      });
    }
    toast.success(`Plan changed to ${PLAN_INFO[planId].name}.`);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-3xl">
        <div>
          <h1 className="text-xl font-bold text-[var(--nr-ink)]">Subscription & billing</h1>
          <p className="text-sm text-[var(--nr-muted)]">Manage your plan, usage, and payment details.</p>
        </div>

        {/* Current plan */}
        {currentClub && plan && (
          <div className="bg-background border border-[var(--nr-border)] rounded-[var(--nr-radius-lg)] p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-sm font-semibold text-[var(--nr-ink)]">Current plan</h2>
                  <Badge variant={currentClub.status === 'trialing' ? 'secondary' : 'default'}>
                    {currentClub.status === 'trialing' ? `Trial — ${trialDaysLeft} days left` : 'Active'}
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-[var(--nr-ink)]">
                  {plan.name}
                  <span className="text-base font-normal text-[var(--nr-muted)]"> · ${plan.price}/mo NZD</span>
                </p>
              </div>
              <CreditCard size={20} className="text-[var(--nr-muted)] mt-1" />
            </div>

            {currentClub.status === 'trialing' && (
              <div className="flex items-start gap-3 p-3 bg-[var(--nr-gold-light)] rounded-[var(--nr-radius)] border border-[#fde68a] mb-4">
                <Calendar size={16} className="text-[var(--nr-gold)] shrink-0 mt-0.5" />
                <p className="text-sm text-[var(--nr-gold)]">
                  Your trial ends in <strong>{trialDaysLeft} days</strong>. Add a payment method to continue after the trial.
                </p>
              </div>
            )}

            <div className="space-y-4">
              {/* Bookings usage */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-[var(--nr-muted)]">Bookings this month</span>
                  <span className="text-sm font-medium text-[var(--nr-ink)]">
                    {monthlyBookings} {plan.bookings ? `/ ${plan.bookings}` : '/ unlimited'}
                  </span>
                </div>
                <Progress
                  value={monthlyBookings}
                  max={plan.bookings || Math.max(monthlyBookings, 1)}
                  color={plan.bookings && monthlyBookings > plan.bookings * 0.85 ? 'var(--nr-gold)' : 'var(--nr-green)'}
                />
              </div>

              {/* Nets usage */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-[var(--nr-muted)]">Active nets</span>
                  <span className="text-sm font-medium text-[var(--nr-ink)]">
                    {clubFacilities.length} {plan.nets}
                  </span>
                </div>
                <Progress
                  value={clubFacilities.length}
                  max={currentClub.planId === 'starter' ? 2 : currentClub.planId === 'growth' ? 6 : Math.max(clubFacilities.length, 1)}
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--nr-muted)]">SMS included this month</span>
                <span className="font-medium text-[var(--nr-ink)]">{plan.sms.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Upgrade plans */}
        <div className="bg-background border border-[var(--nr-border)] rounded-[var(--nr-radius-lg)] p-6">
          <h2 className="text-sm font-semibold text-[var(--nr-ink)] mb-4">Available plans</h2>
          <div className="space-y-3">
            {(Object.entries(PLAN_INFO) as [SubscriptionPlan, typeof PLAN_INFO[SubscriptionPlan]][]).map(([planId, info]) => {
              const isCurrent = currentClub?.planId === planId;
              return (
                <div
                  key={planId}
                  className={`flex items-center gap-4 p-4 rounded-[var(--nr-radius-lg)] border-2 transition-colors ${
                    isCurrent ? 'border-[var(--nr-green)] bg-[var(--nr-green-faint)]' : 'border-[var(--nr-border)] hover:border-[var(--nr-green-light)]'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-[var(--nr-ink)] text-sm">{info.name}</p>
                      {planId === 'growth' && <span className="badge-green text-xs">Most popular</span>}
                      {isCurrent && <span className="badge-green text-xs">Current</span>}
                    </div>
                    <p className="text-xs text-[var(--nr-muted)]">{info.nets} · {info.bookings ? `${info.bookings} bookings/mo` : 'Unlimited bookings'} · {info.sms.toLocaleString()} SMS</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-[var(--nr-ink)]">${info.price}<span className="text-xs font-normal text-[var(--nr-muted)]">/mo</span></p>
                    {!isCurrent && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpgrade(planId)}
                        className="mt-1"
                      >
                        {info.price > (plan?.price || 0) ? 'Upgrade' : 'Downgrade'}
                      </Button>
                    )}
                    {isCurrent && <CheckCircle size={16} className="text-[var(--nr-green)] mt-1 ml-auto" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment method */}
        <div className="bg-background border border-[var(--nr-border)] rounded-[var(--nr-radius-lg)] p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[var(--nr-ink)]">Payment method</h2>
          </div>
          <div className="flex items-center gap-3 p-3 bg-[var(--nr-neutral)] rounded-[var(--nr-radius)] border border-[var(--nr-border)]">
            <CreditCard size={16} className="text-[var(--nr-muted)]" />
            <p className="text-sm text-[var(--nr-muted)]">No payment method on file. Add a card to continue after your trial.</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => toast.info('Stripe billing portal would open here in production.')}
          >
            Add payment method
            <ArrowRight size={13} className="ml-2" />
          </Button>
        </div>

        {/* Danger zone */}
        <div className="border border-destructive/30 rounded-[var(--nr-radius-lg)] p-5 bg-[var(--nr-red-light)]">
          <h3 className="text-sm font-semibold text-destructive mb-1">Cancel subscription</h3>
          <p className="text-xs text-[var(--nr-muted)] mb-3">
            Canceling keeps your booking page active until the end of the current billing period. Your data is kept for 30 days.
          </p>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => toast.info('Cancellation flow would be confirmed here.')}
          >
            Cancel subscription
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
