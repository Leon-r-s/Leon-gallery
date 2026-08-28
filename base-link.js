// BASEの商品リンクを、特定の作品に設定する道具
// 使い方: このフォルダで、コマンドプロンプトから
//   node base-link.js 2026-08-15 https://leon-r-s.thebase.in/items/xxxxx
// と打つと、その日付の作品に、BASEの購入リンクが設定されます。
//
// リンクを消したいときは、URLを省略してください。
//   node base-link.js 2026-08-15

const fs = require('fs');
const path = require('path');

const targetDate = process.argv[2];
const url = process.argv[3];

if (!targetDate) {
  console.log('日付を指定してください。例: node base-link.js 2026-08-15 https://leon-r-s.thebase.in/items/xxxxx');
  process.exit(1);
}

const dataPath = path.join(__dirname, 'data.json');
const raw = fs.readFileSync(dataPath, 'utf-8');
const data = JSON.parse(raw);

const item = data.items.find(i => i.date === targetDate || i.id === targetDate);

if (!item) {
  console.log(`${targetDate} の作品が見つかりませんでした。日付を確認してください。`);
  process.exit(1);
}

if (url) {
  item.base_url = url;
  console.log(`「${item.title}」(${item.date}) に、BASEのリンクを設定しました。`);
  console.log(url);
} else {
  delete item.base_url;
  console.log(`「${item.title}」(${item.date}) の、BASEのリンクを消しました。`);
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
console.log('この後、GitHub Desktopで Commit → Push すると、サイトに反映されます。');
