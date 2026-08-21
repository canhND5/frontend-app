/** Static fixture detail data (to be replaced by API data). */

export interface DetailItem {
  id: string;
  source: string;
  sourceName: string;
  sourceColor: string;
  contentType: 'article' | 'video';
  title: string;
  publishedAt: string;
  category: string;
  thumbGradient: string;
  thumbIcon: string;
  summary: string;
  bodyHtml: string;
  duration?: string;
  views?: string;
}

export const staticDetailItems: DetailItem[] = [
  {
    id: 'a1',
    source: 'djy',
    sourceName: '大紀元',
    sourceColor: '#c0392b',
    contentType: 'article',
    title: '中共「清零」後遺症：封控政策對中國社會的深層創傷與長期影響',
    publishedAt: '2026年4月10日 · 14:32',
    category: '時政',
    thumbGradient: 'from-[#0f1e3a] to-[#1e3d70]',
    thumbIcon: '📜',
    summary:
      '歷時三年的嚴苛封控已結束，然而留下的心理創傷、經濟重創仍深刻影響數億民衆，折射出一場政策悲劇的深遠後果。',
    bodyHtml: `
      <p>2022年11月，隨著大規模抗議爆發，中共當局宣告放棄「動態清零」政策，結束了歷時近三年的嚴格管控。然而，這場被稱為「中國式封城」的社會實驗，在人心、經濟與社會結構上留下了難以癒合的傷痕。</p>
      <h2>心理創傷難以癒合</h2>
      <p>根據多項學術調查，長期封控導致中國城市居民的焦慮症發病率大幅上升。上海封城期間，部分居民被強制隔離長達兩個月，目睹鄰居在求醫無門中離世，留下了難以消除的心理陰影。</p>
      <p>「那段時間，我每天都不知道明天還能不能出門買到食物，」一位上海居民向本報表示，「現在走在街上，還會不自覺地擔心被攔下來。」</p>
      <h2>經濟創傷仍在持續</h2>
      <p>封控對中小企業的打擊尤為嚴重。據估計，全國逾三分之一的餐飲業者在封控期間永久關閉。中共官方公布的失業數據被普遍認為遠低於實際水平，尤以青年失業問題最為嚴峻——部分時期官方數字已超過20%。</p>
      <p>更深層的問題在於，封控期間形成的消費悲觀情緒並未隨政策放開而消散。民眾對未來的不確定感，導致儲蓄率持續高位，國內消費復甦乏力。</p>
      <h2>社會信任的瓦解</h2>
      <p>或許最難量化、也最為深遠的影響，是封控對社會信任的系統性侵蝕。「健康碼」機制的濫用——包括以「紅碼」阻止維權村民進城——讓公眾對數字化管控的反感急劇上升。</p>
      <p>分析人士指出，這場政策悲劇的根源，在於中共體制下缺乏糾錯機制，地方官員為求晉升而爭相加碼，最終釀成系統性的人道災難。</p>
    `,
  },
  {
    id: 'v1',
    source: 'video',
    sourceName: 'NTD 新唐人',
    sourceColor: '#cc1111',
    contentType: 'video',
    title: '【獨家揭秘】中共高層內鬥加劇，多名政治局委員遭秘密調查',
    publishedAt: '2026年4月12日 · 09:15',
    category: '時政',
    thumbGradient: 'from-[#0f1e3a] to-[#1a3a6a]',
    thumbIcon: '📺',
    duration: '18:42',
    views: '124K',
    summary:
      '據可靠消息人士透露，中共高層近期出現嚴重分裂，多名政治局委員正接受秘密紀律調查，習近平進一步鞏固個人權力的動作引發黨內不安。',
    bodyHtml: `
      <p>據本台多名獨立消息人士證實，中共中央紀律檢查委員會近期已對至少三名政治局委員展開秘密調查，涉及「違反政治紀律」的指控。</p>
      <p>分析人士指出，此輪調查的時間點耐人尋味——恰逢習近平積極推動「二十屆三中全會」後的政策落實，以及2027年黨代會前的人事佈局。</p>
      <h2>誰在調查名單上？</h2>
      <p>雖然被調查者的姓名尚未得到官方確認，但多名消息人士指向現任負責金融工作的高層官員，以及主管黨務系統的常委系人士。</p>
      <p>值得注意的是，調查啟動前數週，相關官員在公開場合的露面頻率已明顯減少，部分外訪行程被臨時取消，引發外界廣泛猜測。</p>
      <h2>黨內氣氛趨緊</h2>
      <p>「北京的氣氛現在非常緊張，」一名不願具名的黨內退休官員向本台表示，「大家都在揣摩最高層的意圖，沒有人敢輕舉妄動。」</p>
    `,
  },
];

export function getStaticDetail(source: string, id: string): DetailItem | undefined {
  return staticDetailItems.find((d) => d.source === source && d.id === id)
    ?? staticDetailItems[0];
}
