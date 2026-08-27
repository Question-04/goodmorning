const burst = document.getElementById("burst");
const musicToggle = document.getElementById("musicToggle");
const sparkles = document.getElementById("sparkles");
const floaters = document.getElementById("floaters");
const jarList = document.getElementById("jarList");
const jarCount = document.getElementById("jarCount");
const toMoments = document.getElementById("toMoments");
const toLetter = document.getElementById("toLetter");
const momentProgress = document.getElementById("momentProgress");
const envelopeBtn = document.getElementById("envelopeBtn");
const loveLetter = document.getElementById("loveLetter");
const finale = document.getElementById("finale");
const restartBtn = document.getElementById("restartBtn");
const flirtyBox = document.getElementById("flirtyBox");
const flirtyToast = document.getElementById("flirtyToast");
const confirmRestartBtn = document.getElementById("confirmRestartBtn");

let audioCtx = null;
let ambientNodes = [];
let musicOn = false;
const planted = new Set();
const openedMoments = new Set();
const litStars = new Set();

const flirtyLines = [
  "Hehe caught you pressing again… matlab pasand aa gaya na, my cutuu sa bachaa? 🫣💙",
  "Aww so you liked this love morning too, ahaaa? 🤭💗 My cutuu sa bachaa… one more soft start? ✨",
  "Ufff bilkul… my cutuu sa bachaa wants one more round of butterflies. Ready? 💗💙",
];

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((screen) => {
    const match = screen.id === `screen-${id}`;
    screen.hidden = !match;
    screen.classList.toggle("is-active", match);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll("[data-go]").forEach((btn) => {
  btn.addEventListener("click", () => {
    celebrate(btn);
    showScreen(btn.dataset.go);
  });
});

/* Wish garden */
document.querySelectorAll(".petal").forEach((petal) => {
  petal.addEventListener("click", () => {
    if (planted.has(petal) || planted.size >= 3) return;
    planted.add(petal);
    petal.classList.add("is-picked");
    const li = document.createElement("li");
    li.textContent = petal.dataset.wish;
    jarList.appendChild(li);
    jarCount.textContent = `${planted.size} / 3 planted`;
    celebrate(petal, ["🌸", "💗", "💙"]);
    if (planted.size >= 3) toMoments.hidden = false;
  });
});

/* Soft moments */
document.querySelectorAll(".flip-card").forEach((card, index) => {
  card.addEventListener("click", () => {
    if (card.classList.contains("is-open")) return;
    card.classList.add("is-open");
    card.dataset.done = "true";
    openedMoments.add(index);
    momentProgress.textContent = `${openedMoments.size} / 4 opened`;
    celebrate(card, ["🫧", "💗", "✨"]);
    if (openedMoments.size >= 4) toLetter.hidden = false;
  });
});

/* Envelope letter */
envelopeBtn.addEventListener("click", () => {
  celebrate(envelopeBtn, ["💌", "💙", "💗"]);
  envelopeBtn.hidden = true;
  loveLetter.hidden = false;
});

/* Constellation */
document.querySelectorAll(".star-heart").forEach((star, index) => {
  star.addEventListener("click", () => {
    if (star.classList.contains("is-lit")) return;
    star.classList.add("is-lit");
    litStars.add(index);
    celebrate(star, ["✨", "💗", "💙"]);
    if (litStars.size >= 5) {
      finale.hidden = false;
      celebrate(finale, ["💙", "💗", "✨", "🌷", "🤍"]);
    }
  });
});

/* Restart */
restartBtn.addEventListener("click", () => {
  const line = flirtyLines[Math.floor(Math.random() * flirtyLines.length)];
  flirtyToast.textContent = line;
  flirtyBox.hidden = false;
  restartBtn.hidden = true;
  celebrate(flirtyBox, ["🤭", "💗", "💙"]);
});

confirmRestartBtn.addEventListener("click", () => {
  planted.clear();
  openedMoments.clear();
  litStars.clear();
  jarList.innerHTML = "";
  jarCount.textContent = "0 / 3 planted";
  toMoments.hidden = true;
  toLetter.hidden = true;
  momentProgress.textContent = "0 / 4 opened";
  document.querySelectorAll(".petal").forEach((p) => p.classList.remove("is-picked"));
  document.querySelectorAll(".flip-card").forEach((c) => {
    c.classList.remove("is-open");
    c.dataset.done = "false";
  });
  document.querySelectorAll(".star-heart").forEach((s) => s.classList.remove("is-lit"));
  envelopeBtn.hidden = false;
  loveLetter.hidden = true;
  finale.hidden = true;
  flirtyBox.hidden = true;
  flirtyToast.textContent = "";
  restartBtn.hidden = false;
  celebrate(confirmRestartBtn, ["💗", "💙", "✨"]);
  showScreen("welcome");
});

/* Music */
function stopAmbient() {
  ambientNodes.forEach((node) => {
    try {
      node.stop();
    } catch (err) {
      /* noop */
    }
  });
  ambientNodes = [];
  musicOn = false;
  musicToggle.querySelector(".music-icon").textContent = "🔇";
  musicToggle.setAttribute("aria-pressed", "false");
}

function startAmbient() {
  audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
  ambientNodes.forEach((node) => {
    try {
      node.stop();
    } catch (err) {
      /* noop */
    }
  });
  ambientNodes = [];
  const master = audioCtx.createGain();
  master.gain.value = 0.03;
  master.connect(audioCtx.destination);
  [261.63, 329.63, 392.0, 523.25].forEach((freq, index) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.value = 0.18 - index * 0.03;
    osc.connect(gain).connect(master);
    osc.start();
    ambientNodes.push(osc);
  });
  musicOn = true;
  musicToggle.querySelector(".music-icon").textContent = "🔊";
  musicToggle.setAttribute("aria-pressed", "true");
}

musicToggle.addEventListener("click", () => {
  try {
    if (musicOn) stopAmbient();
    else startAmbient();
  } catch (err) {
    stopAmbient();
  }
});

function decorate() {
  sparkles.innerHTML = "";
  floaters.innerHTML = "";
  const count = window.innerWidth < 700 ? 10 : 18;
  for (let i = 0; i < count; i += 1) {
    const star = document.createElement("span");
    star.className = "sparkle";
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 70}%`;
    star.style.animationDelay = `${Math.random() * 3}s`;
    sparkles.appendChild(star);
  }
  const glyphs = ["🌷", "💗", "💙", "🤍", "🌸", "✨"];
  for (let i = 0; i < 7; i += 1) {
    const f = document.createElement("span");
    f.className = "floater";
    f.textContent = glyphs[i % glyphs.length];
    f.style.left = `${8 + Math.random() * 84}%`;
    f.style.top = `${15 + Math.random() * 55}%`;
    f.style.animationDelay = `${Math.random() * 4}s`;
    floaters.appendChild(f);
  }
}

function celebrate(el, extras = ["💗", "💙", "✨"]) {
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  for (let i = 0; i < 8; i += 1) {
    const bit = document.createElement("span");
    bit.className = "burst-bit";
    bit.textContent = extras[i % extras.length];
    bit.style.left = `${cx}px`;
    bit.style.top = `${cy}px`;
    const angle = (Math.PI * 2 * i) / 8;
    bit.style.setProperty("--dx", `${Math.cos(angle) * (40 + Math.random() * 50)}px`);
    bit.style.setProperty("--dy", `${Math.sin(angle) * (40 + Math.random() * 50) - 30}px`);
    burst.appendChild(bit);
    window.setTimeout(() => bit.remove(), 1600);
  }
}

decorate();
window.addEventListener("resize", decorate);
