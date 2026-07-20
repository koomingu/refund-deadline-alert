import { useState } from 'react';
import { VENDORS } from '../constants/vendors';
import { EXAMS } from '../constants/exams';

function TransportRules() {
  const [activeVendor, setActiveVendor] = useState('ktx');
  const vendor = VENDORS.find(v => v.id === activeVendor) ?? VENDORS[0];

  return (
    <div className="space-y-4">
      <div className="flex bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-1">
        {[
          { id: 'ktx', label: '🚆 KTX' },
          { id: 'srt', label: '🚄 SRT' },
          { id: 'bus', label: '🚌 시외/고속' },
        ].map(v => (
          <button key={v.id} onClick={() => setActiveVendor(v.id)}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeVendor === v.id ? 'bg-blue-600 text-white shadow' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
            {v.label}
          </button>
        ))}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
        <p className="text-sm leading-relaxed font-medium">
          일반승차권 기준입니다. 명절·단체 승차권은 별도 규정이 적용됩니다. 출발 후 취소는 역 창구에서만 가능합니다.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600 dark:text-slate-400">
            <thead className="text-xs text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-2.5 font-semibold">구분</th>
                <th className="px-4 py-2.5 font-semibold">평일 (월~목)</th>
                <th className="px-4 py-2.5 font-semibold">주말·공휴일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {[...vendor.rules].sort((a, b) => b.hoursBefore - a.hoursBefore).map((rule, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-slate-100 bg-gray-50/50 dark:bg-slate-800/30">{rule.label}</td>
                  <td className={`px-4 py-3 font-bold ${rule.fee === '무료' || rule.fee === '0%' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-slate-300'}`}>{rule.fee}</td>
                  <td className={`px-4 py-3 font-bold ${!rule.weekendFee || rule.weekendFee === '무료' || rule.weekendFee === '0%' ? 'text-blue-600 dark:text-blue-400' : 'text-red-500 dark:text-red-400'}`}>{rule.weekendFee || rule.fee}</td>
                </tr>
              ))}
              {vendor.postRules && (
                <tr>
                  <td colSpan={3} className="px-4 py-1.5 text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-t border-red-100 dark:border-red-900/40">출발 후 (역 창구 환불)</td>
                </tr>
              )}
              {vendor.postRules?.map((rule, i) => (
                <tr key={`post-${i}`} className="bg-red-50/30 dark:bg-red-900/10">
                  <td className="px-4 py-2.5 font-medium text-gray-700 dark:text-slate-300 text-xs">
                    {rule.label}
                    {rule.note && <div className="text-[10px] text-gray-400 dark:text-slate-500">{rule.note}</div>}
                  </td>
                  <td className="px-4 py-2.5 font-bold text-red-500 dark:text-red-400 text-xs">{rule.fee}</td>
                  <td className="px-4 py-2.5 font-bold text-red-500 dark:text-red-400 text-xs">{rule.weekendFee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 bg-gray-50 dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700 text-[11px] text-gray-500 dark:text-slate-500">
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
      <div className="grid grid-cols-4 gap-2">
        {visibleExams.map(e => (
          <button key={e.id} onClick={() => setActiveExam(e.id)}
            className={`py-2.5 px-1 text-xs rounded-xl border font-semibold transition-all ${
              activeExam === e.id
                ? 'bg-blue-600 border-blue-600 text-white shadow'
                : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'
            }`}>
            {e.name}
          </button>
        ))}
      </div>

      {exam.note && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 px-4 py-3 rounded-xl text-xs leading-relaxed">
          ⚠️ {exam.note}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
          <span className="text-xs font-bold text-gray-600 dark:text-slate-300">취소 수수료 구간</span>
          {exam.requiresRegDeadline && (
            <span className="ml-2 text-xs text-blue-600 dark:text-blue-400 font-medium">({exam.regDeadlineLabel} 입력 필요)</span>
          )}
        </div>
        <table className="w-full text-sm text-left text-gray-600 dark:text-slate-400">
          <thead className="text-xs text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
            <tr>
              <th className="px-4 py-2.5 font-semibold">기준 시점</th>
              <th className="px-4 py-2.5 font-semibold">구간 설명</th>
              <th className="px-4 py-2.5 font-semibold text-right">수수료</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            {exam.freeLabel && (
              <tr className="bg-green-50/40 dark:bg-green-900/10">
                <td className="px-4 py-3 text-xs text-gray-400 dark:text-slate-500 font-medium">—</td>
                <td className="px-4 py-3 font-medium text-gray-700 dark:text-slate-300">{exam.freeLabel}</td>
                <td className="px-4 py-3 text-right font-bold text-green-600 dark:text-green-400">무료</td>
              </tr>
            )}
            {exam.rules.map((rule, i) => {
              const anchorFn = ANCHOR_LABEL[rule.anchorType];
              const anchorStr = anchorFn ? anchorFn(rule) : rule.anchorType;
              const isFree = rule.fee === '무료' || rule.fee === '0%';
              const isImpossible = rule.fee === '불가';
              return (
                <tr key={i} className={`hover:bg-gray-50 dark:hover:bg-slate-800/50 ${isImpossible ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}>
                  <td className="px-4 py-3 text-xs text-gray-400 dark:text-slate-500 font-medium whitespace-nowrap">{anchorStr}</td>
                  <td className="px-4 py-3 font-medium text-gray-700 dark:text-slate-300">{rule.label}</td>
                  <td className={`px-4 py-3 text-right font-bold ${isFree ? 'text-green-600 dark:text-green-400' : isImpossible ? 'text-gray-800 dark:text-slate-300' : 'text-red-500 dark:text-red-400'}`}>
                    {rule.fee}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="px-4 py-2 bg-gray-50 dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700 text-[11px] text-gray-400 dark:text-slate-500">
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
      <div className="flex bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-1">
        {[
          { id: 'transport', label: '🚆 교통수단' },
          { id: 'exam',      label: '📝 시험' },
        ].map(d => (
          <button key={d.id} onClick={() => setDomain(d.id)}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${domain === d.id ? 'bg-blue-600 text-white shadow' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
            {d.label}
          </button>
        ))}
      </div>

      {domain === 'transport' ? <TransportRules /> : <ExamRules />}
    </section>
  );
}
