import { describe, expect, mock, test } from "bun:test"

import { buildProxyRequestHeaders, fetchProxyRoot } from "@/lib/proxy-api"

describe("buildProxyRequestHeaders", () => {
	test("adds the bearer token when one is provided", () => {
		expect(buildProxyRequestHeaders("secret-token")).toEqual({
			accept: "application/json",
			authorization: "Bearer secret-token",
		})
	})

	test("keeps the request anonymous when the token is empty", () => {
		expect(buildProxyRequestHeaders("")).toEqual({
			accept: "application/json",
		})
	})
})

describe("fetchProxyRoot", () => {
	test("requests the public service metadata endpoint", async () => {
		const fetchMock = mock(() =>
			Promise.resolve(
				new Response(JSON.stringify({ service: "data-source", version: "v1" }), {
					status: 200,
					headers: {
						"content-type": "application/json",
					},
				}),
			),
		)

		await fetchProxyRoot({ fetchImpl: fetchMock as unknown as typeof fetch })

		expect(fetchMock).toHaveBeenCalledWith("https://data-source-api.workerproxy.workers.dev/", {
			headers: {
				accept: "application/json",
			},
		})
	})
})

