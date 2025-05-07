const silverEl = document.getElementById("silver");
const resultEl = document.getElementById("result");
const inventoryList = document.getElementById("inventoryList");
const scrollStrip = document.getElementById("scrollStrip");

const BOXES = {
  common: {
    cost: 1000000,
    items: [
      { name: "T4 Broń", value: 400000, chance: 50 },
      { name: "T6 Zbroja", value: 700000, chance: 30 },
      { name: "T8 Mount", value: 1200000, chance: 15 },
      { name: "Reliktowy Artefakt", value: 3000000, chance: 5 },
    ]
  },
  epic: {
    cost: 3000000,
    items: [
      { name: "T8 Mount", value: 1200000, chance: 30 },
      { name: "Premium Chest", value: 4500000, chance: 40 },
      { name: "Reliktowy Artefakt", value: 3000000, chance: 20 },
      { name: "Ekskluzywny Skin", value: 6000000, chance: 10 },
    ]
  },
  legendary: {
    cost: 6000000,
    items: [
      { name: "Ekskluzywny Skin", value: 6000000, chance: 40 },
      { name: "Legendarna Broń", value: 8000000, chance: 30 },
      { name: "Mega Mount", value: 10000000, chance: 20 },
      { name: "Unikalny Tytuł", value: 20000000, chance: 10 },
    ]
  }
};

let silver = parseInt(localStorage.getItem("silver") || "5000000");
let inventory = JSON.parse(localStorage.getItem("inventory") || "[]");

function updateSilverDisplay() {
  silverEl.textContent = silver.toLocaleString();
  localStorage.setItem("silver", silver);
}

function updateInventory() {
  inventoryList.innerHTML = "";
  inventory.forEach((item, index) => {
    const li = document.createElement("li");
    li.innerHTML = `${item.name} — <strong>${item.value.toLocaleString()} srebra</strong>`;
    const sellBtn = document.createElement("button");
    sellBtn.textContent = "Sprzedaj";
    sellBtn.onclick = () => {
      silver += item.value;
      inventory.splice(index, 1);
      updateSilverDisplay();
      updateInventory();
    };
    li.appendChild(sellBtn);
    inventoryList.appendChild(li);
  });
  localStorage.setItem("inventory", JSON.stringify(inventory));
}

function roll(boxType) {
  const box = BOXES[boxType];
  if (silver < box.cost) {
    resultEl.textContent = "❌ Za mało srebra!";
    return;
  }

  silver -= box.cost;
  updateSilverDisplay();
  resultEl.textContent = "Losowanie...";

  // Dodajemy strzałkę
  const arrow = document.createElement("div");
  arrow.classList.add("arrow");
  arrow.innerHTML = "⏩";
  scrollStrip.appendChild(arrow);

  // Tworzymy powtarzający się pasek scrolla
  const itemsForScroll = [];
  const totalItems = 30; // Liczba przedmiotów w scrollu
  for (let i = 0; i < totalItems; i++) {
    const randomItem = getRandomItem(box.items);
    itemsForScroll.push(randomItem);
    const el = document.createElement("div");
    el.className = "item";
    el.textContent = randomItem.name;
    scrollStrip.appendChild(el);
  }

  // Ustawienie animacji, aby przewijało się w nieskończoność
  setTimeout(() => {
    const reward = getRandomItem(box.items);
    resultEl.innerHTML = `🎉 Wylosowano: <strong>${reward.name}</strong>`;
    inventory.unshift(reward);
    updateInventory();

    // Usuwamy strzałkę po zakończeniu animacji
    scrollStrip.removeChild(arrow);
  }, 2000);
}

function getRandomItem(pool) {
  const rand = Math.random() * 100;
  let cumulative = 0;
  for (const item of pool) {
    cumulative += item.chance;
    if (rand <= cumulative) return item;
  }
  return pool[pool.length - 1];
}

document.querySelectorAll(".box-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const type = btn.dataset.box;
    scrollStrip.style.transition = "none";
    scrollStrip.style.transform = "translateX(0)";
    void scrollStrip.offsetWidth;  // Restartujemy animację
    scrollStrip.style.transition = "transform 2s ease-out";
    roll(type);
  });
});

window.addEventListener("load", () => {
  updateSilverDisplay();
  updateInventory();
});
