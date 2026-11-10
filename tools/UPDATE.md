# 每年加入新一屆會考（自然戰力覺醒・康軒版）

網站：https://bgjd315-cloud.github.io/cap-science-game-kangxuan/ ，repo：bgjd315-cloud/cap-science-game-kangxuan。
本機工作資料夾：`C:\Claude 系統及作品\cap-science-game-kangxuan`（沒有就 `gh repo clone bgjd315-cloud/cap-science-game-kangxuan` 到這裡；有就先 `git pull`）。

## 原理

題庫原檔有 2725 題（`src/bank*.js`，來自會考自然考點地圖＋康軒七上～九下課本），從來不刪。
`src/exam_match.json` 記錄每題「歷屆會考有沒有考過、考過哪幾年」，建置時只放 keep=true 的題目進遊戲。
`src/exam_index/idx_*.jsonl` 是歷屆試卷的考點索引：每題列出直接考的事實、四個選項中的知識、解題必用的背景知識。

每年只做「新一年」：建新年度索引 → 拿全部題目比對新年度考點 → 命中的題加上新年份；原本沒考過、今年考到的題目會自動恢復進遊戲。舊年度的判斷不重做。

以下以 NEW 代表新年度（例如 116）。

## 步驟

### 0. 確認試題已公布
`python -I -X utf8 tools/fetch_exam.py NEW`
- 印出 `NOT_PUBLISHED` 或 `DOWNLOAD_FAILED`：**什麼都不要改、不要 push**，回報「NEW 年自然科題本還沒公布」，建議過兩週再手動執行排程。
- 印出 `OK …`：得到 `work/NEW/sciNEW.txt`（文字）與 `work/NEW/pages/pNN.png`（每頁圖）。text chars 為 0 表示掃描檔，只能看圖。
- 如果 `src/exam_index/idx_NEW.jsonl` 已經存在，代表今年做過了：回報後結束。

### 1. 建新年度考點索引 → `src/exam_index/idx_NEW.jsonl`
自己做或交給一個子代理人。要求（和 103–115 年相同標準）：
- 讀完整份題本（第一頁是作答說明，略過）。圖表題一定要看 `work/NEW/pages/` 的頁面圖。
- 每一題（題組的每個小題分開；有非選擇題也要）列出考點：題目直接問的事實；**四個選項裡的所有知識**（錯誤選項也算，例如選項寫「肺靜脈含缺氧血」，考點是「肺靜脈含充氧血」）；解題必須知道的背景知識（構造功能、公式、單位、定義、定則）；學生必須認得的名稱（生物、礦物、地名、儀器）。
- 每個考點寫成具體的事實句，繁體中文、30 字以內，例如「膽汁不含酵素，可乳化脂肪」「凸透鏡物距大於2f成倒立縮小實像」；不要寫「血液循環」這種空泛主題。每題通常 2–6 點。純讀圖技巧不列，除非需要某個事實。
- 每題一個主單元 u，每個考點各自的單元放 pu（與 pts 等長）。單元代碼：U01 細胞與顯微鏡、U02 養分與能量、U03 運輸呼吸排泄與恆定、U04 協調作用、U05 生殖與遺傳、U06 演化與分類、U07 生態系與環境保護（含能源）、U08 物質的性質（測量、密度、溶解度、濃度、分離、氣體、器材）、U09 波動聲音與光、U10 溫度與熱、U11 原子元素週期表、U12 化學反應與計量、U13 氧化還原（含電池電解電鍍）、U14 電解質與酸鹼鹽、U15 反應速率與平衡、U16 有機化合物、U17 力壓力浮力、U18 直線運動與牛頓定律、U19 功與能簡單機械、U20 電路與靜電、U21 電流磁效應與電磁感應、U22 地球構造岩石地形板塊、U23 大氣海洋天氣、U24 天文。
- 一行一題 JSON：`{"y":NEW,"n":12,"u":"U03","topic":"血液循環路徑","pts":["肺靜脈含充氧血","左心室連接主動脈"],"pu":["U03","U03"]}`。用 Python 寫檔，寫完逐行 parse 驗證，題數要和題本一致。

### 2. 準備比對資料
`node tools/yearly_update.js prepare NEW` → `work/NEW/judge/` 產生 7 組：`q_<組>.json`（該組全部題目，含目前 keep）、`idx_<組>.txt`（新年度該組單元的考點，格式「年-題號｜單元｜考點」）、`index_all.txt`（新年度全部考點）。
組別：bioA(U01–04) bioB(U05–07) chemA(U08,U11,U12) chemB(U13–16) phyA(U09,U10,U17) phyB(U18–21) earth(U22–24)。

### 3. 比對（7 組可平行交給子代理人）
每組的判斷規則：
- 對 `q_<組>.json` 的**每一題**判斷：NEW 年的考點裡，有沒有一點陳述同一個事實、它的直接逆敘述，或不知道這個事實就無法作答的事實。換個角度問同一事實也算；考題明顯需要的基本詞彙（元素中文名、單位、儀器、生物類群）也算。
- 只有大主題相同、具體事實沒出現 → 不算。標準要合理嚴格，不要硬湊。
- 跨單元的知識用 `index_all.txt` 以關鍵字搜尋。
- 輸出 `work/NEW/judge/hit_<組>.json`：與 q 檔同順序、每題一筆、題目文字完全相同：`[{"q":"題目原文","hit":true,"ref":["116-12"]},{"q":"…","hit":false,"ref":[]}]`。寫完用 node 檢查筆數與文字一致。

### 4. 合併、建置、檢查
- `node tools/yearly_update.js merge NEW`（會印出命中數、恢復數、各年度題數與年份範圍）。
- 抽查 10 筆 hit：題目與所引 NEW 年考點是否真的相符；明顯硬湊的改回 false 再 merge 一次（merge 可重複執行）。
- `node build.js`，用 node 對 index.html 內的 `<script>` 做語法檢查，並在本機開啟確認首頁頁尾年份範圍變成「103～NEW」、題數正常。

### 5. 發布
- 更新 `README.md` 的題數與年份範圍。
- `git add -A`（work/ 已在 .gitignore），commit 訊息結尾加 `Co-Authored-By: Claude <noreply@anthropic.com>`，`git push`。
- 等 GitHub Pages 建置完成（`gh api repos/bgjd315-cloud/cap-science-game-kangxuan/pages/builds/latest`），打開網址確認。

### 6. 更新入口頁的介紹文字（只有康軒版已掛上該入口頁時才做；找不到「自然戰力覺醒・康軒版」卡片就跳過）（Artifact 工具，先 read 再 publish）
- 會考練功坊 https://claude.ai/artifact/7ZTW9u8xWLTR1f2X2Jb8ds ：「第 1 關 闖關遊戲」裡「自然戰力覺醒・康軒版」那張卡的 desc。
- 佳慧老師的網站總覽 https://claude.ai/artifact/EtpwShg6DGoTnEd4mNBUUr ：「國中生 › 遊戲化複習」裡「自然戰力覺醒・康軒版」那張卡的 desc。
- 只改那一張卡 desc 裡的題數與年份範圍（例如「1302 個 103–115 年」→ 新數字），其他內容一字不動。用 read 的 `path: "index.html"` 下載頁面檔，取 `<body>` 與 `</body>` 之間的內容修改後 publish 回同一個 url（不要連外層 `<!doctype html><html><head>…` 一起送）。

## 回報（繁體中文）
NEW 年題數、索引考點數；命中題數、因今年考到而恢復進遊戲的題數；遊戲總題數變化（舊→新）與年份範圍；三科（生物、理化、地科）各恢復幾題並舉 3 例；讀圖不確定的題號；網站網址；兩個入口頁是否已更新。
