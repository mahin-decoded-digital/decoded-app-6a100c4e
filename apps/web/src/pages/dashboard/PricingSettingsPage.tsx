import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useClubStore } from '@/stores/clubStore';
import { useAuthStore } from '@/stores/authStore';
import { useAuditStore } from '@/stores/auditStore';
import { toast } from 'sonner';

export default function PricingSettingsPage() {
  const clubs = useClubStore((s) => s.clubs);
  const currentClubId = useClubStore((s) => s.currentClubId);
  const allAddons = useClubStore((s) => s.addons);
  const getClubSettings = useClubStore((s) => s.getClubSettings);
  const updateClubSettings = useClubStore((s) => s.updateClubSettings);
  const updateAddon = useClubStore((s) => s.updateAddon);
  const currentUser = useAuthStore((s) => s.currentUser);
  const addLog = useAuditStore((s) => s.addLog);

  const currentClub = useMemo(() => clubs.find((c) => c.id === currentClubId), [clubs, currentClubId]);
  const settings = useMemo(() => currentClubId ? getClubSettings(currentClubId) : null, [getClubSettings, currentClubId]);

  const [memberRate, setMemberRate] = useState((settings?.memberNetRateCents || 2000) / 100);
  const [nonMemberRate, setNonMemberRate] = useState((settings?.nonMemberNetRateCents || 3500) / 100);

  const addons = useMemo(() => allAddons.filter((a) => a.clubId === currentClubId), [allAddons, currentClubId]);
  const [addonRates, setAddonRates] = useState<Record<string, { member: number; nonMember: number }>>(
    Object.fromEntries(addons.map((a) => [a.id, { member: a.priceMemberCents / 100, nonMember: a.priceNonmemberCents / 100 }]))
  );

  const handleSave = () => {
    if (!currentClubId || !currentClub) return;
    if (memberRate <= 0 || nonMemberRate <= 0) {
      toast.error('Rates must be greater than $0.');
      return;
    }
    updateClubSettings(currentClubId, {
      memberNetRateCents: Math.round(memberRate * 100),
      nonMemberNetRateCents: Math.round(nonMemberRate * 100),
    });

    addons.forEach((addon) => {
      const r = addonRates[addon.id];
      if (r) {
        updateAddon(addon.id, {
          priceMemberCents: Math.round(r.member * 100),
          priceNonmemberCents: Math.round(r.nonMember * 100),
        });
      }
    });

    if (currentUser) {
      addLog({
        actorUserId: currentUser.id,
        actorName: currentUser.name,
        clubId: currentClubId,
        clubName: currentClub.name,
        action: 'pricing.updated',
        targetType: 'club',
        targetId: currentClubId,
        payloadJson: { memberRate, nonMemberRate },
      });
    }

    toast.success('Pricing updated. Changes apply to future bookings only.');
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-2xl space-y-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--nr-ink)]">Pricing</h1>
          <p className="text-sm text-[var(--nr-muted)]">Set your member and non-member rates. All prices are per hour, GST-inclusive (NZD).</p>
        </div>

        {/* Net rates */}
        <div className="bg-background border border-[var(--nr-border)] rounded-[var(--nr-radius-lg)] p-6">
          <h2 className="text-sm font-semibold text-[var(--nr-ink)] mb-4">Cricket net rates (per hour)</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-[var(--nr-ink)]">Member rate</Label>
              <div className="relative mt-1.5">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nr-muted)] text-sm">$</span>
                <Input
                  type="number"
                  min={1}
                  step={0.5}
                  value={memberRate}
                  onChange={(e) => setMemberRate(parseFloat(e.target.value || '0'))}
                  className="pl-7 h-11"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-[var(--nr-ink)]">Non-member rate</Label>
              <div className="relative mt-1.5">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nr-muted)] text-sm">$</span>
                <Input
                  type="number"
                  min={1}
                  step={0.5}
                  value={nonMemberRate}
                  onChange={(e) => setNonMemberRate(parseFloat(e.target.value || '0'))}
                  className="pl-7 h-11"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="mt-4 p-3 bg-[var(--nr-neutral)] rounded-[var(--nr-radius)] border border-[var(--nr-border)]">
            <p className="text-xs font-semibold text-[var(--nr-muted)] uppercase tracking-widest mb-2">Price preview</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[1, 2, 3, 4].map((hrs) => (
                <div key={hrs}>
                  <span className="text-[var(--nr-muted)]">{hrs}h — member: </span>
                  <span className="font-medium text-[var(--nr-ink)]">${(memberRate * hrs).toFixed(2)}</span>
                  <span className="text-[var(--nr-muted)]"> · non-member: </span>
                  <span className="font-medium text-[var(--nr-ink)]">${(nonMemberRate * hrs).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Add-on rates */}
        {addons.length > 0 && (
          <div className="bg-background border border-[var(--nr-border)] rounded-[var(--nr-radius-lg)] p-6">
            <h2 className="text-sm font-semibold text-[var(--nr-ink)] mb-4">Add-on rates (per hour)</h2>
            {addons.map((addon) => {
              const r = addonRates[addon.id] || { member: addon.priceMemberCents / 100, nonMember: addon.priceNonmemberCents / 100 };
              return (
                <div key={addon.id} className="mb-4">
                  <p className="text-sm font-medium text-[var(--nr-ink)] mb-2">{addon.label}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-[var(--nr-muted)]">Member rate</Label>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nr-muted)] text-sm">$</span>
                        <Input
                          type="number"
                          min={0}
                          step={0.5}
                          value={r.member}
                          onChange={(e) => setAddonRates((prev) => ({ ...prev, [addon.id]: { ...r, member: parseFloat(e.target.value || '0') } }))}
                          className="pl-7 h-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-[var(--nr-muted)]">Non-member rate</Label>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nr-muted)] text-sm">$</span>
                        <Input
                          type="number"
                          min={0}
                          step={0.5}
                          value={r.nonMember}
                          onChange={(e) => setAddonRates((prev) => ({ ...prev, [addon.id]: { ...r, nonMember: parseFloat(e.target.value || '0') } }))}
                          className="pl-7 h-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="p-3 bg-[var(--nr-neutral)] rounded-[var(--nr-radius)] border border-[var(--nr-border)] text-xs text-[var(--nr-muted)]">
          All prices include GST (15% NZ). Updated pricing applies to new bookings only — existing confirmed bookings are not affected.
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} className="bg-[var(--nr-green)] hover:bg-[var(--nr-green-dark)] text-background">
            Save pricing
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
