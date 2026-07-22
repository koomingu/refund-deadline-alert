const SHEET_NAME = '응답';
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
];

function doPost(e) {
  const data = JSON.parse(e.postData.contents || '{}');
  const lock = LockService.getScriptLock();
  lock.waitLock(10_000);

  try {
    const sheet = getOrCreateSheet_();
    sheet.appendRow([
      new Date(),
      data.email || '',
      data.source || 'direct',
      data.recentExperience || '',
      data.cancellationResult || '',
      data.feePaid || '',
      data.feeKnowledge || '',
      data.missedReason || '',
      data.alertAction || '',
      data.nextSchedule || '',
      data.diagnosis || '',
    ]);
    return json_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

function getOrCreateSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function json_(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
