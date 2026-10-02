import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ModerationRecord } from '@/types';
import { uid } from '@/utils/id';

interface SafetyState {
  records: ModerationRecord[];
  mutedUserIds: string[];
  blockedUserIds: string[];
  gentleNudgesAccepted: number;
  log: (record: Omit<ModerationRecord, 'id' | 'atISO'>) => ModerationRecord;
  mute: (userId: string, label: string) => void;
  unmute: (userId: string) => void;
  block: (userId: string, label: string) => void;
  unblock: (userId: string) => void;
  recordNudge: () => void;
  resolve: (id: string) => void;
  clear: () => void;
}

export const useSafety = create<SafetyState>()(
  persist(
    (set) => ({
      records: [],
      mutedUserIds: [],
      blockedUserIds: [],
      gentleNudgesAccepted: 0,
      log: (record) => {
        const full: ModerationRecord = { ...record, id: uid('mod'), atISO: new Date().toISOString() };
        set((s) => ({ records: [full, ...s.records] }));
        return full;
      },
      mute: (userId, label) => {
        set((s) => ({
          mutedUserIds: s.mutedUserIds.includes(userId) ? s.mutedUserIds : [...s.mutedUserIds, userId],
          records: [
            { id: uid('mod'), kind: 'mute', targetId: userId, targetLabel: label, atISO: new Date().toISOString(), note: 'Muted from your feed', resolved: true },
            ...s.records,
          ],
        }));
      },
      unmute: (userId) => set((s) => ({ mutedUserIds: s.mutedUserIds.filter((id) => id !== userId) })),
      block: (userId, label) => {
        set((s) => ({
          blockedUserIds: s.blockedUserIds.includes(userId) ? s.blockedUserIds : [...s.blockedUserIds, userId],
          records: [
            { id: uid('mod'), kind: 'block', targetId: userId, targetLabel: label, atISO: new Date().toISOString(), note: 'Blocked. You will not see their messages again.', resolved: true },
            ...s.records,
          ],
        }));
      },
      unblock: (userId) => set((s) => ({ blockedUserIds: s.blockedUserIds.filter((id) => id !== userId) })),
      recordNudge: () => set((s) => ({ gentleNudgesAccepted: s.gentleNudgesAccepted + 1 })),
      resolve: (id) => set((s) => ({ records: s.records.map((r) => (r.id === id ? { ...r, resolved: true } : r)) })),
      clear: () => set({ records: [], mutedUserIds: [], blockedUserIds: [], gentleNudgesAccepted: 0 }),
    }),
    { name: 'btc.safety' },
  ),
);

export function isHiddenAuthor(userId: string): boolean {
  const s = useSafety.getState();
  return s.mutedUserIds.includes(userId) || s.blockedUserIds.includes(userId);
}
