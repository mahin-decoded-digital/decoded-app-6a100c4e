import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ClubMember } from '@/types';

interface MemberState {
  members: ClubMember[];
  addMember: (clubId: string, userId: string) => void;
  removeMember: (clubId: string, userId: string) => void;
  isMember: (clubId: string, userId: string) => boolean;
  getMembersForClub: (clubId: string) => ClubMember[];
}

export const useMemberStore = create<MemberState>()(
  persist(
    (set, get) => ({
      members: [],

      addMember: (clubId, userId) => {
        const existing = get().members.find((m) => m.clubId === clubId && m.userId === userId);
        if (existing) return;
        set((s) => ({
          members: [...s.members, { clubId, userId, since: new Date() }],
        }));
      },

      removeMember: (clubId, userId) => {
        set((s) => ({
          members: s.members.filter((m) => !(m.clubId === clubId && m.userId === userId)),
        }));
      },

      isMember: (clubId, userId) => {
        return get().members.some((m) => m.clubId === clubId && m.userId === userId);
      },

      getMembersForClub: (clubId) => {
        return get().members.filter((m) => m.clubId === clubId);
      },
    }),
    { name: 'netreserve-members' }
  )
);
