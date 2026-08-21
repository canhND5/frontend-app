import type { APIRoute } from 'astro'
import { encryptText } from '@/lib/aes'

// 反向代理「裸體的共產黨」電子書（純靜態多頁 HTML，資源與內鏈皆為相對路徑）。
// 掛在帶尾斜線的 /book/ 子路徑下，瀏覽器會把相對鏈接自動解析回 /book/*，無需改寫鏈接。
//
// GFW 防護：對 text/html 響應做即時加密改寫，正文與標題以 AES 混淆（複用文章的
// data-enc-html 機制 + /api/client-key + /enc.js 解密腳本），使傳輸內容不含明文中文。
const UPSTREAM = 'https://naked-ccp.pages.dev/'
const UPSTREAM_ORIGIN = new URL(UPSTREAM).origin
const GOOGLE_TAG = `<script async src="https://www.googletagmanager.com/gtag/js?id=G-9V9051J3T3"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-9V9051J3T3');</script>`

// 把上游 HTML 頁面加密成「零明文中文」的形態：
//   - <body> 內容整塊加密為一個 data-enc-html 密文
//   - <title> 換成中性文字（真標題加密存 data-enc-title，前端解密後還原）
//   - 移除含中文的 <meta name="description">
//   - 剝離 <head> 中的外部 <script>（如 book.js），解密後再注入重跑，綁到真實 DOM
//   - 注入 /enc.js 共享解密腳本
async function encryptHtml(html: string, key: string): Promise<string> {
	const parts = html.match(/([\s\S]*?<body[^>]*>)([\s\S]*)(<\/body>[\s\S]*)/i)

	// 結構異常時的兜底：整篇加密後由 document.write 還原，絕不吐明文
	if (!parts) {
		const cipher = await encryptText(html, key)
		return `<!doctype html><html lang="zh-TW"><head><meta charset="utf-8"><title></title>${GOOGLE_TAG}</head><body><div data-enc-doc="${cipher}"></div><script src="/enc.js" defer></script></body></html>`
	}

	let [, pre, bodyInner, post] = parts

	// 標題：加密真標題，頁面顯示中性標題
	let titleAttr = ''
	const titleMatch = pre.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
	if (titleMatch) {
		titleAttr = ` data-enc-title="${await encryptText(titleMatch[1], key)}"`
		pre = pre.replace(titleMatch[0], '<title></title>')
	}

	// 移除含中文的 description meta
	pre = pre.replace(/<meta\s+[^>]*name=["']description["'][^>]*>/gi, '')

	// 剝離外部 script，記下 src，解密後再注入（讓 book.js 綁到真實 DOM）
	const scriptSrcs: string[] = []
	pre = pre.replace(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*><\/script>/gi, (_m, src) => {
		scriptSrcs.push(src)
		return ''
	})

	// 解密完成後重跑被剝離的腳本（listener 需在 enc.js 派發 enc:done 前註冊）
	const loader = scriptSrcs.length
		? `<script>document.addEventListener('enc:done',function(){${JSON.stringify(scriptSrcs)}.forEach(function(s){var e=document.createElement('script');e.src=s;document.body.appendChild(e)})})</script>`
		: ''

	const injection = `${GOOGLE_TAG}${loader}<script src="/enc.js" defer></script>`
	pre = pre.includes('</head>') ? pre.replace('</head>', `${injection}</head>`) : pre + injection

	const cipher = await encryptText(bodyInner, key)
	return `${pre}<div data-enc-html="${cipher}"${titleAttr}></div>${post}`
}

export const GET: APIRoute = async ({ params, request, redirect }) => {
	const reqUrl = new URL(request.url)

	// /book（無尾斜線）→ /book/，否則首頁的相對資源會錯解析到根路徑
	if (reqUrl.pathname === '/book') {
		return redirect('/book/', 301)
	}

	const path = params.path ?? ''

	// 以固定上游 origin 解析，攔截 //evil.com、../ 逃逸等開放代理攻擊
	let target: URL
	try {
		target = new URL(path, UPSTREAM)
	} catch {
		return new Response('Bad Request', { status: 400 })
	}
	if (target.origin !== UPSTREAM_ORIGIN) {
		return new Response('Bad Request', { status: 400 })
	}
	target.search = reqUrl.search

	const rangeHeader = request.headers.get('range')
	const upstreamInit: RequestInit = rangeHeader ? { headers: { Range: rangeHeader } } : {}

	let upstream: Response
	try {
		upstream = await fetch(target.toString(), upstreamInit)
	} catch {
		return new Response('Bad Gateway', { status: 502 })
	}

	const contentType = upstream.headers.get('content-type') ?? 'application/octet-stream'

	// HTML 頁面：緩衝後加密改寫（不含明文中文再吐出）
	if (contentType.includes('text/html') && !rangeHeader) {
		const key = process.env.AES_SECRET_KEY ?? ''
		if (!key) return new Response('Not configured', { status: 503 })
		const encrypted = await encryptHtml(await upstream.text(), key)
		return new Response(encrypted, {
			status: upstream.status,
			headers: {
				'Content-Type': 'text/html; charset=utf-8',
				'Cache-Control': 'public, max-age=3600, s-maxage=86400',
			},
		})
	}

	// 非 HTML（圖片 / CSS / JS）：原樣流式透傳
	const headers: Record<string, string> = {
		'Content-Type': contentType,
		'Cache-Control': rangeHeader
			? 'private, no-store'
			: 'public, max-age=3600, s-maxage=86400',
	}
	const contentLength = upstream.headers.get('content-length')
	const contentRange = upstream.headers.get('content-range')
	const acceptRanges = upstream.headers.get('accept-ranges')
	if (contentLength) headers['Content-Length'] = contentLength
	if (contentRange) headers['Content-Range'] = contentRange
	if (acceptRanges) headers['Accept-Ranges'] = acceptRanges

	return new Response(upstream.body, { status: upstream.status, headers })
}
