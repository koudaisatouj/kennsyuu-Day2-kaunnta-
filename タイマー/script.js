const display = document.getElementById("timeDisplay");
const hoursInput = document.getElementById("hours");
const minutesInput = document.getElementById("minutes");
const secondsInput = document.getElementById("seconds");
const quickButtons = document.querySelectorAll(".quick button");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const alarm = document.getElementById("alarmSound");

let timerId = null;
let remainingSeconds = 0;
let lastConfiguredSeconds = 0;
let targetTimestamp = null;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const gatherInputSeconds = () => {
  const hours = clamp(parseInt(hoursInput.value, 10) || 0, 0, 23);
  const minutes = clamp(parseInt(minutesInput.value, 10) || 0, 0, 59);
  const seconds = clamp(parseInt(secondsInput.value, 10) || 0, 0, 59);

  hoursInput.value = hours;
  minutesInput.value = minutes;
  secondsInput.value = seconds;

  return hours * 3600 + minutes * 60 + seconds;
};

const setInputsFromSeconds = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  hoursInput.value = hours;
  minutesInput.value = minutes;
  secondsInput.value = seconds;
};

const format = (value) => String(value).padStart(2, "0");

const updateDisplay = (seconds = remainingSeconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  display.textContent = `${format(hours)} : ${format(minutes)} : ${format(secs)}`;

  const warn = seconds <= 10 && seconds !== 0;
  display.classList.toggle("warning", warn);
};

const updateControls = () => {
  const running = Boolean(timerId);
  startBtn.disabled = running;
  pauseBtn.disabled = !running;
};

const stopTimer = () => {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  updateControls();
};

const finishTimer = () => {
  stopTimer();
  remainingSeconds = 0;
  updateDisplay(0);
  display.classList.add("warning");

  try {
    alarm.currentTime = 0;
    alarm.play();
  } catch (err) {
    console.warn("Alarm playback failed:", err);
  }
};

const tick = () => {
  if (!targetTimestamp) return;
  const diff = Math.max(0, Math.round((targetTimestamp - Date.now()) / 1000));
  remainingSeconds = diff;
  updateDisplay();

  if (diff <= 0) {
    finishTimer();
  }
};

const startTimer = () => {
  if (timerId) return;

  if (remainingSeconds <= 0) {
    const computed = gatherInputSeconds();
    if (computed <= 0) {
      return;
    }
    remainingSeconds = computed;
    lastConfiguredSeconds = computed;
  }

  targetTimestamp = Date.now() + remainingSeconds * 1000;
  updateDisplay();
  tick();
  timerId = setInterval(tick, 250);
  updateControls();
};

const pauseTimer = () => {
  if (!timerId) return;
  stopTimer();
  targetTimestamp = null;
};

const resetTimer = () => {
  stopTimer();
  alarm.pause();
  alarm.currentTime = 0;
  remainingSeconds = lastConfiguredSeconds || gatherInputSeconds();
  updateDisplay(remainingSeconds);
  if (remainingSeconds === 0 && lastConfiguredSeconds === 0) {
    display.classList.remove("warning");
  }
};

const handleQuickSelection = (seconds) => {
  stopTimer();
  lastConfiguredSeconds = seconds;
  remainingSeconds = seconds;
  setInputsFromSeconds(seconds);
  updateDisplay(seconds);
  display.classList.remove("warning");
};

quickButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const total = Number(btn.dataset.seconds) || 0;
    handleQuickSelection(total);
  });
});

const handleInputChange = () => {
  if (timerId) return;
  remainingSeconds = gatherInputSeconds();
  lastConfiguredSeconds = remainingSeconds;
  updateDisplay(remainingSeconds);
  display.classList.remove("warning");
};

[hoursInput, minutesInput, secondsInput].forEach((input) =>
  input.addEventListener("input", handleInputChange)
);

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

window.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    startTimer();
  } else if (event.key === " ") {
    event.preventDefault();
    pauseTimer();
  }
});

// 初期表示
remainingSeconds = gatherInputSeconds();
lastConfiguredSeconds = remainingSeconds;
updateDisplay(remainingSeconds);
updateControls();
