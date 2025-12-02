const STORAGE_KEY = "memoApp:memos";

const elements = {
  memoList: document.getElementById("memoList"),
  newMemoBtn: document.getElementById("newMemoBtn"),
  searchInput: document.getElementById("searchInput"),
  sortChips: document.getElementById("sortChips"),
  filterChips: document.getElementById("filterChips"),
  titleInput: document.getElementById("titleInput"),
  contentInput: document.getElementById("contentInput"),
  saveBtn: document.getElementById("saveBtn"),
  deleteBtn: document.getElementById("deleteBtn"),
  pinToggleBtn: document.getElementById("pinToggleBtn"),
  shareBtn: document.getElementById("shareBtn"),
  statsInfo: document.getElementById("statsInfo"),
  syncTextarea: document.getElementById("syncTextarea"),
  copyDataBtn: document.getElementById("copyDataBtn"),
  importDataBtn: document.getElementById("importDataBtn"),
};

let memos = [];
let selectedMemoId = null;
let currentSort = "updatedDesc";
let currentFilter = "all";

const loadMemos = () => {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(data)) {
      memos = data;
    } else {
      memos = [];
    }
  } catch {
    memos = [];
  }
};

const persist = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memos));
  elements.syncTextarea.value = JSON.stringify(memos);
};

const formatDate = (value) => {
  if (!value) return "--";
  const date = new Date(value);
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(
    date.getDate()
  ).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
};

const getSelectedMemo = () => memos.find((memo) => memo.id === selectedMemoId) || null;

const generateId = () => `memo-${crypto.randomUUID?.() ?? Date.now()}`;

const updateStats = () => {
  const current = getSelectedMemo();
  const length = elements.contentInput.value.length + elements.titleInput.value.length;
  elements.statsInfo.textContent = `${length}文字 ・ 作成日 ${formatDate(
    current?.createdAt
  )} ・ 更新日 ${formatDate(current?.updatedAt)}`;
  elements.pinToggleBtn.textContent = current?.pinned ? "ピン解除" : "ピン留め";
};

const selectMemo = (id) => {
  selectedMemoId = id;
  const memo = getSelectedMemo();
  if (memo) {
    elements.titleInput.value = memo.title;
    elements.contentInput.value = memo.content;
  } else {
    elements.titleInput.value = "";
    elements.contentInput.value = "";
  }
  updateStats();
  renderList();
};

const filteredMemos = () => {
  const query = elements.searchInput.value.trim().toLowerCase();
  const filter = currentFilter;
  const sort = currentSort;

  let list = memos.filter((memo) => {
    const text = `${memo.title} ${memo.content}`.toLowerCase();
    if (query && !text.includes(query)) return false;
    if (filter === "pinned" && !memo.pinned) return false;
    if (filter === "regular" && memo.pinned) return false;
    return true;
  });

  const compareMap = {
    updatedDesc: (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
    updatedAsc: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
    createdDesc: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    createdAsc: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  };
  list = list.sort(compareMap[sort] || compareMap.updatedDesc);

  return list;
};

const renderList = () => {
  elements.memoList.innerHTML = "";
  const list = filteredMemos();
  if (!list.length) {
    const empty = document.createElement("div");
    empty.textContent = "メモはありません。「+ 新しいメモ」から作成してください。";
    empty.style.color = "#93a4c5";
    elements.memoList.appendChild(empty);
    return;
  }

  list.forEach((memo) => {
    const card = document.createElement("article");
    card.className = "memo-card";
    if (memo.id === selectedMemoId) card.classList.add("active");
    card.setAttribute("role", "option");
    card.tabIndex = 0;
    card.innerHTML = `
      <h3>${memo.title || "無題"}</h3>
      <p>${memo.content.slice(0, 60) || "..."}</p>
      <div class="meta">
        <span>更新: ${formatDate(memo.updatedAt)}</span>
        ${memo.pinned ? '<span class="pin-badge">PIN</span>' : ""}
      </div>
    `;
    card.addEventListener("click", () => selectMemo(memo.id));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectMemo(memo.id);
      }
    });
    elements.memoList.appendChild(card);
  });
};

const setActiveChip = (container, key, value) => {
  if (!container) return;
  container.querySelectorAll(".chip").forEach((chip) => {
    const chipValue = chip.dataset[key];
    chip.classList.toggle("active", chipValue === value);
  });
};

const upsertMemo = () => {
  const title = elements.titleInput.value.trim();
  const content = elements.contentInput.value.trim();
  if (!title && !content) {
    alert("タイトルまたは内容を入力してください。");
    return;
  }

  const now = new Date().toISOString();
  if (!selectedMemoId) {
    const newMemo = {
      id: generateId(),
      title,
      content,
      pinned: false,
      createdAt: now,
      updatedAt: now,
    };
    memos.unshift(newMemo);
    selectedMemoId = newMemo.id;
  } else {
    memos = memos.map((memo) =>
      memo.id === selectedMemoId
        ? { ...memo, title, content, updatedAt: now }
        : memo
    );
  }
  persist();
  updateStats();
  renderList();
};

const createMemo = () => {
  const now = new Date().toISOString();
  const memo = {
    id: generateId(),
    title: "新しいメモ",
    content: "",
    pinned: false,
    createdAt: now,
    updatedAt: now,
  };
  memos.unshift(memo);
  persist();
  selectMemo(memo.id);
};

const deleteMemo = () => {
  if (!selectedMemoId) return;
  if (!confirm("このメモを削除しますか？")) return;
  memos = memos.filter((memo) => memo.id !== selectedMemoId);
  selectedMemoId = memos[0]?.id ?? null;
  persist();
  selectMemo(selectedMemoId);
};

const togglePin = () => {
  if (!selectedMemoId) return;
  memos = memos.map((memo) =>
    memo.id === selectedMemoId ? { ...memo, pinned: !memo.pinned } : memo
  );
  persist();
  renderList();
  selectMemo(selectedMemoId);
};

const shareCurrentMemo = async () => {
  const memo = getSelectedMemo();
  if (!memo) return;
  const text = `タイトル: ${memo.title}\n\n${memo.content}`;
  if (navigator.share) {
    try {
      await navigator.share({ title: memo.title || "メモ", text });
    } catch (err) {
      if (err?.name !== "AbortError") {
        console.warn("Share failed:", err);
      }
    }
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    alert("クリップボードにコピーしました。");
  } catch {
    alert("共有に失敗しました。手動でコピーしてください。");
  }
};

const copySyncData = async () => {
  try {
    await navigator.clipboard.writeText(elements.syncTextarea.value);
    alert("全メモのデータをコピーしました。別端末で貼り付けてください。");
  } catch {
    alert("コピーに失敗しました。テキストを選択して手動でコピーしてください。");
  }
};

const importSyncData = () => {
  const text = elements.syncTextarea.value.trim();
  if (!text) {
    alert("貼り付けられたデータがありません。");
    return;
  }
  try {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) {
      throw new Error("Invalid");
    }
    memos = parsed;
    persist();
    selectedMemoId = memos[0]?.id ?? null;
    selectMemo(selectedMemoId);
    alert("同期データを読み込みました。");
  } catch {
    alert("JSON形式のデータではありません。");
  }
};

const init = () => {
  loadMemos();
  if (!memos.length) {
    createMemo();
  } else {
    persist();
    selectMemo(memos[0].id);
  }
  renderList();
  updateStats();

  elements.newMemoBtn.addEventListener("click", createMemo);
  elements.saveBtn.addEventListener("click", upsertMemo);
  elements.deleteBtn.addEventListener("click", deleteMemo);
  elements.pinToggleBtn.addEventListener("click", togglePin);
  elements.shareBtn.addEventListener("click", shareCurrentMemo);
  elements.copyDataBtn.addEventListener("click", copySyncData);
  elements.importDataBtn.addEventListener("click", importSyncData);
  elements.sortChips.addEventListener("click", (event) => {
    const chip = event.target.closest(".chip");
    if (!chip || !chip.dataset.sort) return;
    currentSort = chip.dataset.sort;
    setActiveChip(elements.sortChips, "sort", currentSort);
    renderList();
  });
  elements.filterChips.addEventListener("click", (event) => {
    const chip = event.target.closest(".chip");
    if (!chip || !chip.dataset.filter) return;
    currentFilter = chip.dataset.filter;
    setActiveChip(elements.filterChips, "filter", currentFilter);
    renderList();
  });

  [elements.titleInput, elements.contentInput].forEach((input) =>
    input.addEventListener("input", () => {
      updateStats();
    })
  );

  elements.contentInput.addEventListener("blur", () => {
    if (selectedMemoId) {
      upsertMemo();
    }
  });
  elements.titleInput.addEventListener("blur", () => {
    if (selectedMemoId) {
      upsertMemo();
    }
  });

  elements.searchInput.addEventListener("input", renderList);
  elements.searchInput.addEventListener("change", renderList);

  elements.syncTextarea.addEventListener("input", () => {
    // keep text accessible, no-op
  });

  setActiveChip(elements.sortChips, "sort", currentSort);
  setActiveChip(elements.filterChips, "filter", currentFilter);
};

document.addEventListener("DOMContentLoaded", init);
