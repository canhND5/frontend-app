import type { MediaResolveResponse } from "@/lib/proxy-api"

/**
 * Decide whether the media preview should fetch manifest text from the proxy route.
 *
 * Only allocated-node delivery produces a generated root m3u8 that is useful to
 * render as text in the inspection partial.
 *
 * @param payload Resolved media response payload.
 * @returns True when the follow-up proxy request should load manifest text.
 */
export function shouldFetchMediaManifest(
	payload?: Pick<MediaResolveResponse, "deliveryHint"> | null,
): boolean {
	return payload?.deliveryHint === "allocated-node"
}
