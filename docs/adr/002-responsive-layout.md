# ADR 002 — 響應式佈局架構

**狀態：** 已採用  
**日期：** 2026-04-19

---

## 背景

初版 UI 僅針對移動端設計（max-width 480px）。需要在不重寫頁面邏輯的前提下，推演出桌面版佈局。

---

## 決策

採用「單一 AppLayout 雙模式」方案：在同一個 layout 組件中，通過 Tailwind `lg:` 斷點切換移動版和桌面版佈局，頁面組件本身無需感知當前是哪種模式。

### 佈局結構

**移動版（< 1024px）：**
```
┌──────────────────────┐
│  AppHeader           │  sticky top
│  AppTicker           │
├──────────────────────┤
│                      │
│  <slot />（頁面內容）  │  flex-1 overflow-y-auto
│                      │
├──────────────────────┤
│  BottomNav           │  sticky bottom（lg:hidden）
└──────────────────────┘
```

**桌面版（≥ 1024px）：**
```
┌──────────┬────────────────────────────────┐
│          │  AppHeader + AppTicker  sticky  │
│  左側欄   ├────────────────────────────────┤
│  224px   │                                │
│  sticky  │  <slot />（頁面內容）            │
│          │  主欄 max-w-200（800px）         │
│  [logo]  │                                │
│  [nav]   │                                │
│  [footer]│                                │
└──────────┴────────────────────────────────┘
```

首頁（`index.astro`）在桌面版額外增加右側欄（272px），承載「實時動態」區塊。其他頁面無右側欄，主內容自然填滿。

### 組件分工

| 組件 | 移動端 | 桌面端 |
|---|---|---|
| `AppLayout.astro` | flex-col 外殼，480px 寬 | flex-row，左側欄 + 主欄 |
| `BottomNav.astro` | sticky bottom，5 tab | `lg:hidden`，完全隱藏 |
| `AppHeader.astro` | 藍色頂欄，logo + 圖標 | 同上，sticky 於主欄頂部 |
| `AppTicker.astro` | header 下方橫幅 | 同上 |
| `index.astro` | 單列：熱榜 → 精選 → 實時 | 雙列：左主內容 + 右實時動態 |

---

## 路由備注

- X（原 Twitter）頁面路由為 `/x`，對應文件 `src/pages/x.astro`
- activeTab key 為 `'x'`（非 `'twitter'`）

---

## 後續優化方向

- 視頻/文章列表頁在桌面版改為 2 列卡片 grid
- 右側欄擴展至其他頁面（熱門話題、相關帳號等）
- 詳情頁桌面版加寬閱讀區至 ~720px
