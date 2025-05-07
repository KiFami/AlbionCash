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
  
  const spinAudio = document.getElementById("spinSound");
  spinAudio.currentTime = 0;
  spinAudio.play();
  setTimeout(() => spinAudio.pause(), 10000);

  resultEl.textContent = "Losowanie...";
  scrollStrip.innerHTML = "";

  const reward = getRandomItem(box.items);

  const itemsForScroll = [];

  const preItems = 20;
  const postItems = 20;

  for (let i = 0; i < preItems; i++) {
    const random = box.items[Math.floor(Math.random() * box.items.length)];
    itemsForScroll.push(random);
  }

  itemsForScroll.push(reward); // środek

  for (let i = 0; i < postItems; i++) {
    const random = box.items[Math.floor(Math.random() * box.items.length)];
    itemsForScroll.push(random);
  }

  // Renderowanie elementów
  itemsForScroll.forEach(item => {
    const el = document.createElement("div");
    el.className = `item ${getRarityClass(item.chance)}`;
    el.textContent = item.name;
    scrollStrip.appendChild(el);
  });


  const containerWidth = document.getElementById("scrollContainer").offsetWidth;
  const itemWidth = 100;
  const centerIndex = preItems; // nagroda w środku
  const totalOffset = centerIndex * itemWidth - containerWidth / 2 + itemWidth / 2;

  scrollStrip.style.transition = "none";
  scrollStrip.style.transform = "translateX(0)";
  void scrollStrip.offsetWidth; // wymuszenie reflow
  scrollStrip.style.transition = "transform 10s cubic-bezier(0.1, 0.9, 0.2, 1)";
  scrollStrip.style.transform = `translateX(-${totalOffset}px)`;

  setTimeout(() => {
    document.getElementById("dropSound").play();
    resultEl.innerHTML = `🎉 Wylosowano: <strong>${reward.name}</strong>`;
    inventory.unshift(reward);
    updateInventory();
  }, 9500); // 9,5 sekund całkowitej animacji
  
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
    void scrollStrip.offsetWidth;
    scrollStrip.style.transition = "transform 2s ease-out";
    roll(type);
  });
});

document.getElementById("resetBtn").addEventListener("click", () => {
  if (confirm("Na pewno zresetować grę?")) {
    silver = 5000000;
    inventory = [];
    localStorage.clear();
    updateSilverDisplay();
    updateInventory();
    resultEl.textContent = "";
  }
});

window.addEventListener("load", () => {
  updateSilverDisplay();
  updateInventory();
});

function getRarityClass(chance) {
  if (chance <= 5) return "legendary";
  if (chance <= 15) return "epic";
  if (chance <= 30) return "rare";
  return "common";
}
