const SOURCE_NAMES: Record<string, string> = {
	ntd: 'NTD 新唐人',
	djy: '大紀元',
	gjw: '乾淨世界',
	kzg: '看中國',
	soh: '希望之聲',
	rfa: '自由亞洲',
	mhw: '明慧網',
	zjw: '正見網',
}

export function sourceDisplayName(code: string): string {
	return SOURCE_NAMES[code] ?? code.toUpperCase()
}

export function timeAgo(dateStr: string | null | undefined): string {
	if (!dateStr) return ''
	const date = new Date(dateStr)
	if (Number.isNaN(date.getTime())) return ''
	const diffMin = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000))
	if (diffMin < 1) return '剛剛'
	if (diffMin < 60) return `${diffMin} 分鐘前`
	const diffH = Math.floor(diffMin / 60)
	if (diffH < 24) return `${diffH} 小時前`
	const year = date.getFullYear() !== new Date().getFullYear() ? `${date.getFullYear()}年` : ''
	return `${year}${date.getMonth() + 1}月${date.getDate()}日`
}
