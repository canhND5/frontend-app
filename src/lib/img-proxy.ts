const PROXY_SOURCES = new Set(['djy', 'gjw', 'kzg', 'mhw', 'ntd', 'rmb', 'rfa', 'soh', 'yah', 'zjw'])
const X_CDN_HOSTS = new Set(['pbs.twimg.com', 'video.twimg.com', 'abs.twimg.com'])

export function proxyXImageUrl(url: string | null | undefined): string | null {
	if (!url) return null
	try {
		if (!X_CDN_HOSTS.has(new URL(url).hostname)) return url
		const b64 = btoa(url).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
		return `/api/x-img?src=${b64}`
	} catch {
		return url
	}
}

export function proxyImageUrl(url: string | null | undefined, source: string | null | undefined): string | null {
	if (!url) return null
	if (!source || !PROXY_SOURCES.has(source)) return url
	try {
		const b64 = btoa(url).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
		return `/api/img?src=${b64}&s=${encodeURIComponent(source)}`
	} catch {
		return url
	}
}
