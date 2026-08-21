import { describe, expect, test } from "bun:test"

import type { AuthSession } from "@/lib/auth"
import { loadWithFallback } from "@/lib/provider-mode"

const session: AuthSession = {
	name: "Alice",
	token: "secret-token",
	ts: 1,
}

describe("loadWithFallback", () => {
	test("uses fallback immediately when the session has no token", async () => {
		const result = await loadWithFallback(
			{ ...session, token: "" },
			async () => "real",
			async () => "fallback",
		)

		expect(result).toEqual({
			data: "fallback",
			error: null,
			mode: "fallback",
			requestedMode: "fallback",
		})
	})

	test("returns real data when the authenticated loader succeeds", async () => {
		const result = await loadWithFallback(
			session,
			async () => "real",
			async () => "fallback",
		)

		expect(result).toEqual({
			data: "real",
			error: null,
			mode: "real",
			requestedMode: "real",
		})
	})

	test("falls back after a real-data failure", async () => {
		const result = await loadWithFallback(
			session,
			async () => {
				throw new Error("Unauthorized")
			},
			async () => "fallback",
		)

		expect(result.mode).toBe("fallback")
		expect(result.requestedMode).toBe("real")
		expect(result.data).toBe("fallback")
		expect(result.error).toBeInstanceOf(Error)
	})
})
