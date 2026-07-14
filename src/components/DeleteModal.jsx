export default function DeleteModal({ target, onConfirm, onClose }) {
  if (!target) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full overflow-hidden">
        <div className="p-5 border-b border-gray-100 text-center">
          <div className="text-4xl mb-3">🗑️</div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">예매 내역을 삭제할까요?</h3>
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-700">{target.vendorName}</span> {target.date} {target.time}<br />
            <span className="text-gray-400">{target.origin} → {target.destination}</span>
          </p>
          <p className="text-xs text-red-500 mt-2 font-medium">삭제 후 복구할 수 없습니다.</p>
        </div>
        <div className="flex p-3 gap-2 bg-gray-50">
          <button onClick={onClose} className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50">취소</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600">삭제</button>
        </div>
      </div>
    </div>
  );
}
