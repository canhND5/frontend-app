import type { APIRoute } from 'astro';
import { fetchMediaManifest } from '@/lib/proxy-api';
import { decodeMediaResourceId } from '@/lib/media-resource';

const ALLOWED_SCHEMES = ['https:'];

function isValidVideoUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (!ALLOWED_SCHEMES.includes(u.protocol)) return false;
    const host = u.hostname;
    // Block localhost and private IP ranges
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1') return false;
    if (/^10\./.test(host) || /^192\.168\./.test(host) || /^172\.(1[6-9]|2\d|3[01])\./.test(host)) return false;
    return true;
  } catch {
    return false;
  }
}

export const GET: APIRoute = async ({ url, request }) => {
  // Only allow same-origin requests (browser fetch from this app)
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const host = request.headers.get('host') ?? '';
  const sameOrigin = (origin && new URL(origin).host === host) ||
                     (referer && new URL(referer).host === host);

  if (origin && !sameOrigin) {
    return new Response('Forbidden', { status: 403 });
  }

  const rid = url.searchParams.get('rid') ?? '';
  const fp = url.searchParams.get('fp') || 'anonymous';
  const token = process.env.API_AUTH_TOKEN ?? '';

  if (!rid) {
    return new Response('Missing resource id', { status: 400 });
  }

  let source: string;
  let videoUrl: string;

  try {
    const decoded = decodeMediaResourceId(rid);
    source = decoded.sourceItemId;
    videoUrl = decoded.url;
  } catch {
    return new Response('Invalid resource id', { status: 400 });
  }

  if (!isValidVideoUrl(videoUrl)) {
    return new Response('Invalid resource id', { status: 400 });
  }

  try {
    const result = await fetchMediaManifest(token, source, videoUrl, fp);
    return new Response(result.text, {
      headers: {
        'Content-Type': result.contentType ?? 'application/vnd.apple.mpegurl',
        'Cache-Control': 'no-cache, no-store',
      },
    });
  } catch {
    return new Response('Failed to fetch manifest', { status: 502 });
  }
};
