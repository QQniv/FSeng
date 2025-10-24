// === Bottle-Saver Counter — шаг 100 тыс., плавный «верх→низ», без откатов ===
const YEAR_TOTAL   = 200_000_000_000;
const SECONDS_YEAR = 365 * 24 * 60 * 60;
const PER_SECOND   = YEAR_TOTAL / SECONDS_YEAR;    // ≈ 6341.958
const PER_MS       = PER_SECOND / 1000;
const STEP         = 100_000;                      // перелистывание каждые 100 тыс.

// Стартовое значение (можно поменять на расчёт «с начала года»)
let value       = 500_000;
let shownBucket = 500_000;
let last        = performance.now();

const drum        = document.getElementById('drum');
let paneCurrent   = document.getElementById('paneCurrent');
let paneNext      = document.getElementById('paneNext');

function fmt(n){
  // «X тыс.» с неразрывными пробелами
  const thousands = (n / 1000).toLocaleString('ru-RU');
  return `${thousands} тыс.`;
}

function measureWidth(text){
  // создаём невидимый клон, чтобы померить ширину
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

  // подготовим текст для «въезжающей» сверху
  paneNext.textContent = fmt(targetBucket);
  adjustWidth();

  // запускаем: текущая уходит вниз, следующая въезжает
  paneCurrent.classList.remove('pane--current');
  paneCurrent.classList.add('pane--leave');

  paneNext.classList.remove('pane--enter');
  paneNext.classList.add('pane--current');

  // когда въезжающая закончила анимацию — меняем роли без резкого «отката»
  const onEnd = (e) => {
    if (e.propertyName !== 'transform') return;
    paneNext.removeEventListener('transitionend', onEnd);

    shownBucket = targetBucket;

    // меняем ссылки: current ↔ next
    const old = paneCurrent;
    paneCurrent = paneNext;
    paneNext    = old;

    // готовим «новую верхнюю» на следующий шаг и прячем её сверху
    paneNext.className   = 'pane pane--enter';
    paneNext.textContent = fmt(shownBucket + STEP);

    animating = false;

    if (pendingBucket && pendingBucket !== shownBucket){
      const nb = pendingBucket;
      pendingBucket = null;
      // минимальная задержка, чтобы браузер применил классы
      setTimeout(()=>animateTo(nb), 0);
    }
  };

  paneNext.addEventListener('transitionend', onEnd);
}

function tick(now){
  const dt = now - last;
  last = now;
  value += dt * PER_MS; // непрерывный рост

  const bucket = Math.floor(value / STEP) * STEP;
  if (bucket > shownBucket){
    animateTo(bucket);
  }
  requestAnimationFrame(tick);
}

setInitial();
requestAnimationFrame(tick);

// Уважение prefers-reduced-motion — без анимации, просто обновляем текст
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  paneCurrent.style.transition = 'none';
  paneNext.style.transition    = 'none';
}
