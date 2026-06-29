const panels = Array.from(document.querySelectorAll(".panel"));
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const daysGrid = document.getElementById("daysGrid");
const timeGrid = document.getElementById("timeGrid");
const setDateBtn = document.getElementById("setDateBtn");
const resetBtn = document.getElementById("resetBtn");
const calendarBtn = document.getElementById("calendarBtn");
const foodSelect = document.getElementById("foodSelect");
const validationMessage = document.getElementById("validationMessage");

const scheduleYear = 2026;
const scheduleMonth = 5;
const safeButtonPadding = 16;

const state = {
  day: null,
  time: null,
  food: "Pasta",
  timeButtons: new Map()
};

const times = [
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "6:30 PM",
  "7:00 PM",
  "7:30 PM",
  "8:00 PM",
  "8:30 PM"
];

function showPanel(name) {
  panels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.panel === name);
  });

  if (name !== "ask") {
    noBtn.style.transform = "";
    noBtn.style.left = "";
    noBtn.style.top = "";
    noBtn.classList.remove("runaway");
  }
}

function formatDate(day) {
  const date = new Date(scheduleYear, scheduleMonth, day);
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric"
  }).format(date);
}

function getTodayStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function getDateForDay(day) {
  return new Date(scheduleYear, scheduleMonth, day);
}

function isPastDate(day) {
  return getDateForDay(day) < getTodayStart();
}

function validateSchedule() {
  refreshTimeAvailability();
  const result = getScheduleValidation();
  setDateBtn.disabled = !result.valid;
  validationMessage.textContent = result.message;
  validationMessage.classList.toggle("error", Boolean(result.error));
}

function getScheduleValidation() {
  if (!state.day) {
    return { valid: false, message: "Choose a date to continue." };
  }

  if (isPastDate(state.day)) {
    return { valid: false, error: true, message: "That date has already passed. Pick today or a future date." };
  }

  if (!state.time) {
    return { valid: false, message: "Choose a time to continue." };
  }

  if (isPastTimeForSelectedDate()) {
    return { valid: false, error: true, message: "That time has already passed today. Pick a later time." };
  }

  return { valid: true, message: "Perfect. Set the date when you're ready." };
}

function isPastTimeForSelectedDate() {
  if (!state.day || !state.time) {
    return false;
  }

  const now = new Date();
  const selectedDate = getDateForDay(state.day);
  const isToday = selectedDate.toDateString() === now.toDateString();

  if (!isToday) {
    return false;
  }

  const parts = timeToParts(state.time);
  const selectedTime = new Date(scheduleYear, scheduleMonth, state.day, parts.hour, parts.minute);
  return selectedTime <= now;
}

function isPastTimeForDate(day, time) {
  if (!day || !time) {
    return false;
  }

  const now = new Date();
  const selectedDate = getDateForDay(day);

  if (selectedDate.toDateString() !== now.toDateString()) {
    return false;
  }

  const parts = timeToParts(time);
  const selectedTime = new Date(scheduleYear, scheduleMonth, day, parts.hour, parts.minute);
  return selectedTime <= now;
}

function refreshTimeAvailability() {
  state.timeButtons.forEach((button, time) => {
    const disabled = isPastTimeForDate(state.day, time);
    button.disabled = disabled;
    button.title = disabled ? "This time has already passed today" : "";

    if (disabled && state.time === time) {
      state.time = null;
      button.classList.remove("selected");
    }
  });
}

function buildCalendar() {
  const startOffset = 1;
  const totalDays = 30;

  for (let i = 0; i < startOffset; i += 1) {
    const blank = document.createElement("span");
    blank.className = "day blank";
    daysGrid.append(blank);
  }

  for (let day = 1; day <= totalDays; day += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "day";
    button.textContent = day;
    button.setAttribute("aria-label", formatDate(day));
    button.disabled = isPastDate(day);

    if (button.disabled) {
      button.title = "This date has already passed";
    }

    button.addEventListener("click", () => {
      if (button.disabled) {
        return;
      }

      state.day = day;
      document.querySelectorAll(".day.selected").forEach((selected) => selected.classList.remove("selected"));
      button.classList.add("selected");
      refreshTimeAvailability();
      validateSchedule();
    });

    daysGrid.append(button);
  }
}

function buildTimes() {
  times.forEach((time) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chip";
    button.textContent = time;
    state.timeButtons.set(time, button);

    button.addEventListener("click", () => {
      if (button.disabled) {
        return;
      }

      state.time = time;
      document.querySelectorAll(".chip.selected").forEach((selected) => selected.classList.remove("selected"));
      button.classList.add("selected");
      validateSchedule();
    });

    timeGrid.append(button);
  });
}

function nudgeNoButton() {
  const card = document.querySelector(".date-card");
  const maxX = Math.max(safeButtonPadding, card.clientWidth - noBtn.offsetWidth - safeButtonPadding);
  const maxY = Math.max(safeButtonPadding, card.clientHeight - noBtn.offsetHeight - safeButtonPadding);
  const x = Math.round(safeButtonPadding + Math.random() * (maxX - safeButtonPadding));
  const y = Math.round(safeButtonPadding + Math.random() * (maxY - safeButtonPadding));

  noBtn.classList.add("runaway");
  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
  noBtn.style.transform = "none";
}

function updateSummary() {
  document.getElementById("summaryDate").textContent = formatDate(state.day);
  document.getElementById("summaryTime").textContent = state.time;
  document.getElementById("summaryFood").textContent = state.food;
}

function timeToParts(time) {
  const match = time.match(/^(\d{1,2}):(\d{2})\s(PM|AM)$/);
  if (!match) {
    return { hour: 20, minute: 0 };
  }

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = match[3];

  if (period === "PM" && hour !== 12) {
    hour += 12;
  }
  if (period === "AM" && hour === 12) {
    hour = 0;
  }

  return { hour, minute };
}

function timeToIcsValue(time, hourOffset = 0) {
  const parts = timeToParts(time);
  const hour = (parts.hour + hourOffset) % 24;
  return `${String(hour).padStart(2, "0")}${String(parts.minute).padStart(2, "0")}00`;
}

function downloadInvite() {
  const date = formatDate(state.day);
  const startTime = timeToIcsValue(state.time);
  const endTime = timeToIcsValue(state.time, 2);
  const contents = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Date Request//Cute Invite//EN",
    "BEGIN:VEVENT",
    "SUMMARY:Date night",
    `DESCRIPTION:${state.food} date. I can't wait to see you!`,
    `DTSTART:202606${String(state.day).padStart(2, "0")}T${startTime}`,
    `DTEND:202606${String(state.day).padStart(2, "0")}T${endTime}`,
    `LOCATION:${state.food}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  const blob = new Blob([contents], { type: "text/calendar" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${date.replaceAll(" ", "-").toLowerCase()}-date-night.ics`;
  link.click();
  URL.revokeObjectURL(link.href);
}

yesBtn.addEventListener("click", () => showPanel("schedule"));
noBtn.addEventListener("mouseenter", nudgeNoButton);
noBtn.addEventListener("focus", nudgeNoButton);
noBtn.addEventListener("click", nudgeNoButton);

foodSelect.addEventListener("change", (event) => {
  state.food = event.target.value;
});

setDateBtn.addEventListener("click", () => {
  if (!getScheduleValidation().valid) {
    validateSchedule();
    return;
  }

  updateSummary();
  showPanel("confirm");
});

resetBtn.addEventListener("click", () => showPanel("schedule"));
calendarBtn.addEventListener("click", downloadInvite);

buildCalendar();
buildTimes();
validateSchedule();
