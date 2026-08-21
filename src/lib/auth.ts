/** Stable cookie name for the Astro demo auth session. */
export const AUTH_SESSION_COOKIE = "astro_tmpl_session"

/** Fallback name shown when the form omits a display name. */
export const DEFAULT_DISPLAY_NAME = "Team Member"

/** Session payload stored in the secure auth cookie. */
export interface AuthSession {
	name: string
	token: string
	ts: number
}

/**
 * Normalize a display name submitted by the login form.
 * Returns a stable fallback when the field is blank.
 */
export function normalizeDisplayName(value?: string | null): string {
	const normalized = value?.trim()
	return normalized ? normalized : DEFAULT_DISPLAY_NAME
}

/**
 * Normalize a bearer token submitted by the login form.
 * Empty or missing values become an empty string.
 */
export function normalizeApiToken(value?: string | null): string {
	return value?.trim() ?? ""
}

/**
 * Create a normalized session payload for cookie storage.
 */
export function createAuthSession(name: string, token: string): AuthSession {
	return {
		name: normalizeDisplayName(name),
		token: normalizeApiToken(token),
		ts: Date.now(),
	}
}

/**
 * Encode the auth session into a cookie-safe base64 string.
 */
export function encodeAuthSession(session: AuthSession): string {
	return btoa(JSON.stringify(session))
}

/**
 * Decode an auth session cookie.
 * Returns null when the cookie is missing or malformed.
 */
export function decodeAuthSession(value?: string | null): AuthSession | null {
	if (!value) {
		return null
	}

	try {
		const parsed = JSON.parse(atob(value)) as Partial<AuthSession>

		if (
			typeof parsed.name !== "string" ||
			typeof parsed.token !== "string" ||
			typeof parsed.ts !== "number"
		) {
			return null
		}

		return {
			name: normalizeDisplayName(parsed.name),
			token: normalizeApiToken(parsed.token),
			ts: parsed.ts,
		}
	} catch {
		return null
	}
}

/**
 * Resolve whether the request should use the real proxy APIs or fallback data.
 */
export function getProviderMode(session?: Pick<AuthSession, "token"> | null): "real" | "fallback" {
	return session?.token ? "real" : "fallback"
}

/**
 * Cookie options for the auth session.
 * httpOnly prevents client-side JS from reading the bearer token.
 */
export const AUTH_COOKIE_OPTIONS = {
	httpOnly: true,
	path: "/",
	sameSite: "lax",
	secure: true,
} as const satisfies Parameters<AstroCookies["set"]>[2]

type AstroCookies = import("astro").AstroCookies
