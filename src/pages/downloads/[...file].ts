import type { APIRoute } from 'astro'
import { env } from 'cloudflare:workers'

// 書籍下載服務。文件存於 R2（超出 Cloudflare Pages 25 MiB 靜態上限，且避免 git 倉庫膨脹）。
// 白名單映射「中性 URL 檔名 → R2 key」，遮蔽書名；串流轉發並支持 Range 續傳。
const FILES: Record<string, { key: string; type: string }> = {
	'vol-1.pdf': { key: 'vol-1.pdf', type: 'application/pdf' },
	'vol-2.pdf': { key: 'vol-2.pdf', type: 'application/pdf' },
	'vol-1.epub': { key: 'vol-1.epub', type: 'application/epub+zip' },
	'vol-2.epub': { key: 'vol-2.epub', type: 'application/epub+zip' },
}

function parseRange(header: string): R2Range | undefined {
	const m = /^bytes=(\d*)-(\d*)$/.exec(header.trim())
	if (!m) return undefined
	const start = m[1] ? parseInt(m[1], 10) : undefined
	const end = m[2] ? parseInt(m[2], 10) : undefined
	if (start !== undefined && end !== undefined) return { offset: start, length: end - start + 1 }
	if (start !== undefined) return { offset: start }
	if (end !== undefined) return { suffix: end }
	return undefined
}

export const GET: APIRoute = async ({ params, request }) => {
	const meta = FILES[params.file ?? '']
	if (!meta) return new Response('Not Found', { status: 404 })

	const bucket = (env as Partial<Env>).BOOK_FILES
	if (!bucket) return new Response('Downloads unavailable in this environment', { status: 503 })

	const rangeHeader = request.headers.get('range')
	const range = rangeHeader ? parseRange(rangeHeader) : undefined

	let object: R2ObjectBody | null
	try {
		object = await bucket.get(meta.key, range ? { range } : undefined)
	} catch {
		return new Response('Bad Gateway', { status: 502 })
	}
	if (!object) return new Response('Not Found', { status: 404 })

	const headers = new Headers()
	headers.set('Content-Type', meta.type)
	headers.set('Content-Disposition', `attachment; filename="${params.file}"`)
	headers.set('Accept-Ranges', 'bytes')
	headers.set('Cache-Control', 'public, max-age=86400, s-maxage=604800')
	headers.set('ETag', object.httpEtag)

	if (range && object.range) {
		const offset = 'offset' in object.range && object.range.offset != null ? object.range.offset : 0
		const length = 'length' in object.range && object.range.length != null
			? object.range.length
			: object.size - offset
		headers.set('Content-Range', `bytes ${offset}-${offset + length - 1}/${object.size}`)
		headers.set('Content-Length', String(length))
		return new Response(object.body, { status: 206, headers })
	}

	headers.set('Content-Length', String(object.size))
	return new Response(object.body, { status: 200, headers })
}
