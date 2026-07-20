import { EXAMS } from '../constants/exams';

const inputCls = "w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500";
const labelCls = "block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1";

export default function ExamAddForm({
  editingId,
  examType, setExamType,
  date, setDate,
  time, setTime,
  registrationDeadline, setRegistrationDeadline,
  examLocation, setExamLocation,
  price, setPrice,
  title, setTitle,
  onSubmit, onCancelEdit,
}) {
  const exam = EXAMS.find(e => e.id === examType) ?? EXAMS[0];

  const handleExamTypeChange = (id) => {
    setExamType(id);
    setRegistrationDeadline('');
  };

  return (
    <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
      {editingId && (
        <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-4 py-2.5">
          <span className="text-sm font-bold text-amber-800 dark:text-amber-300">시험 일정 수정 중</span>
          <button onClick={onCancelEdit} className="text-amber-700 dark:text-amber-400 text-xs font-bold">취소</button>
        </div>
      )}

      <form onSubmit={onSubmit} className="p-5 space-y-4">
        <div>
          <label className={labelCls}>시험 종류</label>
          <div className="grid grid-cols-4 gap-2">
            {EXAMS.map(e => (
              <button key={e.id} type="button" onClick={() => handleExamTypeChange(e.id)}
                className={`py-2.5 px-1 text-xs rounded-lg border flex flex-col items-center gap-0.5 transition-all leading-tight text-center ${
                  examType === e.id
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300 font-bold ring-1 ring-blue-500'
                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                }`}>
                <span className="text-base">{e.isCustom ? '✏️' : '📝'}</span>
                <span>{e.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>시험일</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>시험 시각</label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)} className={inputCls} />
          </div>
        </div>

        {exam.requiresRegDeadline && (
          <div>
            <label className={labelCls}>
              {exam.regDeadlineLabel}
              <span className="text-gray-400 dark:text-slate-500 font-normal ml-1 text-xs">(알림 정확도에 필요)</span>
            </label>
            <input type="datetime-local" value={registrationDeadline} onChange={e => setRegistrationDeadline(e.target.value)} className={inputCls} />
          </div>
        )}

        <div>
          <label className={labelCls}>시험장 <span className="text-gray-400 dark:text-slate-500 font-normal">(선택)</span></label>
          <input type="text" value={examLocation} onChange={e => setExamLocation(e.target.value)}
            placeholder="예: 서울 강남 YBM, 수원 아주대" className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>응시료 <span className="text-gray-400 dark:text-slate-500 font-normal">(선택 — 환불 금액 계산용)</span></label>
          <div className="relative">
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0" className={`${inputCls} pr-7`} />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 text-xs">원</span>
          </div>
        </div>

        <div>
          <label className={labelCls}>메모 <span className="text-gray-400 dark:text-slate-500 font-normal">(선택)</span></label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)}
            placeholder="예: 2026년 1월 정기시험, 취업 목표 900점" className={inputCls} />
        </div>

        {exam.note && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2.5 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            ⚠️ {exam.note}
          </div>
        )}

        <button type="submit"
          className={`w-full text-white font-bold py-3.5 rounded-lg transition-colors shadow-sm ${
            editingId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'
          }`}>
          {editingId ? '수정 완료' : '시험 일정 등록'}
        </button>
      </form>
    </section>
  );
}
