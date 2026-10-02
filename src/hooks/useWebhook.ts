import { useEffect, useRef } from 'react';
import type { WebhookEventType, WebhookPayloadMap } from '@/types';
import { onWebhook } from '@/webhooks/bus';

/**
 * Subscribe to an in-browser webhook event for the life of a component.
 * The handler is kept in a ref so re-renders never resubscribe.
 */
export function useWebhook<T extends WebhookEventType>(
  type: T,
  handler: (event: WebhookPayloadMap[T], meta: { id: string; atISO: string }) => void,
): void {
  const ref = useRef(handler);
  ref.current = handler;

  useEffect(
    () =>
      onWebhook(type, (event) => {
        ref.current(event.payload as WebhookPayloadMap[T], {
          id: event.id,
          atISO: event.deliveredAtISO ?? event.createdAtISO,
        });
      }),
    [type],
  );
}
