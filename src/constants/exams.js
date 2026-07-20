// anchorType 종류:
// 'examDate'      — 시험일 기준 hoursBefore 시간 전
// 'regDeadline'   — 접수 마감일시 기준 (res.registrationDeadline)
// 'examDayOffset' — 시험일로부터 daysOffset일째 timeOfDay 시각 (TOEIC 전용)

export const EXAMS = [
  {
    id: 'toeic',
    name: 'TOEIC',
    requiresRegDeadline: true,
    regDeadlineLabel: '특별추가접수 마감일시',
    freeLabel: '정기/추가접수 기간 내',
    note: '패키지 접수 시 추가접수 마감 후 일괄 50% 적용. 단일 시험 기준.',
    rules: [
      { id: 1, anchorType: 'regDeadline',   fee: '60%', label: '추가접수 마감 후 ~ 시험 전일 정오' },
      { id: 2, anchorType: 'examDayOffset', daysOffset: -1, timeOfDay: '12:00', fee: '50%', label: '시험 전일 정오 ~ 자정' },
      { id: 3, anchorType: 'examDayOffset', daysOffset:  0, timeOfDay: '00:00', fee: '불가', label: '시험 당일' },
    ],
  },
  {
    id: 'toefl',
    name: 'TOEFL iBT',
    requiresRegDeadline: false,
    freeLabel: null,
    note: '100% 환불 구간 없음. ETS 정책상 등록비 일부 공제됨.',
    rules: [
      { id: 1, anchorType: 'examDate', hoursBefore: 96, fee: '50%', label: '시험일 4일 전까지' },
      { id: 2, anchorType: 'examDate', hoursBefore:  0, fee: '불가', label: '시험일 3일 이내' },
    ],
  },
  {
    id: 'ielts',
    name: 'IELTS',
    requiresRegDeadline: false,
    freeLabel: '시험일 5주 전 이상',
    note: '환불 처리 최대 6주 소요.',
    rules: [
      { id: 1, anchorType: 'examDate', hoursBefore: 840, fee: '75%', label: '시험일 4~5주 전 (25% 수수료)' },
      { id: 2, anchorType: 'examDate', hoursBefore: 672, fee: '불가', label: '시험일 4주 미만' },
    ],
  },
  {
    id: 'opic',
    name: 'OPIc',
    requiresRegDeadline: true,
    regDeadlineLabel: '신청기간 마감일시',
    freeLabel: '신청기간 내',
    note: '신청 마감은 통상 시험일 4~5일 전. 마감 후 취소·변경 불가.',
    rules: [
      { id: 1, anchorType: 'regDeadline', fee: '불가', label: '신청기간 마감 후' },
    ],
  },
  {
    id: 'jlpt',
    name: 'JLPT',
    requiresRegDeadline: true,
    regDeadlineLabel: '추가접수 마감일시',
    freeLabel: '정기접수 기간 내 (100%)',
    note: '정기접수 내 100%, 추가접수 내 70% 환불. 마감 후 사유 불문 환불 불가.',
    rules: [
      { id: 1, anchorType: 'regDeadline', fee: '70%',  label: '추가접수 기간 내' },
      { id: 2, anchorType: 'examDate',    hoursBefore: 0, fee: '불가', label: '추가접수 마감 후' },
    ],
  },
  {
    id: 'khistory',
    name: '한국사능력검정',
    requiresRegDeadline: true,
    regDeadlineLabel: '접수 마감일시',
    freeLabel: '접수기간 내',
    rules: [
      { id: 1, anchorType: 'regDeadline', fee: '50%',  label: '접수마감 후 ~ 시험 5일 전' },
      { id: 2, anchorType: 'examDate',    hoursBefore: 120, fee: '불가', label: '시험 4일 전 이후' },
    ],
  },
  {
    id: 'qnet',
    name: '기사/산업기사',
    requiresRegDeadline: true,
    regDeadlineLabel: '접수 마감일시',
    freeLabel: '접수기간 내',
    note: '필기·실기 별도 접수. 시험 시행일 초일(첫째날) 기준.',
    rules: [
      { id: 1, anchorType: 'regDeadline', fee: '50%',  label: '접수마감 후 ~ 시험 5일 전' },
      { id: 2, anchorType: 'examDate',    hoursBefore: 120, fee: '불가', label: '시험 4일 전 이후' },
    ],
  },
  {
    id: 'custom',
    name: '직접 입력',
    requiresRegDeadline: false,
    freeLabel: null,
    isCustom: true,
    rules: [],
  },
];
