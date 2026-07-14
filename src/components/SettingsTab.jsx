import { useState } from 'react';
import { ALARM_PRESETS } from '../constants/vendors';

export default function SettingsTab({ customAlarmPresets, setCustomAlarmPresets, showToast }) {
  const [newPresetInput, setNewPresetInput] = useState('');

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

  return (
    <section className="space-y-4 mt-4">
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
              <button
                onClick={() => setCustomAlarmPresets(p => p.filter(x => x !== m))}
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
          <button
            onClick={handleAdd}
            className="shrink-0 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 text-sm">
            추가
          </button>
        </div>
      </div>
    </section>
  );
}
