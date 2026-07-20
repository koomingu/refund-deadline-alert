import { useState, useEffect, useCallback, useMemo } from 'react';
import { VENDORS, ALARM_PRESETS } from './constants/vendors';
import { EXAMS } from './constants/exams';
import { calcFeeInfo, parseFeeToAmount, calculateTimeline, calcExamFeeInfo, calculateExamTimeline } from './utils/fees';
import { estimatePrice } from './utils/prices';
import { fireNotification, requestNotifPermission } from './utils/notifications';
import AddForm from './components/AddForm';
import ExamAddForm from './components/ExamAddForm';
import ReservationCard from './components/ReservationCard';
import ExamCard from './components/ExamCard';
import CancelModal from './components/CancelModal';
import NoShowModal from './components/NoShowModal';
import DeleteModal from './components/DeleteModal';
import RulesTab from './components/RulesTab';
import SettingsTab from './components/SettingsTab';

export default function App() {
  const [activeTab, setActiveTab] = useState('reservations');
  const [reservations, setReservations] = useState(() => {
    try { return JSON.parse(localStorage.getItem('reservations')) ?? []; } catch { return []; }
  });
  const [savedRoutes, setSavedRoutes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('savedRoutes')) ?? []; } catch { return []; }
  });
  const [customAlarmPresets, setCustomAlarmPresets] = useState(() => {
    try { return JSON.parse(localStorage.getItem('customAlarmPresets')) ?? []; } catch { return []; }
  });
  // 알림 간격 켜기/끄기 (minutes → boolean)
  const [alarmPresets, setAlarmPresets] = useState(() => {
    try { return JSON.parse(localStorage.getItem('alarmPresets')) ?? { 30: true, 60: true, 180: false, 1440: true }; } catch { return { 30: true, 60: true, 180: false, 1440: true }; }
  });

  // 폼 상태
  const [domain, setDomain]                 = useState('transport'); // 'transport' | 'exam'
  const [editingId, setEditingId]           = useState(null);
  const [vendorType, setVendorType]         = useState('ktx');
  const [date, setDate]                     = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime]                     = useState(() => {
    const n = new Date();
    return `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`;
  });
  const [origin, setOrigin]                 = useState('');
  const [destination, setDestination]       = useState('');
  const [arrivalTime, setArrivalTime]       = useState('');
  const [price, setPrice]                   = useState('');
  const [title, setTitle]                   = useState('');
  const [showManualForm, setShowManualForm] = useState(true);
  // 시험 폼 전용 상태
  const [examType, setExamType]                       = useState('toeic');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [examLocation, setExamLocation]               = useState('');

  // UI 상태
  const [toasts, setToasts]                   = useState([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isAnalyzing, setIsAnalyzing]         = useState(false);
  const [previewDataList, setPreviewDataList] = useState([]);

  // 취소 모달
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelTargetId, setCancelTargetId]   = useState(null);
  const [cancelDate, setCancelDate]           = useState('');
  const [cancelTime, setCancelTime]           = useState('');
  const [isAlarmHelped, setIsAlarmHelped]     = useState(false);

  // 노쇼 모달
  const [noShowModalOpen, setNoShowModalOpen] = useState(false);
  const [noShowTargetId, setNoShowTargetId]   = useState(null);

  // 1분 tick
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  // localStorage 저장
  useEffect(() => { localStorage.setItem('reservations',       JSON.stringify(reservations));       }, [reservations]);
  useEffect(() => { localStorage.setItem('savedRoutes',        JSON.stringify(savedRoutes));        }, [savedRoutes]);
  useEffect(() => { localStorage.setItem('customAlarmPresets', JSON.stringify(customAlarmPresets)); }, [customAlarmPresets]);
  useEffect(() => { localStorage.setItem('alarmPresets', JSON.stringify(alarmPresets)); }, [alarmPresets]);

  // 알림 체크
  useEffect(() => {
    const check = () => {
      const now = Date.now();
      setReservations(prev => {
        let changed = false;
        const updated = prev.map(res => {
          if (res.status === '예정') {
            const dep = new Date(`${res.date}T${res.time}`);
            if (!isNaN(dep) && now > dep) { changed = true; return { ...res, status: '이용완료' }; }
          }
          const newAlarms = { ...res.alarms };
          let alarmChanged = false;
          Object.entries(newAlarms).forEach(([key, alarm]) => {
            if (alarm?.active && alarm.notifyAt <= now) {
              fireNotification('취소 수수료 지킴이 ⏰', `${res.vendorName} ${res.date} ${res.time} 출발 — 수수료 구간이 곧 바뀝니다!`, key);
              delete newAlarms[key]; alarmChanged = true; changed = true;
            }
          });
          return alarmChanged ? { ...res, alarms: newAlarms } : res;
        });
        return changed ? updated : prev;
      });
    };
    check();
    const id = setInterval(check, 60000);
    return () => clearInterval(id);
  }, []);

  // ── 유틸 ──
  const showToast = useCallback((message) => {
    const id = Date.now();
    setToasts(p => [...p, { id, message }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  }, []);

  const resetForm = () => {
    const n = new Date();
    setEditingId(null); setVendorType('ktx');
    setDate(n.toISOString().split('T')[0]);
    setTime(`${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`);
    setOrigin(''); setDestination(''); setArrivalTime(''); setPrice(''); setTitle('');
    setPreviewDataList([]); setShowManualForm(true);
    setExamType('toeic'); setRegistrationDeadline(''); setExamLocation('');
  };

  // ── 예매/시험 등록 ──
  const handleAddReservation = (e) => {
    e.preventDefault();
    if (domain === 'exam') { handleAddExamReservation(); return; }
    if (!date || !time) { showToast('출발 날짜와 시간을 입력해 주세요.'); return; }
    if (isNaN(new Date(`${date}T${time}`))) { showToast('시간 형식이 올바르지 않습니다.'); return; }
    const vendor = VENDORS.find(v => v.id === vendorType);
    const base = editingId ? reservations.find(r => r.id === editingId) : null;
    const resData = {
      id: editingId ?? Date.now().toString(),
      domain: 'transport',
      vendorType, vendorName: vendor.name,
      date, time,
      origin: origin || '출발지',
      destination: destination || '도착지',
      arrivalTime: arrivalTime || '',
      price: Number(price) || 0,
      title: title || '',
      alarms: base?.alarms ?? {}, isExpanded: false,
      status: base?.status ?? '예정', cancelInfo: base?.cancelInfo ?? null,
      createdAt: base?.createdAt ?? new Date().toISOString(),
    };
    if (editingId) {
      setReservations(p => p.map(r => r.id === editingId ? resData : r));
      showToast('예매 정보가 수정되었습니다.'); resetForm(); return;
    }
    setReservations(p => [resData, ...p]);
    showToast('새로운 예매 내역이 추가되었습니다.'); resetForm();
  };

  const handleAddExamReservation = () => {
    if (!date || !time) { showToast('시험일과 시험 시각을 입력해 주세요.'); return; }
    const exam = EXAMS.find(e => e.id === examType) ?? EXAMS[0];
    const base = editingId ? reservations.find(r => r.id === editingId) : null;
    const resData = {
      id: editingId ?? Date.now().toString(),
      domain: 'exam',
      examType, examName: exam.name,
      date, time,
      registrationDeadline: exam.requiresRegDeadline ? registrationDeadline : '',
      examLocation: examLocation || '',
      price: Number(price) || 0,
      title: title || '',
      alarms: base?.alarms ?? {}, isExpanded: false,
      status: base?.status ?? '예정', cancelInfo: base?.cancelInfo ?? null,
      createdAt: base?.createdAt ?? new Date().toISOString(),
    };
    if (editingId) {
      setReservations(p => p.map(r => r.id === editingId ? resData : r));
      showToast('시험 일정이 수정되었습니다.'); resetForm(); return;
    }
    setReservations(p => [resData, ...p]);
    showToast('시험 일정이 등록되었습니다!'); resetForm();
  };

  const handleStartEdit = (res) => {
    setEditingId(res.id);
    setDate(res.date); setTime(res.time);
    setPrice(res.price ? String(res.price) : '');
    setTitle(res.title || '');

    if (res.domain === 'exam') {
      setDomain('exam');
      setExamType(res.examType);
      setRegistrationDeadline(res.registrationDeadline || '');
      setExamLocation(res.examLocation || '');
    } else {
      setDomain('transport');
      setVendorType(res.vendorType);
      setOrigin(res.origin === '출발지' ? '' : res.origin);
      setDestination(res.destination === '도착지' ? '' : res.destination);
      setArrivalTime(res.arrivalTime || '');
      setShowManualForm(true);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    setReservations(p => p.filter(r => r.id !== id));
    setDeleteConfirmId(null); showToast('예매 내역이 삭제되었습니다.');
  };

  const toggleExpand = (id) =>
    setReservations(p => p.map(r => r.id === id ? { ...r, isExpanded: !r.isExpanded } : r));

  // ── 자주 가는 노선 ──
  const saveRoute = () => {
    if (!origin && !destination) { showToast('출발지 또는 도착지를 입력해 주세요.'); return; }
    const vendor = VENDORS.find(v => v.id === vendorType);
    const label = `${origin || '?'} → ${destination || '?'}`;
    if (savedRoutes.find(r => r.vendorType === vendorType && r.origin === origin && r.destination === destination)) {
      showToast('이미 저장된 노선입니다.'); return;
    }
    setSavedRoutes(p => [{ id: `route_${Date.now()}`, vendorType, vendorName: vendor.name, origin: origin || '', destination: destination || '', label }, ...p]);
    showToast(`'${label}' 노선이 저장됐습니다.`);
  };

  const applyRoute = (route) => {
    setVendorType(route.vendorType);
    setOrigin(route.origin);
    setDestination(route.destination);
    const est = estimatePrice(route.vendorType, route.origin, route.destination);
    if (est) setPrice(String(est));
    setShowManualForm(true);
  };

  // ── 알림 ── 카드 종 아이콘 탭 → 켜진 간격 전체 등록/해제
  const toggleCardAlarm = async (resId) => {
    const res = reservations.find(r => r.id === resId);
    if (!res) return;
    // 이미 알람 있으면 전체 해제
    if (Object.keys(res.alarms ?? {}).length > 0) {
      setReservations(p => p.map(r => r.id === resId ? { ...r, alarms: {} } : r));
      showToast('알림을 모두 해제했습니다.'); return;
    }
    if (!(await requestNotifPermission())) {
      showToast('알림 권한이 없습니다. 브라우저 설정에서 허용해 주세요.'); return;
    }
    const timeline = res.domain === 'exam'
      ? calculateExamTimeline(res, EXAMS.find(e => e.id === res.examType))
      : calculateTimeline(res.date, res.time, (VENDORS.find(v => v.id === res.vendorType) ?? VENDORS[0]).rules);

    // 켜진 간격 수집
    const activeMinutes = [
      ...ALARM_PRESETS.map(p => p.minutes).filter(m => alarmPresets[m]),
      ...customAlarmPresets.filter(m => alarmPresets[m]),
    ];
    if (activeMinutes.length === 0) {
      showToast('설정에서 알림 간격을 하나 이상 켜주세요.'); return;
    }
    const newAlarms = {};
    const set = [];
    for (const tier of timeline) {
      for (const m of activeMinutes) {
        const notifyAt = tier.untilTime.getTime() - m * 60000;
        if (notifyAt <= Date.now()) continue;
        const key = `${tier.id}-m${m}`;
        const label = m < 60 ? `${m}분 전` : m < 1440 ? `${m/60}시간 전` : '1일 전';
        newAlarms[key] = { active: true, notifyAt, label: tier.label, alarmMinutes: m };
        set.push(new Date(notifyAt).toLocaleString('ko-KR', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }));
      }
    }
    if (Object.keys(newAlarms).length === 0) {
      showToast('설정 가능한 알림 시각이 없습니다 (모두 지난 시각).'); return;
    }
    setReservations(p => p.map(r => r.id === resId ? { ...r, alarms: newAlarms } : r));
    showToast(`🔔 알림 ${Object.keys(newAlarms).length}개 설정됨`);
  };

  // ── 취소 처리 ──
  const handleStatusChange = (id, newStatus) => {
    if (newStatus === '취소함') {
      const local = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString();
      setCancelDate(local.split('T')[0]); setCancelTime(local.split('T')[1].slice(0, 5));
      setIsAlarmHelped(false); setCancelTargetId(id); setCancelModalOpen(true); return;
    }
    if (newStatus === '놓침') { setNoShowTargetId(id); setNoShowModalOpen(true); return; }
    setReservations(p => p.map(r => r.id === id ? { ...r, status: newStatus } : r));
    showToast(`상태가 '${newStatus}'(으)로 변경되었습니다.`);
  };

  const confirmCancel = () => {
    const res = reservations.find(r => r.id === cancelTargetId);
    if (!res) return;
    let info;
    if (res.domain === 'exam') {
      const exam = EXAMS.find(e => e.id === res.examType);
      info = calcExamFeeInfo(res, exam, cancelDate, cancelTime);
    } else {
      const vendor = VENDORS.find(v => v.id === res.vendorType);
      info = calcFeeInfo({ ...res, rules: vendor?.rules ?? [], postRules: vendor?.postRules ?? [] }, cancelDate, cancelTime);
    }
    if (!info) return;
    const cancelDT = new Date(`${cancelDate}T${cancelTime}`);
    setReservations(p => p.map(r =>
      r.id === cancelTargetId ? { ...r, status: '취소함',
        cancelInfo: { cancelTime: cancelDT.toISOString(), appliedFee: info.appliedFee, appliedLabel: info.appliedLabel, isAlarmHelped, feeAmount: info.feeAmount ?? 0 }
      } : r
    ));
    setCancelModalOpen(false); showToast('취소 처리가 완료되었습니다.');
  };

  const confirmNoShow = () => {
    const res = reservations.find(r => r.id === noShowTargetId);
    if (!res) return;

    // 시험 도메인: 불참 = 환불 불가
    if (res.domain === 'exam') {
      setReservations(p => p.map(r =>
        r.id === noShowTargetId ? { ...r, status: '놓침',
          cancelInfo: { cancelTime: new Date(`${res.date}T${res.time}`).toISOString(), appliedFee: '불가', appliedLabel: '불참(미응시)', isAlarmHelped: false, feeAmount: res.price || 0 }
        } : r
      ));
      setNoShowModalOpen(false); setNoShowTargetId(null);
      showToast('불참으로 처리되었습니다.');
      return;
    }

    const vendor = VENDORS.find(v => v.id === res.vendorType);
    const postRule = vendor?.postRules?.[vendor.postRules.length - 1];
    const dep = new Date(`${res.date}T${res.time}`);
    const dow = dep.getDay();
    const appliedFee = postRule
      ? ((dow === 0 || dow === 5 || dow === 6) && postRule.weekendFee ? postRule.weekendFee : postRule.fee)
      : '규정 확인 필요';
    const feeAmount = parseFeeToAmount(appliedFee, res.price);
    setReservations(p => p.map(r =>
      r.id === noShowTargetId ? { ...r, status: '놓침',
        cancelInfo: { cancelTime: dep.toISOString(), appliedFee, appliedLabel: '노쇼(미탑승)', isAlarmHelped: false, feeAmount }
      } : r
    ));
    setNoShowModalOpen(false); setNoShowTargetId(null);
    showToast('노쇼로 처리되었습니다.');
  };

  // ── 이미지 분석 ──
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setIsAnalyzing(true);
    setPreviewDataList([]);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try { await processImageWithGemini(ev.target.result); }
      catch { showToast('이미지 분석 중 오류가 발생했습니다.'); setIsAnalyzing(false); }
    };
    reader.readAsDataURL(files[0]);
    if (e.target) e.target.value = '';
  };

  const processImageWithGemini = async (base64Data) => {
    const apiKey = localStorage.getItem('geminiApiKey') || '';
    if (!apiKey) {
      showToast('설정 탭에서 Gemini API 키를 먼저 입력해 주세요.'); setIsAnalyzing(false); return;
    }
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;
    const base64Image = base64Data.split(',')[1];
    const mimeType = base64Data.split(';')[0].split(':')[1];
    try {
      let response, retries = 5, delay = 1000;
      while (retries > 0) {
        response = await fetch(url, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [
              { text: '이 이미지에서 모든 승차권 정보를 추출해줘. 여러 매가 있으면 모두 추출해. vendorType은 ktx/srt/bus 중 하나로, date는 YYYY-MM-DD, time은 출발 시각 HH:MM, arrivalTime은 도착 시각 HH:MM 형식으로 추출해줘. origin과 destination은 도시 또는 역명으로 추출해줘. price는 결제 금액(숫자, 원 단위)을 추출해줘.' },
              { inlineData: { mimeType, data: base64Image } },
            ]}],
            generationConfig: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: 'OBJECT',
                properties: {
                  reservations: {
                    type: 'ARRAY',
                    items: {
                      type: 'OBJECT',
                      properties: {
                        vendorType:  { type: 'STRING' },
                        date:        { type: 'STRING' },
                        time:        { type: 'STRING' },
                        origin:      { type: 'STRING' },
                        destination: { type: 'STRING' },
                        arrivalTime: { type: 'STRING' },
                        price:       { type: 'NUMBER' },
                      },
                    },
                  },
                },
              },
            },
          }),
        });
        if (response.ok) break;
        retries--; await new Promise(r => setTimeout(r, delay)); delay *= 2;
      }
      if (!response?.ok) {
        const body = await response.json().catch(() => ({}));
        const msg = body?.error?.message || `HTTP ${response.status}`;
        throw new Error(msg);
      }
      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('응답 텍스트 없음');
      let parsed;
      try { parsed = JSON.parse(text); } catch { throw new Error('JSON 파싱 실패'); }
      const list = parsed.reservations ?? (parsed.vendorType ? [parsed] : []);
      if (!list.length) throw new Error('예매 정보를 찾지 못했습니다');
      setPreviewDataList(list);
      showToast(`${list.length}건의 예매 정보를 추출했습니다!`);
    } catch (err) {
      const isQuota = err.message?.includes('quota') || err.message?.includes('Quota');
      showToast(isQuota
        ? '잠시 후 다시 시도해 주세요. (API 요청 한도 초과)'
        : '이미지를 인식하지 못했어요. 다시 시도하거나 직접 입력해 주세요.'
      );
    } finally { setIsAnalyzing(false); }
  };

  const addReservationFromData = (data) => {
    const vendor = VENDORS.find(v => v.id === (data.vendorType || 'ktx')) ?? VENDORS[0];
    if (!data.date || !data.time) return false;
    const resData = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      vendorType: vendor.id, vendorName: vendor.name,
      date: data.date, time: data.time,
      origin: data.origin || '출발지', destination: data.destination || '도착지',
      arrivalTime: data.arrivalTime || '',
      price: Number(data.price) || 0,
      alarms: {}, isExpanded: false,
      status: '예정', cancelInfo: null,
      createdAt: new Date().toISOString(),
    };
    setReservations(p => [resData, ...p]);
    return true;
  };

  const applyPreviewItem = (item) => {
    const ok = addReservationFromData(item);
    if (ok) {
      setPreviewDataList(p => p.filter(d => d !== item));
      showToast('예매가 등록되었습니다.');
    } else {
      showToast('날짜와 시간 정보가 없습니다. 직접 수정 후 등록해주세요.');
      setVendorType(item.vendorType || 'ktx');
      setDate(item.date || ''); setTime(item.time || '');
      setOrigin(item.origin || ''); setDestination(item.destination || '');
      setPreviewDataList([]); setShowManualForm(true);
    }
  };

  const applyAllPreviewItems = () => {
    let count = 0;
    previewDataList.forEach(item => { if (addReservationFromData(item)) count++; });
    setPreviewDataList([]);
    showToast(`${count}건이 모두 등록되었습니다.`);
  };

  // 다크모드
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) return stored === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const now = new Date();
  const upcomingCount = reservations.filter(r => r.status === '예정').length;
  const sortedReservations = useMemo(() => {
    const order = { '예정': 0, '이용완료': 1, '취소함': 2, '놓침': 3 };
    return [...reservations].sort((a, b) => (order[a.status] ?? 1) - (order[b.status] ?? 1));
  }, [reservations]);
  const cancelRes = reservations.find(r => r.id === cancelTargetId);
  const cancelPreview = useMemo(() => {
    if (!cancelRes) return null;
    if (cancelRes.domain === 'exam') {
      const exam = EXAMS.find(e => e.id === cancelRes.examType);
      return calcExamFeeInfo(cancelRes, exam, cancelDate, cancelTime);
    }
    const vendor = VENDORS.find(v => v.id === cancelRes.vendorType);
    return calcFeeInfo({ ...cancelRes, rules: vendor?.rules ?? [], postRules: vendor?.postRules ?? [] }, cancelDate, cancelTime);
  }, [cancelTargetId, cancelDate, cancelTime, reservations]);

  const TABS = [
    { id: 'reservations', label: '내 예매 관리', badge: upcomingCount > 0 ? upcomingCount : null },
    { id: 'rules',        label: '수수료 규정 요약표' },
    { id: 'settings',     label: '설정' },
  ];

  const FormPanel = (
    <div className="space-y-4 lg:sticky lg:top-6">
      {!editingId && (
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
      )}
      {domain === 'exam' ? (
        <ExamAddForm
          editingId={editingId}
          examType={examType} setExamType={setExamType}
          date={date} setDate={setDate}
          time={time} setTime={setTime}
          registrationDeadline={registrationDeadline} setRegistrationDeadline={setRegistrationDeadline}
          examLocation={examLocation} setExamLocation={setExamLocation}
          price={price} setPrice={setPrice}
          title={title} setTitle={setTitle}
          onSubmit={handleAddReservation}
          onCancelEdit={resetForm}
        />
      ) : (
        <AddForm
          editingId={editingId}
          vendorType={vendorType} setVendorType={setVendorType}
          date={date} setDate={setDate}
          time={time} setTime={setTime}
          origin={origin} setOrigin={setOrigin}
          destination={destination} setDestination={setDestination}
          arrivalTime={arrivalTime} setArrivalTime={setArrivalTime}
          price={price} setPrice={setPrice}
          title={title} setTitle={setTitle}
          showManualForm={showManualForm} setShowManualForm={setShowManualForm}
          savedRoutes={savedRoutes}
          onSaveRoute={saveRoute}
          onDeleteRoute={(id) => setSavedRoutes(p => p.filter(r => r.id !== id))}
          onApplyRoute={applyRoute}
          isAnalyzing={isAnalyzing}
          previewDataList={previewDataList} setPreviewDataList={setPreviewDataList}
          onImageUpload={handleImageUpload}
          onApplyPreviewItem={applyPreviewItem}
          onApplyAllPreviewItems={applyAllPreviewItems}
          onSubmit={handleAddReservation}
          onCancelEdit={resetForm}
        />
      )}
    </div>
  );

  const CardListPanel = (
    <section className="space-y-4">
      <h2 className="text-base font-bold px-1 text-gray-700 dark:text-slate-300">
        등록된 여정 <span className="text-blue-600 dark:text-blue-400">({reservations.length})</span>
      </h2>
      {reservations.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="text-5xl mb-3">📅</div>
          <p className="font-semibold text-gray-500 dark:text-slate-400">등록된 예매 내역이 없습니다.</p>
          <p className="text-sm mt-1 text-gray-400 dark:text-slate-500">캡처 이미지로 예매를 추가해보세요.</p>
        </div>
      )}
      {sortedReservations.map(res =>
        res.domain === 'exam' ? (
          <ExamCard key={res.id} res={res} now={now} editingId={editingId}
            onEdit={handleStartEdit} onDelete={(id) => setDeleteConfirmId(id)}
            onStatusChange={handleStatusChange} onToggleExpand={toggleExpand} onToggleAlarm={toggleCardAlarm} />
        ) : (
          <ReservationCard key={res.id} res={res} now={now} editingId={editingId}
            onEdit={handleStartEdit} onDelete={(id) => setDeleteConfirmId(id)}
            onStatusChange={handleStatusChange} onToggleExpand={toggleExpand} onToggleAlarm={toggleCardAlarm} />
        )
      )}
    </section>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 font-sans lg:flex">

      {/* ── 사이드바 (lg+) ── */}
      <aside className="hidden lg:flex lg:flex-col lg:w-56 lg:fixed lg:inset-y-0 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 z-20">
        <div className="px-5 py-6 border-b border-gray-100 dark:border-slate-800">
          <div className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-widest uppercase mb-0.5">취소 수수료</div>
          <h1 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight">지킴이</h1>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all text-left ${
                activeTab === tab.id
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}>
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="bg-blue-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">{tab.badge}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-gray-100 dark:border-slate-800">
          <button onClick={() => setDarkMode(d => !d)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all font-medium">
            <span>{darkMode ? '라이트 모드' : '다크 모드'}</span>
            <span className="text-base">{darkMode ? '☀️' : '🌙'}</span>
          </button>
        </div>
      </aside>

      {/* ── 모바일 헤더 ── */}
      <header className="lg:hidden bg-blue-700 dark:bg-slate-900 dark:border-b dark:border-slate-700 text-white p-4 shadow-md sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-extrabold">취소 수수료 지킴이</h1>
          <button onClick={() => setDarkMode(d => !d)}
            className="text-blue-200 dark:text-slate-400 hover:text-white text-xl p-1 rounded">
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
        <div className="flex bg-blue-900/40 dark:bg-slate-800/60 rounded-lg p-1">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1 ${
                activeTab === tab.id ? 'bg-white dark:bg-slate-700 text-blue-800 dark:text-white shadow' : 'text-blue-100 hover:text-white'
              }`}>
              {tab.label}
              {tab.badge && <span className="bg-blue-500 text-white text-[10px] font-bold px-1 rounded-full">{tab.badge}</span>}
            </button>
          ))}
        </div>
      </header>

      {/* ── 메인 콘텐츠 ── */}
      <main className="lg:pl-56 flex-1 min-h-screen pb-20">
        <div className="p-4 lg:p-6">

          {activeTab === 'reservations' && (
            <div className="lg:grid lg:grid-cols-[400px_1fr] lg:gap-6 lg:items-start space-y-5 lg:space-y-0">
              {FormPanel}
              {CardListPanel}
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="lg:max-w-2xl">
              <RulesTab />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="lg:max-w-2xl">
              <SettingsTab
                alarmPresets={alarmPresets}
                setAlarmPresets={setAlarmPresets}
                customAlarmPresets={customAlarmPresets}
                setCustomAlarmPresets={setCustomAlarmPresets}
                savedRoutes={savedRoutes}
                setSavedRoutes={setSavedRoutes}
                showToast={showToast}
              />
            </div>
          )}
        </div>
      </main>

      {/* 모달 */}
      {cancelModalOpen && (
        <CancelModal
          cancelRes={cancelRes}
          cancelDate={cancelDate} setCancelDate={setCancelDate}
          cancelTime={cancelTime} setCancelTime={setCancelTime}
          cancelPreview={cancelPreview}
          isAlarmHelped={isAlarmHelped} setIsAlarmHelped={setIsAlarmHelped}
          onConfirm={confirmCancel}
          onClose={() => setCancelModalOpen(false)}
        />
      )}

      {noShowModalOpen && (
        <NoShowModal
          res={reservations.find(r => r.id === noShowTargetId)}
          onConfirm={confirmNoShow}
          onClose={() => { setNoShowModalOpen(false); setNoShowTargetId(null); }}
        />
      )}

      {deleteConfirmId && (
        <DeleteModal
          target={reservations.find(r => r.id === deleteConfirmId)}
          onConfirm={() => handleDelete(deleteConfirmId)}
          onClose={() => setDeleteConfirmId(null)}
        />
      )}

      {/* 토스트 */}
      <div className="fixed top-4 right-4 flex flex-col gap-2 w-72 z-[100] pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="bg-gray-800/95 text-white text-sm font-semibold px-4 py-3 rounded-lg shadow-xl animate-fade-in-down pointer-events-auto border border-gray-700">
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}
