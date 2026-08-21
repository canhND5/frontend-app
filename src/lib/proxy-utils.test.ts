import { describe, expect, test } from "bun:test"

import {
	buildApiUrl,
	buildServiceUrl,
	buildContentHref,
	buildGjwChannelListHref,
	buildOriginListHref,
	encodeCatchallPath,
	formatDurationLabel,
} from "@/lib/proxy-utils"

describe("encodeCatchallPath", () => {
	test("preserves slash-delimited ids for catch-all routes", () => {
		expect(encodeCatchallPath("mandarin/shehui/story")).toBe("mandarin/shehui/story")
	})

	test("encodes unsafe characters inside segments", () => {
		expect(encodeCatchallPath("hello world/2026")).toBe("hello%20world/2026")
	})
})

describe("buildContentHref", () => {
	test("creates a content href with optional kind metadata and poster", () => {
		expect(
			buildContentHref("gjw", "1abc", {
				kind: "video",
				posterUrl: "https://img.example/poster.webp",
			}),
		).toBe("/content/gjw/1abc?kind=video&poster=https%3A%2F%2Fimg.example%2Fposter.webp")
	})
})

describe("buildOriginListHref", () => {
	test("uses the documented continuation param for page-based lists", () => {
		expect(buildOriginListHref("djy", "news413", "2")).toBe("/lists/djy/news413?page=2")
	})

	test("uses the documented continuation param for cursor-based lists", () => {
		expect(buildOriginListHref("rfa", "mandarin", "5")).toBe("/lists/rfa/mandarin?cursor=5")
	})
})

describe("buildGjwChannelListHref", () => {
	test("serializes the GJW `startKey` continuation", () => {
		expect(buildGjwChannelListHref("channel-1", "next-key")).toBe(
			"/lists/gjw/channels/channel-1/articles?startKey=next-key",
		)
	})
})

describe("buildApiUrl", () => {
	test("builds URLs against the data-source versioned base", () => {
		expect(buildApiUrl("gjw/articles", { channelId: "abc", pageSize: 10 })).toBe(
			"https://data-source-api.workerproxy.workers.dev/v1/gjw/articles?channelId=abc&pageSize=10",
		)
	})
})

describe("buildServiceUrl", () => {
	test("resolves the public service root from the versioned API base", () => {
		expect(buildServiceUrl()).toBe("https://data-source-api.workerproxy.workers.dev/")
	})
})

describe("formatDurationLabel", () => {
	test("formats sub-hour video durations", () => {
		expect(formatDurationLabel(807)).toBe("13:27")
	})

	test("formats hour-long video durations", () => {
		expect(formatDurationLabel(3661)).toBe("01:01:01")
	})
})
