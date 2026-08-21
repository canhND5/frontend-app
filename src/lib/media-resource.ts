/** Opaque payload encoded into one clean Astro media route id. */
export interface MediaResourceToken {
	collection: "articles" | "videos"
	sourceItemId: string
	url: string
}

/**
 * Encodes one media token into a URL-safe opaque resource id.
 *
 * @param token Media route token.
 * @returns Base64url-encoded resource id.
 */
export function encodeMediaResourceId(token: MediaResourceToken): string {
	return toBase64Url(JSON.stringify(token))
}

/**
 * Decodes one opaque media resource id into its original token.
 *
 * @param resourceId Encoded media resource id.
 * @returns Decoded media route token.
 */
export function decodeMediaResourceId(resourceId: string): MediaResourceToken {
	try {
		const parsed = JSON.parse(fromBase64Url(resourceId)) as Partial<MediaResourceToken>
		const collection = parsed.collection === "videos" ? "videos" : "articles"
		const sourceItemId = String(parsed.sourceItemId ?? "").trim()
		const url = String(parsed.url ?? "").trim()

		if (!sourceItemId || !url) {
			throw new Error("Invalid media resource id")
		}

		return {
			collection,
			sourceItemId,
			url,
		}
	} catch {
		throw new Error("Invalid media resource id")
	}
}

/**
 * Resolves the canonical upstream media URL from one opaque resource id.
 *
 * @param resourceId Encoded media resource id.
 * @returns Canonical upstream media URL.
 */
export function resolveMediaResourceUrl(resourceId: string): string {
	return decodeMediaResourceId(resourceId).url
}

/**
 * Encodes one UTF-8 string as URL-safe base64.
 *
 * @param value Plain-text value.
 * @returns Base64url-encoded string.
 */
function toBase64Url(value: string): string {
	const bytes = new TextEncoder().encode(value)
	let binary = ""

	for (const byte of bytes) {
		binary += String.fromCharCode(byte)
	}

	return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
}

/**
 * Decodes one URL-safe base64 string into UTF-8 text.
 *
 * @param value Base64url string.
 * @returns Decoded plain-text value.
 */
function fromBase64Url(value: string): string {
	const padded = value
		.replace(/-/g, "+")
		.replace(/_/g, "/")
		.padEnd(Math.ceil(value.length / 4) * 4, "=")
	const binary = atob(padded)
	const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))

	return new TextDecoder().decode(bytes)
}
