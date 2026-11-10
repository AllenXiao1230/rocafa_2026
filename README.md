# 越境·寰宇｜2026 空軍官校禮儀示範晚會（ROCAFA Annual Ball 2026）

本資料夾收錄 **《越境·寰宇》2026 空軍官校禮儀示範晚會** 官方活動網頁與完整設計文件，活動來源為 [2026 空軍官校舞會官方 Instagram (@rocafa_2026)](https://www.instagram.com/rocafa_2026) 與 [官方 Google 報名表單](https://docs.google.com/forms/d/e/1FAIpQLSfoJ6wk85NshcKoN-W9an7NjDU1-Q6USu9ARC0B8YKi7dxaQg/viewform)。

## 檔案架構

```text
rocafa_2026/
├── index.html
├── assets/
│   ├── css/site.css
│   ├── js/site.js
│   └── images/
│       ├── brand-emblem.svg
│       └── key-visual.svg
├── rocafa_2026_ball.html
├── README.md
└── ROCAFA_2026_越境寰宇_完整規格與審查報告.md
```

- `index.html` 是網站入口，包含頁面結構、文案與活動流程。
- `assets/css/site.css` 管理樣式與響應式版面。`assets/js/site.js` 管理導覽、倒數、篩選、彈窗、報名檢核、私訊範本與行事曆下載。
- `assets/images/` 放置品牌徽章與主視覺 SVG。
- `rocafa_2026_ball.html` 是拆分前的獨立單檔備份，可單獨分享。日常維護以 `index.html` 和 `assets/` 為準。
- 規格與審查報告收錄活動文案、設計規範與原版設計審查。

## 預覽與部署

1. **本機預覽**：保留 `index.html` 與同層的 `assets/`，直接用瀏覽器開啟首頁。官方報名表單與 Instagram 需連網。
2. **靜態部署**：一起上傳 `index.html` 與 `assets/` 至 GitHub Pages、Vercel 或 Netlify 的發佈目錄，保留原有相對路徑。無須建置指令。
3. **後續節目表更新**：當 [@rocafa_2026](https://www.instagram.com/rocafa_2026) 公布詳細舞台演出時間或岡山高醫捷運站接駁車班次時，可直接於 `index.html` 的 `#schedule` 區塊替換對應時段文字。


## 舞會手記更新

在 `index.html` 的 `#journal` 更新貼文標題、日期、摘要、原文連結與 iframe 的 `src`。保留貼文或 Reel 路徑，並在 iframe 網址尾端加上 `embed/`。貼文接近畫面時才由瀏覽器向 Instagram 載入。
