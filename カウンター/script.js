const countDisplay = document.getElementById("countDisplay");
const incrementBtn = document.getElementById("incrementBtn");
const decrementBtn = document.getElementById("decrementBtn");
const resetBtn = document.getElementById("resetBtn");

let count = 0;

function updateCountDisplay() {
  if (!countDisplay) return;
  countDisplay.textContent = String(count);
}

function incrementCount() {
  count += 1;
  updateCountDisplay();
}

function decrementCount() {
  count -= 1;
  updateCountDisplay();
}

function resetCount() {
  count = 0;
  updateCountDisplay();
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
}

setupCounterButtons();
updateCountDisplay();
