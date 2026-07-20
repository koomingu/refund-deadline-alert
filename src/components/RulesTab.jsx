import { useState } from 'react';
import { VENDORS } from '../constants/vendors';
import { EXAMS } from '../constants/exams';

function TransportRules() {
  const [activeVendor, setActiveVendor] = useState('ktx');
  const vendor = VENDORS.find(v => v.id === activeVendor) ?? VENDORS[0];

  return (
    <div className="space-y-4">
      <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 p-1">
        {[
          { id: 'ktx', label: '🚆 KTX' },
          { id: 'srt', label: '🚄 SRT' },
          { id: 'bus', label: '🚌 시외/고속' },
        ].map(v => (
          <button key={v.id} onClick={() => setActiveVendor(v.id)}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeVendor === v.id ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}>
            {v.label}
          </button>
        ))}
      </div>

      <div className="bg-blue-50 text-blue-800 p-4 rounded-xl border border-blue-100">
        <p className="text-sm leading-relaxed font-medium">
          일반승차권 기준입니다. 명절·단체 승차권은 별도 규정이 적용됩니다. 출발 후 취소는 역 창구에서만 가능합니다.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
    </div>
  );
}

const ANCHOR_LABEL = {
  examDate:      (r) => `시험일 ${r.hoursBefore >= 24 ? `${r.hoursBefore / 24}일` : `${r.hoursBefore}시간`} 전`,
  regDeadline:   ()  => '접수 마감 후',
  examDayOffset: (r) => r.daysOffset === 0
    ? `시험 당일 ${r.timeOfDay}`
    : `시험 ${Math.abs(r.daysOffset)}일 전 ${r.timeOfDay}`,
};

function ExamRules() {
  const visibleExams = EXAMS.filter(e => !e.isCustom);
  const [activeExam, setActiveExam] = useState(visibleExams[0].id);
  const exam = visibleExams.find(e => e.id === activeExam) ?? visibleExams[0];

  return (
    <div className="space-y-4">
      {/* 시험 종류 선택 */}
      <div className="grid grid-cols-4 gap-2">
        {visibleExams.map(e => (
          <button
            key={e.id}
            onClick={() => setActiveExam(e.id)}
            className={`py-2.5 px-1 text-xs rounded-xl border font-semibold transition-all ${
              activeExam === e.id
                ? 'bg-blue-600 border-blue-600 text-white shadow'
                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}>
            {e.name}
          </button>
        ))}
      </div>

      {/* 주의 안내 */}
      {exam.note && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-xs leading-relaxed">
          ⚠️ {exam.note}
        </div>
      )}

      {/* 규정 테이블 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <span className="text-xs font-bold text-gray-600">취소 수수료 구간</span>
          {exam.requiresRegDeadline && (
            <span className="ml-2 text-xs text-blue-600 font-medium">({exam.regDeadlineLabel} 입력 필요)</span>
          )}
        </div>
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-700 bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-4 py-2.5 font-semibold">기준 시점</th>
              <th className="px-4 py-2.5 font-semibold">구간 설명</th>
              <th className="px-4 py-2.5 font-semibold text-right">수수료</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {/* 무료 구간 */}
            {exam.freeLabel && (
              <tr className="bg-green-50/40">
                <td className="px-4 py-3 text-xs text-gray-400 font-medium">—</td>
                <td className="px-4 py-3 font-medium text-gray-700">{exam.freeLabel}</td>
                <td className="px-4 py-3 text-right font-bold text-green-600">무료</td>
              </tr>
            )}
            {exam.rules.map((rule, i) => {
              const anchorFn = ANCHOR_LABEL[rule.anchorType];
              const anchorStr = anchorFn ? anchorFn(rule) : rule.anchorType;
              const isFree = rule.fee === '무료' || rule.fee === '0%';
              const isImpossible = rule.fee === '불가';
              return (
                <tr key={i} className={`hover:bg-gray-50 ${isImpossible ? 'bg-red-50/30' : ''}`}>
                  <td className="px-4 py-3 text-xs text-gray-400 font-medium whitespace-nowrap">{anchorStr}</td>
                  <td className="px-4 py-3 font-medium text-gray-700">{rule.label}</td>
                  <td className={`px-4 py-3 text-right font-bold ${isFree ? 'text-green-600' : isImpossible ? 'text-gray-800' : 'text-red-500'}`}>
                    {rule.fee}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-[11px] text-gray-400">
          * 공식 정책 기준이며 시기에 따라 변경될 수 있습니다. 등록 전 반드시 확인하세요.
        </div>
      </div>
    </div>
  );
}

export default function RulesTab() {
  const [domain, setDomain] = useState('transport');

  return (
    <section className="space-y-4 mt-4">
      {/* 도메인 탭 */}
      <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 p-1">
        {[
          { id: 'transport', label: '🚆 교통수단' },
          { id: 'exam',      label: '📝 시험' },
        ].map(d => (
          <button key={d.id} onClick={() => setDomain(d.id)}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${domain === d.id ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}>
            {d.label}
          </button>
        ))}
      </div>

      {domain === 'transport' ? <TransportRules /> : <ExamRules />}
    </section>
  );
}
