const panels = Array.from(document.querySelectorAll(".panel"));
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const daysGrid = document.getElementById("daysGrid");
const timeGrid = document.getElementById("timeGrid");
const setDateBtn = document.getElementById("setDateBtn");
const resetBtn = document.getElementById("resetBtn");
const calendarBtn = document.getElementById("calendarBtn");
const foodSelect = document.getElementById("foodSelect");

const state = {
  day: null,
  time: null,
  food: "Pasta"
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
}

function formatDate(day) {
  const date = new Date(2026, 5, day);
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric"
  }).format(date);
}

function validateSchedule() {
  setDateBtn.disabled = !(state.day && state.time);
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

    button.addEventListener("click", () => {
      state.day = day;
      document.querySelectorAll(".day.selected").forEach((selected) => selected.classList.remove("selected"));
      button.classList.add("selected");
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

    button.addEventListener("click", () => {
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
  const rect = card.getBoundingClientRect();
  const buttonRect = noBtn.getBoundingClientRect();
  const maxX = Math.max(0, rect.width - buttonRect.width - 46);
  const maxY = Math.max(0, rect.height - buttonRect.height - 46);
  const x = Math.round(Math.random() * maxX - maxX / 2);
  const y = Math.round(Math.random() * maxY - maxY / 2);
  noBtn.style.transform = `translate(${x}px, ${y}px) rotate(${Math.random() > 0.5 ? 4 : -4}deg)`;
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
  updateSummary();
  showPanel("confirm");
});

resetBtn.addEventListener("click", () => showPanel("schedule"));
calendarBtn.addEventListener("click", downloadInvite);

buildCalendar();
buildTimes();
