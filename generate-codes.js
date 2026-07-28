// generate-codes.js — 生成激活码和 codes.json
// 用法: node generate-codes.js
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// 排除容易混淆的字符: 0 O 1 l I
const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const SALT = ''; // 不加盐，直接对码原文做 SHA-256

function randomCode() {
  var parts = [];
  for (var i = 0; i < 3; i++) {
    var seg = '';
    for (var j = 0; j < 4; j++) {
      seg += CHARS[Math.floor(Math.random() * CHARS.length)];
    }
    parts.push(seg);
  }
  return 'SAMA-' + parts.join('-');
}

function sha256(s) {
  return crypto.createHash('sha256').update(s).digest('hex');
}

// 生成码
var codes = {};
var plainList = [];

// 20个 ¥3 码
for (var i = 0; i < 20; i++) {
  var code = randomCode();
  var hash = sha256(code);
  codes[hash] = { tier: 'basic', status: 'active' };
  plainList.push({ code: code, tier: '¥3', status: 'active' });
}

// 10个 ¥9.9 码
for (var i = 0; i < 10; i++) {
  var code = randomCode();
  var hash = sha256(code);
  codes[hash] = { tier: 'pro', status: 'active' };
  plainList.push({ code: code, tier: '¥9.9', status: 'active' });
}

// 写入 codes.json
var outPath = path.join(__dirname, 'codes.json');
fs.writeFileSync(outPath, JSON.stringify(codes, null, 2), 'utf-8');
console.log('✅ codes.json 已生成 (' + Object.keys(codes).length + ' 个码)');

// 输出明文码列表
console.log('\n===== 激活码清单（请妥善保存）=====\n');
plainList.forEach(function(item, i) {
  console.log((i + 1) + '. ' + item.code + ' — ' + item.tier);
});
console.log('\n管理码（硬编码，不需加到 codes.json）：');
console.log('  000 → 免费版');
console.log('  333 → ¥3 版');
console.log('  999 → ¥9.9 版');
