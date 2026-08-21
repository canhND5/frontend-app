import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  // Only serve to same-origin requests
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const host = request.headers.get('host') ?? '';

  const fromSameOrigin =
    (origin && new URL(origin).host === host) ||
    (referer && new URL(referer).host === host);

  if (origin && !fromSameOrigin) {
    return new Response('Forbidden', { status: 403 });
  }

  const key = process.env.AES_SECRET_KEY ?? '';
  if (!key) {
    return new Response('Not configured', { status: 503 });
  }

  return new Response(JSON.stringify({ key }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
};
