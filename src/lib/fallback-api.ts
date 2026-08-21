import { fallbackArticleFixtures, fallbackLaunchFixtures } from "@/data/fallback-fixtures"
import type {
	ProxyDetailResponse,
	ProxyListItem,
	ProxyListResponse,
	ProxyTagResponse,
} from "@/lib/proxy-api"

interface SpaceflightArticle {
	id: number | string
	image_url?: string | null
	imageUrl?: string | null
	published_at?: string
	publishedAt?: string
	summary: string
	title: string
	url: string
}

interface SpaceflightArticleResponse {
	next: string | null
	results: SpaceflightArticle[]
}

interface LaunchLibraryLaunch {
	id: string
	image?: string | null
	imageUrl?: string | null
	net?: string
	publishedAt?: string
	name?: string
	title?: string
	summary?: string | null
	url: string
	vid_urls?: Array<{ url?: string | null }>
	mission?: {
		description?: string | null
		name?: string | null
	}
	status?: {
		name?: string | null
	}
}

interface LaunchLibraryResponse {
	next: string | null
	results: LaunchLibraryLaunch[]
}

/**
 * Fetch JSON from a public fallback API.
 * Returns null when the request fails so fixtures can take over.
 */
async function fetchPublicJson<T>(url: string): Promise<T | null> {
	try {
		const response = await fetch(url, {
			headers: {
				accept: "application/json",
			},
		})

		if (!response.ok) {
			return null
		}

		return (await response.json()) as T
	} catch {
		return null
	}
}

/**
 * Convert a public article into the shared list item contract.
 */
function mapArticleItem(article: SpaceflightArticle, source: string): ProxyListItem {
	return {
		canonicalUrl: article.url,
		contentType: "article",
		id: `sfn-${article.id}`,
		imageUrl: article.imageUrl ?? article.image_url,
		publishedAt: article.publishedAt ?? article.published_at,
		source,
		sourceItemId: `sfn-${article.id}`,
		summary: article.summary,
		title: article.title,
	}
}

/**
 * Convert a public launch object into a video-like shared list item.
 */
function mapLaunchItem(launch: LaunchLibraryLaunch, source: string): ProxyListItem {
	return {
		canonicalUrl: launch.vid_urls?.[0]?.url ?? launch.url,
		contentType: "video",
		id: `ll-${launch.id}`,
		imageUrl: launch.imageUrl ?? launch.image,
		publishedAt: launch.publishedAt ?? launch.net,
		source,
		sourceItemId: `ll-${launch.id}`,
		summary: launch.summary ?? launch.mission?.description ?? launch.status?.name ?? "Upcoming launch coverage",
		title: launch.title ?? launch.name ?? launch.id,
	}
}

/**
 * Fetch article-style fallback content for generic and GJW article routes.
 */
export async function fetchFallbackArticleList(
	source: string,
	listName: string,
	options?: { limit?: number; offset?: number },
): Promise<ProxyListResponse> {
	const limit = options?.limit ?? 12
	const offset = options?.offset ?? 0
	const response = await fetchPublicJson<SpaceflightArticleResponse>(
		`https://api.spaceflightnewsapi.net/v4/articles/?limit=${limit}&offset=${offset}`,
	)
	const articles = response?.results ?? fallbackArticleFixtures

	return {
		contentType: "article",
		id: listName,
		items: articles.map((article) => mapArticleItem(article as SpaceflightArticle, source)),
		listName,
		listUrl: "https://www.spaceflightnewsapi.net/",
		nextCursor: `${offset + limit}`,
		source,
	}
}

/**
 * Fetch video-style fallback content for GJW video routes.
 */
export async function fetchFallbackVideoList(
	source: string,
	listName: string,
	options?: { limit?: number; offset?: number },
): Promise<ProxyListResponse> {
	const limit = options?.limit ?? 8
	const offset = options?.offset ?? 0
	const response = await fetchPublicJson<LaunchLibraryResponse>(
		`https://lldev.thespacedevs.com/2.2.0/launch/upcoming/?format=json&limit=${limit}&offset=${offset}&mode=list`,
	)
	const launches = response?.results ?? fallbackLaunchFixtures

	return {
		contentType: "video",
		id: listName,
		items: launches.map((launch) => mapLaunchItem(launch as LaunchLibraryLaunch, source)),
		listName,
		listUrl: "https://thespacedevs.com/llapi",
		nextCursor: `${offset + limit}`,
		source,
	}
}

/**
 * Fetch the fallback GJW tag catalog.
 */
export async function fetchFallbackTags(): Promise<ProxyTagResponse> {
	return {
		items: [
			{ id: "launch-room", name: "Launch Room" },
			{ id: "briefings", name: "Briefings" },
			{ id: "explainers", name: "Explainers" },
		],
		source: "gjw",
	}
}

/**
 * Fetch one fallback detail payload using the shared detail contract.
 */
export async function fetchFallbackDetail(
	source: string,
	sourceItemId: string,
): Promise<ProxyDetailResponse> {
	if (sourceItemId.startsWith("ll-")) {
		const launchId = sourceItemId.replace(/^ll-/, "")
		const launch = await fetchPublicJson<LaunchLibraryLaunch>(
			`https://lldev.thespacedevs.com/2.2.0/launch/${launchId}/?format=json`,
		)
		const fixture =
			fallbackLaunchFixtures.find((item) => item.id === `launch-${launchId}`) ??
			fallbackLaunchFixtures[0]
		const title = launch?.name ?? fixture.title
		const summary = launch?.mission?.description ?? fixture.summary
		const videoUrl = launch?.vid_urls?.[0]?.url ?? fixture.url

		return {
			bodyHtml: `<p>${summary}</p><p><a href="${videoUrl}" target="_blank" rel="noreferrer">Open coverage source</a></p>`,
			bodyMode: "fallback",
			bodyText: summary,
			canonicalUrl: videoUrl,
			contentType: "video",
			id: sourceItemId,
			posterImageUrl: launch?.image ?? fixture.imageUrl,
			posterVideoUrl: videoUrl,
			publishedAt: launch?.net ?? fixture.publishedAt,
			resources: videoUrl
				? [
						{
							label: "Coverage link",
							type: "video",
							url: videoUrl,
						},
					]
				: [],
			source,
			sourceItemId,
			summary,
			title,
		}
	}

	const articleId = sourceItemId.replace(/^sfn-/, "")
	const article = await fetchPublicJson<SpaceflightArticle>(
		`https://api.spaceflightnewsapi.net/v4/articles/${articleId}/`,
	)
	const fixture =
		fallbackArticleFixtures.find((item) => item.id === articleId) ?? fallbackArticleFixtures[0]
	const title = article?.title ?? fixture.title
	const summary = article?.summary ?? fixture.summary
	const canonicalUrl = article?.url ?? fixture.url
	const imageUrl = article?.image_url ?? fixture.imageUrl
	const publishedAt = article?.published_at ?? fixture.publishedAt

	return {
		bodyHtml: `<p>${summary}</p><p>This fallback detail page is rendered on the server and stands in for the authenticated proxy detail view when no API token is configured.</p><p><a href="${canonicalUrl}" target="_blank" rel="noreferrer">Read the original source</a></p>`,
		bodyMode: "fallback",
		bodyText: summary,
		canonicalUrl,
		contentType: "article",
		id: sourceItemId,
		posterImageUrl: imageUrl,
		publishedAt,
		resources: imageUrl
			? [
					{
						label: "Poster image",
						type: "image",
						url: imageUrl,
					},
				]
			: [],
		source,
		sourceItemId,
		summary,
		title,
	}
}
