import type { APIRoute } from 'astro'
import { buildApiUrl } from '@/lib/proxy-utils'

const ALLOWED_SOURCES = new Set(['djy', 'gjw', 'kzg', 'mhw', 'ntd', 'rmb', 'rfa', 'soh', 'yah', 'zjw'])

function isValidImageUrl(raw: string): boolean {
	try {
		const u = new URL(raw)
		if (u.protocol !== 'https:') return false
		const h = u.hostname
		if (
			h === 'localhost' ||
			/^127\./.test(h) ||
			/^10\./.test(h) ||
			/^192\.168\./.test(h) ||
			/^172\.(1[6-9]|2\d|3[01])\./.test(h)
		) return false
		return true
	} catch {
		return false
	}
}

export const GET: APIRoute = async ({ url }) => {
	const src = url.searchParams.get('src')
	const source = url.searchParams.get('s')

	if (!src || !source || !ALLOWED_SOURCES.has(source)) {
		return new Response('Bad Request', { status: 400 })
	}

	let imageUrl: string
	try {
		const padded = src.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - src.length % 4) % 4)
		imageUrl = atob(padded)
	} catch {
		return new Response('Bad Request', { status: 400 })
	}

	if (!isValidImageUrl(imageUrl)) {
		return new Response('Bad Request', { status: 400 })
	}

	const token = process.env.API_AUTH_TOKEN ?? ''
	const requestUrl = buildApiUrl('media/proxy')

	let upstream: Response
	try {
		upstream = await fetch(requestUrl, {
			method: 'POST',
			body: JSON.stringify({ source, url: imageUrl, userFingerprint: btoa('server') }),
			headers: {
				accept: '*/*',
				authorization: `Bearer ${token}`,
				'content-type': 'application/json',
			},
		})
	} catch {
		return new Response('Bad Gateway', { status: 502 })
	}

	if (!upstream.ok) {
		return new Response('Bad Gateway', { status: 502 })
	}

	return new Response(upstream.body, {
		headers: {
			'Content-Type': upstream.headers.get('content-type') ?? 'image/jpeg',
			'Cache-Control': 'public, max-age=86400, s-maxage=86400',
		},
	})
}
