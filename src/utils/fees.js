export const parseFeeToAmount = (feeStr, price) => {
  if (!feeStr || feeStr === '무료' || feeStr === '0%') return 0;
  if (feeStr === '400원') return 400;
  if (feeStr.endsWith('%') && price) return Math.round(price * parseFloat(feeStr) / 100);
  return 0;
};

export const fmtMoney = (n) => n === 0 ? '0원' : n.toLocaleString('ko-KR') + '원';

export const fmtFee = (feeStr, price) => {
  if (!feeStr || feeStr === '무료' || feeStr === '0%') return { main:'무료', sub:null, isFree:true };
  if (feeStr === '400원') return { main:'400원', sub:null, isFree:false };
  if (feeStr.endsWith('%')) {
    if (price) {
      const amt = parseFeeToAmount(feeStr, price);
      return { main: fmtMoney(amt), sub: feeStr, isFree: false };
    }
    return { main: feeStr, sub: null, isFree: false };
  }
  return { main: feeStr, sub: null, isFree: false };
};

export const fmtFullTime = (t) => {
  if (!t || isNaN(t)) return '오류';
  const m = t.getMonth() + 1, d = t.getDate();
  const h = String(t.getHours()).padStart(2, '0');
  const min = String(t.getMinutes()).padStart(2, '0');
  return `${m}월 ${d}일 ${h}시 ${min}분`;
};

export const getDday = (dateStr, timeStr, now) => {
  const dep = new Date(`${dateStr}T${timeStr}`);
  const diffMs = dep - now;
  if (diffMs <= 0) return null;
  const diffM = Math.floor(diffMs / 60000);
  if (diffM < 60) return `${diffM}분 후`;
  const diffH = Math.floor(diffMs / 3600000);
  if (diffH < 24) return `${diffH}시간 후`;
  const diffD = Math.ceil(diffMs / 86400000);
  return diffD === 1 ? 'D-day' : `D-${diffD - 1}`;
};

export const calculateTimeline = (resDate, resTime, rules) => {
  const dep = new Date(`${resDate}T${resTime}`);
  const dow = dep.getDay();
  const isWeekend = dow === 0 || dow === 5 || dow === 6;
  const sorted = [...rules].sort((a, b) => b.hoursBefore - a.hoursBefore);
  return sorted.map((rule, i) => {
    const triggerTime = new Date(dep.getTime() - rule.hoursBefore * 3600000);
    const nextRule = sorted[i + 1];
    const untilTime = nextRule ? new Date(dep.getTime() - nextRule.hoursBefore * 3600000) : dep;
    const actualFee = isWeekend && rule.weekendFee ? rule.weekendFee : rule.fee;
    return { ...rule, triggerTime, untilTime, actualFee, formattedUntil: fmtFullTime(untilTime) };
  });
};

export const getNextTierInfo = (timeline, now) => {
  const upcoming = [...timeline].filter(t => t.triggerTime > now).sort((a, b) => a.triggerTime - b.triggerTime);
  if (!upcoming.length) return null;
  const next = upcoming[0];
  const diffMs = next.triggerTime - now;
  const h = Math.floor(diffMs / 3600000);
  const m = Math.floor((diffMs % 3600000) / 60000);
  const timeStr = h === 0 ? `${m}분` : m === 0 ? `${h}시간` : `${h}시간 ${m}분`;
  const current = [...timeline].filter(t => t.triggerTime <= now).sort((a, b) => b.triggerTime - a.triggerTime)[0];
  const curActualFee = current?.actualFee ?? '무료';
  const nextActualFee = next.actualFee;
  if (curActualFee === nextActualFee) return null;
  return { timeStr, nextActualFee, curActualFee, urgency: diffMs < 3 * 3600000 };
};

export const getCurrentTier = (timeline, now) => {
  const past = [...timeline].filter(t => t.triggerTime <= now).sort((a, b) => b.triggerTime - a.triggerTime);
  return past[0] ?? null;
};

export const calcFeeInfo = (res, cancelDateStr, cancelTimeStr) => {
  if (!cancelDateStr || !cancelTimeStr || !res) return null;
  const cancelDT = new Date(`${cancelDateStr}T${cancelTimeStr}`);
  const depDT = new Date(`${res.date}T${res.time}`);
  if (isNaN(cancelDT) || isNaN(depDT)) return null;
  const diffH = (depDT - cancelDT) / 3600000;
  if (diffH < 0) return { appliedFee: '출발 후 (역창구)', appliedLabel: '출발 후 취소', feeAmount: null };
  const sorted = [...res.rules].sort((a, b) => a.hoursBefore - b.hoursBefore);
  let matched = sorted[sorted.length - 1];
  for (const rule of sorted) { if (diffH <= rule.hoursBefore) { matched = rule; break; } }
  const dow = depDT.getDay();
  const appliedFee = (dow === 0 || dow === 5 || dow === 6) && matched.weekendFee ? matched.weekendFee : matched.fee;
  const feeAmount = parseFeeToAmount(appliedFee, res.price);
  return { appliedFee, appliedLabel: matched.label, feeAmount };
};
