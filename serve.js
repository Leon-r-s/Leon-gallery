// ローカルで確認するための簡易サーバー
// 使い方: このフォルダで `node serve.js` を実行し、http://localhost:8791 を開く
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg' };

http.createServer((req, res) => {
  let filePath = path.join(root, decodeURIComponent(req.url) === '/' ? '/index.html' : decodeURIComponent(req.url));
  const ext = path.extname(filePath);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(8791, () => console.log('http://localhost:8791 で確認できます'));
