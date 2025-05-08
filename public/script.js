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
      { name: "T8 Mount", value: 1200000, chance: 50 },
      { name: "Premium Chest", value: 4500000, chance: 30 },
      { name: "Reliktowy Artefakt", value: 3000000, chance: 15 },
      { name: "Ekskluzywny Skin", value: 6000000, chance: 5 },
    ]
  },
  legendary: {
    cost: 6000000,
    items: [
      { name: "Ekskluzywny Skin", value: 6000000, chance: 50 },
      { name: "Legendarna Broń", value: 8000000, chance: 30 },
      { name: "Mega Mount", value: 10000000, chance: 15 },
      { name: "Unikalny Tytuł", value: 20000000, chance: 5 },
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

function getRarityClass(chance) {
  if (chance <= 5) return "legendary";
  if (chance <= 15) return "epic";
  if (chance <= 30) return "rare";
  return "common";
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
