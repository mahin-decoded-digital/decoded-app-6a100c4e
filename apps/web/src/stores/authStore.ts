import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '@/types';

interface AuthState {
  users: User[];
  currentUser: User | null;
  register: (email: string, name: string, phone: string, role?: UserRole) => { ok: boolean; error?: string };
  login: (email: string) => { ok: boolean; error?: string };
  logout: () => void;
  updateCurrentUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: [],
      currentUser: null,

      register: (email, name, phone, role = 'club_manager') => {
        const existing = get().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (existing) {
          return { ok: false, error: 'An account with this email already exists.' };
        }
        const newUser: User = {
          id: `user_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          email,
          name,
          phone,
          role,
          stripeCustomerId: '',
          createdAt: new Date(),
        };
        set((s) => ({ users: [...s.users, newUser], currentUser: newUser }));
        return { ok: true };
      },

      login: (email) => {
        const user = get().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (!user) {
          return { ok: false, error: 'No account found with this email address.' };
        }
        set({ currentUser: user });
        return { ok: true };
      },

      logout: () => {
        set({ currentUser: null });
      },

      updateCurrentUser: (updates) => {
        const current = get().currentUser;
        if (!current) return;
        const updated = { ...current, ...updates };
        set((s) => ({
          currentUser: updated,
          users: s.users.map((u) => (u.id === updated.id ? updated : u)),
        }));
      },
    }),
    { name: 'netreserve-auth' }
  )
);
