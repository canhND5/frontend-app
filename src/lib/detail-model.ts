import type { AuthSession } from "@/lib/auth"
import { fetchFallbackDetail } from "@/lib/fallback-api"
import { fetchContentDetail, type ProxyDetailResponse } from "@/lib/proxy-api"
import { loadWithFallback } from "@/lib/provider-mode"
import { buildApiUrl } from "@/lib/proxy-utils"

/** Server model for one detail partial. */
export interface DetailPageModel {
	contentLabel: string
	detail: ProxyDetailResponse | null
	errorMessage: string | null
	requestUrl: string
}

/**
 * Load the detail-page model for one route.
 */
export async function loadDetailPageModel(
	session: AuthSession | undefined,
	source: string,
	sourceItemId: string,
	kind?: string | null,
): Promise<DetailPageModel> {
	const result = await loadWithFallback(
		session,
		async (token) => (await fetchContentDetail(token, source, sourceItemId)).data,
		async () => fetchFallbackDetail(source, sourceItemId),
	)

	return {
		contentLabel: kind ?? result.data.contentType ?? "article",
		detail: result.data ?? null,
		errorMessage: result.error?.message ?? null,
		requestUrl: buildApiUrl(
			`${encodeURIComponent(source)}/articles/${sourceItemId
				.split("/")
				.filter(Boolean)
				.map((segment) => encodeURIComponent(segment))
				.join("/")}`,
		),
	}
}
