const world = document.querySelector(".world");
const stars = document.querySelector(".stars");
const hearts = document.querySelector(".hearts");
const envelope = document.querySelector(".envelope");
const note = document.querySelector(".note");
const moon = document.querySelector(".moon-wrap");
const kitten = document.querySelector(".kitten");
const orchidBed = document.querySelector(".orchid-bed");
const speech = document.querySelector(".speech");
const guide = document.querySelector(".guide");
const guideText = document.querySelector(".guide-text");
const wishDate = document.querySelector(".wish-date");
const tapBar = document.querySelector(".tap-bar");
const tapBarLabel = document.querySelector(".tap-bar-label");
const heartSlots = [...document.querySelectorAll(".heart-slot")];

const prompts = {
  moon: "psst... tap the sleepy moon",
  kitten: "the little kitten has a secret",
  orchid: "the blue orchids want to bloom",
  letter: "now tap the ♡ on the letter",
};

const barLabels = {
  moon: "Tap the sleepy moon",
  kitten: "Tap the sleepy kitten",
  orchid: "Bloom the orchids",
  letter: "Tap the heart",
};

let step = "moon";
let audioCtx;

wishDate.textContent = new Date().toLocaleDateString("en-IN", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

function pointFrom(event, el) {
  if (event && event.clientX && event.clientY) {
    return { x: event.clientX, y: event.clientY };
  }
  const rect = el.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function chime(kind = "soft") {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const notes = kind === "open" ? [392, 523.25, 659.25, 783.99] : [523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = audioCtx.currentTime + i * 0.08;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.05, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(start);
      osc.stop(start + 0.52);
    });
  } catch (err) {
    // Keep the night quiet if audio is blocked.
  }
}

function scatterStars() {
  const count = window.innerWidth < 700 ? 18 : 32;
  stars.innerHTML = "";
  for (let i = 0; i < count; i += 1) {
    const star = document.createElement("button");
    star.type = "button";
    star.className = "star-dot";
    star.setAttribute("aria-label", "Light a star");
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 52}%`;
    star.style.animationDelay = `${Math.random() * 2.8}s`;
    star.addEventListener("click", (event) => {
      event.stopPropagation();
      star.classList.add("lit");
      burstHearts(event.clientX, event.clientY, ["✦"]);
    });
    stars.appendChild(star);
  }
}

function burstHearts(x, y, extra = []) {
  const glyphs = ["♡", "♥", "🌙", "✨", ...extra];
  for (let i = 0; i < 10; i += 1) {
    const bit = document.createElement("span");
    bit.className = "heart-bit";
    bit.textContent = glyphs[i % glyphs.length];
    bit.style.left = `${x + (Math.random() * 90 - 45)}px`;
    bit.style.top = `${y + (Math.random() * 24 - 12)}px`;
    bit.style.animationDelay = `${i * 0.04}s`;
    hearts.appendChild(bit);
    window.setTimeout(() => bit.remove(), 1900);
  }
}

function setFocus(target) {
  [moon, kitten, orchidBed].forEach((el) => el.classList.remove("is-focus"));
  if (target) target.classList.add("is-focus");
}

function fillHearts(count) {
  heartSlots.forEach((slot, index) => {
    slot.classList.toggle("filled", index < count);
  });
}

function setStep(next) {
  step = next;
  world.dataset.step = next;
  if (prompts[next]) guideText.textContent = prompts[next];
  if (barLabels[next]) tapBarLabel.textContent = barLabels[next];
}

function wakeMoon(event) {
  const point = pointFrom(event, moon);
  if (step !== "moon") {
    moon.classList.remove("wink");
    void moon.offsetWidth;
    moon.classList.add("wink");
    burstHearts(point.x, point.y, ["🌙"]);
    return;
  }
  chime();
  moon.classList.add("wink");
  burstHearts(point.x, point.y, ["🌙"]);
  fillHearts(1);
  setStep("kitten");
  setFocus(kitten);
}

function greetKitten(event) {
  const point = pointFrom(event, kitten);
  kitten.classList.remove("purr");
  void kitten.offsetWidth;
  kitten.classList.add("purr");
  if (step !== "kitten") {
    burstHearts(point.x, point.y, ["🐱"]);
    return;
  }
  chime();
  speech.hidden = false;
  burstHearts(point.x, point.y, ["🐱"]);
  fillHearts(2);
  setStep("orchid");
  setFocus(orchidBed);
}

function bloomOrchids(event) {
  const point = pointFrom(event, orchidBed);
  orchidBed.classList.add("bloomed");
  if (step !== "orchid") {
    burstHearts(point.x, point.y, ["❀"]);
    return;
  }
  chime("open");
  burstHearts(point.x, point.y, ["❀"]);
  fillHearts(3);
  setStep("letter");
  setFocus(envelope);
  envelope.hidden = false;
}

function openNight(event) {
  if (envelope.classList.contains("open")) return;
  const point = pointFrom(event, envelope);
  chime("open");
  envelope.classList.add("open");
  envelope.setAttribute("aria-expanded", "true");
  burstHearts(point.x, point.y, ["💌"]);
  window.setTimeout(() => {
    envelope.hidden = true;
    note.hidden = false;
    tapBar.hidden = true;
    world.dataset.step = "note";
  }, 480);
}

function useTapBar(event) {
  event.stopPropagation();
  if (step === "moon") wakeMoon(event);
  else if (step === "kitten") greetKitten(event);
  else if (step === "orchid") bloomOrchids(event);
  else if (step === "letter") openNight(event);
}

moon.addEventListener("click", wakeMoon);
kitten.addEventListener("click", greetKitten);
orchidBed.addEventListener("click", bloomOrchids);
envelope.addEventListener("click", openNight);
tapBar.addEventListener("click", useTapBar);

document.querySelectorAll(".firefly").forEach((fly) => {
  fly.addEventListener("click", (event) => {
    event.stopPropagation();
    fly.classList.add("caught");
    burstHearts(event.clientX, event.clientY, ["✦"]);
  });
});

document.body.addEventListener("click", (event) => {
  if (event.target.closest(".moon-wrap, .kitten, .orchid-bed, .envelope, .note, .firefly, .star-dot, .guide, .tap-bar")) {
    return;
  }
  burstHearts(event.clientX, event.clientY);
});

scatterStars();
window.addEventListener("resize", scatterStars);
