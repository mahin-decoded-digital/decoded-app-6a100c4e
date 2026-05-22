import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useClubStore } from '@/stores/clubStore';
import { toast } from 'sonner';
import { Plus, Package, Target, Trash } from 'lucide-react';

export default function ResourcesPage() {
  const [showAddNet, setShowAddNet] = useState(false);
  const [showAddAddon, setShowAddAddon] = useState(false);
  const [showEditInventory, setShowEditInventory] = useState(false);
  const [editingAddonId, setEditingAddonId] = useState('');
  const [editingInventoryCount, setEditingInventoryCount] = useState(1);
  const [newNetName, setNewNetName] = useState('');
  const [newAddon, setNewAddon] = useState({
    label: 'Bowling Machine',
    count: 1,
    memberCents: 1500,
    nonMemberCents: 2500,
  });

  const clubs = useClubStore((s) => s.clubs);
  const currentClubId = useClubStore((s) => s.currentClubId);
  const allFacilities = useClubStore((s) => s.facilities);
  const allAddons = useClubStore((s) => s.addons);
  const addFacility = useClubStore((s) => s.addFacility);
  const updateFacility = useClubStore((s) => s.updateFacility);
  const removeFacility = useClubStore((s) => s.removeFacility);
  const addAddon = useClubStore((s) => s.addAddon);
  const updateAddon = useClubStore((s) => s.updateAddon);

  const facilities = useMemo(
    () => allFacilities.filter((f) => f.clubId === currentClubId).sort((a, b) => a.displayOrder - b.displayOrder),
    [allFacilities, currentClubId]
  );

  const addons = useMemo(
    () => allAddons.filter((a) => a.clubId === currentClubId),
    [allAddons, currentClubId]
  );

  const handleAddNet = () => {
    if (!newNetName.trim()) { toast.error('Net name is required.'); return; }
    if (!currentClubId) return;
    addFacility({
      clubId: currentClubId,
      facilityType: 'cricket_net',
      name: newNetName.trim(),
      displayOrder: facilities.length,
      active: true,
    });
    setNewNetName('');
    setShowAddNet(false);
    toast.success(`${newNetName.trim()} added.`);
  };

  const handleAddAddon = () => {
    if (!newAddon.label.trim()) { toast.error('Add-on name is required.'); return; }
    if (!currentClubId) return;
    addAddon({
      clubId: currentClubId,
      addonType: 'bowling_machine',
      label: newAddon.label,
      inventoryCount: newAddon.count,
      priceMemberCents: newAddon.memberCents,
      priceNonmemberCents: newAddon.nonMemberCents,
      active: true,
    });
    setShowAddAddon(false);
    toast.success(`${newAddon.label} add-on created.`);
  };

  const openEditInventory = (addonId: string, currentCount: number) => {
    setEditingAddonId(addonId);
    setEditingInventoryCount(currentCount);
    setShowEditInventory(true);
  };

  const handleSaveInventory = () => {
    if (editingInventoryCount < 0) { toast.error('Count cannot be negative.'); return; }
    updateAddon(editingAddonId, { inventoryCount: editingInventoryCount });
    setShowEditInventory(false);
    toast.success('Inventory updated.');
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        {/* Cricket nets */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-[var(--nr-ink)]">Cricket Nets</h2>
              <p className="text-sm text-[var(--nr-muted)]">{facilities.length} net{facilities.length !== 1 ? 's' : ''} configured</p>
            </div>
            <Button
              size="sm"
              onClick={() => setShowAddNet(true)}
              className="bg-[var(--nr-green)] hover:bg-[var(--nr-green-dark)] text-background"
            >
              <Plus size={14} className="mr-1.5" />
              Add net
            </Button>
          </div>

          {facilities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-[var(--nr-border)] rounded-[var(--nr-radius-lg)]">
              <Target size={32} className="text-[var(--nr-border)] mb-3" />
              <p className="text-sm text-[var(--nr-muted)]">No nets configured. Add your first net to start taking bookings.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {facilities.map((fac) => (
                <div key={fac.id} className="flex items-center gap-4 p-4 bg-background border border-[var(--nr-border)] rounded-[var(--nr-radius-lg)]">
                  <div className="w-8 h-8 rounded bg-[var(--nr-green-faint)] flex items-center justify-center shrink-0">
                    <Target size={16} className="text-[var(--nr-green)]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[var(--nr-ink)]">{fac.name}</p>
                    <p className="text-xs text-[var(--nr-muted)] capitalize">{fac.facilityType.replace('_', ' ')}</p>
                  </div>
                  <Switch
                    checked={fac.active}
                    onChange={(val) => {
                      updateFacility(fac.id, { active: val });
                      toast.success(`${fac.name} ${val ? 'activated' : 'deactivated'}.`);
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      removeFacility(fac.id);
                      toast.success(`${fac.name} removed.`);
                    }}
                  >
                    <Trash size={14} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Add-ons */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-[var(--nr-ink)]">Add-ons</h2>
              <p className="text-sm text-[var(--nr-muted)]">Equipment customers can add to their booking</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => setShowAddAddon(true)}>
              <Plus size={14} className="mr-1.5" />
              Add equipment
            </Button>
          </div>

          {addons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-[var(--nr-border)] rounded-[var(--nr-radius-lg)]">
              <Package size={32} className="text-[var(--nr-border)] mb-3" />
              <p className="text-sm text-[var(--nr-muted)]">No add-ons configured. Add a bowling machine to let customers include equipment in their booking.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {addons.map((addon) => (
                <div key={addon.id} className="flex items-center gap-4 p-4 bg-background border border-[var(--nr-border)] rounded-[var(--nr-radius-lg)]">
                  <div className="w-8 h-8 rounded bg-[var(--nr-gold-light)] flex items-center justify-center shrink-0">
                    <Package size={16} className="text-[var(--nr-gold)]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[var(--nr-ink)]">{addon.label}</p>
                    <p className="text-xs text-[var(--nr-muted)]">
                      {addon.inventoryCount} unit{addon.inventoryCount !== 1 ? 's' : ''} ·
                      Member ${(addon.priceMemberCents / 100).toFixed(2)}/hr ·
                      Non-member ${(addon.priceNonmemberCents / 100).toFixed(2)}/hr
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditInventory(addon.id, addon.inventoryCount)}
                    >
                      Units: {addon.inventoryCount}
                    </Button>
                    <Switch
                      checked={addon.active}
                      onChange={(val) => {
                        updateAddon(addon.id, { active: val });
                        toast.success(`${addon.label} ${val ? 'enabled' : 'disabled'}.`);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Add net dialog */}
      <Dialog open={showAddNet} onOpenChange={setShowAddNet}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add cricket net</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Label className="text-sm font-medium text-[var(--nr-ink)]">Net name</Label>
            <Input
              value={newNetName}
              onChange={(e) => setNewNetName(e.target.value)}
              placeholder="Net 3"
              className="mt-1.5 h-10"
              onKeyDown={(e) => e.key === 'Enter' && handleAddNet()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddNet(false)}>Cancel</Button>
            <Button onClick={handleAddNet} className="bg-[var(--nr-green)] hover:bg-[var(--nr-green-dark)] text-background">
              Add net
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add addon dialog */}
      <Dialog open={showAddAddon} onOpenChange={setShowAddAddon}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add equipment add-on</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm font-medium text-[var(--nr-ink)]">Name</Label>
              <Input
                value={newAddon.label}
                onChange={(e) => setNewAddon((a) => ({ ...a, label: e.target.value }))}
                className="mt-1.5 h-10"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-[var(--nr-ink)]">Inventory count</Label>
              <Input
                type="number"
                min={1}
                value={newAddon.count}
                onChange={(e) => setNewAddon((a) => ({ ...a, count: parseInt(e.target.value || '1') }))}
                className="mt-1.5 h-10"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium text-[var(--nr-ink)]">Member $/hr</Label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nr-muted)] text-sm">$</span>
                  <Input
                    type="number"
                    value={newAddon.memberCents / 100}
                    onChange={(e) => setNewAddon((a) => ({ ...a, memberCents: Math.round(parseFloat(e.target.value || '0') * 100) }))}
                    className="pl-6 h-10"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-[var(--nr-ink)]">Non-member $/hr</Label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nr-muted)] text-sm">$</span>
                  <Input
                    type="number"
                    value={newAddon.nonMemberCents / 100}
                    onChange={(e) => setNewAddon((a) => ({ ...a, nonMemberCents: Math.round(parseFloat(e.target.value || '0') * 100) }))}
                    className="pl-6 h-10"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddAddon(false)}>Cancel</Button>
            <Button onClick={handleAddAddon} className="bg-[var(--nr-green)] hover:bg-[var(--nr-green-dark)] text-background">
              Add add-on
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit inventory dialog */}
      <Dialog open={showEditInventory} onOpenChange={setShowEditInventory}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Update inventory</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Label className="text-sm font-medium text-[var(--nr-ink)]">Number of units</Label>
            <Input
              type="number"
              min={0}
              value={editingInventoryCount}
              onChange={(e) => setEditingInventoryCount(parseInt(e.target.value || '0'))}
              className="mt-1.5 h-10"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditInventory(false)}>Cancel</Button>
            <Button onClick={handleSaveInventory} className="bg-[var(--nr-green)] hover:bg-[var(--nr-green-dark)] text-background">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
