import { fmtFee, fmtMoney, getDday, calculateTimeline, getNextTierInfo, getCurrentTier } from '../utils/fees';
import { VENDORS } from '../constants/vendors';

export default function ReservationCard({ res, now, editingId, onEdit, onDelete, onStatusChange, onToggleExpand, onToggleAlarm }) {
  const vendor   = VENDORS.find(v => v.id === res.vendorType) ?? VENDORS[0];
  const timeline = calculateTimeline(res.date, res.time, vendor.rules);
  const isCanceled = res.status === '취소함' || res.status === '놓침';
  const isPast     = res.status === '이용완료' || isCanceled;
  const isScheduled = res.status === '예정';
  const isBeingEdited = editingId === res.id;

  const depDT    = new Date(`${res.date}T${res.time}`);
  let arrDT      = res.arrivalTime ? new Date(`${res.date}T${res.arrivalTime}`) : null;
  // 도착이 출발보다 이르면 다음날로 처리 (예: 23:30 출발 → 01:00 도착)
  if (arrDT && arrDT <= depDT) arrDT = new Date(arrDT.getTime() + 86400000);
  const isInNoShowWindow = isScheduled && now > depDT && arrDT && now < arrDT;

  const dday    = isScheduled ? getDday(res.date, res.time, now) : null;
  const nextTier = isScheduled ? getNextTierInfo(timeline, now) : null;
  const curTier  = isScheduled ? getCurrentTier(timeline, now) : null;
  const curFeeDisplay = curTier ? fmtFee(curTier.actualFee, res.price) : null;

  const hasAlarm = Object.keys(res.alarms ?? {}).length > 0;

  let statusColor = 'bg-blue-100 text-blue-800';
  if (res.status === '이용완료') statusColor = 'bg-green-100 text-green-800';
  if (res.status === '취소함')   statusColor = 'bg-gray-200 text-gray-700';
  if (res.status === '놓침')     statusColor = 'bg-red-100 text-red-800';

  return (
    <div className={`bg-white rounded-xl shadow-sm overflow-hidden border transition-all ${isCanceled ? 'opacity-75' : ''} ${isBeingEdited ? 'border-amber-400 ring-2 ring-amber-300' : 'border-gray-200'}`}>

      <div className="p-4 pb-3">
        {/* 1행: 예매처 + 상태/버튼 */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-gray-800">{res.vendorName}</span>
            {res.title && <span className="text-xs text-gray-400 font-medium">{res.title}</span>}
          </div>
          <div className="flex gap-1.5 items-center shrink-0 ml-2">
            <select value={res.status} onChange={e => onStatusChange(res.id, e.target.value)}
              className={`text-xs font-bold px-2 py-1 rounded-md border-0 ring-1 ring-inset ring-gray-300 ${statusColor}`}>
              <option value="예정">예정</option>
              <option value="이용완료">이용완료</option>
              <option value="취소함">취소함</option>
              <option value="놓침">놓침(노쇼)</option>
            </select>
            {isScheduled && (
              <button onClick={() => onToggleAlarm(res.id)}
                title={hasAlarm ? '알림 해제' : '알림 설정'}
                className={`text-lg transition-all ${hasAlarm ? 'text-blue-500' : 'text-gray-300 hover:text-blue-400'}`}>
                {hasAlarm ? '🔔' : '🔕'}
              </button>
            )}
            {!isCanceled && (
              <button onClick={() => onEdit(res)} className="text-gray-400 hover:text-amber-500">✏️</button>
            )}
            <button onClick={() => onDelete(res.id)} className="text-gray-400 hover:text-red-500">🗑️</button>
          </div>
        </div>

        {/* 2행: 출발일시 + D-day */}
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-extrabold text-gray-900 tracking-tight">
              {res.date} <span className="text-blue-600 text-xl">{res.time}</span>
            </div>
            <div className="text-gray-500 text-sm mt-0.5">
              {res.origin} → {res.destination}
              {res.price > 0 && <span className="ml-2 text-blue-500 font-semibold">{fmtMoney(res.price)}</span>}
            </div>
          </div>
          {dday && (
            <span className={`shrink-0 ml-3 text-sm font-extrabold px-3 py-1 rounded-full ${
              dday === 'D-day' ? 'bg-red-100 text-red-700' :
              dday.includes('분') || dday.includes('시간') ? 'bg-orange-100 text-orange-700' :
              'bg-blue-100 text-blue-700'}`}>
              {dday}
            </span>
          )}
        </div>

        {/* 3행: 지금 취소 시 수수료 (크게) */}
        {isScheduled && (
          <div className={`mt-3 px-4 py-3 rounded-xl flex items-center justify-between ${
            curFeeDisplay
              ? curFeeDisplay.isFree ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              : 'bg-green-50 border border-green-200'
          }`}>
            <span className="text-xs font-semibold text-gray-500">지금 취소하면</span>
            <span className={`text-xl font-extrabold ${curFeeDisplay ? curFeeDisplay.isFree ? 'text-green-600' : 'text-red-600' : 'text-green-600'}`}>
              {curFeeDisplay ? curFeeDisplay.main : '무료'}
              {curFeeDisplay?.sub && <span className="text-sm font-normal ml-1 text-gray-400">({curFeeDisplay.sub})</span>}
            </span>
          </div>
        )}

        {/* 노쇼 환불 안내 배너 */}
        {isInNoShowWindow && (
          <div className="mt-3 text-xs font-semibold px-3 py-2 rounded-lg bg-purple-50 text-purple-800 border border-purple-200">
            🚉 출발 후 도착({res.arrivalTime}) 전 — <span className="font-extrabold">창구 방문 시 70% 환불 가능</span>
          </div>
        )}

        {/* 수수료 변경 배너 */}
        {nextTier && (() => {
          const curFmt  = fmtFee(nextTier.curActualFee,  res.price);
          const nextFmt = fmtFee(nextTier.nextActualFee, res.price);
          return (
            <div className={`mt-3 text-xs font-semibold px-3 py-2 rounded-lg ${
              nextTier.urgency ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
              <span className={`font-extrabold ${curFmt.isFree ? 'text-green-700' : 'text-red-600'}`}>지금 취소 시 {curFmt.main}</span>
              {' · '}
              <span className="font-extrabold">{nextTier.timeStr} 후</span>{' '}
              <span className="text-red-700 font-extrabold">{nextFmt.main}</span>으로 변경
            </div>
          );
        })()}
      </div>

      {/* 취소/노쇼 완료 정보 */}
      {isCanceled && res.cancelInfo && (
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-100">
          <div className="text-xs text-gray-500 mb-1">
            {res.status === '놓침' ? '🚫 노쇼 처리' : '✅ 취소 완료'}{' '}
            ({new Date(res.cancelInfo.cancelTime).toLocaleString('ko-KR', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })})
          </div>
          <div className="flex items-baseline gap-2 flex-wrap">
            {(() => {
              const fd = fmtFee(res.cancelInfo.appliedFee, res.price);
              return (
                <>
                  <span className={`text-xl font-extrabold ${fd.isFree ? 'text-green-600' : 'text-red-600'}`}>{fd.main}</span>
                  {fd.sub && <span className="text-sm text-gray-500">({fd.sub})</span>}
                  <span className="text-xs text-gray-400">— {res.cancelInfo.appliedLabel}</span>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* 지금 취소하기 */}
      {isScheduled && (
        <button onClick={() => onStatusChange(res.id, '취소함')}
          className="w-full py-2.5 bg-white border-t border-red-100 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors">
          지금 취소하기
        </button>
      )}

      {/* 구간별 수수료 토글 */}
      {!isCanceled && (
        <button onClick={() => onToggleExpand(res.id)}
          className="w-full flex items-center justify-center gap-1 py-2.5 bg-blue-50/50 border-t border-blue-100 text-sm font-bold text-blue-700 hover:bg-blue-50 transition-colors">
          구간별 취소 수수료 {res.isExpanded ? '▴' : '▾'}
        </button>
      )}

      {/* 타임라인 */}
      {res.isExpanded && !isCanceled && (
        <div className="p-4 bg-gray-50/80 border-t border-gray-100">
          <div className="relative border-l-2 border-blue-200 ml-3 space-y-5">
            {timeline.map((tier, index) => {
              const isTimePast = tier.untilTime < now;
              const feeFmt = fmtFee(tier.actualFee, res.price);
              return (
                <div key={index} className="relative pl-6">
                  <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${isTimePast ? 'bg-gray-300' : 'bg-blue-500'}`} />
                  <div className={isTimePast ? 'opacity-40' : ''}>
                    <div className="text-xs text-gray-500 font-medium mb-0.5">{tier.formattedUntil}까지</div>
                    <div className="flex items-baseline gap-1.5 flex-wrap mb-2">
                      <span className="text-xs text-gray-400">취소 수수료</span>
                      <span className={`text-lg font-extrabold ${feeFmt.isFree ? 'text-green-600' : 'text-red-600'}`}>{feeFmt.main}</span>
                      {feeFmt.sub && <span className="text-xs text-gray-400">({feeFmt.sub})</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
