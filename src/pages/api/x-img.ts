import type { APIRoute } from 'astro'

const ALLOWED_HOSTS = new Set(['pbs.twimg.com', 'video.twimg.com', 'abs.twimg.com'])

export const GET: APIRoute = async ({ url, request }) => {
	const src = url.searchParams.get('src')
	if (!src) return new Response('Bad Request', { status: 400 })

	let mediaUrl: string
	try {
		const padded = src.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - src.length % 4) % 4)
		mediaUrl = atob(padded)
	} catch {
		return new Response('Bad Request', { status: 400 })
	}

	let parsed: URL
	try {
		parsed = new URL(mediaUrl)
	} catch {
		return new Response('Bad Request', { status: 400 })
	}

	if (parsed.protocol !== 'https:' || !ALLOWED_HOSTS.has(parsed.hostname)) {
		return new Response('Bad Request', { status: 400 })
	}

	const rangeHeader = request.headers.get('range')
	const upstreamInit: RequestInit = rangeHeader ? { headers: { Range: rangeHeader } } : {}

	let upstream: Response
	try {
		upstream = await fetch(mediaUrl, upstreamInit)
	} catch {
		return new Response('Bad Gateway', { status: 502 })
	}

	if (!upstream.ok && upstream.status !== 206) return new Response('Bad Gateway', { status: 502 })

	const headers: Record<string, string> = {
		'Content-Type': upstream.headers.get('content-type') ?? 'application/octet-stream',
		'Cache-Control': rangeHeader ? 'private, no-store' : 'public, max-age=86400, s-maxage=86400',
	}

	const contentLength = upstream.headers.get('content-length')
	const contentRange = upstream.headers.get('content-range')
	const acceptRanges = upstream.headers.get('accept-ranges')
	if (contentLength) headers['Content-Length'] = contentLength
	if (contentRange) headers['Content-Range'] = contentRange
	if (acceptRanges) headers['Accept-Ranges'] = acceptRanges

	return new Response(upstream.body, { status: upstream.status, headers })
}
