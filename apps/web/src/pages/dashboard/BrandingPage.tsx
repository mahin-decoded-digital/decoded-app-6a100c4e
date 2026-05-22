import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useClubStore } from '@/stores/clubStore';
import { useAuthStore } from '@/stores/authStore';
import { useAuditStore } from '@/stores/auditStore';
import { toast } from 'sonner';

export default function BrandingPage() {
  const clubs = useClubStore((s) => s.clubs);
  const currentClubId = useClubStore((s) => s.currentClubId);
  const updateClub = useClubStore((s) => s.updateClub);
  const currentUser = useAuthStore((s) => s.currentUser);
  const addLog = useAuditStore((s) => s.addLog);

  const currentClub = useMemo(() => clubs.find((c) => c.id === currentClubId), [clubs, currentClubId]);

  const [color, setColor] = useState(currentClub?.brandingColor || '#16a34a');
  const [logoUrl, setLogoUrl] = useState(currentClub?.logoUrl || '');
  const [heroUrl, setHeroUrl] = useState(currentClub?.heroPhotoUrl || '');
  const [clubName, setClubName] = useState(currentClub?.name || '');
  const [address, setAddress] = useState(currentClub?.address || '');
  const [gstNumber, setGstNumber] = useState(currentClub?.gstNumber || '');

  if (!currentClub) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center">
          <p className="text-[var(--nr-muted)]">No club selected.</p>
        </div>
      </DashboardLayout>
    );
  }

  const handleSave = () => {
    if (!clubName.trim()) { toast.error('Club name cannot be empty.'); return; }
    updateClub(currentClub.id, {
      name: clubName.trim(),
      address: address.trim(),
      gstNumber: gstNumber.trim(),
      brandingColor: color,
      logoUrl: logoUrl.trim(),
      heroPhotoUrl: heroUrl.trim(),
    });
    if (currentUser) {
      addLog({
        actorUserId: currentUser.id,
        actorName: currentUser.name,
        clubId: currentClub.id,
        clubName: currentClub.name,
        action: 'booking.created',
        targetType: 'club',
        targetId: currentClub.id,
        payloadJson: { color, logoUrl, heroUrl, clubName },
      });
    }
    toast.success('Branding saved successfully.');
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-[var(--nr-ink)]">Branding</h1>
          <p className="text-sm text-[var(--nr-muted)]">Customise how your club appears on the booking page and in email templates.</p>
        </div>

        <div className="space-y-6">
          {/* Club info */}
          <div className="bg-background border border-[var(--nr-border)] rounded-[var(--nr-radius-lg)] p-6 space-y-4">
            <h2 className="text-sm font-semibold text-[var(--nr-ink)]">Club information</h2>
            <div>
              <Label className="text-sm font-medium text-[var(--nr-ink)]">Club name</Label>
              <Input value={clubName} onChange={(e) => setClubName(e.target.value)} className="mt-1.5 h-10" />
            </div>
            <div>
              <Label className="text-sm font-medium text-[var(--nr-ink)]">Address</Label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1.5 h-10" />
            </div>
            <div>
              <Label className="text-sm font-medium text-[var(--nr-ink)]">GST number (optional)</Label>
              <Input value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} className="mt-1.5 h-10" placeholder="12-345-678" />
            </div>
          </div>

          {/* Brand colour */}
          <div className="bg-background border border-[var(--nr-border)] rounded-[var(--nr-radius-lg)] p-6 space-y-4">
            <h2 className="text-sm font-semibold text-[var(--nr-ink)]">Brand colour</h2>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-12 h-10 rounded cursor-pointer border border-[var(--nr-border)]"
              />
              <Input value={color} onChange={(e) => setColor(e.target.value)} className="h-10 font-mono w-36" />
            </div>

            {/* Preview */}
            <div className="mt-3 p-4 bg-[var(--nr-neutral)] rounded-[var(--nr-radius)] border border-[var(--nr-border)]">
              <p className="text-xs text-[var(--nr-muted)] mb-2">Preview — booking page header</p>
              <div className="flex items-center gap-3 p-3 rounded" style={{ backgroundColor: color + '18', borderLeft: `3px solid ${color}` }}>
                <div className="w-8 h-8 rounded flex items-center justify-center text-background font-bold text-sm" style={{ backgroundColor: color }}>
                  {currentClub.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--nr-ink)]">{clubName || currentClub.name}</p>
                  <p className="text-xs" style={{ color }}>
                    {currentClub.slug}.netreserve.co.nz
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Logo & hero */}
          <div className="bg-background border border-[var(--nr-border)] rounded-[var(--nr-radius-lg)] p-6 space-y-4">
            <h2 className="text-sm font-semibold text-[var(--nr-ink)]">Logo & hero photo</h2>
            <div>
              <Label className="text-sm font-medium text-[var(--nr-ink)]">Logo URL (optional)</Label>
              <Input
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="mt-1.5 h-10"
                placeholder="https://yourclub.co.nz/logo.png"
              />
              <p className="text-xs text-[var(--nr-muted)] mt-1">Leave blank to use your club initials.</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-[var(--nr-ink)]">Hero photo URL (optional)</Label>
              <Input
                value={heroUrl}
                onChange={(e) => setHeroUrl(e.target.value)}
                className="mt-1.5 h-10"
                placeholder="https://yourclub.co.nz/hero.jpg"
              />
              <p className="text-xs text-[var(--nr-muted)] mt-1">Shown at the top of your public booking page.</p>
            </div>
          </div>

          <div className="p-4 bg-[var(--nr-green-faint)] rounded-[var(--nr-radius-lg)] border border-[var(--nr-green-light)] text-sm text-[var(--nr-green-dark)]">
            Your booking page is live at{' '}
            <span className="font-mono font-medium">{currentClub.slug}.netreserve.co.nz</span>.
            Changes apply immediately.
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} className="bg-[var(--nr-green)] hover:bg-[var(--nr-green-dark)] text-background">
              Save branding
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
