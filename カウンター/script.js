const countDisplay = document.getElementById("countDisplay");
const incrementBtn = document.getElementById("incrementBtn");
const decrementBtn = document.getElementById("decrementBtn");
const resetBtn = document.getElementById("resetBtn");
const saveBtn = document.getElementById("saveBtn");
const historyListElement = document.getElementById("historyList");

const STORAGE_KEY = "counterValue";
const HISTORY_STORAGE_KEY = "counterHistory";
const HISTORY_LIMIT = 10;
const AUTO_INTERVAL_MS = 120;

let count = 0;
let historyEntries = [];
let autoIncrementTimerId = null;
let autoDecrementTimerId = null;
let shouldSkipIncrementClick = false;
let shouldSkipDecrementClick = false;

function updateCountDisplay() {
  if (!countDisplay) return;
  countDisplay.textContent = String(count);
}

function updateHistoryDisplay() {
  if (!historyListElement) return;
  historyListElement.innerHTML = "";
  const fragment = document.createDocumentFragment();
  historyEntries.forEach((entry) => {
    const li = document.createElement("li");
    const valueSpan = document.createElement("span");
    valueSpan.textContent = `${entry.value}`;
    const time = document.createElement("time");
    const date = new Date(entry.at);
    time.dateTime = date.toISOString();
    time.textContent = Number.isNaN(date.getTime())
      ? entry.at
      : date.toLocaleTimeString("ja-JP", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
    li.append(valueSpan, time);
    fragment.appendChild(li);
  });
  historyListElement.appendChild(fragment);
}

function saveHistoryToStorage() {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(historyEntries));
  } catch {
    // localStorage が無効な場合は無視する
  }
}

function addHistoryRecord(newValue) {
  const entry = {
    value: newValue,
    at: new Date().toISOString(),
  };
  historyEntries.unshift(entry);
  if (historyEntries.length > HISTORY_LIMIT) {
    historyEntries = historyEntries.slice(0, HISTORY_LIMIT);
  }
  updateHistoryDisplay();
  saveHistoryToStorage();
}

function loadHistoryFromStorage() {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) {
      historyEntries = [];
    } else {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        historyEntries = parsed
          .map((entry) => ({
            value: Number(entry.value),
            at:
              typeof entry.at === "string"
                ? entry.at
                : new Date().toISOString(),
          }))
          .filter((entry) => Number.isFinite(entry.value))
          .slice(0, HISTORY_LIMIT);
      } else {
        historyEntries = [];
      }
    }
  } catch {
    historyEntries = [];
  }
  updateHistoryDisplay();
}

function setCount(newValue) {
  count = newValue;
  updateCountDisplay();
}

function incrementCount() {
  setCount(count + 1);
}

function decrementCount() {
  setCount(count - 1);
}

function resetCount() {
  setCount(0);
}

function loadCountFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored !== null ? Number(stored) : 0;
    setCount(Number.isFinite(parsed) ? parsed : 0);
  } catch {
    setCount(0);
  }
}

function saveCountToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, String(count));
  } catch {
    // localStorage が無効な場合は無視
  }
}

function handleSaveAction() {
  saveCountToStorage();
  addHistoryRecord(count);
}

function startAutoIncrement() {
  if (autoIncrementTimerId) return;
  shouldSkipIncrementClick = true;
  incrementCount();
  autoIncrementTimerId = setInterval(incrementCount, AUTO_INTERVAL_MS);
}

function stopAutoIncrement() {
  if (autoIncrementTimerId) {
    clearInterval(autoIncrementTimerId);
    autoIncrementTimerId = null;
  }
  if (shouldSkipIncrementClick) {
    setTimeout(() => {
      shouldSkipIncrementClick = false;
    }, 0);
  }
}

function startAutoDecrement() {
  if (autoDecrementTimerId) return;
  shouldSkipDecrementClick = true;
  decrementCount();
  autoDecrementTimerId = setInterval(decrementCount, AUTO_INTERVAL_MS);
}

function stopAutoDecrement() {
  if (autoDecrementTimerId) {
    clearInterval(autoDecrementTimerId);
    autoDecrementTimerId = null;
  }
  if (shouldSkipDecrementClick) {
    setTimeout(() => {
      shouldSkipDecrementClick = false;
    }, 0);
  }
}

function setupCounterButtons() {
  if (incrementBtn) {
    incrementBtn.addEventListener("click", () => {
      if (shouldSkipIncrementClick) {
        shouldSkipIncrementClick = false;
        return;
      }
      incrementCount();
    });
    incrementBtn.addEventListener("mousedown", startAutoIncrement);
    incrementBtn.addEventListener("mouseup", stopAutoIncrement);
    incrementBtn.addEventListener("mouseleave", stopAutoIncrement);
  }
  if (decrementBtn) {
    decrementBtn.addEventListener("click", () => {
      if (shouldSkipDecrementClick) {
        shouldSkipDecrementClick = false;
        return;
      }
      decrementCount();
    });
    decrementBtn.addEventListener("mousedown", startAutoDecrement);
    decrementBtn.addEventListener("mouseup", stopAutoDecrement);
    decrementBtn.addEventListener("mouseleave", stopAutoDecrement);
  }
  if (resetBtn) {
    resetBtn.addEventListener("click", resetCount);
  }
  if (saveBtn) {
    saveBtn.addEventListener("click", handleSaveAction);
  }

  document.addEventListener("mouseup", () => {
    stopAutoIncrement();
    stopAutoDecrement();
  });
}

loadHistoryFromStorage();
loadCountFromStorage();
setupCounterButtons();
updateCountDisplay();
