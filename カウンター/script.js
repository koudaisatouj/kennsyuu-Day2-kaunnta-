const countDisplay = document.getElementById("countDisplay");
const incrementBtn = document.getElementById("incrementBtn");
const decrementBtn = document.getElementById("decrementBtn");
const resetBtn = document.getElementById("resetBtn");
const saveBtn = document.getElementById("saveBtn");

const STORAGE_KEY = "counterValue";
let count = 0;

function updateCountDisplay() {
  if (!countDisplay) return;
  countDisplay.textContent = String(count);
}

function setCount(newValue) {
  count = newValue;
  updateCountDisplay();
}

function incrementCount() {
  setCount(count + 1);
  saveCountToStorage();
}

function decrementCount() {
  setCount(count - 1);
  saveCountToStorage();
}

function resetCount() {
  setCount(0);
  saveCountToStorage();
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

function setupCounterButtons() {
  if (incrementBtn) {
    incrementBtn.addEventListener("click", incrementCount);
  }
  if (decrementBtn) {
    decrementBtn.addEventListener("click", decrementCount);
  }
  if (resetBtn) {
    resetBtn.addEventListener("click", resetCount);
  }
  if (saveBtn) {
    saveBtn.addEventListener("click", saveCountToStorage);
  }
}

loadCountFromStorage();
setupCounterButtons();
updateCountDisplay();
