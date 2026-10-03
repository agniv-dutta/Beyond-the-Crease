import { create } from 'zustand';
import { usePrefs } from './prefs';

/**
 * Transient state for the pavilion gate transition.
 *
 * The gate is an overlay mounted once at the router level: clicking "Enter the
 * Pavilion" closes the doors over the landing page, swaps the route underneath
 * them, then opens them onto /today. Nothing is persisted here except the
 * visitor-level flags that live in prefs.
 */
export type GatePhase = 'idle' | 'closing' | 'opening';

interface LandingState {
  gatePhase: GatePhase;
  /** Closes the doors, remembers that the visitor stepped through, and applies the saved theme. */
  enterPavilion: () => void;
  /** Called by the gate once the doors are shut and the route has swapped. */
  beginGateOpening: () => void;
  /** Called by the gate once the doors are open again. */
  finishGate: () => void;
  /** Warms the /today chunk so the reveal never shows a blank screen. */
  preloadToday: () => void;
}

let todayWarmed = false;

export const useLanding = create<LandingState>((set, get) => ({
  gatePhase: 'idle',

  enterPavilion: () => {
    if (get().gatePhase !== 'idle') return;
    usePrefs.getState().setHasEntered(true);
    // The theme swap is deliberately deferred to beginGateOpening: switching
    // here would flip the still-visible landing page away from dusk before the
    // doors reach the middle of the screen.
    set({ gatePhase: 'closing' });
  },

  beginGateOpening: () => {
    // Doors are shut and the route has swapped — hand the surface back to the
    // visitor's saved theme. (The landing's own unmount does the same thing;
    // this covers the render that happens underneath the closed doors.)
    document.documentElement.setAttribute('data-theme', usePrefs.getState().theme);
    set({ gatePhase: 'opening' });
  },

  finishGate: () => set({ gatePhase: 'idle' }),

  preloadToday: () => {
    if (todayWarmed) return;
    todayWarmed = true;
    void import('@/pages/HomePage');
  },
}));
