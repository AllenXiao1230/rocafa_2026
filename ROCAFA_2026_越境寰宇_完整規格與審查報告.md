# 《越境·寰宇》2026 空軍官校禮儀示範晚會 — 完整網頁企劃、文案與 Impeccable 設計審查報告

本文件完整收錄 **《越境·寰宇》（Beyond Borders · Across the Universe）2026 空軍官校禮儀示範晚會** 官方活動著陸頁之企劃架構、全站文案、互動功能規格、[Impeccable 設計系統定義（`PRODUCT.md` & `DESIGN.md`）](https://impeccable.style/)，以及依據 [Impeccable Critique 審查規範](https://impeccable.style/docs/critique/) 所執行的完整 UI/UX 診斷與優化報告。

## 一、活動核心資訊總覽（Event Overview）

| 項目 | 內容說明 | 外部連結與官方來源 |
| :--- | :--- | :--- |
| **活動名稱** | 《越境·寰宇》2026 空軍官校禮儀示範晚會（R.O.C. Air Force Academy Ball 2026） | [2026 空軍官校舞會官方 Instagram (@rocafa_2026)](https://www.instagram.com/rocafa_2026) |
| **英文副標** | *Beyond Borders · Across the Universe* | [@rocafa_2026 主視覺發布](https://www.instagram.com/rocafa_2026) |
| **活動日期** | 2026 年 12 月 24 日（星期四，民國 115 年平安夜） | [官方 Google 報名表單](https://docs.google.com/forms/d/e/1FAIpQLSfoJ6wk85NshcKoN-W9an7NjDU1-Q6USu9ARC0B8YKi7dxaQg/viewform) |
| **活動時間** | 18:00 – 22:00（建議 17:00 – 17:45 提前抵達配合門禁實名查驗與星光迎賓） | [官方 Google 報名表單](https://docs.google.com/forms/d/e/1FAIpQLSfoJ6wk85NshcKoN-W9an7NjDU1-Q6USu9ARC0B8YKi7dxaQg/viewform) |
| **活動地點** | 中華民國空軍軍官學校（高雄市岡山區介壽西路 1 號） | [官方 Google 報名表單](https://docs.google.com/forms/d/e/1FAIpQLSfoJ6wk85NshcKoN-W9an7NjDU1-Q6USu9ARC0B8YKi7dxaQg/viewform) |
| **交通方式** | 表單提供「**自行前往**」或「**接駁車（岡山高醫捷運站 R24）**」二選一 | [官方 Google 報名表單](https://docs.google.com/forms/d/e/1FAIpQLSfoJ6wk85NshcKoN-W9an7NjDU1-Q6USu9ARC0B8YKi7dxaQg/viewform) |
| **服裝規範** | 盛裝出席（正裝、西裝領帶／領結、晚禮服或典雅洋裝；**嚴禁穿著拖鞋、涼鞋或短褲**） | [官方 Google 報名表單](https://docs.google.com/forms/d/e/1FAIpQLSfoJ6wk85NshcKoN-W9an7NjDU1-Q6USu9ARC0B8YKi7dxaQg/viewform) |
| **報名與對接** | 填妥表單後須主動私訊 [@rocafa_2026](https://www.instagram.com/rocafa_2026) 打招呼，待官方回覆後傳送**個人形象照**完成禮賓對接 | [官方 Google 報名表單](https://docs.google.com/forms/d/e/1FAIpQLSfoJ6wk85NshcKoN-W9an7NjDU1-Q6USu9ARC0B8YKi7dxaQg/viewform) |
| **敘事與版面參考** | 參考陸軍官校校際交流舞會之章節動線與深淺色溫切換設計 | [青·拾 2026 陸軍官校校際交流舞會網站](https://2026youth-and-time.com) |

## 二、產品與設計系統定義（Impeccable `PRODUCT.md` & `DESIGN.md`）

依據 [Impeccable 前端設計架構](https://github.com/pbakaus/impeccable) 之雙核心規範檔格式，本專案之產品定位與視覺系統定義如下：

### 2.1 `PRODUCT.md`（產品脈絡與表面模式）
* **表面模式（Surface Mode）**：`Persuade`（活動著陸與報名轉換）結合 `Operate`（門禁自我檢核、IG 私訊範本產生器與 `.ics` 行事曆匯出工具）。
* **核心受眾（Target Personas）**：
  1. **校外受邀與報名來賓（Jordan）**：首次參與軍校舞會，需要清楚掌握「為何需要實名資料」、「如何搭乘岡山高醫捷運站接駁車」及「填表後如何私訊 IG 傳送形象照」。
  2. **行動端社群瀏覽者（Casey）**：從 [@rocafa_2026](https://www.instagram.com/rocafa_2026) 個人檔案連結點擊進入，使用手機垂直滑動瀏覽，需在 3 秒內掌握時間、地點與報名入口。
  3. **無障礙與邊界條件使用者（Riley）**：依賴鍵盤導覽（`Escape` 關閉彈窗、Tab 切換篩選器）或離線開啟本地 HTML 檔案預覽之籌備團隊成員。

### 2.2 `DESIGN.md`（視覺語言與反套路規範）
* **色彩語彙（Color Palette）**：
  * **午夜深藍基底（`#090e1a` / `#111b2d`）**：呼應平安夜星空與空軍夜航意象，作為敘事區主背景。
  * **香檳星軌金（`#d8b47c` / `#f1dcb8`）**：呼應主視覺環球航道與典雅華爾滋禮服光澤，用於主行動按鈕（`.btn-gold`）與重點數據。
  * **暖米白須知區（`#f5f0e6` / `#ede5d5`）**：借鏡 [青·拾 2026 陸軍官校舞會網站](https://2026youth-and-time.com) 的「相遇之前」章節轉場，以高對比深色字體（`#121c2e`）呈現門禁與服裝規範，提升長文閱讀舒適度。
* **字體排印（Typography）**：
  * **中文主標題與人文引文**：採用襯線體（`Songti TC` / `Noto Serif TC`），營造正式晚會邀請函的莊重感。
  * **英文副標與倒數數字**：採用古典展示襯線體（`Cormorant Garamond` / `Baskerville`），強化歐洲宮廷舞會與星象儀氛圍。
  * **內文與檢核表單**：採用高易讀性系統無襯線體（`PingFang TC` / `Noto Sans TC`）。
* **反套路準則（Anti-Slop Rules，對齊 [Impeccable 62 條檢測規範](https://github.com/pbakaus/impeccable)）**：
  * 嚴禁使用無意義的紫藍霓虹漸層（Purple-to-Blue AI Gradient）。
  * 避免首屏超過 2 顆競爭性行動按鈕（採用 `distill` 原則收斂為「前往報名與禮賓檢核」與「看當日流程」）。
  * 零外部 JS 框架相依：以純淨原生 CSS 與 Vanilla JS 封裝，支援 100% 離線開啟與高速載入。

## 三、全站九大章節架構與完整文案（Full Copywriting & Sections）

### 3.1 頂部常駐導覽列（Sticky Header）
* **品牌識別**：客製化 SVG 星軌經緯儀徽章＋「越境·寰宇 ROCAFA 2026｜2026 空軍官校禮儀示範晚會」。
* **快速錨點**：`#info`（舞會情報）、`#journal`（舞會手記）、`#schedule`（當日流程）、`#protocol`（禮賓對接）、`#faq`（入場須知），以及右側常駐金色膠囊按鈕「前往報名檢核」。

### 3.2 首屏主視覺區（Hero Section）
* **頂部徽章**：`R.O.C. Air Force Academy Ball 2026`
* **英文引題**：*Beyond Borders · Across the Universe*
* **主標題**：**越境 · 寰宇** — 2026 空軍官校禮儀示範晚會
* **主敘事文案**：
  > 把這一刻，留給翱翔天際的青春。在平安夜的璀璨星河下，跨越疆界與日常軌跡，邀你盛裝步入空軍軍官學校，共譜一場橫跨寰宇的浪漫華爾滋。
* **核心資訊膠囊**：
  * `📅 2026 / 12.24（四）18:00–22:00`
  * `📍 高雄市岡山區介壽西路 1 號（空軍軍官學校）`
* **雙行動按鈕（`distill` 精簡配置）**：
  * 主按鈕：`前往報名與禮賓檢核 ↓`（平滑捲動至 `#protocol`）
  * 次按鈕：`看當日流程 →`（平滑捲動至 `#schedule`）
* **右側主視覺畫框**：內嵌可縮放 SVG 環球星軌與雙人共舞剪影，附帶「理念賞析」燈箱預覽按鈕。

### 3.3 即時倒數計時器（Countdown to Departure）
* **標題**：距離啟航相遇，還有
* **引言**：「把平安夜留白，把最璀璨的期待留給這一晚。」
* **動態計時邏輯**：以 `2026-12-24T18:00:00+08:00` 為目標時間，每秒即時更新「日（Days）、時（Hours）、分（Mins）、秒（Secs）」。

### 3.4 舞會情報三欄卡（Ball Information）
1. **Date & Time｜2026 年 12 月 24 日（四）**：民國 115 年平安夜 18:00–22:00（建議提前於 17:00–17:45 抵達配合軍事基地門禁查驗與迎賓入場），內建「📅 加入行事曆（下載 `.ics`）」按鈕。
2. **Venue & Transit｜空軍軍官學校**：高雄市岡山區介壽西路 1 號，支援依 [官方 Google 報名表單](https://docs.google.com/forms/d/e/1FAIpQLSfoJ6wk85NshcKoN-W9an7NjDU1-Q6USu9ARC0B8YKi7dxaQg/viewform) 選擇「自行前往」或「接駁車（岡山高醫捷運站）」，附「查看交通與接駁說明」彈窗。
3. **Dress Code & Entry｜盛裝出席 · 門禁實名查驗**：正裝、晚禮服或典雅洋裝（禁穿拖鞋、短褲），入場須攜帶法定身分證件正本。

### 3.5 星河詩意轉場（Poetic Interlude）
> 「在日常的航線之外，拾起一段屬於我們的璀璨星河。跨越天際與邊境，讓青春在平安夜的樂聲裡相遇。」—— *ROCAFA 2026 · Beyond Borders*

### 3.6 舞會手記（Ball Journal · `@rocafa_2026`）
支援 4 組無障礙分類標籤（`全部貼文`、`主視覺徽章`、`形象寫真`、`晚會氛圍`，具備 `role="tab"` 與動態 `aria-selected`）：
1. **《越境·寰宇》主視覺徽章亮相**（分類：`emblem`）：以地球經緯、環球航道與共舞剪影交織，象徵空軍官校學生跨越疆界、翱翔天際的胸懷，並串連 [@rocafa_2026](https://www.instagram.com/rocafa_2026)。
2. **暮色天際線下的堅定步伐**（分類：`portrait`）：身著挺拔空軍軍常服、配戴飛行墨鏡，於台北 101 都會街頭取景之形象寫真企劃。
3. **平安夜，走進璀璨的禮儀示範晚會**（分類：`gala`）：傳承空軍官校年度禮儀示範舞會傳統，展現水晶燈光與管樂交響下的優雅風範。

### 3.7 當日流程表（Evening Timeline）
支援 4 組時段篩選（`全時段總覽`、`迎賓與入場`、`開舞與舞台時刻`、`平安夜賦歸`）：
* **17:00–18:00｜星光迎賓與門禁查驗入場**（迎賓階段）：岡山高醫捷運站接駁專車抵達、軍事基地實名門禁查驗、主題背板拍照留念。
* **18:00｜越境啟航 · 晚會正式開始**（核心時刻）：開場樂隊演出、長官致詞與空軍官校禮儀示範開舞儀式。
* **待公告｜寰宇共舞 · 舞台時刻與交流活動**（敬請期待）：社團展演（熱舞、輕音樂、DJ 等）、特邀演出名單與跨校自由共舞時段，將隨 [@rocafa_2026](https://www.instagram.com/rocafa_2026) 公告更新。
* **22:00｜晚安，天際線 · 舞會圓滿落幕**（賦歸時刻）：平安夜終曲、合影道別，搭乘接駁車或自行平安賦歸。

### 3.8 報名與「禮賓對接」三步驟＆互動檢核工具（Registration & Protocol Stepper）
1. **STEP 01｜填寫官方報名表單**：備妥姓名、出生年月日、性別、法定身分證件號碼、居住地址、聯絡電話、交通方式與 IG 帳號，點擊前往 [官方 Google 報名表單](https://docs.google.com/forms/d/e/1FAIpQLSfoJ6wk85NshcKoN-W9an7NjDU1-Q6USu9ARC0B8YKi7dxaQg/viewform)。
2. **STEP 02｜私訊官方 IG 打招呼**：因 Instagram 陌生訊息預設無法直接傳送圖片，填表後請先主動向 [@rocafa_2026](https://www.instagram.com/rocafa_2026) 傳送文字問候。
3. **STEP 03｜傳送個人形象照完成對接**：待官方回覆確認後補傳個人形象照，完成門禁與禮賓建檔。
* **互動工具 A — 報名前自我檢核清單（4 項勾選即時統計）**：全數勾選後進度膠囊自動更新為「`✓ 4 項全數完成！可進行填表與對接`」。
* **互動工具 B — IG 禮賓對接私訊範本產生器**：輸入姓名後即時更新問候語，支援一鍵複製到剪貼簿：
  > 您好！我是已完成《越境·寰宇》2026 空軍官校禮儀示範晚會報名表單的來賓，特此私訊打招呼，待您回覆確認後將傳送個人形象照進行禮賓對接，謝謝您！

### 3.9 暖米白「相遇之前｜報名與入場須知」手風琴（FAQ Accordion）
1. **一、門禁審核與個人資料用途說明**：說明軍事基地實名制門禁造冊原因、資料保密承諾與當日必備證件正本。
2. **二、服裝儀容規範（Dress Code）**：明訂正裝、晚禮服或典雅洋裝要求，以及禁穿拖鞋、涼鞋或短褲之規定。
3. **三、交通方式與捷運站接駁車安排**：說明高雄捷運紅線「岡山高醫站（R24）」接駁專車與自行前往引導方式。
4. **四、為何填完表單還需要私訊 IG 傳送形象照？**：說明禮賓對接用途與 Instagram 陌生訊息傳圖限制之解法。

## 四、Impeccable Critique 完整 UI/UX 審查與優化對照表

依據 [Impeccable Critique 官方審查架構](https://impeccable.style/docs/critique/) 與 [UiChemy Impeccable Critique 評分標準](https://uichemy.com/design-skills/critique/)，本網頁經過初版診斷（33 / 40 分）並執行 `distill`、`layout`、`harden` 與 `delight` 四項指令優化後，最終尼爾森十項啟發式評分提升至 **38 / 40 分（Excellent 等級）**：

| 尼爾森十項啟發式維度（[Impeccable Critique](https://uichemy.com/design-skills/critique/)） | 初版得分 | 優化後得分 | 具體優化落實內容 |
| :--- | :---: | :---: | :--- |
| **1. 系統狀態可見度（Visibility of System Status）** | 4 / 4 | **4 / 4** | 具備每秒即時倒數、檢核清單完成度（`0/4` 至 `✓ 4 項全數完成`）與複製成功 Toast 提示。 |
| **2. 系統與真實世界吻合度（Match with Real World）** | 4 / 4 | **4 / 4** | 完全貼合 [@rocafa_2026](https://www.instagram.com/rocafa_2026) 與 [官方 Google 報名表單](https://docs.google.com/forms/d/e/1FAIpQLSfoJ6wk85NshcKoN-W9an7NjDU1-Q6USu9ARC0B8YKi7dxaQg/viewform) 的軍事基地門禁與禮賓對接流程。 |
| **3. 使用者控制與自由度（User Control & Freedom）** | 3 / 4 | **4 / 4** | 透過 `harden` 為 Modal 補齊鍵盤 `Escape` 鍵關閉、點擊遮罩關閉與背景捲動鎖定（Scroll Lock）。 |
| **4. 一致性與標準（Consistency & Standards）** | 3 / 4 | **4 / 4** | 透過 `distill` 統一導覽列與首屏主按鈕動線，均先導引至 `#protocol` 完成檢核再外連表單。 |
| **5. 錯誤預防（Error Prevention）** | 4 / 4 | **4 / 4** | 在進入外部表單前先透過「自我檢核清單」確認服裝規範與證件，並以文字範本解決 IG 無法直接傳圖的問題。 |
| **6. 辨識優於記憶（Recognition Rather Than Recall）** | 3 / 4 | **4 / 4** | 將表單必填項目與三步驟濃縮於同一視窗區塊，無須跨頁記憶。 |
| **7. 使用彈性與效率（Flexibility & Efficiency）** | 3 / 4 | **3 / 4** | 支援一鍵匯出 `.ics` 行事曆、動態姓名帶入私訊範本與快速回到頂端。 |
| **8. 美學與極簡設計（Aesthetic & Minimalist Design）** | 3 / 4 | **4 / 4** | 精簡首屏行動按鈕為 1 主 1 次，並區隔一般資訊卡（`.card`）與重點步驟卡（`.card-glow`）的邊框發光層級。 |
| **9. 錯誤辨識與復原（Error Recovery）** | 3 / 4 | **3 / 4** | 剪貼簿複製同時支援 `navigator.clipboard` 與傳統 `document.execCommand('copy')` 備援。 |
| **10. 輔助說明與文件（Help & Documentation）** | 3 / 4 | **4 / 4** | 暖米白手風琴 FAQ 搭配交通接駁獨立彈窗，完整解答校外來賓常見疑問。 |
| **總分（Total Heuristic Score）** | **33 / 40** | **38 / 40** | **由 Good（28–35）晉升為 Excellent（36–40）等級** |

## 五、資料夾檔案結構與使用說明（File Structure & Usage）

- `index.html`：網站入口，維護頁面結構與活動文案。
- `assets/css/site.css`、`assets/js/site.js`、`assets/images/`：樣式、互動腳本與 SVG 圖檔。預覽或部署時請保留 `assets/` 與首頁的相對位置。
- `rocafa_2026_ball.html`：拆分前的獨立單檔備份，可直接分享與開啟。
- `README.md`：檔案架構、預覽與部署指南。
