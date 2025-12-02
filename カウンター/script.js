const countDisplay = document.getElementById("countDisplay");
const incrementBtn = document.getElementById("incrementBtn");
const decrementBtn = document.getElementById("decrementBtn");
const resetBtn = document.getElementById("resetBtn");
const customStepInput = document.getElementById("customStep");
const applyStepBtn = document.getElementById("applyStep");
const historyList = document.getElementById("historyList");
const saveBtn = document.getElementById("saveBtn");
const quickActionButtons = document.querySelectorAll(".extras .extra-btn[data-step]");

let count = 0;
let step = 1;

function updateCountDisplay() {
  if (!countDisplay) return;
  countDisplay.textContent = count.toLocaleString("ja-JP");
}

function recordHistory(label) {
  if (!historyList) return;
  const now = new Date();
  const item = document.createElement("li");
  const action = document.createElement("span");
  action.textContent = `${label} -> ${count}`;
  const time = document.createElement("time");
  time.dateTime = now.toISOString();
  time.textContent = now.toLocaleTimeString("ja-JP", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  item.append(action, time);
  historyList.prepend(item);
  const maxEntries = 10;
  while (historyList.children.length > maxEntries) {
    historyList.removeChild(historyList.lastChild);
  }
}

function changeCount(delta, label) {
  count += delta;
  updateCountDisplay();
  const historyLabel = label ?? (delta >= 0 ? `+${delta}` : `${delta}`);
  recordHistory(historyLabel);
}

function applyStepValue() {
  if (!customStepInput) return;
  const value = parseInt(customStepInput.value, 10);
  if (!Number.isFinite(value) || value <= 0) {
    customStepInput.value = step;
    return;
  }
  step = value;
  if (incrementBtn) {
    incrementBtn.textContent = `+${step}`;
  }
  if (decrementBtn) {
    decrementBtn.textContent = `-${step}`;
  }
}

if (incrementBtn) {
  incrementBtn.addEventListener("click", () => changeCount(step, `+${step}`));
}

if (decrementBtn) {
  decrementBtn.addEventListener("click", () => changeCount(-step, `-${step}`));
}

if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    count = 0;
    updateCountDisplay();
    recordHistory("Reset");
  });
}

if (applyStepBtn) {
  applyStepBtn.addEventListener("click", applyStepValue);
}

quickActionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const delta = parseInt(button.dataset.step ?? "0", 10);
    if (!Number.isFinite(delta) || delta === 0) return;
    changeCount(delta);
  });
});

if (saveBtn) {
  saveBtn.addEventListener("click", () => recordHistory("Save"));
}

updateCountDisplay();
