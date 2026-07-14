import { useState } from 'react';
import { BUS_CITIES } from '../constants/stations';

const SRT_STATIONS = [
  '수서', '동탄', '평택지제', '천안아산', '오송',
  '공주', '대전', '익산', '전주', '정읍', '남원',
  '광주송정', '곡성', '나주', '구례구', '목포',
  '순천', '여천', '여수엑스포', '김천구미', '동대구',
  '서대구', '경주', '포항', '울산(통도사)', '밀양',
  '진영', '부산', '창원중앙', '창원', '마산', '진주',
];

function StationPicker({ stations, origin, destination, onStation, onSave, onReset }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm">
        <div className={`flex-1 text-center py-2 rounded-xl font-bold border-2 transition-all ${
          origin ? 'border-blue-400 bg-blue-50 text-blue-800' : 'border-blue-500 bg-blue-50 text-blue-600 animate-pulse'}`}>
          {origin ? `🚉 ${origin}` : '출발역을 선택해 주세요'}
        </div>
        <span className="text-gray-400 font-bold shrink-0">→</span>
        <div className={`flex-1 text-center py-2 rounded-xl font-bold border-2 transition-all ${
          destination ? 'border-orange-400 bg-orange-50 text-orange-800' :
          origin ? 'border-orange-400 bg-orange-50 text-orange-600 animate-pulse' : 'border-gray-200 text-gray-400'}`}>
          {destination ? `🏁 ${destination}` : (origin ? '도착역을 선택해 주세요' : '—')}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {stations.map(name => {
          const isOrigin = name === origin;
          const isDest   = name === destination;
          return (
            <button key={name} onClick={() => onStation(name)}
              className={`py-2 px-1 text-xs rounded-lg font-semibold border transition-all ${
                isOrigin ? 'bg-blue-500 text-white border-blue-500' :
                isDest   ? 'bg-orange-400 text-white border-orange-400' :
                'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}>
              {name}
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
          className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-lg text-sm disabled:bg-gray-200 disabled:text-gray-400 hover:bg-blue-700 transition-colors">
          {origin && destination ? `⭐ ${origin} → ${destination} 즐겨찾기 추가` : '출발역과 도착역을 선택해 주세요'}
        </button>
      </div>
    </div>
  );
}

export default function StationMap({ vendorType, onSelect }) {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  const reset = () => { setOrigin(''); setDestination(''); };

  const handleStation = (name) => {
    if (!origin) { setOrigin(name); }
    else if (!destination) {
      if (name === origin) { setOrigin(''); return; }
      setDestination(name);
    } else { setOrigin(name); setDestination(''); }
  };

  const handleSave = () => {
    if (origin && destination) { onSelect(origin, destination); reset(); }
  };

  const stations = vendorType === 'srt' ? SRT_STATIONS : BUS_CITIES;

  if (vendorType === 'ktx') {
    return (
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 text-center text-sm text-gray-500">
        KTX 노선도는 추후 추가 예정이에요. 직접 입력을 이용해 주세요.
      </div>
    );
  }

  return (
    <StationPicker
      stations={stations}
      origin={origin}
      destination={destination}
      onStation={handleStation}
      onSave={handleSave}
      onReset={reset}
    />
  );
}
