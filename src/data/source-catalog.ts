import { djyLists } from "@/data/source-lists/djy"
import { kzgLists } from "@/data/source-lists/kzg"
import { mhwLists } from "@/data/source-lists/mhw"
import { ntdLists } from "@/data/source-lists/ntd"
import { rfaLists } from "@/data/source-lists/rfa"
import { sohLists } from "@/data/source-lists/soh"
import { zjwLists } from "@/data/source-lists/zjw"

/** Featured GJW video tag used on the demo homepage. */
export const featuredGjwVideoTagId = "tag_zh-TW_cat32"

/** Featured GJW article tag used on the demo homepage. */
export const featuredGjwArticleTagId = "tag_1750255840270"

/** Featured GJW channel used on the demo homepage. */
export const featuredGjwArticleChannelId = "1eiqjdnq7go1Ob8KfCIhKyZne1vp0c"

/** Featured GJW video channel used on the demo homepage. */
export const featuredGjwVideoChannelId = "1hlt5at7lkt21We0lClMZRdUA13b0c"

/** Source catalog entry for grouped list browsing. */
export interface SourceCatalogEntry {
	id: string
	name: string
	description: string
	continuationParam: "cursor" | "page"
	lists: readonly string[]
}

/** Non-GJW list catalog derived from `docs/APIs.md`. */
export const sourceCatalog: SourceCatalogEntry[] = [
	{
		id: "djy",
		name: "DJY",
		description: "Epoch Times style article lists with page-based continuation.",
		continuationParam: "page",
		lists: djyLists,
	},
	{
		id: "ntd",
		name: "NTD",
		description: "NTD article lists with page-based continuation.",
		continuationParam: "page",
		lists: ntdLists,
	},
	{
		id: "soh",
		name: "SOH",
		description: "SOH GraphQL-backed list feeds with cursor continuation.",
		continuationParam: "cursor",
		lists: sohLists,
	},
	{
		id: "kzg",
		name: "KZG",
		description: "KZG article lists with page-based continuation.",
		continuationParam: "page",
		lists: kzgLists,
	},
	{
		id: "mhw",
		name: "MHW",
		description: "MHW article lists with page-based continuation.",
		continuationParam: "page",
		lists: mhwLists,
	},
	{
		id: "zjw",
		name: "ZJW",
		description: "ZJW article lists with page-based continuation.",
		continuationParam: "page",
		lists: zjwLists,
	},
	{
		id: "rfa",
		name: "RFA",
		description: "RFA article lists with slash-safe content ids and cursor continuation.",
		continuationParam: "cursor",
		lists: rfaLists,
	},
]

/** Lookup a catalog entry by its route source id. */
export function getSourceCatalogEntry(sourceId: string): SourceCatalogEntry | undefined {
	return sourceCatalog.find((entry) => entry.id === sourceId)
}

/** Resolve the default public list name for a source id. */
export function getDefaultListName(sourceId: string): string | undefined {
	return getSourceCatalogEntry(sourceId)?.lists[0]
}
