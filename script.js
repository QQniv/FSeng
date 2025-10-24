const STEP = 50_000;
let value = 50_000;
let shownBucket = 50_000;
let last = performance.now();

const drum = document.getElementById('drum');
let paneCurrent = document.getElementById('paneCurrent');
let paneNext = document.getElementById('paneNext');

function fmt(n) {
  if (n >= 1_000_000) {
    const mil = n / 1_000_000;
    const txt = mil.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    return `${txt} мил.`;
  } else {
    const thousands = (n / 1000).toLocaleString('ru-RU');
    return `${thousands} тыс.`;
  }
}

function animateTo(target) {
  paneNext.textContent = fmt(target);
  paneCurrent.classList.remove('pane--current');
  paneCurrent.classList.add('pane--leave');
  paneNext.classList.remove('pane--enter');
  paneNext.classList.add('pane--current');

  paneNext.addEventListener('transitionend', () => {
    shownBucket = target;
    const old = paneCurrent;
    paneCurrent = paneNext;
    paneNext = old;
    paneNext.className = 'pane pane--enter';
    paneNext.textContent = fmt(shownBucket + STEP);
  }, { once: true });
}

function tick(now) {
  const PER_MS = 6_342 / 1000; // примерно 200 млрд/год
  value += (now - last) * PER_MS;
  last = now;

  const bucket = Math.floor(value / STEP) * STEP;
  if (bucket > shownBucket) animateTo(bucket);
  requestAnimationFrame(tick);
}

setTimeout(() => animateTo(shownBucket + STEP), 350);
requestAnimationFrame(tick);
