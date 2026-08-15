const world = document.querySelector(".world");
const sparkles = document.querySelector(".sparkles");
const hearts = document.querySelector(".hearts");
const envelope = document.querySelector(".envelope");
const note = document.querySelector(".note");
const sun = document.querySelector(".sun-wrap");
const character = document.querySelector(".character");
const bunny = document.querySelector(".bunny");
const speech = document.querySelector(".speech");
const guide = document.querySelector(".guide");
const guideText = document.querySelector(".guide-text");
const tapBar = document.querySelector(".tap-bar");
const tapBarLabel = document.querySelector(".tap-bar-label");
const heartSlots = [...document.querySelectorAll(".heart-slot")];

const prompts = {
  sun: "psst... tap the sleepy sun",
  boy: "he's been waiting for you — tap him",
  bunny: "the little bunny is hiding something",
  letter: "this morning is for you",
};

const barLabels = {
  sun: "Tap the sleepy sun",
  boy: "Tap him",
  bunny: "Tap the little bunny",
  letter: "Open your morning",
};

let step = "sun";
let audioCtx;

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
    const notes = kind === "open" ? [523.25, 659.25, 783.99, 1046.5] : [659.25, 783.99, 987.77];
    notes.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = audioCtx.currentTime + i * 0.07;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.06, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.42);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(start);
      osc.stop(start + 0.45);
    });
  } catch (err) {
    // Audio is a sweet extra; keep going if the browser blocks it.
  }
}

function scatterSparkles() {
  const count = window.innerWidth < 700 ? 10 : 22;
  sparkles.innerHTML = "";
  for (let i = 0; i < count; i += 1) {
    const star = document.createElement("span");
    star.className = "sparkle";
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 45}%`;
    star.style.animationDelay = `${Math.random() * 2.8}s`;
    star.style.transform = `scale(${0.5 + Math.random()})`;
    sparkles.appendChild(star);
  }
}

function burstHearts(x, y, extra = []) {
  const glyphs = ["♡", "♥", "🌸", "✨", ...extra];
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
  [sun, character, bunny].forEach((el) => el.classList.remove("is-focus"));
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

function wakeSun(event) {
  const point = pointFrom(event, sun);
  if (step !== "sun") {
    sun.classList.remove("wink");
    void sun.offsetWidth;
    sun.classList.add("wink");
    burstHearts(point.x, point.y, ["☀"]);
    return;
  }
  chime();
  sun.classList.add("wink");
  burstHearts(point.x, point.y, ["☀"]);
  fillHearts(1);
  setStep("boy");
  setFocus(character);
}

function greetBoy(event) {
  const point = pointFrom(event, character);
  if (step !== "boy") {
    character.classList.add("extra-wave");
    burstHearts(point.x, point.y);
    window.setTimeout(() => character.classList.remove("extra-wave"), 1200);
    return;
  }
  chime();
  character.classList.add("extra-wave", "offered");
  speech.hidden = false;
  burstHearts(point.x, point.y);
  fillHearts(2);
  setStep("bunny");
  setFocus(bunny);
  window.setTimeout(() => character.classList.remove("extra-wave"), 1400);
}

function meetBunny(event) {
  const point = pointFrom(event, bunny);
  if (step !== "bunny") {
    bunny.classList.remove("hop");
    void bunny.offsetWidth;
    bunny.classList.add("hop");
    burstHearts(point.x, point.y, ["✿"]);
    return;
  }
  chime("open");
  bunny.classList.add("hop");
  burstHearts(point.x, point.y, ["✿"]);
  fillHearts(3);
  setFocus(null);
  setStep("letter");
  guide.hidden = true;
  envelope.hidden = false;
}

function openMorning(event) {
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

function bloomFlower(button, event) {
  button.classList.add("bloomed");
  burstHearts(event.clientX, event.clientY, ["🌸"]);
}

function useTapBar(event) {
  event.stopPropagation();
  if (step === "sun") wakeSun(event);
  else if (step === "boy") greetBoy(event);
  else if (step === "bunny") meetBunny(event);
  else if (step === "letter") openMorning(event);
}

sun.addEventListener("click", wakeSun);
character.addEventListener("click", greetBoy);
bunny.addEventListener("click", meetBunny);
envelope.addEventListener("click", openMorning);
tapBar.addEventListener("click", useTapBar);

document.querySelectorAll(".bloom").forEach((flower) => {
  flower.addEventListener("click", (event) => bloomFlower(flower, event));
});

document.body.addEventListener("click", (event) => {
  if (event.target.closest(".sun-wrap, .character, .bunny, .envelope, .note, .bloom, .guide, .tap-bar")) return;
  burstHearts(event.clientX, event.clientY);
});

scatterSparkles();
window.addEventListener("resize", scatterSparkles);
