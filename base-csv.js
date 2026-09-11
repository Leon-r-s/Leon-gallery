// まだBASEに登録していない作品だけを集めて、BASE用のCSVと画像zipを作る道具。
// 使い方: このフォルダで
//   node base-csv.js
// → base_upload/new_items.csv と base_upload/new_images.zip ができる。
//   それをBASEの「CSV商品管理」でアップロードする。
// 「登録していない」の判定 = data.json に base_url が無く、売約済みでもない作品。
const fs=require('fs'),path=require('path'),{execSync}=require('child_process');
const d=JSON.parse(fs.readFileSync(path.join(__dirname,'data.json'),'utf8'));
const items=d.items.filter(i=>i.status!=='sold'&&!i.base_url).sort((a,b)=>a.date.localeCompare(b.date));
if(!items.length){console.log('新しく登録する作品はありません（全部、BASEのリンクが付いています）。');process.exit(0);}
const out=path.join(__dirname,'base_upload');const imgDir=path.join(out,'new_images');
fs.rmSync(imgDir,{recursive:true,force:true});fs.mkdirSync(imgDir,{recursive:true});
const jp=s=>s.replace(/-/g,'/');const esc=v=>'"'+String(v).replace(/"/g,'""')+'"';
const header=['商品ID','商品コード','商品名','説明','価格','税率','在庫数','公開状態','表示順','種類ID','種類コード','JAN/GTIN','種類名','種類在庫数','画像1'];
const rows=[header.map(esc).join(',')];let order=1;
for(const it of items){
  const ext=path.extname(it.image).toLowerCase();const asciiName=`${it.date}${ext}`;
  fs.copyFileSync(path.join(__dirname,'images',it.image),path.join(imgDir,asciiName));
  const name=`毎日一枚 原画（はがきサイズ）｜${it.title}（${jp(it.date)}）`;
  const desc=[`${jp(it.date)} の、毎日一枚の原画です。`,`タイトル「${it.title}」。`,``,`サイズ: はがきサイズくらい（約10.7×14.5cm）`,`紙に手描き。一点ものです。`,``,`画像は投稿したときのものです。実物は、色味が少し違って見えることがあります。`,``,`毎日一枚、手で描いています。この絵は、その一日です。`,`ほかの日の絵は、原画ギャラリーで見られます。`,`https://leon-r-s.github.io/Leon-gallery/`].join('\n');
  rows.push(['',it.date,name,desc,it.price||2000,1,1,1,order++,'','','','','',asciiName].map(esc).join(','));
}
fs.writeFileSync(path.join(out,'new_items.csv'),'﻿'+rows.join('\r\n')+'\r\n','utf8');
const zip=path.join(out,'new_images.zip');fs.rmSync(zip,{force:true});
execSync(`powershell -NoProfile -Command "Compress-Archive -Path '${imgDir}\*' -DestinationPath '${zip}'"`);
console.log(`${items.length} 点分を作りました。`);
console.log('  base_upload/new_items.csv');
console.log('  base_upload/new_images.zip');
console.log('この2つを、BASEの「CSV商品管理」→「商品の一括登録・編集」でアップロードしてください。');
console.log('登録が終わったら、BASEからCSVをダウンロードして、node base-link-csv.js base_upload/base_export.csv を打ってください。');
