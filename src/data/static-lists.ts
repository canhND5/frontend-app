/** Static fixture data for list pages (to be replaced by API data). */

export const topicChips = [
  '全部話題', '時政', '台灣', '香港', '人權',
  '經濟', '新疆', '法輪功', '三退', '社會', '國際',
];

// ─── VIDEOS ────────────────────────────────────────────────

export interface VideoChannel {
  id: string;
  name: string;
  initial: string;
  gradient: string;
}

export interface VideoItem {
  id: string;
  title: string;
  channelId: string;
  channelName: string;
  channelColor: string;
  platform: string;
  platformColor: string;
  duration: string;
  views: string;
  timeAgo: string;
  thumbGradient: string;
}

export const videoChannels: VideoChannel[] = [
  { id: 'all',  name: '全部',       initial: '全', gradient: 'from-[oklch(28%_0.13_264)] to-[oklch(48%_0.13_264)]' },
  { id: 'ntd',  name: 'NTD 新唐人', initial: 'N',  gradient: 'from-[#8b0000] to-[#cc1111]' },
  { id: 'djy',  name: '大紀元 YT',  initial: '大', gradient: 'from-[#5c0a0a] to-[#c0392b]' },
  { id: 'gjw',  name: '干净世界',   initial: '净', gradient: 'from-[#3a1060] to-[#7b2fbf]' },
  { id: 'soh',  name: '希望之聲',   initial: '聲', gradient: 'from-[#0a3060] to-[#1560a8]' },
];

export const videoItems: VideoItem[] = [
  {
    id: 'v1',
    title: '【獨家揭秘】中共高層內鬥加劇，多名政治局委員遭秘密調查',
    channelId: 'ntd', channelName: 'NTD 新唐人', channelColor: '#cc1111',
    platform: 'YouTube', platformColor: '#cc1111',
    duration: '18:42', views: '124K', timeAgo: '3小時前',
    thumbGradient: 'from-[#0f1e3a] to-[#1a3a6a]',
  },
  {
    id: 'v2',
    title: '台灣問題最新進展：解放軍動向深度分析',
    channelId: 'gjw', channelName: '干净世界官方', channelColor: '#7b2fbf',
    platform: '干净世界', platformColor: '#7b2fbf',
    duration: '25:18', views: '89K', timeAgo: '5小時前',
    thumbGradient: 'from-[#1a0f3a] to-[#3a1a7a]',
  },
  {
    id: 'v3',
    title: '中國經濟真相：外資大規模撤離，恒大餘波未止',
    channelId: 'djy', channelName: '大紀元 YouTube', channelColor: '#c0392b',
    platform: 'YouTube', platformColor: '#c0392b',
    duration: '31:47', views: '67K', timeAgo: '8小時前',
    thumbGradient: 'from-[#0f2a1a] to-[#1a5232]',
  },
  {
    id: 'v4',
    title: '新疆維吾爾人口減少之謎：衛星圖像與人口統計數字背後',
    channelId: 'soh', channelName: '希望之聲', channelColor: '#1560a8',
    platform: 'YouTube', platformColor: '#1560a8',
    duration: '22:05', views: '45K', timeAgo: '12小時前',
    thumbGradient: 'from-[#0a1a3a] to-[#0f3060]',
  },
];

// ─── ARTICLES ──────────────────────────────────────────────

export interface ArticleSource {
  id: string;
  name: string;
  color: string;
}

export interface ArticleItem {
  id: string;
  title: string;
  excerpt?: string;
  sourceId: string;
  sourceName: string;
  sourceColor: string;
  timeAgo: string;
  comments: number;
  featured?: boolean;
  thumbGradient: string;
}

export const articleSources: ArticleSource[] = [
  { id: 'all',  name: '全部來源', color: '' },
  { id: 'djy',  name: '大紀元',  color: '#c0392b' },
  { id: 'soh',  name: '希望之聲', color: '#1560a8' },
  { id: 'kzg',  name: '看中國',  color: '#1a7a4a' },
  { id: 'other',name: '其他',    color: '#7d6608' },
];

export const articleItems: ArticleItem[] = [
  {
    id: 'a1', featured: true,
    title: '中共「清零」後遺症：封控政策對中國社會的深層創傷與長期影響',
    excerpt: '歷時三年的嚴苛封控已結束，然而留下的心理創傷、經濟重創仍深刻影響數億民衆……',
    sourceId: 'djy', sourceName: '大紀元', sourceColor: '#c0392b',
    timeAgo: '2小時前', comments: 342,
    thumbGradient: 'from-[#0f1e3a] to-[#1e3d70]',
  },
  {
    id: 'a2',
    title: '習近平內部講話罕見承認經濟困境，要求黨員「保持信心」',
    sourceId: 'soh', sourceName: '希望之聲', sourceColor: '#1560a8',
    timeAgo: '1小時前', comments: 178,
    thumbGradient: 'from-[#0f2540] to-[#1560a8]',
  },
  {
    id: 'a3',
    title: '地下教會遭打壓：河南百名基督徒被捕，教堂強制拆除',
    sourceId: 'kzg', sourceName: '看中國', sourceColor: '#1a7a4a',
    timeAgo: '3小時前', comments: 95,
    thumbGradient: 'from-[#0f2a1a] to-[#1a6640]',
  },
  {
    id: 'a4',
    title: '人民幣貶值壓力持續：外匯儲備下跌背後的隱憂',
    sourceId: 'djy', sourceName: '大紀元', sourceColor: '#c0392b',
    timeAgo: '5小時前', comments: 63,
    thumbGradient: 'from-[#251a0f] to-[#7d4e1a]',
  },
];

// ─── TWITTER ───────────────────────────────────────────────

export interface TwitterAccount {
  id: string;
  name: string;
  initial: string;
  gradient: string;
}

export interface TweetItem {
  id: string;
  authorName: string;
  authorHandle: string;
  authorInitial: string;
  authorGradient: string;
  text: string;
  hasMedia?: boolean;
  topics: string[];
  timeAgo: string;
  retweets: number;
  likes: number;
}

export const twitterAccounts: TwitterAccount[] = [
  { id: 'all',      name: '全部',          initial: '全', gradient: 'from-[oklch(28%_0.13_264)] to-[oklch(48%_0.13_264)]' },
  { id: 'jennifer', name: 'Jennifer Zeng', initial: 'J',  gradient: 'from-[#0a3a60] to-[#1260a0]' },
  { id: 'gordon',   name: 'Gordon Chang',  initial: 'G',  gradient: 'from-[#3a1010] to-[#9a2020]' },
  { id: 'miles',    name: 'Miles Guo',     initial: 'M',  gradient: 'from-[#1a0f3a] to-[#5a2a9a]' },
  { id: 'li',       name: '李正寬',         initial: '李', gradient: 'from-[#0f2a0f] to-[#1a6a30]' },
];

export const tweetItems: TweetItem[] = [
  {
    id: 't1',
    authorName: 'Jennifer Zeng 曾錚 ✓', authorHandle: '@jenniferatntd',
    authorInitial: 'J', authorGradient: 'from-[#0a3a60] to-[#1260a0]',
    text: 'BREAKING: 最新衛星圖像顯示福建沿岸軍事集結規模超過2023年水平。結合近期習近平講話，台海緊張局勢進入新階段。',
    hasMedia: true,
    topics: ['#台灣', '#台海局勢'],
    timeAgo: '4小時前', retweets: 2103, likes: 5670,
  },
  {
    id: 't2',
    authorName: 'Gordon Chang 章家敦', authorHandle: '@GordonGChang',
    authorInitial: 'G', authorGradient: 'from-[#3a1010] to-[#9a2020]',
    text: "China's economy is not recovering. Industrial output down 2.1% in Q1. Youth unemployment at record high. Xi is blaming external forces, but problems are structural. 🧵",
    topics: ['#經濟', '#中美關係'],
    timeAgo: '6小時前', retweets: 8920, likes: 31400,
  },
  {
    id: 't3',
    authorName: '李正寬（維權律師）', authorHandle: '@lizhengkuan_law',
    authorInitial: '李', authorGradient: 'from-[#0f2a0f] to-[#1a6a30]',
    text: '今天接到國內偷打來的電話。他說：「我們看到了你的報道，我們沒有被遺忘。」繼續做，為了那些沉默的聲音。',
    topics: ['#人權', '#維權'],
    timeAgo: '8小時前', retweets: 1456, likes: 9872,
  },
];
