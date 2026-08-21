import { describe, expect, test } from "bun:test"

import {
	AUTH_SESSION_COOKIE,
	createAuthSession,
	decodeAuthSession,
	encodeAuthSession,
	getProviderMode,
	normalizeApiToken,
	normalizeDisplayName,
} from "@/lib/auth"

describe("AUTH_SESSION_COOKIE", () => {
	test("uses a stable cookie name for the demo session", () => {
		expect(AUTH_SESSION_COOKIE).toBe("astro_tmpl_session")
	})
})

describe("normalizeDisplayName", () => {
	test("returns a friendly default when the name is blank", () => {
		expect(normalizeDisplayName("   ")).toBe("Team Member")
	})

	test("trims surrounding whitespace", () => {
		expect(normalizeDisplayName("  Alice  ")).toBe("Alice")
	})
})

describe("normalizeApiToken", () => {
	test("trims token whitespace", () => {
		expect(normalizeApiToken("  secret-token  ")).toBe("secret-token")
	})

	test("returns an empty string for missing values", () => {
		expect(normalizeApiToken("")).toBe("")
	})
})

describe("encodeAuthSession and decodeAuthSession", () => {
	test("round-trips a complete session payload", () => {
		const session = createAuthSession("Alice", "secret-token")
		const encoded = encodeAuthSession(session)

		expect(decodeAuthSession(encoded)).toEqual(session)
	})

	test("returns null for malformed cookie payloads", () => {
		expect(decodeAuthSession("not-base64")).toBeNull()
	})
})

describe("getProviderMode", () => {
	test("returns real when a token is present", () => {
		expect(getProviderMode(createAuthSession("Alice", "secret-token"))).toBe("real")
	})

	test("returns fallback when the token is absent", () => {
		expect(getProviderMode(createAuthSession("Alice", ""))).toBe("fallback")
	})
})
