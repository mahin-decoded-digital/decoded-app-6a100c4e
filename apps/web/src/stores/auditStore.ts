import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuditLog, AuditAction } from '@/types';

interface AuditState {
  logs: AuditLog[];
  addLog: (entry: Omit<AuditLog, 'id' | 'at'>) => void;
  getLogsForClub: (clubId: string) => AuditLog[];
  getAllLogs: () => AuditLog[];
}

export const useAuditStore = create<AuditState>()(
  persist(
    (set, get) => ({
      logs: [],

      addLog: (entry) => {
        const log: AuditLog = {
          ...entry,
          id: `audit_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          at: new Date(),
        };
        set((s) => ({ logs: [log, ...s.logs].slice(0, 1000) }));
      },

      getLogsForClub: (clubId) => {
        return get().logs.filter((l) => l.clubId === clubId);
      },

      getAllLogs: () => {
        return get().logs;
      },
    }),
    { name: 'netreserve-audit' }
  )
);

export type { AuditAction };
