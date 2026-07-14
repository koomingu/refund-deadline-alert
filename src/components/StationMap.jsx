import { useState } from 'react';
import {
  SRT_STATIONS, SRT_LINES,
  KTX_STATIONS, KTX_LINES,
  BUS_CITIES,
  buildPositionMap, buildConnections,
} from '../constants/stations';

const VENDOR = {
  srt: { stations: SRT_STATIONS, lines: SRT_LINES, color: '#BE185D', viewBox: '65 12 350 475' },
  ktx: { stations: KTX_STATIONS, lines: KTX_LINES, color: '#1d4ed8', viewBox: '65 8 350 430' },
};

export default function StationMap({ vendorType, onSelect }) {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  const reset = () => { setOrigin(''); setDestination(''); };

  const handleSave = () => {
    if (origin && destination) {
      onSelect(origin, destination);
      reset();
    }
  };

  if (vendorType === 'bus') {
    return (
      <BusCityPicker
        origin={origin} destination={destination}
        setOrigin={setOrigin} setDestination={setDestination}
        onSave={handleSave} onReset={reset}
      />
    );
  }

  const cfg = VENDOR[vendorType];
  if (!cfg) return null;

  const posMap = buildPositionMap(cfg.stations);
  const connections = buildConnections(cfg.lines, posMap);

  const handleStation = (name) => {
    if (!origin) {
      setOrigin(name);
    } else if (!destination) {
      if (name === origin) { setOrigin(''); return; }
      setDestination(name);
    } else {
      setOrigin(name);
      setDestination('');
    }
  };

  const step = !origin ? 'origin' : !destination ? 'dest' : 'done';

  return (
    <div className="space-y-3">
      {/* 선택 상태 표시 */}
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

      {/* SVG 노선도 */}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
        <svg viewBox={cfg.viewBox} className="w-full select-none" style={{ maxHeight: 420 }}>
          {/* 노선 연결선 */}
          {connections.map((c, i) => (
            <line key={i} x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2}
              stroke={cfg.color} strokeWidth="2.5" strokeOpacity="0.35" />
          ))}

          {/* 역 */}
          {cfg.stations.map(s => {
            const isOrigin = s.name === origin;
            const isDest   = s.name === destination;
            return (
              <g key={s.name} onClick={() => handleStation(s.name)} style={{ cursor: 'pointer' }}>
                {/* 터치 영역 확대 */}
                <circle cx={s.x} cy={s.y} r={14} fill="transparent" />
                <circle
                  cx={s.x} cy={s.y}
                  r={isOrigin || isDest ? 7 : 5}
                  fill={isOrigin ? '#3b82f6' : isDest ? '#f97316' : 'white'}
                  stroke={isOrigin ? '#1d4ed8' : isDest ? '#ea580c' : cfg.color}
                  strokeWidth={isOrigin || isDest ? 2.5 : 1.5}
                />
                <text
                  x={s.tx} y={s.ty}
                  fontSize={isOrigin || isDest ? 10 : 9}
                  fill={isOrigin ? '#1d4ed8' : isDest ? '#ea580c' : '#374151'}
                  fontWeight={isOrigin || isDest ? 'bold' : 'normal'}
                  textAnchor={s.ta}
                  style={{ userSelect: 'none', pointerEvents: 'none' }}>
                  {s.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-2">
        {(origin || destination) && (
          <button onClick={reset}
            className="px-4 py-2 text-sm text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50">
            초기화
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={!origin || !destination}
          className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-lg text-sm disabled:bg-gray-200 disabled:text-gray-400 hover:bg-blue-700 transition-colors">
          {origin && destination ? `⭐ ${origin} → ${destination} 즐겨찾기 추가` : '출발역과 도착역을 선택해 주세요'}
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
          <button onClick={onReset} className="px-4 py-2 text-sm text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50">
            초기화
          </button>
        )}
        <button onClick={onSave} disabled={!origin || !destination}
          className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-lg text-sm disabled:bg-gray-200 disabled:text-gray-400 hover:bg-blue-700">
          {origin && destination ? `⭐ ${origin} → ${destination} 즐겨찾기 추가` : '출발지와 도착지를 선택해 주세요'}
        </button>
      </div>
    </div>
  );
}
