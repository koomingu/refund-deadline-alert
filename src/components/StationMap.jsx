import { useState, useRef } from 'react';
import { BUS_CITIES } from '../constants/stations';

const SRT_MAIN = [
  '수서', '동탄', '평택지제',
  '천안아산', '오송', '대전',
  '동대구', '울산(통도사)', '부산',
  '익산', '광주송정', '목포',
  '창원중앙',
];

const SRT_ALL = [
  '경주', '공주', '곡성', '광주송정', '구례구',
  '김천구미', '나주', '남원', '대전', '동대구',
  '동탄', '마산', '밀양', '목포', '부산',
  '서대구', '수서', '순천', '오송', '울산(통도사)',
  '익산', '여수엑스포', '여천', '정읍', '전주',
  '진영', '진주', '천안아산', '창원', '창원중앙',
  '평택지제', '포항',
];

// KTX 전체 역 (가나다순, 스크린샷 기준)
const KTX_ALL = [
  // ㄱ
  '가남', '가평', '각계', '감곡장호원', '강경', '강구', '강릉', '강촌', '개포',
  '경산', '경주', '계룡', '고래불', '고한', '곡성', '공주', '광명', '광양',
  '광주', '광주송정', '광천', '구례구', '구미', '구포', '군북', '군산', '군위',
  '극락강', '근덕', '기성', '기장', '김제', '김천', '김천구미',
  // ㄴ
  '나전', '나주', '남성현', '남원', '남창', '남춘천', '논산', '능주',
  // ㄷ
  '대전', '대구', '동대구', '동탄', '동해',
  // ㄹ
  '량원',
  // ㅁ
  '마산', '망우', '밀양',
  // ㅂ
  '부산', '부전',
  // ㅅ
  '서대구', '서울', '서정리', '석불', '수서', '수원', '순천', '신경주',
  '신탄진', '쌍룡',
  // ㅇ
  '안동', '안산', '양평', '여수엑스포', '여천', '영천', '오송', '오탄',
  '옥천', '왜관', '용산', '울산(통도사)', '원주', '익산',
  // ㅈ
  '장성', '전주', '정읍', '조치원', '진영', '진주', '진해',
  // ㅊ
  '창원', '창원중앙', '천안', '천안아산', '청량리', '청주공항', '춘천',
  // ㅋ
  // ㅌ
  '태백', '태화강', '퇴계원',
  // ㅍ
  '판교(경기)', '판교(충남)', '평내호평', '평창', '평택', '평택지제', '평해', '포항', '풍기',
  // ㅎ
  '하동', '하양', '한림정', '함안', '함열', '함창', '함평', '합덕', '행신',
  '항남', '현동', '홍성', '화명', '화성시청', '화순', '황간', '횡성', '횡천',
  '효천', '후포', '흥부',
];

// 한글 초성 추출
const CHOSUNG = ['ㄱ','ㄴ','ㄷ','ㄹ','ㅁ','ㅂ','ㅅ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
function getChosung(str) {
  const code = str.charCodeAt(0) - 0xAC00;
  if (code < 0) return str[0];
  return CHOSUNG[Math.floor(code / 28 / 21)];
}

function StationBtn({ name, origin, destination, onStation }) {
  const isOrigin = name === origin;
  const isDest   = name === destination;
  return (
    <button onClick={() => onStation(name)}
      className={`py-2 px-1 text-xs rounded-lg font-semibold border transition-all truncate ${
        isOrigin ? 'bg-blue-500 text-white border-blue-500' :
        isDest   ? 'bg-orange-400 text-white border-orange-400' :
        'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}>
      {name}
    </button>
  );
}

function ActionButtons({ origin, destination, onReset, onSave }) {
  return (
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
  );
}

function SelectionBar({ origin, destination }) {
  return (
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
  );
}

// SRT: 주요역 + 전체역 두 블럭
function SrtPicker({ origin, destination, onStation, onSave, onReset }) {
  return (
    <div className="space-y-3">
      <SelectionBar origin={origin} destination={destination} />
      <div>
        <p className="text-[11px] font-bold text-gray-400 mb-1.5">주요 역</p>
        <div className="grid grid-cols-3 gap-1.5">
          {SRT_MAIN.map(n => <StationBtn key={n} name={n} origin={origin} destination={destination} onStation={onStation} />)}
        </div>
      </div>
      <div>
        <p className="text-[11px] font-bold text-gray-400 mb-1.5">전체 역</p>
        <div className="grid grid-cols-3 gap-1.5">
          {SRT_ALL.map(n => <StationBtn key={n} name={n} origin={origin} destination={destination} onStation={onStation} />)}
        </div>
      </div>
      <ActionButtons origin={origin} destination={destination} onReset={onReset} onSave={onSave} />
    </div>
  );
}

// KTX: 가나다 인덱스 + 필터된 역 목록
function KtxPicker({ origin, destination, onStation, onSave, onReset }) {
  const [activeIdx, setActiveIdx] = useState('ㄱ');
  const sectionRefs = useRef({});

  const filtered = KTX_ALL.filter(n => getChosung(n) === activeIdx);

  return (
    <div className="space-y-3">
      <SelectionBar origin={origin} destination={destination} />

      {/* 가나다 인덱스 탭 */}
      <div className="flex flex-wrap gap-1">
        {CHOSUNG.map(cho => {
          const hasStations = KTX_ALL.some(n => getChosung(n) === cho);
          return (
            <button
              key={cho}
              onClick={() => setActiveIdx(cho)}
              disabled={!hasStations}
              className={`w-8 h-8 text-xs font-bold rounded-lg border transition-all ${
                activeIdx === cho ? 'bg-blue-600 text-white border-blue-600' :
                hasStations ? 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50' :
                'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'}`}>
              {cho}
            </button>
          );
        })}
      </div>

      {/* 역 목록 */}
      <div className="grid grid-cols-3 gap-1.5 min-h-[80px]">
        {filtered.length > 0
          ? filtered.map(n => <StationBtn key={n} name={n} origin={origin} destination={destination} onStation={onStation} />)
          : <p className="col-span-3 text-center text-xs text-gray-400 py-4">{activeIdx} — 해당하는 역이 없어요</p>
        }
      </div>

      <ActionButtons origin={origin} destination={destination} onReset={onReset} onSave={onSave} />
    </div>
  );
}

// 버스: 단일 그리드
function BusPicker({ origin, destination, onStation, onSave, onReset }) {
  return (
    <div className="space-y-3">
      <SelectionBar origin={origin} destination={destination} />
      <div className="grid grid-cols-3 gap-1.5">
        {BUS_CITIES.map(n => <StationBtn key={n} name={n} origin={origin} destination={destination} onStation={onStation} />)}
      </div>
      <ActionButtons origin={origin} destination={destination} onReset={onReset} onSave={onSave} />
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

  const props = { origin, destination, onStation: handleStation, onSave: handleSave, onReset: reset };

  if (vendorType === 'srt') return <SrtPicker {...props} />;
  if (vendorType === 'ktx') return <KtxPicker {...props} />;
  return <BusPicker {...props} />;
}
