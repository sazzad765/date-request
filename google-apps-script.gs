const SHEET_NAME = "Clicks";

function doPost(e) {
  const sheet = getSheet();
  const data = JSON.parse(e.postData.contents || "{}");

  sheet.appendRow([
    new Date(),
    data.event || "",
    data.sessionId || "",
    data.selectedDate || "",
    data.selectedTime || "",
    data.selectedFood || "",
    data.day || "",
    data.date || "",
    data.time || "",
    data.food || "",
    data.x || "",
    data.y || "",
    data.message || "",
    data.page || "",
    data.userAgent || ""
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    sheet.appendRow([
      "Timestamp",
      "Event",
      "Session ID",
      "Selected Date",
      "Selected Time",
      "Selected Food",
      "Day",
      "Date",
      "Time",
      "Food",
      "No Button X",
      "No Button Y",
      "Message",
      "Page",
      "User Agent"
    ]);
  }

  return sheet;
}
