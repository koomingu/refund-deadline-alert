import { useRef, useState } from 'react';
import { VENDORS } from '../constants/vendors';
import { StationSelectModal } from './StationMap';
import { estimatePrice } from '../utils/prices';
import { getSchedule } from '../constants/schedules';

const Loader = () => (
  <span className="animate-spin inline-block text-2xl">⟳</span>
);

const inputCls = "w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500";
const labelCls = "block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1";

export default function AddForm({
  editingId,
  vendorType, setVendorType,
  date, setDate,
  time, setTime,
  origin, setOrigin,
  destination, setDestination,
  arrivalTime, setArrivalTime,
  price, setPrice,
  title, setTitle,
  showManualForm, setShowManualForm,
  savedRoutes, onSaveRoute, onDeleteRoute, onApplyRoute,
  isAnalyzing, previewDataList, setPreviewDataList,
  onImageUpload, onApplyPreviewItem, onApplyAllPreviewItems,
  onSubmit, onCancelEdit,
}) {
  const fileInputRef = useRef(null);
  const [stationModal, setStationModal] = useState(null);
  const schedule = getSchedule(vendorType, origin, destination) ?? [];

  return (
    <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
      {editingId && (
        <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-4 py-2.5">
          <span className="text-sm font-bold text-amber-800 dark:text-amber-300">예매 수정 중</span>
          <button onClick={onCancelEdit} className="text-amber-700 dark:text-amber-400 text-xs font-bold">취소</button>
        </div>
      )}

      {!editingId && (
        <div className="p-5">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnalyzing}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl py-5 flex flex-col items-center gap-2 transition-colors shadow-sm">
            {isAnalyzing
              ? <><Loader /><span className="font-bold text-base">분석 중...</span></>
              : <>
                  <span className="text-3xl">📷</span>
                  <span className="font-bold text-base">승차권 캡처로 등록하기</span>
                  <span className="text-blue-200 text-xs">이미지를 업로드하면 예매 정보를 자동으로 채워드려요</span>
                </>
            }
          </button>
          <input type="file" ref={fileInputRef} onChange={onImageUpload} accept="image/*" className="hidden" />
        </div>
      )}

      {previewDataList.length > 0 && (
        <div className="mx-5 mb-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-bold text-indigo-800 dark:text-indigo-300 text-sm">추출된 예매 {previewDataList.length}건</span>
            <div className="flex gap-2">
              <button
                onClick={() => { setPreviewDataList([]); fileInputRef.current?.click(); }}
                className="text-xs text-gray-500 dark:text-slate-400 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-slate-800">
                다시 업로드
              </button>
              <button onClick={() => setPreviewDataList([])} className="text-gray-400 dark:text-slate-500 text-sm px-1">✕</button>
            </div>
          </div>
          {previewDataList.map((item, i) => (
            <div key={i} className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl">
              <div className="grid grid-cols-2 gap-2 text-sm text-indigo-900 dark:text-indigo-200 bg-white dark:bg-slate-800 p-3 rounded-lg mb-3">
                <div><span className="text-indigo-400 dark:text-indigo-500">종류 </span>{(item.vendorType || '미인식').toUpperCase()}</div>
                <div><span className="text-indigo-400 dark:text-indigo-500">날짜 </span>{item.date || '미인식'}</div>
                <div><span className="text-indigo-400 dark:text-indigo-500">시간 </span>{item.time || '미인식'}</div>
                <div><span className="text-indigo-400 dark:text-indigo-500">여정 </span>{item.origin} → {item.destination}</div>
              </div>
              <button onClick={() => onApplyPreviewItem(item)}
                className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-lg hover:bg-indigo-700 text-sm">
                이 예매 등록하기
              </button>
            </div>
          ))}
          {previewDataList.length > 1 && (
            <button onClick={onApplyAllPreviewItems}
              className="w-full bg-blue-700 text-white font-bold py-3 rounded-xl hover:bg-blue-800 text-sm shadow">
              {previewDataList.length}건 모두 등록하기
            </button>
          )}
        </div>
      )}

      {!editingId && (
        <button onClick={() => setShowManualForm(v => !v)}
          className="w-full flex items-center justify-center gap-1.5 py-3 border-t border-gray-200 dark:border-slate-700 text-sm font-semibold text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors bg-gray-50/60 dark:bg-slate-800/40">
          ✏️ 직접 입력하기 {showManualForm ? '▴' : '▾'}
        </button>
      )}

      {showManualForm && (
        <form onSubmit={onSubmit} className="p-5 pt-4 border-t border-gray-100 dark:border-slate-800 space-y-4">
          {/* 1. 교통수단 */}
          <div>
            <label className={labelCls}>교통수단</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id:'ktx', icon:'🚆', label:'KTX' },
                { id:'srt', icon:'🚄', label:'SRT' },
                { id:'bus', icon:'🚌', label:'시외/고속' },
              ].map(t => (
                <button key={t.id} type="button" onClick={() => setVendorType(t.id)}
                  className={`py-2.5 text-sm rounded-lg border flex flex-col items-center gap-1 transition-all ${
                    vendorType === t.id
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300 font-bold ring-1 ring-blue-500'
                      : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                  }`}>
                  <span>{t.icon}</span><span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. 출발일 */}
          <div>
            <label className={labelCls}>출발일</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} />
          </div>

          {/* 3. 출발지 ↔ 도착지 */}
          <div>
            <label className={labelCls}>출발지 → 도착지</label>
            <div className="flex gap-2 items-center">
              <button type="button" onClick={() => setStationModal('origin')}
                className={`flex-1 p-2.5 border rounded-lg text-sm text-left transition-all ${
                  origin
                    ? 'border-blue-400 dark:border-blue-600 text-blue-800 dark:text-blue-300 font-semibold bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-slate-600 text-gray-400 dark:text-slate-500 bg-white dark:bg-slate-800'}`}>
                {origin || '출발역 선택'}
              </button>
              <button
                type="button"
                onClick={() => { const tmp = origin; setOrigin(destination); setDestination(tmp); }}
                title="출발지/도착지 바꾸기"
                className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400 hover:text-blue-600 transition-all text-sm font-bold">
                ⇄
              </button>
              <button type="button" onClick={() => setStationModal('destination')}
                className={`flex-1 p-2.5 border rounded-lg text-sm text-left transition-all ${
                  destination
                    ? 'border-orange-400 dark:border-orange-600 text-orange-800 dark:text-orange-300 font-semibold bg-orange-50 dark:bg-orange-900/20'
                    : 'border-gray-300 dark:border-slate-600 text-gray-400 dark:text-slate-500 bg-white dark:bg-slate-800'}`}>
                {destination || '도착역 선택'}
              </button>
            </div>
            {origin && destination && (
              <button type="button" onClick={onSaveRoute}
                className="mt-2 w-full py-2 text-xs font-semibold text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors">
                ⭐ 이 노선 즐겨찾기에 추가
              </button>
            )}
            {savedRoutes.length > 0 && (
              <div className="mt-2 flex gap-1.5 flex-wrap">
                {savedRoutes.map(route => (
                  <div key={route.id} className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full px-3 py-1">
                    <button type="button" onClick={() => onApplyRoute(route)} className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                      {route.vendorName && <span className="text-blue-400 dark:text-blue-500 mr-1">{route.vendorName}</span>}
                      {route.label}
                    </button>
                    <button type="button" onClick={() => onDeleteRoute(route.id)} className="text-gray-300 dark:text-slate-600 hover:text-red-400 ml-1 text-xs">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. 출발 시각 — 그리드 선택 전용 */}
          <div>
            <label className={labelCls}>
              출발 시각
              <span className="text-gray-400 dark:text-slate-500 font-normal ml-1">
                {vendorType === 'bus' ? '(참고용 운행 간격)' : '(간이 시간표 — 참고용)'}
              </span>
            </label>
            {schedule.length === 0 && (
              <div className="text-xs text-gray-400 dark:text-slate-500 bg-gray-50 dark:bg-slate-800 rounded-lg px-3 py-3 border border-gray-200 dark:border-slate-700 text-center">
                {!origin || !destination ? '출발지와 도착지를 먼저 선택해 주세요.' : '이 노선의 시간표 데이터가 없습니다.'}
              </div>
            )}
            <div className="grid grid-cols-4 gap-1.5 max-h-52 overflow-y-auto pr-0.5">
              {schedule.map((train, i) => {
                const isSelected = time === train.dep;
                return (
                  <button key={i} type="button"
                    onClick={() => { setTime(train.dep); if (train.arr) setArrivalTime(train.arr); else setArrivalTime(''); }}
                    className={`py-2 px-1 rounded-lg border text-center transition-all ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white font-bold shadow-sm'
                        : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    }`}>
                    <div className="text-xs font-bold">{train.dep}</div>
                    {train.arr && <div className="text-[10px] text-current opacity-70">→{train.arr}</div>}
                  </button>
                );
              })}
            </div>
            {time && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1.5 font-semibold">
                선택됨: {time}{arrivalTime ? ` → ${arrivalTime}` : ''}
                <button type="button" onClick={() => { setTime(''); setArrivalTime(''); }}
                  className="ml-2 text-gray-400 dark:text-slate-500 hover:text-red-400 font-normal">✕ 초기화</button>
              </p>
            )}
          </div>

          <div>
            <label className={labelCls}>결제 금액 <span className="text-gray-400 dark:text-slate-500 font-normal">(선택 — 수수료 금액 계산용)</span></label>
            <div className="relative">
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0" className={`${inputCls} pr-7`} />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 text-xs">원</span>
            </div>
          </div>

          <div>
            <label className={labelCls}>메모 <span className="text-gray-400 dark:text-slate-500 font-normal">(선택)</span></label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="예: 친구 생일 여행, 부산 출장" className={inputCls} />
          </div>

          <button type="submit"
            className={`w-full text-white font-bold py-3.5 rounded-lg transition-colors shadow-sm ${
              editingId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'
            }`}>
            {editingId ? '수정 완료' : '예매 등록'}
          </button>
        </form>
      )}

      {stationModal && (
        <StationSelectModal
          vendorType={vendorType}
          field={stationModal}
          onSelect={(name) => {
            const newOrigin      = stationModal === 'origin'      ? name : origin;
            const newDestination = stationModal === 'destination' ? name : destination;
            if (stationModal === 'origin') setOrigin(name);
            else setDestination(name);
            const estimated = estimatePrice(vendorType, newOrigin, newDestination);
            if (estimated) setPrice(String(estimated));
          }}
          onClose={() => setStationModal(null)}
        />
      )}
    </section>
  );
}
