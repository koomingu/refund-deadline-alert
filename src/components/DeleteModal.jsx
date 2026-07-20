export default function DeleteModal({ target, onConfirm, onClose }) {
  if (!target) return null;
  const name = target.domain === 'exam' ? target.examName : target.vendorName;
  const sub  = target.domain === 'exam'
    ? `${target.date} ${target.time} ${target.examLocation || ''}`
    : `${target.date} ${target.time} · ${target.origin} → ${target.destination}`;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-sm w-full overflow-hidden border border-gray-100 dark:border-slate-700">
        <div className="p-5 border-b border-gray-100 dark:border-slate-800 text-center">
          <div className="text-4xl mb-3">🗑️</div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-1">내역을 삭제할까요?</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            <span className="font-semibold text-gray-700 dark:text-slate-300">{name}</span><br />
            <span className="text-gray-400 dark:text-slate-500">{sub}</span>
          </p>
          <p className="text-xs text-red-500 dark:text-red-400 mt-2 font-medium">삭제 후 복구할 수 없습니다.</p>
        </div>
        <div className="flex p-3 gap-2 bg-gray-50 dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700">
          <button onClick={onClose} className="flex-1 py-2.5 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600">취소</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600">삭제</button>
        </div>
      </div>
    </div>
  );
}
