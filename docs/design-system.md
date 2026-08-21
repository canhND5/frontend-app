# 設計系統規範

本文件記錄視界中國 UI 的核心設計決策，所有新頁面和組件應遵守這些規範。

---

## 字號體系

正文 16px 為基準，整個字號體系從此推導。

| 用途 | 類名 | 尺寸 |
|---|---|---|
| 詳情頁主標題 | `text-[22px]` | 22px |
| 卡片標題、精選標題 | `text-[17px]` | 17px |
| **正文基準**（推文、文章卡內容）| `text-[16px]` | 16px |
| chips、次要文字 | `text-[14px]` | 14px |
| 時間戳、meta 信息 | `text-[13px]` | 13px |

**原則：任何可閱讀文字不得低於 13px。** 中文字形複雜，低於此尺寸在移動端難以辨認。

---

## 用色規範

整頁只允許兩個 accent 顏色，其餘全部灰階。

| 色彩 | Token | 用途 |
|---|---|---|
| 品牌藍 | `text-app-blue` / `bg-app-blue` | 互動元素、選中狀態、鏈接 |
| 警示紅 | `text-app-red` / `bg-app-red` | 唯一警示信號（新動態圓點、快訊紅點）|
| 金色 | `text-app-gold` | 僅限品牌名稱中的「中國」二字 |
| 灰階 | `text-app-sub` / `text-app-muted` | 次要文字、時間戳、標籤 |

**禁止事項：**
- 不得用各媒體品牌色區分 source badge（統一用灰色文字）
- 不得引入第三種 accent 顏色
- 熱榜排名只有第 1 名用 `text-app-red`，其餘用 `text-app-sub`

---

## Icon 規範

全站禁止使用 emoji 作為 UI 元素，統一使用 SVG 線條圖標。

**標準樣板：**
```html
<svg
  xmlns="http://www.w3.org/2000/svg"
  fill="none"
  viewBox="0 0 24 24"
  stroke-width="1.5"
  stroke="currentColor"
  class="w-5 h-5"
>
  <path stroke-linecap="round" stroke-linejoin="round" d="..." />
</svg>
```

- 圖標庫：[Heroicons](https://heroicons.com/) outline 風格
- `stroke-width` 固定 `1.5`（導航圖標）或 `2`（返回箭頭等強調場景）
- 顏色用 `currentColor`，由父元素的文字色決定
- 導航圖標尺寸 `w-6 h-6`，行內圖標 `w-5 h-5`

---

## 色彩 Token 定義

所有 token 定義於 `src/styles/global.css`：

```css
--color-app-blue: #1a4d8f
--color-app-blue-dark: #0f3060
--color-app-blue-mid: #2563b0
--color-app-blue-light: #e8f0fb
--color-app-gold: #d4ac0d
--color-app-red: #d93025
--color-app-bg: #f2f4f8
--color-app-text: #0f1923
--color-app-sub: #5a6a7e
--color-app-border: #dde3ee
--color-app-muted: #a0aab8
```
