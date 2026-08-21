import { getSourceCatalogEntry } from "@/data/source-catalog"

/** Default versioned data-source API base used by the demo. */
export const DEFAULT_PROXY_API_BASE = "https://data-source-api.workerproxy.workers.dev/v1"

/** Static dog image kept for small playful fallback moments in the demo. */
export const DOG_WALL_IMAGE = "https://images.dog.ceo/breeds/retriever-golden/n02099601_3004.jpg"

/**
 * Resolve the versioned API base URL, optionally honoring `PROXY_API_BASE`.
 * Reads the Worker runtime environment so the proxy host is never bundled into client JS.
 */
export function getProxyApiBase(): string {
	return process.env.PROXY_API_BASE || DEFAULT_PROXY_API_BASE
}

/**
 * Resolve the public worker root from the versioned API base.
 */
export function buildServiceUrl(): string {
	const base = new URL(getProxyApiBase())
	const pathname = base.pathname.replace(/\/+$/, "").replace(/\/v\d+$/, "") || "/"
	base.pathname = pathname.endsWith("/") ? pathname : `${pathname}/`
	base.search = ""
	base.hash = ""
	return base.toString()
}

/** Format an ISO date string for compact UI display. */
export function formatDateLabel(value?: string | null): string {
	if (!value) {
		return "Unknown date"
	}

	const date = new Date(value)
	const year = date.getFullYear() !== new Date().getFullYear() ? `${date.getFullYear()}年` : ''
	return `${year}${date.getMonth() + 1}月${date.getDate()}日`
}

/** Format a duration in seconds into `mm:ss` or `hh:mm:ss`. */
export function formatDurationLabel(value?: number | null): string {
	if (!value || value < 1) {
		return "Live"
	}

	const hours = Math.floor(value / 3600)
	const minutes = Math.floor((value % 3600) / 60)
	const seconds = value % 60
	const parts = [minutes, seconds].map((part) => `${part}`.padStart(2, "0"))

	if (hours > 0) {
		parts.unshift(`${hours}`.padStart(2, "0"))
	}

	return parts.join(":")
}

/** Encode a potentially slash-delimited id for a nested Astro catch-all route. */
export function encodeCatchallPath(value: string): string {
	return value
		.split("/")
		.filter(Boolean)
		.map((segment) => encodeURIComponent(segment))
		.join("/")
}

/** Build a generic content page href for the demo app. */
export function buildContentHref(
	source: string,
	sourceItemId: string,
	options?: { kind?: string; posterUrl?: string | null },
): string {
	const href = `/content/${source}/${encodeCatchallPath(sourceItemId)}`
	const params = new URLSearchParams()

	if (options?.kind) {
		params.set("kind", options.kind)
	}

	if (options?.posterUrl) {
		params.set("poster", options.posterUrl)
	}

	if (!params.size) {
		return href
	}

	return `${href}?${params.toString()}`
}

/** Build a generic source list page href. */
export function buildOriginListHref(
	source: string,
	listName: string,
	continuation?: string | null,
): string {
	const href = `/lists/${source}/${encodeCatchallPath(listName)}`
	const continuationParam = getSourceCatalogEntry(source)?.continuationParam

	if (!continuation || !continuationParam) {
		return href
	}

	return `${href}?${continuationParam}=${encodeURIComponent(continuation)}`
}

/** Build the featured GJW tag list page href. */
export function buildGjwTagListHref(tagId: string, collection = "videos"): string {
	return `/lists/gjw/tags/${encodeCatchallPath(tagId)}/${encodeURIComponent(collection)}`
}

/** Build the featured GJW channel list page href. */
export function buildGjwChannelListHref(
	channelId: string,
	collectionOrStartKey?: string | null,
	startKey?: string | null,
): string {
	const collection =
		collectionOrStartKey === "articles" || collectionOrStartKey === "videos"
			? collectionOrStartKey
			: "articles"
	const resolvedStartKey = collection === collectionOrStartKey ? startKey : collectionOrStartKey
	const href = `/lists/gjw/channels/${encodeCatchallPath(channelId)}/${encodeURIComponent(collection)}`
	if (!resolvedStartKey) {
		return href
	}

	return `${href}?startKey=${encodeURIComponent(resolvedStartKey)}`
}

/** Build a fully qualified versioned API URL for a path and query. */
export function buildApiUrl(
	pathname: string,
	query?: Record<string, string | number | null | undefined>,
): string {
	const url = new URL(pathname, `${getProxyApiBase().replace(/\/+$/, "")}/`)

	for (const [key, value] of Object.entries(query ?? {})) {
		if (value === undefined || value === null || value === "") {
			continue
		}

		url.searchParams.set(key, `${value}`)
	}

	return url.toString()
}
