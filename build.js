const fs=require("fs"),p=require("path");const d=p.join(__dirname,"src");
const files=fs.readdirSync(d).filter(f=>/^bank.*\.js$/.test(f)).sort();
let bank=files.map(f=>fs.readFileSync(p.join(d,f),"utf8")).join("\n");
// 歷屆會考比對結果：只保留考過的題目，並附上考過的年份
const mf=p.join(d,"exam_match.json");let note="";
if(fs.existsSync(mf)){const M=JSON.parse(fs.readFileSync(mf,"utf8"));const keep={};for(const m of M)if(m.keep&&m.y&&m.y.length)keep[m.q]=[...new Set(m.y)].sort();
  global.QB=[];eval(bank);const before=QB.length;
  const kept=QB.filter(r=>keep[r[1]]);
  bank="QB.push(\n"+kept.map(r=>JSON.stringify(r)).join(",\n")+"\n);\nconst QY="+JSON.stringify(keep)+";";
  note=` (exam filter: ${kept.length}/${before} kept)`;}
else bank+="\nconst QY={};";
// 已處理好的圖片清單（img/*.webp），遊戲只載入存在的圖
const imgDir=p.join(__dirname,"img");
const imgs=fs.existsSync(imgDir)?fs.readdirSync(imgDir).filter(f=>f.endsWith(".webp")).map(f=>f.replace(".webp","")):[];
bank+="\nconst IMG=new Set("+JSON.stringify(imgs)+");";
const html=fs.readFileSync(p.join(d,"template.html"),"utf8").replace("/*__BANK__*/",()=>bank);
fs.writeFileSync(p.join(__dirname,"index.html"),html);console.log("built",html.length,"bytes"+note,"images:",imgs.length);
