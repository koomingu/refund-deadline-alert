import { createPortal } from 'react-dom';
import { fmtFee } from '../utils/fees';

const inputCls = "w-full p-2 border border-gray-300 dark:border-slate-600 rounded text-sm outline-none focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100";

export default function CancelModal({ cancelRes, cancelDate, setCancelDate, cancelTime, setCancelTime, cancelPreview, isAlarmHelped, setIsAlarmHelped, onConfirm, onClose }) {
  if (!cancelRes) return null;
  return createPortal(
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-sm w-full overflow-hidden border border-gray-100 dark:border-slate-700">
        <div className="p-5 border-b border-gray-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-1">예매 취소 처리</h3>
          <p className="text-xs text-gray-400 dark:text-slate-500">{cancelRes.vendorName ?? cancelRes.examName} {cancelRes.date} {cancelRes.time}</p>
        </div>
        <div className="p-4 space-y-4">
          {cancelPreview && (() => {
            const { isNoRefund, isPostDep, appliedLabel, appliedFee } = cancelPreview;
            if (isNoRefund) {
              return (
                <div className="rounded-lg p-4 border bg-gray-900 dark:bg-slate-800 border-gray-700 dark:border-slate-600">
                  <div className="text-xs font-bold text-gray-400 mb-1">환불 가능 여부</div>
                  <div className="text-2xl font-extrabold text-white mb-1">환불 불가 🚫</div>
                  <p className="text-xs text-gray-300">{appliedLabel}</p>
                  {cancelRes.price > 0 && (
                    <p className="text-sm font-bold text-red-400 mt-2">
                      결제 금액 {cancelRes.price.toLocaleString('ko-KR')}원 전액 손실
                    </p>
                  )}
                </div>
              );
            }
            const fd = fmtFee(appliedFee, cancelRes.price);
            return (
              <div className={`rounded-lg p-4 border ${fd.isFree ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
                <div className="text-xs font-bold text-gray-500 dark:text-slate-400 mb-1">예상 취소 수수료</div>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className={`text-2xl font-extrabold ${fd.isFree ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{fd.main}</span>
                  {fd.sub && <span className="text-sm text-gray-400 dark:text-slate-500">({fd.sub})</span>}
                  <span className="text-xs text-gray-500 dark:text-slate-400">— {appliedLabel}</span>
                </div>
                {isPostDep && (
                  <p className="text-xs text-purple-700 dark:text-purple-300 mt-2 font-semibold">🚉 출발 후 취소는 역 창구에서만 환불 신청 가능합니다.</p>
                )}
              </div>
            );
          })()}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">취소 날짜</label>
              <input type="date" value={cancelDate} onChange={e => setCancelDate(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">취소 시각</label>
              <input type="time" value={cancelTime} onChange={e => setCancelTime(e.target.value)} className={inputCls} />
            </div>
          </div>
          <label className="flex items-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg cursor-pointer">
            <input type="checkbox" checked={isAlarmHelped} onChange={e => setIsAlarmHelped(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded" />
            <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-300">알림 덕분에 제때 취소했어요</span>
          </label>
        </div>
        <div className="flex bg-gray-50 dark:bg-slate-800 p-3 gap-2 border-t border-gray-100 dark:border-slate-700">
          <button onClick={onClose} className="flex-1 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600">돌아가기</button>
          <button onClick={onConfirm} className="flex-1 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600">취소 완료 기록</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
