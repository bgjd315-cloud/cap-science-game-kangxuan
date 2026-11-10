# 自然戰力覺醒・康軒版｜國中會考自然知識挑戰遊戲

> 解鎖知識，挑戰你的自然實力！

國中教育會考自然科必背考點的計時競賽遊戲（康軒版課本）。線上遊玩：https://bgjd315-cloud.github.io/cap-science-game-kangxuan/

- 題庫：整理自[會考自然考點地圖](https://bgjd315-cloud.github.io/cap-science-map/)與康軒版自然七上～九下課本（114 學年度），再逐題比對 103～115 年歷屆會考自然科試題，只保留考過的考點，並標示考過的年份。
- 南一版在 https://bgjd315-cloud.github.io/cap-science-game/
- 模式：極速 60 秒、生存挑戰、單元特訓、雙人對決、錯題特訓、排行榜、考點圖鑑；背景音樂與音效可分開開關。
- 學習紀錄與排行榜只存在各自的裝置（瀏覽器 localStorage，與南一版分開存）。

## 維護
- `src/bank*.js`：題庫原檔；`src/exam_match.json`：歷屆會考比對結果（keep／考過年份）
- `src/template.html`：遊戲本體；`node build.js` 組合出 `index.html`
- 每年加入新一屆會考：照 `tools/UPDATE.md`；歷屆考點索引在 `src/exam_index/`
- 圖片沿用南一版；要換圖：Gemini 畫好的圖放 `img_raw/`（檔名見 `Gemini生圖提示詞.md`），`python tools/process_images.py` 後 `node build.js`
