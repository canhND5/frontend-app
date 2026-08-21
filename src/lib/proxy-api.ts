import { buildApiUrl, buildServiceUrl } from "@/lib/proxy-utils"

/** Normalized list item returned by the proxy APIs. */
export interface ProxyListItem {
	id: string
	sourceItemId: string
	title: string
	contentType?: string | null
	imageUrl?: string | null
	summary?: string | null
	publishedAt?: string | null
	pubDate?: string | null
	canonicalUrl?: string | null
	bodyAvailable?: boolean
	bodyMode?: string | null
	duration?: number | null
	source?: string | null
}

/** Normalized list response returned by a proxy list endpoint. */
export interface ProxyListResponse {
	id: string
	items: ProxyListItem[]
	contentType?: string | null
	name?: string | null
	image?: string | null
	listName?: string | null
	listUrl?: string | null
	source?: string | null
	nextCursor?: string | null
	nextStartKey?: string | null
}

/** Normalized media or document resource exposed by a detail endpoint. */
export interface ProxyResource {
	key?: string | null
	label?: string | null
	type?: string | null
	url?: string | null
	mimeType?: string | null
	deliveryHint?: string | null
	originalUrl?: string | null
	status?: string | null
}

/** Resolved media resource returned by media batch and detail convenience APIs. */
export interface MediaResolveBatchItem {
	index?: number
	key?: string | null
	deliveryHint?: string | null
	deliveryPath?: string | null
	node?: { address?: string | null } | null
	originalUrl?: string | null
	resolvedUrl?: string | null
	source?: string | null
	sourceHost?: string | null
	status?: string | null
	type?: string | null
	userFingerprint?: string | null
	error?: {
		message?: string | null
	} | null
}

/** Normalized detail response returned by the proxy detail endpoints. */
export interface ProxyDetailResponse {
	id: string
	source: string
	sourceItemId: string
	title: string
	bodyHtml?: string | null
	bodyText?: string | null
	bodyMode?: string | null
	canonicalUrl?: string | null
	contentType?: string | null
	publishedAt?: string | null
	summary?: string | null
	language?: string | null
	posterImageUrl?: string | null
	posterVideoUrl?: string | null
	fetchedAt?: string | null
	resourcePlaceholderMode?: string | null
	channel?: { id?: string; name?: string } | null
	tags?: Array<{ id?: string; name?: string }> | null
	resources?: ProxyResource[] | null
	resolvedResources?: MediaResolveBatchItem[] | null
}

/** Normalized GJW tag item. */
export interface ProxyTag {
	id: string
	name: string
}

/** GJW tag response. */
export interface ProxyTagResponse {
	source: string
	items: ProxyTag[]
}

/** X user profile. */
export interface XUser {
	id: string
	name: string
	username: string
	profile_image_url?: string | null
}

/** One quality variant of a video media attachment. */
export interface XMediaVariant {
	content_type?: string | null
	url?: string | null
	bit_rate?: number | null
}

/** X media attachment on a post. */
export interface XMedia {
	media_key?: string | null
	mediaKey?: string | null
	r2Key?: string | null
	type?: string | null
	url?: string | null
	preview_image_url?: string | null
	width?: number | null
	height?: number | null
	variants?: XMediaVariant[] | null
	duration_ms?: number | null
	public_metrics?: { view_count?: number | null } | null
}

/** Referenced (quoted / retweeted / replied-to) post. */
export interface XReferencedPost {
	id: string
	text?: string | null
	note_tweet?: { text?: string | null } | null
	created_at?: string | null
	referenceType?: string | null
	author?: { id?: string; name?: string; username?: string; profile_image_url?: string | null } | null
	media?: XMedia[] | null
	public_metrics?: { like_count?: number; retweet_count?: number; reply_count?: number; quote_count?: number } | null
}

/** One X post from the timeline. */
export interface XPost {
	id: string
	text?: string | null
	note_tweet?: { text?: string | null } | null
	created_at?: string | null
	author?: { id?: string; name?: string; username?: string; profile_image_url?: string | null } | null
	media?: XMedia[] | null
	public_metrics?: { like_count?: number; retweet_count?: number; reply_count?: number; quote_count?: number } | null
	referencedPosts?: XReferencedPost[] | null
}

/** Response from GET /v1/x/users. */
export interface XUsersResponse {
	items: XUser[]
}

/** Response from GET /v1/x/timelines. */
export interface XTimelinesResponse {
	items: XPost[]
	nextCursor?: string | null
}

/** Response returned by the public metadata route. */
export interface ProxyRootResponse {
	service: string
	version: string
}

/** Response returned by the media classification endpoint. */
export interface MediaResolveResponse {
	deliveryHint?: string | null
	deliveryPath?: string | null
	key?: string | null
	node?: { address?: string | null } | null
	originalUrl?: string | null
	resolvedUrl?: string | null
	source?: string | null
	sourceHost?: string | null
	status?: string | null
	type?: string | null
	userFingerprint?: string | null
}

/** Response returned by the media batch route. */
export interface MediaResolveBatchResponse {
	items: MediaResolveBatchItem[]
}

/** One media batch request item. */
export interface MediaResolveBatchRequestItem {
	key?: string | null
	source: string
	url: string
}

/** Optional fetch override used by adapters and alternate runtimes. */
export interface FetchOptions {
	fetchImpl?: typeof fetch
}

/** Text response returned by the media proxy route. */
export interface MediaManifestResponse {
	contentType: string | null
	text: string
	url: string
}

/** Options used when fetching content detail. */
export interface FetchContentDetailOptions extends FetchOptions {
	includeMedia?: boolean
	userFingerprint?: string | null
}

/** Error thrown when the upstream proxy responds with a non-OK status. */
export class ProxyRequestError extends Error {
	status: number
	url: string

	/**
	 * Create a request error containing status and request URL context.
	 */
	constructor(status: number, url: string, message: string) {
		super(message)
		this.name = "ProxyRequestError"
		this.status = status
		this.url = url
	}
}

/**
 * Build the request headers required for a proxy API request.
 */
export function buildProxyRequestHeaders(token?: string | null): Record<string, string> {
	return token
		? {
				accept: "application/json",
				authorization: `Bearer ${token}`,
			}
		: {
				accept: "application/json",
			}
}

/**
 * Resolve the fetch implementation, defaulting to the global runtime fetch.
 */
function getFetchImpl(options?: FetchOptions): typeof fetch {
	return options?.fetchImpl ?? fetch
}

/**
 * Fetch JSON from the public metadata route.
 */
async function fetchPublicJson<T>(path = "", options?: FetchOptions) {
	const url = new URL(path, buildServiceUrl()).toString()
	const response = await getFetchImpl(options)(url, {
		headers: buildProxyRequestHeaders(),
	})

	if (!response.ok) {
		throw new ProxyRequestError(
			response.status,
			url,
			`Proxy request failed (${response.status}) for ${url}`,
		)
	}

	return {
		data: (await response.json()) as T,
		url,
	}
}

/**
 * Fetch JSON from the authenticated versioned proxy API.
 */
async function fetchProxyJson<T>(
	token: string,
	pathname: string,
	query?: Record<string, string | number | null>,
	init?: RequestInit,
	options?: FetchOptions,
) {
	const url = buildApiUrl(pathname, query)
	const response = await getFetchImpl(options)(url, {
		...init,
		headers: {
			...buildProxyRequestHeaders(token),
			...(init?.headers ?? {}),
		},
	})

	if (!response.ok) {
		throw new ProxyRequestError(
			response.status,
			url,
			`Proxy request failed (${response.status}) for ${url}`,
		)
	}

	return {
		data: (await response.json()) as T,
		url,
	}
}

/** Fetch the public service metadata route. */
export async function fetchProxyRoot(options?: FetchOptions) {
	return fetchPublicJson<ProxyRootResponse>("", options)
}

/** Fetch the live GJW tag catalog. */
export async function fetchGjwTags(token: string, options?: FetchOptions) {
	return fetchProxyJson<ProxyTagResponse>(token, "gjw/tags", undefined, undefined, options)
}

/** Fetch a GJW tag-scoped content feed. */
export async function fetchGjwTagCollection(
	token: string,
	tagId: string,
	collection: "articles" | "videos",
	options?: { pageSize?: number; fetchImpl?: typeof fetch },
) {
	return fetchProxyJson<ProxyListResponse>(
		token,
		`gjw/tags/${encodeURIComponent(tagId)}/${collection}`,
		{
			pageSize: options?.pageSize ?? null,
		},
		undefined,
		options,
	)
}

/** Fetch a GJW tag video list. */
export async function fetchGjwTagVideos(
	token: string,
	tagId: string,
	options?: { pageSize?: number; fetchImpl?: typeof fetch },
) {
	return fetchGjwTagCollection(token, tagId, "videos", options)
}

/** Fetch a GJW tag article list. */
export async function fetchGjwTagArticles(
	token: string,
	tagId: string,
	options?: { pageSize?: number; fetchImpl?: typeof fetch },
) {
	return fetchGjwTagCollection(token, tagId, "articles", options)
}

/** Fetch a GJW channel video list. */
export async function fetchGjwChannelVideos(
	token: string,
	channelId: string,
	options?: { pageSize?: number; startKey?: string | null; fetchImpl?: typeof fetch },
) {
	return fetchProxyJson<ProxyListResponse>(
		token,
		"gjw/videos",
		{
			channelId,
			pageSize: options?.pageSize ?? 10,
			startKey: options?.startKey ?? null,
		},
		undefined,
		options,
	)
}

/** Fetch a GJW channel article list. */
export async function fetchGjwChannelArticles(
	token: string,
	channelId: string,
	options?: { pageSize?: number; startKey?: string | null; fetchImpl?: typeof fetch },
) {
	return fetchProxyJson<ProxyListResponse>(
		token,
		"gjw/articles",
		{
			channelId,
			pageSize: options?.pageSize ?? 10,
			startKey: options?.startKey ?? null,
		},
		undefined,
		options,
	)
}

/** Fetch a generic origin list from the proxy. */
export async function fetchOriginList(
	token: string,
	source: string,
	listName: string,
	options?: {
		pageSize?: number
		cursor?: string | null
		page?: string | null
		fetchImpl?: typeof fetch
	},
) {
	return fetchProxyJson<ProxyListResponse>(
		token,
		`${encodeURIComponent(source)}/lists/${encodeURIComponent(listName)}`,
		{
			pageSize: options?.pageSize ?? 20,
			cursor: options?.cursor ?? null,
			page: options?.page ?? null,
		},
		undefined,
		options,
	)
}

/** Fetch article or video detail from the shared detail endpoint. */
export async function fetchContentDetail(
	token: string,
	source: string,
	sourceItemId: string,
	collection: "articles" | "videos" = "articles",
	options?: FetchContentDetailOptions,
) {
	const itemPath = sourceItemId
		.split("/")
		.filter(Boolean)
		.map((segment) => encodeURIComponent(segment))
		.join("/")

	return fetchProxyJson<ProxyDetailResponse>(
		token,
		`${encodeURIComponent(source)}/${source === "gjw" && collection === "videos" ? "videos" : "articles"}/${itemPath}`,
		{
			include: options?.includeMedia ? "media" : null,
		},
		{
			headers:
				options?.includeMedia && options.userFingerprint
					? {
							"x-user-fingerprint": options.userFingerprint,
						}
					: undefined,
		},
		options,
	)
}

/** Call the media classification route for one resource URL. */
export async function resolveMediaResource(
	token: string,
	source: string,
	url: string,
	userFingerprint?: string | null,
	options?: FetchOptions,
) {
	return fetchProxyJson<MediaResolveResponse>(
		token,
		"media/resolve",
		undefined,
		{
			body: JSON.stringify({ source, url, userFingerprint }),
			headers: {
				"content-type": "application/json",
			},
			method: "POST",
		},
		options,
	)
}

/** Call the media batch route for multiple resource URLs. */
export async function resolveMediaResources(
	token: string,
	items: MediaResolveBatchRequestItem[],
	userFingerprint?: string | null,
	options?: FetchOptions,
) {
	return fetchProxyJson<MediaResolveBatchResponse>(
		token,
		"media/batch",
		undefined,
		{
			body: JSON.stringify({ items, userFingerprint }),
			headers: {
				"content-type": "application/json",
			},
			method: "POST",
		},
		options,
	)
}

/** Fetch the proxied media payload as text for partial inspection. */
export async function fetchMediaManifest(
	token: string,
	source: string,
	url: string,
	userFingerprint?: string | null,
	options?: FetchOptions,
): Promise<MediaManifestResponse> {
	const requestUrl = buildApiUrl("media/proxy")
	const response = await getFetchImpl(options)(requestUrl, {
		body: JSON.stringify({ source, url, userFingerprint }),
		headers: {
			accept: "*/*",
			authorization: `Bearer ${token}`,
			"content-type": "application/json",
		},
		method: "POST",
	})

	if (!response.ok) {
		throw new ProxyRequestError(
			response.status,
			requestUrl,
			`Proxy request failed (${response.status}) for ${requestUrl}`,
		)
	}

	return {
		contentType: response.headers.get("content-type"),
		text: await response.text(),
		url: requestUrl,
	}
}

/** Fetch whitelisted X users with cached profile data. */
export async function fetchXUsers(token: string, options?: FetchOptions) {
	return fetchProxyJson<XUsersResponse>(token, "x/users", undefined, undefined, options)
}

/** Fetch one X post by ID with full context (author, media, referenced posts). */
export async function fetchXPost(token: string, postId: string, options?: FetchOptions) {
	return fetchProxyJson<XPost>(token, `x/posts/${encodeURIComponent(postId)}`, undefined, undefined, options)
}

/** Fetch aggregated X posts from all whitelisted users (KV cache, no live X API call). */
export async function fetchXTimelines(
	token: string,
	options?: { pageSize?: number; cursor?: string | null; fetchImpl?: typeof fetch },
) {
	return fetchProxyJson<XTimelinesResponse>(
		token,
		"x/timelines",
		{
			pageSize: options?.pageSize ?? 30,
			cursor: options?.cursor ?? null,
		},
		undefined,
		options,
	)
}
