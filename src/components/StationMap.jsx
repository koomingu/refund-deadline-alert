import { useState, useRef, useCallback } from 'react';
import { BUS_CITIES } from '../constants/stations';

// 자동 감지 실패 시 사용하는 fallback 좌표
const FALLBACK_HOTSPOTS = [
  { name: '수서',         px: 54.0, py: 23.5 },
  { name: '동탄',         px: 53.5, py: 30.5 },
  { name: '평택지제',     px: 52.5, py: 37.5 },
  { name: '천안아산',     px: 50.0, py: 45.5 },
  { name: '오송',         px: 51.5, py: 52.0 },
  { name: '공주',         px: 37.5, py: 52.0 },
  { name: '대전',         px: 53.0, py: 57.5 },
  { name: '익산',         px: 36.5, py: 63.5 },
  { name: '전주',         px: 43.5, py: 68.5 },
  { name: '정읍',         px: 27.5, py: 70.5 },
  { name: '남원',         px: 43.5, py: 75.5 },
  { name: '광주송정',     px: 24.5, py: 78.0 },
  { name: '곡성',         px: 40.5, py: 81.0 },
  { name: '나주',         px: 22.0, py: 83.5 },
  { name: '구례구',       px: 40.5, py: 86.5 },
  { name: '목포',         px: 13.5, py: 91.5 },
  { name: '순천',         px: 41.5, py: 91.0 },
  { name: '여천',         px: 46.5, py: 94.5 },
  { name: '여수엑스포',   px: 48.5, py: 97.5 },
  { name: '김천구미',     px: 62.5, py: 61.5 },
  { name: '동대구',       px: 72.5, py: 66.0 },
  { name: '서대구',       px: 63.5, py: 67.5 },
  { name: '경주',         px: 83.0, py: 64.5 },
  { name: '포항',         px: 89.0, py: 49.0 },
  { name: '울산(통도사)', px: 80.5, py: 71.5 },
  { name: '밀양',         px: 68.5, py: 74.5 },
  { name: '진영',         px: 78.0, py: 76.5 },
  { name: '부산',         px: 86.5, py: 79.5 },
  { name: '창원중앙',     px: 73.0, py: 81.0 },
  { name: '창원',         px: 63.5, py: 82.0 },
  { name: '마산',         px: 60.5, py: 83.5 },
  { name: '진주',         px: 53.5, py: 86.5 },
];

// canvas로 이미지에서 분홍 원 중심 좌표를 자동 감지
function detectPinkCircles(img) {
  const W = img.naturalWidth;
  const H = img.naturalHeight;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, W, H);

  const visited = new Uint8Array(W * H);
  const clusters = [];

  const isPink = (i) => {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    return a > 128 && r > 160 && g < 100 && b > 60 && r > b && r > g * 2;
  };

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const idx = y * W + x;
      if (visited[idx] || !isPink(idx * 4)) continue;

      // BFS
      const queue = [idx];
      visited[idx] = 1;
      let sumX = 0, sumY = 0, count = 0;
      let qi = 0;
      while (qi < queue.length) {
        const cur = queue[qi++];
        const cx = cur % W, cy = Math.floor(cur / W);
        sumX += cx; sumY += cy; count++;
        for (const [dx, dy] of [[-1,0],[1,0],[0,-1],[0,1]]) {
          const nx = cx + dx, ny = cy + dy;
          if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
          const ni = ny * W + nx;
          if (!visited[ni] && isPink(ni * 4)) {
            visited[ni] = 1;
            queue.push(ni);
          }
        }
      }
      if (count >= 20) {
        clusters.push({ px: (sumX / count / W) * 100, py: (sumY / count / H) * 100, size: count });
      }
    }
  }
  return clusters;
}

// 감지된 클러스터를 fallback 좌표와 매핑
function matchClustersToStations(clusters) {
  const used = new Set();
  return FALLBACK_HOTSPOTS.map(station => {
    let best = null, bestDist = Infinity;
    clusters.forEach((c, i) => {
      if (used.has(i)) return;
      const dx = c.px - station.px, dy = c.py - station.py;
      const dist = dx * dx + dy * dy;
      if (dist < bestDist && dist < 64) { bestDist = dist; best = i; }
    });
    if (best !== null) {
      used.add(best);
      return { name: station.name, px: clusters[best].px, py: clusters[best].py };
    }
    return station;
  });
}

export default function StationMap({ vendorType, onSelect }) {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [hotspots, setHotspots] = useState(FALLBACK_HOTSPOTS);
  const [detecting, setDetecting] = useState(true);

  const reset = () => { setOrigin(''); setDestination(''); };

  const handleSave = () => {
    if (origin && destination) { onSelect(origin, destination); reset(); }
  };

  const handleStation = (name) => {
    if (!origin) { setOrigin(name); }
    else if (!destination) {
      if (name === origin) { setOrigin(''); return; }
      setDestination(name);
    } else { setOrigin(name); setDestination(''); }
  };

  const onImgLoad = useCallback((e) => {
    setDetecting(true);
    try {
      const clusters = detectPinkCircles(e.target);
      setHotspots(matchClustersToStations(clusters));
    } catch {
      setHotspots(FALLBACK_HOTSPOTS);
    }
    setDetecting(false);
  }, []);

  if (vendorType === 'bus') {
    return <BusCityPicker origin={origin} destination={destination}
      setOrigin={setOrigin} setDestination={setDestination}
      onSave={handleSave} onReset={reset} />;
  }

  if (vendorType === 'ktx') {
    return (
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 text-center text-sm text-gray-500">
        KTX 노선도는 추후 추가 예정이에요. 직접 입력을 이용해 주세요.
      </div>
    );
  }

  const step = !origin ? 'origin' : !destination ? 'dest' : 'done';

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm">
        <div className={`flex-1 text-center py-2 rounded-xl font-bold border-2 transition-all ${
          step === 'origin' ? 'border-blue-500 bg-blue-50 text-blue-700 animate-pulse' :
          origin ? 'border-blue-400 bg-blue-50 text-blue-800' : 'border-gray-200 text-gray-400'}`}>
          {origin ? `🚉 ${origin}` : '출발역을 선택해 주세요'}
        </div>
        <span className="text-gray-400 font-bold shrink-0">→</span>
        <div className={`flex-1 text-center py-2 rounded-xl font-bold border-2 transition-all ${
          step === 'dest' ? 'border-orange-400 bg-orange-50 text-orange-700 animate-pulse' :
          destination ? 'border-orange-400 bg-orange-50 text-orange-800' : 'border-gray-200 text-gray-400'}`}>
          {destination ? `🏁 ${destination}` : (origin ? '도착역을 선택해 주세요' : '—')}
        </div>
      </div>

      {/* 이미지 + 오버레이 — 높이 제한 */}
      <div className="relative border border-gray-200 rounded-xl overflow-hidden bg-white select-none"
           style={{ maxHeight: '400px' }}>
        <img
          src={`${import.meta.env.BASE_URL}srt-map.png`}
          alt="SRT 노선도"
          className="w-full h-full object-contain"
          onLoad={onImgLoad}
          draggable={false}
          crossOrigin="anonymous"
        />

        {detecting && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50">
            <span className="text-xs text-gray-400">분석 중...</span>
          </div>
        )}

        {!detecting && hotspots.map(s => {
          const isOrigin = s.name === origin;
          const isDest   = s.name === destination;
          return (
            <button
              key={s.name}
              onClick={() => handleStation(s.name)}
              title={s.name}
              style={{ left: `${s.px}%`, top: `${s.py}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
            >
              <span className={`flex items-center justify-center rounded-full border-2 transition-all ${
                isOrigin ? 'w-5 h-5 bg-blue-500 border-blue-700 shadow-lg' :
                isDest   ? 'w-5 h-5 bg-orange-400 border-orange-600 shadow-lg' :
                'w-5 h-5 bg-transparent border-transparent hover:bg-blue-300/50 hover:border-blue-400'
              }`} />
              {(isOrigin || isDest) && (
                <span className={`absolute left-1/2 -translate-x-1/2 top-full mt-0.5 whitespace-nowrap text-[10px] font-bold px-1 rounded shadow text-white z-10 ${
                  isOrigin ? 'bg-blue-600' : 'bg-orange-500'}`}>
                  {s.name}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 text-center">역 위를 탭하세요 · 출발 → 도착 순서로 선택</p>

      <div className="flex gap-2">
        {(origin || destination) && (
          <button onClick={reset}
            className="px-4 py-2 text-sm text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50">
            초기화
          </button>
        )}
        <button onClick={handleSave} disabled={!origin || !destination}
          className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-lg text-sm disabled:bg-gray-200 disabled:text-gray-400 hover:bg-blue-700 transition-colors">
          {origin && destination
            ? `⭐ ${origin} → ${destination} 즐겨찾기 추가`
            : '출발역과 도착역을 선택해 주세요'}
        </button>
      </div>
    </div>
  );
}

function BusCityPicker({ origin, destination, setOrigin, setDestination, onSave, onReset }) {
  const handleCity = (city) => {
    if (!origin) { setOrigin(city); return; }
    if (!destination) {
      if (city === origin) { setOrigin(''); return; }
      setDestination(city); return;
    }
    setOrigin(city); setDestination('');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm">
        <div className={`flex-1 text-center py-2 rounded-xl font-bold border-2 ${origin ? 'border-blue-400 bg-blue-50 text-blue-800' : 'border-blue-500 bg-blue-50 text-blue-600 animate-pulse'}`}>
          {origin ? `🚌 ${origin}` : '출발지를 선택해 주세요'}
        </div>
        <span className="text-gray-400 font-bold shrink-0">→</span>
        <div className={`flex-1 text-center py-2 rounded-xl font-bold border-2 ${destination ? 'border-orange-400 bg-orange-50 text-orange-800' : origin ? 'border-orange-400 bg-orange-50 text-orange-600 animate-pulse' : 'border-gray-200 text-gray-400'}`}>
          {destination ? `🏁 ${destination}` : (origin ? '도착지를 선택해 주세요' : '—')}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {BUS_CITIES.map(city => {
          const isOrigin = city === origin;
          const isDest   = city === destination;
          return (
            <button key={city} onClick={() => handleCity(city)}
              className={`py-2 px-1 text-xs rounded-lg font-semibold border transition-all ${
                isOrigin ? 'bg-blue-500 text-white border-blue-500' :
                isDest   ? 'bg-orange-400 text-white border-orange-400' :
                'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}>
              {city}
            </button>
          );
        })}
      </div>
      <div className="flex gap-2">
        {(origin || destination) && (
          <button onClick={onReset} className="px-4 py-2 text-sm text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50">초기화</button>
        )}
        <button onClick={onSave} disabled={!origin || !destination}
          className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-lg text-sm disabled:bg-gray-200 disabled:text-gray-400 hover:bg-blue-700">
          {origin && destination ? `⭐ ${origin} → ${destination} 즐겨찾기 추가` : '출발지와 도착지를 선택해 주세요'}
        </button>
      </div>
    </div>
  );
}
