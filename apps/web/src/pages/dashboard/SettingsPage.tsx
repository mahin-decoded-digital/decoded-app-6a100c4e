import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

export default function SettingsPage() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const updateCurrentUser = useAuthStore((s) => s.updateCurrentUser);
  const logout = useAuthStore((s) => s.logout);

  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySms, setNotifySms] = useState(false);

  const handleSaveProfile = () => {
    if (!name.trim()) { toast.error('Name cannot be empty.'); return; }
    updateCurrentUser({ name: name.trim(), phone: phone.trim() });
    toast.success('Profile saved.');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-2xl space-y-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--nr-ink)]">Settings</h1>
          <p className="text-sm text-[var(--nr-muted)]">Your profile and notification preferences.</p>
        </div>

        {/* Profile */}
        <div className="bg-background border border-[var(--nr-border)] rounded-[var(--nr-radius-lg)] p-6">
          <h2 className="text-sm font-semibold text-[var(--nr-ink)] mb-4">Manager profile</h2>
          <div className="flex items-center gap-4 mb-6">
            <Avatar name={currentUser?.name || 'U'} size="lg" />
            <div>
              <p className="font-semibold text-[var(--nr-ink)]">{currentUser?.name}</p>
              <p className="text-sm text-[var(--nr-muted)]">{currentUser?.email}</p>
              <p className="text-xs text-[var(--nr-muted)] capitalize">{currentUser?.role?.replace('_', ' ')}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-[var(--nr-ink)]">Full name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 h-10" />
            </div>
            <div>
              <Label className="text-sm font-medium text-[var(--nr-ink)]">Email address</Label>
              <Input value={currentUser?.email || ''} disabled className="mt-1.5 h-10 opacity-60" />
              <p className="text-xs text-[var(--nr-muted)] mt-1">Email cannot be changed (used for sign-in).</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-[var(--nr-ink)]">Mobile number</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1.5 h-10" placeholder="+64 21 123 4567" />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={handleSaveProfile} className="bg-[var(--nr-green)] hover:bg-[var(--nr-green-dark)] text-background">
              Save profile
            </Button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-background border border-[var(--nr-border)] rounded-[var(--nr-radius-lg)] p-6">
          <h2 className="text-sm font-semibold text-[var(--nr-ink)] mb-4">Manager notifications</h2>
          <p className="text-sm text-[var(--nr-muted)] mb-4">How you want to be notified when a new booking is made.</p>
          <div className="space-y-4">
            <Switch
              checked={notifyEmail}
              onChange={(val) => { setNotifyEmail(val); toast.success('Email notifications ' + (val ? 'enabled' : 'disabled') + '.'); }}
              label="Email notifications"
              description="Receive an email for every new booking, cancellation, and refund."
            />
            <Switch
              checked={notifySms}
              onChange={(val) => { setNotifySms(val); toast.success('SMS notifications ' + (val ? 'enabled' : 'disabled') + '.'); }}
              label="SMS notifications"
              description="Receive an SMS for new bookings. Uses your plan's SMS allowance."
            />
          </div>
        </div>

        {/* Sign out */}
        <div className="bg-background border border-[var(--nr-border)] rounded-[var(--nr-radius-lg)] p-6">
          <h2 className="text-sm font-semibold text-[var(--nr-ink)] mb-2">Session</h2>
          <p className="text-sm text-[var(--nr-muted)] mb-4">Sign out of your NetReserve account on this device.</p>
          <Button variant="outline" onClick={handleLogout}>
            Sign out
          </Button>
        </div>

        {/* Danger zone */}
        <div className="border border-destructive/30 rounded-[var(--nr-radius-lg)] p-5 bg-[var(--nr-red-light)]">
          <h3 className="text-sm font-semibold text-destructive mb-1">Danger zone</h3>
          <p className="text-xs text-[var(--nr-muted)] mb-3">
            Deleting your club removes your booking page, all data, and your subscription. This cannot be undone.
          </p>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => toast.error('Account deletion requires confirmation. Contact support@netreserve.co.nz to proceed.')}
          >
            Delete club account
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
