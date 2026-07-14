import { useState, useEffect } from 'react';
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

// KTX 전체 역 (가나다순, KORAIL 앱 기준)
const KTX_ALL = [
  // ㄱ
  '가남', '가평', '각계', '감곡장호원', '강경', '강구', '강릉', '강촌', '개포',
  '경산', '경주', '계룡', '고래불', '고한', '곡성', '공주', '광명', '광양',
  '광주', '광주송정', '광천', '구례구', '구미', '구포', '군북', '군산', '군위',
  '극락강', '근덕', '기성', '기장', '김제', '김천', '김천구미',
  // ㄴ
  '나전', '나주', '남성현', '남원', '남창', '남춘천', '논산', '능주',
  // ㄷ
  '다시', '단양', '대곡', '대구', '대야', '대전', '대천', '덕소', '도계',
  '도고온천', '도라산', '동대구', '동백산', '동탄', '동해', '둔내', '득량',
  // ㄹ
  '량원',
  // ㅁ
  '마산', '마석', '만종', '매곡', '매화', '명봉', '망우', '목포', '몽탄',
  '무안', '묵호', '문경', '문산', '물금', '민둥산', '밀양',
  // ㅂ
  '반성', '백양리', '백양사', '벌교', '별어곡', '보성', '봉양', '봉화', '부강',
  '부발', '부산', '부전', '북영천', '북울산', '북천', '분천', '비동',
  // ㅅ
  '사릉', '사북', '사상', '살미', '삼랑진', '삼례', '삼산', '삼척', '삼척해변',
  '삼탄', '삽교', '상동', '상봉', '상주', '서경주', '서광주', '서대구', '서대전',
  '서울', '서원주', '서정리', '서천', '서화성', '석불', '석포', '선평', '성환',
  '센텀', '송추', '수서', '수안보온천', '수원', '순천', '승부', '신기', '신동',
  '신례원', '신창', '신탄진', '신태인', '신해운대', '심천', '쌍룡',
  // ㅇ
  '아산', '아우라지', '아화', '안강', '안동', '안양', '안중', '양성온천', '약목',
  '양동', '양원', '양평', '여수엑스포', '여천', '연산', '연풍', '영덕', '영동',
  '영등포', '영월', '영주', '영천', '영해', '예당', '예미', '예산', '예천',
  '오근장', '오산', '오송', '오수', '옥산', '옥수', '옥원', '옥천', '온양온천',
  '완사', '왕십리', '왜관', '용공', '용문', '용산', '운천', '울산(통도사)', '울진',
  '웅천', '원동', '원릉', '원주', '월포', '음성', '의성', '의정부', '이양',
  '이원', '익산', '인주', '인천공항T1', '인천공항T2', '일로', '일신', '일영',
  '임기', '임성리', '임실', '임원', '임진강',
  // ㅈ
  '장사', '장성', '장항', '장흥', '전의', '전주', '점촌', '정동진', '정선',
  '정읍', '제천', '조성', '조치원', '주덕', '죽변', '중리', '증평', '지탄',
  '지평', '진례', '진부', '진상', '진영', '진주', '진해',
  // ㅊ
  '창원', '창원중앙', '천안', '천안아산', '철암', '청도', '청량리', '청리', '청소',
  '청주', '청주공항', '청평', '추암', '추풍령', '춘양', '춘천', '충주',
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

// 단일 역 선택 모달 (AddForm에서 출발지/도착지 선택용)
function SingleStationGrid({ vendorType, onSelect }) {
  const [activeIdx, setActiveIdx] = useState('ㄱ');

  if (vendorType === 'srt') {
    return (
      <div className="space-y-4">
        <div>
          <p className="text-[11px] font-bold text-gray-400 mb-1.5">주요 역</p>
          <div className="grid grid-cols-4 gap-1.5">
            {SRT_MAIN.map(n => (
              <button key={n} onClick={() => onSelect(n)}
                className="py-2 px-1 text-xs rounded-lg font-semibold border bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 transition-all">
                {n}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[11px] font-bold text-gray-400 mb-1.5">전체 역</p>
          <div className="grid grid-cols-4 gap-1.5">
            {SRT_ALL.map(n => (
              <button key={n} onClick={() => onSelect(n)}
                className="py-2 px-1 text-xs rounded-lg font-semibold border bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 transition-all">
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (vendorType === 'ktx') {
    const filtered = KTX_ALL.filter(n => getChosung(n) === activeIdx);
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1">
          {CHOSUNG.map(cho => {
            const has = KTX_ALL.some(n => getChosung(n) === cho);
            return (
              <button key={cho} onClick={() => setActiveIdx(cho)} disabled={!has}
                className={`w-8 h-8 text-xs font-bold rounded-lg border transition-all ${
                  activeIdx === cho ? 'bg-blue-600 text-white border-blue-600' :
                  has ? 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50' :
                  'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'}`}>
                {cho}
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {filtered.map(n => (
            <button key={n} onClick={() => onSelect(n)}
              className="py-2 px-1 text-xs rounded-lg font-semibold border bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 transition-all truncate">
              {n}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 버스
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {BUS_CITIES.map(n => (
        <button key={n} onClick={() => onSelect(n)}
          className="py-2 px-1 text-xs rounded-lg font-semibold border bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 transition-all">
          {n}
        </button>
      ))}
    </div>
  );
}

export function StationSelectModal({ vendorType, field, onSelect, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const label = field === 'origin' ? '출발역 선택' : '도착역 선택';
  const vendorLabel = vendorType === 'srt' ? 'SRT' : vendorType === 'ktx' ? 'KTX' : '버스';

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/40" onClick={onClose}>
      <div className="mt-auto bg-white rounded-t-2xl max-h-[85vh] flex flex-col"
           onClick={e => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">{label}</h2>
            <p className="text-xs text-gray-400">{vendorLabel}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        {/* 콘텐츠 */}
        <div className="overflow-y-auto p-4">
          <SingleStationGrid vendorType={vendorType} onSelect={(name) => { onSelect(name); onClose(); }} />
        </div>
      </div>
    </div>
  );
}
