/** Backup article fixtures used when public fallback APIs are unavailable. */
export const fallbackArticleFixtures = [
	{
		id: "901",
		imageUrl:
			"https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80",
		publishedAt: "2026-03-25T08:00:00.000Z",
		summary:
			"A compact article fixture that keeps the fallback homepage alive when public APIs fail.",
		title: "Fallback Briefing: Orbital infrastructure keeps the demo homepage populated",
		url: "https://www.spaceflightnewsapi.net/",
	},
	{
		id: "902",
		imageUrl:
			"https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=80",
		publishedAt: "2026-03-24T18:30:00.000Z",
		summary:
			"A secondary fixture article with enough metadata to stand in for normalized detail content.",
		title: "Fallback Briefing: Mission updates and launch coverage remain readable without a token",
		url: "https://www.spaceflightnewsapi.net/",
	},
	{
		id: "903",
		imageUrl:
			"https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
		publishedAt: "2026-03-23T10:15:00.000Z",
		summary:
			"This fixture helps list pages paginate with realistic card content during offline fallback.",
		title: "Fallback Briefing: Public data keeps list pagination believable",
		url: "https://www.spaceflightnewsapi.net/",
	},
	{
		id: "904",
		imageUrl:
			"https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&w=1200&q=80",
		publishedAt: "2026-03-22T05:45:00.000Z",
		summary: "The final backup article gives the demo a dependable last resort for detail pages.",
		title: "Fallback Briefing: Server-rendered partials still tell a complete story",
		url: "https://www.spaceflightnewsapi.net/",
	},
] as const

/** Backup launch fixtures used for video-style fallback sections. */
export const fallbackLaunchFixtures = [
	{
		id: "launch-501",
		imageUrl:
			"https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?auto=format&fit=crop&w=1200&q=80",
		publishedAt: "2026-03-28T12:00:00.000Z",
		summary: "Launch window coverage works well as a video-like card feed for GJW fallback demos.",
		title: "Mission Watch: rehearsal coverage from the fallback launch room",
		url: "https://thespacedevs.com/llapi",
	},
	{
		id: "launch-502",
		imageUrl:
			"https://images.unsplash.com/photo-1454789548928-9efd52dc4031?auto=format&fit=crop&w=1200&q=80",
		publishedAt: "2026-03-27T16:30:00.000Z",
		summary: "A second launch-style fallback card that reads like a scheduled stream event.",
		title: "Mission Watch: mission control preview and countdown coverage",
		url: "https://thespacedevs.com/llapi",
	},
	{
		id: "launch-503",
		imageUrl:
			"https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=1200&q=80",
		publishedAt: "2026-03-26T09:10:00.000Z",
		summary: "A third launch-style fixture keeps the fallback video rails from feeling empty.",
		title: "Mission Watch: orbital handoff special report",
		url: "https://thespacedevs.com/llapi",
	},
] as const
