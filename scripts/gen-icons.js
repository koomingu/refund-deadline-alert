// Node.js 스크립트: SVG → PNG 아이콘 생성 (canvas 없이 직접 최소 PNG 작성)
// 실행: node scripts/gen-icons.js
import { createCanvas } from 'canvas';
import { writeFileSync } from 'fs';

function makeIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // 배경
  ctx.fillStyle = '#1d4ed8';
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.2);
  ctx.fill();

  // 벨 이모지
  ctx.font = `${size * 0.55}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🔔', size / 2, size / 2 + size * 0.04);

  return canvas.toBuffer('image/png');
}

writeFileSync('public/icon-192.png', makeIcon(192));
writeFileSync('public/icon-512.png', makeIcon(512));
console.log('Icons generated!');
