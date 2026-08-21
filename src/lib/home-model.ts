import {
	featuredGjwArticleChannelId,
	featuredGjwTagId,
	featuredGjwVideoChannelId,
	getDefaultListName,
	sourceCatalog,
} from "@/data/source-catalog"
import {
	fetchFallbackArticleList,
	fetchFallbackTags,
	fetchFallbackVideoList,
} from "@/lib/fallback-api"
import {
	fetchGjwChannelArticles,
	fetchGjwChannelVideos,
	fetchGjwTagArticles,
	fetchGjwTagVideos,
	fetchGjwTags,
	fetchOriginList,
	fetchProxyRoot,
	type ProxyListResponse,
	type ProxyTagResponse,
} from "@/lib/proxy-api"
import { loadWithFallback } from "@/lib/provider-mode"
import type { AuthSession } from "@/lib/auth"

/** Homepage service status model. */
export interface HomeServiceModel {
	mode: "real" | "fallback"
	publicProbeUrl: string
	publicVersion: string | null
	sessionName: string
	tokenProbeError: string | null
	tokenProbeUrl: string | null
	tokenProbeVersion: string | null
}

/** Homepage GJW showcase model. */
export interface HomeGjwModel {
	channelArticles: ProxyListResponse
	channelVideos: ProxyListResponse
	errorMessage: string | null
	mode: "real" | "fallback"
	requestedMode: "real" | "fallback"
	tagArticles: ProxyListResponse
	tagCatalog: ProxyTagResponse
	tagVideos: ProxyListResponse
}

/** One source preview block shown on the homepage. */
export interface HomeSourcePreview {
	description: string
	errorMessage: string | null
	listName: string
	mode: "real" | "fallback"
	name: string
	requestedMode: "real" | "fallback"
	response: ProxyListResponse
	sourceId: string
}

/**
 * Convert an unknown error into a compact display string.
 */
function getErrorMessage(error: Error | null): string | null {
	return error?.message ?? null
}

/**
 * Load the homepage service-status block.
 */
export async function loadHomeServiceModel(session?: AuthSession): Promise<HomeServiceModel> {
	const root = await fetchProxyRoot()
	let tokenProbeUrl: string | null = null
	let tokenProbeVersion: string | null = null
	let tokenProbeError: string | null = null

	if (session?.token) {
		try {
			const version = await fetchProxyRoot({ fetchImpl: undefined })
			tokenProbeUrl = version.url
			tokenProbeVersion = version.data.version
		} catch (error) {
			tokenProbeError = error instanceof Error ? error.message : "Unable to verify the bearer token"
		}
	}

	return {
		mode: session?.token ? "real" : "fallback",
		publicProbeUrl: root.url,
		publicVersion: root.data.version,
		sessionName: session?.name ?? "Visitor",
		tokenProbeError,
		tokenProbeUrl,
		tokenProbeVersion,
	}
}

/**
 * Load the homepage GJW showcase block.
 */
export async function loadHomeGjwModel(session?: AuthSession): Promise<HomeGjwModel> {
	const result = await loadWithFallback(
		session,
		async (token) => {
			const [tagCatalog, tagVideos, tagArticles, channelVideos, channelArticles] =
				await Promise.all([
					fetchGjwTags(token),
					fetchGjwTagVideos(token, featuredGjwTagId, { pageSize: 6 }),
					fetchGjwTagArticles(token, featuredGjwTagId, { pageSize: 6 }),
					fetchGjwChannelVideos(token, featuredGjwVideoChannelId, { pageSize: 6 }),
					fetchGjwChannelArticles(token, featuredGjwArticleChannelId, { pageSize: 6 }),
				])

			return {
				channelArticles: channelArticles.data,
				channelVideos: channelVideos.data,
				tagArticles: tagArticles.data,
				tagCatalog: tagCatalog.data,
				tagVideos: tagVideos.data,
			}
		},
		async () => {
			const [tagCatalog, tagVideos, tagArticles, channelVideos, channelArticles] =
				await Promise.all([
					fetchFallbackTags(),
					fetchFallbackVideoList("gjw", featuredGjwTagId, { limit: 6 }),
					fetchFallbackArticleList("gjw", featuredGjwTagId, { limit: 6 }),
					fetchFallbackVideoList("gjw", featuredGjwVideoChannelId, { limit: 6 }),
					fetchFallbackArticleList("gjw", featuredGjwArticleChannelId, { limit: 6 }),
				])

			return {
				channelArticles,
				channelVideos,
				tagArticles,
				tagCatalog,
				tagVideos,
			}
		},
	)

	return {
		...result.data,
		errorMessage: getErrorMessage(result.error),
		mode: result.mode,
		requestedMode: result.requestedMode,
	}
}

/**
 * Load homepage preview cards for every generic source family.
 */
export async function loadHomeSourcePreviews(session?: AuthSession): Promise<HomeSourcePreview[]> {
	return Promise.all(
		sourceCatalog.map(async (source) => {
			const listName = getDefaultListName(source.id) ?? source.lists[0]
			const continuation = source.continuationParam === "page" ? "1" : "0"
			const result = await loadWithFallback(
				session,
				async (token) =>
					(
						await fetchOriginList(token, source.id, listName, {
							cursor: source.continuationParam === "cursor" ? continuation : null,
							page: source.continuationParam === "page" ? continuation : null,
							pageSize: 3,
						})
					).data,
				async () => fetchFallbackArticleList(source.id, listName, { limit: 3 }),
			)

			return {
				description: source.description,
				errorMessage: getErrorMessage(result.error),
				listName,
				mode: result.mode,
				name: source.name,
				requestedMode: result.requestedMode,
				response: result.data,
				sourceId: source.id,
			}
		}),
	)
}
