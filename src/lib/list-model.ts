import { getSourceCatalogEntry } from "@/data/source-catalog"
import { fetchFallbackArticleList, fetchFallbackVideoList } from "@/lib/fallback-api"
import {
	fetchGjwChannelArticles,
	fetchGjwChannelVideos,
	fetchGjwTagCollection,
	fetchOriginList,
	type ProxyListResponse,
} from "@/lib/proxy-api"
import { loadWithFallback } from "@/lib/provider-mode"
import { buildApiUrl } from "@/lib/proxy-utils"
import { buildGjwChannelListHref, buildOriginListHref } from "@/lib/proxy-utils"
import type { AuthSession } from "@/lib/auth"

/** Server model for one list partial. */
export interface ListPageModel {
	description: string
	errorMessage: string | null
	isNotFound: boolean
	items: ProxyListResponse["items"]
	nextHref: string | null
	pageTitle: string
	requestUrl: string | null
	renderVideos: boolean
	sectionLabel: string
	upstreamListUrl: string | null
}

/**
 * Convert a page or cursor input into a numeric fallback offset.
 */
function getFallbackOffset(value?: string | null, pageSize = 20): number {
	if (!value) {
		return 0
	}

	const numeric = Number.parseInt(value, 10)
	return Number.isNaN(numeric) ? 0 : Math.max(0, numeric - 1) * pageSize
}

/**
 * Convert an unknown error into a compact display string.
 */
function getErrorMessage(error: Error | null): string | null {
	return error?.message ?? null
}

/**
 * Load the list-page model for one route.
 */
export async function loadListPageModel(
	session: AuthSession | undefined,
	source: string,
	slug: string[],
	searchParams: URLSearchParams,
): Promise<ListPageModel> {
	if (
		source === "gjw" &&
		slug[0] === "tags" &&
		slug[1] &&
		(slug[2] === "videos" || slug[2] === "articles")
	) {
		const tagId = slug[1]
		const collection = slug[2] as "articles" | "videos"
		const result = await loadWithFallback(
			session,
			async (token) =>
				(await fetchGjwTagCollection(token, tagId, collection, { pageSize: 20 })).data,
			async () =>
				collection === "videos"
					? fetchFallbackVideoList("gjw", tagId, { limit: 20 })
					: fetchFallbackArticleList("gjw", tagId, { limit: 20 }),
		)

		return {
			description: `Tag-scoped GJW ${collection} rendered as a server partial.`,
			errorMessage: getErrorMessage(result.error),
			isNotFound: false,
			items: result.data.items,
			nextHref: null,
			pageTitle: `GJW tag ${tagId}`,
			requestUrl: buildApiUrl(`gjw/tags/${encodeURIComponent(tagId)}/${collection}`),
			renderVideos: collection === "videos",
			sectionLabel: `GJW tag ${collection}`,
			upstreamListUrl: result.data.listUrl ?? null,
		}
	}

	if (
		source === "gjw" &&
		slug[0] === "channels" &&
		slug[1] &&
		(slug[2] === "videos" || slug[2] === "articles")
	) {
		const channelId = slug[1]
		const collection = slug[2] as "articles" | "videos"
		const startKey = searchParams.get("startKey")
		const result = await loadWithFallback(
			session,
			async (token) =>
				collection === "videos"
					? (await fetchGjwChannelVideos(token, channelId, { pageSize: 20, startKey })).data
					: (await fetchGjwChannelArticles(token, channelId, { pageSize: 20, startKey })).data,
			async () =>
				collection === "videos"
					? fetchFallbackVideoList("gjw", channelId, {
							limit: 20,
							offset: getFallbackOffset(startKey, 20),
						})
					: fetchFallbackArticleList("gjw", channelId, {
							limit: 20,
							offset: getFallbackOffset(startKey, 20),
						}),
		)

		return {
			description: `Channel-scoped GJW ${collection} rendered from the ${collection === "videos" ? "/v1/gjw/videos" : "/v1/gjw/articles"} route.`,
			errorMessage: getErrorMessage(result.error),
			isNotFound: false,
			items: result.data.items,
			nextHref: result.data.nextStartKey
				? buildGjwChannelListHref(channelId, collection, result.data.nextStartKey)
				: null,
			pageTitle: `GJW channel ${collection}`,
			requestUrl: buildApiUrl(collection === "videos" ? "gjw/videos" : "gjw/articles", {
				channelId,
				startKey,
			}),
			renderVideos: collection === "videos",
			sectionLabel: `GJW channel ${collection}`,
			upstreamListUrl: result.data.listUrl ?? null,
		}
	}

	if (slug.length === 1 && getSourceCatalogEntry(source)) {
		const listName = slug[0]
		const entry = getSourceCatalogEntry(source)!
		const cursor = searchParams.get("cursor")
		const page = searchParams.get("page")
		const result = await loadWithFallback(
			session,
			async (token) =>
				(
					await fetchOriginList(token, source, listName, {
						cursor,
						page,
						pageSize: 20,
					})
				).data,
			async () =>
				fetchFallbackArticleList(source, listName, {
					limit: 20,
					offset: getFallbackOffset(entry.continuationParam === "cursor" ? cursor : page, 20),
				}),
		)

		return {
			description: `Normalized ${entry.name} list output rendered from the shared origin contract.`,
			errorMessage: getErrorMessage(result.error),
			isNotFound: false,
			items: result.data.items,
			nextHref: result.data.nextCursor
				? buildOriginListHref(source, listName, result.data.nextCursor)
				: null,
			pageTitle: `${entry.name} / ${listName}`,
			requestUrl: buildApiUrl(
				`${encodeURIComponent(source)}/lists/${encodeURIComponent(listName)}`,
				{
					cursor,
					page,
				},
			),
			renderVideos: false,
			sectionLabel: `${entry.name} list`,
			upstreamListUrl: result.data.listUrl ?? null,
		}
	}

	return {
		description: "The requested list route is not part of this demo.",
		errorMessage: null,
		isNotFound: true,
		items: [],
		nextHref: null,
		pageTitle: "List not found",
		requestUrl: null,
		renderVideos: false,
		sectionLabel: "Unknown list",
		upstreamListUrl: null,
	}
}
