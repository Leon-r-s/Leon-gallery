// BASEからダウンロードした商品CSVを読んで、data.json の各作品にBASEの購入リンクを一気に付ける道具。
// 使い方: このフォルダで
//   node base-link-csv.js base_upload/base_export.csv
// 「商品コード」があればそれ（=日付）で、無ければ「商品名」の中の日付（2026/06/04）で作品を探し、
// base_url = https://leolabo.base.shop/items/<商品ID> を設定します。Shift_JISでもUTF-8でも読めます。
const fs=require('fs'),path=require('path');
const file=process.argv[2];
if(!file){console.log('CSVファイルを指定してください。例: node base-link-csv.js base_upload/base_export.csv');process.exit(1);}
const buf=fs.readFileSync(file);let text=buf.toString('utf8');
if(/�/.test(text.slice(0,3000)))text=new TextDecoder('shift_jis').decode(buf);
if(text.charCodeAt(0)===0xFEFF)text=text.slice(1);
const parse=t=>{const rows=[];let row=[],f='',q=false;for(let i=0;i<t.length;i++){const c=t[i];if(q){if(c==='"'){if(t[i+1]==='"'){f+='"';i++;}else q=false;}else f+=c;}else{if(c==='"')q=true;else if(c===','){row.push(f);f='';}else if(c==='\n'){row.push(f);rows.push(row);row=[];f='';}else if(c!=='\r')f+=c;}}if(f!==''||row.length){row.push(f);rows.push(row);}return rows;};
const rows=parse(text);const h=rows[0].map(x=>x.trim());
const idCol=h.findIndex(x=>/商品ID/.test(x)),codeCol=h.findIndex(x=>/商品コード/.test(x)),nameCol=h.findIndex(x=>/^商品名$/.test(x));
if(idCol<0||(codeCol<0&&nameCol<0)){console.log('CSVに「商品ID」と、「商品コード」か「商品名」の列が要ります。ダウンロード時にチェックを入れてください。');process.exit(1);}
const dataPath=path.join(__dirname,'data.json');const data=JSON.parse(fs.readFileSync(dataPath,'utf8'));
let n=0,skipped=[];
for(const r of rows.slice(1)){
  const id=(r[idCol]||'').trim();if(!id)continue;
  let date=codeCol>=0?(r[codeCol]||'').trim():'';
  if(!date&&nameCol>=0){const m=(r[nameCol]||'').match(/(\d{4})\/(\d{2})\/(\d{2})/);if(m)date=`${m[1]}-${m[2]}-${m[3]}`;}
  if(!date){skipped.push(r[nameCol]||id);continue;}
  const it=data.items.find(i=>i.date===date);
  if(it){it.base_url=`https://leolabo.base.shop/items/${id}`;n++;}else skipped.push(date);
}
fs.writeFileSync(dataPath,JSON.stringify(data,null,2)+'\n','utf8');
console.log(`${n} 点にBASEのリンクを付けました。`);
if(skipped.length)console.log('紐づけなかった行: '+skipped.join(' / '));
console.log('このあと GitHub Desktop で Commit → Push すると、サイトに反映されます。');
