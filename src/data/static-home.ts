/** Static fixture data for the home page (to be replaced by API data). */

export interface KuaixunItem {
  rank: number;
  title: string;
  type: 'video' | 'article' | 'tweet';
  source: string;
  sourceColor: string;
  timeAgo: string;
  dateValue?: string;
}

export interface EditorialPick {
  type: 'video' | 'article' | 'tweet';
  source: string;
  sourceColor: string;
  title: string;
  category?: string;
  timeAgo: string;
  duration?: string;
  views?: string;
  comments?: number;
  tweetHandle?: string;
  tweetAuthor?: string;
  retweets?: number;
  likes?: number;
}

export interface LiveItem {
  status: 'new' | 'recent' | 'old';
  type: 'article' | 'tweet';
  source: string;
  title: string;
  timeAgo: string;
  dateValue?: string;
  href: string;
}

export const kuaixunItems: KuaixunItem[] = [
  {
    rank: 1,
    title: '中共高層秘密會議討論「退出計劃」，多名高層成員已轉移家屬資産',
    type: 'video',
    source: 'YouTube',
    sourceColor: '#cc1111',
    timeAgo: '3小時前',
  },
  {
    rank: 2,
    title: '習近平內部講話罕見承認經濟困境，要求黨員「保持信心」勿動搖',
    type: 'article',
    source: '希望之聲',
    sourceColor: '#1a4d8f',
    timeAgo: '1小時前',
  },
  {
    rank: 3,
    title: '衛星圖像：福建沿岸軍事集結超過2023年水平，台海緊張升溫',
    type: 'tweet',
    source: '@jenniferatntd',
    sourceColor: '#1560a8',
    timeAgo: '4小時前',
  },
  {
    rank: 4,
    title: '多省地方政府財政告急，教師工資拖欠事件蔓延至七個省份',
    type: 'article',
    source: '大紀元',
    sourceColor: '#c0392b',
    timeAgo: '2小時前',
  },
  {
    rank: 5,
    title: '北京當局緊急下令各大平台刪除「退黨」相關關鍵詞搜索結果',
    type: 'article',
    source: '看中國',
    sourceColor: '#1a7a4a',
    timeAgo: '5小時前',
  },
];

export const editorialDate = '4月12日';

export const editorialPicks: EditorialPick[] = [
  {
    type: 'video',
    source: 'NTD 新唐人',
    sourceColor: '#1a4d8f',
    title: '【獨家揭秘】中共高層內鬥加劇，多名政治局委員遭秘密調查',
    timeAgo: '3小時前',
    duration: '18:42',
    views: '124K',
  },
  {
    type: 'article',
    source: '大紀元',
    sourceColor: '#c0392b',
    title: '中共「清零」後遺症：封控政策對中國社會的深層創傷與長期影響',
    category: '時政',
    timeAgo: '2小時前',
    comments: 342,
  },
  {
    type: 'article',
    source: '看中國',
    sourceColor: '#1a7a4a',
    title: '地下教會遭打壓：河南百名基督徒被捕，教堂強制拆除',
    category: '人權',
    timeAgo: '3小時前',
    comments: 95,
  },
  {
    type: 'article',
    source: 'NTD 新唐人',
    sourceColor: '#1a4d8f',
    title: '人權律師江天勇獄中健康惡化，家屬被拒探視已逾六個月',
    category: '人權',
    timeAgo: '4小時前',
    comments: 61,
  },
  {
    type: 'tweet',
    source: '@jenniferatntd',
    sourceColor: '#1260a0',
    tweetAuthor: 'Jennifer Zeng 曾錚 ✓',
    tweetHandle: '@jenniferatntd',
    title:
      'BREAKING: 最新衛星圖像顯示福建沿岸軍事集結規模超過2023年水平。結合近期習近平講話，台海緊張局勢進入新階段。',
    timeAgo: '4小時前',
    retweets: 2103,
    likes: 5670,
  },
];

export const liveItems: LiveItem[] = [
  {
    status: 'new',
    type: 'article',
    source: '大紀元',
    title: '外交部發言人否認對台軍事行動計劃，稱「和平統一是首要目標」',
    timeAgo: '剛剛',
    href: '#',
  },
  {
    status: 'new',
    type: 'tweet',
    source: '@APNews',
    title: '美聯社：美軍驅逐艦通過台灣海峽，中方發出「嚴重警告」',
    timeAgo: '18分鐘前',
    href: '#',
  },
  {
    status: 'new',
    type: 'article',
    source: 'NTD 新唐人',
    title: '廣東製造業大規模裁員潮持續，工人維權示威遭警方驅散',
    timeAgo: '32分鐘前',
    href: '#',
  },
  {
    status: 'recent',
    type: 'article',
    source: '希望之聲',
    title: '聯合國人權理事會就新疆議題展開辯論，中方代表強烈抗議',
    timeAgo: '1小時前',
    href: '#',
  },
  {
    status: 'recent',
    type: 'tweet',
    source: '@RadioFreeAsia',
    title: '自由亞洲電台：西藏色達縣寺院再遭強制拆除，僧侶被迫「政治教育」',
    timeAgo: '1小時前',
    href: '#',
  },
  {
    status: 'old',
    type: 'tweet',
    source: '@GordonGChang',
    title: '上海封城謠言官方闢謠，但多名居民反映物資出現緊張跡象',
    timeAgo: '2小時前',
    href: '#',
  },
  {
    status: 'old',
    type: 'article',
    source: '看中國',
    title: '人民幣兌美元跌至近期低位，外資撤出趨勢持續加劇',
    timeAgo: '3小時前',
    href: '#',
  },
];
