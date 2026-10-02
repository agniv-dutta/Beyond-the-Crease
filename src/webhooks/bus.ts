import type { WebhookEvent, WebhookEventType, WebhookPayloadMap } from '@/types';
import { uid } from '@/utils/id';

/* ==========================================================================
   In-browser webhook bus.
   Events are emitted, "delivered" with a simulated latency, occasionally
   retried, and written to a ring buffer that the /dev console renders as a
   delivery log. Nothing leaves the page.
   ========================================================================== */

type Handler<T> = (event: WebhookEvent<T>) => void;

const listeners = new Map<WebhookEventType, Set<Handler<never>>>();
const logs: WebhookEvent[] = [];
const logListeners = new Set<() => void>();

const MAX_LOG = 200;

export function onWebhook<T extends WebhookEventType>(
  type: T,
  handler: Handler<WebhookPayloadMap[T]>,
): () => void {
  const set = listeners.get(type) ?? new Set<Handler<never>>();
  set.add(handler as Handler<never>);
  listeners.set(type, set);
  return () => {
    set.delete(handler as Handler<never>);
  };
}

export function onWebhookLog(listener: () => void): () => void {
  logListeners.add(listener);
  return () => {
    logListeners.delete(listener);
  };
}

function notifyLog(): void {
  for (const l of logListeners) l();
}

export function getWebhookLog(filter?: WebhookEventType): WebhookEvent[] {
  return filter ? logs.filter((e) => e.type === filter) : [...logs];
}

export function clearWebhookLog(): void {
  logs.length = 0;
  notifyLog();
}

export interface EmitOptions {
  source?: WebhookEvent['source'];
  /** 0–1; the event fails after retries and is logged as failed. */
  failRate?: number;
  /** Delivery latency in ms (simulated network). */
  latency?: number;
  retries?: number;
}

export function emitWebhook<T extends WebhookEventType>(
  type: T,
  payload: WebhookPayloadMap[T],
  options: EmitOptions = {},
): WebhookEvent<WebhookPayloadMap[T]> {
  const { source = 'manual', failRate = 0.12, latency = 260, retries = 2 } = options;

  const event: WebhookEvent<WebhookPayloadMap[T]> = {
    id: uid('wh'),
    type,
    payload,
    createdAtISO: new Date().toISOString(),
    status: 'queued',
    attempt: 0,
    source,
  };

  logs.unshift(event);
  if (logs.length > MAX_LOG) logs.length = MAX_LOG;

  const willFail = Math.random() < failRate;
  const maxAttempts = willFail ? retries : 1;
  let attempt = 0;

  const deliver = () => {
    attempt += 1;
    event.attempt = attempt;
    event.status = attempt < maxAttempts ? 'retrying' : willFail ? 'failed' : 'delivered';
    event.durationMs = latency + Math.round(Math.random() * 180);
    event.responseCode = willFail && attempt === maxAttempts ? 500 : 200;
    if (!willFail || attempt === maxAttempts) {
      event.deliveredAtISO = new Date().toISOString();
    }
    notifyLog();

    if (event.status === 'delivered') {
      const set = listeners.get(type);
      if (set) for (const handler of set) handler(event as WebhookEvent<never>);
    } else if (event.status === 'retrying') {
      setTimeout(deliver, 420);
    }
  };

  setTimeout(deliver, latency);
  notifyLog();
  return event;
}

/* ---------------------------------------------------------------- simulation */

let simulationTimer: number | null = null;
let currentSource: (() => void) | null = null;

export interface SimulationConfig {
  /** Milliseconds between simulated match moments. */
  momentIntervalMs: number;
  circleIntervalMs: number;
  storyIntervalMs: number;
  enabled: boolean;
}

export const DEFAULT_SIMULATION: SimulationConfig = {
  momentIntervalMs: 9_000,
  circleIntervalMs: 16_000,
  storyIntervalMs: 31_000,
  enabled: true,
};

/**
 * Start emitting simulated events. `pick` supplies fresh content each tick so
 * the simulation is driven by the caller (the app wires it to live matches).
 */
export function startSimulation(
  config: SimulationConfig,
  pick: () => {
    moment?: { type: 'match.moment'; payload: WebhookPayloadMap['match.moment'] };
    circle?: { type: 'circle.message'; payload: WebhookPayloadMap['circle.message'] };
    story?: { type: 'story.published'; payload: WebhookPayloadMap['story.published'] };
    milestone?: { type: 'milestone.reached'; payload: WebhookPayloadMap['milestone.reached'] };
  },
): () => void {
  stopSimulation();
  if (!config.enabled) return () => undefined;

  simulationTimer = window.setInterval(() => {
    const next = pick();
    if (next.moment) emitWebhook(next.moment.type, next.moment.payload, { source: 'live-simulation' });
    if (next.circle) emitWebhook(next.circle.type, next.circle.payload, { source: 'live-simulation' });
    if (next.story) emitWebhook(next.story.type, next.story.payload, { source: 'live-simulation' });
    if (next.milestone)
      emitWebhook(next.milestone.type, next.milestone.payload, { source: 'live-simulation' });
  }, config.momentIntervalMs);

  return stopSimulation;
}

export function stopSimulation(): void {
  if (simulationTimer !== null) {
    clearInterval(simulationTimer);
    simulationTimer = null;
  }
  currentSource?.();
  currentSource = null;
}

export function setSimulationSource(fn: () => () => void): void {
  currentSource?.();
  currentSource = fn;
}

export function isSimulationRunning(): boolean {
  return simulationTimer !== null;
}
