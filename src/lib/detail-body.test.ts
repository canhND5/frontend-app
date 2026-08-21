import { describe, expect, test } from "bun:test"

import { injectResourceOriginalUrls, resolveResourceDisplayUrl } from "@/lib/detail-body"

describe("resolveResourceDisplayUrl", () => {
	test("prefers the original resource URL for rendering", () => {
		expect(
			resolveResourceDisplayUrl({
				originalUrl: "https://origin.example/cover.jpg",
				url: "https://proxy.example/cover.jpg",
			}),
		).toBe("https://origin.example/cover.jpg")
	})

	test("falls back to the normalized resource URL", () => {
		expect(
			resolveResourceDisplayUrl({
				url: "https://proxy.example/cover.jpg",
			}),
		).toBe("https://proxy.example/cover.jpg")
	})
})

describe("injectResourceOriginalUrls", () => {
	test("hydrates image placeholders with original resource URLs", () => {
		expect(
			injectResourceOriginalUrls('<p><img data-pocket-resource="res_001" alt="Cover" /></p>', [
				{
					key: "res_001",
					originalUrl: "https://origin.example/cover.jpg",
					type: "image",
				},
			]),
		).toBe(
			'<p><img data-pocket-resource="res_001" alt="Cover" src="https://origin.example/cover.jpg" /></p>',
		)
	})

	test("leaves unrelated placeholder elements unchanged", () => {
		expect(
			injectResourceOriginalUrls('<p><span data-pocket-resource="res_001"></span></p>', [
				{
					key: "res_001",
					originalUrl: "https://origin.example/cover.jpg",
					type: "image",
				},
			]),
		).toBe('<p><span data-pocket-resource="res_001"></span></p>')
	})
})
