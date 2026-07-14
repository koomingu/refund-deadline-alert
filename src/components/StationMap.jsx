import { useState, useRef } from 'react';
import { BUS_CITIES } from '../constants/stations';

// SRT 이미지 위에 오버레이할 역 좌표 (이미지 크기 기준: 자연 크기 대비 %)
// 퍼센트(%) 좌표 → 실제 렌더 크기에 맞게 자동 스케일
// 이미지 실측 좌표 (공식 SRT 노선도 이미지 기준 %)
const SRT_HOTSPOTS = [
  // 경부선
  { name: '수서',         px: 54.0, py: 23.5 },
  { name: '동탄',         px: 53.5, py: 30.5 },
  { name: '평택지제',     px: 52.5, py: 37.5 },
  { name: '천안아산',     px: 50.0, py: 45.5 },
  { name: '오송',         px: 51.5, py: 52.0 },
  { name: '대전',         px: 53.0, py: 57.5 },
  { name: '김천구미',     px: 62.5, py: 61.5 },
  { name: '동대구',       px: 72.5, py: 66.0 },
  { name: '경주',         px: 83.0, py: 64.5 },
  { name: '울산(통도사)', px: 80.5, py: 71.5 },
  { name: '부산',         px: 86.5, py: 79.5 },
  // 호남선 (오송 분기)
  { name: '공주',         px: 37.5, py: 52.0 },
  { name: '익산',         px: 36.5, py: 63.5 },
  { name: '정읍',         px: 27.5, py: 70.5 },
  { name: '광주송정',     px: 24.5, py: 78.0 },
  { name: '나주',         px: 22.0, py: 83.5 },
  { name: '목포',         px: 13.5, py: 91.5 },
  // 전라선 (익산 분기)
  { name: '전주',         px: 43.5, py: 68.5 },
  { name: '남원',         px: 43.5, py: 75.5 },
  { name: '곡성',         px: 40.5, py: 81.0 },
  { name: '구례구',       px: 40.5, py: 86.5 },
  { name: '순천',         px: 41.5, py: 91.0 },
  { name: '여천',         px: 46.5, py: 94.5 },
  { name: '여수엑스포',   px: 48.5, py: 97.5 },
  // 경전선 (서대구 분기)
  { name: '서대구',       px: 63.5, py: 67.5 },
  { name: '밀양',         px: 68.5, py: 74.5 },
  { name: '진영',         px: 78.0, py: 76.5 },
  { name: '창원중앙',     px: 73.0, py: 81.0 },
  { name: '창원',         px: 63.5, py: 82.0 },
  { name: '마산',         px: 60.5, py: 83.5 },
  { name: '진주',         px: 53.5, py: 86.5 },
  // 동해선 (동대구 분기)
  { name: '포항',         px: 89.0, py: 49.0 },
];

export default function StationMap({ vendorType, onSelect }) {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const imgRef = useRef(null);

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

  const onImgLoad = (e) => {
    setImgSize({ w: e.target.offsetWidth, h: e.target.offsetHeight });
  };

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
      {/* 선택 상태 */}
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

      {/* 이미지 + 오버레이 */}
      <div className="relative border border-gray-200 rounded-xl overflow-hidden bg-white select-none">
        <img
          ref={imgRef}
          src={`${import.meta.env.BASE_URL}srt-map.png`}
          alt="SRT 노선도"
          className="w-full"
          onLoad={onImgLoad}
          draggable={false}
        />

        {/* 역 클릭 포인트 */}
        {SRT_HOTSPOTS.map(s => {
          const isOrigin = s.name === origin;
          const isDest   = s.name === destination;
          return (
            <button
              key={s.name}
              onClick={() => handleStation(s.name)}
              title={s.name}
              style={{ left: `${s.px}%`, top: `${s.py}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group"
            >
              <span className={`flex items-center justify-center rounded-full border-2 transition-all ${
                isOrigin ? 'w-5 h-5 bg-blue-500 border-blue-700 shadow-lg' :
                isDest   ? 'w-5 h-5 bg-orange-400 border-orange-600 shadow-lg' :
                'w-3.5 h-3.5 bg-white/80 border-pink-600 hover:w-5 hover:h-5 hover:bg-pink-100'
              }`} />
              {(isOrigin || isDest) && (
                <span className={`absolute left-1/2 -translate-x-1/2 top-full mt-0.5 whitespace-nowrap text-[10px] font-bold px-1 rounded shadow text-white ${
                  isOrigin ? 'bg-blue-600' : 'bg-orange-500'}`}>
                  {s.name}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 text-center">역 위의 동그라미를 탭하세요 · 출발 → 도착 순서로 선택</p>

      {/* 액션 버튼 */}
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
