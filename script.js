const burst = document.getElementById("burst");
const musicToggle = document.getElementById("musicToggle");
const sparkles = document.getElementById("sparkles");
const floaters = document.getElementById("floaters");
const restartBtn = document.getElementById("restartBtn");
const restartPanel = document.getElementById("restartPanel");
const flirtyBox = document.getElementById("flirtyBox");
const flirtyToast = document.getElementById("flirtyToast");
const confirmRestartBtn = document.getElementById("confirmRestartBtn");

let audioCtx = null;
let ambientNodes = [];
let musicOn = false;
let surpriseTimers = [];

const flirtyLines = [
  "Hehe caught you pressing again… matlab pasand aa gaya na, my cutuu sa bachaa? 🫣💙",
  "Aww so you liked this love morning too, ahaaa? 🤭💗 My cutuu sa bachaa… one more soft start? ✨",
  "Ufff bilkul… my cutuu sa bachaa wants one more round of butterflies. Ready? 💗💙",
];

function stopAmbient() {
  ambientNodes.forEach((node) => {
    try {
      node.stop();
    } catch (err) {
      /* already stopped */
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
      /* already stopped */
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

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((screen) => {
    const match = screen.id === `screen-${id}`;
    screen.hidden = !match;
    screen.classList.toggle("is-active", match);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (id === "letter") spawnLetterHearts();
  if (id === "surprise") playSurprise();
}

document.querySelectorAll("[data-next]").forEach((btn) => {
  btn.addEventListener("click", () => {
    celebrate(btn);
    showScreen(btn.dataset.next);
  });
});

const feelingReply = document.getElementById("feelingReply");
const toHealth = document.getElementById("toHealth");

document.querySelectorAll("#feelingChoices .choice").forEach((choice) => {
  choice.addEventListener("click", () => {
    document.querySelectorAll("#feelingChoices .choice").forEach((c) => c.classList.remove("is-selected"));
    choice.classList.add("is-selected");
    feelingReply.hidden = false;
    feelingReply.textContent = choice.dataset.reply;
    toHealth.hidden = false;
    celebrate(choice, ["💗", "💙", "✨"]);
  });
});

const healthNudge = document.getElementById("healthNudge");

document.querySelectorAll("#healthCards .health-card").forEach((card) => {
  card.addEventListener("click", () => {
    card.classList.add("is-done");
    healthNudge.hidden = false;
    healthNudge.textContent = card.dataset.msg;
    celebrate(card, ["💧", "💗", "🌸"]);
  });
});

function spawnLetterHearts() {
  const layer = document.querySelector(".letter-hearts");
  if (!layer || layer.dataset.ready) return;
  layer.dataset.ready = "1";
  const bits = ["💗", "💙", "🤍", "🌷", "🌸", "✨"];
  for (let i = 0; i < 10; i += 1) {
    const el = document.createElement("span");
    el.className = "letter-heart";
    el.textContent = bits[i % bits.length];
    el.style.left = `${8 + Math.random() * 84}%`;
    el.style.top = `${Math.random() * 90}%`;
    el.style.animationDelay = `${Math.random() * 2}s`;
    layer.appendChild(el);
  }
}

function clearSurpriseTimers() {
  surpriseTimers.forEach((id) => window.clearTimeout(id));
  surpriseTimers = [];
}

function playSurprise() {
  const s1 = document.getElementById("s1");
  const s2 = document.getElementById("s2");
  const s3 = document.getElementById("s3");
  const bloom = document.getElementById("finaleBloom");

  clearSurpriseTimers();
  s1.hidden = true;
  s2.hidden = true;
  s3.hidden = true;
  bloom.hidden = true;
  restartPanel.hidden = true;
  flirtyBox.hidden = true;
  flirtyToast.textContent = "";

  surpriseTimers.push(
    window.setTimeout(() => {
      s1.hidden = false;
      celebrate(s1, ["🤭", "💗"]);
    }, 200)
  );
  surpriseTimers.push(
    window.setTimeout(() => {
      s2.hidden = false;
    }, 1400)
  );
  surpriseTimers.push(
    window.setTimeout(() => {
      s3.hidden = false;
      bloom.hidden = false;
      bloom.textContent = "💙 💗 ✨ 🌷 🤍";
      celebrate(s3, ["💙", "💗", "✨", "🌷", "🤍"]);
    }, 2800)
  );
  surpriseTimers.push(
    window.setTimeout(() => {
      restartPanel.hidden = false;
    }, 3400)
  );
}

function offerRestart() {
  const line = flirtyLines[Math.floor(Math.random() * flirtyLines.length)];
  restartPanel.hidden = true;
  flirtyToast.textContent = line;
  flirtyBox.hidden = false;
  celebrate(flirtyBox, ["🤭", "💗", "💙", "✨"]);
}

function doRestart() {
  clearSurpriseTimers();

  document.querySelectorAll("#feelingChoices .choice").forEach((c) => c.classList.remove("is-selected"));
  feelingReply.hidden = true;
  feelingReply.textContent = "";
  toHealth.hidden = true;

  document.querySelectorAll("#healthCards .health-card").forEach((c) => c.classList.remove("is-done"));
  healthNudge.hidden = true;
  healthNudge.textContent = "";

  const layer = document.querySelector(".letter-hearts");
  if (layer) {
    layer.innerHTML = "";
    delete layer.dataset.ready;
  }

  document.getElementById("s1").hidden = true;
  document.getElementById("s2").hidden = true;
  document.getElementById("s3").hidden = true;
  document.getElementById("finaleBloom").hidden = true;
  restartPanel.hidden = true;
  flirtyBox.hidden = true;
  flirtyToast.textContent = "";

  celebrate(confirmRestartBtn, ["💗", "🌷", "🤍"]);
  showScreen("welcome");
}

restartBtn.addEventListener("click", offerRestart);
confirmRestartBtn.addEventListener("click", doRestart);

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

function celebrate(el, extras = ["💗", "🌷", "🤍"]) {
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
