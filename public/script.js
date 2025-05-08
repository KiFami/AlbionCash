import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Supabase URL and Key
const supabaseUrl = 'https://azdsuizsbuyhzlwjusgc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6ZHN1aXpzYnV5aHpsd2p1c2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MTcyMzAsImV4cCI6MjA2MjI5MzIzMH0.mDfClTvcVHN99ta3Iyz6EAnGRTsuFscMprggcHlvjcw';
const supabase = createClient(supabaseUrl, supabaseKey);

// Initial Data
let currentUser = null;
let silver = 5000000; // Start with 5,000,000 silver
let inventory = [];

// DOM Elements
const silverEl = document.getElementById("silver");
const resultEl = document.getElementById("result");
const inventoryList = document.getElementById("inventoryList");
const scrollStrip = document.getElementById("scrollStrip");

async function login() {
  const nickname = document.getElementById("nicknameInput").value.trim();
  const password = document.getElementById("passwordInput").value;
  const errorBox = document.getElementById("loginError");

  if (!nickname || !password) {
    errorBox.textContent = "Podaj nickname i hasło.";
    return;
  }

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("nickname", nickname)
    .eq("password", password)
    .single();

  if (error || !data) {
    errorBox.textContent = "Nieprawidłowy nickname lub hasło.";
    return;
  }

  // Ukryj formularz logowania
  document.getElementById("loginBox").style.display = "none";
  errorBox.textContent = "";
  alert(`Zalogowano jako ${data.nickname}`);
  document.getElementById("gameUI").style.display = "block";
  currentUser = data;
  silver = data.silver || 0;
  try {
    inventory = data.inventory;
    if (!Array.isArray(inventory)) throw new Error("Nie tablica");
  } catch (e) {
    console.warn("Niepoprawny format inventory. Ustawiam pustą tablicę.");
    inventory = [];
  }
  updateSilverDisplay();
  updateInventory();
}

window.login = login;


// Box Types and Item Definitions
const BOXES = {
  common: {
    cost: 500000,
    items: [
      { name: "T1 Sakwa", value: 200000, chance: 50 },
      { name: "T2 Sakwa", value: 300000, chance: 30 },
      { name: "T3 Sakwa", value: 400000, chance: 10 },
      { name: "T4 Sakwa", value: 500000, chance: 5 },
      { name: "T5 Sakwa", value: 600000, chance: 2 },
      { name: "T6 Sakwa", value: 800000, chance: 1 },
      { name: "T7 Sakwa", value: 1000000, chance: 0.5 },
      { name: "T8 Sakwa", value: 1200000, chance: 0.5 }
    ]
  },
  epic: {
    cost: 1000000,
    items: [
      { name: "T1 Sakwa", value: 300000, chance: 5 },
      { name: "T2 Sakwa", value: 500000, chance: 10 },
      { name: "T3 Sakwa", value: 700000, chance: 15 },
      { name: "T4 Sakwa", value: 900000, chance: 20 },
      { name: "T5 Sakwa", value: 1200000, chance: 20 },
      { name: "T6 Sakwa", value: 1500000, chance: 15 },
      { name: "T7 Sakwa", value: 2000000, chance: 10 },
      { name: "T8 Sakwa", value: 2500000, chance: 5 }
    ]
  },
  legendary: {
    cost: 3000000,
    items: [
      { name: "T1 Sakwa", value: 500000, chance: 5 },
      { name: "T2 Sakwa", value: 800000, chance: 5 },
      { name: "T3 Sakwa", value: 1200000, chance: 5 },
      { name: "T4 Sakwa", value: 1600000, chance: 10 },
      { name: "T5 Sakwa", value: 2000000, chance: 10 },
      { name: "T6 Sakwa", value: 3000000, chance: 10 },
      { name: "T7 Sakwa", value: 5000000, chance: 5 },
      { name: "T8 Sakwa", value: 10000000, chance: 5 }
    ]
  }
};



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
    el.className = `item ${getRarityClass(item.name)}`;
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


function getRarityClass(name) {
  if (name.includes("T8 Sakwa")) return "mythicT8";
  if (name.includes("T7 Sakwa")) return "legendaryT7";
  if (name.includes("T6 Sakwa")) return "epicT6";
  if (name.includes("T5 Sakwa")) return "rareT5";
  if (name.includes("T4 Sakwa")) return "legendary";
  if (name.includes("T3 Sakwa")) return "epic";
  if (name.includes("T2 Sakwa")) return "rare"; 
  return "common"; // T1 lub inne
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


window.addEventListener("load", () => {
  updateSilverDisplay();
  updateInventory();
});

document.querySelectorAll(".info-toggle").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = document.getElementById(btn.dataset.target);
    target.classList.toggle("hidden");
  });
});

function updateSilverDisplay() {
  silverEl.textContent = silver.toLocaleString();

  if (currentUser) {
    supabase
      .from("users")
      .update({ silver })
      .eq("nickname", currentUser.nickname);
  }
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

  if (currentUser) {
    supabase
      .from("users")
      .update({ inventory })
      .eq("nickname", currentUser.nickname);
  }
}

window.addEventListener("beforeunload", saveUserData);
window.addEventListener("unload", saveUserData);
window.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    saveUserData();
  }
});
setInterval(saveUserData, 10000);

function saveUserData() {
  if (!currentUser) return;

  supabase
    .from("users")
    .update({
      silver: silver,
      inventory: inventory,
    })
    .eq("nickname", currentUser.nickname)
    .then(({ error }) => {
      if (error) {
        console.error("❌ Błąd zapisu do Supabase:", error.message);
      } else {
        console.log("✅ Dane zapisane do Supabase");
      }
    });
}

function populateBoxInfos() {
  for (const [boxType, boxData] of Object.entries(BOXES)) {
    const infoDiv = document.getElementById(`info-${boxType}`);
    if (!infoDiv) continue;

    infoDiv.innerHTML = boxData.items.map(item => {
      return `<span><strong>${item.name}</strong> — Wartość: ${item.value.toLocaleString()}, Szansa: ${item.chance}%</span>`;
    }).join('');
  }
}

// Wywołaj po załadowaniu UI
populateBoxInfos();
