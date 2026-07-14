import { useState, useEffect, useCallback, useMemo } from 'react';
import { VENDORS } from './constants/vendors';
import { calcFeeInfo, parseFeeToAmount } from './utils/fees';
import { fireNotification, requestNotifPermission } from './utils/notifications';
import AddForm from './components/AddForm';
import ReservationCard from './components/ReservationCard';
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

  // 폼 상태
  const [editingId, setEditingId]           = useState(null);
  const [vendorType, setVendorType]         = useState('ktx');
  const [date, setDate]                     = useState('');
  const [time, setTime]                     = useState('');
  const [origin, setOrigin]                 = useState('');
  const [destination, setDestination]       = useState('');
  const [price, setPrice]                   = useState('');
  const [showManualForm, setShowManualForm] = useState(false);

  // UI 상태
  const [toasts, setToasts]                   = useState([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isAnalyzing, setIsAnalyzing]         = useState(false);
  const [previewData, setPreviewData]         = useState(null);

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
    setEditingId(null); setVendorType('ktx');
    setDate(''); setTime(''); setOrigin(''); setDestination(''); setPrice('');
    setPreviewData(null); setShowManualForm(false);
  };

  // ── 예매 ──
  const handleAddReservation = (e) => {
    e.preventDefault();
    if (!date || !time) { showToast('출발 날짜와 시간을 입력해 주세요.'); return; }
    if (isNaN(new Date(`${date}T${time}`))) { showToast('시간 형식이 올바르지 않습니다.'); return; }
    const vendor = VENDORS.find(v => v.id === vendorType);
    const base = editingId ? reservations.find(r => r.id === editingId) : null;
    const resData = {
      id: editingId ?? Date.now().toString(),
      vendorType, vendorName: vendor.name,
      date, time,
      origin: origin || '출발지',
      destination: destination || '도착지',
      price: Number(price) || 0,
      rules: vendor.rules,
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

  const handleStartEdit = (res) => {
    setEditingId(res.id); setVendorType(res.vendorType);
    setDate(res.date); setTime(res.time);
    setOrigin(res.origin === '출발지' ? '' : res.origin);
    setDestination(res.destination === '도착지' ? '' : res.destination);
    setPrice(res.price ? String(res.price) : '');
    setShowManualForm(true);
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
  };

  // ── 알림 ──
  const toggleAlarmMinutes = async (resId, tier, minutes) => {
    const key = `${tier.id}-m${minutes}`;
    const res = reservations.find(r => r.id === resId);
    const isOn = !!res?.alarms[key];
    if (isOn) {
      setReservations(p => p.map(r => {
        if (r.id !== resId) return r;
        const next = { ...r.alarms }; delete next[key]; return { ...r, alarms: next };
      }));
      showToast('알림을 해제했습니다.'); return;
    }
    if (!(await requestNotifPermission())) {
      showToast('알림 권한이 없습니다. 브라우저 설정에서 허용해 주세요.'); return;
    }
    const notifyAt = tier.untilTime.getTime() - minutes * 60000;
    if (notifyAt <= Date.now()) { showToast('이미 지난 시각이라 알림을 설정할 수 없습니다.'); return; }
    setReservations(p => p.map(r =>
      r.id === resId ? { ...r, alarms: { ...r.alarms, [key]: { active: true, notifyAt, label: tier.label, alarmMinutes: minutes } } } : r
    ));
    const t = new Date(notifyAt).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    showToast(`알림 설정 — ${t}에 알려드립니다.`);
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
    const info = calcFeeInfo(res, cancelDate, cancelTime);
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
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try { await processImageWithGemini(ev.target.result); }
      catch { showToast('이미지 분석 중 오류가 발생했습니다.'); setIsAnalyzing(false); }
    };
    reader.readAsDataURL(files[0]);
    if (e.target) e.target.value = '';
  };

  const processImageWithGemini = async (base64Data) => {
    const apiKey = '';  // ✏️ Gemini API 키를 여기에 입력하세요
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const base64Image = base64Data.split(',')[1];
    const mimeType = base64Data.split(';')[0].split(':')[1];
    try {
      let response, retries = 5, delay = 1000;
      while (retries > 0) {
        response = await fetch(url, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [
              { text: '이 승차권 이미지에서 vendorType(ktx/srt/bus), date(YYYY-MM-DD), time(HH:MM), origin, destination을 JSON으로 추출해줘.' },
              { inlineData: { mimeType, data: base64Image } },
            ]}],
            generationConfig: {
              responseMimeType: 'application/json',
              responseSchema: { type: 'OBJECT', properties: {
                vendorType: { type: 'STRING' }, date: { type: 'STRING' }, time: { type: 'STRING' },
                origin: { type: 'STRING' }, destination: { type: 'STRING' },
              }},
            },
          }),
        });
        if (response.ok) break;
        retries--; await new Promise(r => setTimeout(r, delay)); delay *= 2;
      }
      if (!response?.ok) throw new Error('API failed');
      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('No text');
      setPreviewData(JSON.parse(text));
      showToast('이미지에서 정보를 성공적으로 추출했습니다!');
    } catch {
      setPreviewData({ vendorType: 'ktx', date: new Date().toISOString().split('T')[0], time: '14:30', origin: '서울', destination: '부산' });
      showToast('모의 데이터로 추출되었습니다. (API 키 확인 필요)');
    } finally { setIsAnalyzing(false); }
  };

  const applyPreviewData = () => {
    if (!previewData) return;
    setVendorType(previewData.vendorType || 'ktx');
    setDate(previewData.date || ''); setTime(previewData.time || '');
    setOrigin(previewData.origin || ''); setDestination(previewData.destination || '');
    setPreviewData(null); setShowManualForm(true);
    showToast('폼에 정보가 채워졌습니다. 확인 후 등록해주세요.');
  };

  const now = new Date();
  const upcomingCount = reservations.filter(r => r.status === '예정').length;
  const cancelRes = reservations.find(r => r.id === cancelTargetId);
  const cancelPreview = useMemo(
    () => calcFeeInfo(cancelRes, cancelDate, cancelTime),
    [cancelTargetId, cancelDate, cancelTime, reservations]
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-20">
      {/* 헤더 */}
      <header className="bg-blue-700 text-white p-4 shadow-md sticky top-0 z-10">
        <h1 className="text-xl font-extrabold mb-3">취소 수수료 지킴이</h1>
        <div className="flex bg-blue-900/40 rounded-lg p-1">
          {[
            { id: 'reservations', label: `내 예매 관리${upcomingCount > 0 ? ` (${upcomingCount})` : ''}` },
            { id: 'rules',        label: '수수료 규정 요약표' },
            { id: 'settings',     label: '설정' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${activeTab === tab.id ? 'bg-white text-blue-800 shadow' : 'text-blue-100 hover:text-white'}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-xl mx-auto p-4 space-y-5">
        {activeTab === 'reservations' && (
          <>
            <AddForm
              editingId={editingId}
              vendorType={vendorType} setVendorType={setVendorType}
              date={date} setDate={setDate}
              time={time} setTime={setTime}
              origin={origin} setOrigin={setOrigin}
              destination={destination} setDestination={setDestination}
              price={price} setPrice={setPrice}
              showManualForm={showManualForm} setShowManualForm={setShowManualForm}
              savedRoutes={savedRoutes}
              onSaveRoute={saveRoute}
              onDeleteRoute={(id) => setSavedRoutes(p => p.filter(r => r.id !== id))}
              onApplyRoute={applyRoute}
              isAnalyzing={isAnalyzing}
              previewData={previewData} setPreviewData={setPreviewData}
              onImageUpload={handleImageUpload}
              onApplyPreview={applyPreviewData}
              onSubmit={handleAddReservation}
              onCancelEdit={resetForm}
            />

            <section className="space-y-4">
              <h2 className="text-lg font-bold px-1">
                등록된 여정 <span className="text-blue-600">({reservations.length})</span>
              </h2>

              {reservations.length === 0 && (
                <div className="text-center text-gray-400 py-16 bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="text-5xl mb-3">📅</div>
                  <p className="font-semibold text-gray-500">등록된 예매 내역이 없습니다.</p>
                  <p className="text-sm mt-1">캡처 이미지로 예매를 추가해보세요.</p>
                </div>
              )}

              {reservations.map(res => (
                <ReservationCard
                  key={res.id}
                  res={res}
                  now={now}
                  editingId={editingId}
                  customAlarmPresets={customAlarmPresets}
                  onEdit={handleStartEdit}
                  onDelete={(id) => setDeleteConfirmId(id)}
                  onStatusChange={handleStatusChange}
                  onToggleExpand={toggleExpand}
                  onToggleAlarm={toggleAlarmMinutes}
                />
              ))}
            </section>
          </>
        )}

        {activeTab === 'rules' && <RulesTab />}

        {activeTab === 'settings' && (
          <SettingsTab
            customAlarmPresets={customAlarmPresets}
            setCustomAlarmPresets={setCustomAlarmPresets}
            showToast={showToast}
          />
        )}
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
