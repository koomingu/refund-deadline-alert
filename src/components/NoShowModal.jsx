import { VENDORS } from '../constants/vendors';

export default function NoShowModal({ res, onConfirm, onClose }) {
  if (!res) return null;
  const vendor = VENDORS.find(v => v.id === res.vendorType);
  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-sm w-full overflow-hidden border border-gray-100 dark:border-slate-700">
        <div className="p-5 border-b border-gray-100 dark:border-slate-800 text-center">
          <div className="text-3xl mb-2">🚫</div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-1">노쇼(미탑승) 처리</h3>
          <p className="text-xs text-gray-400 dark:text-slate-500">{res.vendorName} {res.date} {res.time} 출발</p>
        </div>
        <div className="p-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <div className="text-xs font-bold text-red-700 dark:text-red-300 mb-2">노쇼 수수료 안내</div>
            <p className="text-xs text-gray-600 dark:text-slate-400 mb-3">탑승하지 않은 경우 출발 후 취소로 간주됩니다. 통상 최고 수수료가 적용됩니다.</p>
            {vendor?.postRules && (
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-400 dark:text-slate-500">
                    <th className="text-left py-1">시점</th>
                    <th className="text-right py-1">평일</th>
                    <th className="text-right py-1">주말</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-100 dark:divide-red-900/40">
                  {vendor.postRules.map((r, i) => (
                    <tr key={i}>
                      <td className="py-1 text-gray-600 dark:text-slate-400">{r.label}</td>
                      <td className="py-1 text-right text-red-600 dark:text-red-400 font-bold">{r.fee}</td>
                      <td className="py-1 text-right text-red-600 dark:text-red-400 font-bold">{r.weekendFee}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        <div className="flex bg-gray-50 dark:bg-slate-800 p-3 gap-2 border-t border-gray-100 dark:border-slate-700">
          <button onClick={onClose} className="flex-1 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600">돌아가기</button>
          <button onClick={onConfirm} className="flex-1 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600">노쇼로 기록</button>
        </div>
      </div>
    </div>
  );
}
