const CA = "0xComingsoon";
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const live = document.getElementById("live");
const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");
const wishBtn = document.getElementById("wishBtn");
const wishPop = document.getElementById("wishPop");
const flash = document.getElementById("flash");
const progress = document.getElementById("progress");
const glow = document.getElementById("glow");
const snow = document.getElementById("snow");
const canvas = document.getElementById("dust");

const wishes = ["Wish granted", "As you wish", "Unlimited", "It is done", "Command heard"];

function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => legacyCopy(text));
  }
  return Promise.resolve(legacyCopy(text));
}

function legacyCopy(text) {
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  } catch (err) {
    return false;
  }
}

document.querySelectorAll("[data-copy]").forEach((btn) => {
  let timer = 0;
  btn.addEventListener("click", async () => {
    const ok = await copyText(CA);
    btn.textContent = ok ? "Copied" : "Failed";
    live.textContent = ok ? "Contract address copied" : "Could not copy the contract address";
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      btn.textContent = "Copy";
    }, 1500);
  });
});

menuBtn.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
});

navLinks.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    navLinks.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "Open menu");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    navLinks.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "Open menu");
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 760) {
    navLinks.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
  }
});

function onScroll() {
  const height = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = (height > 0 ? (window.scrollY / height) * 100 : 0) + "%";
}

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

if (!reduce && snow) {
  const frame = snow.parentElement.getBoundingClientRect();
  const distance = Math.max(frame.height, 320);
  for (let i = 0; i < 26; i += 1) {
    const flake = document.createElement("i");
    const size = 2 + Math.random() * 3;
    flake.style.left = Math.random() * 100 + "%";
    flake.style.width = size + "px";
    flake.style.height = size + "px";
    flake.style.opacity = String(0.35 + Math.random() * 0.6);
    flake.style.animationDuration = 7 + Math.random() * 9 + "s";
    flake.style.animationDelay = -Math.random() * 12 + "s";
    snow.appendChild(flake);
  }
  const style = document.createElement("style");
  style.textContent = "@keyframes fall { from { transform: translate3d(0,-12px,0); } to { transform: translate3d(14px," + Math.round(distance + 30) + "px,0); } }";
  document.head.appendChild(style);
}

wishBtn.addEventListener("click", () => {
  const line = wishes[Math.floor(Math.random() * wishes.length)];
  wishPop.textContent = line;
  live.textContent = line;
  wishPop.classList.remove("go");
  flash.classList.remove("on");
  void wishPop.offsetWidth;
  wishPop.classList.add("go");
  flash.classList.add("on");
  const rect = wishBtn.getBoundingClientRect();
  burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 32);
});

if (!reduce && window.matchMedia("(hover: hover)").matches) {
  window.addEventListener("pointermove", (event) => {
    glow.style.left = event.clientX + "px";
    glow.style.top = event.clientY + "px";
  }, { passive: true });
}

const ctx = canvas.getContext("2d");
const motes = [];
const bursts = [];
let width = 0;
let height = 0;
let dpr = 1;
let running = false;

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
}

function makeMote() {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 1.7 + 0.4,
    vy: Math.random() * 0.35 + 0.12,
    phase: Math.random() * Math.PI * 2,
    a: Math.random() * 0.45 + 0.2,
    color: Math.random() > 0.72 ? "#9ec4ee" : Math.random() > 0.4 ? "#a6ff00" : "#ffffff",
  };
}

function burst(x, y, count) {
  if (reduce) return;
  const colors = ["#a6ff00", "#ffffff", "#e8ffb0", "#b7d6ff"];
  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const speed = 1.2 + Math.random() * 3.4;
    bursts.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.1,
      r: 1.2 + Math.random() * 2.1,
      life: 1,
      color: colors[i % colors.length],
    });
  }
  start();
}

function draw(now) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < motes.length; i += 1) {
    const mote = motes[i];
    mote.y -= mote.vy;
    mote.x += Math.sin(now * 0.001 + mote.phase) * 0.18;
    if (mote.y < -8) {
      mote.y = height + 8;
      mote.x = Math.random() * width;
    }
    ctx.globalAlpha = mote.a * (0.55 + 0.45 * Math.sin(now * 0.003 + mote.phase));
    ctx.fillStyle = mote.color;
    ctx.beginPath();
    ctx.arc(mote.x * dpr, mote.y * dpr, mote.r * dpr, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = bursts.length - 1; i >= 0; i -= 1) {
    const spark = bursts[i];
    spark.x += spark.vx;
    spark.y += spark.vy;
    spark.vy += 0.035;
    spark.life -= 0.016;
    if (spark.life <= 0) {
      bursts.splice(i, 1);
      continue;
    }
    ctx.globalAlpha = Math.max(spark.life, 0);
    ctx.fillStyle = spark.color;
    ctx.beginPath();
    ctx.arc(spark.x * dpr, spark.y * dpr, spark.r * dpr, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
  if (!document.hidden) requestAnimationFrame(draw);
  else running = false;
}

function start() {
  if (running || reduce) return;
  running = true;
  requestAnimationFrame(draw);
}

if (!reduce) {
  resize();
  for (let i = 0; i < 58; i += 1) motes.push(makeMote());
  window.addEventListener("resize", () => {
    resize();
    motes.forEach((mote) => {
      mote.x = Math.min(mote.x, width);
      mote.y = Math.min(mote.y, height);
    });
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) start();
  });
  start();

  window.setInterval(() => {
    if (document.hidden) return;
    const rect = wishBtn.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    burst(rect.left + rect.width * (0.3 + Math.random() * 0.4), rect.top + rect.height * 0.2, 5);
  }, 1600);
}
