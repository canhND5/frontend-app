import { fetchFallbackVideoList } from "@/lib/fallback-api"

/** Minimal fallback media payload rendered when authenticated media inspection is unavailable. */
export interface FallbackMediaCard {
	linkUrl: string | null
	summary: string | null
	title: string
}

/** Dependencies used to load one random fallback media card. */
export interface FallbackMediaDeps {
	fetchFallbackVideoList?: typeof fetchFallbackVideoList
	random?: () => number
}

/**
 * Load one random public video-style card for unauthenticated media inspection fallback.
 */
export async function loadRandomFallbackMedia(
	deps?: FallbackMediaDeps,
): Promise<FallbackMediaCard | null> {
	const response = await (deps?.fetchFallbackVideoList ?? fetchFallbackVideoList)(
		"public",
		"Public media fallback",
		{ limit: 8, offset: 0 },
	)

	if (!response.items.length) {
		return null
	}

	const random = deps?.random ?? Math.random
	const index = Math.min(response.items.length - 1, Math.floor(random() * response.items.length))
	const item = response.items[index]

	if (!item) {
		return null
	}

	return {
		linkUrl: item.canonicalUrl ?? null,
		summary: item.summary ?? null,
		title: item.title,
	}
}
