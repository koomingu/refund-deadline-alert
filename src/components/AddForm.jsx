import { useRef, useState } from 'react';
import { VENDORS } from '../constants/vendors';
import { StationSelectModal } from './StationMap';
import { estimatePrice } from '../utils/prices';

const Loader = () => (
  <span className="animate-spin inline-block text-2xl">⟳</span>
);

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
  const [stationModal, setStationModal] = useState(null); // 'origin' | 'destination' | null

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {editingId && (
        <div className="flex items-center justify-between bg-amber-50 border-b border-amber-200 px-4 py-2.5">
          <span className="text-sm font-bold text-amber-800">예매 수정 중</span>
          <button onClick={onCancelEdit} className="text-amber-700 text-xs font-bold">취소</button>
        </div>
      )}

      {/* 캡처로 등록 — 메인 액션 */}
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
          <input
            type="file"
            ref={fileInputRef}
            onChange={onImageUpload}
            accept="image/*"
            className="hidden"
          />
        </div>
      )}

      {/* 캡처 결과 확인 — 여러 건 */}
      {previewDataList.length > 0 && (
        <div className="mx-5 mb-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-bold text-indigo-800 text-sm">
              추출된 예매 {previewDataList.length}건
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => { setPreviewDataList([]); fileInputRef.current?.click(); }}
                className="text-xs text-gray-500 border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50">
                다시 업로드
              </button>
              <button onClick={() => setPreviewDataList([])} className="text-gray-400 text-sm px-1">✕</button>
            </div>
          </div>

          {previewDataList.map((item, i) => (
            <div key={i} className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
              <div className="grid grid-cols-2 gap-2 text-sm text-indigo-900 bg-white p-3 rounded-lg mb-3">
                <div><span className="text-indigo-400">종류 </span>{(item.vendorType || '미인식').toUpperCase()}</div>
                <div><span className="text-indigo-400">날짜 </span>{item.date || '미인식'}</div>
                <div><span className="text-indigo-400">시간 </span>{item.time || '미인식'}</div>
                <div><span className="text-indigo-400">여정 </span>{item.origin} → {item.destination}</div>
              </div>
              <button
                onClick={() => onApplyPreviewItem(item)}
                className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-lg hover:bg-indigo-700 text-sm">
                이 예매 등록하기
              </button>
            </div>
          ))}

          {previewDataList.length > 1 && (
            <button
              onClick={onApplyAllPreviewItems}
              className="w-full bg-blue-700 text-white font-bold py-3 rounded-xl hover:bg-blue-800 text-sm shadow">
              {previewDataList.length}건 모두 등록하기
            </button>
          )}
        </div>
      )}

      {/* 직접 입력 토글 */}
      {!editingId && (
        <button
          onClick={() => setShowManualForm(v => !v)}
          className="w-full flex items-center justify-center gap-1.5 py-3 border-t border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors bg-gray-50/60">
          ✏️ 직접 입력하기 {showManualForm ? '▴' : '▾'}
        </button>
      )}

      {/* 직접 입력 폼 */}
      {showManualForm && (
        <form onSubmit={onSubmit} className="p-5 pt-4 border-t border-gray-100 space-y-4">
          {/* 교통수단 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">교통수단</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id:'ktx', icon:'🚆', label:'KTX' },
                { id:'srt', icon:'🚄', label:'SRT' },
                { id:'bus', icon:'🚌', label:'시외/고속' },
              ].map(t => (
                <button
                  key={t.id} type="button"
                  onClick={() => setVendorType(t.id)}
                  className={`py-2.5 text-sm rounded-lg border flex flex-col items-center gap-1 transition-all ${
                    vendorType === t.id
                      ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold ring-1 ring-blue-500'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}>
                  <span>{t.icon}</span><span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 날짜/시각 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">출발일</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">출발 시각</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                도착 시각 <span className="text-gray-400 font-normal">(선택)</span>
              </label>
              <input type="time" value={arrivalTime} onChange={e => setArrivalTime(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
            </div>
          </div>

          {/* 출발지/도착지 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">출발지 → 도착지</label>
            <div className="flex gap-2 items-center">
              <button type="button" onClick={() => setStationModal('origin')}
                className={`flex-1 p-2.5 border rounded-lg text-sm text-left transition-all ${
                  origin ? 'border-blue-400 text-blue-800 font-semibold bg-blue-50' : 'border-gray-300 text-gray-400'}`}>
                {origin || '출발역 선택'}
              </button>
              <span className="text-gray-400 shrink-0">→</span>
              <button type="button" onClick={() => setStationModal('destination')}
                className={`flex-1 p-2.5 border rounded-lg text-sm text-left transition-all ${
                  destination ? 'border-orange-400 text-orange-800 font-semibold bg-orange-50' : 'border-gray-300 text-gray-400'}`}>
                {destination || '도착역 선택'}
              </button>
            </div>
            {origin && destination && (
              <button type="button" onClick={onSaveRoute}
                className="mt-2 w-full py-2 text-xs font-semibold text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors">
                ⭐ 이 노선 즐겨찾기에 추가
              </button>
            )}
            {savedRoutes.length > 0 && (
              <div className="mt-2 flex gap-1.5 flex-wrap">
                {savedRoutes.map(route => (
                  <div key={route.id} className="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded-full px-3 py-1">
                    <button type="button" onClick={() => onApplyRoute(route)} className="text-xs font-semibold text-blue-700">
                      {route.vendorName && <span className="text-blue-400 mr-1">{route.vendorName}</span>}
                      {route.label}
                    </button>
                    <button type="button" onClick={() => onDeleteRoute(route.id)} className="text-gray-300 hover:text-red-400 ml-1 text-xs">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 결제 금액 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              결제 금액 <span className="text-gray-400 font-normal">(선택 — 수수료 금액 계산용)</span>
            </label>
            <div className="relative">
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0"
                className="w-full p-2.5 pr-7 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">원</span>
            </div>
          </div>

          {/* 메모 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              메모 <span className="text-gray-400 font-normal">(선택)</span>
            </label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="예: 친구 생일 여행, 부산 출장"
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
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
