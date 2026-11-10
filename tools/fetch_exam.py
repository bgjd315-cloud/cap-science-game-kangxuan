"""下載某一年國中教育會考自然科試題本，抽文字、每頁轉圖片。
用法：python -I -X utf8 tools/fetch_exam.py 116
輸出：work/116/sci116.pdf、sci116.txt、pages/p01.png…
找不到該年度頁面或「自然科」連結時，印出 NOT_PUBLISHED 並以代碼 2 結束（代表還沒公布）。
"""
import os, re, sys, urllib.request
import pymupdf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UA = {"User-Agent": "Mozilla/5.0 (cap-science-game updater)"}

def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
        return r.read()

def main(y):
    out = os.path.join(ROOT, "work", str(y)); os.makedirs(os.path.join(out, "pages"), exist_ok=True)
    try:
        html = get(f"https://cap.rcpet.edu.tw/exam/{y}/{y}exam.html").decode("utf-8", "replace")
    except Exception as e:
        print("NOT_PUBLISHED", "year page:", e); sys.exit(2)
    flat = html.replace("\n", " ")
    # 題本連結格式：<a href="https://drive.google.com/file/d/<id>/view…">自然科</a>（第一個「自然科」是題本）
    m = re.search(r'drive\.google\.com/file/d/([A-Za-z0-9_-]+)[^>]*>\s*自然科', flat)
    if not m:
        print("NOT_PUBLISHED", "no 自然科 link"); sys.exit(2)
    fid = m.group(1)
    pdf = get(f"https://drive.usercontent.google.com/download?id={fid}&export=download&confirm=t")
    if not pdf.startswith(b"%PDF"):
        print("DOWNLOAD_FAILED", fid); sys.exit(3)
    p = os.path.join(out, f"sci{y}.pdf"); open(p, "wb").write(pdf)
    doc = pymupdf.open(p)
    txt = "\n".join(f"\n[p{i+1}]\n" + pg.get_text() for i, pg in enumerate(doc))
    open(os.path.join(out, f"sci{y}.txt"), "w", encoding="utf-8").write(txt)
    for i, pg in enumerate(doc):
        pg.get_pixmap(dpi=110).save(os.path.join(out, "pages", f"p{i+1:02d}.png"))
    chars = len(re.sub(r"\s", "", txt))
    print("OK", y, "drive id", fid, "pages", doc.page_count, "text chars", chars, "(0 = scanned, read the PNGs)")

if __name__ == "__main__":
    main(int(sys.argv[1]))
