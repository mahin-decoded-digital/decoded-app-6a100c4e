import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useClubStore } from '@/stores/clubStore';
import { useAuditStore } from '@/stores/auditStore';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import type { OperatingHours } from '@/types';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function OperationsPage() {
  const clubs = useClubStore((s) => s.clubs);
  const currentClubId = useClubStore((s) => s.currentClubId);
  const getClubSettings = useClubStore((s) => s.getClubSettings);
  const updateClubSettings = useClubStore((s) => s.updateClubSettings);
  const currentUser = useAuthStore((s) => s.currentUser);
  const addLog = useAuditStore((s) => s.addLog);

  const currentClub = useMemo(() => clubs.find((c) => c.id === currentClubId), [clubs, currentClubId]);
  const settings = useMemo(() => currentClubId ? getClubSettings(currentClubId) : null, [getClubSettings, currentClubId]);

  const [hours, setHours] = useState<OperatingHours[]>(settings?.operatingHours || []);
  const [bufferHours, setBufferHours] = useState(settings?.bookingBufferHours ?? 1);
  const [maxAdvanceDays, setMaxAdvanceDays] = useState(settings?.maxAdvanceDays ?? 14);
  const [cancel24h, setCancel24h] = useState(settings?.cancellation24hRefundPct ?? 100);
  const [cancel12h, setCancel12h] = useState(settings?.cancellation12hRefundPct ?? 50);
  const [cancel0h, setCancel0h] = useState(settings?.cancellation0hRefundPct ?? 0);

  const updateHour = (dayOfWeek: number, update: Partial<OperatingHours>) => {
    setHours((prev) => prev.map((h) => (h.dayOfWeek === dayOfWeek ? { ...h, ...update } : h)));
  };

  const handleSave = () => {
    if (!currentClubId || !currentClub) return;
    updateClubSettings(currentClubId, {
      operatingHours: hours,
      bookingBufferHours: bufferHours,
      maxAdvanceDays,
      cancellation24hRefundPct: cancel24h,
      cancellation12hRefundPct: cancel12h,
      cancellation0hRefundPct: cancel0h,
    });
    if (currentUser) {
      addLog({
        actorUserId: currentUser.id,
        actorName: currentUser.name,
        clubId: currentClubId,
        clubName: currentClub.name,
        action: 'hours.updated',
        targetType: 'club',
        targetId: currentClubId,
        payloadJson: { bufferHours, maxAdvanceDays },
      });
    }
    toast.success('Operations settings saved. Changes apply to future bookings only.');
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-2xl space-y-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--nr-ink)]">Operations</h1>
          <p className="text-sm text-[var(--nr-muted)]">Operating hours, booking rules, and cancellation policy.</p>
        </div>

        {/* Operating hours */}
        <div className="bg-background border border-[var(--nr-border)] rounded-[var(--nr-radius-lg)] p-6">
          <h2 className="text-sm font-semibold text-[var(--nr-ink)] mb-4">Operating hours</h2>
          <div className="flex gap-2 mb-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setHours(hours.map((h) => ({
                  ...h,
                  openTime: [1,2,3,4,5].includes(h.dayOfWeek) ? '06:00' : '07:00',
                  closeTime: [1,2,3,4,5].includes(h.dayOfWeek) ? '22:00' : '20:00',
                  closed: false,
                })));
              }}
            >
              Weekday preset
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setHours(hours.map((h) => ({ ...h, openTime: '08:00', closeTime: '18:00', closed: false })));
              }}
            >
              All days 8am–6pm
            </Button>
          </div>
          <div className="space-y-2">
            {hours.map((h) => (
              <div key={h.dayOfWeek} className="flex items-center gap-3 p-3 rounded-[var(--nr-radius)] bg-[var(--nr-neutral)] border border-[var(--nr-border)]">
                <span className="text-sm font-medium text-[var(--nr-ink)] w-24 shrink-0">{DAYS[h.dayOfWeek]}</span>
                <Switch checked={!h.closed} onChange={(val) => updateHour(h.dayOfWeek, { closed: !val })} />
                {!h.closed ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      type="time"
                      value={h.openTime}
                      onChange={(e) => updateHour(h.dayOfWeek, { openTime: e.target.value })}
                      className="h-8 text-sm w-28"
                    />
                    <span className="text-[var(--nr-muted)] text-sm">to</span>
                    <Input
                      type="time"
                      value={h.closeTime}
                      onChange={(e) => updateHour(h.dayOfWeek, { closeTime: e.target.value })}
                      className="h-8 text-sm w-28"
                    />
                  </div>
                ) : (
                  <span className="text-sm text-[var(--nr-muted)]">Closed</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Booking rules */}
        <div className="bg-background border border-[var(--nr-border)] rounded-[var(--nr-radius-lg)] p-6">
          <h2 className="text-sm font-semibold text-[var(--nr-ink)] mb-4">Booking rules</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-[var(--nr-ink)]">Booking buffer (hours)</Label>
              <Input
                type="number"
                min={0}
                max={48}
                value={bufferHours}
                onChange={(e) => setBufferHours(parseInt(e.target.value || '1'))}
                className="mt-1.5 h-10"
              />
              <p className="text-xs text-[var(--nr-muted)] mt-1">Minimum notice for customer bookings. Manager bookings bypass this.</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-[var(--nr-ink)]">Max advance days</Label>
              <Input
                type="number"
                min={1}
                max={90}
                value={maxAdvanceDays}
                onChange={(e) => setMaxAdvanceDays(parseInt(e.target.value || '14'))}
                className="mt-1.5 h-10"
              />
              <p className="text-xs text-[var(--nr-muted)] mt-1">How far ahead customers can book.</p>
            </div>
          </div>
        </div>

        {/* Cancellation policy */}
        <div className="bg-background border border-[var(--nr-border)] rounded-[var(--nr-radius-lg)] p-6">
          <h2 className="text-sm font-semibold text-[var(--nr-ink)] mb-4">Cancellation & refund policy</h2>
          <div className="space-y-3">
            {[
              { label: '24+ hours notice', value: cancel24h, set: setCancel24h },
              { label: '12–24 hours notice', value: cancel12h, set: setCancel12h },
              { label: 'Under 12 hours notice', value: cancel0h, set: setCancel0h },
            ].map(({ label, value, set }) => (
              <div key={label} className="flex items-center gap-4">
                <span className="text-sm text-[var(--nr-ink)] w-44 shrink-0">{label}</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={value}
                    onChange={(e) => set(parseInt(e.target.value || '0'))}
                    className="h-9 w-20"
                  />
                  <span className="text-sm text-[var(--nr-muted)]">% refund</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-[var(--nr-muted)] mt-3">Managers can override and issue full refunds at any time.</p>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} className="bg-[var(--nr-green)] hover:bg-[var(--nr-green-dark)] text-background">
            Save operations settings
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
