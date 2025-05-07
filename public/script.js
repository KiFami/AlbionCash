const resultEl = document.getElementById("result");
const historyList = document.getElementById("historyList");
const silverEl = document.getElementById("silver");

const COST = 1000000;
const START_SILVER = 5000000;

const rewards = [
  { name: "T8 Mount", chance: 5 },
  { name: "Premium Chest", chance: 10 },
  { name: "Zwrot srebra", chance: 30 },
  { name: "Pusta skrzynka", chance: 55 }
];

function getSilver() {
  return parseInt(localStorage.getItem("silver") || START_SILVER);
}

function setSilver(value) {
  localStorage.setItem("silver", value);
  silverEl.innerText = value.toLocaleString();
}

function getHistory() {
  return JSON.parse(localStorage.getItem("history") || "[]");
}

function addToHistory(entry) {
  const history = getHistory();
  history.unshift(entry);
  localStorage.setItem("history", JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const history = getHistory();
  historyList.innerHTML = history
    .map(item => `<li>${item}</li>`)
    .join("");
}

document.getElementById("openBtn").addEventListener("click", () => {
  let silver = getSilver();
  if (silver < COST) {
    resultEl.innerHTML = "❌ Za mało srebra!";
    return;
  }

  resultEl.innerHTML = "Losowanie...";
  resultEl.classList.add("spinning");

  setTimeout(() => {
    const roll = Math.random() * 100;
    let cumulative = 0;
    let reward = "Pusta skrzynka";
    for (const r of rewards) {
      cumulative += r.chance;
      if (roll <= cumulative) {
        reward = r.name;
        break;
      }
    }

    silver -= COST;
    setSilver(silver);
    addToHistory(`🎁 ${new Date().toLocaleTimeString()} — ${reward}`);
    resultEl.classList.remove("spinning");
    resultEl.innerHTML = `🎁 Wylosowano: <strong>${reward}</strong>`;
  }, 2000);
});

document.getElementById("resetBtn").addEventListener("click", () => {
  localStorage.clear();
  setSilver(START_SILVER);
  renderHistory();
  resultEl.innerHTML = "";
});

window.addEventListener("load", () => {
  setSilver(getSilver());
  renderHistory();
});
