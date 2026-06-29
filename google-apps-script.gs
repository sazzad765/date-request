function doPost(e) {
  const sheet = getSheet();
  const data = JSON.parse(e.postData.contents || "{}");

  sheet.appendRow([
    new Date(),
    data.event || "",
    data.sessionId || "",
    data.recipientName || "",
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
    data.userAgent || "",
    data.locationStatus || "",
    data.latitude || "",
    data.longitude || "",
    data.locationAccuracy || "",
    data.locationTimestamp || "",
    data.locationError || ""
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet() {
  const sheetName = getSheetName();
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(sheetName);
  const headers = [
    "Timestamp",
    "Event",
    "Session ID",
    "Recipient Name",
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
    "User Agent",
    "Location Status",
    "Latitude",
    "Longitude",
    "Location Accuracy",
    "Location Timestamp",
    "Location Error"
  ];

  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    sheet.appendRow(headers);
    return sheet;
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else if (sheet.getLastColumn() < headers.length) {
    sheet
      .getRange(1, 1, 1, headers.length)
      .setValues([headers]);
  }

  return sheet;
}

function getSheetName() {
  return "Clicks";
}
