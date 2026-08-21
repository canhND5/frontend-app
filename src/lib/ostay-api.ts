export const DEFAULT_OSTAY_API_BASE =
	"https://ostayv3-fbe5ddejakf6g7hu.eastus-01.azurewebsites.net/api/v1"

export type FetchImpl = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

export interface FetchOptions {
	fetchImpl?: FetchImpl
}

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

export interface OstayItem {
	source: string
	sourceItemId: string
	listName: string
	title: string
	summary: string | null
	imageUrl: string | null
	canonicalUrl: string
	publishedAt: string | null
	contentType: 'article' | 'video'
	proxyFetchedAt: string | null
	createdAt: string
	channelName?: string | null
	channelId?: string | null
	durationSeconds?: number
}

export interface OstayListResponse {
	count: number
	items: OstayItem[]
}

export interface OstayPagedListResponse {
	total: number
	page: number
	pageSize: number
	items: OstayItem[]
}

export interface OstayRecentResponse extends OstayListResponse {
	hours: number
}

export interface OstayBlogItem {
	id: string | null
	source: string | null
	sourceName: string | null
	contentType: 'article' | 'video' | null
	title: string
	imageUrl: string | null
	publishedAt: string | null
	category: string | null
}

export interface OstayTweetMedia {
	mediaKey: string
	type: string
	url: string | null
	preview_image_url: string | null
	width?: number | null
	height?: number | null
}

export interface OstayTweetItem {
	sourceItemId: string
	authorName: string
	authorUsername: string
	authorAvatarUrl: string | null
	text: string
	noteText: string | null
	publishedAt: string | null
	likeCount: number | null
	retweetCount: number | null
	replyCount: number | null
	viewCount: number | null
	media: OstayTweetMedia[]
}

export interface OstayTweetsResponse {
	count: number
	items: OstayTweetItem[]
}

export interface OstayBlogEdition {
	date: string
	count: number
	items: OstayBlogItem[]
}

export type OstayBlogResponse = OstayBlogEdition[]

// ---------------------------------------------------------------------------
// Error
// ---------------------------------------------------------------------------

export class OstayRequestError extends Error {
	status: number
	url: string

	constructor(status: number, url: string, message: string) {
		super(message)
		this.name = "OstayRequestError"
		this.status = status
		this.url = url
	}
}

// ---------------------------------------------------------------------------
// Infrastructure
// ---------------------------------------------------------------------------

function getOstayApiBase(): string {
	return (process.env.OSTAY_API_BASE || DEFAULT_OSTAY_API_BASE).replace(/\/+$/, "")
}

function getOstayApiKey(): string | undefined {
	return process.env.OSTAY_API_KEY
}

function buildOstayUrl(
	path: string,
	query?: Record<string, string | number | null | undefined>,
): string {
	const url = new URL(path, `${getOstayApiBase()}/`)
	for (const [key, value] of Object.entries(query ?? {})) {
		if (value !== undefined && value !== null && value !== "") {
			url.searchParams.set(key, `${value}`)
		}
	}
	return url.toString()
}

async function fetchOstayJson<T>(
	path: string,
	query?: Record<string, string | number | null | undefined>,
	options?: FetchOptions,
): Promise<{ data: T; url: string }> {
	const token = getOstayApiKey()
	const url = buildOstayUrl(path, query)
	const fetchImpl = options?.fetchImpl ?? fetch

	const headers: Record<string, string> = { accept: "application/json" }
	if (token) headers.authorization = `Bearer ${token}`

	const response = await fetchImpl(url, { headers })

	if (!response.ok) {
		throw new OstayRequestError(
			response.status,
			url,
			`Ostay API request failed (${response.status}) for ${url}`,
		)
	}

	return { data: (await response.json()) as T, url }
}

// ---------------------------------------------------------------------------
// Public API functions
// ---------------------------------------------------------------------------

/** Fetch recent content. Defaults to last 24 h; pass hours and/or type to override. */
export async function fetchOstayRecent(
	hours?: number,
	type?: string,
	options?: FetchOptions,
) {
	return fetchOstayJson<OstayRecentResponse>(
		"recent",
		{
			...(hours !== undefined ? { hours } : {}),
			...(type !== undefined ? { type } : {}),
		},
		options,
	)
}

/** Fetch NTD editorial picks. */
export async function fetchOstayNtdPicks(options?: FetchOptions) {
	return fetchOstayJson<OstayListResponse>("ntd-picks", undefined, options)
}

/** Fetch KZG editorial picks. */
export async function fetchOstayKzgPicks(options?: FetchOptions) {
	return fetchOstayJson<OstayListResponse>("kzg-picks", undefined, options)
}

/** Fetch combined NTD + KZG editorial picks in one request. */
export async function fetchOstayNtdAndKzgPicks(
	page?: number,
	options?: FetchOptions,
) {
	return fetchOstayJson<OstayPagedListResponse>(
		"ntdandkzgpicks",
		page && page > 1 ? { page } : undefined,
		options,
	)
}

/** Fetch GJW top videos. */
export async function fetchOstayGjwTopVideos(options?: FetchOptions) {
	return fetchOstayJson<OstayListResponse>("gjw-top-videos", undefined, options)
}

/** Fetch blog digest articles. */
export async function fetchOstayBlogArticles(options?: FetchOptions) {
	return fetchOstayJson<OstayBlogResponse>("blog-articles", undefined, options)
}

/** Fetch latest X / Twitter tweets. */
export async function fetchOstayXTweets(options?: FetchOptions) {
	return fetchOstayJson<OstayTweetsResponse>("x-tweets", undefined, options)
}
