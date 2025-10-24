// === Bottle-Saver Counter — шаг 50 тыс., первый флип сразу, тыс./мил. ===
const YEAR_TOTAL   = 200_000_000_000;
const SECONDS_YEAR = 365 * 24 * 60 * 60;
const PER_SECOND   = YEAR_TOTAL / SECONDS_YEAR;        // ≈ 6341.958
const PER_MS       = PER_SECOND / 1000;
const STEP         = 50_000;                           // перелистывание каждые 50 тыс.

// Старт: 50 тыс.
let value       = 50_000;
let shownBucket = 50_000;
let last        = performance.now();

const drum        = document.getElementById('drum');
let paneCurrent   = document.getElementById('paneCurrent'); // видимый
let paneNext      = document.getElementById('paneNext');    // ждёт сверху

function fmt(n){
  if (n >= 1_000_000){
    const mil = n / 1_000_000;
    // одна десятичная с запятой по-русски: 1,0; 1,1; 1,2 …
    const txt = mil.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    return `${txt} мил.`;
  } else {
    const thousands = (n / 1000).toLocaleString('ru-RU');
    return `${thousands} тыс.`;
  }
}

/* Измерение ширины, чтобы барабан не «дёргался» */
function measureWidth(text){
  const probe = document.createElement('div');
  probe.className = 'pane pane--current';
  probe.style.position = 'absolute';
  probe.style.visibility = 'hidden';
  probe.style.opacity = '0';
  probe.textContent = text;
  drum.appendChild(probe);
  const w = probe.getBoundingClientRect().width;
  probe.remove();
  return w;
}
function adjustWidth(){
  const w = Math.max(measureWidth(paneCurrent.textContent),
                     measureWidth(paneNext.textContent));
  drum.style.width = w + 'px';
}

function setInitial(){
  paneCurrent.textContent = fmt(shownBucket);
  paneCurrent.className   = 'pane pane--current';

  paneNext.textContent    = fmt(shownBucket + STEP);
  paneNext.className      = 'pane pane--enter';

  adjustWidth();

  // Мягкий старт: первый флип сразу после загрузки
  setTimeout(() => animateTo(shownBucket + STEP), 350);
}

let animating = false;
let pendingBucket = null;

function animateTo(targetBucket){
  if (animating) { pendingBucket = targetBucket; return; }
  animating = true;

  paneNext.textContent = fmt(targetBucket);
  adjustWidth();

  // текущая уезжает вниз, новая въезжает сверху
  paneCurrent.classList.remove('pane--current');
  paneCurrent.classList.add('pane--leave');

  paneNext.classList.remove('pane--enter');
  paneNext.classList.add('pane--current');

  const onEnd = (e) => {
    if (e.propertyName !== 'transform') return;
    paneNext.removeEventListener('transitionend', onEnd);

    shownBucket = targetBucket;

    // ротация: кто был current, становится next и прячется сверху
    const old = paneCurrent;
    paneCurrent = paneNext;
    paneNext = old;

    paneNext.className   = 'pane pane--enter';
    paneNext.textContent = fmt(shownBucket + STEP);

    animating = false;

    if (pendingBucket && pendingBucket !== shownBucket){
      const nb = pendingBucket; pendingBucket = null;
      setTimeout(()=>animateTo(nb), 0);
    }
  };

  paneNext.addEventListener('transitionend', onEnd);
}

function tick(now){
  const dt = now - last;
  last = now;
  value += dt * PER_MS;                    // непрерывный рост

  const bucket = Math.floor(value / STEP) * STEP;
  if (bucket > shownBucket){
    animateTo(bucket);
  }
  requestAnimationFrame(tick);
}

setInitial();
requestAnimationFrame(tick);

/* prefers-reduced-motion — без анимации */
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  paneCurrent.style.transition = 'none';
  paneNext.style.transition = 'none';
}
