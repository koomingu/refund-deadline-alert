export const DEFAULT_KTX_RULES = [
  { id:1, hoursBefore:720, fee:'무료',  weekendFee:'400원', label:'1개월 ~ 출발 2일 전' },
  { id:2, hoursBefore:48,  fee:'무료',  weekendFee:'5%',    label:'출발 2일 전 ~ 1일 전' },
  { id:3, hoursBefore:24,  fee:'5%',    weekendFee:'10%',   label:'출발 1일 전 ~ 3시간 전' },
  { id:4, hoursBefore:3,   fee:'15%',   weekendFee:'20%',   label:'출발 3시간 전 ~ 출발 전' },
];

const DEFAULT_SRT_RULES = JSON.parse(JSON.stringify(DEFAULT_KTX_RULES));

const DEFAULT_BUS_RULES = [
  { id:1, hoursBefore:48, fee:'0%',  weekendFee:'0%',   label:'출발 2일 전' },
  { id:2, hoursBefore:24, fee:'5%',  weekendFee:'7.5%', label:'출발 1일 전 ~ 3시간 전' },
  { id:3, hoursBefore:3,  fee:'10%', weekendFee:'15%',  label:'출발 3시간 전 ~ 출발 전' },
];

const KTX_POST_RULES = [
  { label:'출발 후 20분까지',    fee:'15%', weekendFee:'30%' },
  { label:'출발 후 20분 ~ 60분', fee:'40%', weekendFee:'40%' },
  { label:'출발 후 60분 ~ 도착', fee:'70%', weekendFee:'70%' },
];

const BUS_POST_RULES = [
  { label:'출발 후 1시간 이내',    fee:'40%',  weekendFee:'40%' },
  { label:'출발 후 1시간 ~ 4시간', fee:'60%',  weekendFee:'60%', note:'(2026년 5월~2027년 4월)' },
  { label:'출발 후 4시간 초과',    fee:'100%', weekendFee:'100%' },
];

export const VENDORS = [
  { id:'ktx', name:'KTX',          rules:DEFAULT_KTX_RULES, postRules:KTX_POST_RULES },
  { id:'srt', name:'SRT',          rules:DEFAULT_SRT_RULES, postRules:KTX_POST_RULES },
  { id:'bus', name:'시외/고속버스', rules:DEFAULT_BUS_RULES, postRules:BUS_POST_RULES },
];

export const ALARM_PRESETS = [
  { minutes:30,   label:'30분 전' },
  { minutes:60,   label:'1시간 전' },
  { minutes:180,  label:'3시간 전' },
  { minutes:1440, label:'1일 전' },
];
