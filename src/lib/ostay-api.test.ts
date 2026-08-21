import { afterEach, expect, mock, test } from "bun:test"

import { fetchOstayRecent } from "@/lib/ostay-api"

const originalApiBase = process.env.OSTAY_API_BASE
const originalApiKey = process.env.OSTAY_API_KEY

afterEach(() => {
	if (originalApiBase === undefined) delete process.env.OSTAY_API_BASE
	else process.env.OSTAY_API_BASE = originalApiBase
	if (originalApiKey === undefined) Reflect.deleteProperty(process.env, "OSTAY_API_KEY")
	else process.env.OSTAY_API_KEY = originalApiKey
})

test("reads Ostay configuration from the runtime environment", async () => {
	process.env.OSTAY_API_BASE = "https://ostay.example/api/v1"
	process.env.OSTAY_API_KEY = "test-token"
	const fetchMock = mock(() =>
		Promise.resolve(Response.json({ hours: 1, count: 0, items: [] })),
	)

	await fetchOstayRecent(1, undefined, { fetchImpl: fetchMock })

	expect(fetchMock).toHaveBeenCalledWith("https://ostay.example/api/v1/recent?hours=1", {
		headers: {
			accept: "application/json",
			authorization: "Bearer test-token",
		},
	})
})
