// === Bottle-Saver Counter — шаг 200 тыс., плавный верх→низ, левое выравнивание ===
const YEAR_TOTAL   = 200_000_000_000;
const SECONDS_YEAR = 365 * 24 * 60 * 60;
const PER_SECOND   = YEAR_TOTAL / SECONDS_YEAR;     // ≈ 6341.958
const PER_MS       = PER_SECOND / 1000;

/* Шаг перелистывания (≈ каждые 31–32 сек при ~6342 бут/сек) */
const STEP         = 200_000;

/* Стартовое значение (можно заменить на «с начала года» при желании) */
let value       = 500_000;
let shownBucket = 500_000;
let last        = performance.now();

const drum        = document.getElementById('drum');
let paneCurrent   = document.getElementById('paneCurrent'); // видимый
let paneNext      = document.getElementById('paneNext');    // ждёт сверху

function fmt(n){
  const thousands = (n / 1000).toLocaleString('ru-RU');
  return `${thousands} тыс.`;             // число и «тыс.» в одном стиле
}

/* Измеряем ширину текста, чтобы барабан не «дёргался» */
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
}

let animating = false;
let pendingBucket = null;

function animateTo(targetBucket){
  if (animating) { pendingBucket = targetBucket; return; }
  animating = true;

  // готовим верхнюю панель к новому значению
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

    // ротация ссылок: кто был current, станет next и спрячется сверху
    const old = paneCurrent;
    paneCurrent = paneNext;
    paneNext = old;

    paneNext.className = 'pane pane--enter';
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
  value += dt * PER_MS;                         // непрерывный рост

  const bucket = Math.floor(value / STEP) * STEP;
  if (bucket > shownBucket){
    animateTo(bucket);
  }
  requestAnimationFrame(tick);
}

setInitial();
requestAnimationFrame(tick);

/* prefers-reduced-motion — просто обновляем текст без анимации */
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  paneCurrent.style.transition = 'none';
  paneNext.style.transition = 'none';
}
