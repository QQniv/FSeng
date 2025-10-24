// === Bottle-Saver Counter (DE tens of thousands flip) ===
// База: ~200_000_000_000 бутылок/год => ~6_341.958/сек при 365 сутках
const YEAR_TOTAL = 200_000_000_000;
const SECONDS_YEAR = 365 * 24 * 60 * 60;
const PER_SECOND = YEAR_TOTAL / SECONDS_YEAR; // ≈ 6341.958
const PER_MS = PER_SECOND / 1000;

// Выводим ОКРУГЛЁННО до десятков тысяч (…0000) и «перелистываем» при смене разряда.
const STEP = 10_000; // десятки тысяч

const el = document.getElementById('bottleCounter');

let value = 0;           // «физическое» значение в штуках (плавающее)
let last = performance.now();
let shownBucket = 0;     // текущее показанное значение, кратное STEP

function formatBucket(n){
  return n.toLocaleString('ru-RU');
}

function animateFlip(newText){
  // триггерим классовую анимацию
  el.classList.remove('flip');
  // принудительный рефлоу для перезапуска анимации
  void el.offsetWidth;
  el.textContent = newText;
  el.classList.add('flip');
}

function tick(now){
  const dt = now - last;
  last = now;
  value += dt * PER_MS; // прибавляем с физической скоростью

  const bucket = Math.floor(value / STEP) * STEP;
  if (bucket !== shownBucket){
    shownBucket = bucket;
    animateFlip(formatBucket(shownBucket));
  }

  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);

// Prefers-reduced-motion: только обновление текста без 3D-поворота
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  el.classList.remove('flip');
}
