import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Club, Facility, Addon, ClubSettings, OperatingHours, SubscriptionPlan } from '@/types';

const DEFAULT_HOURS: OperatingHours[] = [
  { dayOfWeek: 0, openTime: '08:00', closeTime: '20:00', closed: false },
  { dayOfWeek: 1, openTime: '06:00', closeTime: '22:00', closed: false },
  { dayOfWeek: 2, openTime: '06:00', closeTime: '22:00', closed: false },
  { dayOfWeek: 3, openTime: '06:00', closeTime: '22:00', closed: false },
  { dayOfWeek: 4, openTime: '06:00', closeTime: '22:00', closed: false },
  { dayOfWeek: 5, openTime: '06:00', closeTime: '22:00', closed: false },
  { dayOfWeek: 6, openTime: '07:00', closeTime: '20:00', closed: false },
];

const DEFAULT_SETTINGS: ClubSettings = {
  operatingHours: DEFAULT_HOURS,
  bookingBufferHours: 1,
  maxAdvanceDays: 14,
  cancellation24hRefundPct: 100,
  cancellation12hRefundPct: 50,
  cancellation0hRefundPct: 0,
  memberNetRateCents: 2000,
  nonMemberNetRateCents: 3500,
  notifyManagerEmail: true,
  notifyManagerSms: false,
};

interface ClubState {
  clubs: Club[];
  facilities: Facility[];
  addons: Addon[];
  clubSettings: Record<string, ClubSettings>;
  currentClubId: string | null;

  createClub: (club: Omit<Club, 'id' | 'createdAt'>) => Club;
  updateClub: (clubId: string, updates: Partial<Club>) => void;
  setCurrentClub: (clubId: string | null) => void;
  getClubBySlug: (slug: string) => Club | undefined;

  addFacility: (facility: Omit<Facility, 'id' | 'createdAt'>) => Facility;
  updateFacility: (facilityId: string, updates: Partial<Facility>) => void;
  removeFacility: (facilityId: string) => void;

  addAddon: (addon: Omit<Addon, 'id' | 'createdAt'>) => Addon;
  updateAddon: (addonId: string, updates: Partial<Addon>) => void;
  removeAddon: (addonId: string) => void;

  updateClubSettings: (clubId: string, settings: Partial<ClubSettings>) => void;
  getClubSettings: (clubId: string) => ClubSettings;

  upgradePlan: (clubId: string, plan: SubscriptionPlan) => void;
}

export const useClubStore = create<ClubState>()(
  persist(
    (set, get) => ({
      clubs: [],
      facilities: [],
      addons: [],
      clubSettings: {},
      currentClubId: null,

      createClub: (clubData) => {
        const club: Club = {
          ...clubData,
          id: `club_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          createdAt: new Date(),
        };
        set((s) => ({
          clubs: [...s.clubs, club],
          clubSettings: {
            ...s.clubSettings,
            [club.id]: DEFAULT_SETTINGS,
          },
        }));
        return club;
      },

      updateClub: (clubId, updates) => {
        set((s) => ({
          clubs: s.clubs.map((c) => (c.id === clubId ? { ...c, ...updates } : c)),
        }));
      },

      setCurrentClub: (clubId) => {
        set({ currentClubId: clubId });
      },

      getClubBySlug: (slug) => {
        return get().clubs.find((c) => c.slug === slug);
      },

      addFacility: (facilityData) => {
        const facility: Facility = {
          ...facilityData,
          id: `fac_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          createdAt: new Date(),
        };
        set((s) => ({ facilities: [...s.facilities, facility] }));
        return facility;
      },

      updateFacility: (facilityId, updates) => {
        set((s) => ({
          facilities: s.facilities.map((f) => (f.id === facilityId ? { ...f, ...updates } : f)),
        }));
      },

      removeFacility: (facilityId) => {
        set((s) => ({
          facilities: s.facilities.filter((f) => f.id !== facilityId),
        }));
      },

      addAddon: (addonData) => {
        const addon: Addon = {
          ...addonData,
          id: `addon_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          createdAt: new Date(),
        };
        set((s) => ({ addons: [...s.addons, addon] }));
        return addon;
      },

      updateAddon: (addonId, updates) => {
        set((s) => ({
          addons: s.addons.map((a) => (a.id === addonId ? { ...a, ...updates } : a)),
        }));
      },

      removeAddon: (addonId) => {
        set((s) => ({
          addons: s.addons.filter((a) => a.id !== addonId),
        }));
      },

      updateClubSettings: (clubId, settings) => {
        set((s) => ({
          clubSettings: {
            ...s.clubSettings,
            [clubId]: {
              ...(s.clubSettings[clubId] || DEFAULT_SETTINGS),
              ...settings,
            },
          },
        }));
      },

      getClubSettings: (clubId) => {
        return get().clubSettings[clubId] || DEFAULT_SETTINGS;
      },

      upgradePlan: (clubId, plan) => {
        set((s) => ({
          clubs: s.clubs.map((c) => (c.id === clubId ? { ...c, planId: plan } : c)),
        }));
      },
    }),
    { name: 'netreserve-clubs' }
  )
);
