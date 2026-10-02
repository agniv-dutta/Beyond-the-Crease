import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GeneratedStory, StudioDraft, Tone, StoryFormat } from '@/types';
import { uid } from '@/utils/id';

interface StudioState {
  drafts: StudioDraft[];
  tone: Tone;
  format: StoryFormat;
  length: number;
  publishResult: GeneratedStory | null;
  addDraft: (draft: Omit<StudioDraft, 'id' | 'createdAtISO' | 'updatedAtISO'>) => string;
  updateDraft: (id: string, patch: Partial<StudioDraft>) => void;
  removeDraft: (id: string) => void;
  markPublished: (id: string) => void;
  clearPublished: () => void;
  setTone: (tone: Tone) => void;
  setFormat: (format: StoryFormat) => void;
  setLength: (length: number) => void;
  clearAll: () => void;
}

export const useStudio = create<StudioState>()(
  persist(
    (set, get) => ({
      drafts: [],
      tone: 'cinematic',
      format: 'headline',
      length: 55,
      publishResult: null,
      addDraft: (draft) => {
        const now = new Date().toISOString();
        const id = uid('draft');
        set((s) => ({
          drafts: [
            { ...draft, id, createdAtISO: now, updatedAtISO: now },
            ...s.drafts,
          ],
        }));
        return id;
      },
      updateDraft: (id, patch) =>
        set((s) => ({
          drafts: s.drafts.map((d) =>
            d.id === id ? { ...d, ...patch, updatedAtISO: new Date().toISOString() } : d,
          ),
        })),
      removeDraft: (id) => set((s) => ({ drafts: s.drafts.filter((d) => d.id !== id) })),
      markPublished: (id) =>
        set((s) => ({ drafts: s.drafts.map((d) => (d.id === id ? { ...d, published: true } : d)) })),
      clearPublished: () => set({ publishResult: null }),
      setTone: (tone) => set({ tone }),
      setFormat: (format) => set({ format }),
      setLength: (length) => set({ length }),
      clearAll: () =>
        set({ drafts: [], publishResult: null, tone: get().tone, format: get().format }),
    }),
    { name: 'btc.studio' },
  ),
);
