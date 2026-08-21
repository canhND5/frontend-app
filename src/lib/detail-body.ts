import type { ProxyResource } from "@/lib/proxy-api"

const DISPLAY_RESOURCE_TAGS = new Set(["audio", "iframe", "img", "source", "video"])
const RESOURCE_PLACEHOLDER_PATTERN =
	/<([a-zA-Z][\w:-]*)([^>]*?\sdata-pocket-resource=(["'])([^"']+)\3[^>]*?)(\s*\/?)>/g

/**
 * Resolve the best URL to use when rendering one normalized resource.
 */
export function resolveResourceDisplayUrl(resource?: ProxyResource | null): string | null {
	return resource?.originalUrl ?? resource?.url ?? null
}

/**
 * Escape one HTML attribute value before it is injected into body markup.
 */
function escapeHtmlAttribute(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll('"', "&quot;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
}

/**
 * Insert or replace one HTML attribute on a placeholder element.
 */
function upsertHtmlAttribute(attributes: string, name: string, value: string): string {
	const attributePattern = new RegExp(`\\s${name}\\s*=\\s*(?:"[^"]*"|'[^']*'|[^\\s>]+)`, "i")
	const replacement = ` ${name}="${escapeHtmlAttribute(value)}"`

	return attributePattern.test(attributes)
		? attributes.replace(attributePattern, replacement)
		: `${attributes}${replacement}`
}

/**
 * Replace renderable `data-pocket-resource` placeholders with direct display URLs.
 */
export function injectResourceOriginalUrls(
	bodyHtml?: string | null,
	resources?: ProxyResource[] | null,
): string | null | undefined {
	if (!bodyHtml || !resources?.length) {
		return bodyHtml
	}

	const resourcesByKey = new Map(
		resources
			.filter((resource): resource is ProxyResource & { key: string } => Boolean(resource.key))
			.map((resource) => [resource.key, resource]),
	)

	return bodyHtml.replace(
		RESOURCE_PLACEHOLDER_PATTERN,
		(
			match,
			tagName: string,
			attributes: string,
			_quote: string,
			resourceKey: string,
			end: string,
		) => {
			if (!DISPLAY_RESOURCE_TAGS.has(tagName.toLowerCase())) {
				return match
			}

			const displayUrl = resolveResourceDisplayUrl(resourcesByKey.get(resourceKey))

			if (!displayUrl) {
				return match
			}

			return `<${tagName}${upsertHtmlAttribute(attributes, "src", displayUrl)}${end}>`
		},
	)
}
