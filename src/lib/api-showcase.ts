/** One API route showcased by the demo homepage. */
export interface ApiShowcaseRoute {
	auth: "public" | "bearer"
	method: "GET" | "POST"
	path: string
	purpose: string
}

/** One grouped API family displayed in the UI. */
export interface ApiShowcaseGroup {
	description: string
	routes: ApiShowcaseRoute[]
	title: string
}

/** Complete data-source API coverage displayed by the demo. */
export const apiShowcaseGroups: ApiShowcaseGroup[] = [
	{
		description: "Public worker metadata exposed without authentication.",
		routes: [{ auth: "public", method: "GET", path: "/", purpose: "Public service metadata" }],
		title: "Service Metadata",
	},
	{
		description:
			"Every GJW route family is exercised with server-rendered partials and deep links.",
		routes: [
			{ auth: "bearer", method: "GET", path: "/v1/gjw/tags", purpose: "Tag catalog" },
			{
				auth: "bearer",
				method: "GET",
				path: "/v1/gjw/tags/:tagId/:collection",
				purpose: "Tag-scoped articles and videos",
			},
			{ auth: "bearer", method: "GET", path: "/v1/gjw/videos", purpose: "Channel video feeds" },
			{ auth: "bearer", method: "GET", path: "/v1/gjw/articles", purpose: "Channel article feeds" },
			{
				auth: "bearer",
				method: "GET",
				path: "/v1/gjw/articles/:contentId",
				purpose: "GJW article details",
			},
		],
		title: "GJW",
	},
	{
		description:
			"Unified list and detail routes shared by DJY, KZG, MHW, NTD, RFA, RMB, SOH, and ZJW.",
		routes: [
			{
				auth: "bearer",
				method: "GET",
				path: "/v1/:source/lists/:listName",
				purpose: "Normalized list feeds",
			},
			{
				auth: "bearer",
				method: "GET",
				path: "/v1/:source/articles/:sourceItemId",
				purpose: "Normalized detail payloads",
			},
		],
		title: "Origin Sources",
	},
	{
		description: "Media routes are surfaced on detail pages whenever resources are available.",
		routes: [
			{
				auth: "bearer",
				method: "POST",
				path: "/v1/media/resolve",
				purpose: "Resolve one media request into a consumable result",
			},
			{
				auth: "bearer",
				method: "POST",
				path: "/v1/media/proxy",
				purpose: "Execute proxy delivery, redirects, or generated manifests",
			},
		],
		title: "Media Delivery",
	},
]
