import { useEffect, useRef, useState } from 'react';
import { startSimulation, stopSimulation, isSimulationRunning } from '@/webhooks/bus';
import type { WebhookPayloadMap } from '@/types';

export type SimulationPick = Partial<{
  moment: { type: 'match.moment'; payload: WebhookPayloadMap['match.moment'] };
  circle: { type: 'circle.message'; payload: WebhookPayloadMap['circle.message'] };
  story: { type: 'story.published'; payload: WebhookPayloadMap['story.published'] };
  milestone: { type: 'milestone.reached'; payload: WebhookPayloadMap['milestone.reached'] };
}>;

/** The demo simulation cadence. Short enough to see something happen, long enough to read. */
export const TICKER_SIMULATION = {
  momentIntervalMs: 11_000,
  circleIntervalMs: 17_000,
  storyIntervalMs: 29_000,
  enabled: true,
} as const;

/**
 * Drives the in-browser webhook simulation. The picker closure is supplied by
 * the caller so the ticker can read the currently selected sport and live
 * matches without this hook knowing anything about the data layer.
 */
export function useLiveSimulation(pick: () => SimulationPick | null, enabled = true) {
  const pickRef = useRef(pick);
  pickRef.current = pick;

  const [running, setRunning] = useState(false);

  const launch = () => {
    return startSimulation(TICKER_SIMULATION, () => pickRef.current() ?? {});
  };

  useEffect(() => {
    if (!enabled) {
      stopSimulation();
      setRunning(false);
      return;
    }
    const stop = launch();
    setRunning(true);
    return () => {
      stop();
      setRunning(false);
    };
  }, [enabled]);

  return {
    running,
    toggle: () => {
      if (isSimulationRunning()) {
        stopSimulation();
        setRunning(false);
        return;
      }
      launch();
      setRunning(true);
    },
  };
}