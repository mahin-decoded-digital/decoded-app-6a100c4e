import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OnboardingState, OperatingHours, SubscriptionPlan } from '@/types';

const DEFAULT_HOURS: OperatingHours[] = [
  { dayOfWeek: 0, openTime: '08:00', closeTime: '20:00', closed: false },
  { dayOfWeek: 1, openTime: '06:00', closeTime: '22:00', closed: false },
  { dayOfWeek: 2, openTime: '06:00', closeTime: '22:00', closed: false },
  { dayOfWeek: 3, openTime: '06:00', closeTime: '22:00', closed: false },
  { dayOfWeek: 4, openTime: '06:00', closeTime: '22:00', closed: false },
  { dayOfWeek: 5, openTime: '06:00', closeTime: '22:00', closed: false },
  { dayOfWeek: 6, openTime: '07:00', closeTime: '20:00', closed: false },
];

const INITIAL: OnboardingState = {
  step: 1,
  clubName: '',
  address: '',
  gstNumber: '',
  logoUrl: '',
  brandingColor: '#16a34a',
  heroPhotoUrl: '',
  facilityCount: 2,
  facilityNames: ['Net 1', 'Net 2'],
  operatingHours: DEFAULT_HOURS,
  memberRateCents: 2000,
  nonMemberRateCents: 3500,
  bowlingMachineEnabled: false,
  bowlingMachineCount: 1,
  bowlingMachineMemberCents: 1500,
  bowlingMachineNonMemberCents: 2500,
  cancellation24hPct: 100,
  cancellation12hPct: 50,
  cancellation0hPct: 0,
  bookingBufferHours: 1,
  maxAdvanceDays: 14,
  stripeConnected: false,
  selectedPlan: 'growth',
  completed: false,
};

interface OnboardingStore {
  state: OnboardingState;
  setStep: (step: number) => void;
  updateState: (updates: Partial<OnboardingState>) => void;
  nextStep: () => void;
  prevStep: () => void;
  setFacilityName: (index: number, name: string) => void;
  setFacilityCount: (count: number) => void;
  updateHours: (dayOfWeek: number, updates: Partial<OperatingHours>) => void;
  markStripeConnected: () => void;
  selectPlan: (plan: SubscriptionPlan) => void;
  complete: () => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      state: { ...INITIAL },

      setStep: (step) => set((s) => ({ state: { ...s.state, step } })),

      updateState: (updates) => set((s) => ({ state: { ...s.state, ...updates } })),

      nextStep: () =>
        set((s) => ({
          state: { ...s.state, step: Math.min(s.state.step + 1, 10) },
        })),

      prevStep: () =>
        set((s) => ({
          state: { ...s.state, step: Math.max(s.state.step - 1, 1) },
        })),

      setFacilityName: (index, name) => {
        const names = [...get().state.facilityNames];
        names[index] = name;
        set((s) => ({ state: { ...s.state, facilityNames: names } }));
      },

      setFacilityCount: (count) => {
        const clamped = Math.min(Math.max(count, 1), 20);
        const existing = get().state.facilityNames;
        const names = Array.from({ length: clamped }, (_, i) => existing[i] || `Net ${i + 1}`);
        set((s) => ({ state: { ...s.state, facilityCount: clamped, facilityNames: names } }));
      },

      updateHours: (dayOfWeek, updates) => {
        const hours = get().state.operatingHours.map((h) =>
          h.dayOfWeek === dayOfWeek ? { ...h, ...updates } : h
        );
        set((s) => ({ state: { ...s.state, operatingHours: hours } }));
      },

      markStripeConnected: () => set((s) => ({ state: { ...s.state, stripeConnected: true } })),

      selectPlan: (plan) => set((s) => ({ state: { ...s.state, selectedPlan: plan } })),

      complete: () => set((s) => ({ state: { ...s.state, completed: true } })),

      reset: () => set({ state: { ...INITIAL } }),
    }),
    { name: 'netreserve-onboarding' }
  )
);
