import { http, HttpResponse } from 'msw';
import { ApiError, ROUTES } from '@/api/resolvers';

/* ==========================================================================
   MSW handlers, generated from the resolver table so the HTTP surface and the
   in-process fallback can never drift apart.
   ========================================================================== */

export const handlers = ROUTES.map((route) => {
  // "/api/match/:id" -> "/api/match/:id" (MSW supports :param in path strings)
  const path = route.path.replace('/api', '*/api') as `/${string}`;

  return http.all(path, async ({ request, params }) => {
    try {
      // http.all matches any verb, so GET-only routes must reject writes
      // explicitly or a POST would fall through to a GET resolver.
      if (request.method !== route.method) {
        return HttpResponse.json(
          { error: `Method ${request.method} not allowed on ${route.path}` },
          { status: 405, headers: { Allow: route.method } },
        );
      }

      const url = new URL(request.url);
      const body =
        route.method === 'POST'
          ? ((await request.clone().json().catch(() => ({}))) as Record<string, unknown>)
          : undefined;

      const resolvedParams: Record<string, string> = {};
      for (const key of route.keys) {
        const value = (params as Record<string, string | string[] | undefined>)[key];
        if (typeof value === 'string') resolvedParams[key] = decodeURIComponent(value);
      }

      const payload = route.handler({ params: resolvedParams, query: url.searchParams, body });
      return HttpResponse.json(payload as never);
    } catch (error) {
      if (error instanceof ApiError) {
        return HttpResponse.json({ error: error.message }, { status: error.status });
      }
      return HttpResponse.json(
        { error: error instanceof Error ? error.message : 'Unknown resolver failure' },
        { status: 500 },
      );
    }
  });
});
