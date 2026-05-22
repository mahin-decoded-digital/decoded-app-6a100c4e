import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Booking, BookingStatus } from '@/types';

// Safe date coercion — handles both Date objects and ISO strings from localStorage
function toDate(val: Date | string): Date {
  return val instanceof Date ? val : new Date(val);
}

interface BookingState {
  bookings: Booking[];

  createBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => { ok: boolean; booking?: Booking; error?: string };
  updateBooking: (bookingId: string, updates: Partial<Booking>) => void;
  cancelBooking: (bookingId: string, canceledBy: 'customer' | 'manager') => { ok: boolean; refundCents?: number; error?: string };
  blockSlot: (booking: Omit<Booking, 'id' | 'createdAt'>) => Booking;
  getBookingsForClub: (clubId: string) => Booking[];
  getBookingsForFacility: (facilityId: string, date: Date) => Booking[];
  getBookingsForUser: (userId: string) => Booking[];
  hasConflict: (facilityId: string, startAt: Date, endAt: Date, excludeId?: string) => boolean;
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      bookings: [],

      createBooking: (bookingData) => {
        const { facilityId, startAt, endAt } = bookingData;
        const conflict = get().hasConflict(facilityId, startAt, endAt);
        if (conflict) {
          return { ok: false, error: 'This slot is no longer available. Please choose a different time.' };
        }
        const booking: Booking = {
          ...bookingData,
          id: `bkg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          createdAt: new Date(),
        };
        set((s) => ({ bookings: [...s.bookings, booking] }));
        return { ok: true, booking };
      },

      updateBooking: (bookingId, updates) => {
        set((s) => ({
          bookings: s.bookings.map((b) => (b.id === bookingId ? { ...b, ...updates } : b)),
        }));
      },

      cancelBooking: (bookingId, canceledBy) => {
        const booking = get().bookings.find((b) => b.id === bookingId);
        if (!booking) return { ok: false, error: 'Booking not found.' };
        if (booking.status === 'canceled') return { ok: false, error: 'Booking is already canceled.' };

        const now = new Date();
        const startDate = toDate(booking.startAt);
        const hoursUntil = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60);

        let refundPct = 0;
        if (canceledBy === 'manager') {
          refundPct = 100;
        } else if (hoursUntil >= 24) {
          refundPct = 100;
        } else if (hoursUntil >= 12) {
          refundPct = 50;
        } else {
          refundPct = 0;
        }

        const refundCents = Math.floor((booking.totalCents * refundPct) / 100);

        set((s) => ({
          bookings: s.bookings.map((b) =>
            b.id === bookingId ? { ...b, status: 'canceled' as BookingStatus } : b
          ),
        }));

        return { ok: true, refundCents };
      },

      blockSlot: (blockData) => {
        const block: Booking = {
          ...blockData,
          id: `blk_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          type: 'block',
          status: 'blocked',
          createdAt: new Date(),
        };
        set((s) => ({ bookings: [...s.bookings, block] }));
        return block;
      },

      getBookingsForClub: (clubId) => {
        return get().bookings.filter((b) => b.clubId === clubId);
      },

      getBookingsForFacility: (facilityId, date) => {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);
        return get().bookings.filter((b) => {
          const startAt = toDate(b.startAt);
          return (
            b.facilityId === facilityId &&
            startAt >= dayStart &&
            startAt <= dayEnd &&
            (b.status === 'confirmed' || b.status === 'pending' || b.status === 'blocked')
          );
        });
      },

      getBookingsForUser: (userId) => {
        return get().bookings.filter((b) => b.userId === userId);
      },

      hasConflict: (facilityId, startAt, endAt, excludeId) => {
        return get().bookings.some((b) => {
          if (b.facilityId !== facilityId) return false;
          if (b.id === excludeId) return false;
          if (b.status !== 'pending' && b.status !== 'confirmed' && b.status !== 'blocked') return false;
          const bStart = toDate(b.startAt);
          const bEnd = toDate(b.endAt);
          return bStart < endAt && bEnd > startAt;
        });
      },
    }),
    { name: 'netreserve-bookings' }
  )
);
