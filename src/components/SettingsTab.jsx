import { useState } from 'react';
import { ALARM_PRESETS, VENDORS } from '../constants/vendors';
import StationMap from './StationMap';

export default function SettingsTab({ customAlarmPresets, setCustomAlarmPresets, savedRoutes, setSavedRoutes, showToast }) {
  const [newPresetInput, setNewPresetInput] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState(() => localStorage.getItem('geminiApiKey') || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [mapVendor, setMapVendor] = useState('srt');

  const handleSaveApiKey = () => {
    const trimmed = apiKeyInput.trim();
    localStorage.setItem('geminiApiKey', trimmed);
    showToast(trimmed ? 'API 키가 저장되었습니다.' : 'API 키가 삭제되었습니다.');
  };

  const handleAdd = () => {
    const m = parseInt(newPresetInput, 10);
    if (!m || m < 1) { showToast('1분 이상 입력해 주세요.'); return; }
    if (customAlarmPresets.includes(m) || ALARM_PRESETS.some(p => p.minutes === m)) {
      showToast('이미 있는 프리셋입니다.'); return;
    }
    setCustomAlarmPresets(p => [...p, m].sort((a, b) => a - b));
    setNewPresetInput('');
    showToast(`${m}분 전 프리셋이 추가되었습니다.`);
  };

  const handleSelectRoute = (origin, destination) => {
    const vendor = VENDORS.find(v => v.id === mapVendor);
    const label = `${origin} → ${destination}`;
    if (savedRoutes.find(r => r.vendorType === mapVendor && r.origin === origin && r.destination === destination)) {
      showToast('이미 저장된 노선입니다.'); return;
    }
    setSavedRoutes(p => [{ id: `route_${Date.now()}`, vendorType: mapVendor, vendorName: vendor.name, origin, destination, label }, ...p]);
    showToast(`⭐ '${label}' 노선이 저장됐습니다.`);
  };

  return (
    <section className="space-y-4 mt-4">

      {/* 즐겨찾기 노선 관리 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h3 className="text-base font-bold text-gray-800 mb-1">즐겨찾기 노선 관리</h3>
        <p className="text-xs text-gray-400 mb-4">지도에서 출발역 → 도착역을 순서대로 탭하면 즐겨찾기에 추가됩니다.</p>

        {/* 교통수단 탭 */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
          {[
            { id: 'srt', label: '🚄 SRT' },
            { id: 'ktx', label: '🚆 KTX' },
            { id: 'bus', label: '🚌 버스' },
          ].map(v => (
            <button key={v.id} onClick={() => setMapVendor(v.id)}
              className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${mapVendor === v.id ? 'bg-white text-blue-700 shadow' : 'text-gray-500'}`}>
              {v.label}
            </button>
          ))}
        </div>

        {/* 노선도 */}
        <StationMap vendorType={mapVendor} onSelect={handleSelectRoute} />

        {/* 저장된 즐겨찾기 */}
        {savedRoutes.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-500 mb-2">저장된 즐겨찾기</p>
            <div className="flex flex-wrap gap-2">
              {savedRoutes.map(route => (
                <div key={route.id} className="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded-full px-3 py-1.5">
                  <span className="text-xs text-blue-400 font-semibold mr-0.5">{route.vendorName}</span>
                  <span className="text-xs font-bold text-blue-800">{route.label}</span>
                  <button onClick={() => setSavedRoutes(p => p.filter(r => r.id !== route.id))}
                    className="text-gray-300 hover:text-red-400 text-xs ml-1">✕</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Gemini API 키 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h3 className="text-base font-bold text-gray-800 mb-1">Gemini API 키</h3>
        <p className="text-xs text-gray-400 mb-4">
          승차권 이미지 자동 인식에 사용됩니다.{' '}
          <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="text-blue-500 underline">aistudio.google.com</a>
          {' '}에서 무료로 발급받을 수 있어요.
        </p>
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <input
              type={showApiKey ? 'text' : 'password'}
              placeholder="API 키를 입력하세요"
              value={apiKeyInput}
              onChange={e => setApiKeyInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSaveApiKey()}
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 pr-10"
            />
            <button onClick={() => setShowApiKey(v => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
              {showApiKey ? '숨기기' : '보기'}
            </button>
          </div>
          <button onClick={handleSaveApiKey}
            className="shrink-0 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 text-sm">
            저장
          </button>
        </div>
        {localStorage.getItem('geminiApiKey') && (
          <p className="text-xs text-green-600 mt-2 font-semibold">✓ API 키가 저장되어 있습니다.</p>
        )}
      </div>

      {/* 알림 프리셋 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h3 className="text-base font-bold text-gray-800 mb-1">알림 프리셋 관리</h3>
        <p className="text-xs text-gray-400 mb-4">수수료 구간 변경 전 알림을 받을 시간을 직접 추가할 수 있습니다.</p>
        <div className="flex gap-2 flex-wrap mb-4">
          {ALARM_PRESETS.map(p => (
            <span key={p.minutes} className="text-xs px-3 py-1.5 bg-gray-100 rounded-full text-gray-500 font-semibold">
              {p.label} (기본)
            </span>
          ))}
          {customAlarmPresets.map(m => (
            <div key={m} className="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded-full px-3 py-1">
              <span className="text-xs font-semibold text-blue-700">{m < 60 ? `${m}분 전` : `${m / 60}시간 전`}</span>
              <button onClick={() => setCustomAlarmPresets(p => p.filter(x => x !== m))}
                className="text-gray-300 hover:text-red-400 text-xs ml-1">✕</button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <input
            type="number" min="1" placeholder="분 단위 입력 (예: 90)"
            value={newPresetInput}
            onChange={e => setNewPresetInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            className="flex-1 p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-400 shrink-0">분 전</span>
          <button onClick={handleAdd}
            className="shrink-0 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 text-sm">
            추가
          </button>
        </div>
      </div>
    </section>
  );
}
