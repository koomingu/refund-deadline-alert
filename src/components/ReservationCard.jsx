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
  if (arrDT && arrDT <= depDT) arrDT = new Date(arrDT.getTime() + 86400000);
  const isInNoShowWindow = isScheduled && now > depDT && arrDT && now < arrDT;

  const dday    = isScheduled ? getDday(res.date, res.time, now) : null;
  const nextTier = isScheduled ? getNextTierInfo(timeline, now) : null;
  const curTier  = isScheduled ? getCurrentTier(timeline, now) : null;
  const curFeeDisplay = curTier ? fmtFee(curTier.actualFee, res.price) : null;

  const hasAlarm = Object.keys(res.alarms ?? {}).length > 0;

  const statusColor = {
    '예정':    'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300',
    '이용완료': 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300',
    '취소함':  'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300',
    '놓침':    'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300',
  }[res.status] ?? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300';

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm overflow-hidden border transition-all ${isCanceled ? 'opacity-75' : ''} ${isBeingEdited ? 'border-amber-400 ring-2 ring-amber-300' : 'border-gray-200 dark:border-slate-700'}`}>

      <div className="p-4 pb-3">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-gray-800 dark:text-slate-100">{res.vendorName}</span>
            {res.title && <span className="text-xs text-gray-400 dark:text-slate-500 font-medium">{res.title}</span>}
          </div>
          <div className="flex gap-1.5 items-center shrink-0 ml-2">
            <select value={res.status} onChange={e => onStatusChange(res.id, e.target.value)}
              className={`text-xs font-bold px-2 py-1 rounded-md border-0 ring-1 ring-inset ring-gray-300 dark:ring-slate-600 ${statusColor}`}>
              <option value="예정">예정</option>
              <option value="이용완료">이용완료</option>
              <option value="취소함">취소함</option>
              <option value="놓침">놓침(노쇼)</option>
            </select>
            {isScheduled && (
              <button onClick={() => onToggleAlarm(res.id)}
                title={hasAlarm ? '알림 해제' : '알림 설정'}
                className={`text-lg transition-all ${hasAlarm ? 'text-blue-500' : 'text-gray-300 dark:text-slate-600 hover:text-blue-400'}`}>
                {hasAlarm ? '🔔' : '🔕'}
              </button>
            )}
            {!isCanceled && (
              <button onClick={() => onEdit(res)} className="text-gray-400 dark:text-slate-500 hover:text-amber-500">✏️</button>
            )}
            <button onClick={() => onDelete(res.id)} className="text-gray-400 dark:text-slate-500 hover:text-red-500">🗑️</button>
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="text-xl font-extrabold text-gray-900 dark:text-slate-100 tracking-tight">
              {res.origin} <span className="text-gray-400 dark:text-slate-500 font-normal text-base">→</span> {res.destination}
            </div>
            <div className="text-2xl font-extrabold text-gray-900 dark:text-slate-100 tracking-tight mt-0.5">
              {res.date} <span className="text-blue-600 dark:text-blue-400 text-xl">{res.time}</span>
            </div>
            {res.price > 0 && (
              <div className="text-gray-500 dark:text-slate-400 text-sm mt-0.5">{fmtMoney(res.price)}</div>
            )}
          </div>
          {dday && (
            <span className={`shrink-0 ml-3 text-sm font-extrabold px-3 py-1 rounded-full ${
              dday === 'D-day' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' :
              dday.includes('분') || dday.includes('시간') ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300' :
              'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'}`}>
              {dday}
            </span>
          )}
        </div>

        {isScheduled && curFeeDisplay && !nextTier && (
          <div className={`mt-3 px-4 py-3 rounded-xl flex items-center justify-between ${
            curFeeDisplay.isFree
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">지금 취소하면</span>
            <span className={`text-xl font-extrabold ${curFeeDisplay.isFree ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {curFeeDisplay.main}
              {curFeeDisplay.sub && <span className="text-sm font-normal ml-1 text-gray-400 dark:text-slate-500">({curFeeDisplay.sub})</span>}
            </span>
          </div>
        )}

        {nextTier && (() => {
          const curFmt  = fmtFee(nextTier.curActualFee,  res.price);
          const nextFmt = fmtFee(nextTier.nextActualFee, res.price);
          return (
            <div className="mt-3 space-y-1.5">
              <div className={`px-4 py-2.5 rounded-xl flex items-center justify-between ${
                curFmt.isFree
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}>
                <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">지금 취소하면</span>
                <span className={`text-xl font-extrabold ${curFmt.isFree ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {curFmt.main}
                  {curFmt.sub && <span className="text-sm font-normal ml-1 text-gray-400 dark:text-slate-500">({curFmt.sub})</span>}
                </span>
              </div>
              <div className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between ${
                nextTier.urgency
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                  : 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
              }`}>
                <span>{nextTier.timeStr} 후 변경</span>
                <span className="font-extrabold">{nextFmt.main}</span>
              </div>
            </div>
          );
        })()}

        {isInNoShowWindow && (
          <button onClick={() => onStatusChange(res.id, '놓침')}
            className="mt-3 w-full text-xs font-bold py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
            🚫 노쇼(미탑승) 처리하기
          </button>
        )}
      </div>

      {isCanceled && res.cancelInfo && (
        <div className="bg-gray-50 dark:bg-slate-800 px-4 py-3 border-t border-gray-100 dark:border-slate-700">
          <div className="text-xs text-gray-500 dark:text-slate-400 mb-1">
            {res.status === '놓침' ? '🚫 노쇼 처리' : '✅ 취소 완료'}{' '}
            ({new Date(res.cancelInfo.cancelTime).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })})
          </div>
          <div className="flex items-baseline gap-2 flex-wrap">
            {(() => {
              const fd = fmtFee(res.cancelInfo.appliedFee, res.price);
              return (
                <>
                  <span className={`text-xl font-extrabold ${fd.isFree ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{fd.main}</span>
                  {fd.sub && <span className="text-sm text-gray-500 dark:text-slate-400">({fd.sub})</span>}
                  <span className="text-xs text-gray-400 dark:text-slate-500">— {res.cancelInfo.appliedLabel}</span>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {isScheduled && (
        <button onClick={() => onStatusChange(res.id, '취소함')}
          className="w-full py-2.5 bg-white dark:bg-slate-900 border-t border-red-100 dark:border-red-900/40 text-sm font-bold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
          지금 취소하기
        </button>
      )}

      {!isCanceled && (
        <button onClick={() => onToggleExpand(res.id)}
          className="w-full flex items-center justify-center gap-1 py-2.5 bg-blue-50/50 dark:bg-blue-900/10 border-t border-blue-100 dark:border-blue-900/40 text-sm font-bold text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
          구간별 취소 수수료 {res.isExpanded ? '▴' : '▾'}
        </button>
      )}

      {res.isExpanded && !isCanceled && (
        <div className="p-4 bg-gray-50/80 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-700">
          <div className="relative border-l-2 border-blue-200 dark:border-blue-800 ml-3 space-y-5">
            {timeline.map((tier, index) => {
              const isTimePast = tier.untilTime && tier.untilTime < now;
              const feeFmt = fmtFee(tier.actualFee, res.price);
              return (
                <div key={index} className="relative pl-6">
                  <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 shadow-sm ${
                    isTimePast ? 'bg-gray-300 dark:bg-slate-600' : feeFmt.isFree ? 'bg-green-400' : 'bg-red-400'
                  }`} />
                  <div className={isTimePast ? 'opacity-40' : ''}>
                    <div className="text-xs text-gray-400 dark:text-slate-500 font-medium mb-0.5">{tier.triggerTime.toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}부터</div>
                    <div className="flex items-baseline gap-1.5">
                      <span className={`text-lg font-extrabold ${feeFmt.isFree ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{feeFmt.main}</span>
                      {feeFmt.sub && <span className="text-xs text-gray-400 dark:text-slate-500">({feeFmt.sub})</span>}
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
