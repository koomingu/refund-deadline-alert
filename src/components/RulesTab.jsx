import { VENDORS } from '../constants/vendors';

export default function RulesTab() {
  return (
    <section className="space-y-4 mt-4">
      <div className="bg-blue-50 text-blue-800 p-4 rounded-xl border border-blue-100">
        <p className="text-sm leading-relaxed font-medium">
          일반승차권 기준입니다. 명절·단체 승차권은 별도 규정이 적용됩니다. 출발 후 취소는 역 창구에서만 가능합니다.
        </p>
      </div>
      {VENDORS.map(vendor => (
        <div key={vendor.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="font-bold text-gray-900">{vendor.id === 'bus' ? '🚌' : '🚆'} {vendor.name} 취소 수수료</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-700 bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">구분</th>
                  <th className="px-4 py-2.5 font-semibold">평일 (월~목)</th>
                  <th className="px-4 py-2.5 font-semibold">주말·공휴일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[...vendor.rules].sort((a, b) => b.hoursBefore - a.hoursBefore).map((rule, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900 bg-gray-50/50">{rule.label}</td>
                    <td className={`px-4 py-3 font-bold ${rule.fee === '무료' || rule.fee === '0%' ? 'text-blue-600' : 'text-gray-700'}`}>{rule.fee}</td>
                    <td className={`px-4 py-3 font-bold ${!rule.weekendFee || rule.weekendFee === '무료' || rule.weekendFee === '0%' ? 'text-blue-600' : 'text-red-500'}`}>{rule.weekendFee || rule.fee}</td>
                  </tr>
                ))}
                {vendor.postRules && (
                  <tr>
                    <td colSpan={3} className="px-4 py-1.5 text-[11px] font-bold text-red-600 bg-red-50 border-t border-red-100">출발 후 (역 창구 환불)</td>
                  </tr>
                )}
                {vendor.postRules?.map((rule, i) => (
                  <tr key={`post-${i}`} className="bg-red-50/30">
                    <td className="px-4 py-2.5 font-medium text-gray-700 text-xs">
                      {rule.label}
                      {rule.note && <div className="text-[10px] text-gray-400">{rule.note}</div>}
                    </td>
                    <td className="px-4 py-2.5 font-bold text-red-500 text-xs">{rule.fee}</td>
                    <td className="px-4 py-2.5 font-bold text-red-500 text-xs">{rule.weekendFee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-[11px] text-gray-500">
            {vendor.id === 'bus'
              ? '* 수수료 100원 미만 절사 · 명절(설·추석 전일·당일·다음날) 별도 요율'
              : '* 최저위약금 400원 · 주말: 금~일, 공휴일, 명절 포함'}
          </div>
        </div>
      ))}
    </section>
  );
}
