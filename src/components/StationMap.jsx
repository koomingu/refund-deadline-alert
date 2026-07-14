import { useState } from 'react';
import { BUS_CITIES } from '../constants/stations';

// 주요 역 (상단 블럭 - SRT 앱 기준 고정 순서)
const SRT_MAIN = [
  '수서', '동탄', '평택지제',
  '천안아산', '오송', '대전',
  '동대구', '울산(통도사)', '부산',
  '익산', '광주송정', '목포',
  '창원중앙',
];

// 전체 역 가나다순 (하단 블럭)
const SRT_ALL = [
  '경주', '공주', '곡성', '광주송정', '구례구',
  '김천구미', '나주', '남원', '대전', '동대구',
  '동탄', '마산', '밀양', '목포', '부산',
  '서대구', '수서', '순천', '오송', '울산(통도사)',
  '익산', '여수엑스포', '여천', '정읍', '전주',
  '진영', '진주', '천안아산', '창원', '창원중앙',
  '평택지제', '포항',
];

function StationPicker({ mainStations, allStations, origin, destination, onStation, onSave, onReset }) {
  return (
    <div className="space-y-3">
      {/* 선택 상태 */}
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

      {/* 주요 역 블럭 */}
      <div>
        <p className="text-[11px] font-bold text-gray-400 mb-1.5">주요 역</p>
        <div className="grid grid-cols-3 gap-1.5">
          {mainStations.map(name => <StationBtn key={name} name={name} origin={origin} destination={destination} onStation={onStation} />)}
        </div>
      </div>

      {/* 전체 역 블럭 */}
      <div>
        <p className="text-[11px] font-bold text-gray-400 mb-1.5">전체 역</p>
        <div className="grid grid-cols-3 gap-1.5">
          {allStations.map(name => <StationBtn key={name} name={name} origin={origin} destination={destination} onStation={onStation} />)}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
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

function StationBtn({ name, origin, destination, onStation }) {
  const isOrigin = name === origin;
  const isDest   = name === destination;
  return (
    <button onClick={() => onStation(name)}
      className={`py-2 px-1 text-xs rounded-lg font-semibold border transition-all ${
        isOrigin ? 'bg-blue-500 text-white border-blue-500' :
        isDest   ? 'bg-orange-400 text-white border-orange-400' :
        'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}>
      {name}
    </button>
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

  if (vendorType === 'ktx') {
    return (
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 text-center text-sm text-gray-500">
        KTX 노선도는 추후 추가 예정이에요. 직접 입력을 이용해 주세요.
      </div>
    );
  }

  if (vendorType === 'bus') {
    return (
      <StationPicker
        mainStations={[]}
        allStations={BUS_CITIES}
        origin={origin}
        destination={destination}
        onStation={handleStation}
        onSave={handleSave}
        onReset={reset}
      />
    );
  }

  return (
    <StationPicker
      mainStations={SRT_MAIN}
      allStations={SRT_ALL}
      origin={origin}
      destination={destination}
      onStation={handleStation}
      onSave={handleSave}
      onReset={reset}
    />
  );
}
