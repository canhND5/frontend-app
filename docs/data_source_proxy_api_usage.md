# Data Source Proxy API Usage

This guide describes the public HTTP API exposed by the data-source proxy.
Examples use:

```text
https://data-source-api.workerproxy.workers.dev
```

Replace that host with the deployment you are calling.

## Authentication

All `/v1` endpoints require a bearer token:

```http
Authorization: Bearer <API_TOKEN>
```

Unauthenticated requests return:

```json
{
  "message": "Unauthorized"
}
```

## Endpoint Overview

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/` | No | Public service metadata. |
| `GET` | `/v1` | Yes | Authenticated version probe. |
| `GET` | `/v1/:source/lists/:listName` | Yes | Article list feed for `djy`, `kzg`, `mhw`, `ntd`, `rmb`, `rfa`, `soh`, `yah`, and `zjw`. |
| `GET` | `/v1/:source/articles/:sourceItemId` | Yes | Article detail for `djy`, `kzg`, `mhw`, `ntd`, `rmb`, `rfa`, `soh`, `yah`, and `zjw`. |
| `GET` | `/v1/gjw/tags` | Yes | GJW tag catalog. |
| `GET` | `/v1/gjw/tags/:tagId/:collection` | Yes | GJW tag-scoped article or video list. |
| `GET` | `/v1/gjw/top-stories` | Yes | GJW top-stories list. |
| `GET` | `/v1/gjw/top-news-config` | Yes | GJW top-news tab and section configuration. |
| `GET` | `/v1/gjw/videos` | Yes | GJW channel video list. |
| `GET` | `/v1/gjw/articles` | Yes | GJW channel article list. |
| `GET` | `/v1/gjw/articles/:contentId` | Yes | GJW article detail. |
| `GET` | `/v1/gjw/videos/:contentId` | Yes | GJW video detail. |
| `GET` | `/v1/x/users` | Yes | Whitelisted X users. |
| `GET` | `/v1/x/timelines/:userId` | Yes | Fetch one whitelisted X user's timeline. |
| `GET` | `/v1/x/timelines` | Yes | Aggregate cached X posts. |
| `GET` | `/v1/x/posts/:postId` | Yes | Fetch one X post detail. |
| `POST` | `/v1/media/resolve` | Yes | Resolve one media URL into a renderable delivery result. |
| `POST` | `/v1/media/batch` | Yes | Resolve up to 30 media URLs. |
| `POST` | `/v1/media/proxy` | Yes | Proxy or generate media delivery responses. |

## Public Metadata

### `GET /`

```bash
curl https://data-source-api.workerproxy.workers.dev/
```

```json
{
  "service": "data-source",
  "version": "v1"
}
```

### `GET /v1`

```bash
curl \
  -H 'Authorization: Bearer <API_TOKEN>' \
  https://data-source-api.workerproxy.workers.dev/v1
```

```json
{
  "ok": true,
  "version": "v1"
}
```

## Article Source APIs

The generic article routes use:

```text
GET /v1/:source/lists/:listName
GET /v1/:source/articles/:sourceItemId
```

Supported `:source` values are:

| Source | List route | Detail route |
| --- | --- | --- |
| `djy` | Yes | Yes |
| `kzg` | Yes | Yes |
| `mhw` | Yes | Yes |
| `ntd` | Yes | Yes |
| `rmb` | Yes | Yes |
| `rfa` | Yes | Yes |
| `soh` | Yes | Yes |
| `yah` | Yes | Yes |
| `zjw` | Yes | Yes |

GJW uses its own `/v1/gjw/*` routes instead of the generic article routes.

### Article List Pagination

`GET /v1/:source/lists/:listName` returns one normalized list feed. Pagination depends on the source.

| Query parameter | Supported sources | Description |
| --- | --- | --- |
| `pageSize` | `djy`, `kzg`, `mhw`, `ntd`, `rfa`, `soh`, `yah`, `zjw` | Maximum number of normalized list items to return. Do not use this parameter with `rmb`. |
| `page` | `djy`, `kzg`, `mhw`, `ntd`, `yah`, `zjw` | Page number for older list pages. Use the returned `nextCursor` value as the next `page`. |
| `cursor` | `rfa`, `rmb`, `soh` | Cursor for older list pages. For `rmb`, the cursor format is `YYYY-MM`. |

The response includes `nextCursor`. If it is non-null, pass it back using the continuation parameter for that source:

- For page-based sources, call the next request with `page=<nextCursor>`.
- For cursor-based sources, call the next request with `cursor=<nextCursor>`.
- If `nextCursor` is `null`, the API does not know another page for that request.

#### RMB Monthly Archive Pagination

Without a cursor, an RMB list request returns the current list for that category:

```bash
curl \
  -H 'Authorization: Bearer <API_TOKEN>' \
  'https://data-source-api.workerproxy.workers.dev/v1/rmb/lists/qiwen'
```

Use the returned `nextCursor` to fetch older monthly archives.

RMB list pagination follows the upstream monthly archive structure. Use `cursor=YYYY-MM` to request a specific month.

```bash
curl \
  -H 'Authorization: Bearer <API_TOKEN>' \
  'https://data-source-api.workerproxy.workers.dev/v1/rmb/lists/qiwen?cursor=2020-09'
```

This request reads the RMB `qiwen` archive for September 2020 and returns `nextCursor` for the previous month. For example, a September 2020 response continues with:

```json
{
  "nextCursor": "2020-08"
}
```

RMB does not support `pageSize` because each request maps to one upstream monthly archive page. To fetch older RMB articles, continue with the returned monthly cursor.

### List Examples

| Source | First request | Next request |
| --- | --- | --- |
| `djy` | `GET /v1/djy/lists/news413?pageSize=5` | `GET /v1/djy/lists/news413?page=2&pageSize=5` |
| `kzg` | `GET /v1/kzg/lists/p13?pageSize=5` | `GET /v1/kzg/lists/p13?page=2&pageSize=5` |
| `kzg` | `GET /v1/kzg/lists/precent3?pageSize=5` | `GET /v1/kzg/lists/precent3?page=2&pageSize=5` |
| `mhw` | `GET /v1/mhw/lists/fenlei73?pageSize=5` | `GET /v1/mhw/lists/fenlei73?page=2&pageSize=5` |
| `ntd` | `GET /v1/ntd/lists/news_china?pageSize=5` | `GET /v1/ntd/lists/news_china?page=2&pageSize=5` |
| `ntd` | `GET /v1/ntd/lists/headline-news?pageSize=5` | `GET /v1/ntd/lists/headline-news?page=2&pageSize=5` |
| `rmb` | `GET /v1/rmb/lists/qiwen` | `GET /v1/rmb/lists/qiwen?cursor=<nextCursor>` |
| `rfa` | `GET /v1/rfa/lists/mandarin?pageSize=5` | `GET /v1/rfa/lists/mandarin?cursor=2&pageSize=5` |
| `soh` | `GET /v1/soh/lists/term5?pageSize=5` | `GET /v1/soh/lists/term5?cursor=2&pageSize=5` |
| `yah` | `GET /v1/yah/lists/home?pageSize=5` | `GET /v1/yah/lists/home?page=2&pageSize=5` |
| `yah` | `GET /v1/yah/lists/nba?pageSize=5` | `GET /v1/yah/lists/nba?page=2&pageSize=5` |
| `zjw` | `GET /v1/zjw/lists/term81?pageSize=5` | `GET /v1/zjw/lists/term81?page=2&pageSize=5` |

Example list response:

```json
{
  "contentType": "article",
  "id": "news413",
  "items": [
    {
      "id": "20260324-n14726240",
      "sourceItemId": "20260324-n14726240",
      "title": "Article title"
    }
  ],
  "listName": "news413",
  "listUrl": "https://www.epochtimes.com/gb/news413.htm",
  "nextCursor": "2",
  "source": "djy"
}
```

### Article IDs

Always URL-encode the full `:sourceItemId` path segment before sending a detail request. This is required for IDs that contain `/`, non-ASCII characters, or slug text.

| Source | `sourceItemId` format | Example |
| --- | --- | --- |
| `djy` | `YYYYMMDD-{nid}` | `20260324-n14726240` |
| `kzg` | `YYYYMMDD-{numericId}` | `20260325-1096768` |
| `rmb` | `YYYYMMDD-{numericId}` | `20260512-95178` |
| `ntd` | `YYYYMMDD-{aid}` | `20260325-a104079606` |
| `mhw` | `YYYYMMDD-{numericId}` or `YYYYMMDD-{slug}-{numericId}` | `20260324-508086`, `20260324-ebao-508086` |
| `rfa` | Encoded upstream path | `mandarin%2Fzhengzhi%2F2026%2F03%2F24%2Fchina-xi-jinping-xiongan-new-area-a-millennium-project` |
| `soh` | Numeric article ID | `926242` |
| `yah` | `{slug}-{numericId}` | `%E5%8D%A1%E8%8F%AF%E6%9F%A5%E5%AD%A3%E5%BE%8C%E6%AD%A3%E5%BC%8F%E9%9B%A2%E7%9A%87%E9%A6%AC-122302696` |
| `zjw` | Numeric article ID | `301733` |

For `mhw`, responses may include `sourceItemIdAlt`, which is the alternate slug or id-only form when both forms are known.

### `GET /v1/:source/articles/:sourceItemId`

Returns one normalized article detail payload.

```bash
curl \
  -H 'Authorization: Bearer <API_TOKEN>' \
  https://data-source-api.workerproxy.workers.dev/v1/djy/articles/20260324-n14726240
```

Detail examples:

| Source | Request |
| --- | --- |
| `djy` | `GET /v1/djy/articles/20260324-n14726240` |
| `kzg` | `GET /v1/kzg/articles/20260325-1096768` |
| `mhw` | `GET /v1/mhw/articles/20260324-ebao-508086` |
| `mhw` | `GET /v1/mhw/articles/20260324-508086` |
| `ntd` | `GET /v1/ntd/articles/20260325-a104079606` |
| `rmb` | `GET /v1/rmb/articles/20260512-95178` |
| `rfa` | `GET /v1/rfa/articles/mandarin%2Fzhengzhi%2F2026%2F03%2F24%2Fchina-xi-jinping-xiongan-new-area-a-millennium-project` |
| `soh` | `GET /v1/soh/articles/926242` |
| `yah` | `GET /v1/yah/articles/%E5%8D%A1%E8%8F%AF%E6%9F%A5%E5%AD%A3%E5%BE%8C%E6%AD%A3%E5%BC%8F%E9%9B%A2%E7%9A%87%E9%A6%AC-122302696` |
| `zjw` | `GET /v1/zjw/articles/301733` |

Example response:

```json
{
  "bodyHtml": "<p>Article body.</p><p><img data-pocket-resource=\"res_001\" /></p>",
  "bodyMode": "live",
  "bodyText": "Article body.",
  "canonicalUrl": "https://www.epochtimes.com/gb/26/3/24/n14726240.htm",
  "contentType": "article",
  "fetchedAt": "2026-03-26T00:00:00.000Z",
  "id": "20260324-n14726240",
  "publishedAt": "2026-03-24T08:00:00.000Z",
  "resourcePlaceholderMode": "data-attribute",
  "resources": [
    {
      "deliveryHint": "proxy",
      "key": "res_001",
      "originalUrl": "https://img.epochtimes.com/cover.jpg",
      "status": "supported",
      "type": "image"
    }
  ],
  "source": "djy",
  "sourceItemId": "20260324-n14726240",
  "summary": "Article summary.",
  "title": "Article title"
}
```

### Article Details With Resolved Media

Article detail routes support:

```text
?include=media
```

When `include=media` is set, also send:

```http
X-User-Fingerprint: <STABLE_USER_FINGERPRINT>
```

The response appends `resolvedResources` for supported article media. Use this shortcut when one request should return both article content and media delivery data. For stricter cache control, fetch the article first and then send `resources[]` to `POST /v1/media/batch`.

```bash
curl \
  -H 'Authorization: Bearer <API_TOKEN>' \
  -H 'X-User-Fingerprint: QWxpY2U=' \
  'https://data-source-api.workerproxy.workers.dev/v1/djy/articles/20260324-n14726240?include=media'
```

## NTD APIs

NTD uses the generic article routes (`GET /v1/ntd/lists/:listName` and
`GET /v1/ntd/articles/:sourceItemId`); it has no dedicated routes. This section lists the
NTD list names the proxy currently serves and their pagination.

NTD `listName` values are derived from the upstream NTDTV list path: the segment after
`/gb/`, with a trailing `.html` removed and `/` replaced by `_`. For example,
`https://www.ntdtv.com/gb/programs/weekly-economic-review` is exposed as
`programs_weekly-economic-review`.

### NTD List Names

| `listName` | Upstream list URL |
| --- | --- |
| `headline-news` | `https://www.ntdtv.com/gb/headline-news.html` |
| `news_china` | `https://www.ntdtv.com/gb/news/china` |
| `commentary` | `https://www.ntdtv.com/gb/commentary` |
| `programs_weekly-economic-review` | `https://www.ntdtv.com/gb/programs/weekly-economic-review` |
| `programs_asia-pacific-financial-trends` | `https://www.ntdtv.com/gb/programs/asia-pacific-financial-trends` |
| `programs_community-wide-angle-lens-full-episode` | `https://www.ntdtv.com/gb/programs/community-wide-angle-lens-full-episode` |
| `programs_beauty-within` | `https://www.ntdtv.com/gb/programs/beauty-within` |
| `programs_daily-life-houston` | `https://www.ntdtv.com/gb/programs/daily-life-houston` |
| `programs_cici-food-paradise` | `https://www.ntdtv.com/gb/programs/cici-food-paradise` |

> NTD list names changed when NTDTV migrated its program pages. Earlier `prog{N}` names
> (for example `prog204`) are no longer served and now return `400 Unsupported listName`.
> Use the names above.

### NTD List Pagination

NTD lists support `pageSize` and `page` (see [Article List Pagination](#article-list-pagination)).
Pass the returned `nextCursor` back as `page` to read older list pages.

```bash
curl \
  -H 'Authorization: Bearer <API_TOKEN>' \
  'https://data-source-api.workerproxy.workers.dev/v1/ntd/lists/programs_weekly-economic-review?pageSize=5'
```

Continue with:

```text
GET /v1/ntd/lists/programs_weekly-economic-review?page=2&pageSize=5
```

### NTD Article Detail

NTD article IDs use the `YYYYMMDD-{aid}` format (see [Article IDs](#article-ids)).

```bash
curl \
  -H 'Authorization: Bearer <API_TOKEN>' \
  https://data-source-api.workerproxy.workers.dev/v1/ntd/articles/20260325-a104079606
```

## GJW APIs

GJW endpoints use `/v1/gjw/*`.

### GJW List Behavior

GJW list endpoints normalize upstream content into `article`, `video`, `mixed`, or `live` responses:

- `GET /v1/gjw/videos` returns video items and excludes live streams.
- `GET /v1/gjw/articles` returns article items.
- `GET /v1/gjw/tags/:tagId/videos` returns video items for a tag and excludes live streams.
- `GET /v1/gjw/tags/:tagId/articles` returns article items for a tag.
- `GET /v1/gjw/top-stories` returns videos by default. Add `?mix` for the mixed rail or `?live` for live entries only.

### `GET /v1/gjw/top-stories`

Supported query modes:

| Query | Response |
| --- | --- |
| none | Video-only list with `contentType: "video"`. |
| `?mix` | Mixed list with `contentType: "mixed"`. |
| `?live` | Live-only list with `contentType: "live"`. |

```bash
curl \
  -H 'Authorization: Bearer <API_TOKEN>' \
  https://data-source-api.workerproxy.workers.dev/v1/gjw/top-stories
```

Example response:

```json
{
  "contentType": "video",
  "id": "top_stories",
  "items": [
    {
      "channelName": "Channel name",
      "contentType": "video",
      "duration": 896,
      "id": "1igdofnr0f12AOiIJgsK1MJ1o1uj1c",
      "title": "Video title"
    }
  ],
  "name": "Top Stories",
  "source": "gjw"
}
```

### `GET /v1/gjw/top-news-config`

Returns the GJW headline and topic configuration used by top-news clients. Clients can use returned tag and section IDs to build tag-scoped requests.

```bash
curl \
  -H 'Authorization: Bearer <API_TOKEN>' \
  https://data-source-api.workerproxy.workers.dev/v1/gjw/top-news-config
```

Example response:

```json
{
  "headlines": [
    {
      "id": "tag_1777168036824",
      "name": "Headline topic",
      "type": "tag"
    }
  ],
  "id": "top_news_config",
  "source": "gjw",
  "topNews": [
    {
      "name": "Hot stories",
      "sections": [
        {
          "id": "tag_1777168036824_video",
          "name": "Headline topic",
          "ts": 1777277570475,
          "type": ""
        }
      ]
    }
  ]
}
```

### `GET /v1/gjw/tags`

Returns the public GJW tag catalog.

```bash
curl \
  -H 'Authorization: Bearer <API_TOKEN>' \
  https://data-source-api.workerproxy.workers.dev/v1/gjw/tags
```

```json
{
  "items": [
    {
      "id": "tag_1750255840270",
      "name": "Articles"
    }
  ],
  "source": "gjw"
}
```

### `GET /v1/gjw/tags/:tagId/:collection`

Returns a tag-scoped GJW list. `:collection` must be `articles` or `videos`.

Supported query parameters:

| Query parameter | Required | Description |
| --- | --- | --- |
| `pageSize` | No | Maximum items to return. |
| `startKey` | No | Continuation cursor from the previous response's `nextStartKey`. |

```bash
curl \
  -H 'Authorization: Bearer <API_TOKEN>' \
  'https://data-source-api.workerproxy.workers.dev/v1/gjw/tags/tag_1750255840270/videos?pageSize=1'
```

Example response:

```json
{
  "contentType": "video",
  "id": "tag_1750255840270",
  "items": [
    {
      "duration": 90,
      "id": "1videoContentId",
      "title": "Video title"
    }
  ],
  "nextStartKey": "next_key",
  "source": "gjw"
}
```

Continue with:

```text
GET /v1/gjw/tags/tag_1750255840270/videos?startKey=next_key&pageSize=1
```

GJW list cursors are upstream pagination keys. Treat `nextStartKey` as an opaque value and pass it back unchanged as `startKey`.

### `GET /v1/gjw/videos`

Returns one GJW channel video list.

Supported query parameters:

| Query parameter | Required | Description |
| --- | --- | --- |
| `channelId` | Yes | GJW channel ID. |
| `pageSize` | No | Maximum items to return. |
| `startKey` | No | Continuation cursor from the previous response's `nextStartKey`. |

```bash
curl \
  -H 'Authorization: Bearer <API_TOKEN>' \
  'https://data-source-api.workerproxy.workers.dev/v1/gjw/videos?channelId=1hlt5at7lkt21We0lClMZRdUA13b0c&pageSize=1'
```

Example response:

```json
{
  "contentType": "video",
  "id": "1hlt5at7lkt21We0lClMZRdUA13b0c",
  "items": [
    {
      "duration": 120,
      "id": "1videoContentId",
      "title": "Video title"
    }
  ],
  "nextStartKey": "next_video_key",
  "source": "gjw"
}
```

Continue with `startKey=<nextStartKey>`. The value is an opaque upstream pagination key, not a page number.

### `GET /v1/gjw/articles`

Returns one GJW channel article list.

Supported query parameters:

| Query parameter | Required | Description |
| --- | --- | --- |
| `channelId` | Yes | GJW channel ID. |
| `pageSize` | No | Maximum items to return. |
| `startKey` | No | Continuation cursor from the previous response's `nextStartKey`. |

```bash
curl \
  -H 'Authorization: Bearer <API_TOKEN>' \
  'https://data-source-api.workerproxy.workers.dev/v1/gjw/articles?channelId=1eiqjdnq7go1Ob8KfCIhKyZne1vp0c&pageSize=1'
```

Example response:

```json
{
  "contentType": "article",
  "id": "1eiqjdnq7go1Ob8KfCIhKyZne1vp0c",
  "items": [
    {
      "id": "1idq2m826nv5ZrzeCTph0kOzS1a31c",
      "title": "Article title"
    }
  ],
  "nextStartKey": "next_article_key",
  "source": "gjw"
}
```

Continue with `startKey=<nextStartKey>`. The value is an opaque upstream pagination key, not a page number.

### `GET /v1/gjw/articles/:contentId`

Returns one GJW article detail payload. Video IDs are rejected by this route.

```bash
curl \
  -H 'Authorization: Bearer <API_TOKEN>' \
  https://data-source-api.workerproxy.workers.dev/v1/gjw/articles/1idq2m826nv5ZrzeCTph0kOzS1a31c
```

Like generic article detail routes, this endpoint supports `?include=media` with `X-User-Fingerprint`.

Example response:

```json
{
  "contentType": "article",
  "id": "gjw:1idq2m826nv5ZrzeCTph0kOzS1a31c",
  "resources": [
    {
      "deliveryHint": "edge-resolve",
      "key": "res_001",
      "originalUrl": "https://static.ganjingworld.com/cover.jpg",
      "status": "supported",
      "type": "image"
    }
  ],
  "source": "gjw",
  "sourceItemId": "1idq2m826nv5ZrzeCTph0kOzS1a31c",
  "tags": [
    {
      "id": "tag_1750255840270",
      "name": "Articles"
    }
  ],
  "title": "Article title"
}
```

### `GET /v1/gjw/videos/:contentId`

Returns one GJW video detail payload.

```bash
curl \
  -H 'Authorization: Bearer <API_TOKEN>' \
  https://data-source-api.workerproxy.workers.dev/v1/gjw/videos/1videoContentId
```

Example response:

```json
{
  "canonicalUrl": "https://www.ganjingworld.com/video/1videoContentId",
  "contentType": "video",
  "id": "gjw:1videoContentId",
  "posterVideoUrl": "https://www.ganjingworld.com/video/1videoContentId",
  "source": "gjw",
  "sourceItemId": "1videoContentId",
  "title": "Video title"
}
```

## X APIs

X endpoints use `/v1/x/*`. The API only exposes configured whitelisted users and posts whose root author is whitelisted. Post responses preserve common X fields such as `created_at` and `public_metrics`, and add normalized convenience fields such as `author`, `media`, and `referencedPosts` when those objects are available.

### `GET /v1/x/users`

Returns whitelisted X users. This route does not paginate.

```bash
curl \
  -H 'Authorization: Bearer <API_TOKEN>' \
  https://data-source-api.workerproxy.workers.dev/v1/x/users
```

Example response:

```json
{
  "items": [
    {
      "id": "2244994945",
      "name": "X Developers",
      "profile_image_url": "https://example.com/avatar.jpg",
      "username": "xdevelopers"
    }
  ]
}
```

### `GET /v1/x/timelines/:userId`

Fetches one whitelisted user's X timeline and returns newest-first posts.

Supported query parameters:

| Query parameter | Required | Description |
| --- | --- | --- |
| `pageSize` | No | Defaults to `30`; valid range is `5..100`. |
| `cursor` | No | X post ID cursor. Use the returned `nextCursor` to fetch older posts. |

```bash
curl \
  -H 'Authorization: Bearer <API_TOKEN>' \
  'https://data-source-api.workerproxy.workers.dev/v1/x/timelines/2244994945?pageSize=30'
```

Continuation example:

```bash
curl \
  -H 'Authorization: Bearer <API_TOKEN>' \
  'https://data-source-api.workerproxy.workers.dev/v1/x/timelines/2244994945?pageSize=30&cursor=1800000000000000002'
```

Example response:

```json
{
  "items": [
    {
      "author": {
        "id": "2244994945",
        "name": "X Developers",
        "username": "xdevelopers"
      },
      "created_at": "2026-05-05T00:00:00.000Z",
      "id": "1800000000000000001",
      "media": [
        {
          "media_key": "3_1800000000000000001",
          "mediaKey": "3_1800000000000000001",
          "r2Key": "x/media/3_1800000000000000001",
          "type": "photo",
          "url": "https://pbs.twimg.com/media/3_1800000000000000001.jpg"
        }
      ],
      "public_metrics": {
        "like_count": 1,
        "retweet_count": 0
      },
      "referencedPosts": [],
      "text": "Post text"
    }
  ],
  "nextCursor": "1800000000000000001"
}
```

### `GET /v1/x/timelines`

Returns cached X posts across whitelisted users. This route does not call X directly; it only returns posts already cached by prior timeline or post-detail requests.

Supported query parameters:

| Query parameter | Required | Description |
| --- | --- | --- |
| `pageSize` | No | Defaults to `30`; valid range is `1..100`. |
| `cursor` | No | X post ID cursor. Use the returned `nextCursor` to fetch older cached posts. |

```bash
curl \
  -H 'Authorization: Bearer <API_TOKEN>' \
  'https://data-source-api.workerproxy.workers.dev/v1/x/timelines?pageSize=30'
```

### `GET /v1/x/posts/:postId`

Fetches one X post detail. The root author must be whitelisted.

```bash
curl \
  -H 'Authorization: Bearer <API_TOKEN>' \
  https://data-source-api.workerproxy.workers.dev/v1/x/posts/1800000000000000002
```

Example response:

```json
{
  "author": {
    "id": "2244994945",
    "name": "X Developers",
    "username": "xdevelopers"
  },
  "created_at": "2026-05-05T00:00:00.000Z",
  "id": "1800000000000000002",
  "media": [
    {
      "media_key": "3_1800000000000000002",
      "mediaKey": "3_1800000000000000002",
      "r2Key": "x/media/3_1800000000000000002",
      "type": "photo",
      "url": "https://pbs.twimg.com/media/3_1800000000000000002.jpg"
    }
  ],
  "public_metrics": {
    "like_count": 1
  },
  "referencedPosts": [
    {
      "author": {
        "id": "2244994945",
        "username": "xdevelopers"
      },
      "created_at": "2026-05-05T00:00:00.000Z",
      "id": "1800000000000000001",
      "public_metrics": {
        "like_count": 0
      },
      "referenceType": "retweeted",
      "text": "Referenced post"
    }
  ],
  "text": "Post text"
}
```

## Media APIs

Media endpoints support resources from:

- `djy`
- `gjw`
- `kzg`
- `mhw`
- `ntd`
- `rmb`
- `rfa`
- `soh`
- `yah`
- `zjw`

All media requests require a stable `userFingerprint`. Use the same value across `resolve`, `batch`, and `proxy` calls for the same user/session so node allocation remains consistent.

### Media Request Fields

| Field | Scope | Required | Description |
| --- | --- | --- | --- |
| `source` | Single request body or each batch item | Yes | Source key such as `djy`, `gjw`, or `rmb`. |
| `url` | Single request body or each batch item | Yes | Absolute `http` or `https` media URL. |
| `userFingerprint` | Top-level request body | Yes | Stable caller fingerprint used for media delivery decisions. |
| `key` | Single request body or each batch item | No | Client resource key. Usually copied from article `resources[].key`. |

### `POST /v1/media/resolve`

Resolves one media URL into a consumable delivery result. The result may be a direct URL, an allocated-node handoff, or metadata for a generated manifest flow.

```bash
curl \
  -X POST \
  -H 'Authorization: Bearer <API_TOKEN>' \
  -H 'Content-Type: application/json' \
  -d '{"source":"gjw","userFingerprint":"QWxpY2U=","url":"https://www.ganjingworld.com/video/test-video"}' \
  https://data-source-api.workerproxy.workers.dev/v1/media/resolve
```

Example response:

```json
{
  "deliveryHint": "allocated-node",
  "deliveryPath": null,
  "key": "res_7a89f1d1",
  "node": {
    "address": "198.51.100.10"
  },
  "originalUrl": "https://www.ganjingworld.com/video/test-video",
  "resolvedUrl": "https://198.51.100.10/",
  "source": "gjw",
  "sourceHost": "www.ganjingworld.com",
  "status": "supported",
  "type": "video",
  "userFingerprint": "QWxpY2U="
}
```

### `POST /v1/media/batch`

Resolves up to 30 media URLs in one response. This is the recommended follow-up after fetching article detail: collect supported `resources[]`, send their `key`, `source`, and `originalUrl`, and use the response to render images, media players, or node handoffs.

Invalid items do not fail the whole batch. They return `status: "unsupported"` with an error message. Invalid top-level requests, such as missing `userFingerprint`, missing `items`, empty `items`, or more than 30 items, return `400`.

```bash
curl \
  -X POST \
  -H 'Authorization: Bearer <API_TOKEN>' \
  -H 'Content-Type: application/json' \
  -d '{"userFingerprint":"QWxpY2U=","items":[{"key":"res_001","source":"gjw","url":"https://static.ganjingworld.com/cover.jpg"}]}' \
  https://data-source-api.workerproxy.workers.dev/v1/media/batch
```

Example response:

```json
{
  "items": [
    {
      "deliveryHint": "edge-resolve",
      "deliveryPath": null,
      "index": 0,
      "key": "res_001",
      "node": null,
      "originalUrl": "https://static.ganjingworld.com/cover.jpg",
      "resolvedUrl": "https://static.ganjingworld.com/cover.jpg",
      "source": "gjw",
      "sourceHost": "static.ganjingworld.com",
      "status": "supported",
      "type": "image",
      "userFingerprint": "QWxpY2U="
    },
    {
      "error": {
        "message": "Unsupported source"
      },
      "index": 1,
      "key": "res_bad",
      "originalUrl": "https://example.com/bad.jpg",
      "source": "notreal",
      "status": "unsupported"
    }
  ]
}
```

### `POST /v1/media/proxy`

Executes media delivery inside the proxy. Depending on the resolved strategy, the response may be:

- Raw media bytes.
- Raw manifest bytes.
- A redirect response.
- A generated root m3u8 that hands follow-up traffic to one allocated node.

```bash
curl \
  -X POST \
  -H 'Authorization: Bearer <API_TOKEN>' \
  -H 'Content-Type: application/json' \
  -d '{"source":"gjw","userFingerprint":"QWxpY2U=","url":"https://www.ganjingworld.com/video/test-video"}' \
  https://data-source-api.workerproxy.workers.dev/v1/media/proxy \
  --output root.m3u8
```

Successful responses follow the selected media delivery strategy. If the URL is not allowed by media policy, the route returns:

```json
{
  "message": "Media blocked"
}
```

## Error Responses

Errors are JSON objects:

```json
{
  "message": "<reason>"
}
```

Common errors:

| Status | Message | Meaning |
| --- | --- | --- |
| `400` | `Bad Request` | Invalid JSON request body. |
| `400` | `Unsupported listName` | Unknown generic source or unsupported generic list. |
| `400` | `Invalid cursor` | Invalid list cursor, including non-`YYYY-MM` RMB cursors. |
| `400` | `Invalid sourceItemId` | Invalid generic article ID format. |
| `400` | `Unsupported source` | Unsupported media source. |
| `400` | `Invalid media batch` | `/v1/media/batch` received missing, empty, or more than 30 `items`. |
| `400` | `Unsupported collection` | GJW tag collection is not `articles` or `videos`. |
| `400` | `Invalid channelId` | Invalid `channelId` on GJW list routes. |
| `400` | `Invalid startKey` | Invalid `startKey` on GJW list routes. |
| `400` | `Invalid pageSize` | Invalid `pageSize` on GJW list routes. |
| `400` | `Invalid contentId` | Invalid `contentId` on GJW detail routes. |
| `400` | `Invalid tagId` | Invalid `tagId` on GJW tag routes. |
| `400` | `Invalid url` | Missing or non-HTTP(S) media URL. |
| `400` | `Missing user fingerprint` | Media request omitted `userFingerprint`, or article `?include=media` omitted `X-User-Fingerprint`. |
| `401` | `Unauthorized` | Missing or invalid bearer token. |
| `403` | `Forbidden` | X user or root post author is not whitelisted. |
| `403` | `Media blocked` | Media policy denied proxying. |
| `404` | `Content not found` | Valid-looking content ID but no content exists. |
| `404` | `Not Found` | Unknown route. |
| `502` | `Upstream error` | Media upstream returned an error. |
| `502` | `Upstream unavailable` | Upstream service request failed. |

## Quick Examples

```bash
curl https://data-source-api.workerproxy.workers.dev/
```

```bash
curl -H 'Authorization: Bearer <API_TOKEN>' https://data-source-api.workerproxy.workers.dev/v1
```

```bash
curl -H 'Authorization: Bearer <API_TOKEN>' \
  'https://data-source-api.workerproxy.workers.dev/v1/djy/lists/news413?pageSize=5'
```

```bash
curl -H 'Authorization: Bearer <API_TOKEN>' \
  'https://data-source-api.workerproxy.workers.dev/v1/rmb/lists/qiwen?cursor=2020-09'
```

```bash
curl -H 'Authorization: Bearer <API_TOKEN>' \
  https://data-source-api.workerproxy.workers.dev/v1/djy/articles/20260324-n14726240
```

```bash
curl -H 'Authorization: Bearer <API_TOKEN>' \
  https://data-source-api.workerproxy.workers.dev/v1/gjw/top-stories
```

```bash
curl -H 'Authorization: Bearer <API_TOKEN>' \
  'https://data-source-api.workerproxy.workers.dev/v1/gjw/videos?channelId=1hlt5at7lkt21We0lClMZRdUA13b0c&pageSize=1'
```

```bash
curl -H 'Authorization: Bearer <API_TOKEN>' \
  'https://data-source-api.workerproxy.workers.dev/v1/x/timelines/2244994945?pageSize=30'
```

```bash
curl -X POST \
  -H 'Authorization: Bearer <API_TOKEN>' \
  -H 'Content-Type: application/json' \
  -d '{"userFingerprint":"QWxpY2U=","items":[{"key":"res_001","source":"gjw","url":"https://static.ganjingworld.com/cover.jpg"}]}' \
  https://data-source-api.workerproxy.workers.dev/v1/media/batch
```
