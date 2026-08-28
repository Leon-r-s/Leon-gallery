// images フォルダの中の「日付_タイトル.jpg」を読み取って、data.json を自動生成する道具
// 使い方: このフォルダで `node build-data.js` を実行する
// すでにある SoldOut の状態は、上書きしないように保持します。

const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'images');
const dataPath = path.join(__dirname, 'data.json');

const DATE_TITLE_RE = /^(\d{4}-\d{2}-\d{2})_(.+)\.(jpg|jpeg|png|webp)$/i;

// 既存の data.json があれば、SoldOut などの状態を引き継ぐために読み込む
let existingStatus = {};
if (fs.existsSync(dataPath)) {
  try {
    const existing = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    existing.items.forEach(item => {
      existingStatus[item.date] = item.status;
    });
  } catch (e) {
    console.log('既存のdata.jsonが読めなかったので、新規に作ります。');
  }
}

const files = fs.readdirSync(imagesDir);
const items = [];

files.forEach(file => {
  const match = file.match(DATE_TITLE_RE);
  if (!match) {
    console.log(`スキップ(形式に合わない): ${file}`);
    return;
  }
  const [, date, title] = match;
  items.push({
    id: date,
    date,
    title,
    image: file,
    price: 2000,
    status: existingStatus[date] || 'available',
    note: ''
  });
});

items.sort((a, b) => a.date.localeCompare(b.date));

const data = { artist: 'れおん', items };
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2) + '\n', 'utf-8');

console.log(`${items.length} 件を登録しました。(${items[0]?.date} 〜 ${items[items.length - 1]?.date})`);
