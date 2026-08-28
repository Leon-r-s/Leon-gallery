// SoldOut / 販売中 を切り替える道具
// 使い方: このフォルダで、コマンドプロンプトから
//   node toggle.js 2026-08-05
// と打つと、その日付の作品の状態が sold ⇔ available で切り替わります。

const fs = require('fs');
const path = require('path');

const targetDate = process.argv[2];

if (!targetDate) {
  console.log('日付を指定してください。例: node toggle.js 2026-08-05');
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

const before = item.status;
item.status = (item.status === 'sold') ? 'available' : 'sold';

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2) + '\n', 'utf-8');

console.log(`「${item.title}」(${item.date}) の状態を、${before} → ${item.status} に変更しました。`);
console.log('この後、GitHubに送り直すと、実際のサイトにも反映されます。');
