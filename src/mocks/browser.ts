import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

export async function startMockServiceWorker(): Promise<void> {
  try {
    await worker.start({
      quiet: true,
      onUnhandledRequest: 'bypass',
      serviceWorker: { url: '/mockServiceWorker.js' },
    });
  } catch {
    // No service worker (e.g. file:// preview). The api client falls back to
    // running the same resolvers in-process.
  }
}
