const SHEET_NAME = '응답';
const EVENT_SHEET_NAME = '이벤트';
const HEADERS = [
  '제출 시각',
  '이메일',
  '유입 경로',
  '최근 취소 경험',
  '취소 결과',
  '수수료 부담',
  '수수료 인지',
  '놓친 이유',
  '알림 후 행동',
  '다음 일정',
  '진단 결과',
  '사례 설명',
  '응답 ID',
  '상태',
];
const EVENT_HEADERS = ['발생 시각', '이벤트', '유입 경로', '페이지 경로', '진단 결과'];

function doPost(e) {
  const data = JSON.parse(e.postData.contents || '{}');

  if (data.eventName) {
    appendEvent_(data);
    return json_({ ok: true });
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const sheet = getOrCreateSheet_();
    const responseId = data.responseId || '';
    const existingRow = responseId ? findResponseRow_(sheet, responseId) : 0;
    const existing = existingRow
      ? sheet.getRange(existingRow, 1, 1, HEADERS.length).getValues()[0]
      : [];
    const email = data.email || existing[1] || '';
    const row = [
      new Date(),
      email,
      data.source || 'direct',
      data.recentExperience || '',
      data.cancellationResult || '',
      data.feePaid || '',
      data.feeKnowledge || '',
      data.missedReason || '',
      data.alertAction || '',
      data.nextSchedule || '',
      data.diagnosis || '',
      data.caseDetail || '',
      responseId,
      email ? '대기자 등록' : '설문 완료',
    ];

    if (existingRow) {
      sheet.getRange(existingRow, 1, 1, HEADERS.length).setValues([row]);
    } else {
      sheet.appendRow(row);
    }
    return json_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

function appendEvent_(data) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(EVENT_SHEET_NAME) || spreadsheet.insertSheet(EVENT_SHEET_NAME);
    sheet.getRange(1, 1, 1, EVENT_HEADERS.length).setValues([EVENT_HEADERS]);
    sheet.getRange(1, 1, 1, EVENT_HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.appendRow([
      new Date(),
      data.eventName || '',
      data.source || 'direct',
      data.path || '/',
      data.diagnosis || '',
    ]);
  } finally {
    lock.releaseLock();
  }
}

function getOrCreateSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);

  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  sheet.setFrozenRows(1);
  return sheet;
}

function findResponseRow_(sheet, responseId) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;

  const responseIdColumn = HEADERS.indexOf('응답 ID') + 1;
  const ids = sheet.getRange(2, responseIdColumn, lastRow - 1, 1).getValues();
  const index = ids.findIndex(row => row[0] === responseId);
  return index === -1 ? 0 : index + 2;
}

function json_(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
